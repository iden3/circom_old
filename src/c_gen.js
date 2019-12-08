const bigInt = require("big-integer");
const utils = require("./utils");
const assert = require("assert");
const iterateAST = require("./iterateast");

module.exports.gen =  gen;
module.exports.newRef = newRef;
module.exports.createRefs = createRefs;

function newRef(ctx, type, name, value, sizes) {
    let label;
    if (!name) {
        label = ctx.getUniqueName();
    } else {
        label = ctx.getUniqueName(name);
    }
    if (Array.isArray(sizes)) {
        // sizes = sizes;
    } else if (utils.isDefined(value)) {
        sizes = utils.accSizes(utils.extractSizes(value));
    } else {
        sizes = [1, 0];
    }

    const refId = ctx.refs.length;
    const entry = {
        type: type,
        used: false,
        sizes: sizes,
        label: label
    };
    if (utils.isDefined(value)) {
        entry.value = utils.flatArray(value);
    }

    ctx.refs.push(entry);
    return refId;
}

function instantiateRef(ctx, refId, initValue) {
    const v = ctx.refs[refId];
    if (v.used) return;

    if (v.type=="BIGINT") {
        ctx.codeHeader += `PBigInt ${v.label} = ctx->allocBigInts(${v.sizes[0]});\n`;
        ctx.codeFooter += `ctx->freeBigInts(${v.label}, ${v.sizes[0]});\n`;
    } else if (v.type=="INT") {
        ctx.codeHeader += `int ${v.label};\n`;
    } else if (v.type=="SIZES") {
        ctx.codeHeader += `Circom_Sizes ${v.label};\n`;
    }
    v.used = true;
    if (utils.isDefined(initValue)) {
        if (v.type == "BIGINT") {
            for (let i=0; i<initValue.length; i++) {
                if (utils.isDefined(initValue[i])) {
                    const c = `mpz_set_str(${v.label}[${i}], "${initValue[i].toString(10)}", 10);\n`;
                    ctx.code += c;
                }
            }
        }
    }
}

function instantiateConstant(ctx, value) {
    const sizes = utils.accSizes(utils.extractSizes(value));
    const flatedValue = utils.flatArray(value);
    const label = ctx.getUniqueName("_const");
    ctx.codeHeader += `PBigInt ${label};\n`;
    ctx.codeHeader += `${label} = ctx->allocBigInts(${sizes[0]});\n`;
    for (let i=0; i<flatedValue.length; i++) {
        ctx.codeHeader += `mpz_set_str(${label}[${i}], "${flatedValue[i].toString(10)}", 10);\n`;
    }
    ctx.codeFooter += `ctx->freeBigInts(${label}, ${sizes[0]});\n`;
    const refId = ctx.refs.length;
    ctx.refs.push({
        type: "BIGINT",
        used: true,
        sizes: sizes,
        label: label
    });
    return refId;
}


function createRefs(ctx, ast) {
    const scopeLabels = [];
    iterateAST(ast, (ast, level) => {
        while ((scopeLabels.length>0)&&(!scopeLabels[scopeLabels.length-1].startsWith(level))) {
            ctx.scopes.pop();
            scopeLabels.pop();
        }
        if (ast.type == "DECLARE") {
            if (ctx.scopes[ctx.scopes.length-1][ast.name.name]) return ctx.throwError(ast, `Name already defined: ${ast.name.name}`);
            for (let i=ctx.scopes.length-2; i>=0; i--) {
                if (ctx.scopes[i][ast.name.name]) ctx.logWarning(ast, `Shadowing variable: ${ast.name.name}`);
            }
            let entry = {};
            if (ast.declareType == "COMPONENT") {
                entry.type= "COMPONENT";
                entry.label = ast.name.name;
            } else if ((ast.declareType == "SIGNALIN")||
                       (ast.declareType == "SIGNALOUT")||
                       (ast.declareType == "SIGNAL")) {
                entry.type = "SIGNAL";
                entry.label = ast.name.name;
            } else if (ast.declareType == "VARIABLE") {
                entry.type = "BIGINT";
                entry.used = false;
                entry.sizes = null;
                entry.label = ctx.getUniqueName(ast.name.name);
            } else {
                return ctx.throwError(ast, "Invalid declaration: " + ast.declareType);
            }

            const refId = ctx.refs.length;
            ctx.refs.push(entry);
            ast.refId = refId;
            ctx.scopes[ctx.scopes.length-1][ast.name.name] = refId;
        } else if (["BLOCK", "FOR", "IF", "WHILE", "COMPUTE"].indexOf(ast.type) >= 0) {
            scopeLabels.push(level);
            ctx.scopes.push({});
        } else if (ast.type == "VARIABLE") {
            ast.refId = name2ref(ast.name);
        }
    });

    function name2ref(n) {
        for (let i=ctx.scopes.length-1; i>=0; i--) {
            if (typeof ctx.scopes[i][n] !== "undefined") return ctx.scopes[i][n];
        }
        return -1;
    }
}

