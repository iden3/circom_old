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

const path = require("path");
const fs = require("fs");

const bigInt = require("big-integer");
const __P__ = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const __MASK__ = new bigInt(2).pow(253).minus(1);

const lc = require("./lcalgebra");
const parser = require("../parser/jaz.js").parser;

/* TODO: Add lines information

function setLines(dst, first, last) {
    last = last || first;
    dst.first_line = first.first_line;
    dst.first_column = first.first_column;
    dst.last_line = last.last_line;
    dst.last_column = last.last_column;
}
*/

module.exports = exec;


function exec(ctx, ast) {
    if (!ast) {
        return error(ctx, ast, "Null AST");
    }
    if ((ast.type == "NUMBER") || (ast.type == "LINEARCOMBINATION") || (ast.type =="SIGNAL") || (ast.type == "QEQ")) {
        return ast;
    } else if (ast.type == "VARIABLE") {
        return execVariable(ctx, ast);
    } else if (ast.type == "PIN") {
        return execPin(ctx, ast);
    } else if (ast.type == "OP") {
        if (ast.op == "=") {
            return execVarAssignement(ctx, ast);
        } else if (ast.op == "<--") {
            return execSignalAssign(ctx, ast);
        } else if (ast.op == "<==") {
            return execSignalAssignConstrain(ctx, ast);
        } else if (ast.op == "===") {
            return execConstrain(ctx, ast);
        } else if (ast.op == "+=") {
            return execVarAddAssignement(ctx, ast);
        } else if (ast.op == "*=") {
            return execVarMulAssignement(ctx, ast);
        } else if (ast.op == "+") {
            return execAdd(ctx, ast);
        } else if (ast.op == "-") {
            return execSub(ctx, ast);
        } else if (ast.op == "UMINUS") {
            return execUMinus(ctx, ast);
        } else if (ast.op == "*") {
            return execMul(ctx, ast);
        } else if (ast.op == "%") {
            return execMod(ctx, ast);
        } else if (ast.op == "PLUSPLUSRIGHT") {
            return execPlusPlusRight(ctx, ast);
        } else if (ast.op == "PLUSPLUSLEFT") {
            return execPlusPlusLeft(ctx, ast);
        } else if (ast.op == "MINUSMINUSRIGHT") {
            return execMinusMinusRight(ctx, ast);
        } else if (ast.op == "MINUSMINUSLEFT") {
            return execMinusMinusLeft(ctx, ast);
        } else if (ast.op == "/") {
            return execDiv(ctx, ast);
        } else if (ast.op == "\\") {
            return execIDiv(ctx, ast);
        } else if (ast.op == "**") {
            return execExp(ctx, ast);
        } else if (ast.op == "&") {
            return execBAnd(ctx, ast);
        } else if (ast.op == "&&") {
            return execAnd(ctx, ast);
        } else if (ast.op == "||") {
            return execOr(ctx, ast);
        } else if (ast.op == "<<") {
            return execShl(ctx, ast);
        } else if (ast.op == ">>") {
            return execShr(ctx, ast);
        } else if (ast.op == "<") {
            return execLt(ctx, ast);
        } else if (ast.op == ">") {
            return execGt(ctx, ast);
        } else if (ast.op == "<=") {
            return execLte(ctx, ast);
        } else if (ast.op == ">=") {
            return execGte(ctx, ast);
        } else if (ast.op == "==") {
            return execEq(ctx, ast);
        } else if (ast.op == "!=") {
            return execNeq(ctx, ast);
        } else if (ast.op == "?") {
            return execTerCon(ctx, ast);
        } else {
            error(ctx, ast, "Invalid operation: " + ast.op);
        }
    } else if (ast.type == "DECLARE") {
        if (ast.declareType == "COMPONENT") {
            return execDeclareComponent(ctx, ast);
        } else if ((ast.declareType == "SIGNALIN")||
                   (ast.declareType == "SIGNALOUT")||
                   (ast.declareType == "SIGNAL")) {
            return execDeclareSignal(ctx, ast);
        } else if (ast.declareType == "VARIABLE") {
            return execDeclareVariable(ctx, ast);
        } else {
            error(ctx, ast, "Invalid declaration: " + ast.declareType);
        }
    } else if (ast.type == "FUNCTIONCALL") {
        return execFunctionCall(ctx, ast);
    } else if (ast.type == "BLOCK") {
        return execBlock(ctx, ast);
    } else if (ast.type == "COMPUTE") {
        return ;
    } else if (ast.type == "FOR") {
        return execFor(ctx, ast);
    } else if (ast.type == "WHILE") {
        return execWhile(ctx, ast);
    } else if (ast.type == "IF") {
        return execIf(ctx, ast);
    } else if (ast.type == "RETURN") {
        return execReturn(ctx, ast);
    } else if (ast.type == "TEMPLATEDEF") {
        return execTemplateDef(ctx, ast);
    } else if (ast.type == "FUNCTIONDEF") {
        return execFunctionDef(ctx, ast);
    } else if (ast.type == "INCLUDE") {
        return execInclude(ctx, ast);
    } else if (ast.type == "ARRAY") {
        return execArray(ctx, ast);
    } else {
        error(ctx, ast, "Invalid AST node type: " + ast.type);
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
        errFile: ctx.fileName,
        ast: ast,
        message: errStr
    };
}

