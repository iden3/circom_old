
const assert = require("assert");

module.exports = iterateAST;


function iterateAST(ast, fn, _pfx) {
    if (!ast) return;

    const pfx = _pfx || "";
    let itPfx = 0;

    function getPfx() {
        res = pfx+"."+itPfx;
        itPfx ++;
        return res;
    }


    let res = fn(ast, pfx);
    if (res) return res;
    function iterate(arr) {
        if (arr) {
            for (let i=0; i<arr.length; i++) {
                res = iterateAST(arr[i], fn, getPfx());
                if (res) return res;
            }
        }
    }

    if ((ast.type == "NUMBER")) {
        //
    } else if (ast.type == "VARIABLE") {
        iterate(ast.selectors);
    } else if (ast.type == "PIN") {
        iterate(ast.component.selectors);
        iterate(ast.pin.selectors);
    } else if (ast.type == "OP") {
        iterate(ast.values);
    } else if (ast.type == "DECLARE") {
        iterate(ast.name.selectors);
    } else if (ast.type == "FUNCTIONCALL") {
        iterate(ast.params);
    } else if (ast.type == "BLOCK") {
        iterate(ast.statements);
    } else if (ast.type == "COMPUTE") {
        iterateAST(ast.body, fn, getPfx());
    } else if (ast.type == "FOR") {
        iterateAST(ast.init, fn, getPfx());
        iterateAST(ast.condition, fn, getPfx());
        iterateAST(ast.step, fn, getPfx());
        iterateAST(ast.body, fn, getPfx());
    } else if (ast.type == "WHILE") {
        iterateAST(ast.condition, fn, getPfx());
        iterateAST(ast.body, fn, getPfx());
    } else if (ast.type == "IF") {
        iterateAST(ast.condition, fn, getPfx());
        iterateAST(ast.then, fn, getPfx());
        iterateAST(ast.else, fn, getPfx());
    } else if (ast.type == "RETURN") {
        iterateAST(ast.value, fn, getPfx());
    } else if (ast.type == "ARRAY") {
        iterate(ast.values);
    } else if ((ast.type == "TEMPLATEDEF")) {
        //
    } else if ((ast.type == "FUNCTIONDEF")) {
        //
    } else if ((ast.type == "INCLUDE")) {
        //
    } else {
        assert(false, "GEN -> Invalid AST iteration: " + ast.type);
    }


}
