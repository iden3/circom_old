template Ops3() {
    signal input in[2];
    signal output neg1;
    signal output neg2;
    signal output pow;

    neg1 <-- -in[0];
    neg2 <-- -in[1];
    pow  <-- in[0] ** in[1];
}

component main = Ops3();
