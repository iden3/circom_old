
template Add() {
    signal input in[2];
    signal output out;

    out <== in[0] + in[1];
}

component main = Add();
