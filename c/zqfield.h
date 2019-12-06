#ifndef ZQFIELD_H
#define ZQFIELD_H

#include "circom.h"

class ZqField {
    mpz_t tmp;

public:
    BigInt p;
    BigInt one;
    BigInt zero;
    ZqField(PBigInt ap);
    ~ZqField();

    void copyn(PBigInt a, PBigInt b, int n);
    void add(PBigInt r,PBigInt a, PBigInt b);
    void mul(PBigInt r,PBigInt a, PBigInt b);
    void lt(PBigInt r, PBigInt a, PBigInt b);
    int isTrue(PBigInt a);
};

#endif // ZQFIELD_H
