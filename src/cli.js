/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");

const compiler = require("./compiler");

const argv = require("yargs")
    .usage("jaz -s [input source circuit file] -o [output definition circuit file]")
    .alias("s", "source")
    .alias("o", "output")
    .require(["s","o"])
    .argv;

const fullFileName = path.resolve(process.cwd(), argv.source);

compiler(fullFileName).then( (cir) => {
    fs.writeFileSync(argv.output, JSON.stringify(cir, null, 1), "utf8");
}, (err) => {
    console.error(`ERROR at ${err.errFile}:${err.pos.first_line},${err.pos.first_column}-${err.pos.last_line},${err.pos.last_column}   ${err.errStr}`);
    console.error(JSON.stringify(err.ast, null, 1));
    process.exit(1);
});




