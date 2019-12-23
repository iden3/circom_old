include "included.circom";
include "included.circom"; // Include twice is fine. The second one is not included

template Main() {
    signal input in;
    signal output out;

    component t1 = T1();

    var a = F1(3);

    in ==> t1.in;
    t1.out + a ==> out;  /// out <-- in**2/3+3
}

component main = Main();
