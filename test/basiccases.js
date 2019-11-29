const path = require("path");

const bigInt = require("big-integer");
const c_tester = require("../index.js").c_tester;

const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");


async function doTest(circuit, testVectors) {
    const cir = await c_tester(path.join(__dirname, "circuits", circuit));

    for (let i=0; i<testVectors.length; i++) {
        const w = await cir.calculateWitness(testVectors[i][0]);
        await cir.assertOut(w, testVectors[i][1] );
    }

    await cir.release();
}

describe("basic cases", function () {
    this.timeout(100000);
    it("inout", async () => {
        await doTest(
            "inout.circom",
            [
                [{in1: 1, in2: [2,3], in3:[[4,5], [6,7], [8,9]]}, {out1: 1, out2: [2,3], out3: [[4,5], [6,7],[8,9]]}],
            ]
        );
    });
    it("add", async () => {
        await doTest(
            "add.circom",
            [
                [{in: [0,0]}, {out: 0}],
                [{in: [0,1]}, {out: 1}],
                [{in: [1,2]}, {out: 3}],
                [{in: [__P__.minus(1),1]}, {out: 0}],
            ]
        );
    });
    it("add constant", async () => {
        await doTest(
            "addconst1.circom",
            [
                [{in: 0}, {out: 15}],
                [{in: 10}, {out: 25}],
                [{in: __P__.minus(2)}, {out: 13}],
            ]
        );
    });
    it("for unrolled", async () => {
        await doTest(
            "forunrolled.circom",
            [
                [{in: 0}, {out: [0,1,2]}],
                [{in: 10}, {out: [10, 11, 12]}],
                [{in: __P__.minus(2)}, {out: [__P__.minus(2), __P__.minus(1), 0]}],
            ]
        );
    });
    it("for rolled", async () => {
        await doTest(
            "forrolled.circom",
            [
                [{in: 0}, {out: 0}],
                [{in: 10}, {out: 10}],
            ]
        );
    });
    it("function1", async () => {
        await doTest(
            "function1.circom",
            [
                [{in: 0}, {out: 3}],
                [{in: 10}, {out: 13}],
                [{in: __P__.minus(2)}, {out: 1}],
            ]
        );
    });
    it("function2", async () => {
        await doTest(
            "function2.circom",
            [
                [{in: 0}, {out: 3}],
                [{in: 10}, {out: 13}],
                [{in: __P__.minus(2)}, {out: 1}],
            ]
        );
    });
});
