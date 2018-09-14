

template RotR(n, r) {
    signal input in[n];
    signal output out[n];

    for (var i=0; i<n; i++) {
        out[i] <== in[ (i+r)%n ];
    }
}
