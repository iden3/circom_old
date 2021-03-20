

template sum() {
  signal input in[2];
  signal output out;
  out <== in[0] + in[1];
}


template Test() {
    component hasher = sum();
    hasher.in[0] <== 1;
    hasher.in[1] <== 2;
}

component main = Test();

