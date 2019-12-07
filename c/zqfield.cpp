#include "zqfield.h"

ZqField::ZqField(PBigInt ap) {
    mpz_init2(tmp, 1024);
    mpz_init_set(p, *ap);
    mpz_init_set_ui(zero, 0);
    mpz_init_set_ui(one, 1);
}

ZqField::~ZqField() {
    mpz_clear(tmp);
    mpz_clear(p);
    mpz_clear(zero);
    mpz_clear(one);
}

void ZqField::add(PBigInt r, PBigInt a, PBigInt b) {
    mpz_add(*r,*a,*b);
    if (mpz_cmp(*r, p) >= 0) {
        mpz_sub(*r, *r, p);
    }
}

void ZqField::sub(PBigInt r, PBigInt a, PBigInt b) {
    if (mpz_cmp(*a, *b) >= 0) {
        mpz_sub(*r, *a, *b);
    } else {
        mpz_sub(tmp, *b, *a);
        mpz_sub(*r, p, tmp);
    }
}

void ZqField::mul(PBigInt r, PBigInt a, PBigInt b) {
    mpz_mul(tmp,*a,*b);
    mpz_fdiv_r(*r, tmp, p);
}

void ZqField::div(PBigInt r, PBigInt a, PBigInt b) {
    mpz_invert(tmp, *b, p);
    mpz_mul(tmp,*a,tmp);
    mpz_fdiv_r(*r, tmp, p);
}

void ZqField::idiv(PBigInt r, PBigInt a, PBigInt b) {
    mpz_fdiv_q(*r, *a, *b);
}

void ZqField::mod(PBigInt r, PBigInt a, PBigInt b) {
    mpz_fdiv_r(*r, *a, *b);
}

void ZqField::lt(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c<0) {
        mpz_set(*r, one);
    } else {
        mpz_set(*r, zero);
    }
}

void ZqField::eq(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c==0) {
        mpz_set(*r, one);
    } else {
        mpz_set(*r, zero);
    }
}

void ZqField::gt(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c>0) {
        mpz_set(*r, one);
    } else {
        mpz_set(*r, zero);
    }
}

void ZqField::leq(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c<=0) {
        mpz_set(*r, one);
    } else {
        mpz_set(*r, zero);
    }
}

void ZqField::geq(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c>=0) {
        mpz_set(*r, one);
    } else {
        mpz_set(*r, zero);
    }
}

void ZqField::neq(PBigInt r, PBigInt a, PBigInt b) {
    int c = mpz_cmp(*a, *b);
    if (c!=0) {
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
