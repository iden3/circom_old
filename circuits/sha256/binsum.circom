/*

Binary Sum
==========

This component creates a binary sum componet of ops operands and n bits each operand.

e is Number of carries: Depends on the number of operands in the input.

Main Constraint:
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
