

module.exports = genOpt;


function genOpt(ctx, ast) {
    if (ast.type == "OP") {
        if (ast.op == "=") {
            return genOptVarAssignement(ctx, ast);
        } else {
            error(ctx, ast, "GENOPT -> Invalid operation: " + ast.op);
        }
    } else if (ast.type == "TEMPLATEDEF") {
        return genOptTemplateDef(ctx, ast);
    } else {
        error(ctx, ast, "GENOPT -> Invalid AST node type: " + ast.type);
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
        ast: ast
    };
}


function genOptTemplateDef(ctx, ast) {
    if (ctx.templates[ast.name]) {
        return error(ctx, ast, "Template name already exists: "+ast.name);
    }
    ctx.templates[ast.name] = {
        type: "TEMPLATE",
        params: ast.params,
        block: ast.block,
        fileName: ctx.fileName,
        filePath: ctx.filePath
    };
}

function genOptVarAssignement(ctx, ast) {
    let varName;
    if (ast.values[0].type == "DECLARE") {
        varName = genOptCode(ctx, ast.values[0]);
        if (ctx.error) return;
    } else {
        varName = ast.values[0];
    }
    const varContent = getScope(ctx, varName.name, varName.selectors);
    if (ctx.error) return;

    if ((typeof(varContent) != "object")||(varContent == null)) return  error(ctx, ast, "Variable not defined");

    if (varContent.type == "COMPONENT") return genOptInstantiateComponet(ctx, varName, ast.values[1]);
    if (varContent.type == "SIGNAL") return error(ctx, ast, "Cannot assig to a signal with `=` use <-- or <== ops");

    const res = genOpt(ctx, ast.values[1]);
    if (ctx.error) return;

    setScope(ctx, varName.name, varName.selectors, res);

    return v;
}
