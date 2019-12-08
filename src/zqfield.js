const bigInt = require("big-integer");
const assert = require("assert");

module.exports = class ZqField {
    constructor(p) {
        this.p = p;
        this.bitLength = p.bitLength();
        this.mask = bigInt.one.shiftLeft(this.bitLength - 1).minus(bigInt.one);
    }

    add(a, b) {
        let res = a.add(b);
        if (res.geq(this.p)) {
            res = res.minsu(this.p);
        }
        return res;
    }

    sub(a, b) {
        if (a.geq(b)) {
            return a.minus(b);
        } else {
            return this.p.minus(b.minus(a));
        }
    }

    neg(a) {
        if (a.isZero()) return a;
        return this.p.minus(a);
    }

    mul(a, b) {
        return a.mul(b).mod(this.p);
    }

    lt(a, b) {
        return a.lt(b) ? bigInt(1) : bigInt(0);
    }

    eq(a, b) {
        return a.eq(b) ? bigInt(1) : bigInt(0);
    }

    gt(a, b) {
        return a.gt(b) ? bigInt(1) : bigInt(0);
    }

    leq(a, b) {
        return a.leq(b) ? bigInt(1) : bigInt(0);
    }

    geq(a, b) {
        return a.geq(b) ? bigInt(1) : bigInt(0);
    }

    neq(a, b) {
        return a.neq(b) ? bigInt(1) : bigInt(0);
    }

    div(a, b) {
        assert(!b.isZero(), "Division by zero");
        return a.mul(b.modInv(this.p)).mod(this.p);
    }

    idiv(a, b) {
        assert(!b.isZero(), "Division by zero");
        return a.divide(b);
    }

    mod(a, b) {
        return a.mod(b);
    }

    pow(a, b) {
        return a.modPow(b, this.p);
    }

    band(a, b) {
        return a.and(b).and(this.mask);
    }

    bor(a, b) {
        return a.or(b).and(this.mask);
    }

    bxor(a, b) {
        return a.xor(b).and(this.mask);
    }

    bnot(a) {
        return a.xor(this.mask).and(this.mask);
    }

    shl(a, b) {
        if (b.geq(this.bitLength)) return bigInt.zero;
        return a.shiftLeft(b).and(this.mask);
    }

    shr(a, b) {
        if (b.geq(this.bitLength)) return bigInt.zero;
        return a.shiftRight(b).and(this.mask);
    }

    land(a, b) {
        return (a.isZero() || b.isZero) ? bigInt.zero : bigInt.one;
    }

    lor(a, b) {
        return (a.isZero() && b.isZero) ? bigInt.zero : bigInt.one;
    }

    lnot(a) {
        return a.isZero() ? bigInt.one : bigInt.zero;
    }
};

