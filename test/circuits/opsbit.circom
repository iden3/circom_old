template OpsBit() {
    signal input in[2];
    signal output and;
    signal output or;
    signal output xor;
    signal output not1;
    signal output shl;
    signal output shr;

    and  <-- in[0] & in[1];
    or   <-- in[0] | in[1];
    xor  <-- in[0] ^ in[1];
    not1 <-- ~in[0];
    shl  <-- in[0] << in[1];
    shr  <-- in[0] >> in[1];
}

component main = OpsBit();
