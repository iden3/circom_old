const path = require("path");

const bigInt = require("big-integer");
const c_tester = require("../index.js").c_tester;
const wasm_tester = require("../index.js").wasm_tester;

const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

const basicCases = require("./basiccases.json");

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


async function doTest(tester, circuit, testVectors) {
    const cir = await tester(path.join(__dirname, "circuits", circuit));

    for (let i=0; i<testVectors.length; i++) {
        const w = await cir.calculateWitness(normalize(testVectors[i][0]));
//        console.log(testVectors[i][0]);
//        console.log(w);
//        console.log(testVectors[i][1]);
        await cir.assertOut(w, normalize(testVectors[i][1]) );
    }

    await cir.release();
}

describe("basic cases", function () {
    this.timeout(100000);

    for (let i=0; i<basicCases.length; i++) {
        it("c/c++ " + basicCases[i].name, async () => {
            await doTest(c_tester, basicCases[i].circuit, basicCases[i].tv);
        });
    }

    for (let i=0; i<basicCases.length; i++) {
        it("wasm " + basicCases[i].name, async () => {
            await doTest(wasm_tester, basicCases[i].circuit, basicCases[i].tv);
        });
    }

});
