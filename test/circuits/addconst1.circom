

template AddConst(c) {
    signal input in;
    signal output out;
    var a = 2;
    var b = 3;
    a=a+b;
    a=a+4;
    a=a+c;

    out <== 5 + a + in;
}

// It should out <== in + 1+2+3+4+5 = in + 15
component main = AddConst(1);