function iterateSelectors(ctx, sizes, baseName, fn) {
    if (sizes.length == 0) {
        return fn(baseName);
    }
    const res = [];
    for (let i=0; i<sizes[0]; i++) {
        res.push(iterateSelectors(ctx, sizes.slice(1), baseName+"["+i+"]", fn));
        if (ctx.error) return null;
    }
    return res;
}

function setScope(ctx, name, selectors, value) {
    let l = getScopeLevel(ctx, name);
    if (l==-1) l= ctx.scopes.length-1;

    if (selectors.length == 0) {
        ctx.scopes[l][name] = value;
    } else {
        setScopeArray(ctx.scopes[l][name], selectors);
    }

    function setScopeArray(a, sels) {
        if (sels.length == 1) {
            a[sels[0].value] = value;
        } else {
            setScopeArray(a[sels[0]], sels.slice(1));
        }
    }
}

function getScope(ctx, name, selectors) {

    const sels = [];
    if (selectors) {
        for (let i=0; i< selectors.length; i++) {
            const idx = exec(ctx, selectors[i]);
            if (ctx.error) return;

            if (idx.type != "NUMBER") return error(ctx, selectors[i], "expected a number");
            sels.push( idx.value.toJSNumber() );
        }
    }


    function select(v, s) {
        s = s || [];
        if (s.length == 0)  return v;
        return select(v[s[0]], s.slice(1));
    }

    for (let i=ctx.scopes.length-1; i>=0; i--) {
        if (ctx.scopes[i][name]) return select(ctx.scopes[i][name], sels);
    }
    return null;
}

function getScopeLevel(ctx, name) {
    for (let i=ctx.scopes.length-1; i>=0; i--) {
        if (ctx.scopes[i][name]) return i;
    }
    return -1;
}

function execBlock(ctx,  ast) {
    for (let i=0; i<ast.statements.length; i++) {
        exec(ctx, ast.statements[i]);
        if (ctx.returnValue) return;
        if (ctx.error) return;
    }
}

function execTemplateDef(ctx, ast) {
    const scope = ctx.scopes[0];  // Lets put templates always in top scope.
    //    const scope = ctx.scopes[ctx.scopes.length-1];
    if (getScope(ctx, ast.name)) {
        return error(ctx, ast, "Name already exists: "+ast.name);
    }
    scope[ast.name] = {
        type: "TEMPLATE",
        params: ast.params,
        block: ast.block,
        fileName: ctx.fileName,
        filePath: ctx.filePath,
        scopes: copyScope(ctx.scopes)
    };
}

function execFunctionDef(ctx, ast) {
    const scope = ctx.scopes[0]; // Lets put functions always in top scope.
    //    const scope = ctx.scopes[ctx.scopes.length-1];
    if (getScope(ctx, ast.name)) {
        return error(ctx, ast, "Name already exists: "+ast.name);
    }
    ctx.functionParams[ast.name] = ast.params;
    scope[ast.name] = {
        type: "FUNCTION",
        params: ast.params,
        block: ast.block,
        fileName: ctx.fileName,
        filePath: ctx.filePath,
        scopes: copyScope(ctx.scopes)
    };
}


