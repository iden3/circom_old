const chai = require("chai");
const path = require("path");
const snarkjs = require("snarkjs");
const crypto = require("crypto");

const compiler = require("../index.js");

const assert = chai.assert;

describe("Sum test", () => {
    it("Should compile a code with an undefined if", async() => {
        await compiler(path.join(__dirname, "circuits", "undefinedif.circom"));
    });
});
