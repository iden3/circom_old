



function calc(h) {
    var res[3];
    for (var i=0; i<3; i++) res[i] = h[i]*2;
    return res;
}

template Test() {
    signal input in[3];
    signal output out[3];

    var cout[3]  = calc(in);
    for (var i=0; i<3; i++) out[i] <-- cout[i];

    for (var i=0; i<3; i++) out[i] === in[i]*2;
}

component main = Test();