function gen(ctx, ast) {
    if ((ast.type == "NUMBER") ) {
        return genNumber(ctx, ast);
    } else if (ast.type == "VARIABLE") {
        return genVariable(ctx, ast);
    } else if (ast.type == "PIN") {
        return genPin(ctx, ast);
    } else if (ast.type == "OP") {
        if (ast.op == "=") {
            return genAssignement(ctx, ast);
        } else if (ast.op == "<--") {
            return genAssignement(ctx, ast);
        } else if (ast.op == "<==") {
            return genSignalAssignConstraint(ctx, ast);
        } else if (ast.op == "===") {
            return genConstraint(ctx, ast);
        } else if (ast.op == "+=") {
            return genVarAddAssignement(ctx, ast);
        } else if (ast.op == "*=") {
            return genVarMulAssignement(ctx, ast);
        } else if (ast.op == "+") {
            return genOp(ctx, ast, "add", 2);
        } else if (ast.op == "-") {
            return genOp(ctx, ast, "sub", 2);
        } else if (ast.op == "UMINUS") {
            return genOp(ctx, ast, "neg", 1);
        } else if (ast.op == "*") {
            return genOp(ctx, ast, "mul", 2);
        } else if (ast.op == "%") {
            return genOp(ctx, ast, "mod", 2);
        } else if (ast.op == "PLUSPLUSRIGHT") {
            return genOpOp(ctx, ast, "add", "RIGHT");
        } else if (ast.op == "PLUSPLUSLEFT") {
            return genOpOp(ctx, ast, "add", "LEFT");
        } else if (ast.op == "MINUSMINUSRIGHT") {
            return genOpOp(ctx, ast, "sub", "RIGHT");
        } else if (ast.op == "MINUSMINUSLEFT") {
            return genOpOp(ctx, ast, "sub", "LEFT");
        } else if (ast.op == "**") {
            return genOp(ctx, ast, "pow", 2);
        } else if (ast.op == "/") {
            return genOp(ctx, ast, "div", 2);
        } else if (ast.op == "\\") {
            return genOp(ctx, ast, "idiv", 2);
        } else if (ast.op == "&") {
            return genOp(ctx, ast, "band", 2);
        } else if (ast.op == "|") {
            return genOp(ctx, ast, "bor", 2);
        } else if (ast.op == "^") {
            return genOp(ctx, ast, "bxor", 2);
        } else if (ast.op == "~") {
            return genOp(ctx, ast, "bnot", 1);
        } else if (ast.op == "&&") {
            return genOp(ctx, ast, "land", 2);
        } else if (ast.op == "||") {
            return genOp(ctx, ast, "lor", 2);
        } else if (ast.op == "!") {
            return genOp(ctx, ast, "lnot", 1);
        } else if (ast.op == "<<") {
            return genOp(ctx, ast, "shl", 2);
        } else if (ast.op == ">>") {
            return genOp(ctx, ast, "shr", 2);
        } else if (ast.op == "<") {
            return genOp(ctx, ast, "lt", 2);
        } else if (ast.op == ">") {
            return genOp(ctx, ast, "gt", 2);
        } else if (ast.op == "<=") {
            return genOp(ctx, ast, "leq", 2);
        } else if (ast.op == ">=") {
            return genOp(ctx, ast, "geq", 2);
        } else if (ast.op == "==") {
            return genOp(ctx, ast, "eq", 2);
        } else if (ast.op == "!=") {
            return genOp(ctx, ast, "neq", 2);
        } else if (ast.op == "?") {
            return genTerCon(ctx, ast);
        } else {
            ctx.throwError(ast, "Invalid operation: " + ast.op);
        }
    } else if (ast.type == "DECLARE") {
        if (ast.declareType == "COMPONENT") {
            return genDeclareComponent(ctx, ast);
        } else if ((ast.declareType == "SIGNALIN")||
                   (ast.declareType == "SIGNALOUT")||
                   (ast.declareType == "SIGNAL")) {
            return genDeclareSignal(ctx, ast);
        } else if (ast.declareType == "VARIABLE") {
            return genDeclareVariable(ctx, ast);
        } else {
            ctx.throwError(ast, "Invalid declaration: " + ast.declareType);
        }
    } else if (ast.type == "FUNCTIONCALL") {
        return genFunctionCall(ctx, ast);
    } else if (ast.type == "BLOCK") {
        return genBlock(ctx, ast);
    } else if (ast.type == "COMPUTE") {
        return gen(ctx, ast.body);
    } else if (ast.type == "FOR") {
        return genLoop(ctx, ast);
    } else if (ast.type == "WHILE") {
        return genLoop(ctx, ast);
    } else if (ast.type == "IF") {
        return genIf(ctx, ast);
    } else if (ast.type == "RETURN") {
        return genReturn(ctx, ast);
    } else if (ast.type == "INCLUDE") {
        return genInclude(ctx, ast);
    } else if (ast.type == "ARRAY") {
        return genArray(ctx, ast);
    } else {
        ctx.throwError(ast, "GEN -> Invalid AST node type: " + ast.type);
    }
}

