const assert = require("assert");
const ModuleBuilder = require("wasmbuilder").ModuleBuilder;
const ModuleBuilderWat = require("wasmbuilder").ModuleBuilderWat;
const buildRuntime = require("./build_runtime");
const Scalar = require("ffjavascript").Scalar;
const F1Field = require("ffjavascript").F1Field;


const errs = require("./errs");

function hexToBytesR(hex) {
    for (var bytes = [], c = hex.length-2; c >=0;  c -= 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}


function intToBytes32(v) {
    return [ v &0xFF, (v>>8) & 0xFF,  (v>>16) & 0xFF, (v>>24) & 0xFF ];
}


class CodeBuilderWasm {
    constructor(fnBuilder) {
        this.fnBuilder = fnBuilder;
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
        if (typeof n == "undefined") n=1;
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

    concat(cb) {
        this.ops.push(...cb.ops);
    }

    log(val) {
        this.ops.push({op: "LOG", val});
    }

    hasCode() {
        for (let i=0; i<this.ops.length; i++) {
            if (this.ops[i].op != "COMMENT") return true;
        }
        return false;
    }


    _buildOffset(c, offsets) {
        let rN=0;
        let S = null;
        offsets.forEach((o) => {
            if ((o[0][0] == "V") && (o[1][0]== "V")) {
                rN += o[0][1]*o[1][1];
                return;
            }
            let f=[];
            if (o[0][0] == "V") {
                f = c.i32_const(o[0][1]);
            } else if (o[0][0] == "RI") {
                f = c.i32_load(this.fnBuilder._getPtr(c, o[0][1]));
            } else if (o[0][0] == "R") {
                f = c.call("Fr_toInt", this.fnBuilder._getPtr(c, o[0][1]));
            } else {
                assert(false);
            }
            if (o[1][0] == "V") {
                if (o[1][1]==0) return;
                if (o[1][1]>1) {
                    f = c.i32_mul(f, c.i32_const(o[1][1]));
                }
            } else if (o[1][0] == "RS") {
                f = c.i32_mul(
                    f,
                    c.i32_load(
                        c.i32_add(
                            c.i32_load(this.fnBuilder._getPtr(c, o[1][1])),
                            c.i32_const(o[1][2]*4)
                        )
                    )
                );
            } else {
                assert(false);
            }
            if (S!=null) {
                S = c.i32_add( S, f);
            } else {
                S = f;
            }
        });
        if (rN>0) {
            if (S!=null) {
                S = c.i32_add( S, c.i32_const(rN));
            } else {
                S = c.i32_const(rN);
            }
        }
        return S;
    }

    build(c) {
        const code = [];
        this.ops.forEach( (o) => {
            if (o.op == "COMMENT") {
                code.push(
                    c.comment(o.comment)
                );
                // DO nothing
            } else if (o.op == "BLOCK") {
                code.push(
                    o.block.build(c)
                );
            } else if (o.op == "CALCOFFSETS") {
                code.push(
                    c.i32_store(
                        this.fnBuilder._getPtr(c, o.dLabel),
                        this._buildOffset(c, o.offsets)
                    )
                );
            } else if (o.op == "ASSIGN") {
                code.push(
                    c.i32_store(
                        this.fnBuilder._getPtr(c, o.dLabel),
                        c.i32_add(
                            this.fnBuilder._deRefFr(c, o.src),
                            c.i32_mul(
                                this.fnBuilder._deRefInt(c, o.sOffset),
                                c.i32_const(this.fnBuilder.builder.sizeFr)
                            )
                        )
                    )
                );
            } else if (o.op == "GETSUBCOMPONENTOFFSET") {
                code.push(
                    c.call(
                        "getSubComponentOffset",
                        this.fnBuilder._getPtr(c, o.dLabel),
                        this.fnBuilder._deRefInt(c, o.component),
                        c.i64_const("0x" + o.hash)
                    )
                );
            } else if (o.op == "GETSUBCOMPONENTSIZES") {
                code.push(
                    c.call(
                        "getSubComponentSizes",
                        this.fnBuilder._getPtr(c, o.dLabel),
                        this.fnBuilder._deRefInt(c, o.component),
                        c.i64_const("0x" + o.hash)
                    )
                );
            } else if (o.op == "GETSIGNALOFFSET") {
                code.push(
                    c.call(
                        "getSignalOffset",
                        this.fnBuilder._getPtr(c, o.dLabel),
                        this.fnBuilder._deRefInt(c, o.component),
                        c.i64_const("0x" + o.hash)
                    )
                );
            } else if (o.op == "GETSIGNALSIZES") {
                code.push(
                    c.call(
                        "getSignalSizes",
                        this.fnBuilder._getPtr(c, o.dLabel),
                        this.fnBuilder._deRefInt(c, o.component),
                        c.i64_const("0x" + o.hash)
                    )
                );
            } else if (o.op == "SETSIGNAL") {
                code.push(
                    c.call(
                        "setSignal",
                        c.getLocal("cIdx"),
                        this.fnBuilder._deRefInt(c, o.component),
                        this.fnBuilder._deRefInt(c, o.signal),
                        this.fnBuilder._deRefFr(c, o.value)
                    )
                );
            } else if (o.op == "GETSIGNAL") {
                code.push(
                    c.call(
                        "multiGetSignal",
                        c.getLocal("cIdx"),
                        this.fnBuilder._getPtr(c, o.dLabel),
                        this.fnBuilder._deRefInt(c, o.component),
                        this.fnBuilder._deRefInt(c, o.signal),
                        c.i32_const(o.n)
                    )
                );
            } else if (o.op == "COPYN") {
                code.push(
                    c.call(
                        "Fr_copyn",
                        c.i32_add(
                            this.fnBuilder._getPtr(c, o.dLabel),
                            c.i32_mul(
                                this.fnBuilder._deRefInt(c, o.offset),
                                c.i32_const(this.fnBuilder.builder.sizeFr)
                            )
                        ),
                        this.fnBuilder._deRefFr(c, o.src),
                        c.i32_const(o.n)
                    )
                );
            } else if (o.op == "COPYNRET") {
                code.push(
                    c.call(
                        "Fr_copyn",
                        c.getLocal("pRet"),
                        this.fnBuilder._deRefFr(c, o.src),
                        c.i32_const(o.n)
                    )
                );
            } else if (o.op == "RET") {
                code.push(this.fnBuilder._freeStack(c));
                code.push(c.ret([]));
            } else if (o.op == "FOP") {
                let params = [];
                for (let i=0; i<o.params.length; i++) {
                    params.push(  this.fnBuilder._deRefFr(c, o.params[i]));
                }
                code.push(
                    c.call(
                        "Fr_" + o.fOp,
                        this.fnBuilder._getPtr(c, o.dLabel),
                        ...params
                    )
                );
            } else if (o.op == "LOOP") {
                code.push(
                    c.block(c.loop(
                        c.br_if(1, c.i32_eqz(c.call("Fr_isTrue", this.fnBuilder._deRefFr(c, ["R", o.condLabel])))),
                        o.body.build(c),
                        c.br(0)
                    ))
                );
            } else if (o.op == "IF") {
                code.push(
                    c.if(
                        c.call("Fr_isTrue", this.fnBuilder._deRefFr(c, ["R", o.condLabel])),
                        o.thenCode.build(c),
                        o.elseCode ? o.elseCode.build(c) : undefined
                    )
                );
            } else if (o.op == "FNCALL") {
                const params = [];
                for (let i=0; i<o.params.length; i++) {
                    params.push(this.fnBuilder._deRefFr(c, ["R", o.params[i]]));
                }
                code.push(
                    c.call(
                        o.fnName,
                        this.fnBuilder._getPtr(c, o.retLabel),
                        ...params
                    )
                );
            } else if (o.op == "CHECKCONSTRAINT") {
                code.push(
                    c.call(
                        "checkConstraint",
                        c.getLocal("cIdx"),
                        this.fnBuilder._deRefFr(c, o.a),
                        this.fnBuilder._deRefFr(c, o.b),
                        c.i32_const(this.fnBuilder.builder.module.allocString(o.strErr))
                    )
                );
            } else if (o.op == "CHECKASSERT") {
                code.push(
                    c.call(
                        "checkAssert",
                        c.getLocal("cIdx"),
                        this.fnBuilder._deRefFr(c, o.a),
                        c.i32_const(this.fnBuilder.builder.module.allocString(o.strErr))
                    )
                );
            } else if (o.op == "LOG") {
                code.push(
                    c.call(
                        "log",
                        this.fnBuilder._deRefFr(c, o.val)
                    )
                );
            }
        });
        return code;
    }
}

class FunctionBuilderWasm {

    constructor(builder, name, instanceDef, type, params) {
        this.builder = builder;
        this.name = name;
        this.instanceDef = instanceDef;
        this.type = type; // "COMPONENT" or "FUNCTION"
        this.definedFrElements = [];
        this.definedIntElements = [];
        this.definedSizeElements = [];
        this.definedPFrElements = [];
        this.initializedElements = [];
        this.initializedSignalOffset = [];
        this.initializedSignalSizes = [];

        this.refs = {};

        this.nFr = 0;
        this.nInt = 0;
        this.nSizes = 0;
        this.nPFr = 0;

    }

    defineFrElements(dLabel, size) {
        this.refs[dLabel] = {
            t: "Fr",
            n: size,
            idx: this.nFr
        };
        this.nFr += size;
    }

    defineIntElement(dLabel) {
        this.refs[dLabel] = {
            t: "I",
            idx: this.nInt
        };
        this.nInt++;
    }

    defineSizesElement(dLabel) {
        this.refs[dLabel] = {
            t: "S",
            idx: this.nSizes
        };
        this.nSizes++;
    }

    definePFrElement(dLabel) {
        this.refs[dLabel] = {
            t: "PFr",
            idx: this.nPFr
        };
        this.nPFr++;
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
        assert(typeof this.params === "undefined");
        assert(this.type === "FUNCTION");
        this.params=params;
        for (let i=0; i<this.params.length; i++) {
            assert(typeof this.refs[this.params[i]] === "undefined");
            this.refs[this.params[i]] = {
                t: "P",
                l: this.params[i]
            };
        }
    }

    _getPtr(c, label, offset) {
        offset = offset || 0;
        assert (typeof this.refs[label] !== "undefined");
        if (this.refs[label].t == "Fr") {
            return c.i32_add(
                c.getLocal("sp"),
                c.i32_const((this.refs[label].idx + offset) * this.builder.sizeFr)
            );
        } else if (this.refs[label].t == "I") {
            assert(offset == 0);
            return c.i32_add(
                c.getLocal("sp"),
                c.i32_const(
                    this.nFr * this.builder.sizeFr +
                    this.refs[label].idx * 4)
            );
        } else if (this.refs[label].t == "S") {
            assert(offset == 0);
            return c.i32_add(
                c.getLocal("sp"),
                c.i32_const(
                    this.nFr * this.builder.sizeFr +
                    this.nInt * 4 +
                    this.refs[label].idx * 4)
            );
        } else if (this.refs[label].t == "PFr") {
            assert(offset == 0);
            return c.i32_add(
                c.getLocal("sp"),
                c.i32_const(
                    this.nFr * this.builder.sizeFr +
                    this.nInt * 4 +
                    this.nSizes * 4 +
                    this.refs[label].idx * 4)
            );
        } else if (this.refs[label].t == "P") {
            return c.i32_add(
                c.getLocal(this.refs[label].l),
                c.i32_const( offset * this.builder.sizeFr )
            );
        }
    }

    _getPtrConstant(c, idConstant) {
        return c.i32_const( this.builder.pConstants + idConstant * this.builder.sizeFr );
    }

    _deRefInt(c, ref) {
        if (ref[0] == "R") {
            return c.call(
                "Fr_toInt",
                this._getPtr(c, ref[1])
            );
        } else if (ref[0] == "RI") {
            return c.i32_load(this._getPtr(c, ref[1]));
        } else if (ref[0] == "V") {
            return c.i32_const(ref[1]);
        } else if (ref[0] == "C") {
            return c.call(
                "Fr_toInt",
                this._getPtrConstant(c, ref[1])
            );
        } else if (ref[0] == "CC") {
            return c.getLocal("cIdx");
        } else {
            assert(false);
        }
    }

    _deRefFr(c, ref) {
        if (ref[0] == "R") {
            if (this.refs[ref[1]].t == "Fr") {
                return this._getPtr(c, ref[1]);
            } else if (this.refs[ref[1]].t == "PFr") {
                return c.i32_load(this._getPtr(c, ref[1]));
            } else if (this.refs[ref[1]].t == "P") {
                return c.getLocal(ref[1]);
            } else {
                assert(false);
            }
        } else if (ref[0] == "C") {
            return this._getPtrConstant(c, ref[1]);
        } else {
            assert(false);
        }
    }

    _reserveStack(c) {
        const code = [];
        code.push(
            // Load SP
            c.setLocal("sp", c.i32_load(c.i32_const(4))),

            // Check we have enough memory
            c.if(
                c.i32_gt_u(
                    c.i32_const(this.nStackSize),
                    c.getLocal("sp")
                ),
                c.call(
                    "error",
                    c.i32_const(errs.STACK_OUT_OF_MEM.code),
                    c.i32_const(errs.STACK_OUT_OF_MEM.pointer),
                    c.i32_const(0),
                    c.i32_const(0),
                    c.i32_const(0),
                    c.i32_const(0)
                )
            ),

            // Reserve space in sp
            c.setLocal(
                "sp",
                c.i32_sub(
                    c.getLocal("sp"),
                    c.i32_const(this.nStackSize)
                )
            ),

            // Check if we have enought free memory
            c.if(
                c.i32_gt_u(
                    c.i32_load(c.i32_const(0)),
                    c.getLocal("sp")
                ),
                c.call(
                    "error",
                    c.i32_const(errs.STACK_TOO_SMALL.code),
                    c.i32_const(errs.STACK_TOO_SMALL.pointer),
                    c.i32_const(0),
                    c.i32_const(0),
                    c.i32_const(0),
                    c.i32_const(0)
                )
            ),

            // Save sp
            c.i32_store(c.i32_const(4), c.getLocal("sp"))
        );
        return code;
    }

    _freeStack(c) {
        const code = [];
        code.push(
            c.i32_store(
                c.i32_const(4),
                c.i32_add(
                    c.getLocal("sp"),
                    c.i32_const(this.nStackSize)
                )
            )
        );
        return code;
    }

    _buildHeader(c) {
        const code = [];
        this.nStackSize =
            this.nFr * this.builder.sizeFr +
            this.nInt * 4 +
            this.nSizes * 4 +
            this.nPFr * 4;


        code.push( this._reserveStack(c));

        this.initializedElements.forEach( (o) => {
            code.push(
                c.call(
                    "Fr_copy",
                    this._getPtr(c, o.dLabel, o.offset),
                    this._getPtrConstant(c, o.idConstant)
                )
            );
        });
        this.initializedSignalOffset.forEach( (o) => {
            code.push(
                c.call(
                    "getSignalOffset",
                    this._getPtr(c, o.dLabel, o.offset),
                    this._deRefInt(c, o.component),
                    c.i64_const("0x" + o.hash)
                )
            );
        });
        this.initializedSignalSizes.forEach( (o) => {
            code.push(
                c.call(
                    "getSignalSizes",
                    this._getPtr(c, o.dLabel, o.offset),
                    this._deRefInt(c, o.component),
                    c.i64_const("0x" + o.hash)
                )
            );
        });
        return code;
    }

    _buildFooter(c) {
        return this._freeStack(c);
    }

    newCodeBuilder() {
        return new CodeBuilderWasm(this);
    }

    setBody(body) {
        this.body = body;
    }

    build(module) {


        const f = module.addFunction(this.name, this.instanceDef);

        if (this.type=="COMPONENT") {
            f.addParam("cIdx", "i32");
        } else if (this.type=="FUNCTION") {
            f.addParam("pRet", "i32");
            for (let i=0;i<this.params.length;i++ ) {
                f.addParam(this.params[i], "i32");
            }
        } else {
            assert(false);
        }
        f.addLocal("sp", "i32");

        const c = f.getCodeBuilder();


        const code = [];
        if (this.type=="COMPONENT") {
            code.push(c.call("componentStarted", c.getLocal("cIdx")));
        }

        code.push(this._buildHeader(c));
        code.push(this.body.build(c));
        if (this.type=="COMPONENT") {
            code.push(c.call("componentFinished", c.getLocal("cIdx")));
        }
        code.push(this._buildFooter(c));

        f.addCode(flatArray(code));

        function flatArray(c) {
            const res=[];
            for (let i=0; i<c.length; i++) {
                if (Array.isArray(c[i])) {
                    res.push(...flatArray(c[i]));
                } else {
                    res.push(c[i]);
                }
            }
            return res;
        }
    }

}

class BuilderWasm {
    constructor(p) {
        this.F = new F1Field(p);
        this.hashMaps={};
        this.componentEntriesTables={};
        this.sizes ={};
        this.constants = [];
        this.usedConstants = {};
        this.functions = [];
        this.components = [];

        this.TYPE_SIGNAL = 1;
        this.TYPE_COMPONENT = 2;

        this.addConstant(Scalar.fromString("0"));  // constants[0] = 0;
        this.addConstant(Scalar.fromString("1"));  // constants[1] = 1;

        this.offsetComponentNInputSignals = 12;
        this.sizeofComponent = 20;
    }

    setHeader(header) {
        this.header=header;

        this.n64 = Math.floor((Scalar.bitLength(this.header.P) - 1) / 64)+1;
        this.sizeFr = this.n64*8 + 8;
    }

    // ht is an array of 256 element that can be undefined or [Hash, Idx, KeyName] elements.
    addHashMap(name, table) {
        this.hashMaps[name] = {table};
    }

    addComponentEntriesTable(name, cet) {
        this.componentEntriesTables[name] = cet;
    }

    addSizes(name, table) {
        this.sizes[name] = {table};
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
        return new FunctionBuilderWasm(this, name, instanceDef, "COMPONENT");
    }

    newFunctionBuilder(name, instanceDef, params) {
        return new FunctionBuilderWasm(this, name, instanceDef, "FUNCTION", params);
    }


    // Body functions

    _buildHeader(module) {

        this.pCircuit = module.alloc(48);

        this.pNSignals = this.pCircuit;
        this.pNComponents = this.pCircuit + 4;
        this.pNInputs = this.pCircuit + 8;
        this.pNOutputs = this.pCircuit + 12;
        this.pNVars = this.pCircuit + 16;
        this.ppWit2sig = this.pCircuit + 20;
        this.ppComponents = this.pCircuit + 24;
        this.ppMapIsInput = this.pCircuit + 28;
        this.ppConstants = this.pCircuit + 32;
        this.ppSignals = this.pCircuit + 36;
        this.ppInputSignalsToTrigger = this.pCircuit + 40;
        this.ppSignalsAssigned = this.pCircuit + 44;
    }

    _buildSizes(module) {
        for (let sName in this.sizes) {
            const accSizes = this.sizes[sName];

            const bytes = [];

            for (let i=0; i<accSizes.table.length; i++) {
                bytes.push(intToBytes32(accSizes.table[i]));
            }

            const fBytes = [].concat(...bytes);
            accSizes.pointer = module.alloc(fBytes);
        }
    }


    _buildHashMaps(module) {

        for (let hmName in this.hashMaps ) {
            const hm = this.hashMaps[hmName];

            const bytes = [];

            for (let i=0; i<256; i++) {
                if (hm.table[i]) {
                    bytes.push(hexToBytesR(hm.table[i][0]));
                    bytes.push(intToBytes32(hm.table[i][1]));
                } else {
                    bytes.push([0,0,0,0,0,0,0,0,0,0,0,0]);
                }
            }

            const fBytes = [].concat(...bytes);
            hm.pointer = module.alloc(fBytes);
        }

    }

    _buildComponentEntriesTables(module) {

        for (let cetName in this.componentEntriesTables) {
            const cet = this.componentEntriesTables[cetName];

            const bytes = [];

            for (let j=0; j<cet.length; j++) {
                const ty = cet[j].type == "S" ? this.TYPE_SIGNAL : this.TYPE_COMPONENT;
                bytes.push(intToBytes32(cet[j].offset));
                bytes.push(intToBytes32(this.sizes[cet[j].sizeName].pointer));
                bytes.push(intToBytes32(ty));
            }

            const fBytes = [].concat(...bytes);
            this.componentEntriesTables[cetName].pointer = module.alloc(fBytes);
        }
    }


    _buildConstants(module) {
        const self = this;

        const bytes = [];
        for (let i=0; i<self.constants.length; i++) {
            bytes.push(Fr2Bytes(self.constants[i]));
        }

        const fBytes = [].concat(...bytes);
        this.pConstants = module.alloc(fBytes);


        function Fr2Bytes(n) {
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
                return [
                    ...intToBytes32(Scalar.toNumber(a)),
                    ...intToBytes32(0x40000000),
                    ...long(toMontgomery(a))
                ];
            }


            function shortMontgomeryNegative(a) {
                const b = -Scalar.toNumber(self.F.neg(a));
                return [
                    ...intToBytes32(b),
                    ...intToBytes32(0x40000000),
                    ...long(toMontgomery(a))
                ];
            }

            function longMontgomery(a) {
                return [
                    ...intToBytes32(0),
                    ...intToBytes32(0xC0000000),
                    ...long(toMontgomery(a))
                ];
            }

            function long(a) {

                const bytes = [];
                const arr = Scalar.toArray(a, 0x100000000);
                for (let i=0; i<self.F.n64*2; i++) {
                    const idx = arr.length-1-i;

                    if ( idx >=0) {
                        bytes.push(...intToBytes32(arr[idx]));
                    } else {
                        bytes.push(...intToBytes32(0));
                    }
                }

                return bytes;
            }

            function toMontgomery(a) {
                return self.F.mul(a, self.F.R);
            }

        }
    }

    _buildFunctions(module) {
        for (let i=0; i<this.functions.length; i++) {
            const cfb = this.functions[i];
            cfb.build(module);
        }
    }

    _buildComponents(module) {
        const bytes = new Array(this.components.length*5*4);
        bytes.length=0;
        for (let i=0; i<this.components.length; i++) {
            const c = this.components[i];

            bytes.push(...intToBytes32(this.hashMaps[c.hashMapName].pointer));
            bytes.push(...intToBytes32(this.componentEntriesTables[c.entryTableName].pointer));
            bytes.push(...intToBytes32(i));
            bytes.push(...intToBytes32(c.nInSignals));
            bytes.push(...intToBytes32(c.newThread ? 1 : 0));

            module.addFunctionToTable(c.functionName);
        }

        this.pComponents = module.alloc(bytes);
    }

    _buildMapIsInput(module) {
        const bytes = new Array(this.mapIsInput.length*4);
        bytes.length=0;
        for (let i=0; i<this.mapIsInput.length; i++) {
            bytes.push(...intToBytes32(this.mapIsInput[i]));
        }

        this.pMapIsInput = module.alloc(bytes);
    }

    _buildWit2Sig(module) {
        const bytes = new Array(this.wit2sig.length*4);
        bytes.length =0;
        for (let i=0; i<this.wit2sig.length; i++) {
            bytes.push(...intToBytes32(this.wit2sig[i]));
        }

        this.pWit2sig = module.alloc(bytes);
    }

    _buildCircuitVar(module) {
        module.addData(this.pNSignals, intToBytes32(this.header.NSignals));
        module.addData(this.pNComponents, intToBytes32(this.header.NComponents));
        module.addData(this.pNInputs, intToBytes32(this.header.NInputs));
        module.addData(this.pNOutputs, intToBytes32(this.header.NOutputs));
        module.addData(this.pNVars, intToBytes32(this.header.NVars));
        module.addData(this.ppWit2sig, intToBytes32(this.pWit2sig));
        module.addData(this.ppComponents, intToBytes32(this.pComponents));
        module.addData(this.ppMapIsInput, intToBytes32(this.pMapIsInput));
        module.addData(this.ppConstants, intToBytes32(this.pConstants));
        module.addData(this.ppSignals, intToBytes32(this.pSignals));
        module.addData(this.ppInputSignalsToTrigger, intToBytes32(this.pInputSignalsToTrigger));
        module.addData(this.ppSignalsAssigned, intToBytes32(this.pSignalsAssigned));

    }

    _buildErrors(module) {
        for (let e in errs) {
            errs[e].pointer = module.allocString(errs[e].str);
        }
    }


    async build(fd, outType) {
        const encoder = new TextEncoder("utf-8");
        let module;
        if (outType == "wasm") {
            module=new ModuleBuilder();
        } else if (outType == "wat") {
            module=new ModuleBuilderWat();
        } else {
            assert(false);
        }
        this.module = module;

        // First of all reseve the space for the header so this has a fixed position starting at 8.
        this._buildHeader(module);
        this._buildErrors(module);
        buildRuntime(module, this);
        this._buildSizes(module);
        this._buildConstants(module);
        this._buildHashMaps(module);
        this._buildComponentEntriesTables(module);
        this._buildFunctions(module);
        this._buildComponents(module);
        this._buildMapIsInput(module);
        this._buildWit2Sig(module);
        this._buildCircuitVar(module);

        module.setMemory(2000);
        if (outType == "wasm") {
            const bytes = module.build();
            const bytesArr = new Uint8Array(bytes);
            await fd.write(bytesArr);
        } else if (outType == "wat") {
            const code = module.build();
            await writeCode(code);
        } else {
            assert(false);
        }

        async function writeCode(c) {
            if (c.push) {
                for (let i=0; i<c.length; i++) {
                    await writeCode(c[i]);
                }
            } else if (typeof c === "string") {
                await fd.write(encoder.encode(c + "\n"));
            }
        }
    }
}


module.exports = BuilderWasm;
