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

const bigInt = require("big-integer");
const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const sONE = 0;
const build = require("./build");
const BuilderC = require("../ports/c/builder.js");
const BuilderWasm = require("../ports/wasm/builder.js");
const constructionPhase = require("./construction_phase");
const Ctx = require("./ctx");
const ZqField = require("fflib").ZqField;
const utils = require("./utils");
const buildR1cs = require("./r1csfile").buildR1cs;
const BigArray = require("./bigarray");
const buildSyms = require("./buildsyms");

module.exports = compile;

async function compile(srcFile, options) {
    options.p = options.p || __P__;
    if (!options) {
        options = {};
    }
    if (typeof options.reduceConstraints === "undefined") {
        options.reduceConstraints = true;
    }
    const ctx = new Ctx();
    ctx.field = new ZqField(options.p);
    ctx.verbose= options.verbose || false;
    ctx.mainComponent = options.mainComponent || "main";
    ctx.newThreadTemplates = options.newThreadTemplates;

    constructionPhase(ctx, srcFile);

    console.log("NConstraints Before: "+ctx.constraints.length);

    if (ctx.error) {
        throw(ctx.error);
    }

    if (ctx.getComponentIdx(ctx.mainComponent)<0) {
        throw new Error("A main component must be defined");
    }

    if (ctx.verbose) console.log("Classify Signals");
    classifySignals(ctx);

    if (ctx.verbose) console.log("Reduce Constants");
    reduceConstants(ctx);
    if (options.reduceConstraints) {

        if (ctx.verbose) console.log("Reduce Constraints");
        // Repeat while reductions are performed
        let oldNConstrains = -1;
        while (ctx.constraints.length != oldNConstrains) {
            console.log("Reducing constraints: "+ctx.constraints.length);
            oldNConstrains = ctx.constraints.length;
            reduceConstrains(ctx);
        }
    }

    console.log("NConstraints After: "+ctx.constraints.length);

    generateWitnessNames(ctx);

    if (ctx.error) {
        throw(ctx.error);
    }

    if (options.cSourceWriteStream) {
        ctx.builder = new BuilderC();
        build(ctx);
        const rdStream = ctx.builder.build();
        rdStream.pipe(options.cSourceWriteStream);

        // await new Promise(fulfill => options.cSourceWriteStream.on("finish", fulfill));
    }

    if ((options.wasmWriteStream)||(options.watWriteStream)) {
        ctx.builder = new BuilderWasm(options.sanityCheck);
        build(ctx);
        if (options.wasmWriteStream) {
            const rdStream = ctx.builder.build("wasm");
            rdStream.pipe(options.wasmWriteStream);
        }
        if (options.watWriteStream) {
            const rdStream = ctx.builder.build("wat");
            rdStream.pipe(options.watWriteStream);
        }

        // await new Promise(fulfill => options.wasmWriteStream.on("finish", fulfill));
    }

    // const mainCode = gen(ctx,ast);
    if (ctx.error) throw(ctx.error);

    if (options.r1csFileName) {
        await buildR1cs(ctx, options.r1csFileName);
    }

    if (options.symWriteStream) {
        const rdStream = buildSyms(ctx);
        rdStream.pipe(options.symWriteStream);

        // await new Promise(fulfill => options.symWriteStream.on("finish", fulfill));
    }

//    const def = buildCircuitDef(ctx, mainCode);

}



function classifySignals(ctx) {

    const ERROR = 0xFFFF;

    function priorize(t1, t2) {
        if ((t1 == ERROR) || (t2==ERROR)) return ERROR;
        if (t1 == ctx.stINTERNAL) {
            return t2;
        } else if (t2==ctx.stINTERNAL) {
            return t1;
        }
        if ((t1 == ctx.stONE) || (t2 == ctx.stONE)) return ctx.stONE;
        if ((t1 == ctx.stOUTPUT) || (t2 == ctx.stOUTPUT)) return ctx.stOUTPUT;
        if ((t1 == ctx.stCONSTANT) || (t2 == ctx.stCONSTANT)) return ctx.stCONSTANT;
        if ((t1 == ctx.stDISCARDED) || (t2 == ctx.stDISCARDED)) return ctx.stDISCARDED;
        if (t1!=t2) return ERROR;
        return t1;
    }

    // First classify the signals
    for (let s=0; s<ctx.signals.length; s++) {
        const signal = ctx.signals[s];
        let tAll = ctx.stINTERNAL;
        let lSignal = signal;
        let end = false;
        while (!end) {
            let t = lSignal.c || ctx.stINTERNAL;
            if (s == 0) {
                t = ctx.stONE;
            } else if (lSignal.o & ctx.MAIN) {
                if (lSignal.o & ctx.IN) {
                    if (lSignal.o & ctx.PRV) {
                        t = ctx.stPRVINPUT;
                    } else {
                        t = ctx.stPUBINPUT;
                    }
                } else if (lSignal.o & ctx.OUT) {
                    t = ctx.stOUTPUT;
                }
            } else if (utils.isDefined(lSignal.v)) {
                t = ctx.stCONSTANT;
            }
            tAll = priorize(t,tAll);
            if (lSignal.e>=0) {
                lSignal = ctx.signals[lSignal.e];
            } else {
                end=true;
            }
        }
        if (tAll == ERROR) {
            throw new Error("Incompatible types in signal: " + s);
        }
        lSignal.c = tAll;
    }
}


