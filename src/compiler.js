/*
    Copyright 2018 0KIMS association.

    This file is part of circom (Zero Knowledge Circuit Compiler).

    circom is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    circom is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with circom. If not, see <https://www.gnu.org/licenses/>.
*/

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

const parser = require("../parser/jaz.js").parser;

const timeout = ms => new Promise(res => setTimeout(res, ms));

async function compile(srcFile, options) {
    if (!options) {
        options = {};
    }
    if (typeof options.reduceConstraints === "undefined") {
        options.reduceConstraints = true;
    }
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
        constraints: [],
        components: {},
        templates: {},
        functions: {},
        functionParams: {},
        filePath: fullFilePath,
        fileName: fullFileName
    };


    exec(ctx, ast);

    if (!ctx.components["main"]) {
        throw new Error("A main component must be defined");
    }

    classifySignals(ctx);

    reduceConstants(ctx);
    if (options.reduceConstraints) {

        // Repeat while reductions are performed
        let oldNConstrains = -1;
        while (ctx.constraints.length != oldNConstrains) {
            oldNConstrains = ctx.constraints.length;
            reduceConstrains(ctx);
        }
    }

    generateWitnessNames(ctx);

    if (ctx.error) {
        throw(ctx.error);
    }

    ctx.scopes = [{}];

    const mainCode = gen(ctx,ast);
    if (ctx.error) throw(ctx.error);

    const def = buildCircuitDef(ctx, mainCode);

    return def;
}


