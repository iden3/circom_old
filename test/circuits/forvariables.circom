template A() {
    signal input in;
    signal output out;

    var acc = 0;
    for (var i=0; i<3; i++) {
        if (i==1) {
            var accIn = 0;
            for (var j=0; j<3; j++) {
                accIn= accIn+1;
            }
            acc = acc + accIn;
        }
    }

    out <== in + acc;
}

component main = A();