function generateWitnessNames(ctx) {
    const totals = {};
    totals[ctx.stONE] = 0;
    totals[ctx.stOUTPUT] = 0;
    totals[ctx.stPUBINPUT] = 0;
    totals[ctx.stPRVINPUT] = 0;
    totals[ctx.stINTERNAL] = 0;
    totals[ctx.stDISCARDED] = 0;
    totals[ctx.stCONSTANT] = 0;
    const ids = {};

    // First classify the signals
    for (let s=0; s<ctx.signals.length; s++) {

        if ((ctx.verbose)&&(s%10000 == 0)) console.log("generate witness (counting): ", s);

        const signal = ctx.signals[s];
        let lSignal = signal;
        while (lSignal.e>=0) lSignal = ctx.signals[lSignal.e];

        if (!( lSignal.o & ctx.COUNTED) ) {
            lSignal.o |= ctx.COUNTED;
            totals[lSignal.c] ++;
        }
    }

    ids[ctx.stONE] = 0;
    ids[ctx.stOUTPUT] = 1;
    ids[ctx.stPUBINPUT] = ids[ctx.stOUTPUT] + totals[ctx.stOUTPUT];
    ids[ctx.stPRVINPUT] = ids[ctx.stPUBINPUT] + totals[ctx.stPUBINPUT];
    ids[ctx.stINTERNAL] = ids[ctx.stPRVINPUT] + totals[ctx.stPRVINPUT];
    ids[ctx.stDISCARDED] = ids[ctx.stINTERNAL] + totals[ctx.stINTERNAL];
    ids[ctx.stCONSTANT] = ids[ctx.stDISCARDED] + totals[ctx.stDISCARDED];
    const nSignals = ids[ctx.stCONSTANT] + totals[ctx.stCONSTANT];

    for (let s=0; s<ctx.signals.length; s++) {

        if ((ctx.verbose)&&(s%10000 == 0)) console.log("seting id: ", s);

        const signal = ctx.signals[s];
        let lSignal = signal;
        while (lSignal.e>=0) {
            lSignal = ctx.signals[lSignal.e];
        }
        if ( typeof(lSignal.id) === "undefined" ) {
            lSignal.id = ids[lSignal.c] ++;
        }

        signal.id = lSignal.id;
    }

    ctx.totals = totals;
}

function reduceConstants(ctx) {
    const newConstraints = new BigArray();
    for (let i=0; i<ctx.constraints.length; i++) {
        if ((ctx.verbose)&&(i%10000 == 0)) console.log("reducing constants: ", i);
        const c = ctx.lc.canonize(ctx, ctx.constraints[i]);
        if (!ctx.lc.isZero(c)) {
            newConstraints.push(c);
        }
        delete ctx.constraints[i];
    }
    ctx.constraints = newConstraints;
}

