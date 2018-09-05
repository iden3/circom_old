
const fs = require("fs");
const path = require("path");
const bigInt = require("big-integer");
const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const __MASK__ = new bigInt(2).pow(253).minus(1);
const assert = require("assert");
const gen = require("./gencode");
const exec = require("./exec");
const lc = require("./lcalgebra");

module.exports = compile;

const parser = require("../jaz.js").parser;

function compile(srcFile) {

    return new Promise ((resolve, reject) => {
        const fullFileName = srcFile;
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

        if (ctx.error) {
            reject(ctx.error);
        }

        ctx.scopes = [{}];

        const mainCode = gen(ctx,ast);
        if (ctx.error) reject(ctx.error);

        const def = buildCircuitDef(ctx, mainCode);

        resolve(def);
    });
}


function generateWitnessNames(ctx) {

    const totals = {
        "output": 0,
        "pubInput": 0,
        "one": 0,
        "prvInput": 0,
        "internal": 0,
        "constant": 0,
    };
    const ids = {};

    function priorize(t1, t2) {
        if ((t1 == "error") || (t2=="error")) return "error";
        if (t1 == "internal") {
            return t2;
        } else if (t2=="internal") {
            return t1;
        }
        if ((t1 == "one") || (t2 == "one")) return "one";
        if ((t1 == "constant") || (t2 == "constant")) return "constant";
        if (t1!=t2) return "error";
        return t1;
    }

    // First classify the signals
    for (let s in ctx.signals) {
        const signal = ctx.signals[s];
        let tAll = "internal";
        let lSignal = signal;
        let end = false;
        while (!end) {
            let t = lSignal.category || "internal";
            if (s == "one") {
                t = "one";
            } else if (lSignal.value) {
                t = "constant";
            } else if (lSignal.component=="main") {
                if (lSignal.direction == "IN") {
                    if (lSignal.private) {
                        t = "prvInput";
                    } else {
                        t = "pubInput";
                    }
                } else if (lSignal.direction == "OUT") {
                    t = "output";
                }
            }
            tAll = priorize(t,tAll);
            if (lSignal.equivalence) {
                lSignal = ctx.signals[lSignal.equivalence];
            } else {
                end=true;
            }
        }
        if (tAll == "error") {
            throw new Error("Incompatible types in signal: " + s);
        }
        if (lSignal.category) totals[lSignal.category]--;
        lSignal.category = tAll;
        totals[lSignal.category] ++;
    }

    ids["one"] = 0;
    ids["output"] = 1;
    ids["pubInput"] = ids["output"] + totals["output"];
    ids["prvInput"] = ids["pubInput"] + totals["pubInput"];
    ids["internal"] = ids["prvInput"] + totals["prvInput"];
    ids["constant"] = ids["internal"] + totals["internal"];
    const nSignals = ids["constant"] + totals["constant"];

    ctx.signalNames = new Array(nSignals);
    for (let i=0; i< nSignals; i++) ctx.signalNames[i] = [];
    ctx.signalName2Idx = {};

    for (let s in ctx.signals) {
        const signal = ctx.signals[s];
        let lSignal = signal;
        while (lSignal.equivalence) {
            lSignal = ctx.signals[lSignal.equivalence];
        }
        if ( typeof(lSignal.id) === "undefined" ) {
            lSignal.id = ids[lSignal.category] ++;
        }

        signal.id = lSignal.id;
        ctx.signalNames[signal.id].push(signal.fullName);
        ctx.signalName2Idx[signal.fullName] = signal.id;
    }

    ctx.totals = totals;
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


function buildCircuitDef(ctx, mainCode) {
    const res = {
        mainCode: mainCode
    };
    res.signalName2Idx = ctx.signalName2Idx;

    res.components = [];
    res.componentName2Idx = {};
    for (let c in ctx.components) {
        const idCoponent = res.components.length;
        res.components.push({
            name: c,
            params: ctx.components[c].params,
            template: ctx.components[c].template,
            inputSignals: 0
        });
        res.componentName2Idx[c] = idCoponent;
    }

    res.signals = new Array(ctx.signalNames.length);
    for (let i=0; i<ctx.signalNames.length; i++) {
        res.signals[i] = {
            names: ctx.signalNames[i],
            triggerComponents: []
        };
        ctx.signalNames[i].map( (fullName) => {
            const idComponet = res.componentName2Idx[ctx.signals[fullName].component];
            if (ctx.signals[fullName].direction == "IN") {
                res.signals[i].triggerComponents.push(idComponet);
                res.components[idComponet].inputSignals++;
            }
        });
    }

    res.constrains = buildConstrains(ctx);

    res.templates = ctx.templates;

    res.functions = {};
    for (let f in ctx.functions) {
        res.functions[f] = {
            params: ctx.functionParams[f],
            func: ctx.functions[f]
        };
    }

    res.nPrvInputs = ctx.totals.prvInput;
    res.nPubInputs = ctx.totals.pubInput;
    res.nInputs = res.nPrvInputs + res.nPubInputs;
    res.nOutputs = ctx.totals.output;
    res.nVars = res.nInputs + res.nOutputs + ctx.totals.one + ctx.totals.internal;
    res.nConstants = ctx.totals.constant;
    res.nSignals = res.nVars + res.nConstants;

    return res;
}

/*
    Build constrains

A constrain like this

      [s1 + 2*s2 + 3*s3] * [ s2 + 5*s4] - [s0        ] = 0
      [     5*s2 + 6*s3] * [ s2 +     ] - [s0 + 2* s2] = 0
      [s1 +          s3] * [ s2 + 5*s3] - [s4        ] = 0

is converted to

[
    [{"1":"1","2":"2","3":"3"} , {"2":"1","4":"5"} , {"0":"1"         }],
    [{        "2":"5","3":"6"} , {"2":"1"        } , {"0":"1", "2":"2"}],
    [{"1":"1",        "3":"1"} , {"2":"1","3":"5"} , {"4":"1"         }]
]
           ^                            ^                  ^
           |                            |                  |
           A                            B                  C

*/

function buildConstrains(ctx) {
    const res = [];

    function fillLC(dst, src) {
        for (let s in src.values) {
            const v = src.values[s].toString();
            const id = ctx.signalName2Idx[s];
            dst[id] = v;
        }
    }

    for (let i=0; i<ctx.constrains.length; i++) {
        const A = {};
        const B = {};
        const C = {};

        fillLC(A, ctx.constrains[i].a);
        fillLC(B, ctx.constrains[i].b);
        fillLC(C, lc.negate(ctx.constrains[i].c));

        res.push([A,B,C]);
    }

    return res;
}