function execDeclareComponent(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    const baseName = ctx.currentComponent ? ctx.currentComponent + "." + ast.name.name : ast.name.name;

    const sizes=[];
    for (let i=0; i< ast.name.selectors.length; i++) {
        const size = exec(ctx, ast.name.selectors[i]);
        if (ctx.error) return;

        if (size.type != "NUMBER") return error(ctx, ast.name.selectors[i], "expected a number");

        sizes.push( size.value.toJSNumber() );
    }


    scope[ast.name.name] = iterateSelectors(ctx, sizes, baseName, function(fullName) {

        ctx.components[fullName] = "UNINSTANTIATED";

        return {
            type: "COMPONENT",
            fullName: fullName
        };
    });

    return {
        type: "VARIABLE",
        name: ast.name.name,
        selectors: []
    };
}

function execInstantiateComponet(ctx, vr, fn) {

    if (vr.type != "VARIABLE") return error(ctx, fn, "Left hand instatiate component must be a variable");
    if (fn.type != "FUNCTIONCALL") return error(ctx, fn, "Right type of instantiate component must be a function call");

    const componentName = vr.name;
    const templateName = fn.name;

    const scopeLevel = getScopeLevel(ctx, templateName);
    if (scopeLevel == -1) return error(ctx,fn, "Invalid Template");
    const template = getScope(ctx, templateName);

    if (template.type != "TEMPLATE") return error(ctx, fn, "Invalid Template");


    const paramValues = [];
    for (let i=0; i< fn.params.length; i++) {
        const v = exec(ctx, fn.params[i]);
        if (ctx.error) return;

        paramValues.push(v);
    }
    if (template.params.length != paramValues.length) error(ctx, fn, "Invalid Number of parameters");

    const vv = getScope(ctx, componentName, vr.selectors);

    if (!vv) return error(ctx, vr, "Component not defined"+ componentName);

    instantiateComponent(vv);

    function instantiateComponent(varVal) {

        function extractValue(v) {
            if (Array.isArray(v)) {
                return v.map(extractValue);
            } else {
                return v.value.toString();
            }
        }

        if (Array.isArray(varVal)) {
            for (let i =0; i<varVal.length; i++) {
                instantiateComponent(varVal[i]);
            }
            return;
        }

        if (ctx.components[varVal.fullName] != "UNINSTANTIATED") error(ctx, fn, "Component already instantiated");

        const oldComponent = ctx.currentComponent;
        const oldFileName = ctx.fileName;
        const oldFilePath = ctx.filePath;
        ctx.currentComponent = varVal.fullName;

        ctx.components[ctx.currentComponent] = {
            signals: [],
            params: {}
        };

        const oldScopes = ctx.scopes;

        ctx.scopes = oldScopes.slice(0, scopeLevel+1);

        if (template.params.length != paramValues.length) return error(ctx, fn, "Invalid number of parameters: " + templateName);

        const scope = {};
        for (let i=0; i< template.params.length; i++) {
            scope[template.params[i]] = paramValues[i];
            ctx.components[ctx.currentComponent].params[template.params[i]] = extractValue(paramValues[i]);
        }

        ctx.components[ctx.currentComponent].template = templateName;
        ctx.fileName = template.fileName;
        ctx.filePath = template.filePath;
        ctx.scopes = copyScope( template.scopes );
        ctx.scopes.push(scope);

        execBlock(ctx, template.block);

        ctx.fileName = oldFileName;
        ctx.filePath = oldFilePath;
        ctx.currentComponent = oldComponent;
        ctx.scopes = oldScopes;
    }
}

