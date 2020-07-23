/*
    Copyright 2018 0KIMS association.

    This file is part of circom (Zero Knowledge Circuit Compiler).

    circom is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    circom is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with circom. If not, see <https://www.gnu.org/licenses/>.
*/
/*

    // Number
    ///////////////
    N: a

    {
        t: "N",
        v: bigInt(a)
    }

    // Signal
    ///////////////
    {
        t: "S",
        sIdx: sIdx
    }

    // Linear Convination
    //////////////////
    LC:  c1*s1 + c2*s2 + c3*s3
    {
        t: "LC",
        coefs: {
            s1: bigInt(c1),
            s2: bigInt(c2),
            s3: bigInt(c3)
        }
    }

    // Quadratic Expression
    //////////////////
    QEX: a*b + c WHERE a,b,c are LC
    {
        t: "QEX"
        a: { t: "LC", coefs: {...} },
        b: { t: "LC", coefs: {...} },
        c: { t: "LC", coefs: {...} }
    }

    NQ: Non quadratic expression
    {
        t: "NQ"
    }
 */

/*
+       N       LC      QEX     NQ
N       N       LC      QEX     NQ
LC      LC      LC      QEX     NQ
QEX     QEX     QEX     NQ      NQ
NQ      NQ      NQ      NQ      NQ

*       N       LC      QEX     NQ
N       N       LC      QEX     NQ
LC      LC      QEX     NQ      NQ
QEX     QEX     NQ      NQ      NQ
NQ      NQ      NQ      NQ      NQ
*/

const utils = require("./utils");
const sONE = 0;

class LCAlgebra {
    constructor (aField) {
        const self = this;
        this.F= aField;
        [
            ["idiv",2],
            ["mod",2],
            ["band",2],
            ["bor",2],
            ["bxor",2],
            ["bnot",2],
            ["land",2],
            ["lor",2],
            ["lnot",2],
            ["shl",2],
            ["shr",2],
            ["lt",2, true],
            ["leq",2, true],
            ["eq",2, true],
            ["neq",2, true],
            ["geq",2, true],
            ["gt",2, true]
        ].forEach( (op) => {
            self._genNQOp(op[0], op[1], op[2]);
        });
    }

    _genNQOp(op, nOps, adjustBool) {
        const self=this;
        self[op] = function() {
            const operands = [];
            for (let i=0; i<nOps; i++) {
                if (typeof(arguments[i]) !== "object") throw new Error("Invalid operand type");
                if (arguments[i].t !== "N") return {t: "NQ"};
                operands.push(arguments[i].v);
            }
            return {
                t: "N",
                v: adjustBool ? ( self.F[op](...operands) ? self.F.one: self.F.zero) : self.F[op](...operands)
            };
        };
    }

    _signal2lc(a) {
        const self = this;
        if (a.t == "S") {
            const lc = {
                t: "LC",
                coefs: {}
            };
            lc.coefs[a.sIdx] = self.F.one;
            return lc;
        } else {
            return a;
        }
    }


    _clone(a) {
        const res = {};
        res.t = a.t;
        if (a.t == "N") {
            res.v = a.v;
        } else if (a.t == "S") {
            res.sIdx = a.sIdx;
        } else if (a.t == "LC") {
            res.coefs = {};
            for (let k in a.coefs) {
                res.coefs[k] = a.coefs[k];
            }
        } else if (a.t == "QEX") {
            res.a = this._clone(a.a);
            res.b = this._clone(a.b);
            res.c = this._clone(a.c);
        }
        return res;
    }

    add(_a,_b) {
        const self = this;
        const a = self._signal2lc(_a);
        const b = self._signal2lc(_b);
        if (a.t == "NQ") return a;
        if (b.t == "NQ") return b;
        if (a.t == "N") {
            if (b.t == "N") {
                return add_N_N(a,b);
            } else if (b.t=="LC") {
                return add_LC_N(b,a);
            } else if (b.t=="QEX") {
                return add_QEX_N(b,a);
            } else {
                return { type: "NQ" };
            }
        } else if (a.t=="LC") {
            if (b.t == "N") {
                return add_LC_N(a,b);
            } else if (b.t=="LC") {
                return add_LC_LC(a,b);
            } else if (b.t=="QEX") {
                return add_QEX_LC(b,a);
            } else {
                return { t: "NQ" };
            }
        } else if (a.t=="QEX") {
            if (b.t == "N") {
                return add_QEX_N(a,b);
            } else if (b.t=="LC") {
                return add_QEX_LC(a,b);
            } else if (b.t=="QEX") {
                return { t: "NQ" };
            } else {
                return { t: "NQ" };
            }
        } else {
            return { t: "NQ" };
        }

        function add_N_N(a,b) {
            return {
                t: "N",
                v: self.F.add(a.v, b.v)
            };
        }

        function add_LC_N(a,b) {
            let res = self._clone(a);
            if (self.F.isZero(b.v)) return res;
            if (!utils.isDefined(res.coefs[sONE])) {
                res.coefs[sONE]= b.v;
            } else {
                res.coefs[sONE]= self.F.add(res.coefs[sONE], b.v);
            }
            return res;
        }

        function add_LC_LC(a,b) {
            let res = self._clone(a);
            for (let k in b.coefs) {
                if (!utils.isDefined(res.coefs[k])) {
                    res.coefs[k]=b.coefs[k];
                } else {
                    res.coefs[k]= self.F.add(res.coefs[k], b.coefs[k]);
                }
            }
            return res;
        }

        function add_QEX_N(a,b) {
            let res = self._clone(a);
            res.c = add_LC_N(res.c, b);
            return res;
        }

        function add_QEX_LC(a,b) {
            let res = self._clone(a);
            res.c = add_LC_LC(res.c, b);
            return res;
        }
    }

