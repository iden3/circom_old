const path = require("path");

const bigInt = require("big-integer");
const c_tester = require("../index.js").c_tester;

const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");


function normalize(o) {
    if ((typeof(o) == "bigint") || o.isZero !== undefined)  {
        const res = bigInt(o);
        return norm(res);
    } else if (Array.isArray(o)) {
        return o.map(normalize);
    } else if (typeof o == "object") {
        const res = {};
        for (let k in o) {
            res[k] = normalize(o[k]);
        }
        return res;
    } else {
        const res = bigInt(o);
        return norm(res);
    }

    function norm(n) {
        let res = n.mod(__P__);
        if (res.isNegative()) res = __P__.add(res);
        return res;
    }
}


async function doTest(circuit, testVectors) {
    const cir = await c_tester(path.join(__dirname, "circuits", circuit));

    for (let i=0; i<testVectors.length; i++) {
        const w = await cir.calculateWitness(normalize(testVectors[i][0]));
        await cir.assertOut(w, normalize(testVectors[i][1]) );
    }

    await cir.release();
}

describe("basic cases", function () {
    this.timeout(100000);
/*    it("inout", async () => {
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
    it("while unrolled", async () => {
        await doTest(
            "whileunrolled.circom",
            [
                [{in: 0}, {out: [0,1,2]}],
                [{in: 10}, {out: [10, 11, 12]}],
                [{in: __P__.minus(2)}, {out: [__P__.minus(2), __P__.minus(1), 0]}],
            ]
        );
    });
    it("while rolled", async () => {
        await doTest(
            "whilerolled.circom",
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
    it("constants1", async () => {
        await doTest(
            "constants1.circom",
            [
                [{in: 0}, {out: 42}],
                [{in: 10}, {out: 52}],
                [{in: __P__.minus(2)}, {out: 40}],
            ]
        );
    });
    it("arrays", async () => {
        await doTest(
            "arrays.circom",
            [
                [{in: 0}, {out: [1, 8, 51]}],
                [{in: 10}, {out: [11, 28, 111]}],
                [{in: __P__.minus(2)}, {out: [__P__.minus(1), 4,  39]}],
            ]
        );
    });
    it("if unrolled", async () => {
        await doTest(
            "ifunrolled.circom",
            [
                [{in: 0}, {out: [1, 3, 6]}],
                [{in: 10}, {out: [11, 13, 16]}],
                [{in: __P__.minus(2)}, {out: [__P__.minus(1), 1,  4]}],
            ]
        );
    });
    it("if rolled", async () => {
        await doTest(
            "ifrolled.circom",
            [
                [{in: 0}, {out: [1, 0, 0]}],
                [{in: 1}, {out: [0, 1, 0]}],
                [{in: 2}, {out: [0, 0, 1]}],
                [{in: 3}, {out: [0, 0, 0]}],
                [{in: __P__.minus(2)}, {out: [0,0,0]}],
            ]
        );
    });
    it("inc", async () => {
        await doTest(
            "inc.circom",
            [
                [{in: 0}, {out: [5, 2]}],
                [{in: 1}, {out: [6, 4]}],
                [{in: 2}, {out: [7, 6]}],
                [{in: 3}, {out: [8, 8]}],
                [{in: __P__.minus(2)}, {out: [3,__P__.minus(2)]}],
            ]
        );
    });
    it("dec", async () => {
        await doTest(
            "dec.circom",
            [
                [{in: 0}, {out: [1, __P__.minus(2)]}],
                [{in: 1}, {out: [2, 0]}],
                [{in: 2}, {out: [3, 2]}],
                [{in: 3}, {out: [4, 4]}],
                [{in: __P__.minus(2)}, {out: [__P__.minus(1),__P__.minus(6)]}],
            ]
        );
    });
    it("ops", async () => {
        await doTest(
            "ops.circom",
            [
                [{in: [-2, 2]}, {add:  0, sub: -4, mul: -4}],
                [{in: [-1, 1]}, {add:  0, sub: -2, mul: -1}],
                [{in: [ 0, 0]}, {add:  0, sub:  0, mul:  0}],
                [{in: [ 1,-1]}, {add:  0, sub:  2, mul: -1}],
                [{in: [ 2,-2]}, {add:  0, sub:  4, mul: -4}],
                [{in: [-2,-3]}, {add: -5, sub:  1, mul:  6}],
                [{in: [ 2, 3]}, {add:  5, sub: -1, mul:  6}],
            ]
        );
    });
    it("ops2", async () => {
        await doTest(
            "ops2.circom",
            [
                [{in: [-2, 2]}, {div: -1, idiv: bigInt("10944121435919637611123202872628637544274182200208017171849102093287904247807"), mod: 1}],
                [{in: [-1, 1]}, {div: -1, idiv: -1, mod: 0}],
                [{in: [ 1,-1]}, {div: -1, idiv: 0, mod: 1}],
            ]
        );
    });
    it("ops3", async () => {
        await doTest(
            "ops3.circom",
            [
                [{in: [-2, 2]}, {neg1: 2,neg2: -2, pow: 4}],
                [{in: [0, 1]}, {neg1: 0, neg2: -1, pow: 0}],
                [{in: [ 1,-1]}, {neg1: -1, neg2: 1, pow: 1}],
            ]
        );
    });
    it("Comparation ops", async () => {
        await doTest(
            "opscmp.circom",
            [
                [{in: [ 8, 9]}, {lt: 1, leq: 1, eq:0, neq:1, geq: 0, gt:0}],
                [{in: [-2,-2]}, {lt: 0, leq: 1, eq:1, neq:0, geq: 1, gt:0}],
                [{in: [-1,-2]}, {lt: 0, leq: 0, eq:0, neq:1, geq: 1, gt:1}],
                [{in: [ 1,-1]}, {lt: 1, leq: 1, eq:0, neq:1, geq: 0, gt:0}],  // In mod, negative values are higher than positive.
            ]
        );
    });
    it("Bit ops", async () => {
        const mask = bigInt("14474011154664524427946373126085988481658748083205070504932198000989141204991");
        const m1m = bigInt("7414231717174750794300032619171286606889616317210963838766006185586667290624");
        await doTest(
            "opsbit.circom",
            [
                [{in: [ 5, 3]}, {and: 1, or: 7, xor:6, not1:mask.minus(5), shl: 40, shr:0}],
                [{in: [ 0, 0]}, {and: 0, or: 0, xor:0, not1:mask, shl: 0, shr:0}],
                [{in: [-1, 1]}, {and: 0, or: m1m.add(bigInt.one), xor:m1m.add(bigInt.one), not1:mask.minus(m1m), shl: m1m.shiftLeft(1).and(mask), shr:__P__.shiftRight(1).and(mask)}],
            ]
        );
    });
    it("Logical ops", async () => {
        await doTest(
            "opslog.circom",
            [
                [{in: [ 5, 0]}, {and: 0, or: 1, not1:0}],
                [{in: [ 0, 1]}, {and: 0, or: 1, not1:1}],
                [{in: [-1, 9]}, {and: 1, or: 1, not1:0}],
                [{in: [ 0, 0]}, {and: 0, or: 0, not1:1}],
            ]
        );
    });
    it("Conditional Ternary operator", async () => {
        await doTest(
            "condternary.circom",
            [
                [{in: 0}, {out: 21}],
                [{in: 1}, {out:  1}],
                [{in: 2}, {out: 23}],
                [{in:-1}, {out: 20}],
            ]
        );
    });
    it("Compute block", async () => {
        await doTest(
            "compute.circom",
            [
                [{x: 1}, {y:  7}],
                [{x: 2}, {y:  7}],
                [{x: 3}, {y: 11}],
                [{x:-1}, {y: -5}],
            ]
        );
    });
    it("Component array ", async () => {
        await doTest(
            "componentarray.circom",
            [
                [{in: 1}, {out:    1}],
                [{in: 2}, {out:  256}],
                [{in: 3}, {out: 6561}],
                [{in:-1}, {out:    1}],
            ]
        );
    });
    it("Constant circuit", async () => {
        await doTest(
            "constantcircuit.circom",
            [
                // 0xbb67ae85
                [{}, {out: [1,0,1,0,  0,0,0,1, 0,1,1,1, 0,1,0,1, 1,1,1,0, 0,1,1,0, 1,1,0,1,  1,1,0,1]}],
            ]
        );
    }); */
    it("Constant internal circuit", async () => {
        await doTest(
            "constantinternalcircuit.circom",
            [
                // 0xbb67ae85
                [{in: 1}, {out: 5}],
                [{in: 0}, {out: 4}],
                [{in: -2}, {out: 2}],
                [{in: 10}, {out: 14}]
            ]
        );
    });
});