function execFunctionCall(ctx, ast) {

    if (ast.name == "log") {
        const v = exec(ctx, ast.params[0]);
        console.log(v.value.toString());
        return;
    }

    const scopeLevel = getScopeLevel(ctx, ast.name);
    if (scopeLevel == -1) return error(ctx, ast, "Function not defined: " + ast.name);
    const fnc = getScope(ctx, ast.name);

    if (fnc.type != "FUNCTION") return error(ctx, ast, "Not a function: " + ast.name);

    const paramValues = [];
    for (let i=0; i< ast.params.length; i++) {
        const v = exec(ctx, ast.params[i]);
        if (ctx.error) return;

        paramValues.push(v);
    }

    if (ast.params.length != paramValues.length) error(ctx, ast, "Invalid Number of parameters");

    const oldFileName = ctx.fileName;
    const oldFilePath = ctx.filePath;

    const oldScopes = ctx.scopes;

    ctx.scopes = oldScopes.slice(0, scopeLevel+1);

    const scope = {};
    for (let i=0; i< fnc.params.length; i++) {
        scope[fnc.params[i]] = paramValues[i];
    }

    ctx.fileName = fnc.fileName;
    ctx.filePath = fnc.filePath;
    ctx.scopes = copyScope( fnc.scopes );
    ctx.scopes.push(scope);

    execBlock(ctx, fnc.block);

    const res = ctx.returnValue;
    ctx.returnValue = null;

    ctx.fileName = oldFileName;
    ctx.filePath = oldFilePath;
    ctx.scopes = oldScopes;

    return res;
}

function execReturn(ctx, ast) {
    ctx.returnValue = exec(ctx, ast.value);
    return;
}

function execDeclareSignal(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid component name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    const baseName = ctx.currentComponent ? ctx.currentComponent + "." + ast.name.name : ast.name.name;

    const sizes=[];
    for (let i=0; i< ast.name.selectors.length; i++) {
        const size = exec(ctx, ast.name.selectors[i]);
        if (ctx.error) return;

        if (size.type != "NUMBER") return error(ctx, ast.name.selectors[i], "expected a number");
        sizes.push( size.value.toJSNumber() );
    }

    scope[ast.name.name] = iterateSelectors(ctx, sizes, baseName, function(fullName) {
        ctx.signals[fullName] = {
            fullName: fullName,
            direction: ast.declareType == "SIGNALIN" ? "IN" : (ast.declareType == "SIGNALOUT" ? "OUT" : ""),
            private: ast.private,
            component: ctx.currentComponent,
            equivalence: "",
            alias: [fullName]
        };
        ctx.components[ctx.currentComponent].signals.push(fullName);
        return {
            type: "SIGNAL",
            fullName: fullName,
        };
    });
    return {
        type: "VARIABLE",
        name: ast.name.name,
        selectors: []
    };
}

function execDeclareVariable(ctx, ast) {
    const scope = ctx.scopes[ctx.scopes.length-1];

    if (ast.name.type != "VARIABLE") return error(ctx, ast, "Invalid linear combination name");
    if (getScope(ctx, ast.name.name)) return error(ctx, ast, "Name already exists: "+ast.name.name);

    const sizes=[];
    for (let i=0; i< ast.name.selectors.length; i++) {
        const size = exec(ctx, ast.name.selectors[i]);
        if (ctx.error) return;

        if (size.type != "NUMBER") return error(ctx, ast.name.selectors[i], "expected a number");
        sizes.push( size.value.toJSNumber() );
    }

    scope[ast.name.name] = iterateSelectors(ctx, sizes, "", function() {
        return {
            type: "NUMBER",
            value: bigInt(0)
        };
    });

    return {
        type: "VARIABLE",
        name: ast.name.name,
        selectors: []
    };
}

function execVariable(ctx, ast) {
    let v;
    try {
        v = getScope(ctx, ast.name, ast.selectors);
    } catch(err) {
        console.log(JSON.stringify(ast, null,1));
    }
    if (ctx.error) return;

    if (!v) return error(ctx, ast, "Variable not defined");

    // If the signal has an assigned value (constant) just return the constant
    if ((v.type == "SIGNAL") && (ctx.signals[v.fullName].value)) {
        return {
            type: "NUMBER",
            value: ctx.signals[v.fullName].value
        };
    }
    let res;
    res=v;
    return res;
}

