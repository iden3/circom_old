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
const gen = require("./gencode").gen;
const createRefs = require("./gencode").createRefs;

module.exports =  build;


function build(ctx) {
    ctx.definedFunctions = {};
    ctx.functionCodes = [];
    ctx.buildFunction = buildFunction;
    ctx.conditionalCodeHeader = "";
    ctx.codes_sizes = [];
    ctx.definedSizes = {};
    ctx.addSizes = addSizes;
    ctx.constantsMap = {};
    ctx.addConstant = addConstant;
    ctx.addConstant(bigInt.zero);
    ctx.addConstant(bigInt.one);

    buildHeader(ctx);
    buildEntryTables(ctx);
    ctx.globalNames = ctx.uniqueNames;

    buildCode(ctx);

    buildComponentsArray(ctx);

    buildMapIsInput(ctx);
    buildWit2Sig(ctx);

}

function buildEntryTables(ctx) {

    const codes_hashMaps = [];
    const codes_componentEntries = [];
    const definedHashMaps = {};
    for (let i=0; i<ctx.components.length; i++) {
        const {htName, htMap} = addHashTable(i);

        let code = "";
        const componentEntriesTableName = ctx.getUniqueName("_entryTable" + ctx.components[i].template);

        const componentEntriesTable = [];
        for (let j=0; j<htMap.length; j++) {
            const entry = ctx.components[i].names.o[htMap[j]];
            const sizeName = ctx.addSizes(entry.sizes);
            componentEntriesTable.push({
                offset: entry.offset,
                sizeName: sizeName,
                type: entry.type
            });
        }

        ctx.builder.addComponentEntriesTable(componentEntriesTableName, componentEntriesTable);


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


    return [
        "// HashMaps\n" ,
        codes_hashMaps , "\n" ,
        "\n" ,
        "// Component Entries\n" ,
        codes_componentEntries , "\n" ,
        "\n"
    ];

    function addHashTable(cIdx) {
        const keys = Object.keys(ctx.components[cIdx].names.o);
        assert(keys.length<128);
        keys.sort((a,b) => ((a>b) ? 1 : -1));
        const h = utils.fnvHash(keys.join(","));
        if (definedHashMaps[h]) return definedHashMaps[h];
        definedHashMaps[h] = {};
        definedHashMaps[h].htName = ctx.getUniqueName("_ht"+ctx.components[cIdx].template);
        definedHashMaps[h].htMap = [];
        const t = [];
        for (let i=0; i<keys.length; i++) {
            definedHashMaps[h].htMap[i] = keys[i];

            const h2 = utils.fnvHash(keys[i]);
            let pos = parseInt(h2.slice(-2), 16);
            while (t[pos]) pos = (pos + 1) % 256;
            t[pos] = [h2, i, keys[i]];
        }
        ctx.builder.addHashMap(definedHashMaps[h].htName, t);

        return definedHashMaps[h];
    }
}

function buildCode(ctx) {

    const fDefined = {};

    const fnComponents = [];
    for (let i=0; i<ctx.components.length; i++) {
        const {h, instanceDef} = hashComponentCall(ctx, i);
        const fName = ctx.components[i].template+"_"+h;
        if (!fDefined[fName]) {


            ctx.scopes = [{}];
            ctx.conditionalCode = false;
            ctx.fnBuilder = ctx.builder.newComponentFunctionBuilder(fName, instanceDef);
            ctx.codeBuilder = ctx.fnBuilder.newCodeBuilder();
            ctx.uniqueNames = Object.assign({},ctx.globalNames);
            ctx.refs = [];
            ctx.fileName = ctx.templates[ctx.components[i].template].fileName;
            ctx.filePath = ctx.templates[ctx.components[i].template].filePath;
            ctx.getSignalSizesCache = {};
            ctx.getSignalOffsetCache = {};

            for (let p in ctx.components[i].params) {
                if (ctx.scopes[0][p]) return ctx.throwError(`Repeated parameter at ${ctx.components[i].template}: ${p}`);
                const refId = ctx.refs.length;
                ctx.refs.push({
                    type: "BIGINT",
                    used: false,
                    value: utils.flatArray(ctx.components[i].params[p]),
                    sizes: utils.accSizes(utils.extractSizes(ctx.components[i].params[p])),
                    label: ctx.getUniqueName(p)
                });
                ctx.scopes[0][p] = refId;
            }

            createRefs(ctx, ctx.templates[ctx.components[i].template].block);
            if (ctx.error) return;

            gen(ctx, ctx.templates[ctx.components[i].template].block);
            if (ctx.error) return;

            ctx.fnBuilder.setBody(ctx.codeBuilder);

            ctx.builder.addFunction(ctx.fnBuilder);

            fDefined[fName] = true;
        }
        ctx.components[i].fnName = fName;
    }

    return fnComponents;
}

function buildComponentsArray(ctx) {
    for (let i=0; i< ctx.components.length; i++) {
        let newThread;
        if (ctx.newThreadTemplates) {
            if (ctx.newThreadTemplates.test(ctx.components[i].template)) {
                newThread = true;
            } else {
                newThread = false;
            }
        } else {
            newThread = false;
        }
        ctx.builder.addComponent({
            hashMapName: ctx.components[i].htName,
            entryTableName: ctx.components[i].etName,
            functionName: ctx.components[i].fnName,
            nInSignals: ctx.components[i].nInSignals,
            newThread: newThread
        });
    }
}


function buildHeader(ctx) {
    ctx.builder.setHeader({
        NSignals: ctx.signals.length,
        NComponents: ctx.components.length,
        NInputs: ctx.components[ ctx.getComponentIdx("main") ].nInSignals,
        NOutputs: ctx.totals[ ctx.stOUTPUT ],
        NVars: ctx.totals[ctx.stONE] + ctx.totals[ctx.stOUTPUT] + ctx.totals[ctx.stPUBINPUT] + ctx.totals[ctx.stPRVINPUT] + ctx.totals[ctx.stINTERNAL],
        P: ctx.field.p
    });
}

function buildMapIsInput(ctx) {
    let i;
    let map = [];
    let acc = 0;
    for (i=0; i<ctx.signals.length; i++) {
        if (ctx.signals[i].o & ctx.IN) {
            acc = acc | (1 << (i%32) );
        }
        if ((i+1)%32==0) {
            map.push(acc);
            acc = 0;
        }
    }
    if ((i%32) != 0) {
        map.push(acc);
    }

    ctx.builder.setMapIsInput(map);
}



function buildWit2Sig(ctx) {
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

    ctx.builder.setWit2Sig(arr);
}



function addSizes(_sizes) {
    const sizes = _sizes || [];
    let name = "sizes";
    for (let i=0; i<sizes.length;i++) {
        name+="_"+sizes[i];
    }
    if (name=="sizes") name="sizes_0";

    if (this.definedSizes[name]) return this.definedSizes[name];
    const labelName = this.getUniqueName(name);
    this.definedSizes[name] = labelName;

    const accSizes = utils.accSizes(sizes);

    this.builder.addSizes(labelName, accSizes);

    let code = `Circom_Size ${labelName}[${accSizes.length}] = {`;
    for (let i=0; i<accSizes.length; i++) {
        if (i>0) code += ",";
        code += accSizes[i];
    }
    code += "};\n";
    this.codes_sizes.push(code);

    return labelName;
}

function addConstant(c) {
    c = bigInt(c);
    const s = c.toString();
    if (typeof (this.constantsMap[s]) !== "undefined") return this.constantsMap[s];
    const cIdx = this.builder.addConstant(c);
    this.constantsMap[s] = cIdx;
    return cIdx;
}

function buildFunction(name, paramValues) {
    const ctx = this;
    const {h, instanceDef} = hashFunctionCall(ctx, name, paramValues);

    if (ctx.definedFunctions[h]) return ctx.definedFunctions[h];

    const res = {
        fnName: `${name}_${h}`
    };

    const oldRefs = ctx.refs;
    const oldConditionalCode = ctx.conditionalCode;
    const oldCodeBuilder = ctx.codeBuilder;
    const oldFnBuilder = ctx.fnBuilder;

    const oldUniqueNames = ctx.uniqueNames;
    const oldFileName = ctx.fileName;
    const oldFilePath = ctx.oldFilePath;
    const oldReturnSizes = ctx.returnSizes;
    const oldReturnValue = ctx.returnValue;


    ctx.scopes = [{}];
    ctx.refs = [];
    ctx.conditionalCode = false;
    ctx.fnBuilder = ctx.builder.newFunctionBuilder(`${name}_${h}`, instanceDef);
    ctx.codeBuilder = ctx.fnBuilder.newCodeBuilder();
    ctx.uniqueNames = Object.assign({},ctx.globalNames);
    ctx.returnValue = null;
    ctx.returnSizes = null;
    ctx.fileName = ctx.functions[name].fileName;
    ctx.filePath = ctx.functions[name].filePath;

    let paramLabels = [];

    for (let i=0; i<ctx.functions[name].params.length; i++) {

        if (paramValues[i].used) {
            paramLabels.push(ctx.functions[name].params[i]);
            const idRef = ctx.refs.length;
            ctx.refs.push({
                type: "BIGINT",
                used: true,
                sizes: paramValues[i].sizes,
                label: ctx.functions[name].params[i],
            });
            ctx.scopes[0][ctx.functions[name].params[i]] = idRef;
        } else {
            const idRef = ctx.refs.length;
            ctx.refs.push({
                type: "BIGINT",
                used: false,
                sizes: paramValues[i].sizes,
                label: ctx.functions[name].params[i],
                value: paramValues[i].value
            });
            ctx.scopes[0][ctx.functions[name].params[i]] = idRef;
        }
    }

    ctx.fnBuilder.setParams(paramLabels);

    createRefs(ctx, ctx.functions[name].block);
    if (ctx.error) return;

    gen(ctx, ctx.functions[name].block);
    if (ctx.error) return;

    if (ctx.returnValue == null) {
        if (ctx.returnSizes ==  null) assert(false, `Funciont ${name} does not return any value`);

        ctx.fnBuilder.setBody(ctx.codeBuilder);
        ctx.builder.addFunction(ctx.fnBuilder);

        res.type = "VARVAL_CONSTSIZE";
        res.returnSizes = ctx.returnSizes;
    } else {
        res.type = "CONSTVAL";
        res.returnValue = ctx.returnValue;
        res.returnSizes = ctx.returnSizes;
    }

    ctx.refs = oldRefs;
    ctx.conditionalCode = oldConditionalCode;
    ctx.codeBuilder = oldCodeBuilder;
    ctx.fnBuilder = oldFnBuilder;
    ctx.uniqueNames = oldUniqueNames;
    ctx.fileName = oldFileName;
    ctx.filePath = oldFilePath;
    ctx.returnSizes = oldReturnSizes;
    ctx.returnValue = oldReturnValue;

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
            constParams.push(ctx.functions[name].params[i] + utils.accSizes2Str(paramValues[i].sizes) + "=" + value2str(paramValues[i].value));
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
        S+="]";
        return S;
    } else {
        return bigInt(v).toString();
    }
}