function genBlock(ctx, ast) {
    ctx.scopes.push({});
    const oldCode = ctx.code;
    let res = null;
    ctx.code = "";
    for (let i=0; i<ast.statements.length; i++) {
        if (["BLOCK", "COMPUTE", "FOR", "WHILE", "IF"].indexOf(ast.statements[i].type)<0) {
            genSrcComment(ctx, ast.statements[i]);
        }
        res = gen(ctx, ast.statements[i]);
        if (ctx.error) return;
    }
    ctx.code = oldCode + ctx.code;
    ctx.scopes.pop();
    return res;
}

function getSource(ctx, ast) {
    let codes = [];
    const fl= ast.first_line-1;
    const ll = ast.last_line-1;
    const fc = ast.first_column;
    const lc = ast.last_column;
    for (let i=fl; i<=ll; i++) {
        const p1 = i==fl ? fc : 0;
        const p2 = i==ll ? lc : -1;
        codes.push(ctx.includedFiles[ctx.fileName][i].slice(p1, p2>=0 ? p2 : undefined));
    }
    return codes.join("\n");
}

function genSrcComment(ctx, ast) {
    const code = getSource(ctx, ast);
    ctx.code += "\n/* "+code+"  */\n";
}

function genLoopSrcComment(ctx, ast) {
    if (ast.type == "FOR") {
        const init = getSource(ctx, ast.init);
        const condition = getSource(ctx, ast.condition);
        const step = getSource(ctx, ast.step);
        ctx.code += `\n/* for (${init},${condition},${step}) */\n`;
    } else if (ast.type == "WHILE") {
        const condition = getSource(ctx, ast.condition);
        ctx.code += `\n/* while (${condition}) */\n`;
    } else {
        assert(false, "Invalid loop type: "+ ast.type);
    }
}

function genIfSrcComment(ctx, ast) {
    const condition = getSource(ctx, ast.condition);
    ctx.code += `\n/* if (${condition}) */\n`;
}


function genDeclareComponent(ctx, ast) {
    return ast.refId;
}

function genDeclareSignal(ctx, ast) {
    return ast.refId;
}

function genDeclareVariable(ctx, ast) {


    const v = ctx.refs[ast.refId];

    let sizes;
    if (ast.name.selectors.length>0) {
        sizes=[];
        for (let i=0; i< ast.name.selectors.length; i++) {
            const sizeRef = gen(ctx, ast.name.selectors[i]);
            const size = ctx.refs[sizeRef];
            if (size.sizes[0] != 1) return ctx.throwError(ast, "A selector cannot be an array");
            if (size.used) return ctx.throwError(ast, "Variable size variables not allowed");
            sizes.push(size.value[0].toJSNumber());
        }
        sizes = utils.accSizes(sizes);
    } else {
        sizes = null; // If not sizes, the sized are defined in the first assignement.
    }

    if ((!v.sizes)&&(sizes)) {
        v.sizes = sizes;
        v.value = new Array(sizes[0]);
    }

    if (v.sizes) {
        if (!utils.sameSizes(v.sizes, sizes)) return ctx.throwError(ast, "Redefined a var with different sized");
    }

    return ast.refId;
}

function genNumber(ctx, ast) {
    return newRef(ctx, "BIGINT", "_num", ast.value);
}



function genGetOffset(ctx, refOffset, vSizes, sels) {

    let rN = 0;
    let rStr = "";
    let offset;

    if (refOffset) {
        offset = ctx.refs[refOffset];
        if (offset.used) {
            rStr += offset.label;
        } else {
            rN += offset.value.toJSNumber();
        }
    }

    if ((sels)&&(sels.length>0)) {

        let iSizes;
        if (Array.isArray(vSizes)) {
            iSizes = {
                used: false,
                sizes: vSizes
            };
        } else {
            iSizes = ctx.refs[vSizes];
        }

        for (let i=0; i<sels.length; i++) {
            const idxRef = gen(ctx, sels[i]);
            const iIdx = ctx.refs[idxRef];

            if ((!iIdx.used) && (!iSizes.used)) {
                rN = rN + iIdx.value * iSizes.sizes[i+1];
            } else {
                if (rN>0) {
                    if (rStr != "") rStr += " + ";
                    rStr += rN;
                    rN =0;
                }

                if (rStr != "") rStr += " + ";
                if (iIdx.used) {
                    rStr += iIdx.label;
                } else {
                    rStr += iIdx.value;
                }
                rStr += "*";
                if (iSizes.used) {
                    rStr += `${iSizes.label}[${i+1}]`;
                } else {
                    rStr += iSizes.sizes[i+1];
                }
            }
        }
    }

    if (rStr == "") {
        const o = newRef(ctx, "INT", "_offset", rN);
        return o;
    } else {
        if (rN>0) {
            if (rStr != "") rStr += " + ";
            rStr += rN;
            rN =0;
        }
        if ((refOffset)&&(rStr == offset.label)) {
            return offset.label;
        } else {
            const resRef = newRef(ctx, "INT", "_offset");
            instantiateRef(ctx, resRef);
            const res = ctx.refs[resRef];
            ctx.code += `${res.label} = ${rStr};\n`;
            return resRef;
        }
    }
}

