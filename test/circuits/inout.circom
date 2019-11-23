template Internal() {
    signal input in1;
    signal input in2[2];
    signal input in3[3][2];

    signal output out1;
    signal output out2[2];
    signal output out3[3][2];

    out1 <== in1;
    out2[0] <== in2[0];
    out2[1] <== in2[1];

    out3[0][0] <== in3[0][0];
    out3[0][1] <== in3[0][1];
    out3[1][0] <== in3[1][0];
    out3[1][1] <== in3[1][1];
    out3[2][0] <== in3[2][0];
    out3[2][1] <== in3[2][1];
}

template InOut() {
    signal input in1;
    signal input in2[2];
    signal input in3[3][2];

    signal output out1;
    signal output out2[2];
    signal output out3[3][2];

    component internal = Internal();

    internal.in1 <== in1;
    internal.in2[0] <== in2[0];
    internal.in2[1] <== in2[1];
    internal.in3[0][0] <== in3[0][0];
    internal.in3[0][1] <== in3[0][1];
    internal.in3[1][0] <== in3[1][0];
    internal.in3[1][1] <== in3[1][1];
    internal.in3[2][0] <== in3[2][0];
    internal.in3[2][1] <== in3[2][1];

    internal.out1 ==> out1;
    internal.out2[0] ==> out2[0];
    internal.out2[1] ==> out2[1];
    internal.out3[0][0] ==> out3[0][0];
    internal.out3[0][1] ==> out3[0][1];
    internal.out3[1][0] ==> out3[1][0];
    internal.out3[1][1] ==> out3[1][1];
    internal.out3[2][0] ==> out3[2][0];
    internal.out3[2][1] ==> out3[2][1];
}

component main = InOut();
