template Main() {
    signal input in;
    signal output out[3];

    if (in == 0) {
        out[0] <-- 1;         // TRUE
    }
    if (in != 0) {
        out[0] <-- 0;
    }

    if (in ==  1) {
        out[1] <-- 1;        // TRUE
    } else {
        out[1] <-- 0;
    }

    if (in == 2) {
        out[2] <-- 1;
    } else {
        out[2] <-- 0;        // TRUE
    }

}

component main = Main();
