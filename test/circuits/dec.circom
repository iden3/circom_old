template Main() {
    signal input in;
    signal output out[2];

// First play with variables;

    var c = 3;
    var d = c--;    // d --> 3
    var e = --c;    // e --> 1

    out[0] <== in + e;   // in + 1

// Then play with signals

    c = in;
    d = c--;            //d <-- in;
    e = --c;            // d <-- in-2

    out[1] <== in + e;    // 2*in -2

}

component main = Main();
