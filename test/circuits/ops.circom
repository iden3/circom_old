template Ops() {
    signal input in[2];
    signal output add;
    signal output sub;
    signal output mul;

    add <-- in[0] + in[1];
    sub <-- in[0] - in[1];
    mul <-- in[0] * in[1];
}

component main = Ops();
