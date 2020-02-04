const streamFromMultiArray = require("./stream_from_multiarray");
const bigInt = require("big-integer");
const utils = require("./utils");
const assert = require("assert");

function ref2src(c) {
    if (c[0] == "R") {
        return c[1];
    } else if (c[0] == "V") {
        return c[1].toString();
    } else if (c[0] == "C") {
        return `(ctx->circuit->constants + ${c[1]})`;
    } else if (c[0] == "CC") {
        return "__cIdx";
    } else {
        assert(false);
    }
}

class CodeBuilderC {
    constructor() {
        this.ops = [];
    }

    addComment(comment) {
        this.ops.push({op: "COMMENT", comment});
    }

    addBlock(block) {
        this.ops.push({op: "BLOCK", block});
    }

    calcOffset(dLabel, offsets) {
        this.ops.push({op: "CALCOFFSETS", dLabel, offsets});
    }

    assign(dLabel, src, sOffset) {
        this.ops.push({op: "ASSIGN", dLabel, src, sOffset});
    }

    getSubComponentOffset(dLabel, component, hash, hashLabel) {
        this.ops.push({op: "GETSUBCOMPONENTOFFSET", dLabel, component, hash, hashLabel});
    }

    getSubComponentSizes(dLabel, component, hash, hashLabel) {
        this.ops.push({op: "GETSUBCOMPONENTSIZES", dLabel, component, hash, hashLabel});
    }

    getSignalOffset(dLabel, component, hash, hashLabel) {
        this.ops.push({op: "GETSIGNALOFFSET", dLabel, component, hash, hashLabel});
    }

    getSignalSizes(dLabel, component, hash, hashLabel) {
        this.ops.push({op: "GETSIGNALSIZES", dLabel, component, hash, hashLabel});
    }

    setSignal(component, signal, value) {
        this.ops.push({op: "SETSIGNAL", component, signal, value});
    }

    getSignal(dLabel, component, signal) {
        this.ops.push({op: "GETSIGNAL", dLabel, component, signal});
    }

    copyN(dLabel, offset, src, n) {
        this.ops.push({op: "COPYN", dLabel, offset, src, n});
    }

    copyNRet(src, n) {
        this.ops.push({op: "COPYNRET", src, n});
    }

    fieldOp(dLabel, fOp, params) {
        this.ops.push({op: "FOP", dLabel, fOp, params});
    }

    ret() {
        this.ops.push({op: "RET"});
    }

    addLoop(condLabel, body) {
        this.ops.push({op: "LOOP", condLabel, body});
    }

    addIf(condLabel, thenCode, elseCode) {
        this.ops.push({op: "IF", condLabel, thenCode, elseCode});
    }

    fnCall(fnName, retLabel, params) {
        this.ops.push({op: "FNCALL", fnName, retLabel, params});
    }

    checkConstraint(a, b, strErr) {
        this.ops.push({op: "CHECKCONSTRAINT", a, b, strErr});
    }


    concat(cb) {
        this.ops.push(...cb.ops);
    }

    hasCode() {
        for (let i=0; i<this.ops.length; i++) {
            if (this.ops[i].op != "COMMENT") return true;
        }
        return false;
    }

    _buildOffset(offsets) {
        let rN=0;
        let S = "";
        offsets.forEach((o) => {
            if ((o[0][0] == "V") && (o[1][0]== "V")) {
                rN += o[0][1]*o[1][1];
                return;
            }
            let f="";
            if (o[0][0] == "V") {
                if (o[0][1]==0) return;
                f += o[0][1];
            } else if (o[0][0] == "RI") {
                if (o[0][1]==0) return;
                f += o[0][1];
            } else if (o[0][0] == "R") {
                f += `Fr_toInt(${o[0][1]})`;
            } else {
                assert(false);
            }
            if (o[1][0] == "V") {
                if (o[1][1]==0) return;
                if (o[1][1]>1) {
                    f += "*" + o[1][1];
                }
            } else if (o[1][0] == "RS") {
                f += `*${o[1][1]}[${o[1][2]}]`;
            } else {
                assert(false);
            }
            if (S!="") S+= " + ";
            S += f;
        });
        if (rN>0) {
            S = `${rN} + ${S}`;
        }
        return S;
    }

