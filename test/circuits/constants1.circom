


template Add(n) {
    signal input in[n];
    signal output out;

    var lc = 0;
    for (var i=0; i<n; i++) {
        lc = lc + in[i];
    }

    out <== lc;
}

function FAdd(a,b) {
    return a+b;
}

template Main() {
    signal input in;
    signal output out;

    var o = FAdd(3,4);
    o = o + FAdd(3,4);
    o = o + FAdd(3,4);  // o = 21

    component A1 = Add(2);
    A1.in[0] <== in;
    A1.in[1] <== o;

    component A2 = Add(2);
    A2.in[0] <== A1.out;
    A2.in[1] <== o;

    out <== A2.out; // in + 42
}

component main = Main();
