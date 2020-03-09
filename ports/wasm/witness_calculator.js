/* globals WebAssembly */

const fs = require("fs");
const utils = require("../../src/utils");
const bigInt = require("big-integer");

module.exports.fromFile = async function(file) {


    const code = await fs.promises.readFile(file);

    return await module.exports.fromBuffer(code);
};

module.exports.fromBuffer = async function(code) {

    const memory = new WebAssembly.Memory({initial:20000});
    const wasmModule = await WebAssembly.compile(code);

    const instance = await WebAssembly.instantiate(wasmModule, {
        env: {
            "memory": memory
        },
        runtime: {
            err: function(code, pstr) {
                console.log("ERROR", code, p2str(pstr));
            },
            err1: function(code, pstr, a) {
                console.log("ERROR: ", code, p2str(pstr), a);
            },
            err2: function(code, pstr, a, b) {
                console.log("ERROR: ", code, p2str(pstr), a, b);
            },
            err3: function(code, pstr, a, b, c) {
                console.log("ERROR: ", code, p2str(pstr), a, b, c);
            },
            err4: function(code, pstr, a,b,c,d) {
                console.log("ERROR: ", code, p2str(pstr), a, b, c, d);
            },
        }
    });

    return new WitnessCalculator(memory, instance);

    function p2str(p) {
        return "TODO"+p;
    }
};

class WitnessCalculator {
    constructor(memory, instance) {
        this.memory = memory;
        this.i32 = new Uint32Array(memory.buffer);
        this.instance = instance;

        this.n32 = (this.instance.exports.getFrLen() >> 2) - 2;
        const pRawPrime = this.instance.exports.getPRawPrime();

        this.prime = bigInt(0);
        for (let i=this.n32-1; i>=0; i--) {
            this.prime = this.prime.shiftLeft(32);
            this.prime = this.prime.add(bigInt(this.i32[(pRawPrime >> 2) + i]));
        }

        this.mask32 = bigInt("FFFFFFFF", 16);
        this.NVars = this.instance.exports.getNVars();
        this.n64 = Math.floor((this.prime.bitLength() - 1) / 64)+1;
        this.R = bigInt.one.shiftLeft(this.n64*64);
        this.RInv = this.R.modInv(this.prime);

    }

    async calculateWitness(input) {
        const w = [];
        const old0 = this.i32[0];
        this.instance.exports.init();
        const pSigOffset = this.allocInt();
        const pFr = this.allocFr();
        for (let k in input) {
            const h = utils.fnvHash(k);
            const hMSB = parseInt(h.slice(0,8), 16);
            const hLSB = parseInt(h.slice(8,16), 16);
            this.instance.exports.getSignalOffset32(pSigOffset, 0, hMSB, hLSB);
            const sigOffset = this.getInt(pSigOffset);
            const fArr = utils.flatArray(input[k]);
            for (let i=0; i<fArr.length; i++) {
                this.setFr(pFr, fArr[i]);
                this.instance.exports.setSignal(0, 0, sigOffset + i, pFr);
            }
        }


        for (let i=0; i<this.NVars; i++) {
            const pWitness = this.instance.exports.getPWitness(i);
            w.push(this.getFr(pWitness));
        }

        this.i32[0] = old0;
        return w;
    }

    allocInt() {
        const p = this.i32[0];
        this.i32[0] = p+8;
        return p;
    }

    allocFr() {
        const p = this.i32[0];
        this.i32[0] = p+this.n32*4 + 8;
        return p;
    }

    getInt(p) {
        return this.i32[p>>2];
    }

    setInt(p, v) {
        this.i32[p>>2] = v;
    }

    getFr(p) {
        const idx = (p>>2);

        if (this.i32[idx + 1] & 0x80000000) {
            let res= bigInt(0);
            for (let i=this.n32-1; i>=0; i--) {
                res = res.shiftLeft(32);
                res = res.add(bigInt(this.i32[idx+2+i]));
            }
            if (this.i32[idx + 1] & 0x40000000) {
                return fromMontgomery(res);
            } else {
                return res;
            }

        } else {
            if (this.i32[idx] & 0x80000000) {
                return this.prime.add( bigInt(this.i32[idx]).minus(bigInt(0x100000000)) );
            } else {
                return bigInt(this.i32[idx]);
            }
        }

        function fromMontgomery(n) {
            return n.times(this.RInv).mod(this.prime);
        }

    }


    setFr(p, v) {
        const self = this;
        v = bigInt(v);

        if (v.lt(bigInt("80000000", 16)) ) {
            return setShortPositive(v);
        }
        if (v.geq(self.prime.minus(bigInt("80000000", 16))) ) {
            return setShortNegative(v);
        }
        return setLongNormal(v);

        function setShortPositive(a) {
            self.i32[(p >> 2)] = parseInt(a);
            self.i32[(p >> 2) + 1] = 0;
        }

        function setShortNegative(a) {
            const b = bigInt("80000000", 16 ).add(a.minus(  self.prime.minus(bigInt("80000000", 16 ))));
            self.i32[(p >> 2)] = parseInt(b);
            self.i32[(p >> 2) + 1] = 0;
        }

        function setLongNormal(a) {
            self.i32[(p >> 2)] = 0;
            self.i32[(p >> 2) + 1] = 0x80000000;
            for (let i=0; i<self.n32; i++) {
                self.i32[(p >> 2) + 2 + i] = a.shiftRight(i*32).and(self.mask32);
            }
        }
    }
}