    build(code) {
        this.ops.forEach( (o) => {
            if (o.op == "COMMENT") {
                code.push(`/* ${o.comment} */`);
            } else if (o.op == "BLOCK") {
                const codeBlock=[];
                o.block.build(codeBlock);
                code.push(utils.ident(codeBlock));
            } else if (o.op == "CALCOFFSETS") {
                code.push(`${o.dLabel} = ${this._buildOffset(o.offsets)};`);
            } else if (o.op == "ASSIGN") {
                const oS = ref2src(o.sOffset);
                if (oS != "0") {
                    code.push(`${o.dLabel} = ${ref2src(o.src)} + ${oS};`);
                } else {
                    code.push(`${o.dLabel} = ${ref2src(o.src)};`);
                }
            } else if (o.op == "GETSUBCOMPONENTOFFSET") {
                code.push(`${o.dLabel} = ctx->getSubComponentOffset(${ref2src(o.component)}, 0x${o.hash}LL /* ${o.hashLabel} */);`);
            } else if (o.op == "GETSUBCOMPONENTSIZES") {
                code.push(`${o.dLabel} = ctx->getSubComponentSizes(${ref2src(o.component)}, 0x${o.hash}LL /* ${o.hashLabel} */);`);
            } else if (o.op == "GETSIGNALOFFSET") {
                code.push(`${o.dLabel} = ctx->getSignalOffset(${ref2src(o.component)}, 0x${o.hash}LL /* ${o.hashLabel} */);`);
            } else if (o.op == "GETSIGNALSIZES") {
                code.push(`${o.dLabel} = ctx->getSignalSizes(${ref2src(o.component)}, 0x${o.hash}LL /* ${o.hashLabel} */);`);
            } else if (o.op == "SETSIGNAL") {
                code.push(`ctx->setSignal(__cIdx, ${ref2src(o.component)}, ${ref2src(o.signal)}, ${ref2src(o.value)});`);
            } else if (o.op == "GETSIGNAL") {
                code.push(`ctx->getSignal(__cIdx, ${ref2src(o.component)}, ${ref2src(o.signal)}, ${o.dLabel});`);
            } else if (o.op == "COPYN") {
                const oS = ref2src(o.offset);
                const dLabel = (oS != "0") ? (o.dLabel + "+" + oS) : o.dLabel;
                code.push(`Fr_copyn(${dLabel}, ${ref2src(o.src)}, ${o.n});`);
            } else if (o.op == "COPYNRET") {
                code.push(`Fr_copyn(__retValue, ${ref2src(o.src)}, ${o.n});`);
            } else if (o.op == "RET") {
                code.push("goto returnFunc;");
            } else if (o.op == "FOP") {
                let paramsS = "";
                for (let i=0; i<o.params.length; i++) {
                    if (i>0) paramsS += ", ";
                    paramsS += ref2src(o.params[i]);
                }
                code.push(`Fr_${o.fOp}(${o.dLabel}, ${paramsS});`);
            } else if (o.op == "LOOP") {
                code.push(`while (Fr_isTrue(${o.condLabel})) {`);
                const body = [];
                o.body.build(body);
                code.push(utils.ident(body));
                code.push("}");
            } else if (o.op == "IF") {
                code.push(`if (Fr_isTrue(${o.condLabel})) {`);
                const thenCode = [];
                o.thenCode.build(thenCode);
                code.push(utils.ident(thenCode));
                if (o.elseCode) {
                    code.push("} else {");
                    const elseCode = [];
                    o.elseCode.build(elseCode);
                    code.push(utils.ident(elseCode));
                }
                code.push("}");
            } else if (o.op == "FNCALL") {
                code.push(`${o.fnName}(ctx, ${o.retLabel}, ${o.params.join(",")});`);
            } else if (o.op == "CHECKCONSTRAINT") {
                code.push(`ctx->checkConstraint(__cIdx, ${ref2src(o.a)}, ${ref2src(o.b)}, "${o.strErr}");`);
            }
        });
    }
}

