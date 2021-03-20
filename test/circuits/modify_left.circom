
template ModifyLeft() {
    signal output out[2];

    var i = 0;
    out[i++] <== 3;
    out[i++] <== 4;
}

component main = ModifyLeft();