function genVariable(ctx, ast) {
    const v = ctx.refs[ast.refId];

    const l = ast.selectors ? ast.selectors.length : 0;

    if (v.type == "SIGNAL") {
        let vOffset;
        if (l>0) {
            const vsOffset = genGetSigalOffset(ctx, -1, ast.name);
            const vsSizes = genGetSignalSizes(ctx, -1, ast.name);
            vOffset = genGetOffset(ctx, vsOffset, vsSizes, ast.selectors );
        } else {
            vOffset = genGetSigalOffset(ctx, -1, ast.name);
        }
        return genGetSignal(ctx, -1, vOffset);

    } else if (v.type == "BIGINT") {
        const refOffset = genGetOffset(ctx, 0, v.sizes, ast.selectors );
        const offset = ctx.refs[refOffset];
        if (v.used) {
            if (offset.used) {
                const refRes = newRef(ctx, "BIGINT", "_v", null, v.sizes.slice(l));
                const res = ctx.refs[refRes];
                res.used = true;
                ctx.codeHeader += `PBigInt ${res.label};\n`;
                ctx.code += `${res.label} = ${v.label} + ${offset.label};\n`;
                return refRes;
            } else if ((offset.value[0])||(l>0)) {
                const refRes = newRef(ctx, "BIGINT", "_v", null, v.sizes.slice(l));
                const res = ctx.refs[refRes];
                res.used = true;
                ctx.codeHeader += `PBigInt ${res.label};\n`;
                ctx.code += `${res.label} = ${v.label} + ${offset.value[0]};\n`;
                return refRes;
            } else {
                return ast.refId;
            }
        } else {
            if (offset.used) {
                instantiateRef(ctx, ast.refId, v.value);
                const resRef = newRef(ctx, "BIGINT", "_v", null, v.sizes.slice(l));
                const res = ctx.refs[resRef];
                res.used = true;
                ctx.codeHeader += `PBigInt ${res};\n`;
                ctx.code += `${res.label} = ${v.label} + ${offset.label};\n`;
                return res;
            } else {
                // return newSubRef(ctx, ast.name, ast.selectors);
                return newRef(ctx, "BIGINT", "_v", v.value.slice(offset.value[0], offset.value[0] + v.sizes[l]),v.sizes.slice(l));
            }
        }
    }
}


function genPin(ctx, ast) {
    let vcIdx;
    if (ast.component.selectors.length>0) {
        const vcOffset = genGetSubComponentOffset(ctx, -1, ast.component.name);
        const vcSizes = genGetSubComponentSizes(ctx, -1, ast.component.name);
        vcIdx = genGetOffset(ctx, vcOffset, vcSizes, ast.component.selectors );
    } else {
        vcIdx = genGetSubComponentOffset(ctx, -1, ast.component.name);
    }

    let vsIdx;
    if (ast.pin.selectors.length>0) {
        const vsOffset = genGetSigalOffset(ctx, vcIdx, ast.pin.name);
        const vsSizes = genGetSignalSizes(ctx, vcIdx, ast.pin.name);
        vsIdx = genGetOffset(ctx, vsOffset, vsSizes, ast.pin.selectors );
    } else {
        vsIdx = genGetSigalOffset(ctx, vcIdx, ast.pin.name);
    }

    return genGetSignal(ctx, vcIdx, vsIdx);
}

function genGetSubComponentOffset(ctx, cIdxRef, label) {
    const refOffset = newRef(ctx, "INT", "_compIdx");
    const offset = ctx.refs[refOffset];
    instantiateRef(ctx, refOffset);

    const h = utils.fnvHash(label);
    let s;
    if (cIdxRef>=0) {
        const cIdx = ctx.refs[cIdxRef];
        s = cIdx.label;
    } else {
        s = "ctx->cIdx";
    }
    ctx.code += `${offset.label} = ctx->getSubComponentOffset(${s}, 0x${h}LL /* ${label} */);\n`;
    return refOffset;
}

function genGetSubComponentSizes(ctx, cIdxRef, label) {
    const sizesRef = newRef(ctx, "SIZES", "_compSizes");
    const sizes = ctx.refs[sizesRef];
    instantiateRef(ctx, sizesRef);

    const h = utils.fnvHash(label);
    let s;
    if (cIdxRef>=0) {
        const cIdx = ctx.refs[cIdxRef];
        s = cIdx.label;
    } else {
        s = "ctx->cIdx";
    }
    ctx.code += `${sizes.label} = ctx->getSubComponentSizes(${s}, 0x${h}LL /* ${label} */);\n`;
    return sizesRef;
}

function genGetSigalOffset(ctx, cIdxRef, label) {
    const refOffset = newRef(ctx, "INT", "_sigIdx");
    const offset = ctx.refs[refOffset];
    instantiateRef(ctx, refOffset);

    const h = utils.fnvHash(label);
    let s;
    if (cIdxRef>=0) {
        const cIdx = ctx.refs[cIdxRef];
        s = cIdx.label;
    } else {
        s = "ctx->cIdx";
    }
    ctx.code += `${offset.label} = ctx->getSignalOffset(${s}, 0x${h}LL /* ${label} */);\n`;
    return refOffset;
}

