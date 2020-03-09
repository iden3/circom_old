const tester = require("../ports/c/buildasm/buildzqfieldtester.js");

const ZqField = require("fflib").ZqField;

const bigInt = require("big-integer");

const bn128q = new bigInt("21888242871839275222246405745257275088696311157297823662689037894645226208583");
const bn128r = new bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const secp256k1q = new bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16);
const secp256k1r = new bigInt("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16);
const mnt6753q = new bigInt("41898490967918953402344214791240637128170709919953949071783502921025352812571106773058893763790338921418070971888458477323173057491593855069696241854796396165721416325350064441470418137846398469611935719059908164220784476160001");
const mnt6753r = new bigInt("41898490967918953402344214791240637128170709919953949071783502921025352812571106773058893763790338921418070971888253786114353726529584385201591605722013126468931404347949840543007986327743462853720628051692141265303114721689601");

describe("field asm test", function () {
    this.timeout(1000000000);
    it("bn128r add", async () => {
        const tv = buildTestVector2(bn128r, "add");
        await tester(bn128r, tv);
    });
    it("secp256k1q add", async () => {
        const tv = buildTestVector2(secp256k1q, "add");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q add", async () => {
        const tv = buildTestVector2(mnt6753q, "add");
        await tester(mnt6753q, tv);
    });
    it("bn128r sub", async () => {
        const tv = buildTestVector2(bn128r, "sub");
        await tester(bn128r, tv);
    });
    it("secp256k1q sub", async () => {
        const tv = buildTestVector2(secp256k1q, "sub");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q sub", async () => {
        const tv = buildTestVector2(mnt6753q, "sub");
        await tester(mnt6753q, tv);
    });

    it("bn128r neg", async () => {
        const tv = buildTestVector1(bn128r, "neg");
        await tester(bn128r, tv);
    });
    it("secp256k1q neg", async () => {
        const tv = buildTestVector1(secp256k1q, "neg");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q neg", async () => {
        const tv = buildTestVector1(mnt6753q, "neg");
        await tester(mnt6753q, tv);
    });
    it("bn128r mul", async () => {
        const tv = buildTestVector2(bn128r, "mul");
        await tester(bn128r, tv);
    });
    it("secp256k1q mul", async () => {
        const tv = buildTestVector2(secp256k1q, "mul");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q mul", async () => {
        const tv = buildTestVector2(mnt6753q, "mul");
        await tester(mnt6753q, tv);
    });
    it("bn128r binary and", async () => {
        const tv = buildTestVector2(bn128r, "band");
        await tester(bn128r, tv);
    });
    it("secp256k1q binary and", async () => {
        const tv = buildTestVector2(secp256k1q, "band");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q binary and", async () => {
        const tv = buildTestVector2(mnt6753q, "band");
        await tester(mnt6753q, tv);
    });
    it("bn128r binary or", async () => {
        const tv = buildTestVector2(bn128r, "bor");
        await tester(bn128r, tv);
    });
    it("secp256k1q binary or", async () => {
        const tv = buildTestVector2(secp256k1q, "bor");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q binary or", async () => {
        const tv = buildTestVector2(mnt6753q, "bor");
        await tester(mnt6753q, tv);
    });
    it("bn128r binary xor", async () => {
        const tv = buildTestVector2(bn128r, "bxor");
        await tester(bn128r, tv);
    });
    it("secp256k1q binary xor", async () => {
        const tv = buildTestVector2(secp256k1q, "bxor");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q binary xor", async () => {
        const tv = buildTestVector2(mnt6753q, "bxor");
        await tester(mnt6753q, tv);
    });
    it("bn128r binary not", async () => {
        const tv = buildTestVector1(bn128r, "bnot");
        await tester(bn128r, tv);
    });
    it("secp256k1q binary not", async () => {
        const tv = buildTestVector1(secp256k1q, "bnot");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q binary not", async () => {
        const tv = buildTestVector1(mnt6753q, "bnot");
        await tester(mnt6753q, tv);
    });
    it("bn128r eq", async () => {
        const tv = buildTestVector2(bn128r, "eq");
        await tester(bn128r, tv);
    });
    it("secp256k1q eq", async () => {
        const tv = buildTestVector2(secp256k1q, "eq");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q eq", async () => {
        const tv = buildTestVector2(mnt6753q, "eq");
        await tester(mnt6753q, tv);
    });
    it("bn128r neq", async () => {
        const tv = buildTestVector2(bn128r, "neq");
        await tester(bn128r, tv);
    });
    it("secp256k1q neq", async () => {
        const tv = buildTestVector2(secp256k1q, "neq");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q neq", async () => {
        const tv = buildTestVector2(mnt6753q, "neq");
        await tester(mnt6753q, tv);
    });
    it("bn128r lt", async () => {
        const tv = buildTestVector2(bn128r, "lt");
        await tester(bn128r, tv);
    });
    it("secp256k1q lt", async () => {
        const tv = buildTestVector2(secp256k1q, "lt");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q lt", async () => {
        const tv = buildTestVector2(mnt6753q, "lt");
        await tester(mnt6753q, tv);
    });
    it("bn128r gt", async () => {
        const tv = buildTestVector2(bn128r, "gt");
        await tester(bn128r, tv);
    });
    it("secp256k1q gt", async () => {
        const tv = buildTestVector2(secp256k1q, "gt");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q gt", async () => {
        const tv = buildTestVector2(mnt6753q, "gt");
        await tester(mnt6753q, tv);
    });
    it("bn128r leq", async () => {
        const tv = buildTestVector2(bn128r, "leq");
        await tester(bn128r, tv);
    });
    it("secp256k1q leq", async () => {
        const tv = buildTestVector2(secp256k1q, "leq");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q leq", async () => {
        const tv = buildTestVector2(mnt6753q, "leq");
        await tester(mnt6753q, tv);
    });
    it("bn128r geq", async () => {
        const tv = buildTestVector2(bn128r, "geq");
        await tester(bn128r, tv);
    });
    it("secp256k1q geq", async () => {
        const tv = buildTestVector2(secp256k1q, "geq");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q geq", async () => {
        const tv = buildTestVector2(mnt6753q, "geq");
        await tester(mnt6753q, tv);
    });
    it("bn128r logical and", async () => {
        const tv = buildTestVector2(bn128r, "land");
        await tester(bn128r, tv);
    });
    it("secp256k1q logical and", async () => {
        const tv = buildTestVector2(secp256k1q, "land");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q logical and", async () => {
        const tv = buildTestVector2(mnt6753q, "land");
        await tester(mnt6753q, tv);
    });
    it("bn128r logical or", async () => {
        const tv = buildTestVector2(bn128r, "lor");
        await tester(bn128r, tv);
    });
    it("secp256k1q logical or", async () => {
        const tv = buildTestVector2(secp256k1q, "lor");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q logical or", async () => {
        const tv = buildTestVector2(mnt6753q, "lor");
        await tester(mnt6753q, tv);
    });
    it("bn128r logical not", async () => {
        const tv = buildTestVector1(bn128r, "lnot");
        await tester(bn128r, tv);
    });
    it("secp256k1q logical not", async () => {
        const tv = buildTestVector1(secp256k1q, "lnot");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q logical not", async () => {
        const tv = buildTestVector1(mnt6753q, "lnot");
        await tester(mnt6753q, tv);
    });
    it("bn128r idiv", async () => {
        const tv = buildTestVector2(bn128r, "idiv");
        await tester(bn128r, tv);
    });
    it("secp256k1q idiv", async () => {
        const tv = buildTestVector2(secp256k1q, "idiv");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q idiv", async () => {
        const tv = buildTestVector2(mnt6753q, "idiv");
        await tester(mnt6753q, tv);
    });
    it("bn128r inv", async () => {
        const tv = buildTestVector1(bn128r, "inv");
        await tester(bn128r, tv);
    });
    it("secp256k1q inv", async () => {
        const tv = buildTestVector1(secp256k1q, "inv");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q inv", async () => {
        const tv = buildTestVector1(mnt6753q, "inv");
        await tester(mnt6753q, tv);
    });
    it("bn128r div", async () => {
        const tv = buildTestVector2(bn128r, "div");
        await tester(bn128r, tv);
    });
    it("secp256k1q div", async () => {
        const tv = buildTestVector2(secp256k1q, "div");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q div", async () => {
        const tv = buildTestVector2(mnt6753q, "div");
        await tester(mnt6753q, tv);
    });
    it("bn128r square", async () => {
        const tv = buildTestVector1(bn128r, "square");
        await tester(bn128r, tv);
    });
    it("secp256k1q square", async () => {
        const tv = buildTestVector1(secp256k1q, "square");
        await tester(secp256k1q, tv);
    });
    it("mnt6753q square", async () => {
        const tv = buildTestVector1(mnt6753q, "square");
        await tester(mnt6753q, tv);
    });
});

function buildTestVector2(p, op) {
    const F = new ZqField(p);
    const tv = [];
    const nums = getCriticalNumbers(p, 2);

    const excludeZero = ["div", "mod", "idiv"].indexOf(op) >= 0;

    for (let i=0; i<nums.length; i++) {
        for (let j=0; j<nums.length; j++) {
            if ((excludeZero)&&(nums[j][0].isZero())) continue;
            tv.push([
                [nums[i][1], nums[j][1], op],
                F[op](nums[i][0], nums[j][0])
            ]);
        }
    }

    return tv;
}

function buildTestVector1(p, op) {
    const F = new ZqField(p);
    const tv = [];
    const nums = getCriticalNumbers(p, 2);

    const excludeZero = ["inv"].indexOf(op) >= 0;

    for (let i=0; i<nums.length; i++) {
        if ((excludeZero)&&(nums[i][0].isZero())) continue;
        tv.push([
            [nums[i][1], op],
            F[op](nums[i][0])
        ]);
    }

    return tv;
}

function getCriticalNumbers(p, lim) {
    const numbers = [];

    addFrontier(0);
    addFrontier(bigInt.one.shiftLeft(31));
    addFrontier(p.minus(bigInt.one.shiftLeft(31)));
    addFrontier(bigInt.one.shiftLeft(32));
    addFrontier(p.minus(bigInt.one.shiftLeft(32)));
    addFrontier(bigInt.one.shiftLeft(63));
    addFrontier(p.minus(bigInt.one.shiftLeft(63)));
    addFrontier(bigInt.one.shiftLeft(64));
    addFrontier(p.minus(bigInt.one.shiftLeft(64)));
    addFrontier(bigInt.one.shiftLeft(p.bitLength()-1));
    addFrontier(p.shiftRight(1));

    function addFrontier(f) {
        for (let i=-lim; i<=lim; i++) {
            let n = bigInt(f).add(bigInt(i));
            n = n.mod(p);
            if (n.isNegative()) n = p.add(n);
            addNumber(n);
        }
    }

    return numbers;

    function addNumber(n) {
        if (n.lt(bigInt("80000000", 16)) ) {
            addShortPositive(n);
            addShortMontgomeryPositive(n);
        }
        if (n.geq(p.minus(bigInt("80000000", 16))) ) {
            addShortNegative(n);
            addShortMontgomeryNegative(n);
        }
        addLongNormal(n);
        addLongMontgomery(n);

        function addShortPositive(a) {
            numbers.push([a, "0x"+a.toString(16)]);
        }

        function addShortMontgomeryPositive(a) {
            let S = "0x" + bigInt("40", 16).shiftLeft(56).add(a).toString(16);
            S = S + "," + getLongString(toMontgomery(a));
            numbers.push([a, S]);
        }

        function addShortNegative(a) {
            const b = bigInt("80000000", 16 ).add(a.minus(  p.minus(bigInt("80000000", 16 ))));
            numbers.push([a, "0x"+b.toString(16)]);
        }

        function addShortMontgomeryNegative(a) {
            const b = bigInt("80000000", 16 ).add(a.minus(  p.minus(bigInt("80000000", 16 ))));
            let S = "0x" + bigInt("40", 16).shiftLeft(56).add(b).toString(16);
            S = S + "," + getLongString(toMontgomery(a));
            numbers.push([a, S]);
        }

        function addLongNormal(a) {
            let S = "0x" + bigInt("80", 16).shiftLeft(56).toString(16);
            S = S + "," + getLongString(a);
            numbers.push([a, S]);
        }


        function addLongMontgomery(a) {

            let S = "0x" + bigInt("C0", 16).shiftLeft(56).toString(16);
            S = S + "," + getLongString(toMontgomery(a));
            numbers.push([a, S]);
        }

        function getLongString(a) {
            if (a.isZero()) {
                return "0x0";
            }
            let r = a;
            let S = "";
            while (!r.isZero()) {
                if (S!= "") S = S+",";
                S += "0x" + r.and(bigInt("FFFFFFFFFFFFFFFF", 16)).toString(16);
                r = r.shiftRight(64);
            }
            return S;
        }

        function toMontgomery(a) {
            const n64 = Math.floor((p.bitLength() - 1) / 64)+1;
            const R = bigInt.one.shiftLeft(n64*64);
            return a.times(R).mod(p);
        }

    }
}

