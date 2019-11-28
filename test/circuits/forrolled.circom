template ForRolled() {
    signal input in;
    signal output out;

    var acc = 0;

    for (var i=0; i<in; i = i+1) {
        acc = acc + 1;
    }

    out <== acc;
}

component main = ForRolled();
