const utils = require("../../src/utils");
const assert = require("assert");
const Scalar = require("ffjavascript").Scalar;
const F1Field = require("ffjavascript").F1Field;
const BigArray = require("../../src/bigarray");

function ref2src(c) {
    if ((c[0] == "R")||(c[0] == "RI")) {
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

    getSignal(dLabel, component, signal, n) {
        if (typeof(n) == "undefined") n=1;
        this.ops.push({op: "GETSIGNAL", dLabel, component, signal, n});
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

    checkAssert(a, strErr) {
        this.ops.push({op: "CHECKASSERT", a, strErr});
    }

    log(val) {
        this.ops.push({op: "LOG", val});
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
                code.push(`ctx->multiGetSignal(__cIdx, ${ref2src(o.component)}, ${ref2src(o.signal)}, ${o.dLabel}, ${o.n});`);
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
            } else if (o.op == "CHECKASSERT") {
                code.push(`ctx->checkAssert(__cIdx, ${ref2src(o.a)}, "${o.strErr}");`);
            } else if (o.op == "LOG") {
                code.push(`ctx->log(${ref2src(o.val)});`);
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
    constructor(p, verbose) {
        this.F = new F1Field(p);

        this.hashMaps={};
        this.componentEntriesTables=new BigArray();
        this.sizes ={};
        this.constants = [];
        this.functions = [];
        this.components = new BigArray();
        this.usedConstants = {};
        this.verbose = verbose;


        this.sizePointers = {};
        this.hashMapPointers = {};
        this.functionIdx = {};
        this.nCets = 0;
    }

    setHeader(header) {
        this.header=header;
    }

    // ht is an array of 256 element that can be undefined or [Hash, Idx, KeyName] elements.
    addHashMap(name, hm) {
        this.hashMaps[name] = hm;
    }

    addComponentEntriesTable(name, cet, idComponent) {
        this.componentEntriesTables[idComponent] = {
            name: name,
            cet: cet
        };
    }

    addSizes(name, accSizes) {
        this.sizes[name] = accSizes;
    }

    addConstant(c) {
        c = this.F.e(c);
        const cS = c.toString();
        if (typeof this.usedConstants[cS] != "undefined") return this.usedConstants[cS];
        this.constants.push(c);
        this.usedConstants[cS] = this.constants.length - 1;
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
            "#include \"circom.hpp\"",
            "#include \"calcwit.hpp\"",
            `#define NSignals ${this.header.NSignals}`,
            `#define NComponents ${this.header.NComponents}`,
            `#define NOutputs ${this.header.NOutputs}`,
            `#define NInputs ${this.header.NInputs}`,
            `#define NVars ${this.header.NVars}`,
            `#define NPublic ${this.header.NPublic}`,
            `#define __P__ "${this.header.P.toString()}"`,
            ""
        );
    }

    async _buildHashMaps(fdData) {

        while (fdData.pos % 8) fdData.pos++;
        this.pHashMaps = fdData.pos;

        const buff = new Uint8Array(256*12);
        const buffV = new DataView(buff.buffer);
        for (let hmName in this.hashMaps ) {

            while (fdData.pos % 8) fdData.pos++;
            this.hashMapPointers[hmName] = fdData.pos;
            const hm = this.hashMaps[hmName];

            for (let i=0; i<256; i++) {
                buffV.setUint32(i*12, hm[i] ? parseInt( hm[i][0].slice(8), 16 ) : 0, true);
                buffV.setUint32(i*12+4, hm[i] ? parseInt( hm[i][0].slice(0,8), 16 ) : 0, true);
                buffV.setUint32(i*12+8, hm[i] ? hm[i][1] : 0, true);
            }

            await fdData.write(buff);
        }

    }

    async _buildComponentEntriesTables(fdData) {

        while (fdData.pos % 8) fdData.pos++;
        this.pCets = fdData.pos;
        for (let i=0; i< this.componentEntriesTables.length; i++) {
            if ((this.verbose)&&(i%100000 ==0)) console.log(`_buildComponentEntriesTables ${i}/${this.componentEntriesTables.length}`);
            const cet = this.componentEntriesTables[i].cet;

            this.components[i].entryTablePointer = fdData.pos;
            const buff = new Uint8Array(16*cet.length);
            const buffV = new DataView(buff.buffer);

            for (let j=0; j<cet.length; j++) {
                utils.setUint64(buffV, 16*j+0, this.sizePointers[ cet[j].sizeName]);
                buffV.setUint32(16*j+8, cet[j].offset, true);
                buffV.setUint32(16*j+12, cet[j].type == "S" ? 0 : 1, true);  // Size type 0-> Signal, 1->Component
                this.nCets ++;
            }

            await fdData.write(buff);

        }
    }

    async _buildSizes(fdData) {
        for (let sName in this.sizes) {
            const accSizes = this.sizes[sName];

            while (fdData.pos % 8) fdData.pos++;
            this.sizePointers[sName] = fdData.pos;

            const buff = new Uint8Array(4*accSizes.length);
            const buffV = new DataView(buff.buffer);
            for (let i=0; i<accSizes.length; i++) {
                buffV.setUint32(i*4, accSizes[i], true);
            }
            await fdData.write(buff);
        }
    }


    async _buildConstants(fdData) {
        const self = this;

        const frSize = (8 + self.F.n64*8);
        const buff = new Uint8Array(self.constants.length* frSize);
        const buffV = new DataView(buff.buffer);


        while (fdData.pos % 8) fdData.pos++;
        this.pConstants = fdData.pos;

        let o = 0;
        for (let i=0; i<self.constants.length; i++) {
            Fr2Bytes(buffV, o, self.constants[i]);
            o += frSize;
        }
        await fdData.write(buff);


        function Fr2Bytes(buffV, offset, n) {
            const minShort = self.F.neg(self.F.e("80000000"));
            const maxShort = self.F.e("7FFFFFFF", 16);

            if (  (self.F.geq(n, minShort))
                &&(self.F.leq(n, maxShort)))
            {
                if (self.F.geq(n, self.F.zero)) {
                    return shortMontgomeryPositive(n);
                } else {
                    return shortMontgomeryNegative(n);
                }
            }

            return longMontgomery(n);


            function shortMontgomeryPositive(a) {
                buffV.setUint32(offset, Scalar.toNumber(a) , true );
                buffV.setUint32(offset + 4, 0x40000000 , true );
                long(buffV, offset + 8, toMontgomery(a));
            }


            function shortMontgomeryNegative(a) {
                const b = -Scalar.toNumber(self.F.neg(a));
                buffV.setUint32(offset, b , true );
                buffV.setUint32(offset + 4, 0x40000000 , true );
                long(buffV, offset + 8, toMontgomery(a));
            }

            function longMontgomery(a) {
                buffV.setUint32(offset, 0 , true );
                buffV.setUint32(offset + 4, 0xC0000000 , true );
                long(buffV, offset + 8, toMontgomery(a));
            }

            function long(buffV, offset, a) {

                let p = offset;
                const arr = Scalar.toArray(a, 0x100000000);
                for (let i=0; i<self.F.n64*2; i++) {
                    const idx = arr.length-1-i;

                    if ( idx >=0) {
                        buffV.setUint32(p, arr[idx], true);
                    } else {
                        buffV.setUint32(p, 0, true);
                    }
                    p+= 4;
                }
            }

            function toMontgomery(a) {
                return self.F.mul(a, self.F.R);
            }

        }

    }

    _buildFunctions(code) {
        const listedFunctions = [];
        for (let i=0; i<this.functions.length; i++) {
            const cfb = this.functions[i];
            cfb.build(code);
            if (this.functions[i].type == "COMPONENT") {
                this.functionIdx[this.functions[i].name] = listedFunctions.length;
                listedFunctions.push(i);
            }
        }

        code.push("// Function Table");
        code.push(`Circom_ComponentFunction _functionTable[${listedFunctions.length}] = {`);
        for (let i=0; i<listedFunctions.length; i++) {
            const sep = i>0 ? "    ," : "     ";
            code.push(`${sep}${this.functions[listedFunctions[i]].name}`);
        }
        code.push("};");
    }


    async _buildComponents(fdData) {

        const buff = new Uint8Array(32);
        const buffV = new DataView(buff.buffer);

        while (fdData.pos % 8) fdData.pos++;
        this.pComponents = fdData.pos;

        for (let i=0; i<this.components.length; i++) {
            if ((this.verbose)&&(i%1000000 ==0)) console.log(`_buildComponents ${i}/${this.components.length}`);
            const c = this.components[i];

            utils.setUint64(buffV, 0, this.hashMapPointers[c.hashMapName], true);
            utils.setUint64(buffV, 8, c.entryTablePointer, true);
            utils.setUint64(buffV, 16, this.functionIdx[c.functionName], true);
            buffV.setUint32(24, c.nInSignals, true);
            buffV.setUint32(28, c.newThread ? 1 : 0, true);

            await fdData.write(buff);
        }
    }

    async _buildMapIsInput(fdData) {

        const buff = new Uint8Array(this.mapIsInput.length * 4);
        const buffV = new DataView(buff.buffer);

        while (fdData.pos % 8) fdData.pos++;
        this.pMapIsInput = fdData.pos;

        for (let i=0; i<this.mapIsInput.length; i++) {
            if ((this.verbose)&&(i%1000000 ==0)) console.log(`_buildMapIsInput ${i}/${this.mapIsInput.length}`);

            buffV.setUint32(4*i, this.mapIsInput[i], true);
        }

        await fdData.write(buff);
    }

    async _buildWit2Sig(fdData) {

        const buff = new Uint8Array(this.wit2sig.length * 4);
        const buffV = new DataView(buff.buffer);

        while (fdData.pos % 8) fdData.pos++;
        this.pWit2Sig = fdData.pos;

        for (let i=0; i<this.wit2sig.length; i++) {
            if ((this.verbose)&&(i%1000000 ==0)) console.log(`_buildWit2Sig ${i}/${this.wit2sig.length}`);

            buffV.setUint32(4*i, this.wit2sig[i], true);
        }

        await fdData.write(buff);
    }

    async _buildCircuitVar(fdData) {

        const buff = new Uint8Array(76);
        const buffV = new DataView(buff.buffer);

        utils.setUint64(buffV, 0, this.pWit2Sig, true);
        utils.setUint64(buffV, 8, this.pComponents, true);
        utils.setUint64(buffV, 16, this.pMapIsInput, true);
        utils.setUint64(buffV, 24, this.pConstants, true);
        utils.setUint64(buffV, 32, this.pPriemStr, true);
        utils.setUint64(buffV, 40, this.pCets, true);

        buffV.setUint32(48, this.header.NSignals, true);
        buffV.setUint32(52, this.header.NComponents, true);
        buffV.setUint32(56, this.header.NOutputs, true);
        buffV.setUint32(60, this.header.NInputs, true);
        buffV.setUint32(64, this.header.NVars, true);
        buffV.setUint32(68, this.nCets, true);
        buffV.setUint32(72, this.header.NPublic, true);

        fdData.pos = 0;

        await fdData.write(buff);
    }

    async _buildPrimeStr(fdData) {
        this.pPriemStr = fdData.pos;
        const strBuff = new TextEncoder("utf-8").encode(this.header.P.toString());
        await fdData.write(strBuff);

        const zB = new Uint8Array(1);
        zB[0] =0;
        await fdData.write(zB);
    }


    async build(fdCode, fdData) {
        const encoder = new TextEncoder("utf-8");
        fdData.pos = 76;
        while (fdData.pos % 8) fdData.pos++;

        const code=new BigArray();
        this._buildHeader(code);
        await this._buildPrimeStr(fdData);
        await this._buildSizes(fdData);
        await this._buildConstants(fdData);
        await this._buildHashMaps(fdData);
        await this._buildComponentEntriesTables(fdData);
        this._buildFunctions(code);
        await this._buildComponents(fdData);
        await this._buildMapIsInput(fdData);
        await this._buildWit2Sig(fdData);
        await this._buildCircuitVar(fdData);
        await writeCode(code);

        async function writeCode(c) {
            if (c.push) {
                for (let i=0; i<c.length; i++) {
                    await writeCode(c[i]);
                }
            } else if (typeof c === "string") {
                await fdCode.write(encoder.encode(c + "\n"));
            }
        }
    }
}


module.exports = BuilderC;
