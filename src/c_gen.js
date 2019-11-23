const bigInt = require("big-integer");
const utils = require("./utils");

module.exports =  gen;


function newRef(ctx, type, _name, value, _sizes) {
    const isValue = ((typeof(value) != "undefined")&&(value != null));
    let name;
    let sizes;
    if (!_name) {
        name = ctx.getTmpName();
    } else {
        if (_name[0] =="_") {
            name = ctx.getTmpName(_name);
        } else {
            name = _name;
        }
    }
    if (typeof(_sizes) == "string") {
        sizes = _sizes;
    } else if (Array.isArray(_sizes)) {
        sizes = newSizes(ctx, _sizes);
    } else if (isValue) {
        sizes = newSizes(ctx, utils.extractSizes(value));
    } else {
        sizes = newSizes(ctx, []);
    }

    const scope = ctx.scopes[ctx.scopes.length-1];
    if (scope[name]) return error("Variable already exists: " + name);

    const label = scope._prefix + name;
    scope[name] = {
        stack: true,
        type: type,
        used: false,
        sizes: sizes,
        label: label
    };

    if (isValue) {
        scope[name].value = value;
    }

    return name;
}

function newSizes(ctx, sizes) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    const name = ctx.getTmpName("_sz");

    scope[name] = {
        stack: true,
        type: "SIZES",
        used: false,
        dim: sizes.length,
        label: name,
        value: sizes
    };

    return name;
}


function instantiateRef(ctx, name) {
    const v = getScope(ctx, name);
    if (!v.stack) return error("Using a non existing var: " + name);
    if (v.used) return;

    if (v.type=="BIGINT") {

        const iSize = getScope(ctx, v.sizes);

        if (iSize.used) {
            const labelSize = iSize.label;
            ctx.codeHeader += `PBigInt ${v.label};\n`;
            ctx.code += `${v.label} = ctx->allocBigInts(${labelSize});\n`;
            ctx.codeFooter += `ctx->freeBigInts(${v.label}, ${labelSize});\n`;
        } else if (iSize.value) {
            const labelSize = ctx.addSizes(iSize.value);
            ctx.codeHeader += `PBigInt ${v.label} = ctx->allocBigInts(${labelSize});\n`;
            ctx.codeFooter += `ctx->freeBigInts(${v.label}, ${labelSize});\n`;
        } else {
            return error(ctx, null, "Undefined Sizes: " +name);
        }

    } else if (v.type=="INT") {
        ctx.codeHeader += `int ${v.label};\n`;
    } else if (v.type=="SIZES") {
        ctx.codeHeader += `Circom_Sizes ${v.label};\n`;
    }
    v.used = true;
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
            return genVarAssignement(ctx, ast);
        } else if (ast.op == "<--") {
            return genVarAssignement(ctx, ast);
        } else if (ast.op == "<==") {
            return genSignalAssignConstrain(ctx, ast);
        } else if (ast.op == "===") {
            return genConstraint(ctx, ast);
        } else if (ast.op == "+=") {
            return genVarAddAssignement(ctx, ast);
        } else if (ast.op == "*=") {
            return genVarMulAssignement(ctx, ast);
        } else if (ast.op == "+") {
            return genAdd(ctx, ast);
        } else if (ast.op == "-") {
            return genSub(ctx, ast);
        } else if (ast.op == "UMINUS") {
            return genUMinus(ctx, ast);
        } else if (ast.op == "*") {
            return genMul(ctx, ast);
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
            return genLt(ctx, ast);
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
    if (ctx.scopes.length>1) {
        ctx.code = oldCode + `{\n${utils.ident(ctx.code)}}\n`;
    } else {
        ctx.code = oldCode + ctx.code;
    }
    return res;
}