function genGetSignalSizes(ctx, cIdxRef, label) {
    const sizesRef = newRef(ctx, "SIZES", "_sigSizes");
    const sizes = ctx.refs[sizesRef];
    instantiateRef(ctx, sizesRef);

    let s;
    if (cIdxRef>=0) {
        const cIdx = ctx.refs[cIdxRef];
        s = cIdx.label;
    } else {
        s = "ctx->cIdx";
    }
    const h = utils.fnvHash(label);
    ctx.code += `${sizes.label} = ctx->getSignalSizes(${s}, 0x${h}LL /* ${label} */);\n`;
    return sizesRef;
}

function genSetSignal(ctx, cIdxRef, sIdxRef, valueRef) {
    const v = ctx.refs[valueRef];
    if (!v.used) {
        instantiateRef(ctx, valueRef, v.value);
    }
    let s;
    if (cIdxRef>=0) {
        const cIdx = ctx.refs[cIdxRef];
        s = cIdx.label;
    } else {
        s = "ctx->cIdx";
    }
    const sIdx = ctx.refs[sIdxRef];
    ctx.code += `ctx->setSignal(${s}, ${sIdx.label}, ${v.label});\n`;

    return valueRef;
}

function genGetSignal(ctx, cIdxRef, sIdxRef) {
    const resRef = newRef(ctx, "BIGINT", "_sigValue");
    const res = ctx.refs[resRef];
    instantiateRef(ctx, resRef);
    let s;
    if (cIdxRef>=0) {
        const cIdx = ctx.refs[cIdxRef];
        s = cIdx.label;
    } else {
        s = "ctx->cIdx";
    }
    const sIdx = ctx.refs[sIdxRef];
    ctx.code += `ctx->getSignal(${s}, ${sIdx.label}, ${res.label});\n`;
    return resRef;
}

function genPinAssignement(ctx, ast) {
    let vcIdx;
    if (ast.values[0].component.selectors.length>0) {
        const vcOffset = genGetSubComponentOffset(ctx, -1, ast.values[0].component.name);
        const vcSizes = genGetSubComponentSizes(ctx, -1, ast.values[0].component.name);
        vcIdx = genGetOffset(ctx, vcOffset, vcSizes, ast.values[0].component.selectors );
    } else {
        vcIdx = genGetSubComponentOffset(ctx, -1, ast.values[0].component.name);
    }

    let vsIdx;
    if (ast.values[0].pin.selectors.length>0) {
        const vsOffset = genGetSigalOffset(ctx, vcIdx, ast.values[0].pin.name);
        const vsSizes = genGetSignalSizes(ctx, vcIdx, ast.values[0].pin.name);
        vsIdx = genGetOffset(ctx, vsOffset, vsSizes, ast.values[0].pin.selectors );
    } else {
        vsIdx = genGetSigalOffset(ctx, vcIdx, ast.values[0].pin.name);
    }

    const vVal = gen(ctx, ast.values[1]);

    genSetSignal(ctx, vcIdx, vsIdx, vVal);

    return vVal;
}

function genSignalAssignmen(ctx, ast, lName, sels, rName) {
    let vsIdx;
    const signal = ctx.refs[lName];
    if (sels.length>0) {
        const vsOffset = genGetSigalOffset(ctx, -1, signal.label);
        const vsSizes = genGetSignalSizes(ctx, -1, signal.label);
        vsIdx = genGetOffset(ctx, vsOffset, vsSizes, sels );
    } else {
        vsIdx = genGetSigalOffset(ctx, -1, signal.label);
    }

    return genSetSignal(ctx, -1, vsIdx, rName);
}

function genVarAssignment(ctx, ast, lRef, sels, rRef) {

    const left = ctx.refs[lRef];
    const right = ctx.refs[rRef];
    if (!utils.isDefined(left.sizes)) {
        left.sizes = right.sizes;
        left.value = new Array(left.sizes[0]);
    }
    if (!utils.sameSizes(left.sizes.slice(sels.length), right.sizes)) return ctx.throwError(ast, "Sizes do not match");

    const oRef = genGetOffset(ctx, 0, left.sizes, sels);
    const offset = ctx.refs[oRef];

    let instantiated=false;
    if (left.used) {
        instantiateRef(ctx, rRef, right.value);
        instantiated=true;
    } else if (right.used) {
        if (sels.length == 0) {
            instantiateRef(ctx,lRef);
        } else {
            instantiateRef(ctx,lRef, left.value);
        }
        instantiated=true;
    } else if (offset.used) {
        instantiateRef(ctx, rRef, right.value);
        if (sels.length == 0) {
            instantiateRef(ctx,lRef);
        } else {
            instantiateRef(ctx,lRef, left.value);
        }
        instantiated=true;
    }

    if (instantiated) {
        if (offset.used) {
            ctx.code += `ctx->field->copyn(${left.label} + ${offset.label}, ${right.label}, ${right.sizes[0]});\n`;
        } else {
            if (offset.value[0]>0) {
                ctx.code += `ctx->field->copyn(${left.label} + ${offset.value[0]}, ${right.label}, ${right.sizes[0]});\n`;
            } else {
                ctx.code += `ctx->field->copyn(${left.label}, ${right.label}, ${right.sizes[0]});\n`;
            }
        }
    } else {
        if (offset.value[0]>0) {
            for (let i=0; i<right.sizes[0]; i++) left.value[offset.value[0] + i] = right.value[i];
        } else {
            for (let i=0; i<right.sizes[0]; i++) left.value[i] = right.value[i];
        }
    }
}

