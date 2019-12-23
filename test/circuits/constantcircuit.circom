template H(x) {
    signal output out[32];
    var c[8] = [0x6a09e667,
             0xbb67ae85,
             0x3c6ef372,
             0xa54ff53a,
             0x510e527f,
             0x9b05688c,
             0x1f83d9ab,
             0x5be0cd19];

    for (var i=0; i<32; i++) {
        out[i] <== (c[x] >> i) & 1;
    }
}

component main = H(1);
