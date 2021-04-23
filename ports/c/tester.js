const chai = require("chai");
const assert = chai.assert;

const fs = require("fs");
var tmp = require("tmp-promise");
const path = require("path");
const compiler = require("../../src/compiler");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const Scalar = require("ffjavascript").Scalar;
const utils = require("../../src/utils");
const loadR1cs = require("r1csfile").load;
const ZqField = require("ffjavascript").ZqField;
const buildZqField = require("ffiasm").buildZqField;

const {stringifyBigInts, unstringifyBigInts } = require("ffjavascript").utils;

module.exports = c_tester;


async function  c_tester(circomFile, _options) {
    tmp.setGracefulCleanup();

    const dir = await tmp.dir({prefix: "circom_", unsafeCleanup: true });

    // console.log(dir.path);

    const baseName = path.basename(circomFile, ".circom");
    const options = Object.assign({}, _options);

    options.cSourceFileName = path.join(dir.path, baseName + ".cpp");
    options.dataFileName = path.join(dir.path, baseName + ".dat");
    options.symWriteStream = fs.createWriteStream(path.join(dir.path, baseName + ".sym"));
    options.r1csFileName = path.join(dir.path, baseName + ".r1cs");

    options.p = options.p || Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    await compiler(circomFile, options);

    const source = await buildZqField(options.p, "Fr");

    // console.log(dir.path);

    await fs.promises.writeFile(path.join(dir.path, "fr.asm"), source.asm, "utf8");
    await fs.promises.writeFile(path.join(dir.path, "fr.hpp"), source.hpp, "utf8");
    await fs.promises.writeFile(path.join(dir.path, "fr.cpp"), source.cpp, "utf8");

    let pThread = "";

    if (process.platform === "darwin") {
        await exec("nasm -fmacho64 --prefix _ " +
            ` ${path.join(dir.path,  "fr.asm")}`
        );
    }  else if (process.platform === "linux") {
        pThread = "-pthread";
        await exec("nasm -felf64 " +
            ` ${path.join(dir.path,  "fr.asm")}`
        );
    } else throw("Unsupported platform");

    const cdir = path.join(path.dirname(require.resolve("circom_runtime")), "..", "c");

    await exec("g++" + ` ${pThread}` +
               ` ${path.join(cdir,  "main.cpp")}` +
               ` ${path.join(cdir,  "calcwit.cpp")}` +
               ` ${path.join(cdir,  "utils.cpp")}` +
               ` ${path.join(dir.path,  "fr.cpp")}` +
               ` ${path.join(dir.path,  "fr.o")}` +
               ` ${path.join(dir.path, baseName + ".cpp")} ` +
               ` -o ${path.join(dir.path, baseName)}` +
               ` -I ${dir.path} -I${cdir}` +
               " -lgmp -std=c++11 -DSANITY_CHECK -g"
    );

    // console.log(dir.path);
    return new CTester(dir, baseName);
}

class CTester {

    constructor(dir, baseName) {
        this.dir=dir;
        this.baseName = baseName;
    }

    async release() {
        await this.dir.cleanup();
    }

    async calculateWitness(input) {
        await fs.promises.writeFile(
            path.join(this.dir.path, "in.json"),
            JSON.stringify(stringifyBigInts(input), null, 1)
        );
        const r = await exec(`${path.join(this.dir.path, this.baseName)}` +
                   ` ${path.join(this.dir.path, "in.json")}` +
                   ` ${path.join(this.dir.path, "out.json")}`
        );
        if (r.stdout) {
            console.log(r.stdout);
        }
        const resStr = await fs.promises.readFile(
            path.join(this.dir.path, "out.json")
        );

        const res = unstringifyBigInts(JSON.parse(resStr));
        return res;
    }

    async loadSymbols() {
        if (this.symbols) return;
        this.symbols = {};
        const symsStr = await fs.promises.readFile(
            path.join(this.dir.path, this.baseName + ".sym"),
            "utf8"
        );
        const lines = symsStr.split("\n");
        for (let i=0; i<lines.length; i++) {
            const arr = lines[i].split(",");
            if (arr.length!=4) continue;
            this.symbols[arr[3]] = {
                labelIdx: Number(arr[0]),
                varIdx: Number(arr[1]),
                componentIdx: Number(arr[2]),
            };
        }
    }

    async loadConstraints() {
        const self = this;
        if (this.constraints) return;
        const r1cs = await loadR1cs(path.join(this.dir.path, this.baseName + ".r1cs"),true, false);
        self.F = new ZqField(r1cs.prime);
        self.nVars = r1cs.nVars;
        self.constraints = r1cs.constraints;
    }

    async assertOut(actualOut, expectedOut) {
        const self = this;
        if (!self.symbols) await self.loadSymbols();

        checkObject("main", expectedOut);

        function checkObject(prefix, eOut) {

            if (Array.isArray(eOut)) {
                for (let i=0; i<eOut.length; i++) {
                    checkObject(prefix + "["+i+"]", eOut[i]);
                }
            } else if ((typeof eOut == "object")&&(eOut.constructor.name == "Object")) {
                for (let k in eOut) {
                    checkObject(prefix + "."+k, eOut[k]);
                }
            } else {
                if (typeof self.symbols[prefix] == "undefined") {
                    assert(false, "Output variable not defined: "+ prefix);
                }
                const ba = actualOut[self.symbols[prefix].varIdx].toString();
                const be = eOut.toString();
                assert.strictEqual(ba, be, prefix);
            }
        }
    }

    async getDecoratedOutput(witness) {
        const self = this;
        const lines = [];
        if (!self.symbols) await self.loadSymbols();
        for (let n in self.symbols) {
            let v;
            if (utils.isDefined(witness[self.symbols[n].varIdx])) {
                v = witness[self.symbols[n].varIdx].toString();
            } else {
                v = "undefined";
            }
            lines.push(`${n} --> ${v}`);
        }
        return lines.join("\n");
    }

    async checkConstraints(witness) {
        const self = this;
        if (!self.constraints) await self.loadConstraints();
        for (let i=0; i<self.constraints.length; i++) {
            checkConstraint(self.constraints[i]);
        }

        function checkConstraint(constraint) {
            const F = self.F;
            const a = evalLC(constraint[0]);
            const b = evalLC(constraint[1]);
            const c = evalLC(constraint[2]);

            assert (F.isZero(F.sub(F.mul(a,b), c)), "Constraint doesn't match");
        }

        function evalLC(lc) {
            const F = self.F;
            let v = F.zero;
            for (let w in lc) {
                v = F.add(
                    v,
                    F.mul( lc[w], witness[w] )
                );
            }
            return v;
        }
    }

}


