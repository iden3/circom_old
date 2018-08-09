const fs = require("fs");
const path = require("path");

const calculateWitness = require("./calculateWitness.js");

const argv = require("optimist")
    .alias("i", "input")
    .alias("o", "output")
    .alias("c", "circuit")
    .argv;

const circuit = require(path.resolve(argv.circuit));

const inputSignals = JSON.parse(fs.readFileSync(argv.input, "utf8"));

try {
    const w = calculateWitness(circuit, inputSignals);
    fs.writeFileSync(argv.output, JSON.stringify(w), "utf8");
} catch(err) {
    console.log("ERROR: " + err);
    console.log(err.stack);
}





