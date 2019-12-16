const fs = require("fs");

const argv = require("yargs")
    .usage("mergesymbols -i [input_file] -o [output_file] -s [symbols file]")
    .alias("i", "input")
    .alias("o", "output")
    .alias("s", "symbols")
    .help("h")
    .epilogue(`Copyright (C) 2018  0kims association
    This program comes with ABSOLUTELY NO WARRANTY;
    This is free software, and you are welcome to redistribute it
    under certain conditions; see the COPYING file in the official
    repo directory at  https://github.com/iden3/circom `)
    .demandOption(["i","o","s"])
    .argv;

const inFileName = argv.input;
const outFile = argv.output;
const symbolsFile = argv.symbols;

let symbols;

async function loadSymbols() {
    symbols = {};
    const symsStr = await fs.promises.readFile(symbolsFile,"utf8");
    const lines = symsStr.split("\n");
    for (let i=0; i<lines.length; i++) {
        const arr = lines[i].split(",");
        if (arr.length!=3) continue;
        symbols[arr[0]] = arr[2];
    }
}


async function run() {
    const outLines = [];
    await loadSymbols();
    const inStr = await fs.promises.readFile(inFileName,"utf8");
    const lines = inStr.split("\n");
    for (let i=0; i<lines.length; i++) {
        const arr = lines[i].split(" --> ");
        if (arr.length!=2) continue;
        outLines.push(symbols[arr[0]] + " --> " + arr[1]);
    }
    await fs.promises.writeFile(outFile,outLines.join("\n"), "utf8");
}


run().then(() => {
    process.exit(0);
});
