const chai = require("chai");
const path = require("path");

const compiler = require("../index.js");

const assert = chai.assert;

describe("SHA256 test", () => {
    it("Should create a constant circuit", async () => {

        const cir = await compiler(path.join(__dirname, "circuits", "constants_test.jaz"));
        assert.equal(cir.nVars, 2);
    });
});