class FunctionBuilderC {

    constructor(name, instanceDef, type) {
        this.name = name;
        this.instanceDef = instanceDef;
        this.type = type; // "COMPONENT" or "FUNCTIOM"
        this.definedFrElements = [];
        this.definedIntElements = [];
        this.definedSizeElements = [];
        this.definedPFrElements = [];
        this.initializedElements = [];
        this.initializedSignalOffset = [];
        this.initializedSignalSizes = [];

    }

    defineFrElements(dLabel, size) {
        this.definedFrElements.push({dLabel, size});
    }

    defineIntElement(dLabel) {
        this.definedIntElements.push({dLabel});
    }

    defineSizesElement(dLabel) {
        this.definedSizeElements.push({dLabel});
    }

    definePFrElement(dLabel) {
        this.definedPFrElements.push({dLabel});
    }

    initializeFrElement(dLabel, offset, idConstant) {
        this.initializedElements.push({dLabel, offset, idConstant});
    }

    initializeSignalOffset(dLabel, component, hash, hashLabel) {
        this.initializedSignalOffset.push({dLabel, component, hash, hashLabel});
    }

    initializeSignalSizes(dLabel, component, hash, hashLabel) {
        this.initializedSignalSizes.push({dLabel, component, hash, hashLabel});
    }

    setParams(params) {
        this.params = params;
    }

    _buildHeader(code) {
        this.definedFrElements.forEach( (o) => {
            code.push(`FrElement ${o.dLabel}[${o.size}];`);
        });
        this.definedIntElements.forEach( (o) => {
            code.push(`int ${o.dLabel};`);
        });
        this.definedSizeElements.forEach( (o) => {
            code.push(`Circom_Sizes ${o.dLabel};`);
        });
        this.definedPFrElements.forEach( (o) => {
            code.push(`PFrElement ${o.dLabel};`);
        });
        this.initializedElements.forEach( (o) => {
            code.push(`Fr_copy(&(${o.dLabel}[${o.offset}]), ctx->circuit->constants +${o.idConstant});`);
        });
        this.initializedSignalOffset.forEach( (o) => {
            code.push(`${o.dLabel} = ctx->getSignalOffset(${ref2src(o.component)}, 0x${o.hash}LL /* ${o.hashLabel} */);`);
        });
        this.initializedSignalSizes.forEach( (o) => {
            code.push(`${o.dLabel} = ctx->getSignalSizes(${ref2src(o.component)}, 0x${o.hash}LL /* ${o.hashLabel} */);`);
        });
    }

    _buildFooter(code) {
    }

    newCodeBuilder() {
        return new CodeBuilderC();
    }

    setBody(body) {
        this.body = body;
    }

    build(code) {
        code.push(
            "/*",
            this.instanceDef,
            "*/"
        );

        if (this.type=="COMPONENT") {
            code.push(`void ${this.name}(Circom_CalcWit *ctx, int __cIdx) {`);
        } else if (this.type=="FUNCTION") {
            let sParams = "";
            for (let i=0;i<this.params.length;i++ ) sParams += `, PFrElement ${this.params[i]}`;
            code.push(`void ${this.name}(Circom_CalcWit *ctx, PFrElement __retValue ${sParams}) {`);
        } else {
            assert(false);
        }

        const fnCode = [];
        this._buildHeader(fnCode);
        this.body.build(fnCode);
        if (this.type=="COMPONENT") {
            fnCode.push("ctx->finished(__cIdx);");
        } else if (this.type=="FUNCTION") {
            fnCode.push("returnFunc: ;");
        } else {
            assert(false);
        }
        this._buildFooter(fnCode);

        code.push(utils.ident(fnCode));
        code.push("}");
    }

}