function genSrcComment(ctx, ast) {
    let codes = [];
    const fl= ast.first_line-1;
    const ll = ast.last_line-1;
    const fc = ast.first_column-1;
    const lc = ast.last_column;
    for (let i=fl; i<=ll; i++) {
        const p1 = i==fl ? fc : 0;
        const p2 = i==ll ? lc : -1;
        codes.push(ctx.includedFiles[ctx.fileName][i].slice(p1, p2>=0 ? p2 : undefined));
    }
    ctx.code += "\n/* "+codes.join("\n")+"*/\n";
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
    if (ctx.scope[varName]) return error(ctx, ast, "Name already exists: "+varName);

    const sizes=[];
    let instantiate = false;
    for (let i=0; i< ast.name.selectors.length; i++) {
        const size = gen(ctx, ast.name.selectors[i]);
        if (ctx.error) return;

        if (size.used) {
            instantiate = true;
            sizes.push(`BigInt2Int(${scope[size].label})`);
        } else {
            sizes.push(size.value.toJSNumber());
        }

        sizes.push( size.value.toJSNumber() );
    }

    const vSizes = newRef(ctx, "SIZES", "_sizes");
    const iSizes = scope[vSizes];
    iSizes.dim = ast.name.selectors.length;
    if (instantiate) {
        instantiateRef(ctx, vSizes);
        ctx.code += `${iSizes.label}[${iSizes.dim+1}]=0`;
        ctx.code += `${iSizes.label}[${iSizes.dim}]=1`;
        for (let i=iSizes.dim-1; i>=0; i--) {
            ctx.code += `${iSizes.label}[${i}] = ${sizes[i]}*${iSizes.label}[${i+1}];\n`;
        }
    } else {
        iSizes.value = sizes;
    }

    const res = ctx.scope[varName] = {
        stack: true,
        type: "BIGINT",
        sizes: vSizes,
        label: labelName
    };

    scope[varName] = res;

    return res;
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

        const iSizes = getScope(ctx, vSizes);

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
        if (rStr == iOffset.label) {
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


    if (v.type == "SIGNAL") {
        let vOffset;
        if (ast.selectors.length>0) {
            const vsOffset = genGetSigalOffset(ctx, "ctx->cIdx", ast.name);
            const vsSizes = genGetSignalSizes(ctx, "ctx->cIdx", ast.name);
            vOffset = genGetOffset(ctx, vsOffset, vsSizes, ast.selectors );
        } else {
            vOffset = genGetSigalOffset(ctx, "ctx->cIdx", ast.name);
        }
        return genGetSignal(ctx, "ctx->cIdx", vOffset);

    } else if (v.type == "BIGINT") {
        const vOffset = genGetOffset(ctx, 0, v.sizes, ast.sels );
        if (v.used) {
            if (vOffset == 0) {
                return ast.name;
            } else {
                const res = newRef(ctx, "BIGINT", "_v");
                instantiateRef(ctx, res);
                ctx.code += `${res} = ${ast.name} + ${vOffset};\n`;
                return res;
            }
        } else {
            if (typeof(vOffset) == "string") {
                instantiateRef(ctx, ast.name);
                const vConstant = instantiateConstant(ctx, v.value);
                const res = newRef(ctx, "BIGINT", "_v");
                instantiateRef(ctx, res);
                ctx.code += `${res} = ${vConstant} + ${vOffset};\n`;
                return res;
            } else {
                const sa = utils.subArray(v.value, ast.selectors);
                const res = newRef(ctx, "BIGINT", "_v", sa);
                return res;
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

function instantiateConstant(ctx, value) {
    const flatedValue = utils.flatArray(value);
    const res = ctx.getTmpName("_const");
    ctx.codeHeader += `PBigInt ${res};\n`;
    ctx.code += `${res.label} = ctx->allocBigInts(${flatedValue.length});\n`;
    for (let i=0; i<flatedValue.length; i++) {
        ctx.code += `mpz_init_set_str(${res.label}[${i}], ${flatedValue[i].toString(16)}, 16);\n`;
    }
    ctx.codeFooter += `ctx->freeBigInts(${res.label});\n`;
    return res;
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
    ctx.code += `ctx->setSignal(${cIdx}, ${sIdx}, ${value});\n`;
    return value;
}

function genGetSignal(ctx, cIdx, sIdx) {
    const res = newRef(ctx, "BIGINT", "_sigValue");
    instantiateRef(ctx, res);
    ctx.code += `ctx->getSignal(${cIdx}, ${sIdx}, ${res});\n`;
    return res;
}

function genVarAssignement(ctx, ast) {

    let lName;
    let sels;

    if (ctx.error) return;

    if (ast.values[0].type == "PIN") {

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


    const rName = gen(ctx, ast.values[1]);
    const right = getScope(ctx, rName);

    if (left.type == "SIGNAL") {

        let vsIdx;
        if (sels.length>0) {
            const vsOffset = genGetSigalOffset(ctx, "ctx->cIdx", lName);
            const vsSizes = genGetSignalSizes(ctx, "ctx->cIdx", lName);
            vsIdx = genGetOffset(ctx, vsOffset, vsSizes, sels );
        } else {
            vsIdx = genGetSigalOffset(ctx, "ctx->cIdx", lName);
        }

        return genSetSignal(ctx, "ctx->cIdx", vsIdx, rName);
    } else if (left.type == "VAR") {
        if (left.used) {
            if (!right.used) {
                instantiateRef(ctx, rName);
            }
            ctx.code += `BigInt_copy(${left.label}, ${right.label});\n`;
            return lName;
        } else {
            if (right.used) {
                instantiateRef(ctx, lName);
                ctx.code += `BigInt_copy(${left.label}, ${right.label});\n`;
                return lName;
            } else {
                if (!left.value) {
                    left.value = right.value;
                } else {
                    if (!left.value.equals(right.value)) {
                        if (ctx.scopes.length > 1) {
                            instantiateRef(ctx, lName);
                            ctx.code += `BigInt_copy(${left.label}, ${right.label});\n`;
                        } else {
                            left.value = right.value;
                        }
                    }
                }
            }
        }
    } else {
        return error(ctx, ast, "Assigning to invalid");
    }
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
    let S = "[";
    for (let i=0; i<ast.values.length; i++) {
        if (i>0) S += ",";
        S += gen(ctx, ast.values[i]);
    }
    S+="]";
    return S;
}


function genFunctionCall(ctx, ast) {
    let S = "[";
    for (let i=0; i<ast.params.length; i++) {
        if (i>0) S += ",";
        S += gen(ctx, ast.params[i]);
    }
    S+="]";

    return `ctx.callFunction("${ast.name}", ${S})`;
}

function genFor(ctx, ast) {
    ctx.scopes.push({});
    const init = gen(ctx, ast.init);
    if (ctx.error) return;
    const condition = gen(ctx, ast.condition);
    if (ctx.error) return;
    const step = gen(ctx, ast.step);
    if (ctx.error) return;
    const body = gen(ctx, ast.body);
    if (ctx.error) return;
    ctx.scopes.pop();
    return `for (${init};bigInt(${condition}).neq(bigInt(0));${step}) { \n${body}\n }\n`;
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
    const value = gen(ctx, ast.value);
    if (ctx.error) return;
    return `return ${value};`;
}



function genSignalAssignConstrain(ctx, ast) {
    const res = genVarAssignement(ctx, ast);
    genConstraint(ctx, ast);
    return res;
//    return genVarAssignement(ctx, ast);
}

function genVarAddAssignement(ctx, ast) {
    return genVarAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "+", values: ast.values}]});
}

function genVarMulAssignement(ctx, ast) {
    return genVarAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "*", values: ast.values}]});
}

function genPlusPlusRight(ctx, ast) {
    return `(${genVarAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "+", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]})}).add(__P__).sub(bigInt(1)).mod(__P__)`;
}

function genPlusPlusLeft(ctx, ast) {
    return genVarAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "+", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]});
}

function genMinusMinusRight(ctx, ast) {
    return `(${genVarAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "-", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]})}).add(__P__).sub(bigInt(1)).mod(__P__)`;
}

function genMinusMinusLeft(ctx, ast) {
    return genVarAssignement(ctx, {values: [ast.values[0], {type: "OP", op: "-", values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}]}]});
}

function genAdd(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).add(bigInt(${b})).mod(__P__)`;
}

function genMul(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).mul(bigInt(${b})).mod(__P__)`;
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

function genLt(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    return `bigInt(${a}).lt(bigInt(${b})) ? 1 : 0`;
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


