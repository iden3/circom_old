const chai = require("chai");
const path = require("path");
const zkSnark = require("zksnark");

const compiler = require("../index.js");

const assert = chai.assert;

describe("SHA256 test", () => {
    it("Should create a constant circuit", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "constants_test.circom"));
        assert.equal(cirDef.nVars, 2);

        const circuit = new zkSnark.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "in": "0xd807aa98" });

        assert(witness[0].equals(zkSnark.bigInt(1)));
        assert(witness[1].equals(zkSnark.bigInt("0xd807aa98")));
    });
    it("Should create a sum circuit", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "sum_test.circom"));
        assert.equal(cirDef.nVars, 101);

        const circuit = new zkSnark.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "a": "111", "b": "222" });

        assert(witness[0].equals(zkSnark.bigInt(1)));
        assert(witness[1].equals(zkSnark.bigInt("333")));
    });


});