function genAssignement(ctx, ast) {

    let lRef;
    let sels;

    if (ctx.error) return;

    if (ast.values[0].type == "PIN") return genPinAssignement(ctx, ast);

    if (ast.values[0].type == "DECLARE") {
        lRef = gen(ctx, ast.values[0]);
        if (ctx.error) return;
        sels = [];
    } else {
        lRef = ast.values[0].refId;
        sels = ast.values[0].selectors;
    }


    const left = ctx.refs[lRef];
    if (!left) return ctx.throwError(ast, "Variable does not exists: "+ast.values[0].name);

    // Component instantiation is already done.
    if (left.type == "COMPONENT") return;

    const rRef = gen(ctx, ast.values[1]);
    if  (ctx.error) return;

    if (left.type == "SIGNAL") return genSignalAssignmen(ctx, ast, lRef, sels, rRef);

    if (left.type == "BIGINT") return genVarAssignment(ctx, ast, lRef, sels, rRef);

    return ctx.throwError(ast, "Assigning to invalid");
}

function genConstraint(ctx, ast) {
    const aRef = gen(ctx, ast.values[0]);
    const a = ctx.refs[aRef];
    if (ctx.error) return;
    const bRef = gen(ctx, ast.values[1]);
    const b = ctx.refs[bRef];
    if (ctx.error) return;
    const strErr = ast.fileName + ":" + ast.first_line + ":" + ast.first_column;
    ctx.code += `ctx->checkConstraint(${a.label}, ${b.label}, "${strErr}");`;
}


function genArray(ctx, ast) {
    let subSizes;
    let instantiate = false;
    if (ast.values.length == 0) return ctx.throwError(ast, "Arrays with zero elements not allowed");
    const value = [];
    const refs = [];
    for (let i=0; i<ast.values.length; i++) {
        const eRef = gen(ctx, ast.values[i]);
        const e = ctx.refs[eRef];

        if (i==0) {
            subSizes = e.sizes;
        } else {
            if (!utils.sameSizes(subSizes, e.sizes)) return ctx.throwError(ast, "Heteroeneus array not allowed");
        }
        if (e.used) {
            instantiate = true;
        }
        if (!instantiate) {
            value.push(...e.value);
        }
        refs.push(eRef);
    }

    const newSize = [subSizes[0]*ast.values.length , ...subSizes];

    if (instantiate) {
        const rRef = newRef(ctx, "BIGINT", "_arr", null, newSize);
        instantiateRef(ctx, rRef);
        for (let i=0; i<ast.values.length; i++) {
            const v = ctx.refs[refs[i]];
            const r = ctx.refs[rRef];
            ctx.code += `ctx->field->copyn(${r.label}+${i*subSizes[0]}, ${v.label}, ${subSizes[0]});\n`;
        }
        return rRef;
    } else {
        const rRef = newRef(ctx, "BIGINT", "_arr", value, newSize);
        return rRef;
    }

}


function genFunctionCall(ctx, ast) {
    const params = [];
    for (let i=0; i<ast.params.length; i++) {
        const pRef = gen(ctx, ast.params[i]);
        params.push(ctx.refs[pRef]);
    }

    const fn = ctx.buildFunction(ast.name, params);
    if (ctx.error) return;

    if (fn.type == "VARVAL_CONSTSIZE") {
        const resRef = newRef(ctx, "BIGINT", `_ret${ast.name}Sizes`, null, fn.returnSizes);
        const res = ctx.refs[resRef];
        instantiateRef(ctx, resRef);

        ctx.code +=`${fn.fnName}(ctx, ${res.label}`;
        for (let i=0; i<params.length; i++) {
            if (params[i].used) ctx.code+=`,${params[i].label}`;
        }
        ctx.code+=");\n";

        return resRef;
    } else {
        const res = newRef(ctx, "BIGINT", "_retVal", fn.returnValue, fn.returnSizes);
        return res;
    }
}

function enterConditionalCode(ctx, ast) {
    if (!ctx.conditionalCode) {
        iterateAST(ast, (ast) => {
            if (ast.type == "OP") {
                if (["=", "+=", "*=", "PLUSPLUSLEFT", "PLUSPLUSRIGHT", "MINUSMINUSLEFT", "MINUSMINUSRIGHT"].indexOf(ast.op) >= 0) {
                    let refId;
                    refId = ast.values[0].refId;
                    const ref = ctx.refs[refId];
                    instantiateRef(ctx, refId, ref.value);
                }
            }
        });
        ctx.conditionalCode = 1;
    } else {
        ctx.conditionalCode ++;
    }
}

