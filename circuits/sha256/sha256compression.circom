
include "constants.circom";
include "t1.circom";
include "t2.circom";
include "binsum.circom";
include "sigmaplus.circom";

template Sha256compression() {
    signal input inp[512];
    signal output out[256];
    signal a[64][32];
    signal b[64][32];
    signal c[64][32];
    signal d[64][32];
    signal e[64][32];
    signal f[64][32];
    signal g[64][32];
    signal h[64][32];
    signal w[64][32];

    var i;

    component sigmaPlus[48] = SigmaPlus();

    component ct_k[64];
    for (i=0; i<64; i++) ct_k[i] = K(i);

    component ha0 = H0(0);
    component hb0 = H0(1);
    component hc0 = H0(2);
    component hd0 = H0(3);
    component he0 = H0(4);
    component hf0 = H0(5);
    component hg0 = H0(6);
    component hh0 = H0(7);

    component t1[64] = T1();
    component t2[64] = T2();

    component suma[64] = Sum(32, 2);
    component sume[64] = Sum(32, 2);
    component fsum[8]  = Sum(32, 2);

    var k;
    var t;

    for (t=0; t<64; t++) {
        if (t<16) {
            for (k=0; k<32; k++) {
                w[t][k] <== inp[t*32+k];
            }
        } else {
            for (k=0; k<32; k++) {
                sigmaPlus[t-16].in2[k] <== w[t-2][k];
                sigmaPlus[t-16].in7[k] <== w[t-2][k];
                sigmaPlus[t-16].in15[k] <== w[t-15][k];
                sigmaPlus[t-16].in16[k] <== w[t-16][k];
                w[t][k] <== sigmaPlus[t-16].out[k];
            }
        }
    }

    for (k=0; k<32; k++ ) {
        a[0][k] <== ha0.out[k]
        b[0][k] <== hb0.out[k]
        c[0][k] <== hc0.out[k]
        d[0][k] <== hd0.out[k]
        e[0][k] <== he0.out[k]
        f[0][k] <== hf0.out[k]
        g[0][k] <== hg0.out[k]
        h[0][k] <== hh0.out[k]
    }

    for (t = 0; t<63; t++) {
        for (k=0; k<32; k++) {
            t1[t].h[k] <== h[k];
            t1[t].e[k] <== e[k];
            t1[t].f[k] <== f[k];
            t1[t].g[k] <== g[k];
            t1[t].k[k] <== ct_K[t].out[k];
            t1[t].w[k] <== w[t][k];

            t2[t].a[k] <== a[k];
            t2[t].b[k] <== b[k];
            t2[t].c[k] <== c[k];
        }

        for (k=0; k<32; k++) {
            sume[t].a[k] <== d[k];
            sume[t].b[k] <== t1[t].out[k];

            suma[t].a[k] <== t1[t].out[k];
            suma[t].b[k] <== t2[t].out[k];
        }

        for (k=0; k<32; k++) {
            h[t+1] <== g[t];
            g[t+1] <== f[t];
            f[t+1] <== e[t];
            e[t+1] <== sume[t].out[k];
            d[t+1] <== c[t];
            c[t+1] <== b[t];
            b[t+1] <== a[t];
            a[t+1] <== suma[t].out[k];
        }
    }

    for (k=0; k<32; k++) {
        fsum[0].in[0][k] <==  ha0.out[k];
        fsum[0].in[1][k] <==  a[64][k];
        fsum[1].in[0][k] <==  hb0.out[k];
        fsum[1].in[1][k] <==  b[64][k];
        fsum[2].in[0][k] <==  hc0.out[k];
        fsum[2].in[1][k] <==  c[64][k];
        fsum[3].in[0][k] <==  hd0.out[k];
        fsum[3].in[1][k] <==  d[64][k];
        fsum[4].in[0][k] <==  he0.out[k];
        fsum[4].in[1][k] <==  e[64][k];
        fsum[5].in[0][k] <==  hf0.out[k];
        fsum[5].in[1][k] <==  f[64][k];
        fsum[6].in[0][k] <==  hg0.out[k];
        fsum[6].in[1][k] <==  g[64][k];
        fsum[7].in[0][k] <==  hh0.out[k];
        fsum[7].in[1][k] <==  h[64][k];
    }

    for (k=0; k<32; k++) {
        out[k]     <== fsum[0].out[k];
        out[32+k]  <== fsum[1].out[k];
        out[64+k]  <== fsum[2].out[k];
        out[96+k]  <== fsum[3].out[k];
        out[128+k] <== fsum[4].out[k];
        out[160+k] <== fsum[5].out[k];
        out[192+k] <== fsum[6].out[k];
        out[224+k] <== fsum[7].out[k];
    }
}
