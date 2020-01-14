#include "stdio.h"
#include "fr.h"

int main() {

    FrElement a = { 0, Fr_LONGMONTGOMERY, {1,1,1,1}};
    FrElement b = { 0, Fr_LONGMONTGOMERY, {2,2,2,2}};

/*
    FrElement a={0x43e1f593f0000000ULL,0x2833e84879b97091ULL,0xb85045b68181585dULL,0x30644e72e131a029ULL};
    FrElement b = {3,0,0,0};
*/
    FrElement c;

//    Fr_add(&(c[0]), a, a);
//    Fr_add(&(c[0]), c, b);

    for (int i=0; i<1000000000; i++) {
        Fr_mul(&c, &a, &b);
    }

    Fr_mul(&c,&a, &b);
    printf("%llu, %llu, %llu, %llu\n", c.longVal[0], c.longVal[1], c.longVal[2], c.longVal[3]);
}
