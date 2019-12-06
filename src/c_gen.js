const bigInt = require("big-integer");
const utils = require("./utils");
const assert = require("assert");

module.exports.gen =  gen;
module.exports.newRef = newRef;

function newRef(ctx, type, _name, value, sizes) {
    let name;
    if (!_name) {
        name = ctx.getTmpName();
    } else {
        if (_name[0] =="_") {
            name = ctx.getTmpName(_name);
        } else {
            name = _name;
        }
    }
    if (Array.isArray(sizes)) {
        // sizes = sizes;
    } else if (utils.isDefined(value)) {
        sizes = utils.accSizes(utils.extractSizes(value));
    } else {
        sizes = [1, 0];
    }

    const scope = ctx.scopes[ctx.scopes.length-1];
    if (scope[name]) return error(ctx, null, "Variable already exists: " + name);

    const label = scope._prefix + name;
    scope[name] = {
        stack: true,
        type: type,
        used: false,
        sizes: sizes,
        label: label
    };

    if (utils.isDefined(value)) {
        scope[name].value = utils.flatArray(value);
    }

    return name;
}

function instantiateRef(ctx, name, initValue) {
    const v = getScope(ctx, name);
    if (!v.stack) return error(ctx, null, "Using a non existing var: " + name);
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
                    if (ctx.conditionalCode) {
                        ctx.conditionalCodeHeader += c;
                    } else {
                        ctx.code += c;
                    }
                }
            }
        }
    }
}

function instantiateConstant(ctx, value) {
    const sizes = utils.accSizes(utils.extractSizes(value));
    const flatedValue = utils.flatArray(value);
    const res = ctx.getTmpName("_const");
    ctx.codeHeader += `PBigInt ${res};\n`;
    ctx.codeHeader += `${res} = ctx->allocBigInts(${sizes[0]});\n`;
    for (let i=0; i<flatedValue.length; i++) {
        ctx.codeHeader += `mpz_set_str(${res}[${i}], "${flatedValue[i].toString(10)}", 10);\n`;
    }
    ctx.codeFooter += `ctx->freeBigInts(${res}, ${sizes[0]});\n`;
    return res;
}


function error(ctx, ast, errStr) {
    ctx.error = {
        pos:   {
            first_line: ast.first_line,
            first_column: ast.first_column,
            last_line: ast.last_line,
            last_column: ast.last_column
        },
        errStr: errStr,
        ast: ast,
        message: errStr
    };
}


function getScope(ctx, name) {
    for (let i=ctx.scopes.length-1; i>=0; i--) {
        if (ctx.scopes[i][name]) return ctx.scopes[i][name];
    }
    return null;
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
            return genBinaryOp(ctx, ast, "add");
        } else if (ast.op == "-") {
            return genSub(ctx, ast);
        } else if (ast.op == "UMINUS") {
            return genUMinus(ctx, ast);
        } else if (ast.op == "*") {
            return genBinaryOp(ctx, ast, "mul");
        } else if (ast.op == "%") {
            return genMod(ctx, ast);
        } else if (ast.op == "PLUSPLUSRIGHT") {
            return genPlusPlusRight(ctx, ast);
        } else if (ast.op == "PLUSPLUSLEFT") {
            return genPlusPlusLeft(ctx, ast);
        } else if (ast.op == "MINUSMINUSRIGHT") {
            return genMinusMinusRight(ctx, ast);
        } else if (ast.op == "MINUSMINUSLEFT") {
            return genMinusMinusLeft(ctx, ast);
        } else if (ast.op == "**") {
            return genExp(ctx, ast);
        } else if (ast.op == "/") {
            return genDiv(ctx, ast);
        } else if (ast.op == "\\") {
            return genIDiv(ctx, ast);
        } else if (ast.op == "&") {
            return genBAnd(ctx, ast);
        } else if (ast.op == "&&") {
            return genAnd(ctx, ast);
        } else if (ast.op == "||") {
            return genOr(ctx, ast);
        } else if (ast.op == "<<") {
            return genShl(ctx, ast);
        } else if (ast.op == ">>") {
            return genShr(ctx, ast);
        } else if (ast.op == "<") {
            return genBinaryOp(ctx, ast, "lt");
        } else if (ast.op == ">") {
            return genGt(ctx, ast);
        } else if (ast.op == "<=") {
            return genLte(ctx, ast);
        } else if (ast.op == ">=") {
            return genGte(ctx, ast);
        } else if (ast.op == "==") {
            return genEq(ctx, ast);
        } else if (ast.op == "!=") {
            return genNeq(ctx, ast);
        } else if (ast.op == "?") {
            return genTerCon(ctx, ast);
        } else {
            error(ctx, ast, "Invalid operation: " + ast.op);
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
            error(ctx, ast, "Invalid declaration: " + ast.declareType);
        }
    } else if (ast.type == "FUNCTIONCALL") {
        return genFunctionCall(ctx, ast);
    } else if (ast.type == "BLOCK") {
        return genBlock(ctx, ast);
    } else if (ast.type == "COMPUTE") {
        return genCompute(ctx, ast);
    } else if (ast.type == "FOR") {
        return genFor(ctx, ast);
    } else if (ast.type == "WHILE") {
        return genWhile(ctx, ast);
    } else if (ast.type == "IF") {
        return genIf(ctx, ast);
    } else if (ast.type == "RETURN") {
        return genReturn(ctx, ast);
    } else if (ast.type == "INCLUDE") {
        return genInclude(ctx, ast);
    } else if (ast.type == "ARRAY") {
        return genArray(ctx, ast);
    } else {
        error(ctx, ast, "GEN -> Invalid AST node type: " + ast.type);
    }
}

