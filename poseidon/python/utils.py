#!/usr/bin/env python3
from pyblake2 import blake2b

def H(arg):
    """
    Blake2b hash 
    needed to generate ARK(.) constants and M(.) matrix
    """
    if isinstance(arg, int):
        arg = arg.to_bytes(32, 'little')
    hashed = blake2b(data=arg, digest_size=32).digest()
    return int.from_bytes(hashed, 'little')

def poseidon_constants(p, seed, n):
    """
    Constants for ARK(.)
    Blake2b hashes of the seed
    """
    assert isinstance(n, int)
    for _ in range(n):
        seed = H(seed)
        yield seed % p

def poseidon_matrix(p, seed, t):
    """
    MDS matrix for M(.)
    Cauchy matrix with Blake2b hashes of the seed as coefficients
    """
    c = list(poseidon_constants(p, seed, t * 2))
    return [[pow((c[i] - c[t+j]) % p, p - 2, p) for j in range(t)]
            for i in range(t)]