function leaveConditionalCode(ctx) {
    assert(ctx.conditionalCode, "Leaving conditional code too many times");
    ctx.conditionalCode --;
    if (!ctx.conditionalCode) {
        delete ctx.conditionalCode;
    }
}

function genLoop(ctx, ast) {
    genLoopSrcComment(ctx, ast);
    let inLoop = false;

    if (ast.init) {
        gen(ctx, ast.init);
        if (ctx.error) return;
    }

    let end=false;
    let condVarRef;
    let condVar;


    const condRef = gen(ctx, ast.condition);
    if (ctx.error) return;

    const cond = ctx.refs[condRef];
    if (!utils.sameSizes(cond.sizes, [1,0])) return ctx.throwError(ast.condition, "Operation cannot be done on an array");

    if (cond.used) {
        inLoop = true;
        enterConditionalCode(ctx, ast);
        condVarRef = newRef(ctx, "INT", "_cond");
        condVar = ctx.refs[condVarRef];
        instantiateRef(ctx, condVarRef);

        ctx.code +=
            `${condVar.label} = ctx->field->isTrue(${cond.label});\n` +
            `while (${condVar.label}) {\n`;
    } else {
        if (!utils.isDefined(cond.value)) return ctx.throwError(ast, "condition value not assigned");
        if (cond.value[0].isZero()) end=true;
    }


    while (!end) {

        const oldCode = ctx.code;
        ctx.code = "";

        if (ast.body.type != "BLOCK") genSrcComment(ctx, ast.body);
        gen(ctx, ast.body);
        if (ctx.error) return;

        if (ast.step) {
            gen(ctx, ast.step);
            if (ctx.error) return;
        }

        const condRef2 = gen(ctx, ast.condition);
        if (ctx.error) return;

        const cond2 = ctx.refs[condRef2];

        if (!inLoop) {
            if (cond2.used) {
                ctx.code = oldCode + ctx.code;
                inLoop = true;
                enterConditionalCode(ctx, ast);
                condVar = newRef(ctx, "INT", "_cond");
                instantiateRef(ctx, condVar);

                ctx.code =
                    oldCode +
                    ctx.code +
                    `${condVar.label} = ctx->field->isTrue(${cond2.label});\n` +
                    `while (${condVar.label}) {\n`;
            } else {
                ctx.code = oldCode  + ctx.code;
                if (cond2.value[0].isZero()) end=true;
            }
        } else {
            ctx.code =
                oldCode +
                utils.ident(
                    ctx.code +
                    `${condVar.label} = ctx->field->isTrue(${cond2.label});\n`);
            end=true;
        }
    }
    if (inLoop) {
        ctx.code += "}\n";
        leaveConditionalCode(ctx);
    }
    ctx.scopes.pop();
}

function genIf(ctx, ast) {
    genIfSrcComment(ctx, ast);
    const condRef = gen(ctx, ast.condition);
    if (ctx.error) return;
    const cond = ctx.refs[condRef];
    if (!utils.sameSizes(cond.sizes, [1,0])) return ctx.throwError(ast.condition, "Operation cannot be done on an array");

    if (cond.used) {
        enterConditionalCode(ctx, ast);

        ctx.code += `if (ctx->field->isTrue(${cond.label})) {\n`;

        const oldCode = ctx.code;
        ctx.code = "";

        gen(ctx, ast.then);
        if (ctx.error) return;

        ctx.code = oldCode + utils.ident(ctx.code);

        if (ast.else) {
            ctx.code += "} else {\n";
            const oldCode = ctx.code;
            ctx.code = "";
            gen(ctx, ast.else);
            if (ctx.error) return;
            ctx.code = oldCode + utils.ident(ctx.code);
        }

        ctx.code += "}\n";

    } else {
        if (!utils.isDefined(cond.value)) return ctx.throwError(ast, "condition value not assigned");
        if (!cond.value[0].isZero()) {
            gen(ctx, ast.then);
        } else {
            if (ast.else) {
                gen(ctx, ast.else);
            }
        }
    }
}


function genReturn(ctx, ast) {
    const vRef = gen(ctx, ast.value);
    const v= ctx.refs[vRef];
    if (ctx.returnSizes) {
        if (!utils.sizesEqual(v.sizes, ctx.returnSizes)) return ctx.throwError(ast, "Diferent return sizes");
    } else {
        ctx.returnSizes = v.sizes;
    }
    if (ctx.conditionalCode) {
        instantiateRef(ctx, vRef, v.value);
    }
    if (v.used) {
        ctx.code += `ctx->field->copyn(__retValue, ${v.label}, ${v.sizes[0]});\n`;
    } else {
        if (!utils.isDefined(v.value)) return ctx.throwError(ast, "Returning an unknown value");
        if (!utils.isDefined(ctx.returnValue))  {
            ctx.returnValue = v.value;
        }
    }
    ctx.code += "goto returnFunc;\n";
    return vRef;
}



