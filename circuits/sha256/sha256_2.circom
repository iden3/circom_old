
include "sha256compression.circom";
include "bitify.circom"

template Sha256_2() {
    signal input a;
    signal input b;
    signal output out;

    component bits2num = Bits2Num(216);
    component num2bits[2];

    num2bits[0] = Num2Bits(216);
    num2bits[1] = Num2Bits(216);

    num2bits[0].in <== a;
    num2bits[1].in <== b;

    component sha256compression = Sha256compression() ;

    var i;

    for (i=0; i<216; i++) {
        sha256compression.inp[i] <== num2bits[0].out[215-i];
        sha256compression.inp[i+216] <== num2bits[1].out[215-i];
    }

    sha256compression.inp[432] <== 1;

    for (i=433; i<503; i++) {
        sha256compression.inp[i] <== 0;
    }

    sha256compression.inp[503] <== 1;
    sha256compression.inp[504] <== 1;
    sha256compression.inp[505] <== 0;
    sha256compression.inp[506] <== 1;
    sha256compression.inp[507] <== 1;
    sha256compression.inp[508] <== 0;
    sha256compression.inp[509] <== 0;
    sha256compression.inp[510] <== 0;
    sha256compression.inp[511] <== 0;

    for (i=0; i<216; i++) {
        bits2num.in[i] <== sha256compression.out[255-i];
    }

    out <== bits2num.out;
}
