template Ops2() {
    signal input in[2];
    signal output div;
    signal output idiv;
    signal output mod;

    div  <-- in[0] / in[1];
    idiv <-- in[0] \ in[1];
    mod  <-- in[0] % in[1];
}

component main = Ops2();
