#include "fr.h"
#include <stdio.h>
#include <stdlib.h>
#include <gmp.h>

void Fr_str2element(PFrElement pE, char *s) {
    mpz_t r;
    mpz_init(r);
    mpz_set_str(r, s, 10);
    pE->type = Fr_LONG;
    for (int i=0; i<Fr_N64; i++) pE->longVal[i] = 0;
    mpz_export((void *)pE->longVal, NULL, -1, 8, -1, 0, r);
}

char *Fr_element2str(PFrElement pE) {
    mpz_t r;
    mpz_t q;
    if (pE->type == Fr_SHORT) {
        if (pE->shortVal>=0) {
            char *r = new char[32];
            sprintf(r, "%d", pE->shortVal);
            return r;
        } else {
            mpz_init(q);
            mpz_import(q, Fr_N64, -1, 8, -1, 0, (const void *)Fr_q.longVal);
            mpz_init_set_si(r, pE->shortVal);
            mpz_add(r, r, q);
            mpz_clear(q);
        }
    } else {
        Fr_toNormal(pE);
        mpz_init(r);
        mpz_import(r, Fr_N64, -1, 8, -1, 0, (const void *)pE->longVal);
    }
    char *res = mpz_get_str (0, 10, r);
    mpz_clear(r);
    return res;
}

