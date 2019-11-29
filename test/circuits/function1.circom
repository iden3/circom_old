function func1(a,b) {
    return a+b;
}

template Main() {
    signal input in;
    signal output out;

    out <== func1(in, 3);
}

component main = Main();
