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
const bigInt = require("snarkjs").bigInt;

module.exports = c_tester;


async function  c_tester(circomFile, mainComponent, _options) {
    tmp.setGracefulCleanup();
    mainComponent = mainComponent || "main";

    const dir = await tmp.dir({prefix: "circom_", unsafeCleanup: true });

    const baseName = path.basename(circomFile, ".circom");
    const options = Object.assign({}, _options);

    options.cSourceWriteStream = fs.createWriteStream(path.join(dir.path, baseName + ".cpp"));
    options.symWriteStream = fs.createWriteStream(path.join(dir.path, baseName + ".sym"));
    options.mainComponent = mainComponent;
    await compiler(circomFile, options);

    const cdir = path.join(__dirname, "..", "c");
    await exec("g++" +
               ` ${path.join(dir.path, baseName + ".cpp")} ` +
               ` ${path.join(cdir,  "main.cpp")}` +
               ` ${path.join(cdir,  "calcwit.cpp")}` +
               ` ${path.join(cdir,  "utils.cpp")}` +
               ` ${path.join(cdir,  "zqfield.cpp")}` +
               ` -o ${path.join(dir.path, baseName)}` +
               ` -I ${cdir}` +
               " -lgmp -std=c++11 -DSANITY_CHECK"
    );

    // console.log(dir.path);
    return new CTester(dir, baseName, mainComponent);
}

class CTester {

    constructor(dir, baseName, mainComponent) {
        this.dir=dir;
        this.baseName = baseName;
        this.mainComponent = mainComponent;
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

    async _loadSymbols() {
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

    async assertOut(actualOut, expectedOut) {
        const self = this;
        if (!self.symbols) await self._loadSymbols();

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

}


