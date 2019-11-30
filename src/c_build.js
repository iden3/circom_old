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

const assert = require("assert");
const bigInt = require("big-integer");
const utils = require("./utils");
const gen = require("./c_gen").gen;
const newRef = require("./c_gen").newRef;

module.exports =  buildC;


function buildC(ctx) {
    ctx.definedFunctions = {};
    ctx.functionCodes = [];
    ctx.buildFunction = buildFunction;
    ctx.code = "";
    ctx.conditionalCodeHeader = "";
    ctx.tmpNames = {};
    ctx.getTmpName = getTmpName;
    ctx.codes_sizes = [];
    ctx.definedSizes = {};
    ctx.addSizes = addSizes;

    const entryTables = buildEntryTables(ctx);
    ctx.globalNames = ctx.tmpNames;

    const code = buildCode(ctx);
    const functions = buildFuncFunctions(ctx);
    const compnentsArray = buildComponentsArray(ctx);

    const headder = buildHeader(ctx);
    const sizes = buildSizes(ctx);
    const mapIsInput = buildMapIsInput(ctx);
    const wit2Sig = buildWit2Sig(ctx);
    const circuitVar = buildCircuitVar(ctx);

    return "" +
        headder + "\n" +
        sizes + "\n" +
        entryTables + "\n" +
        functions + "\n" +
        code + "\n" +
        compnentsArray + "\n" +
        mapIsInput + "\n" +
        wit2Sig +"\n" +
        circuitVar;
}

function buildEntryTables(ctx) {

    const codes_hashMaps = [];
    const codes_componentEntries = [];
    const definedHashTables = {};
    for (let i=0; i<ctx.components.length; i++) {
        const {htName, htMap} = addHashTable(i);

        let code = "";
        const componentEntriesTableName = ctx.getTmpName("entryTable_" + ctx.components[i].template);

        code += `Circom_ComponentEntry ${componentEntriesTableName}[${htMap.length}] = {\n`;
        for (let j=0; j<htMap.length; j++) {
            const entry = ctx.components[i].names.o[htMap[j]];
            code += j>0 ? "    ," : "     ";
            const sizeName = ctx.addSizes(entry.sizes);

            const ty = entry.type == "S" ? "_typeSignal" : "_typeComponent";
            code += `{${entry.offset},${sizeName}, ${ty}}\n`;
        }
        code += "};\n";
        codes_componentEntries.push(code);

        ctx.components[i].htName = htName;
        ctx.components[i].etName = componentEntriesTableName;
    }


    return "" +
        "// HashMaps\n" +
        codes_hashMaps.join("\n") + "\n" +
        "\n" +
        "// Component Entries\n" +
        codes_componentEntries.join("\n") + "\n" +
        "\n";

    function addHashTable(cIdx) {
        const keys = Object.keys(ctx.components[cIdx].names.o);
        assert(keys.length<128);
        keys.sort((a,b) => ((a>b) ? 1 : -1));
        const h = utils.fnvHash(keys.join(","));
        if (definedHashTables[h]) return definedHashTables[h];
        definedHashTables[h] = {};
        definedHashTables[h].htName = ctx.getTmpName("ht_"+ctx.components[cIdx].template);
        definedHashTables[h].htMap = [];
        const t = [];
        for (let i=0; i<keys.length; i++) {
            definedHashTables[h].htMap[i] = keys[i];

            const h2 = utils.fnvHash(keys[i]);
            let pos = parseInt(h2.slice(-2), 16);
            while (t[pos]) pos = (pos + 1) % 256;
            t[pos] = [h2, i];
        }
        let code = `Circom_HashEntry ${definedHashTables[h].htName}[256] = {`;
        for (let i=0; i<256; i++) {
            code += i>0 ? "," : "";
            if (t[i]) {
                code += `{0x${t[i][0]}LL, ${t[i][1]}} /* ${keys[t[i][1]]} */`;
            } else {
                code += "{0,0}";
            }
        }
        code += "};\n";

        codes_hashMaps.push(code);

        return definedHashTables[h];
    }
}

