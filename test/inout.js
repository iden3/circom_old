const path = require("path");

const c_tester = require("../index.js").c_tester;
// const stringifyBigInts = require("snarkjs").stringifyBigInts;


describe("inout test", function () {
    this.timeout(100000);
    it("Should compile a code with vars inside a for", async () => {
        const cir = await c_tester(path.join(__dirname, "circuits", "inout.circom"));

        const out = await cir.calculateWitness({in1: 1, in2: [2,3], in3:[[4,5], [6,7], [8,9]]});

        // console.log(JSON.stringify(stringifyBigInts(out),null,1));
        await cir.assertOut(out, {out1: 1, out2: [2,3], out3: [[4,5], [6,7],[8,9]]} );

        await cir.release();
    });
});
