// --> Assignation without constrain
// <-- Assignation without constrain
// === Constrain
// <== Assignation with constrain
// ==> Assignation with constrain
// All variables are members of the field F[p]
// https://github.com/zcash-hackworks/sapling-crypto
// https://github.com/ebfull/bellman

/*
function log2(a) {
    if (a==0) {
        return 0;
    }
    let n = 1;
    let r = 1;
    while (n<a) {
        r++;
        n *= 2;
    }
    return r;
}
*/

template EscalarProduct(w) {
    signal input in1[w];
    signal input in2[w];
    signal output out;
    signal aux[w];
    var lc = 0;
    for (var i=0; i<w; i++) {
        aux[i] <== in1[i]*in2[i];
        lc = lc + aux[i];
    }
    out <== lc;
}

template Decoder(w) {
    signal input inp;
    signal output out[w];
    signal output success;
    var lc=0;

    for (var i=0; i<w; i++) {
        out[i] <-- (inp == i) ? 1 : 0;
        out[i] * (inp-i) === 0;
        lc = lc + out[i];
    }

    lc ==> success;
    success * (success -1) === 0;
}


template Multiplexor(wIn, nIn) {
    signal input inp[nIn][wIn];
    signal input sel;
    signal output out[wIn];
    component Decoder(nIn) dec;
    component EscalarProduct(nIn) ep[wIn];
    sel ==> dec.inp;
    for (var j=0; j<wIn; j++) {
        for (var k=0; k<nIn; k++) {
            inp[k][j] ==> ep[j].in1[k];
            dec.out[k] ==> ep[j].in2[k];
        }
        ep[j].out ==> out[j];
    }
    dec.success === 1;
}

component Multiplexor(8,3) main;