function buildCode(ctx) {

    const fDefined = {};

    const fnComponents = [];
    for (let i=0; i<ctx.components.length; i++) {
        const {h, instanceDef} = hashComponentCall(ctx, i);
        const fName = ctx.components[i].template+"_"+h;
        if (!fDefined[fName]) {


            const scope = {_prefix : ""};
            ctx.scopes = [scope];
            ctx.conditionalCode = false;
            ctx.code = "";
            ctx.codeHeader = "// Header\n";
            ctx.codeFooter = "// Footer\n";
            ctx.tmpNames = Object.assign({},ctx.globalNames);

            for (let p in ctx.components[i].params) {
                newRef(ctx, "BIGINT", p, bigInt(ctx.components[i].params[p]));
            }

            gen(ctx, ctx.templates[ctx.components[i].template].block);

            const S =
                    "/*\n" +
                    instanceDef +
                    "\n*/\n" +
                    `void ${fName}(Circom_CalcWit *ctx) {\n` +
                        utils.ident(
                            ctx.codeHeader + "\n" +
                            ctx.code + "\n" +
                            ctx.codeFooter
                        ) +
                    "}\n";

            fnComponents.push(S);
            fDefined[fName] = true;
        }
        ctx.components[i].fnName = fName;
    }

    return fnComponents.join("\n");
}

function buildFuncFunctions(ctx) {
    return "// Functions\n" +
        ctx.functionCodes.join("\n");
}

function buildComponentsArray(ctx) {

    const ccodes = [];
    ccodes.push(`Circom_Component _components[${ctx.components.length}] = {\n`);
    for (let i=0; i< ctx.components.length; i++) {
        ccodes.push(i>0 ? "    ," : "     ");
        ccodes.push(`{${ctx.components[i].htName},${ctx.components[i].etName},${ctx.components[i].fnName}, ${ctx.components[i].nInSignals}}\n`);
    }
    ccodes.push("};\n");
    const codeComponents = ccodes.join("");

    return "" +
        "// Components\n" +
        codeComponents +
        "\n";
}


function buildHeader(ctx) {
    return "#include \"circom.h\"\n" +
           "#include \"calcwit.h\"\n" +
           `#define NSignals ${ctx.signals.length}\n` +
           `#define NComponents ${ctx.components.length}\n` +
           `#define NInputs ${ctx.components[ ctx.getComponentIdx("main") ].nInSignals}\n`+
           `#define NOutputs ${ctx.totals[ ctx.stOUTPUT ]}\n`+
           `#define NVars ${ctx.totals[ctx.stONE] + ctx.totals[ctx.stOUTPUT] + ctx.totals[ctx.stPUBINPUT] + ctx.totals[ctx.stPRVINPUT] + ctx.totals[ctx.stINTERNAL]}\n` +
           `#define __P__ "${ctx.field.p.toString()}"\n` +
           "\n";
}

function buildSizes(ctx) {
    return "// Sizes\n" +
            ctx.codes_sizes.join("\n");
}


function buildMapIsInput(ctx) {
    const arr = [];
    let line = "";
    let acc = 0;
    let i;
    for (i=0; i<ctx.signals.length; i++) {
        if (ctx.signals[i].o & ctx.IN) {
            acc = acc | (1 << (i%32) );
        }
        if ((i+1)%32==0) {
            line += (i>31) ? "," : " ";
            line += toHex(acc);
            acc = 0;
            if ( i % (32*64) == 0) {
                arr.push(line);
                line = "";
            }
        }
    }

    if ((i%32) != 0) {
        line += (i>31) ? "," : " ";
        line += toHex(acc);
    }
    if (line != "") {
        arr.push(line);
    }

    return "// mapIsArray\n" +
        `u32 _mapIsInput[${Math.floor((ctx.signals.length-1) / 32)+1}] = {\n`+
        arr.join("\n") + "\n" +
        "};\n";

    function toHex(number) {
        if (number < 0) number = 0xFFFFFFFF + number + 1;
        let S=number.toString(16).toUpperCase();
        while (S.length<8) S = "0" + S;
        return "0x"+S;
    }
}