function genSignalAssignConstraint(ctx, ast) {
    const res = genAssignement(ctx, ast);
    //    genConstraint(ctx, ast);
    return res;
    //    return genVarAssignement(ctx, ast);
}

function genVarAddAssignement(ctx, ast) {
    return genAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "+", values: ast.values}]});
}

function genVarMulAssignement(ctx, ast) {
    return genAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "*", values: ast.values}]});
}

function genOpOp(ctx, ast, op, lr) {

    if (ast.values[0].type != "VARIABLE") return ctx.throwError(ast, "incrementing a non variable");

    const vRef = ast.values[0].refId;

    const vevalRef = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const veval = ctx.refs[vevalRef];

    if (veval.type != "BIGINT") return ctx.throwError(ast, "incrementing a non variable");

    const resRef = newRef(ctx, "BIGINT", "_tmp");
    const res = ctx.refs[resRef];
    if (veval.used) {
        instantiateRef(ctx, resRef);
        ctx.code += `ctx->field->${op}(${res.label}, ${veval.label}, &(ctx->field->one));\n`;
    } else {
        res.value = [ctx.field[op](veval.value[0], bigInt(1))];
    }
    genVarAssignment(ctx, ast, vRef, ast.values[0].selectors, resRef);
    if (lr == "RIGHT") {
        return vevalRef;
    } else if (lr == "LEFT") {
        return resRef;
    }
}

function genOp(ctx, ast, op, nOps) {
    const vals = [];
    const valRefs = [];

    var anyUsed=false;

    for (let i=0; i<nOps; i++) {
        const  ref = gen(ctx, ast.values[i]);
        if (ctx.error) return;
        let v = ctx.refs[ref];
        valRefs.push(ref);
        vals.push(v);

        if (!utils.sameSizes(v.sizes, [1,0])) return ctx.throwError(ast, "Operation cannot be done on an array");
        if (  (!v.used)
            &&(  (!utils.isDefined(v.value))
               ||(!utils.isDefined(v.value[0]))))
            return ctx.throwError(ast, "Using a not assigned varialble: ");

        if (v.used) anyUsed=true;
    }

    let rRef;
    if (anyUsed) {
        for (let i=0; i<nOps; i++) {
            if (!vals[i].used) {
                valRefs[i] = instantiateConstant(ctx, vals[i].value);
                vals[i] = ctx.refs[valRefs[i]];
            }
        }

        rRef = newRef(ctx, "BIGINT", "_tmp");
        instantiateRef(ctx, rRef);
        const r = ctx.refs[rRef];
        let c = `ctx->field->${op}(${r.label}`;
        for (let i=0; i<nOps; i++) {
            c+=`,${vals[i].label}`;
        }
        c += ");\n";
        ctx.code += c;
    } else {
        const params = [];
        for (let i=0; i<nOps; i++) {
            params.push(vals[i].value[0]);
        }
        rRef = newRef(ctx, "BIGINT", "_tmp", ctx.field[op](...params));
    }
    return rRef;
}


function genTerCon(ctx, ast) {
    const condRef = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const cond = ctx.refs[condRef];
    if (!utils.sameSizes(cond.sizes, [1,0])) return ctx.throwError(ast.condition, "Operation cannot be done on an array");

    let oldCode;
    if (cond.used) {
        enterConditionalCode(ctx, ast);

        const rLabel = ctx.getUniqueName("_ter");

        ctx.codeHeader += `PBigInt ${rLabel};\n`;
        ctx.code += `if (ctx->field->isTrue(${cond.label})) {\n`;

        oldCode = ctx.code;
        ctx.code = "";

        const thenRef = gen(ctx, ast.values[1]);
        if (ctx.error) return;
        const then = ctx.refs[thenRef];

        ctx.code = oldCode + utils.ident(ctx.code);

        ctx.code += `${rLabel} = ${then.label};\n`;

        ctx.code += "} else {\n";

        oldCode = ctx.code;
        ctx.code = "";
        const elseRef = gen(ctx, ast.values[2]);
        if (ctx.error) return;
        const els = ctx.refs[elseRef];

        ctx.code = oldCode + utils.ident(ctx.code);

        ctx.code += `${rLabel} = ${els.label};\n`;

        ctx.code += "}\n";


        if (!utils.sameSizes(then.sizes, els.sizes)) return ctx.throwError(ast, "Ternary op must return the same sizes");

        const refId = ctx.refs.length;
        ctx.refs.push({
            type: "BIGINT",
            sizes: then.sizes,
            used: true,
            label: rLabel
        });

        return refId;

    } else {
        if (!utils.isDefined(cond.value)) return ctx.throwError(ast, "condition value not assigned");
        if (!cond.value[0].isZero()) {
            return gen(ctx, ast.values[1]);
        } else {
            return gen(ctx, ast.values[2]);
        }
    }
}

function genInclude(ctx, ast) {
    return ast.block ? gen(ctx, ast.block) : "";
}


