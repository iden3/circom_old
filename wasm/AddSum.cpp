
class Value {

}

class Var : Value {

}

class Ctx {
    char *currentComponent;

    Var getParam(char *);
    Var getSignal(char *, ...);

    Var newVar(char *);
}





void Num2Bits::Num2Bits(ctx) {
    Var n = ctx.getParam("n");
    Var in = ctx.getSignal("in");
    Var out = ctx.getSignal("out");
    (Var lc1 = ctx.newVar()) = _0x0;

    for ((Var i = ctx.newVar()) = _0x0  ; i<n; i++ ) {
        out[i] = (in >> i) & _0x1;
        assert(out[i]*(out[i] - _0x1), _0x0);
        lc1 += out[i] * (2**i);
    }

    assert(lc1, in);
}
