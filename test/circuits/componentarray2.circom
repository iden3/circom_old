template Square() {
    signal input in;
    signal output out;

    out <== in**2;
}

template Main(n, nrounds) {
    signal input in[n];
    signal output out[n];

    component squares[n][nrounds];

    for (var i=0; i<n; i++) {
        for (var r=0; r<nrounds; r++) {
            squares[i][r] = Square();
            if (r==0) {
                squares[i][r].in <== in[i];
            } else {
                squares[i][r].in <== squares[i][r-1].out;
            }
        }
        squares[i][nrounds-1].out ==> out[i];
    }
}

component main = Main(2, 3);