class BuilderC {
    constructor() {
        this.hashMaps={};
        this.componentEntriesTables={};
        this.sizes ={};
        this.constants = [];
        this.functions = [];
        this.components = [];
    }

    setHeader(header) {
        this.header=header;
    }

    // ht is an array of 256 element that can be undefined or [Hash, Idx, KeyName] elements.
    addHashMap(name, hm) {
        this.hashMaps[name] = hm;
    }

    addComponentEntriesTable(name, cet) {
        this.componentEntriesTables[name] = cet;
    }

    addSizes(name, accSizes) {
        this.sizes[name] = accSizes;
    }

    addConstant(c) {
        this.constants.push(c);
        return this.constants.length - 1;
    }

    addFunction(fnBuilder) {
        this.functions.push(fnBuilder);
    }

    addComponent(component) {
        this.components.push(component);
    }

    setMapIsInput(map) {
        this.mapIsInput = map;
    }

    setWit2Sig(wit2sig) {
        this.wit2sig = wit2sig;
    }


    newComponentFunctionBuilder(name, instanceDef) {
        return new FunctionBuilderC(name, instanceDef, "COMPONENT");
    }

    newFunctionBuilder(name, instanceDef) {
        return new FunctionBuilderC(name, instanceDef, "FUNCTION");
    }


    // Body functions

    _buildHeader(code) {
        code.push(
            "#include \"circom.h\"",
            "#include \"calcwit.h\"",
            `#define NSignals ${this.header.NSignals}`,
            `#define NComponents ${this.header.NComponents}`,
            `#define NOutputs ${this.header.NOutputs}`,
            `#define NInputs ${this.header.NInputs}`,
            `#define NVars ${this.header.NVars}`,
            `#define __P__ "${this.header.P.toString()}"`,
            ""
        );
    }

    _buildHashMaps(code) {

        code.push("// Hash Maps ");
        for (let hmName in this.hashMaps ) {
            const hm = this.hashMaps[hmName];

            let c = `Circom_HashEntry ${hmName}[256] = {`;
            for (let i=0; i<256; i++) {
                c += i>0 ? "," : "";
                if (hm[i]) {
                    c += `{0x${hm[i][0]}LL, ${hm[i][1]}} /* ${hm[i][2]} */`;
                } else {
                    c += "{0,0}";
                }
            }
            c += "};";
            code.push(c);
        }

    }

    _buildComponentEntriesTables(code) {
        code.push("// Component Entry tables");
        for (let cetName in this.componentEntriesTables) {
            const cet = this.componentEntriesTables[cetName];

            code.push(`Circom_ComponentEntry ${cetName}[${cet.length}] = {`);
            for (let j=0; j<cet.length; j++) {
                const ty = cet[j].type == "S" ? "_typeSignal" : "_typeComponent";
                code.push(`    ${j>0?",":" "}{${cet[j].offset},${cet[j].sizeName}, ${ty}}`);
            }
            code.push("};");
        }
    }

    _buildSizes(code) {
        code.push("// Sizes");
        for (let sName in this.sizes) {
            const accSizes = this.sizes[sName];

            let c = `Circom_Size ${sName}[${accSizes.length}] = {`;
            for (let i=0; i<accSizes.length; i++) {
                if (i>0) c += ",";
                c += accSizes[i];
            }
            c += "};";
            code.push(c);
        }
    }

