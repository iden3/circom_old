template WhileRolled() {
    signal input in;
    signal output out;

    var acc = 0;

    var i=0;
    while (i<in) {
        acc = acc + 1;
        i++
    }

    out <== acc;
}

component main = WhileRolled();