function genBlock(ctx, ast) {
    ctx.scopes.push({_prefix : ""});
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

function genForSrcComment(ctx, ast) {
    const init = getSource(ctx, ast.init);
    const condition = getSource(ctx, ast.condition);
    const step = getSource(ctx, ast.step);
    ctx.code += `\n/* for (${init},${condition},${step}) */\n`;
}


function genDeclareComponent(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length - 1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    scope[ast.name.name] = {
        type: "COMPONENT",
        label: ast.name.name
    };

    return ast.name.name;
}

function genDeclareSignal(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    const res = {
        type: "SIGNAL",
        label: ast.name.name
    };

    scope[ast.name.name] = res;

    return res;
}

function genDeclareVariable(ctx, ast) {

    const scope = ctx.scopes[ctx.scopes.length-1];

    const varName = ast.name.name;
    const labelName = scope._prefix + ast.name.name;

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (typeof scope[varName] != "undefined") return error(ctx, ast, "Name already exists: "+varName);

    let sizes;

    if (ast.name.selectors.length>0) {
        sizes=[];
        for (let i=0; i< ast.name.selectors.length; i++) {
            const sizeName = gen(ctx, ast.name.selectors[i]);
            const size = getScope(ctx, sizeName);
            if (size.sizes[0] != 1) return error(ctx, ast, "A selector cannot be an array");
            if (ctx.error) return;

            if (size.used) {
                return error(ctx, ast, "Variable size variables not allowed");
            } else {
                sizes.push(size.value[0].toJSNumber());
            }
        }
        sizes = utils.accSizes(sizes);
    } else {
        sizes = null; // If not sizes, the sized are defined in the first assignement.
    }

    const res = scope[varName] = {
        stack: true,
        type: "BIGINT",
        sizes: sizes,
        label: labelName,
        used: false,
    };

    if (sizes) {
        res.value = new Array(sizes[0]);
    }

    scope[varName] = res;

    return varName;
}

function genNumber(ctx, ast) {
    return newRef(ctx, "BIGINT", "_num", ast.value);
}



function genGetOffset(ctx, vOffset, vSizes, sels) {

    let rN = 0;
    let rStr = "";
    let iOffset;

    if (vOffset) {
        iOffset = getScope(ctx, vOffset);
        if (iOffset.used) {
            rStr += iOffset.label;
        } else {
            rN += iOffset.value.toJSNumber();
        }
    }

    if ((sels)&&(sels.length>0)) {

        let iSizes;
        if (typeof vSizes == "string") {
            iSizes = getScope(ctx, vSizes);
        } else {
            iSizes = {
                used: false,
                sizes: vSizes
            };
        }

        for (let i=0; i<sels.length; i++) {
            const vIdx = gen(ctx, sels[i]);
            const iIdx = getScope(ctx, vIdx);

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
                    rStr += vIdx;
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
        if ((vOffset)&&(rStr == iOffset.label)) {
            return vOffset;
        } else {
            const res = newRef(ctx, "INT", "_offset");
            instantiateRef(ctx, res);
            ctx.code += `${res} = ${rStr};\n`;
            return res;
        }
    }
}

function genVariable(ctx, ast) {
    const v = getScope(ctx, ast.name);

    const l = ast.selectors ? ast.selectors.length : 0;

    if (v.type == "SIGNAL") {
        let vOffset;
        if (l>0) {
            const vsOffset = genGetSigalOffset(ctx, "ctx->cIdx", ast.name);
            const vsSizes = genGetSignalSizes(ctx, "ctx->cIdx", ast.name);
            vOffset = genGetOffset(ctx, vsOffset, vsSizes, ast.selectors );
        } else {
            vOffset = genGetSigalOffset(ctx, "ctx->cIdx", ast.name);
        }
        return genGetSignal(ctx, "ctx->cIdx", vOffset);

    } else if (v.type == "BIGINT") {
        const vOffset = genGetOffset(ctx, 0, v.sizes, ast.selectors );
        const offset = getScope(ctx, vOffset);
        if (v.used) {
            if (offset.used) {
                const resN = newRef(ctx, "BIGINT", "_v", null, v.sizes.slice(l));
                const res = getScope(ctx, resN);
                res.used = true;
                ctx.codeHeader += `PBigInt ${res.label};\n`;
                ctx.code += `${res.label} = ${ast.name} + ${offset.label};\n`;
                return resN;
            } else if (offset.value) {
                const resN = newRef(ctx, "BIGINT", "_v", null, v.sizes.slice(l));
                const res = getScope(ctx, resN);
                res.used = true;
                ctx.codeHeader += `PBigInt ${res.label};\n`;
                ctx.code += `${res.label} = ${ast.name} + ${offset.value};\n`;
                return resN;
            } else {
                return ast.name;
            }
        } else {
            if (offset.used) {
                instantiateRef(ctx, ast.name, v.value);
                const res = newRef(ctx, "BIGINT", "_v", null, v.sizes.slice(l));
                res.used = true;
                ctx.codeHeader += `PBigInt ${res};\n`;
                ctx.code += `${res} = ${ast.name} + ${offset.label};\n`;
                return res;
            } else {
                // return newSubRef(ctx, ast.name, ast.selectors);
                return newRef(ctx, "BIGINT", "_v", v.value.slice(offset.value[0], offset.value[0] + v.sizes[l]),v.sizes.slice(l));
            }
        }
    }

    const sels = [];
    for (let i=0; i<ast.selectors.length; i++) {
        sels.push(gen(ctx, ast.selectors[i]));
        if (ctx.error) return;
    }

    if (!v) {
        return error(ctx, ast, "Invalid left operand");
    }
    if (v.type == "VARIABLE") {
        return `ctx.getVar("${ast.name}",[${sels.join(",")}])`;
    } else if (v.type == "SIGNAL") {
        return `ctx.getSignal("${ast.name}", [${sels.join(",")}])`;
    } else {
        error(ctx, ast, "Invalid Variable type");
    }
}


function genPin(ctx, ast) {
    let vcIdx;
    if (ast.component.selectors.length>0) {
        const vcOffset = genGetSubComponentOffset(ctx, "ctx->cIdx", ast.component.name);
        const vcSizes = genGetSubComponentSizes(ctx, "ctx->cIdx", ast.component.name);
        vcIdx = genGetOffset(ctx, vcOffset, vcSizes, ast.component.selectors );
    } else {
        vcIdx = genGetSubComponentOffset(ctx, "ctx->cIdx", ast.component.name);
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

function genGetSubComponentOffset(ctx, cIdx, label) {
    const vOffset = newRef(ctx, "INT", "_compIdx");
    instantiateRef(ctx, vOffset);

    const h = utils.fnvHash(label);
    ctx.code += `${vOffset} = ctx->getSubComponentOffset(${cIdx}, 0x${h}LL /* ${label} */);\n`;
    return vOffset;
}

function genGetSubComponentSizes(ctx, cIdx, label) {
    const vSizes = newRef(ctx, "SIZES", "_compSizes");
    instantiateRef(ctx, vSizes);

    const h = utils.fnvHash(label);
    ctx.code += `${vSizes} = ctx->getSubComponentSizes(${cIdx}, 0x${h}LL /* ${label} */);\n`;
    return vSizes;
}

function genGetSigalOffset(ctx, sIdx, label) {
    const vOffset = newRef(ctx, "INT", "_sigIdx");
    instantiateRef(ctx, vOffset);

    const h = utils.fnvHash(label);
    ctx.code += `${vOffset} = ctx->getSignalOffset(${sIdx}, 0x${h}LL /* ${label} */);\n`;
    return vOffset;
}

function genGetSignalSizes(ctx, sIdx, label) {
    const vSizes = newRef(ctx, "SIZES", "_sigSizes");
    instantiateRef(ctx, vSizes);

    const h = utils.fnvHash(label);
    ctx.code += `${vSizes} = ctx->getSignalSizes(${sIdx}, 0x${h}LL /* ${label} */);\n`;
    return vSizes;
}

function genSetSignal(ctx, cIdx, sIdx, value) {
    const v = getScope(ctx, value);
    if (!v.used) {
        value = instantiateConstant(ctx, v.value);
    }
    ctx.code += `ctx->setSignal(${cIdx}, ${sIdx}, ${value});\n`;

    return value;
}

function genGetSignal(ctx, cIdx, sIdx) {
    const res = newRef(ctx, "BIGINT", "_sigValue");
    instantiateRef(ctx, res);
    ctx.code += `ctx->getSignal(${cIdx}, ${sIdx}, ${res});\n`;
    return res;
}

function genPinAssignement(ctx, ast) {
    let vcIdx;
    if (ast.values[0].component.selectors.length>0) {
        const vcOffset = genGetSubComponentOffset(ctx, "ctx->cIdx", ast.values[0].component.name);
        const vcSizes = genGetSubComponentSizes(ctx, "ctx->cIdx", ast.values[0].component.name);
        vcIdx = genGetOffset(ctx, vcOffset, vcSizes, ast.values[0].component.selectors );
    } else {
        vcIdx = genGetSubComponentOffset(ctx, "ctx->cIdx", ast.values[0].component.name);
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
    if (sels.length>0) {
        const vsOffset = genGetSigalOffset(ctx, "ctx->cIdx", lName);
        const vsSizes = genGetSignalSizes(ctx, "ctx->cIdx", lName);
        vsIdx = genGetOffset(ctx, vsOffset, vsSizes, sels );
    } else {
        vsIdx = genGetSigalOffset(ctx, "ctx->cIdx", lName);
    }

    return genSetSignal(ctx, "ctx->cIdx", vsIdx, rName);
}

function genVarAssignment(ctx, ast, lName, sels, rName) {

    const left = getScope(ctx, lName);
    const right = getScope(ctx, rName);
    if (!utils.isDefined(left.sizes)) {
        left.sizes = right.sizes;
        left.value = new Array(left.sizes[0]);
    }
    if (!utils.sameSizes(left.sizes.slice(sels.length), right.sizes)) return error(ctx, ast, "Sizes do not match");

    const oName = genGetOffset(ctx, 0, left.sizes, sels);
    const offset = getScope(ctx, oName);

    let instantiated=false;
    if (left.used) {
        instantiateRef(ctx, rName, right.value);
        instantiated=true;
    } else if (right.used) {
        if (sels.length == 0) {
            instantiateRef(ctx,lName);
        } else {
            instantiateRef(ctx,lName, left.value);
        }
        instantiated=true;
    } else if (offset.used) {
        instantiateRef(ctx, rName, right.value);
        if (sels.length == 0) {
            instantiateRef(ctx,lName);
        } else {
            instantiateRef(ctx,lName, left.value);
        }
        instantiated=true;
    }

    if (instantiated) {
        if (offset.used) {
            ctx.code += `ctx->field->copyn(${lName} + ${oName}, ${rName}, ${right.sizes[0]});\n`;
        } else {
            if (offset.value[0]>0) {
                ctx.code += `ctx->field->copyn(${lName} + ${offset.value[0]}, ${rName}, ${right.sizes[0]});\n`;
            } else {
                ctx.code += `ctx->field->copyn(${lName}, ${rName}, ${right.sizes[0]});\n`;
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

    let lName;
    let sels;

    if (ctx.error) return;

    if (ast.values[0].type == "PIN") return genPinAssignement(ctx, ast);

    if (ast.values[0].type == "DECLARE") {
        lName = gen(ctx, ast.values[0]);
        if (ctx.error) return;
        sels = [];
    } else {
        lName = ast.values[0].name;
        sels = ast.values[0].selectors;
    }


    const left = getScope(ctx, lName);
    if (!left) return error(ctx, ast, "Variable does not exists: "+ast.values[0].name);

    // Component instantiation is already done.
    if (left.type == "COMPONENT") {
        ctx.last = lName;
        return;
    }

    if (ctx.conditionalCode && !left.used) {
        instantiateRef(ctx, lName, left.value);
    }

    const rName = gen(ctx, ast.values[1]);

    if (left.type == "SIGNAL") return genSignalAssignmen(ctx, ast, lName, sels, rName);

    if (left.type == "BIGINT") return genVarAssignment(ctx, ast, lName, sels, rName);

    return error(ctx, ast, "Assigning to invalid");
}

function genConstraint(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    const strErr = ast.fileName + ":" + ast.first_line + ":" + ast.first_column;
    ctx.code += `ctx->checkConstraint(${a}, ${b}, "${strErr}");`;
}


function genArray(ctx, ast) {
    let subSizes;
    let instantiate = false;
    if (ast.values.length == 0) return error(ctx, ast, "Arrays with zero elements not allowed");
    const value = [];
    const names = [];
    for (let i=0; i<ast.values.length; i++) {
        const eName = gen(ctx, ast.values[i]);
        const e = getScope(ctx, eName);

        if (i==0) {
            subSizes = e.sizes;
        } else {
            if (!utils.sameSizes(subSizes, e.sizes)) return error(ctx, ast, "Heteroeneus array not allowed");
        }
        if (e.used) {
            instantiate = true;
        }
        if (!instantiate) {
            value.push(...e.value);
        }
        names.push(eName);
    }

    const newSize = [subSizes[0]*ast.values.length , ...subSizes];

    if (instantiate) {
        const rName = newRef(ctx, "BIGINT", "_arr", null, newSize);
        instantiateRef(ctx, rName);
        for (let i=0; i<ast.values.length; i++) {
            ctx.code += `ctx->field->copyn(${rName}+${i*subSizes[0]}, ${names[i]}, ${subSizes[0]});\n`;
        }
        return rName;
    } else {
        const rName = newRef(ctx, "BIGINT", "_arr", value, newSize);
        return rName;
    }

}


function genFunctionCall(ctx, ast) {
    const params = [];
    for (let i=0; i<ast.params.length; i++) {
        const pName = gen(ctx, ast.params[i]);
        params.push(getScope(ctx, pName));
    }

    const fn = ctx.buildFunction(ast.name, params);

    if (fn.type == "VARVAL_CONSTSIZE") {
        const res = newRef(ctx, "BIGINT", `_ret${ast.name}Sizes`, null, fn.returnSizes);
        instantiateRef(ctx, res);

        ctx.code +=`${fn.fnName}(ctx, ${res}`;
        for (let i=0; i<params.length; i++) {
            if (params[i].used) ctx.code+=`,${params[i].label}`;
        }
        ctx.code+=");\n";

        return res;
    } else {
        const res = newRef(ctx, "BIGINT", "_retVal", fn.returnValue, fn.returnSizes);
        return res;
    }
}

function enterConditionalCode(ctx) {
    if (!ctx.conditionalCode) {
        ctx.conditionalCode = 1;
        ctx.conditionalCodeHeader = "";
        ctx.code += "__CONDITIONAL_CODE_HEADER__";
    } else {
        ctx.conditionalCode ++;
    }
}

function leaveConditionalCode(ctx) {
    assert(ctx.conditionalCode, "Leaving conditional code too many times");
    ctx.conditionalCode --;
    if (!ctx.conditionalCode) {
        ctx.code = ctx.code.replace("__CONDITIONAL_CODE_HEADER__",
            "// Conditional Code Header\n" +
            ctx.conditionalCodeHeader+
            "\n");
        delete ctx.conditionalCodeHeader;
        delete ctx.conditionalCode;
    }
}

function genFor(ctx, ast) {
    genForSrcComment(ctx, ast);
    let inLoop = false;
    ctx.scopes.push({_prefix : ""});
    gen(ctx, ast.init);
    if (ctx.error) return;

    let end=false;
    let condVar;


    const condName = gen(ctx, ast.condition);
    const cond = getScope(ctx, condName);
    if (!utils.sameSizes(cond.sizes, [1,0])) return error(ctx, ast.condition, "Operation cannot be done on an array");

    if (cond.used) {
        inLoop = true;
        enterConditionalCode(ctx);
        condVar = newRef(ctx, "INT", "_cond");
        instantiateRef(ctx, condVar);

        ctx.code +=
            `${condVar} = ctx->field->isTrue(${condName});\n` +
            `while (${condVar}) {\n`;
    } else {
        if (!utils.isDefined(cond.value)) return error(ctx, ast, "condition value not assigned");
        if (cond.value[0].isZero()) end=true;
    }


    while (!end) {

        const oldCode = ctx.code;
        ctx.code = "";

        if (ast.body.type != "BLOCK") genSrcComment(ctx, ast.body);
        gen(ctx, ast.body);
        if (ctx.error) return;

        gen(ctx, ast.step);
        if (ctx.error) return;

        const condName2 = gen(ctx, ast.condition);
        const cond2 = getScope(ctx, condName2);

        if (!inLoop) {
            if (cond2.used) {
                ctx.code = oldCode + ctx.code;
                inLoop = true;
                enterConditionalCode(ctx);
                condVar = newRef(ctx, "INT", "_cond");
                instantiateRef(ctx, condVar);

                ctx.code =
                    oldCode +
                    ctx.code +
                    `${condVar} = ctx->field->isTrue(${condName2});\n` +
                    `while (${condVar}) {\n`;
            } else {
                ctx.code = oldCode  + ctx.code;
                if (cond2.value[0].isZero()) end=true;
            }
        } else {
            ctx.code =
                oldCode +
                utils.ident(
                    ctx.code +
                    `${condVar} = ctx->field->isTrue(${condName2});\n`);
            end=true;
        }
    }
    if (inLoop) {
        ctx.code += "}\n";
        leaveConditionalCode(ctx);
    }
    ctx.scopes.pop();
}

function genWhile(ctx, ast) {
    const condition = gen(ctx, ast.condition);
    if (ctx.error) return;
    const body = gen(ctx, ast.body);
    if (ctx.error) return;
    return `while (bigInt(${condition}).neq(bigInt(0))) {\n${body}\n}\n`;
}

function genCompute(ctx, ast) {
    const body = gen(ctx, ast.body);
    if (ctx.error) return;
    return `{\n${body}\n}\n`;
}

function genIf(ctx, ast) {
    const condition = gen(ctx, ast.condition);
    if (ctx.error) return;
    const thenBody = gen(ctx, ast.then);
    if (ctx.error) return;
    if (ast.else) {
        const elseBody = gen(ctx, ast.else);
        if (ctx.error) return;
        return `if (bigInt(${condition}).neq(bigInt(0))) {\n${thenBody}\n} else {\n${elseBody}\n}\n`;
    } else {
        return `if (bigInt(${condition}).neq(bigInt(0))) {\n${thenBody}\n}\n`;
    }
}


function genReturn(ctx, ast) {
    const vName = gen(ctx, ast.value);
    const v= getScope(ctx, vName);
    if (ctx.returnSizes) {
        if (!utils.sizesEqual(vName.sizes, ctx.returnSizes)) return error(ctx, ast, "Diferent return sizes");
    } else {
        ctx.returnSizes = v.sizes;
    }
    if (ctx.conditionalCode) {
        instantiateRef(ctx, vName, vName.value);
    }
    if (v.used) {
        ctx.code += `ctx->field->copyn(__retValue, ${vName}, ${v.sizes[0]});\n`;
    } else {
        if (!utils.isDefined(v.value)) return error(ctx, ast, "Returning an unknown value");
        if (!utils.isDefined(ctx.returnValue))  {
            ctx.returnValue = v.value;
        }
    }
    ctx.code += "goto returnFunc;\n";
    return vName;
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

function genPlusPlusRight(ctx, ast) {
    return `(${genAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "+", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]})}).add(__P__).sub(bigInt(1)).mod(__P__)`;
}

function genPlusPlusLeft(ctx, ast) {
    return genAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "+", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]});
}

function genMinusMinusRight(ctx, ast) {
    return `(${genAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "-", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]})}).add(__P__).sub(bigInt(1)).mod(__P__)`;
}

function genMinusMinusLeft(ctx, ast) {
    return genAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "-", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]});
}

function genBinaryOp(ctx, ast, op) {
    let aName = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const a = getScope(ctx, aName);

    let bName = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    const b = getScope(ctx, bName);

    if ((!a.used)&&(!utils.isDefined(a.value))) return error(ctx, ast, "Using a not assigned varialble: "+aName);
    if ((!b.used)&&(!utils.isDefined(b.value))) return error(ctx, ast, "Using a not assigned varialble: "+bName);
    if (!utils.sameSizes(a.sizes, [1,0])) return error(ctx, ast, "Operation cannot be done on an array");
    if (!utils.sameSizes(b.sizes, [1,0])) return error(ctx, ast, "Operation cannot be done on an array");

    let rName;
    if (a.used || b.used) {
        if (!a.used) {
            aName = instantiateConstant(ctx, a.value);
        }
        if (!b.used) {
            bName = instantiateConstant(ctx, b.value);
        }

        rName = newRef(ctx, "BIGINT", "_tmp");
        instantiateRef(ctx, rName);
        ctx.code += `ctx->field->${op}(${rName},${aName}, ${bName});\n`;
    } else {
        rName = newRef(ctx, "BIGINT", "_tmp", ctx.field[op](a.value[0], b.value[0]));
    }
    return rName;
}


function genSub(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).add(__P__).sub(bigInt(${b})).mod(__P__)`;
}

function genDiv(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;

    return `bigInt(${a}).mul( bigInt(${b}).inverse(__P__) ).mod(__P__)`;
}

function genIDiv(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;

    return `bigInt(${a}).div( bigInt(${b}))`;
}

function genExp(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).modPow(bigInt(${b}), __P__)`;
}

function genBAnd(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).and(bigInt(${b})).and(__MASK__)`;
}

function genAnd(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `((bigInt(${a}).neq(bigInt(0)) && bigInt(${b}).neq(bigInt(0))) ? bigInt(1) : bigInt(0))`;
}

function genOr(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `((bigInt(${a}).neq(bigInt(0)) || bigInt(${b}).neq(bigInt(0))) ? bigInt(1) : bigInt(0))`;
}

function genShl(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${b}).greater(bigInt(256)) ? 0 : bigInt(${a}).shl(bigInt(${b})).and(__MASK__)`;
}

function genShr(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${b}).greater(bigInt(256)) ? 0 : bigInt(${a}).shr(bigInt(${b})).and(__MASK__)`;
}

function genMod(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).mod(bigInt(${b}))`;
}

function genGt(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).gt(bigInt(${b})) ? 1 : 0`;
}

function genLte(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).lesserOrEquals(bigInt(${b})) ? 1 : 0`;
}

function genGte(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).greaterOrEquals(bigInt(${b})) ? 1 : 0`;
}

function genEq(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `(bigInt(${a}).eq(bigInt(${b})) ? 1 : 0)`;
}

function genNeq(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `(bigInt(${a}).eq(bigInt(${b})) ? 0 : 1)`;
}

function genUMinus(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    return `__P__.sub(bigInt(${a})).mod(__P__)`;
}

function genTerCon(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    const c = gen(ctx, ast.values[2]);
    if (ctx.error) return;
    return `bigInt(${a}).neq(bigInt(0)) ? (${b}) : (${c})`;
}

function genInclude(ctx, ast) {
    return ast.block ? gen(ctx, ast.block) : "";
}


