
template Const() {
    signal output out[2];

    out[0] <== 2;
    out[1] <== 2;
}

template Main() {
    signal input in;
    signal output out;

    component const = Const();

    out <== const.out[0] + const.out[1] + in;
}

component main = Main();
