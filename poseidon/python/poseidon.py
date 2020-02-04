#!/usr/bin/env python3

import sys
from utils import *

class Params:
    """
    parameters of poseidon hash
    p: SNARK curve subgroup field
    t: field elements per state
    Rf: full rounds
    Rp: partial rounds
    seed: seed needed to compute constants
    e: exponent (x^e bijective S-Box)
    """
    def __init__(self, p, t, Rf, Rp, seed, e):
        self.p = p
        self.t = t
        self.Rf = Rf
        self.Rp = Rp
        self.seed = seed
        self.e = e

def poseidon_sbox(state, i, params):
    """
    S-Box S(.)
    n x S for full rounds Rf
    1 x S for partial rounds Rp
    """
    half_F, Rf = params.Rf // 2, params.Rp
    e, p = params.e, params.p
    if i < half_F or i >= (half_F + params.Rp):
        for j, _ in enumerate(state):
            state[j] = pow(_, e, p)
    else:
        state[0] = pow(state[0], e, p)

def poseidon_mix(state, M, p):
    """
    Linear transformation (Mix Layer)
    MDS matrix multiplication
    """
    return [ sum([M[i][j] * _ for j, _ in enumerate(state)]) % p
             for i in range(len(M)) ]

def poseidon(inputs, params):
    """
    Poseidon hash function
    """
    assert len(inputs) > 0 and len(inputs) < params.t
    state = [0] * params.t
    state[:len(inputs)] = inputs
    constants_C = list(poseidon_constants(params.p, params.seed + b'_constants', params.Rf + params.Rp))
    for i, C_i in enumerate(constants_C):
        state = [_ + C_i for _ in state]  # ARK(.)
        poseidon_sbox(state, i, params) # S(.)
        constants_M = poseidon_matrix(params.p, params.seed + b'_matrix_0000', params.t)
        state = poseidon_mix(state, constants_M, params.p) #M(.)
    return state[0]

def main():
    try:
        params = Params(21888242871839275222246405745257275088548364400416034343698204186575808495617, 6, 8, 57, b'poseidon', 5)
        inputs = [1,2]
        output = poseidon(inputs, params)
        # assert poseidon([1,2], params) == 12242166908188651009877250812424843524687801523336557272219921456462821518061
        print(output)
    except Exception as e:
        sys.exit(e)
    return 0

if __name__ == "__main__":
    main()
