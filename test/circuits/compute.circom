template X() {
    signal input x;
    signal output y;
    signal x2;
    signal x3;
    var a;
    compute {
        a = (x*x*x+6)/x;
        y <-- a;
    }

    x2 <== x*x;
    x3 <== x2*x;
    x*y === x3+6;
}

component main = X();