function execPin(ctx, ast) {
    const component = getScope(ctx, ast.component.name, ast.component.selectors);
    if (!component) return error(ctx, ast.component, "Component does not exists: "+ast.component.name);
    if (ctx.error) return;
    let signalFullName = component.fullName + "." + ast.pin.name;
    for (let i=0; i< ast.pin.selectors.length; i++) {
        const sel = exec(ctx, ast.pin.selectors[i]);
        if (ctx.error) return;

        if (sel.type != "NUMBER") return error(ctx, ast.pin.selectors[i], "expected a number");

        signalFullName += "[" + sel.value.toJSNumber() + "]";
    }
    if (!ctx.signals[signalFullName]) error(ctx, ast, "Signal not defined:" + signalFullName);
    return {
        type: "SIGNAL",
        fullName: signalFullName
    };
}

function execFor(ctx, ast) {

    ctx.scopes.push({});
    exec(ctx, ast.init);
    if (ctx.error) return;

    let v = exec(ctx, ast.condition);
    if (ctx.error) return;

    if (typeof v.value != "undefined") {
        while ((v.value.neq(0))&&(!ctx.returnValue)) {
            exec(ctx, ast.body);
            if (ctx.error) return;

            exec(ctx, ast.step);
            if (ctx.error) return;

            v = exec(ctx, ast.condition);
            if (ctx.error) return;
        }
    }
    ctx.scopes.pop();
}

function execWhile(ctx, ast) {
    let v = exec(ctx, ast.condition);
    if (ctx.error) return;

    if (typeof v.value != "undefined") {
        while ((v.value.neq(0))&&(!ctx.returnValue)) {
            exec(ctx, ast.body);
            if (ctx.error) return;

            v = exec(ctx, ast.condition);
            if (ctx.error) return;
        }
    }
}

function execIf(ctx, ast) {
    let v = exec(ctx, ast.condition);
    if (ctx.error) return;

    if (typeof v.value != "undefined") {
        if ((v.value.neq(0))&&(!ctx.returnValue)) {
            exec(ctx, ast.then);
            if (ctx.error) return;
        } else {
            if (ast.else) {
                exec(ctx, ast.else);
                if (ctx.error) return;
            }
        }
    }
}


function execVarAssignement(ctx, ast) {
    let v;
    if (ast.values[0].type == "DECLARE") {
        v = exec(ctx, ast.values[0]);
        if (ctx.error) return;
    } else {
        v = ast.values[0];
    }
    const num = getScope(ctx, v.name, v.selectors);
    if (ctx.error) return;

    if ((typeof(num) != "object")||(num == null)) return  error(ctx, ast, "Variable not defined");

    if (num.type == "COMPONENT") return execInstantiateComponet(ctx, v, ast.values[1]);
    if (ctx.error) return;
//    if (num.type == "SIGNAL") return error(ctx, ast, "Cannot assign to a signal with `=` use <-- or <== ops");

    const res = exec(ctx, ast.values[1]);
    if (ctx.error) return;

    setScope(ctx, v.name, v.selectors, res);

    return v;
}

function execLt(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.lt(b.value) ? bigInt(1) : bigInt(0)
    };
}

function execGt(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.gt(b.value) ? bigInt(1) : bigInt(0)
    };
}

function execLte(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.lesserOrEquals(b.value) ? bigInt(1) : bigInt(0)
    };
}

function execGte(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.greaterOrEquals(b.value) ? bigInt(1) : bigInt(0)
    };
}


function execEq(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.eq(b.value) ? bigInt(1) : bigInt(0)
    };
}

function execNeq(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.eq(b.value) ? bigInt(0) : bigInt(1)
    };
}


function execBAnd(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.and(b.value).and(__MASK__)
    };
}

function execAnd(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: (a.value.neq(0) && b.value.neq(0)) ? bigInt(1) : bigInt(0)
    };
}

function execOr(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: (a.value.neq(0) || b.value.neq(0)) ? bigInt(1) : bigInt(0)
    };
}

function execShl(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    const v = b.value.greater(256) ? 256 : b.value.value;
    return {
        type: "NUMBER",
        value: a.value.shiftLeft(v).and(__MASK__)
    };
}

function execShr(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    const v = b.value.greater(256) ? 256 : b.value.value;
    return {
        type: "NUMBER",
        value: a.value.shiftRight(v).and(__MASK__)
    };
}

