function fnConst(a,b) {
    return a+b;
}

template Main() {
    signal input in;
    signal output out;

    var a = fnConst(1,2);
    out <== in +a;
}

component main = Main();
