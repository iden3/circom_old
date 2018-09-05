const chai = require("chai");
const path = require("path");
const zkSnark = require("zksnark");

const compiler = require("../index.js");

const assert = chai.assert;

describe("SHA256 test", () => {
    it("Should create a constant circuit", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "constants_test.jaz"));
        assert.equal(cirDef.nVars, 2);

        const circuit = new zkSnark.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "in": "0xd807aa98" });

        assert(witness[0].equals(zkSnark.bigInt(1)));
        assert(witness[1].equals(zkSnark.bigInt("0xd807aa98")));
    });
});
