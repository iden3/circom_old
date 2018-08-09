
const fs = require("fs");
const path = require("path");
const bigInt = require("big-integer");
const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const __MASK__ = new bigInt(2).pow(253).minus(1);
const assert = require("assert");
const gen = require("./gencode");
const exec = require("./exec");
const lc = require("./lcalgebra");


const argv = require("optimist")
    .alias("c", "circuit")
    .alias("o", "output")
    .alias("w", "witnes")
    .argv;

const parser = require("../jaz.js").parser;

const fullFileName = path.resolve(process.cwd(), argv.circuit);
const fullFilePath = path.dirname(fullFileName);

const src = fs.readFileSync(fullFileName, "utf8");
const ast = parser.parse(src);

assert(ast.type == "BLOCK");

const ctx = {
    scopes: [{}],
    signals: {
        one: {
            fullName: "one",
            value: bigInt(1),
            equivalence: "",
            direction: ""
        }
    },
    currentComponent: "",
    constrains: [],
    components: {},
    templates: {},
    functions: {},
    functionParams: {},
    filePath: fullFilePath,
    fileName: fullFileName
};

exec(ctx, ast);

reduceConstrains(ctx);
generateWitnessNames(ctx);
generateWitnessConstrains(ctx);

if (ctx.error) {
    console.log(`ERROR at ${ctx.error.errFile}:${ctx.error.pos.first_line},${ctx.error.pos.first_column}-${ctx.error.pos.last_line},${ctx.error.pos.last_column}   ${ctx.error.errStr}`);
    console.log(JSON.stringify(ctx.error.ast, null, 1));
    process.exit(1);
}

/*
console.log("SIGNALS");
console.log("==========");
for (let key in ctx.signals) {
    const signal = ctx.signals[key];
    console.log(signal.fullName);
}

console.log("CONSTRAINS");
console.log("==========");
for (let i=0; i<ctx.constrains.length; i++) {
    console.log(lc.toString(ctx.constrains[i], ctx) + " === 0");
}
*/
ctx.scopes = [{}];

const mainCode = gen(ctx,ast);
if (ctx.error) {
    console.log(`ERROR at ${ctx.error.pos.first_line},${ctx.error.pos.first_column}-${ctx.error.pos.last_line},${ctx.error.pos.last_column}   ${ctx.error.errStr}`);
    console.log(JSON.stringify(ctx.error.ast, null, 1));
    process.exit(1);
}


let outCode = "";
outCode += "const bigInt = require(\"big-integer\");\n";
outCode += "const __P__ = new bigInt(\"21888242871839275222246405745257275088696311157297823662689037894645226208583\");\n";
outCode += "const __MASK__ = new bigInt(2).pow(253).minus(1);\n";
outCode += "const circuit = {};\n";
outCode += "module.exports = circuit;\n\n";
outCode += `circuit.signals=${JSON.stringify(ctx.signals, null, 1)};\n\n`;
outCode += `circuit.components=${JSON.stringify(ctx.components, null, 1)};\n\n`;
outCode += `circuit.signalConstrains=${JSON.stringify(ctx.constrains, null, 1)};\n\n`;
outCode += `circuit.witnessNames=${JSON.stringify(ctx.witnessNames, null, 1)};\n\n`;
outCode += mainCode;
outCode += "\ncircuit.templates = {};\n";
for (let t in ctx.templates) {
    outCode += `\ncircuit.templates["${t}"] = ${ctx.templates[t]};\n`;
}
outCode += `circuit.functionParams=${JSON.stringify(ctx.functionParams, null, 1)};\n\n`;
outCode += "\ncircuit.functions = {};\n";
for (let f in ctx.functions) {
    outCode += `\ncircuit.functions["${f}"] = ${ctx.functions[f]};\n`;
}

/*
console.log("CODE");
console.log("====");
console.log(outCode);
*/


console.log("#Constrains:" +ctx.constrains.length);

fs.writeFileSync(argv.output, outCode, "utf8");

function generateWitnessNames(ctx) {
    ctx.witnessNames = [];
    for (let c in ctx.components) {
        ctx.components[c].inputSignals = 0;
    }
    for (let s in ctx.signals) {
        const signal = ctx.signals[s];
        let lSignal = signal;
        while (lSignal.equivalence) {
            lSignal = ctx.signals[lSignal.equivalence];
        }
        if ( typeof(lSignal.id) === "undefined" ) {
            lSignal.id = ctx.witnessNames.length;
            ctx.witnessNames.push([]);
        }
        if (signal.direction == "IN") {
            ctx.components[signal.component].inputSignals++;
        }

        signal.id = lSignal.id;
        ctx.witnessNames[signal.id].push(signal.fullName);
    }
}

function reduceConstrains(ctx) {
    const newConstrains = [];
    for (let i=0; i<ctx.constrains.length; i++) {
        const c = lc.canonize(ctx, ctx.constrains[i]);
        if (!lc.isZero(c)) {
            newConstrains.push(c);
        }
    }
    ctx.constrains = newConstrains;
}

function generateWitnessConstrains(ctx) {

}