    mul(_a,_b) {
        const self = this;
        const a = self._signal2lc(_a);
        const b = self._signal2lc(_b);
        if (a.t == "NQ") return a;
        if (b.t == "NQ") return b;
        if (a.t == "N") {
            if (b.t == "N") {
                return mul_N_N(a,b);
            } else if (b.t=="LC") {
                return mul_LC_N(b,a);
            } else if (b.t=="QEX") {
                return mul_QEX_N(b,a);
            } else {
                return { t: "NQ"};
            }
        } else if (a.t=="LC") {
            if (b.t == "N") {
                return mul_LC_N(a,b);
            } else if (b.t=="LC") {
                return mul_LC_LC(a,b);
            } else if (b.t=="QEX") {
                return { t: "NQ" };
            } else {
                return { t: "NQ" };
            }
        } else if (a.t=="QEX") {
            if (b.t == "N") {
                return mul_QEX_N(a,b);
            } else if (b.t=="LC") {
                return { t: "NQ" };
            } else if (b.t=="QEX") {
                return { t: "NQ" };
            } else {
                return { t: "NQ" };
            }
        } else {
            return { t: "NQ" };
        }

        function mul_N_N(a,b) {
            return {
                t: "N",
                v: self.F.mul(a.v, b.v)
            };
        }

        function mul_LC_N(a,b) {
            let res = self._clone(a);
            for (let k in res.coefs) {
                res.coefs[k] = self.F.mul(res.coefs[k], b.v);
            }
            return res;
        }

        function mul_LC_LC(a,b) {
            return {
                t: "QEX",
                a: self._clone(a),
                b: self._clone(b),
                c: { t: "LC", coefs: {}}
            };
        }

        function mul_QEX_N(a,b) {
            return {
                t: "QEX",
                a: mul_LC_N(a.a, b),
                b: self._clone(a.b),
                c: mul_LC_N(a.c, b)
            };
        }
    }

    neg(_a) {
        const a = this._signal2lc(_a);
        let res = this._clone(a);
        if (res.t == "N") {
            res.v = this.F.neg(a.v);
        } else if (res.t == "LC") {
            for (let k in res.coefs) {
                res.coefs[k] = this.F.neg(res.coefs[k]);
            }
        } else if (res.t == "QEX") {
            res.a = this.neg(res.a);
            res.c = this.neg(res.c);
        } else {
            res = {t: "NQ"};
        }
        return res;
    }

    sub(a, b) {
        return this.add(a, this.neg(b));
    }

    div(a, b) {
        if (b.t == "N") {
            if (this.F.isZero(b.v)) throw new Error("Division by zero");
            const inv = {
                t: "N",
                v: this.F.inv(b.v)
            };
            return this.mul(a, inv);
        } else {
            return {t: "NQ"};
        }
    }

    pow(a, b) {
        if (b.t == "N") {
            if (this.F.isZero(b.v)) {
                if (this.isZero(a)) {
                    throw new Error("Zero to the Zero");
                }
                return {
                    t: "N",
                    v: this.F.one
                };
            } else if (this.F.eq(b.v, this.F.one)) {
                return a;
            } else if (this.F.eq(b.v, this.F.two)) {
                return this.mul(a,a);
            } else {
                if (a.t=="N") {
                    return {
                        t: "N",
                        v: this.F.pow(a.v, b.v)
                    };
                } else {
                    return {t: "NQ"};
                }
            }
        } else {
            return {t: "NQ"};
        }
    }

    substitute(where, signal, equivalence) {
        if (equivalence.t != "LC") throw new Error("Equivalence must be a Linear Combination");
        if (where.t == "LC") {
            if (!utils.isDefined(where.coefs[signal]) || this.F.isZero(where.coefs[signal])) return where;
            const res=this._clone(where);
            const coef = res.coefs[signal];
            for (let k in equivalence.coefs) {
                if (k != signal) {
                    const v = this.F.mul( coef, equivalence.coefs[k] );
                    if (!utils.isDefined(res.coefs[k])) {
                        res.coefs[k]=v;
                    } else {
                        res.coefs[k]= this.F.add(res.coefs[k],v);
                    }
                    if (this.F.isZero(res.coefs[k])) delete res.coefs[k];
                }
            }
            delete res.coefs[signal];
            return res;
        } else if (where.t == "QEX") {
            const res = {
                t: "QEX",
                a: this.substitute(where.a, signal, equivalence),
                b: this.substitute(where.b, signal, equivalence),
                c: this.substitute(where.c, signal, equivalence)
            };
            return res;
        } else {
            return where;
        }
    }

