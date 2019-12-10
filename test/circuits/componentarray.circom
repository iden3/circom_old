template Square() {
    signal input in;
    signal output out;

    out <== in*in;
}

template Main(n) {
    signal input in;
    signal output out;

    component squares[n];

    var i;

    for (i=0; i<n; i++) {
        squares[i] = Square();
        if (i==0) {
            squares[i].in <== in;
        } else {
            squares[i].in <== squares[i-1].out;
        }
    }

    squares[n-1].out ==> out;
}

component main = Main(3);
