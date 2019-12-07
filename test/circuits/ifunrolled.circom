

template Main() {
    signal input in;
    signal output out[3];

    var c = 1;
    if (c == 1) {
        out[0] <== in +1;         // TRUE
    }
    if (c == 0) {
        out[0] <== in +2;
    }

    c = c +1;
    if (c == 2) {
        out[1] <== in + 3;        // TRUE
    } else {
        out[1] <== in + 4;
    }

    c = c +1;
    if (c == 2) {
        out[2] <== in + 5;
    } else {
        out[2] <== in + 6;        // TRUE
    }

}

component main = Main();