    toQEX(a) {
        if (a.t == "N") {
            const res = {
                t: "QEX",
                a: {t: "LC", coefs: {}},
                b: {t: "LC", coefs: {}},
                c: {t: "LC", coefs: {}}
            };
            res.c[sONE] = a.v;
            return res;
        } else if (a.t == "LC") {
            return {
                t: "QEX",
                a: {t: "LC", coefs: {}},
                b: {t: "LC", coefs: {}},
                c: this._clone(a)
            };
        } else if (a.t == "QEX") {
            return this._clone(a);
        } else {
            throw new Error(`Type ${a.t} can not be converted to QEX`);
        }
    }

    isZero(a) {
        if (a.t == "N") {
            return this.F.isZero(a.v);
        } else if (a.t == "LC") {
            for (let k in a.coefs) {
                if (!this.F.isZero(a.coefs[k])) return false;
            }
            return true;
        } else if (a.t == "QEX") {
            return (this.isZero(a.a) || this.isZero(a.b)) && this.isZero(a.c);
        } else {
            return false;
        }
    }

    toString(a, ctx) {
        if (a.t == "N") {
            return a.v.toString();
        } else if (a.t == "LC") {
            let S="";
            for (let k in a.coefs) {
                if (!this.F.isZero(a.coefs[k])) {
                    let c;
                    if (a.coefs[k].greater(this.F.p.divide(2))) {
                        S = S + "-";
                        c = this.F.p.minus(a.coefs[k]);
                    } else {
                        if (S!="") S=S+" + ";
                        c = a.coefs[k];
                    }
                    if (!c.equals(this.F.one)) {
                        S = S + c.toString() + "*";
                    }
                    let sIdx = k;
                    if (ctx) {
                        while (ctx.signals[sIdx].e>=0) sIdx = ctx.signals[sIdx].e;
                    }
                    S =  S + "[" + sIdx + "]";
                }
            }
            if (S=="") return "0"; else return S;
        } else if (a.t == "QEX") {
            return "( "+
                this.toString(a.a, ctx)+" ) * ( "+
                this.toString(a.b, ctx)+" ) + " +
                this.toString(a.c, ctx);
        } else {
            return "NQ";
        }
    }

    evaluate(ctx, n) {
        if (n.t == "N") {
            return n.v;
        } else if (n.t == "SIGNAL") {
            return getSignalValue(ctx, n.sIdx);
        } else if (n.t == "LC") {
            let v= this.F.zero;
            for (let k in n.coefs) {
                const s = getSignalValue(ctx, k);
                if (s === null) return null;
                v = this.F.add(v, this.F.mul( n.coefs[k], s));
            }
            return v;
        } else if (n.type == "QEX") {
            const a = this.evaluate(ctx, n.a);
            if (a === null) return null;
            const b = this.evaluate(ctx, n.b);
            if (b === null) return null;
            const c = this.evaluate(ctx, n.c);
            if (c === null) return null;

            return this.F.add(this.F.mul(a,b), c);
        } else {
            return null;
        }


        function getSignalValue(ctx, sIdx) {
            let s = ctx.signals[sIdx];
            while (s.e>=0) s = ctx.signals[s.e];
            if (utils.isDefined(s.v)) return s.v;
            return null;
        }

    }


    canonize(ctx, a) {
        if (a.t == "LC") {
            const res = this._clone(a);
            for (let k in a.coefs) {
                let s = k;
                while (ctx.signals[s].e>=0) s= ctx.signals[s].e;
                if (utils.isDefined(ctx.signals[s].v)&&(k != sONE)) {
                    const v = this.F.mul(res.coefs[k], ctx.signals[s].v);
                    if (!utils.isDefined(res.coefs[sONE])) {
                        res.coefs[sONE]=v;
                    } else {
                        res.coefs[sONE]= this.F.add(res.coefs[sONE], v);
                    }
                    delete res.coefs[k];
                } else if (s != k) {
                    if (!utils.isDefined(res.coefs[s])) {
                        res.coefs[s]=res.coefs[k];
                    } else {
                        res.coefs[s]= this.F.add(res.coefs[s], res.coefs[k]);
                    }
                    delete res.coefs[k];
                }
            }
            for (let k in res.coefs) {
                if (this.F.isZero(res.coefs[k])) delete res.coefs[k];
            }
            return res;
        } else if (a.t == "QEX") {
            const res = {
                t: "QEX",
                a: this.canonize(ctx, a.a),
                b: this.canonize(ctx, a.b),
                c: this.canonize(ctx, a.c)
            };
            return res;
        } else {
            return a;
        }
    }
}

module.exports = LCAlgebra;






