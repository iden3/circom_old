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

};

