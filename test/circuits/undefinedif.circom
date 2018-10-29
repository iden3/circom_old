template X() {
    signal input i;
    signal input j;
    signal output out;

    if (i == 0) {
        out <-- i;
    }
    else {
        out <-- j;
    }
}

component main = X();
