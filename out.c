// File: ../../circuits/sha256/bitify.circom
function Num2Bits(ctx)
{
    ctx.setVar("lc1", [], "0");
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt(bigInt(ctx.getVar("n",[]))) ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__))
    {
        ctx.setSignal("out", [ctx.getVar("i",[])], bigInt(bigInt(ctx.getVar("i",[])).greater(bigInt(256)) ? 0 : bigInt(ctx.getSignal("in", [])).shr(bigInt(ctx.getVar("i",[]))).and(__MASK__)).and(bigInt("1")).and(__MASK__));
        ctx.assert(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).mul(bigInt(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).add(__P__).sub(bigInt("1")).mod(__P__))).mod(__P__), "0");
        ctx.setVar("lc1", [], bigInt(ctx.getVar("lc1",[])).add(bigInt(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).mul(bigInt(bigInt("2").modPow(bigInt(ctx.getVar("i",[])), __P__))).mod(__P__))).mod(__P__));
    }

    ctx.assert(ctx.getVar("lc1",[]), ctx.getSignal("in", []));
}

function Bits2Num(ctx)
{
    ctx.setVar("lc1", [], "0");
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt(bigInt(ctx.getVar("n",[]))) ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__))
    {
        ctx.setVar("lc1", [], bigInt(ctx.getVar("lc1",[])).add(bigInt(bigInt(ctx.getSignal("in", [ctx.getVar("i",[])])).mul(bigInt(bigInt("2").modPow(bigInt(ctx.getVar("i",[])), __P__))).mod(__P__))).mod(__P__));
    }

    ctx.setSignal("out", [], ctx.getVar("lc1",[]));
    ctx.assert(ctx.getSignal("out", []), ctx.getVar("lc1",[]));
}


// File: ../../circuits/sha256/binsum.circom
function nbits(ctx) {
    ctx.setVar("n", [], "1");
    ctx.setVar("r", [], "0");
    while (bigInt(bigInt(ctx.getVar("n",[])).add(__P__).sub(bigInt("1")).mod(__P__)).lt(bigInt(ctx.getVar("a",[]))) ? 1 : 0) {
        (ctx.setVar("r", [], bigInt(ctx.getVar("r",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__);
        ctx.setVar("n", [], bigInt(ctx.getVar("n",[])).mul(bigInt("2")).mod(__P__));
    }

    return ctx.getVar("r",[]);;
}
function BinSum(ctx)
{
    ctx.setVar("nout", [], ctx.callFunction("nbits", [bigInt(bigInt(bigInt("2").modPow(bigInt(ctx.getVar("n",[])), __P__)).add(__P__).sub(bigInt("1")).mod(__P__)).mul(bigInt(ctx.getVar("ops",[]))).mod(__P__)]));
    ctx.setVar("lin", [], "0");
    ctx.setVar("lout", [], "0");
    for (ctx.setVar("k", [], "0");bigInt(ctx.getVar("k",[])).lt(bigInt(ctx.getVar("n",[]))) ? 1 : 0;(ctx.setVar("k", [], bigInt(ctx.getVar("k",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__))
    {
        for (ctx.setVar("j", [], "0");bigInt(ctx.getVar("j",[])).lt(bigInt(ctx.getVar("ops",[]))) ? 1 : 0;(ctx.setVar("j", [], bigInt(ctx.getVar("j",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__))
        {
            ctx.setVar("lin", [], bigInt(ctx.getVar("lin",[])).add(bigInt(bigInt(ctx.getSignal("in", [ctx.getVar("j",[]),ctx.getVar("k",[])])).mul(bigInt(bigInt("2").modPow(bigInt(ctx.getVar("k",[])), __P__))).mod(__P__))).mod(__P__));
        }

    }

    for (ctx.setVar("k", [], "0");bigInt(ctx.getVar("k",[])).lt(bigInt(ctx.getVar("nout",[]))) ? 1 : 0;(ctx.setVar("k", [], bigInt(ctx.getVar("k",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__))
    {
        ctx.setSignal("out", [ctx.getVar("k",[])], bigInt(bigInt(ctx.getVar("k",[])).greater(bigInt(256)) ? 0 : bigInt(ctx.getVar("lin",[])).shr(bigInt(ctx.getVar("k",[]))).and(__MASK__)).and(bigInt("1")).and(__MASK__));
        ctx.assert(bigInt(ctx.getSignal("out", [ctx.getVar("k",[])])).mul(bigInt(bigInt(ctx.getSignal("out", [ctx.getVar("k",[])])).add(__P__).sub(bigInt("1")).mod(__P__))).mod(__P__), "0");
        ctx.setVar("lout", [], bigInt(ctx.getVar("lout",[])).add(bigInt(bigInt(ctx.getSignal("out", [ctx.getVar("k",[])])).mul(bigInt(bigInt("2").modPow(bigInt(ctx.getVar("k",[])), __P__))).mod(__P__))).mod(__P__));
    }

    ctx.assert(ctx.getVar("lin",[]), ctx.getVar("lout",[]));
}


function A(ctx)
{
    ctx.setPin("n2ba", [], "in", [], ctx.getSignal("a", []));
    ctx.assert(ctx.getPin("n2ba", [], "in", []), ctx.getSignal("a", []));
    ctx.setPin("n2bb", [], "in", [], ctx.getSignal("b", []));
    ctx.assert(ctx.getPin("n2bb", [], "in", []), ctx.getSignal("b", []));
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt(bigInt("32")) ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add(bigInt("1")).mod(__P__))).add(__P__).sub(bigInt(1)).mod(__P__))
    {
        ctx.setPin("sum", [], "in", ["0",ctx.getVar("i",[])], ctx.getPin("n2ba", [], "out", [ctx.getVar("i",[])]));
        ctx.assert(ctx.getPin("sum", [], "in", ["0",ctx.getVar("i",[])]), ctx.getPin("n2ba", [], "out", [ctx.getVar("i",[])]));
        ctx.setPin("sum", [], "in", ["1",ctx.getVar("i",[])], ctx.getPin("n2bb", [], "out", [ctx.getVar("i",[])]));
        ctx.assert(ctx.getPin("sum", [], "in", ["1",ctx.getVar("i",[])]), ctx.getPin("n2bb", [], "out", [ctx.getVar("i",[])]));
        ctx.setPin("b2n", [], "in", [ctx.getVar("i",[])], ctx.getPin("sum", [], "out", [ctx.getVar("i",[])]));
        ctx.assert(ctx.getPin("b2n", [], "in", [ctx.getVar("i",[])]), ctx.getPin("sum", [], "out", [ctx.getVar("i",[])]));
    }

    ctx.setSignal("out", [], ctx.getPin("b2n", [], "out", []));
    ctx.assert(ctx.getSignal("out", []), ctx.getPin("b2n", [], "out", []));
}