function classifySignals(ctx) {

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
        lSignal.category = tAll;
    }
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

    const counted = {};

    // First classify the signals
    for (let s in ctx.signals) {
        const signal = ctx.signals[s];
        let lSignal = signal;
        while (lSignal.equivalence) lSignal = ctx.signals[lSignal.equivalence];

        if (!counted[lSignal.fullName]) {
            counted[lSignal.fullName] = true;
            totals[lSignal.category] ++;
        }
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

function reduceConstants(ctx) {
    const newConstraints = [];
    for (let i=0; i<ctx.constraints.length; i++) {
        const c = lc.canonize(ctx, ctx.constraints[i]);
        if (!lc.isZero(c)) {
            newConstraints.push(c);
        }
    }
    ctx.constraints = newConstraints;
}

function reduceConstrains(ctx) {
    indexVariables();
    let possibleConstraints = Object.keys(ctx.constraints);
    while (possibleConstraints.length>0) {
        let nextPossibleConstraints = {};
        for (let i in possibleConstraints) {
            if (!ctx.constraints[i]) continue;
            const c = ctx.constraints[i];

            // Swap a and b if b has more variables.
            if (Object.keys(c.b).length > Object.keys(c.a).length) {
                const aux = c.a;
                c.a=c.b;
                c.b=aux;
            }

            // Mov to C if possible.
            if (isConstant(c.a)) {
                const ct = {type: "NUMBER", value: c.a.values["one"]};
                c.c = lc.add(lc.mul(c.b, ct), c.c);
                c.a = { type: "LINEARCOMBINATION", values: {} };
                c.b = { type: "LINEARCOMBINATION", values: {} };
            }
            if (isConstant(c.b)) {
                const ct = {type: "NUMBER", value: c.b.values["one"]};
                c.c = lc.add(lc.mul(c.a, ct), c.c);
                c.a = { type: "LINEARCOMBINATION", values: {} };
                c.b = { type: "LINEARCOMBINATION", values: {} };
            }

            if (lc.isZero(c.a) || lc.isZero(c.b)) {
                const isolatedSignal = getFirstInternalSignal(ctx, c.c);
                if (isolatedSignal) {

                    let lSignal = ctx.signals[isolatedSignal];
                    while (lSignal.equivalence) {
                        lSignal = ctx.signals[lSignal.equivalence];
                    }


                    const isolatedSignalEquivalence = {
                        type: "LINEARCOMBINATION",
                        values: {}
                    };
                    const invCoef = c.c.values[isolatedSignal].modInv(__P__);
                    for (const s in c.c.values) {
                        if (s != isolatedSignal) {
                            const v = __P__.minus(c.c.values[s]).times(invCoef).mod(__P__);
                            if (!v.isZero()) {
                                isolatedSignalEquivalence.values[s] = v;
                            }
                        }
                    }

                    for (let j in lSignal.inConstraints) {
                        if ((j!=i)&&(ctx.constraints[j])) {
                            ctx.constraints[j] = lc.substitute(ctx.constraints[j], isolatedSignal, isolatedSignalEquivalence);
                            linkSignalsConstraint(j);
                            if (j<i) {
                                nextPossibleConstraints[j] = true;
                            }
                        }
                    }

                    ctx.constraints[i] = null;

                    lSignal.category = "constant";
                } else {
                    if (lc.isZero(c.c)) ctx.constraints[i] = null;
                }
            }
        }
        possibleConstraints = Object.keys(nextPossibleConstraints);
    }
    unindexVariables();

    // Pack the constraints
    let o = 0;
    for (let i=0; i<ctx.constraints.length; i++) {
        if (ctx.constraints[i]) {
            if (o != i) {
                ctx.constraints[o] = ctx.constraints[i];
            }
            o++;
        }
    }
    ctx.constraints.length = o;

    function indexVariables() {
        for (let i=0; i<ctx.constraints.length; i++) linkSignalsConstraint(i);
    }

    function linkSignalsConstraint(cidx) {
        const ct = ctx.constraints[cidx];
        for (let k in ct.a.values) linkSignal(k, cidx);
        for (let k in ct.b.values) linkSignal(k, cidx);
        for (let k in ct.c.values) linkSignal(k, cidx);
    }

    function unindexVariables() {
        for (let s in ctx.signals) {
            let lSignal = ctx.signals[s];
            while (lSignal.equivalence) {
                lSignal = ctx.signals[lSignal.equivalence];
            }
            if (lSignal.inConstraints) delete lSignal.inConstraints;
        }
    }

/*
    function unlinkSignal(signalName, cidx) {
        let lSignal = ctx.signals[signalName];
        while (lSignal.equivalence) {
            lSignal = ctx.signals[lSignal.equivalence];
        }
        if ((lSignal.inConstraints)&&(lSignal.inConstraints[cidx])) {
            delete lSignal.inConstraints[cidx];
        }
    }
*/

    function linkSignal(signalName, cidx) {
        let lSignal = ctx.signals[signalName];
        while (lSignal.equivalence) {
            lSignal = ctx.signals[lSignal.equivalence];
        }
        if (!lSignal.inConstraints) lSignal.inConstraints = {};
        lSignal.inConstraints[cidx] = true;
    }

    function getFirstInternalSignal(ctx, l) {
        for (let k in l.values) {
            const signal = ctx.signals[k];
            if (signal.category == "internal") return k;
        }
        return null;
    }

    function isConstant(l) {
        for (let k in l.values) {
            if ((k != "one") && (!l.values[k].isZero())) return false;
        }
        if (!l.values["one"] || l.values["one"].isZero()) return false;
        return true;
    }

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

    res.constraints = buildConstraints(ctx);

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
    Build constraints

A constraint like this

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

function buildConstraints(ctx) {
    const res = [];

    function fillLC(dst, src) {
        if (src.type != "LINEARCOMBINATION") throw new Error("Constraint is not a LINEARCOMBINATION");
        for (let s in src.values) {
            const v = src.values[s].toString();
            const id = ctx.signalName2Idx[s];
            dst[id] = v;
        }
    }

    for (let i=0; i<ctx.constraints.length; i++) {
        const A = {};
        const B = {};
        const C = {};

        fillLC(A, ctx.constraints[i].a);
        fillLC(B, ctx.constraints[i].b);
        fillLC(C, lc.negate(ctx.constraints[i].c));

        res.push([A,B,C]);
    }

    return res;
}