function execMod(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.mod(b.value)
    };
}


function execExp(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    return {
        type: "NUMBER",
        value: a.value.modPow(b.value, __P__)
    };
}

function execDiv(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    if (b.value.isZero()) return error(ctx, ast, "Division by zero");
    return {
        type: "NUMBER",
        value: a.value.times(b.value.modInv(__P__)).mod(__P__)
    };
}

function execIDiv(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    if (a.type != "NUMBER") return { type: "NUMBER" };
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;
    if (b.type != "NUMBER") return { type: "NUMBER" };
    if (!a.value || !b.value) return { type: "NUMBER" };
    if (b.value.isZero()) return error(ctx, ast, "Division by zero");
    return {
        type: "NUMBER",
        value: a.value.divide(b.value)
    };
}

function execAdd(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;

    const res = lc.add(a,b);
    if (res.type == "ERROR") return error(ctx, ast, res.errStr);

    return res;
}

function execSub(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;

    const res = lc.sub(a,b);
    if (res.type == "ERROR") return error(ctx, ast, res.errStr);

    return res;
}

function execUMinus(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;

    const res = lc.negate(a);
    if (res.type == "ERROR") return error(ctx, ast, res.errStr);

    return res;
}

function execMul(ctx, ast) {
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;

    const res = lc.mul(a,b);
    if (res.type == "ERROR") return error(ctx, ast, res.errStr);

    return res;
}


function execVarAddAssignement(ctx, ast) {
    const res = execAdd(ctx,{ values: [ast.values[0], ast.values[1]] } );
    if (ctx.error) return;
    return execVarAssignement(ctx, { values: [ast.values[0], res] });
}

function execVarMulAssignement(ctx, ast) {
    const res = execMul(ctx,{ values: [ast.values[0], ast.values[1]] } );
    if (ctx.error) return;
    return execVarAssignement(ctx, { values: [ast.values[0], res] });
}

function execPlusPlusRight(ctx, ast) {
    const resBefore = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    const resAfter = execAdd(ctx,{ values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}] } );
    if (ctx.error) return;
    execVarAssignement(ctx, { values: [ast.values[0], resAfter] });
    return resBefore;
}

function execPlusPlusLeft(ctx, ast) {
    if (ctx.error) return;
    const resAfter = execAdd(ctx,{ values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}] } );
    if (ctx.error) return;
    execVarAssignement(ctx, { values: [ast.values[0], resAfter] });
    return resAfter;
}

function execMinusMinusRight(ctx, ast) {
    const resBefore = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    const resAfter = execSub(ctx,{ values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}] } );
    if (ctx.error) return;
    execVarAssignement(ctx, { values: [ast.values[0], resAfter] });
    return resBefore;
}

function execMinusMinusLeft(ctx, ast) {
    if (ctx.error) return;
    const resAfter = execSub(ctx,{ values: [ast.values[0], {type: "NUMBER", value: bigInt(1)}] } );
    if (ctx.error) return;
    execVarAssignement(ctx, { values: [ast.values[0], resAfter] });
    return resAfter;
}

function execTerCon(ctx, ast) {
    const cond = exec(ctx, ast.values[0]);
    if (ctx.error) return;

    if (!cond.value) return { type: "NUMBER" };

    if (cond.value.neq(0)) {
        return exec(ctx, ast.values[1]);
    } else {
        return exec(ctx, ast.values[2]);
    }
}

