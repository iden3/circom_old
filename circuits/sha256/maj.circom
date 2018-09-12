/* Maj function for sha256

out = a&b ^ a&c ^ b&c  =>

out = a*b   +  a*c  +  b*c  -  2*a*b*c  =>

out = a*( b + c - 2*b*c ) + b*c =>

mid = b*c
out = a*( b + c - 2*mid ) + mid

*/

template Maj(n) {
    signal input a[n];
    signal input b[n];
    signal input c[n];
    signal output out[n];
    signal mid[n];

    for (var k=0; k<n; k++) {
        mid[k] <== b[k]*c[k];
        out[k] <== a[k] * (b[k]+c[k]-2*mid[k]) + mid[k];
    }
}
