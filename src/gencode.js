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

module.exports = gen;

function ident(text) {
    let lines = text.split("\n");
    for (let i=0; i<lines.length; i++) {
        if (lines[i]) lines[i] = "    "+lines[i];
    }
    return lines.join("\n");
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
            return genConstrain(ctx, ast);
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
    } else if (ast.type == "TEMPLATEDEF") {
        return genTemplateDef(ctx, ast);
    } else if (ast.type == "FUNCTIONDEF") {
        return genFunctionDef(ctx, ast);
    } else if (ast.type == "INCLUDE") {
        return genInclude(ctx, ast);
    } else if (ast.type == "ARRAY") {
        return genArray(ctx, ast);
    } else {
        error(ctx, ast, "GEN -> Invalid AST node type: " + ast.type);
    }
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


function genFunctionCall(ctx, ast) {
    let S = "[";
    for (let i=0; i<ast.params.length; i++) {
        if (i>0) S += ",";
        S += gen(ctx, ast.params[i]);
    }
    S+="]";

    return `ctx.callFunction("${ast.name}", ${S})`;
}

function genBlock(ctx, ast) {
    let body = "";
    for (let i=0; i<ast.statements.length; i++) {
        const l = gen(ctx, ast.statements[i]);
        if (ctx.error) return;
        if (l) {
            body += l;
            if (body[body.length-1] != "\n") body += ";\n";
        }
    }
    return "{\n"+ident(body)+"}\n";
}

function genTemplateDef(ctx, ast) {
    let S = "function(ctx) ";

    const newScope = {};
    for (let i=0; i< ast.params.length; i++) {
        newScope[ast.params[i]] = { type: "VARIABLE" };
    }

    ctx.scopes.push(newScope);
    S += genBlock(ctx, ast.block);
    ctx.scopes.pop();

//    const scope = ctx.scopes[ctx.scopes.length-1];
    const scope = ctx.scopes[0];  // Scope for templates is top

    scope[ast.name] = {
        type: "TEMPLATE"
    };

    ctx.templates[ast.name] = S;
    return "";
}

function genFunctionDef(ctx, ast) {
    let S = "function(ctx) ";

    const newScope = {};
    const params = [];
    for (let i=0; i< ast.params.length; i++) {
        newScope[ast.params[i]] = { type: "VARIABLE" };
        params.push(ast.params[i]);
    }

    ctx.scopes.push(newScope);
    S += genBlock(ctx, ast.block);
    ctx.scopes.pop();

//     const scope = ctx.scopes[0]; // Scope for templates is top
    const scope = ctx.scopes[ctx.scopes.length-1];

    scope[ast.name] = {
        type: "FUNCTION"
    };

    ctx.functions[ast.name] = S;
    ctx.functionParams[ast.name] = params;
    return "";
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

function genDeclareComponent(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length - 1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    scope[ast.name.name] = {
        type: "COMPONENT"
    };

    return "";
}

function genDeclareSignal(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    scope[ast.name.name] = {
        type: "SIGNAL"
    };

    return "";
}

function genDeclareVariable(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    scope[ast.name.name] = {
        type: "VARIABLE"
    };

    return "";
}

function genNumber(ctx, ast) {
    return `"${ast.value.toString()}"`;
}

function genVariable(ctx, ast) {
    const v = getScope(ctx, ast.name);

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
    let componentName = ast.component.name;
    let componentSelectors = [];
    for (let i=0; i<ast.component.selectors.length; i++) {
        componentSelectors.push(gen(ctx, ast.component.selectors[i]));
    }
    componentSelectors = "["+ componentSelectors.join(",") + "]";
    let pinName = ast.pin.name;
    let pinSelectors = [];
    for (let i=0; i<ast.pin.selectors.length; i++) {
        pinSelectors.push(gen(ctx, ast.pin.selectors[i]));
    }
    pinSelectors = "["+ pinSelectors.join(",") + "]";
    return `ctx.getPin("${componentName}", ${componentSelectors}, "${pinName}", ${pinSelectors})`;
}

function genVarAssignement(ctx, ast) {

    const sels = [];
    let vName;

    if (ctx.error) return;

    if (ast.values[0].type == "PIN") {
        let componentName = ast.values[0].component.name;
        let componentSelectors = [];
        for (let i=0; i<ast.values[0].component.selectors.length; i++) {
            componentSelectors.push(gen(ctx, ast.values[0].component.selectors[i]));
        }
        componentSelectors = "["+ componentSelectors.join(",") + "]";
        let pinName = ast.values[0].pin.name;
        let pinSelectors = [];
        for (let i=0; i<ast.values[0].pin.selectors.length; i++) {
            pinSelectors.push(gen(ctx, ast.values[0].pin.selectors[i]));
        }
        pinSelectors = "["+ pinSelectors.join(",") + "]";
        const res = gen(ctx, ast.values[1]);
        return `ctx.setPin("${componentName}", ${componentSelectors}, "${pinName}", ${pinSelectors}, ${res})`;
    }

    if (ast.values[0].type == "DECLARE") {
        gen(ctx, ast.values[0]);
        if (ctx.error) return;
        vName = ast.values[0].name.name;
    } else {
        vName = ast.values[0].name;
        for (let i=0; i<ast.values[0].selectors.length; i++) {
            sels.push(gen(ctx, ast.values[0].selectors[i]));
            if (ctx.error) return;
        }
    }


    const v = getScope(ctx, vName);

    // Component instantiation is already done.
    if (v.type == "COMPONENT") return "";

    const res = gen(ctx, ast.values[1]);
    if (v.type == "VARIABLE") {
        return `ctx.setVar("${vName}", [${sels.join(",")}], ${res})`;
    } else if (v.type == "SIGNAL") {
        return `ctx.setSignal("${vName}", [${sels.join(",")}], ${res})`;
    } else {
        return error(ctx, ast, "Assigning to invalid");
    }
}

function genConstrain(ctx, ast) {
    const a = gen(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = gen(ctx, ast.values[1]);
    if (ctx.error) return;
    const strErr = ast.fileName + ":" + ast.first_line + ":" + ast.first_column;
    return `ctx.assert(${a}, ${b}, \"${strErr}\")`;
}

function genSignalAssignConstrain(ctx, ast) {
//    return genVarAssignement(ctx, ast) + ";\n" + genConstrain(ctx, ast);
    return genVarAssignement(ctx, ast);
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

function genArray(ctx, ast) {
    let S = "[";
    for (let i=0; i<ast.values.length; i++) {
        if (i>0) S += ",";
        S += gen(ctx, ast.values[i]);
    }
    S+="]";
    return S;
}

