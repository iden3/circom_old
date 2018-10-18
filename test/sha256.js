const chai = require("chai");
const path = require("path");
const zkSnark = require("zksnark");
const crypto = require("crypto");

const compiler = require("../index.js");

const assert = chai.assert;

const sha256 = require("./helpers/sha256");
const bigInt = require("big-integer");

function hexBits(cir, witness, sig, nBits) {
    let v = bigInt(0);
    for (let i=nBits-1; i>=0; i--) {
        v = v.shiftLeft(1);
        const name = sig+"["+i+"]";
        const idx = cir.getSignalIdx(name);
        const vbit = bigInt(witness[idx].toString());
        if (vbit.equals(bigInt(1))) {
            v = v.add(bigInt(1));
        } else if (vbit.equals(bigInt(0))) {
            v;
        } else {
            console.log("Not Binary: "+name);
        }
    }
    return v.toString(16);
}

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
    it("Should calculate a hash", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "sha256_2_test.circom"));
        const circuit = new zkSnark.Circuit(cirDef);

        console.log("Vars: "+circuit.nVars);
        console.log("Constraints: "+circuit.nConstraints);

        const witness = circuit.calculateWitness({ "a": "1", "b": "2" });

        const b = new Buffer.alloc(54);
        b[26] = 1;
        b[53] = 2;

        const hash = crypto.createHash("sha256")
            .update(b)
            .digest("hex");
        const r = hash.slice(10);

        const hash2 = sha256.hash(b.toString("hex"), {msgFormat: "hex-bytes"});

        assert.equal(hash, hash2);

        assert(witness[1].equals(zkSnark.bigInt(r, 16)));
    }).timeout(1000000);


});
