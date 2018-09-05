

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * 2**i;
    }

    lc1 === in;

}

template Bits2Num(n) {
    signal input in[n];
    signal output out;
    var lc1=0;

    for (var i = 0; i<n; i++) {
        lc1 += in[i] * 2**i;
    }

    lc1 ==> out;
}
