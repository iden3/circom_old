template Internal() {
    signal input in;
    signal output out;

    out <== in;
}

template InOut() {
    signal input in;
    signal output out;

    component internal = Internal();

    internal.in <== in;
    internal.out ==> out;
}

component main = InOut();
