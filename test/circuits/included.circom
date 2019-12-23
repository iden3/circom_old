template T1() {
    signal input in;
    signal output out;

    out <== in**2/3;
}

function F1(a) {
    return a**2/3;
}
