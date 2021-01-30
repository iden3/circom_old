template test() {
  signal out1[4];
  signal out2[10];

  for(var i = 0; i < 4; i++) {
    out1[i] <== i == 2 ? 1 : 2;
  }

  // this becomes an endless loop
  for(var i = 0; i < 10; i++) {
    log(i);
    // if you comment out this line, the `Signal assigned twice` error disappears and loop will indefinitely log `1`
    out2[i] <== i;
  }
}

component main = test()

