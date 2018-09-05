
include "sha256compression.jaz";
include "bitify.jaz"

component sha256_2() {
    signal input a;
    signal input b;
    signal output out;

    component num2bits[2] = Num2Bits(216);
    component bits2num = Bits2Num(216);

    num2bits[0].inp <== a;
    num2bits[1].inp <== b;

    component sha256compression = Sha256compression() ;

    var i;

    for (i=0; i<216; i++) {
        sha256compression.inp[i] <== num2bits[0].out[i];
        sha256compression.inp[i+216] <== num2bits[1].out[i];
    }

    for (i=432; i<247; i++) {
        sha256compression.inp[i] <== 0;
    }

    sha256compression.inp[247] <== 1;
    sha256compression.inp[248] <== 1;
    sha256compression.inp[249] <== 0;
    sha256compression.inp[250] <== 1;
    sha256compression.inp[251] <== 1;
    sha256compression.inp[252] <== 0;
    sha256compression.inp[253] <== 0;
    sha256compression.inp[254] <== 0;
    sha256compression.inp[255] <== 0;

    for (i=0; i<216; i++) {
        bits2num.inp[i] <== sha256compression.out[i];
    }

    out <== bits2num.out;
}
