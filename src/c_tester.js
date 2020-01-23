const chai = require("chai");
const assert = chai.assert;

const fs = require("fs");
var tmp = require("tmp-promise");
const path = require("path");
const compiler = require("./compiler");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const stringifyBigInts = require("./utils").stringifyBigInts;
const unstringifyBigInts = require("./utils").unstringifyBigInts;
const bigInt = require("big-integer");
const utils = require("./utils");
const loadR1cs = require("./r1csfile").loadR1cs;
const ZqField = require("fflib").ZqField;

module.exports = c_tester;


async function  c_tester(circomFile, _options) {
    tmp.setGracefulCleanup();

    const dir = await tmp.dir({prefix: "circom_", unsafeCleanup: true });

    // console.log(dir.path);

    const baseName = path.basename(circomFile, ".circom");
    const options = Object.assign({}, _options);

    options.cSourceWriteStream = fs.createWriteStream(path.join(dir.path, baseName + ".cpp"));
    options.symWriteStream = fs.createWriteStream(path.join(dir.path, baseName + ".sym"));
    options.r1csFileName = path.join(dir.path, baseName + ".r1cs");
    await compiler(circomFile, options);

    const cdir = path.join(__dirname, "..", "c");
    await exec("cp" +
               ` ${path.join(dir.path, baseName + ".cpp")}` +
               " /tmp/circuit.cpp"
    );
    await exec("g++" +
               ` ${path.join(cdir,  "main.cpp")}` +
               ` ${path.join(cdir,  "calcwit.cpp")}` +
               ` ${path.join(cdir,  "utils.cpp")}` +
               ` ${path.join(cdir,  "fr.c")}` +
               ` ${path.join(cdir,  "fr.o")}` +
               ` ${path.join(dir.path, baseName + ".cpp")} ` +
               ` -o ${path.join(dir.path, baseName)}` +
               ` -I ${cdir}` +
               " -lgmp -std=c++11 -DSANITY_CHECK"
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
        await exec(`${path.join(this.dir.path, this.baseName)}` +
                   ` ${path.join(this.dir.path, "in.json")}` +
                   ` ${path.join(this.dir.path, "out.json")}`
        );
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
            if (arr.length!=3) continue;
            this.symbols[arr[2]] = {
                idx: Number(arr[0]),
                idxWit: Number(arr[1])
            };
        }
    }

    async loadConstraints() {
        const self = this;
        if (this.constraints) return;
        const r1cs = await loadR1cs(path.join(this.dir.path, this.baseName + ".r1cs"),true, false);
        self.field = new ZqField(r1cs.prime);
        self.nWires = r1cs.nWires;
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
                const ba = bigInt(actualOut[self.symbols[prefix].idxWit]).toString();
                const be = bigInt(eOut).toString();
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
            if (utils.isDefined(witness[self.symbols[n].idxWit])) {
                v = witness[self.symbols[n].idxWit].toString();
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
            const F = self.field;
            const a = evalLC(constraint.a);
            const b = evalLC(constraint.b);
            const c = evalLC(constraint.c);

            assert (F.sub(F.mul(a,b), c).isZero(), "Constraint doesn't match");
        }

        function evalLC(lc) {
            const F = self.field;
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


