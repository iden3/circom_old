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
    ctx.code = "";
    ctx.conditionalCodeHeader = "";
    ctx.tmpNames = {};
    ctx.getTmpName = getTmpName;
    ctx.codes_sizes = [];
    ctx.definedSizes = {};
    ctx.addSizes = addSizes;

    const entryTables = buildEntryTables(ctx);
    const code = buildCode(ctx);
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
    const globalNames = ctx.tmpNames;

    const fDefined = {};

    const functions = [];
    for (let f in ctx.functions) {
        ctx.scope = {};
        const paramsList = [];
        for (let p in ctx.functions[f].params) {
            const param = ctx.functions[f].params[p];
            paramsList.push("POINTER "+param.name);

            ctx.scope[param.name] = {
                type: "LOCAL",
                sels: param.sels,
                getter: () => { return param.name; },
            };
        }

        ctx.code += "void "+f+"(POINTER _ret, "+paramsList.join(",")+") {\n";

        ctx.code += gen(ctx, ctx.functions[f].block);
        ctx.code += "}";
    }

    for (let i=0; i<ctx.components.length; i++) {
        const h = hashComponentCall(ctx, i);
        const fName = ctx.components[i].template+"_"+h;
        if (!fDefined[fName]) {


            const scope = {_prefix : ""};
            ctx.scopes = [scope];
            ctx.conditionalCode = false;
            ctx.nScopes = 0;
            ctx.code = "";
            ctx.codeHeader = "// Header\n";
            ctx.codeFooter = "// Footer\n";
            ctx.tmpNames = Object.assign({},globalNames);

            for (let p in ctx.components[i].params) {
                newRef(ctx, "BIGINT", p, bigInt(ctx.components[i].params[p]));
            }

            gen(ctx, ctx.templates[ctx.components[i].template].block);

            const S = `void ${fName}(Circom_CalcWit *ctx) {\n` +
                        utils.ident(
                            ctx.codeHeader + "\n" +
                            ctx.code + "\n" +
                            ctx.codeFooter
                        ) +
                      "}\n";

            functions.push(S);
        }
        ctx.components[i].fnName = fName;
    }

    return functions.join("\n");
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
        if (typeof outIdx  == "undefined") continue;
        if (ctx.signals[i].e>=0) continue;     // If has an alias, continue..
        assert(outIdx<NVars);
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



function hashComponentCall(ctx, cIdx) {
    // TODO: At the moment generate a diferent function for each instance of the component
    return cIdx;
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

