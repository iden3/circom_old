template ForUnrolled(n) {
    signal input in;
    signal output out[n];

    for (var i=0; i<n; i = i+1) {
        out[i] <== in + i;
    }
}

component main = ForUnrolled(3);
