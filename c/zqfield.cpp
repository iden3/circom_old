#include "zqfield.h"

ZqField::ZqField(PBigInt ap) {
    mpz_init_set(p, *ap);
    mpz_init_set_ui(zero, 0);
    mpz_init_set_ui(one, 1);
}

void ZqField::add(PBigInt r, PBigInt a, PBigInt b) {
    mpz_add(*r,*a,*b);
    mpz_fdiv_r(*r, *r, p);
}

void ZqField::lt(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c<0) {
        mpz_set(*r, one);
    } else {
        mpz_set(*r, zero);
    }
}

int ZqField::isTrue(PBigInt a) {
    return mpz_sgn(*a);
}

void ZqField::copyn(PBigInt a, PBigInt b, int n) {
    for (int i=0;i<n; i++) mpz_set(a[i], b[i]);
}
