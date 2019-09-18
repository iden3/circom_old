const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");

const bigInt = snarkjs.bigInt;

const compiler = require("../index.js");

const assert = chai.assert;

async function assertThrowsAsync(fn, regExp) {
    let f = () => {};
    try {
        await fn();
    } catch(e) {
        f = () => { throw e; };
    } finally {
        assert.throws(f, regExp);
    }
}

describe("Sum test", () => {
    it("Should compile a code with an undefined if", async () => {
        await compiler(path.join(__dirname, "circuits", "undefinedif.circom"));
    });
    it("Should compile a code with vars inside a for", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "forvariables.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "in": 111});
        assert(witness[0].equals(bigInt(1)));
        assert(witness[1].equals(bigInt(114)));
        assert(witness[2].equals(bigInt(111)));

    });
    it("Should compile a code with an undefined if", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "mixvarsignal.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "i": 111});
        assert(witness[0].equals(bigInt(1)));
        assert(witness[1].equals(bigInt(111*111)));
        assert(witness[2].equals(bigInt(111)));
    });
//    it("Should assign signal ERROR", async () => {
//        await assertThrowsAsync(async () => {
//            await compiler(path.join(__dirname, "circuits", "assignsignal.circom"));
//        }, /Cannot assign to a signal .*/);
//    });
    it("Should compile a code with compute", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "compute.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "x": 6});
        assert(witness[0].equals(bigInt(1)));
        assert(witness[1].equals(bigInt(37)));
        assert(witness[2].equals(bigInt(6)));
    });
    it("Should compile a code with compute", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "inout.circom"));

        assert.equal(cirDef.constraints.length, 1);
    });
});
