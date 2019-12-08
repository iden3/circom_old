template OpsCmp() {
    signal input in[2];
    signal output lt;
    signal output leq;
    signal output eq;
    signal output neq;
    signal output geq;
    signal output gt;

    lt   <-- in[0] <  in[1];
    leq  <-- in[0] <= in[1];
    eq   <-- in[0] == in[1];
    neq  <-- in[0] != in[1];
    geq  <-- in[0] >= in[1];
    gt   <-- in[0] >  in[1];
}

component main = OpsCmp();