function execSignalAssign(ctx, ast) {
    let vDest;
    if (ast.values[0].type == "DECLARE") {
        vDest = exec(ctx, ast.values[0]);
        if (ctx.error) return;
    } else {
        vDest = ast.values[0];
    }

    let dst;
    if (vDest.type == "VARIABLE") {
        dst = getScope(ctx, vDest.name, vDest.selectors);
        if (ctx.error) return;
    } else if (vDest.type == "PIN") {
        dst = execPin(ctx, vDest);
        if (ctx.error) return;
    } else {
        error(ctx, ast, "Bad assignement");
    }

    if (!dst) return  error(ctx, ast, "Signal not defined");
    if (dst.type != "SIGNAL") return  error(ctx, ast, "Signal assigned to a non signal");

    let sDest=ctx.signals[dst.fullName];
    if (!sDest) return error(ctx, ast, "Invalid signal: "+dst.fullName);

    let isOut = (sDest.component == "main")&&(sDest.direction=="OUT");
    while (sDest.equivalence) {
        sDest=ctx.signals[sDest.equivalence];
        isOut = isOut || ((sDest.component == "main")&&(sDest.direction=="OUT"));
    }

    if (sDest.value) return error(ctx, ast, "Signals cannot be assigned twice");

    let src = exec(ctx, ast.values[1]);
    if (ctx.error) return;


    /*
    let vSrc;
    if (ast.values[1].type == "DECLARE") {
        vSrc = exec(ctx, ast.values[1]);
        if (ctx.error) return;
    } else {
        vSrc = ast.values[1];
    }

    if (vSrc.type == "VARIABLE") {
        src = getScope(ctx, vSrc.name, vSrc.selectors);
        if (!src) error(ctx, ast, "Variable not defined: " + vSrc.name);
        if (ctx.error) return;
    } else if (vSrc.type == "PIN") {
        src = execPin(ctx, vSrc);
    }
    */

    let assignValue = true;
    if (src.type == "SIGNAL") {
        let sSrc = ctx.signals[src.fullName];
        let isIn  = (sSrc.component == "main")&&(sSrc.direction == "IN");
        while (sSrc.equivalence) {
            sSrc=ctx.signals[sSrc.equivalence];
            isIn = isIn || ((sSrc.component == "main")&&(sSrc.direction == "IN"));
        }

        // Skip if an out is assigned directly to an input.
        if ((!isIn)||(!isOut)) {
            sDest.equivalence = src.fullName;
            sDest.alias = sDest.alias.concat(src.alias);
            while (sDest.equivalence) sDest=ctx.signals[sDest.equivalence];
            assignValue = false;
        }
    }

    if (assignValue) {
        //        const resLC = exec(ctx, vSrc);
        if (ctx.error) return;

        //        const v = lc.evaluate(ctx, resLC);
        const v = lc.evaluate(ctx, src);

        if (v.value) {
            sDest.value = v.value;
        }
    }

    return vDest;
}

function execConstrain(ctx, ast) {
    ast.fileName = ctx.fileName;
    ast.filePath = ctx.filePath;
    const a = exec(ctx, ast.values[0]);
    if (ctx.error) return;
    const b = exec(ctx, ast.values[1]);
    if (ctx.error) return;

    const res = lc.sub(a,b);
    if (res.type == "ERROR") return error(ctx, ast, res.errStr);

    if (!lc.isZero(res)) {
        ctx.constraints.push(lc.toQEQ(res));
    }

    return res;
}

function execSignalAssignConstrain(ctx, ast) {
    const v = execSignalAssign(ctx,ast);
    if (ctx.error) return;
    execConstrain(ctx, ast);
    if (ctx.error) return;
    return v;
}

function execInclude(ctx, ast) {
    const incFileName = path.resolve(ctx.filePath, ast.file);
    const incFilePath = path.dirname(incFileName);

    ctx.includedFiles = ctx.includedFiles || [];
    if (ctx.includedFiles[incFileName]) return;

    ctx.includedFiles[incFileName] = true;

    const src = fs.readFileSync(incFileName, "utf8");

    if (!src) return error(ctx, ast, "Include file not found: "+incFileName);

    const incAst = parser.parse(src);

    const oldFilePath = ctx.filePath;
    const oldFileName = ctx.fileName;
    ctx.filePath = incFilePath;
    ctx.fileName = incFileName;

    exec(ctx, incAst);

    ast.block = incAst;

    ctx.filePath = oldFilePath;
    ctx.fileName = oldFileName;
}

function execArray(ctx, ast) {
    const res = [];

    for (let i=0; i<ast.values.length; i++) {
        res.push(exec(ctx, ast.values[i]));
    }

    return res;
}

function copyScope(scope) {
    var scopesClone = [];
    for (let i=0; i<scope.length; i++) {
        scopesClone.push(scope[i]);
    }
    return scopesClone;
}

