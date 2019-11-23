
const ModuleBuilder = require("wasmbuilder").ModuleBuilder;
const gen = require("./gencode");


module.exports = function buildWasm(ctx) {

    const fDefined = {};

    ctx.module = new ModuleBuilder();
    for (let f in ctx.functions) {
        ctx.f = ctx.module.addFunction(f);
        ctx.c = ctx.f.getCodeBuilder();

        ctx.scope = {};
        for (let p in ctx.functions[f].params) {
            const param = ctx.functions[f].params[p];
            ctx.f.addParam(param.name, "i32");
            ctx.scope[param.name] = {
                type: "PARAM",
                sels: param.sels,
                getter: () => { return ctx.c.getLocal(param.name); },
                setter: (v) => { return ctx.c.setLocal(param.name, v); }
            };
        }

        gen(ctx, ctx.functions[f].block);
    }

    for (let i=0; i<ctx.components.length; i++) {
        const h = hashComponentCall(ctx, i);
        const fName = ctx.components[i].temlate+"_"+h;
        if (!fDefined[fName]) {

            ctx.f = ctx.module.addFunction(fName);
            ctx.c = ctx.f.getCodeBuilder();

            ctx.scope = {};
            for (let p in ctx.components[i].params) {
                ctx.scope[p] = createConstant(ctx, ctx.components[i].params[p]);
            }

            gen(ctx, ctx.templates[ctx.components[i].temlate].block);
        }
        ctx.components[i].f = fName;
    }
};

function buildSetSignal(ctx) {


}
