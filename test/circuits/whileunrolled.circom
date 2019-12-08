template WhileUnrolled(n) {
    signal input in;
    signal output out[n];

    var i=0;
    while (i<n) {
        out[i] <== in + i;
        i++;
    }
}

component main = WhileUnrolled(3);
