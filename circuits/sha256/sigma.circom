include "xor3.circom";
include "rotate.circom";

template Sigma(ra, rb, rc) {
    signal input in[32];
    signal output out;

    component xor3 = Xor3(32);

    component rota = RotR(32, ra);
    component rotb = RotR(32, rb);
    component rotc = RotR(32, rc);

    for (var k=0; k<32; k++) {
        rota.in[k] <== in[k];
        rotb.in[k] <== in[k];
        rotc.in[k] <== in[k];

        xor3.a[k] <== rota.out[k];
        xor3.b[k] <== rotb.out[k];
        xor3.c[k] <== rotc.out[k];

        out[k] <== xor3.out[k];
    }
}
