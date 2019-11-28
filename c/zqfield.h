#ifndef ZQFIELD_H
#define ZQFIELD_H

#include "circom.h"

class ZqField {

public:
    BigInt p;
    BigInt one;
    BigInt zero;
    ZqField(PBigInt ap);

    void copy(PBigInt a, PBigInt b);
    void add(PBigInt r,PBigInt a, PBigInt b);
    void lt(PBigInt r, PBigInt a, PBigInt b);
    int isTrue(PBigInt a);
};

#endif // ZQFIELD_H