function buildWit2Sig(ctx) {
    const codes = [];
    const NVars =
        ctx.totals[ctx.stONE] +
        ctx.totals[ctx.stOUTPUT] +
        ctx.totals[ctx.stPUBINPUT] +
        ctx.totals[ctx.stPRVINPUT] +
        ctx.totals[ctx.stINTERNAL];
    const arr = Array(NVars);
    for (let i=0; i<ctx.signals.length; i++) {
        const outIdx = ctx.signals[i].id;
        if (ctx.signals[i].e>=0) continue;     // If has an alias, continue..
        assert(typeof outIdx  != "undefined", `Signal ${i} does not have index`);
        if (outIdx>=NVars) continue; // Is a constant or a discarded variable
        if (typeof arr[ctx.signals[i].id] == "undefined") {
            arr[outIdx] = i;
        }
    }
    codes.push("// Signal Table\n");
    codes.push(`int _wit2sig[${NVars}] = {\n`);
    let code = "";
    for (let i=0; i<NVars; i++) {
        code += (i>0) ? ",": " ";
        code += arr[i];
        if ((i>0)&&(i%64 == 0)) {
            if (code != "") codes.push(code + "\n");
            codes.push(code);
            code =0;
        }
    }
    if (code != "") codes.push(code + "\n");
    codes.push("};\n");

    return codes.join("");

}


function buildCircuitVar() {
    return "Circom_Circuit _circuit = {\n" +
        "   NSignals,\n"+
        "   NComponents,\n"+
        "   NInputs,\n"+
        "   NOutputs,\n"+
        "   NVars,\n"+
        "   _wit2sig,\n"+
        "   _components,\n"+
        "   _mapIsInput,\n"+
        "   __P__\n" +
        "};\n";
}




function getTmpName(_suggestedName) {
    let suggestedName;
    if (_suggestedName) {
        suggestedName = trimUnderscore(_suggestedName);
    } else {
        suggestedName = "tmp";
    }

    if (typeof(this.tmpNames[suggestedName]) == "undefined") {
        this.tmpNames[suggestedName] = 1;
        return "_"+suggestedName;
    } else {
        const name = "_" + suggestedName + "_" + this.tmpNames[suggestedName];
        this.tmpNames[suggestedName]++;
        return name;
    }

    function trimUnderscore(str) {
        let p1=0;
        while ((p1 < str.length)&&(str[p1] == "_")) p1++;
        let p2=str.length;
        while ((p2 > 0)&&(str[p2-1] == "_")) p2--;

        return str.slice(p1,p2);
    }

}

function addSizes(_sizes) {
    const sizes = _sizes || [];
    let name = "sizes";
    for (let i=0; i<sizes.length;i++) {
        name+="_"+sizes[i];
    }
    if (name=="sizes") name="sizes_0";

    if (this.definedSizes[name]) return this.definedSizes[name];

    const labelName = this.getTmpName(name);
    this.definedSizes[name] = labelName;

    const accSizes = utils.accSizes(sizes);

    let code = `Circom_Size ${labelName}[${accSizes.length}] = {`;
    for (let i=0; i<accSizes.length; i++) {
        if (i>0) code += ",";
        code += accSizes[i];
    }
    code += "};\n";
    this.codes_sizes.push(code);

    return labelName;
}

