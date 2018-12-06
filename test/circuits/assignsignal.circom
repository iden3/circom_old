template A() {
    signal output out;

    out = 3;  // This is an error that compile should detect
}

component main = A();
