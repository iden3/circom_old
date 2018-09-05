# circon

Circon is a language designed to write aritmetic circuits to be used in zero knowlage proof.

Concretly it is designed to work in convination with [zksnarks javascript library](https://github.com/iden3/zksnark)


## Usage

### First circuit

Create a circuit. This is a simple example for a NAND door:

```
template NAND() {
    signal private input a;
    signal input b;
    signal output out;

    out <== 1 - a*b;
    a*(a-1) === 0;
    b*(b-1) === 0;
}

component main = NAND();
```

The language is mainly a javascript/c syntax but with extra 5 operators in order to define the constrains:

`<==` , `==>`  This operator is used to connect signals. This operator also implies a constrain.

As you can see in the example above, `out` is assigned a value and a constrain is also generated.  The assigned value must be of the form a*b+c where a,b and c are linear convinations of the signals.

`<--` , `-->` This operators assign values to a signals but does not generate any constrain. This allow to assign any value to a signal including extrange operations like shifhts, modules, divisiones, etc.  Generally this operator goes together wit a `===` operator in order to force the constrain.

`===` This operator defines a constrain. The constrain must be simplificable to the form a*b+c=0 where a,b and c are linear convinations.

In the example above, we force the two inputs to be binary by adding the constrain `a*(a-1)===0` and `b*(b-1) === 0`

### Compile the circui

To compile the circuit, you first install the compiler:

```
npm install -g circom
````

Then just run

```
circom -s mycircuit.circom -o mycircuit.json
```

The resulting output ( `mycircuit.json` ) can be used with the [zksnarks javascript library](https://github.com/iden3/zksnark)

In that library you will be able to do the trusted setup, create the proofs and verify them.

### Number to binary

In many situations, we have to convert an input to it's binary representation.  We would write a circuit this way:

```
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * 2**i;
    }

    lc1 === in;
}

component main = Num2Bits(8)
```

The first thing we observe in this example is that templates can have parameters. This allows to create libraries with templates that generate circuits in a parametric ways. In this case, we are using a circuit with an output of 8 signals, but you can instantiate easily any circuit with any number of outputs.

Then we define the inputs and the outputs. We see that we can work with arrays. The program allows multidimension arrays for signals and variables.

Then we need to assign the values to the different signals. In this case, we assign the value without the constrain by using the shift and & operators:
`out[i] <-- (in >> i) & 1;`

But we need to define also the constrains.  In this case there is a big constrain of the form:

```
in === out[0]*2**0  + out[1]*2**1 + out[2]*2**2  ....
```

We do this by using a variable `lc1` and adding each signal multiplied by his coefficient.

This variable does not hold a value in compilation time, but it holds a linear combination.  and it is used in the last constrain:

```
lc1 === in;
```

Finally we also have to force each output to be binary.

We do this by adding this constrain for each output:

```
out[i] * (out[i] -1 ) === 0;
```

### A Binary adder.
Lets now create a 32bits adder.

The strategy will be to first convert the number to binary, do the addition in the binary space and then finally convert it back to a number.

We could do it directly by adding a simple constrain where out === in1 + in2, but if we do this the operation will not be module 2**32 but `r` where r is the range of the elliptic curve. In the case of regular zkSnarks typically is some prime number close to 2**253

With this example we also demostrate the normal patter of binarize a number, work in binary (reguular electronic circuit), and then convert the result back to a number.

To do this, we will create 3 files named: `bitify.circom` `binsum.circom` and `sum_test.circom`

bitify.circom:
```
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * 2**i;
    }

    lc1 === in;

}

template Bits2Num(n) {
    signal input in[n];
    signal output out;
    var lc1=0;

    for (var i = 0; i<n; i++) {
        lc1 += in[i] * 2**i;
    }

    lc1 ==> out;
}

```

binsum.circom
```
/*

Binary Sum
==========

This component creates a binary sum componet of ops operands and n bits each operand.

e is Number of carries: Depends on the number of operands in the input.

Main Constrain:
   in[0][0]     * 2^0  +  in[0][1]     * 2^1  + ..... + in[0][n-1]    * 2^(n-1)  +
 + in[1][0]     * 2^0  +  in[1][1]     * 2^1  + ..... + in[1][n-1]    * 2^(n-1)  +
 + ..
 + in[ops-1][0] * 2^0  +  in[ops-1][1] * 2^1  + ..... + in[ops-1][n-1] * 2^(n-1)  +
 ===
   out[0] * 2^0  + out[1] * 2^1 +   + out[n+e-1] *2(n+e-1)

To waranty binary outputs:

    out[0]     * (out[0] - 1) === 0
    out[1]     * (out[0] - 1) === 0
    .
    .
    .
    out[n+e-1] * (out[n+e-1] - 1) == 0

 */


/*
    This function calculates the number of extra bits in the output to do the full sum.
 */

function nbits(a) {
    var n = 1;
    var r = 0;
    while (n-1<a) {
        r++;
        n *= 2;
    }
    return r;
}


template BinSum(n, ops) {
    var nout = nbits((2**n -1)*ops);
    signal input in[ops][n];
    signal output out[nout];

    var lin = 0;
    var lout = 0;

    var k;
    var j;

    for (k=0; k<n; k++) {
        for (j=0; j<ops; j++) {
            lin += in[j][k] * 2**k;
        }
    }

    for (k=0; k<nout; k++) {
        out[k] <-- (lin >> k) & 1;

        // Ensure out is binary
        out[k] * (out[k] - 1) === 0;

        lout += out[k] * 2**k;
    }

    // Ensure the sum;

    lin === lout;
}
```

sumtest.circom:
```
include "bitify.circom"
include "binsum.circom"

template Adder() {
    signal private input a;
    signal input b;
    signal output out;

    component n2ba = Num2Bits(32);
    component n2bb = Num2Bits(32);
    component sum = BinSum(32,2);
    component b2n = Bits2Num(32);

    n2ba.in <== a;
    n2bb.in <== b;

    for (var i=0; i<32; i++) {
        sum.in[0][i] <== n2ba.out[i];
        sum.in[1][i] <== n2bb.out[i];
        b2n.in[i] <== sum.out[i];
    }

    out <== b2n.out;
}

component main = Adder();
```

In this example we can see how we can design a top dow circuit with many subcircuits and how we connect them together.

We also see the option to create auxilary functions to do specific computations.


## License

circon is part of the iden3 project copyright 2018 0kims association and published with GPL-3 license, please check the COPYING file for more details.



