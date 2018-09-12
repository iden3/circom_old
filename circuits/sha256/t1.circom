include "binsum.circom";
include "sigma.circom";
include "ch.circom";

template T1() {
    signal input h[32];
    signal input e[32];
    signal input f[32];
    signal input g[32];
    signal input k[32];
    signal input w[32];
    signal output out[32];

    component sum = Sum(32, 5);
    component ch = Ch(32);

    component bigsigma1 = Sigma(6, 11, 25);

    for (var k=0; k<32; k++) {
        bigsigma1.in[k] <== e[k];
        ch.a[k] <== e[k];
        ch.b[k] <== f[k];
        ch.c[k] <== g[k]

        sum.in[0][k] <== h[k];
        sum.in[1][k] <== bigsigma1.out[k];
        sum.in[2][k] <== ch.out[k];
        sum.in[3][k] <== k[k];
        sum.in[4][k] <== w[k];

        out[k] <== sum.out[k];
    }
}
