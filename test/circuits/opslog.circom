template OpsLog() {
    signal input in[2];
    signal output and;
    signal output or;
    signal output not1;

    and  <-- in[0] && in[1];
    or   <-- in[0] || in[1];
    not1 <-- !in[0];
}

component main = OpsLog();