    _buildConstants(code) {
        const self = this;
        const n64 = Math.floor((self.header.P.bitLength() - 1) / 64)+1;
        const R = bigInt.one.shiftLeft(n64*64);

        code.push("// Constants");
        code.push(`FrElement _constants[${self.constants.length}] = {`);
        for (let i=0; i<self.constants.length; i++) {
            code.push((i>0 ? "," : " ") + "{" + number2Code(self.constants[i]) + "}");
        }
        code.push("};");

        function number2Code(n) {
            if (n.lt(bigInt("80000000", 16)) ) {
                return addShortMontgomeryPositive(n);
            }
            if (n.geq(self.header.P.minus(bigInt("80000000", 16))) ) {
                return addShortMontgomeryNegative(n);
            }
            return addLongMontgomery(n);


            function addShortMontgomeryPositive(a) {
                return `${a.toString()}, 0x40000000, { ${getLongString(toMontgomery(a))} }`;
            }


            function addShortMontgomeryNegative(a) {
                const b = a.minus(self.header.P);
                return `${b.toString()}, 0x40000000, { ${getLongString(toMontgomery(a))} }`;
            }

            function addLongMontgomery(a) {
                return `0, 0xC0000000, { ${getLongString(toMontgomery(a))} }`;
            }

            function getLongString(a) {
                let r = bigInt(a);
                let S = "";
                let i = 0;
                while (!r.isZero()) {
                    if (S!= "") S = S+",";
                    S += "0x" + r.and(bigInt("FFFFFFFFFFFFFFFF", 16)).toString(16) + "LL";
                    i++;
                    r = r.shiftRight(64);
                }
                while (i<n64) {
                    if (S!= "") S = S+",";
                    S += "0LL";
                    i++;
                }
                return S;
            }

            function toMontgomery(a) {
                return a.times(R).mod(self.header.P);
            }

        }
    }

    _buildFunctions(code) {
        for (let i=0; i<this.functions.length; i++) {
            const cfb = this.functions[i];
            cfb.build(code);
        }
    }

    _buildComponents(code) {
        code.push("// Components");
        code.push(`Circom_Component _components[${this.components.length}] = {`);
        for (let i=0; i<this.components.length; i++) {
            const c = this.components[i];
            const sep = i>0 ? "    ," : "     ";
            code.push(`${sep}{${c.hashMapName}, ${c.entryTableName}, ${c.functionName}, ${c.nInSignals}, ${c.newThread}}`);
        }
        code.push("};");
    }

    _buildMapIsInput(code) {
        code.push("// mapIsInput");
        code.push(`u32 _mapIsInput[${this.mapIsInput.length}] = {`);
        let line = "";
        for (let i=0; i<this.mapIsInput.length; i++) {
            line += i>0 ? ", " : "  ";
            line += toHex(this.mapIsInput[i]);
            if (((i+1) % 64)==0) {
                code.push("    "+line);
                line = "";
            }
        }
        if (line != "") code.push("    "+line);
        code.push("};");

        function toHex(number) {
            if (number < 0) number = 0xFFFFFFFF + number + 1;
            let S=number.toString(16).toUpperCase();
            while (S.length<8) S = "0" + S;
            return "0x"+S;
        }
    }

    _buildWit2Sig(code) {
        code.push("// Witness to Signal Table");
        code.push(`int _wit2sig[${this.wit2sig.length}] = {`);
        let line = "";
        for (let i=0; i<this.wit2sig.length; i++) {
            line += i>0 ? "," : " ";
            line += this.wit2sig[i];
            if (((i+1) % 64) == 0) {
                code.push("    "+line);
                line = "";
            }
        }
        if (line != "") code.push("    "+line);
        code.push("};");
    }

    _buildCircuitVar(code) {

        code.push(
            "// Circuit Variable",
            "Circom_Circuit _circuit = {" ,
            "   NSignals,",
            "   NComponents,",
            "   NInputs,",
            "   NOutputs,",
            "   NVars,",
            "   _wit2sig,",
            "   _components,",
            "   _mapIsInput,",
            "   _constants,",
            "   __P__",
            "};"
        );
    }


    build() {
        const code=[];
        this._buildHeader(code);
        this._buildSizes(code);
        this._buildConstants(code);
        this._buildHashMaps(code);
        this._buildComponentEntriesTables(code);
        this._buildFunctions(code);
        this._buildComponents(code);
        this._buildMapIsInput(code);
        this._buildWit2Sig(code);
        this._buildCircuitVar(code);
        return streamFromMultiArray(code);
    }
}


module.exports = BuilderC;
