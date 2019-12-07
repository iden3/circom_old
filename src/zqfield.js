const bigInt = require("big-integer");

module.exports = class ZqField {
    constructor(p) {
        this.p = p;
    }

    add(a, b) {
        return a.add(b).mod(this.p);
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

};

