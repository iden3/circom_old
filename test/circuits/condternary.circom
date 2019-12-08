template CondTernary() {
    signal input in;
    signal output out;

    var a = 3;
    var b = a==3 ? 1 : 2;      // b is 1
    var c = a!=3 ? 10 : 20;      // c is 20
    var d = b+c;   // d is 21


    out <-- ((in & 1) != 1) ? in + d : in;  // Add 21 if in is pair

}

component main = CondTernary()