function buildFunction(name, paramValues) {
    const ctx = this;
    const {h, instanceDef} = hashFunctionCall(ctx, name, paramValues);

    if (ctx.definedFunctions[h]) return ctx.definedFunctions[h];

    const res = {
        fnName: `${name}_${h}`
    };

    const oldScopes = ctx.scopes;
    const oldConditionalCode = ctx.conditionalCode;
    const oldCode = ctx.code;
    const oldCodeHeader = ctx.codeHeader;
    const oldCodeFooter = ctx.codeFooter;
    const oldTmpNames = ctx.tmpNames;


    const scope = {_prefix : ""};
    ctx.scopes = [scope];
    ctx.conditionalCode = false;
    ctx.code = "";
    ctx.codeHeader = "// Header\n";
    ctx.codeFooter = "// Footer\n";
    ctx.tmpNames = Object.assign({},ctx.globalNames);
    ctx.returnValue = null;
    ctx.returnSizes = null;

    let paramsStr = "";

    for (let i=0; i<ctx.functions[name].params.length; i++) {

        if (paramValues[i].used) {
            paramsStr += `,PBigInt ${ctx.functions[name].params[i]}`;
            scope[ctx.functions[name].params[i]] = {
                stack: true,
                type: "BIGINT",
                used: true,
                sizes: paramValues[i].sizes,
                label: ctx.functions[name].params[i],
            };
        } else {
            scope[ctx.functions[name].params[i]] = {
                stack: true,
                type: "BIGINT",
                used: false,
                sizes: paramValues[i].sizes,
                label: ctx.functions[name].params[i],
                value: paramValues[i].value
            };
        }
    }

    gen(ctx, ctx.functions[name].block);

    if (ctx.returnValue == null) {
        if (ctx.returnSizes ==  null) assert(false, `Funciont ${name} does not return any value`);
        res.type = "VARVAL_CONSTSIZE";
        let code =
            "/*\n" +
            instanceDef +
            "\n*/\n" +
            `void ${name}_${h}(Circom_CalcWit *ctx, PBigInt __retValue ${paramsStr}) {`;
        code += utils.ident(ctx.codeHeader);
        code += utils.ident(ctx.code);
        code += utils.ident("returnFunc:\n");
        code += utils.ident(ctx.codeFooter);
        code += "}\n";
        res.returnSizes = ctx.returnSizes;
        ctx.functionCodes.push(code);
    } else {
        res.type = "CONSTVAL";
        res.returnValue = ctx.returnValue;
    }

    ctx.scopes = oldScopes;
    ctx.conditionalCode = oldConditionalCode;
    ctx.code = oldCode;
    ctx.codeHeader = oldCodeHeader;
    ctx.codeFooter = oldCodeFooter;
    ctx.tmpNames = oldTmpNames;

    ctx.definedFunctions[h] = res;

    return res;
}



function hashComponentCall(ctx, cIdx) {
    // TODO: At the moment generate a diferent function for each instance of the component
    const constParams = [];
    for (let p in ctx.components[cIdx].params) {
        constParams.push(p + "=" + value2str(ctx.components[cIdx].params[p]));
    }

    for (let n in ctx.components[cIdx].names.o) {
        const entry = ctx.components[cIdx].names.o[n];
        if ((entry.type == "S")&&(ctx.signals[entry.offset].o & ctx.IN)) {
            travelSizes(n, entry.offset, entry.sizes, (prefix, offset) => {
                if (utils.isDefined(ctx.signals[offset].v)) {
                    constParams.push(prefix + "=" + bigInt(ctx.signals[offset].value));
                }
            });
        }
    }

    let instanceDef = ctx.components[cIdx].template;
    if (constParams.length>0) {
        instanceDef += "\n";
        constParams.sort();
        instanceDef += constParams.join("\n");
    }
    const h = utils.fnvHash(instanceDef);
    return {h, instanceDef};

    function travelSizes(prefix, offset, sizes, fn) {
        if (sizes.length == 0) {
            fn(prefix, offset);
            return 1;
        } else {
            let o = offset;
            for (let i=0; i<sizes[0]; i++) {
                o += travelSizes(prefix + "[" + i + "]", o, sizes.slice(1), fn);
            }
            return o-offset;
        }
    }
}

function hashFunctionCall(ctx, name, paramValues) {
    // TODO
    const constParams = [];
    for (let i=0; i<ctx.functions[name].params.length; i++) {
        if (!paramValues[i].used) {
            constParams.push(ctx.functions[name].params[i] + "=" + value2str(paramValues[i]));
        }
    }
    let instanceDef = name;
    if (constParams.length>0) {
        instanceDef += "\n";
        constParams.sort();
        instanceDef += constParams.join("\n");
    }

    const h = utils.fnvHash(instanceDef);
    return {h, instanceDef};
}

function value2str(v) {
    if (Array.isArray(v)) {
        let S="[";
        for (let i=0; i<v.length; i++) {
            if (i>0) S+=",";
            S+=value2str(v[i]);
        }
        return S;
    } else {
        return bigInt(v).toString();
    }
}
