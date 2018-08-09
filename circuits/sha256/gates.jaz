
template XOR() {
    signal input a;
    signal input b;
    signal output out;

    out <== a + b - 2*a*b;
}

template AND() {
    signal input a;
    signal input b;
    signal output out;

    out <== a*b;
}

template OR() {
    signal input a;
    signal input b;
    signal output out;

    out <== a + b - a*b;
}

template NOT() {
    signal input in;
    signal output out;

    out <== 1 + in - 2*in;
}

template NAND() {
    signal input a;
    signal input b;
    signal output out;

    out <== 1 - a*b;
}

template NOR() {
    signal input a;
    signal input b;
    signal output out;

    out <== a*b + 1 - a - b;
}

template Xor3(n) {
    signal input a[n];
    signal input b[n];
    signal input c[n];
    signal output out[n];

    component xor1[n] = XOR();
    component xor2[n] = XOR();

    for (var k=0; k<n; k++) {
        xor1[k].a <== a[k];
        xor1[k].b <== b[k];

        xor2[k].a <== xor1[k].out;
        xor2[k].b <== c[k];

        out[k] <== xor2[k].out;
    }
}