function reduceConstrains(ctx) {
    indexVariables();
    let possibleConstraints = ctx.constraints;
    let ii=0;
    while (possibleConstraints.length>0) {
        let nextPossibleConstraints = new BigArray();
        for (let i=0; i<possibleConstraints.length; i++) {
            ii++;
            if ((ctx.verbose)&&(ii%10000 == 0)) console.log("reducing constraints: ", i);
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
                const ct = {t: "N", v: c.a.coefs[sONE]};
                c.c = ctx.lc.add(ctx.lc.mul(c.b, ct), c.c);
                c.a = { t: "LC", coefs: {} };
                c.b = { t: "LC", coefs: {} };
            }
            if (isConstant(c.b)) {
                const ct = {t: "N", v: c.b.coefs[sONE]};
                c.c = ctx.lc.add(ctx.lc.mul(c.a, ct), c.c);
                c.a = { t: "LC", coefs: {} };
                c.b = { t: "LC", coefs: {} };
            }

            if (ctx.lc.isZero(c.a) || ctx.lc.isZero(c.b)) {
                const isolatedSignal = getFirstInternalSignal(ctx, c.c);
                if (isolatedSignal) {

                    let lSignal = ctx.signals[isolatedSignal];
                    while (lSignal.e>=0) {
                        lSignal = ctx.signals[lSignal.e];
                    }


                    const isolatedSignalEquivalence = {
                        t: "LC",
                        coefs: {}
                    };
                    const invCoef = c.c.coefs[isolatedSignal].modInv(__P__);
                    for (const s in c.c.coefs) {
                        if (s != isolatedSignal) {
                            const v = __P__.minus(c.c.coefs[s]).times(invCoef).mod(__P__);
                            if (!v.isZero()) {
                                isolatedSignalEquivalence.coefs[s] = v;
                            }
                        }
                    }

                    for (let j in lSignal.inConstraints) {
                        if ((j!=i)&&(ctx.constraints[j])) {
                            ctx.constraints[j] = ctx.lc.substitute(ctx.constraints[j], isolatedSignal, isolatedSignalEquivalence);
                            linkSignalsConstraint(j);
                            if (j<i) {
                                nextPossibleConstraints.push(j);
                            }
                        }
                    }

                    ctx.constraints[i] = null;

                    lSignal.c = ctx.stDISCARDED;
                } else {
                    if (ctx.lc.isZero(c.c)) ctx.constraints[i] = null;
                }
            }
        }
        possibleConstraints = nextPossibleConstraints;
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
        for (let k in ct.a.coefs) linkSignal(k, cidx);
        for (let k in ct.b.coefs) linkSignal(k, cidx);
        for (let k in ct.c.coefs) linkSignal(k, cidx);
    }

    function unindexVariables() {
        for (let s=0; s<ctx.signals.length; s++) {
            let lSignal = ctx.signals[s];
            while (lSignal.e>=0) {
                lSignal = ctx.signals[lSignal.e];
            }
            if (lSignal.inConstraints) delete lSignal.inConstraints;
        }
    }

/*
    function unlinkSignal(signalName, cidx) {
        let lSignal = ctx.signals[signalName];
        while (lSignal.e>=0) {
            lSignal = ctx.signals[lSignal.e];
        }
        if ((lSignal.inConstraints)&&(lSignal.inConstraints[cidx])) {
            delete lSignal.inConstraints[cidx];
        }
    }
*/

    function linkSignal(signalName, cidx) {
        let lSignal = ctx.signals[signalName];
        while (lSignal.e>=0) {
            lSignal = ctx.signals[lSignal.e];
        }
        if (!lSignal.inConstraints) lSignal.inConstraints = {};
        lSignal.inConstraints[cidx] = true;
    }

    function getFirstInternalSignal(ctx, l) {
        for (let k in l.coefs) {
            const signal = ctx.signals[k];
            if (signal.c == ctx.stINTERNAL) return k;
        }
        return null;
    }

    function isConstant(l) {
        for (let k in l.coefs) {
            if ((k != sONE) && (!l.coefs[k].isZero())) return false;
        }
        if (!l.coefs[sONE] || l.coefs[sONE].isZero()) return false;
        return true;
    }

}

/*

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

*/


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
/*
function buildConstraints(ctx) {
    const res = [];

    function fillLC(dst, src) {
        if (src.t != "LC") throw new Error("Constraint is not a LINEARCOMBINATION");
        for (let s in src.coefs) {
            const v = src.coefs[s].toString();
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
        fillLC(C, ctx.lc.negate(ctx.constraints[i].c));

        res.push([A,B,C]);
    }

    return res;
}
*/

/*
function buildSyms(ctx, strm) {

    let nSyms;

    addSymbolsComponent(ctx.mainComponent + ".", ctx.getComponentIdx(ctx.mainComponent));


    function addSymbolsComponent(prefix, idComponet) {
        for (let n in  ctx.components[idComponet].names.o) {
            const entrie = ctx.components[idComponet].names.o[n];
            addSymbolArray(prefix+n, entrie.type, entrie.sizes, entrie.offset);
        }
    }

    function addSymbolArray(prefix, type, sizes, offset) {
        if (sizes.length==0) {
            if (type == "S") {
                let s=offset;
                while (ctx.signals[s].e >= 0) s = ctx.signals[s].e;
                let wId = ctx.signals[s].id;
                if (typeof(wId) == "undefined") wId=-1;
                strm.write(`${offset},${wId},${prefix}\n`);
                nSyms ++;
                if ((ctx.verbose)&&(nSyms%10000 == 0)) console.log("Symbols saved: "+nSyms);
            } else {
                addSymbolsComponent(prefix+".", offset);
            }
            return 1;
        } else {
            let acc = 0;
            for (let i=0; i<sizes[0]; i++) {
                acc += addSymbolArray(`${prefix}[${i}]`, type, sizes.slice(1), offset + acc );
            }
            return acc;
        }
    }

}

*/

