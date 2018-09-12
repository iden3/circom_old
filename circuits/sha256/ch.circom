/* Ch

000 0
001 1
010 0
011 1
100 0
101 0
110 1
111 1

out = a&b ^ (!a)&c =>

out = a*(b-c) + c

*/

template Ch(n) {
    signal input a[n];
    signal input b[n];
    signal input c[n];
    signal output out[n];

    for (var k=0; k<n; k++) {
        out[k] <== a[k] * (b[k]-c[k]) + c[k];
    }
}
