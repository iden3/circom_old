
/*
include "sha256_2.jaz";

component main = SHA256_2();
*/

/*
include "constants.jaz"

template A() {
    signal input in;
    component h0;
    h0 = K(8);

    var lc = 0;
    var e = 1;
    for (var i=0; i<32; i++) {
        lc = lc + e*h0.out[i];
        e *= 2;
    }

    lc === in;
}

component main = A();
*/

include "bitify.jaz"

template A() {
    signal input in;
    signal output out;

    component n2b;
    component b2n;

    n2b = Num2Bits(216);
    b2n = Bits2Num(216);

    n2b.in <== in;

    for (var i=0; i<216; i++) {
        b2n.in[i] <== n2b.out[i];
    }

    out <== b2n.out;
}

component main = A();
