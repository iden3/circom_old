
const fs = require("fs");
const assert = require("assert");
const bigInt = require("big-integer");

module.exports.buildR1cs = buildR1cs;
module.exports.loadR1cs = loadR1cs;

async function loadR1cs(fileName, loadConstraints, loadMap) {
    const res = {};
    const fd = await fs.promises.open(fileName, "r");

    const b = Buffer.allocUnsafe(4);
    await fd.read(b, 0, 4, 0);

    if (b.toString() != "r1cs") assert(false, "Invalid File format");

    let p=4;

    let v = await readU32();

    if (v>1) assert(false, "Version not supported");

    const nSections = await readU32();

    let pHeader;
    let pConstraints;
    let headerSize;
    let constraintsSize;
    let pMap;
    let mapSize;
    for (let i=0; i<nSections; i++) {
        let ht = await readU32();
        let hl = await readU32();
        if (ht == 1) {
            if (typeof pHeader != "undefined") assert(false, "File has two headder sections");
            pHeader = p;
            headerSize = hl;
        } else if (ht==2) {
            if (typeof pConstraints != "undefined") assert(false, "File has two constraints sections");
            pConstraints = p;
            constraintsSize = hl;
        } else if (ht==3) {
            pMap = p;
            mapSize = hl;
        }
        p += hl;
    }

    if (typeof pHeader == "undefined") assert(false, "File has two header");

    // Read Header
    p = pHeader;
    const fieldDefSize = await readU32();
    const pFieldDef = p;

    const defType = await readU32();
    if (defType != 1) if (typeof pConstraints != "undefined") assert(false, "Field type not supported");

    res.prime = await readBigInt();

    if ( p != pFieldDef + fieldDefSize) assert("Invalid fieldDef size");

    const bigIntFormat = await readU32();
    if (bigIntFormat != 0) assert(false, "BigInt format not supported");

    const idSize = await readU32();
    if (idSize != 4) assert(false, "idSize not supported. Mus be 4");

    res.nWires = await readU32();
    res.nPubOuts = await readU32();
    res.nPubIns = await readU32();
    res.nPrvIns = await readU32();
    res.nLabels = await readU32();
    res.nConstraints = await readU32();

    if (p != pHeader + headerSize) assert(false, "Invalid header section size");

    if (loadConstraints) {
        // Read Constraints
        p = pConstraints;

        res.constraints = [];
        for (let i=0; i<res.nConstraints; i++) {
            const c = await readConstraint();
            res.constraints.push(c);
        }
        if (p != pConstraints + constraintsSize) assert(false, "Invalid constraints size");
    }

    // Read Labels

    if (loadMap) {
        p = pMap;

        res.map = [];
        for (let i=0; i<res.nLabels; i++) {
            const idx = await readU32();
            res.map.push(idx);
        }
        if (p != pMap + mapSize) assert(false, "Invalid Map size");
    }

    await fd.close();

    return res;

    async function readU32() {
        const b = Buffer.allocUnsafe(4);
        await fd.read(b, 0, 4, p);

        p+=4;

        return b.readInt32LE(0);
    }

    async function readBigInt() {
        const bl = Buffer.allocUnsafe(1);
        await fd.read(bl, 0, 1, p);
        p++;

        const l = bl[0];
        const b = Buffer.allocUnsafe(l);
        await fd.read(b, 0, l, p);
        p += l;

        const arr = Uint8Array.from(b);

        const arrr = new Array(arr.length);
        for (let i=0; i<arr.length; i++) {
            arrr[i] = arr[arr.length-1-i];
        }

        const n = bigInt.fromArray(arrr, 256);

        return n;
    }

    async function readConstraint() {
        const c = {};
        c.a = await readLC();
        c.b = await readLC();
        c.c = await readLC();
        return c;
    }

    async function readLC() {
        const lc= {};
        const nIdx = await readU32();
        for (let i=0; i<nIdx; i++) {
            const idx = await readU32();
            const val = await readBigInt();
            lc[idx] = val;
        }
        return lc;
    }
}

async function buildR1cs(ctx, fileName) {

    const fd = await fs.promises.open(fileName, "w");


    await fd.write("r1cs"); // Magic "r1cs"

    let p = 4;
    await writeU32(1); // Version
    await writeU32(3); // Number of Sections

    // Write the header
    ///////////
    await writeU32(1); // Header type
    const pHeaderSize = p;
    await writeU32(0); // Temporally set to 0 length


    // Field Def
    const pFieldDefSize = p;
    await writeU32(0); // Temporally set to 0 length
    await writeU32(1);
    await writeBigInt(ctx.field.p);
    const fieldDefSize = p - pFieldDefSize - 4;

    await writeU32(0);  // Variable bigInt format
    await writeU32(4);  // Id Size

    const NWires =
        ctx.totals[ctx.stONE] +
        ctx.totals[ctx.stOUTPUT] +
        ctx.totals[ctx.stPUBINPUT] +
        ctx.totals[ctx.stPRVINPUT] +
        ctx.totals[ctx.stINTERNAL];

    await writeU32(NWires);
    await writeU32(ctx.totals[ctx.stOUTPUT]);
    await writeU32(ctx.totals[ctx.stPUBINPUT]);
    await writeU32(ctx.totals[ctx.stPRVINPUT]);
    await writeU32(ctx.signals.length);
    await writeU32(ctx.constraints.length);

    const headerSize = p - pHeaderSize - 4;

    // Write constraints
    ///////////
    await writeU32(2); // Constraints type
    const pConstraintsSize = p;
    await writeU32(0); // Temporally set to 0 length

    for (let i=0; i<ctx.constraints.length; i++) {
        if ((ctx.verbose)&&(i%10000 == 0)) {
            if (ctx.verbose) console.log("writing constraint: ", i);
            await fd.datasync();
        }
        await writeConstraint(ctx.constraints[i]);
    }

    const constraintsSize = p - pConstraintsSize - 4;

    // Write map
    ///////////
    await writeU32(3); // wires2label type
    const pMapSize = p;
    await writeU32(0); // Temporally set to 0 length


    const arr = new Array(NWires);
    for (let i=0; i<ctx.signals.length; i++) {
        const outIdx = ctx.signals[i].id;
        if (ctx.signals[i].e>=0) continue;     // If has an alias, continue..
        assert(typeof outIdx  != "undefined", `Signal ${i} does not have index`);
        if (outIdx>=NWires) continue; // Is a constant or a discarded variable
        if (typeof arr[ctx.signals[i].id] == "undefined") {
            arr[outIdx] = i;
        }
    }
    for (let i=0; i<arr.length; i++) {
        await writeU32(arr[i]);
        if ((ctx.verbose)&&(i%100000)) console.log("writing wire2label map: ", i);
    }

    const mapSize = p - pMapSize -4;

    // Write sizes
    await writeU32(headerSize, pHeaderSize);
    await writeU32(fieldDefSize, pFieldDefSize);
    await writeU32(constraintsSize, pConstraintsSize);
    await writeU32(mapSize, pMapSize);

    await fd.sync();
    await fd.close();

    async function writeU32(v, pos) {
        const b = Buffer.allocUnsafe(4);
        b.writeInt32LE(v);

        await fd.write(b, 0, 4, pos);

        if (typeof(pos) == "undefined") p += 4;
    }

    async function writeConstraint(c) {
        await writeLC(c.a);
        await writeLC(c.b);
        await writeLC(ctx.lc.neg(c.c));
    }

    async function writeLC(lc) {
        const idxs = Object.keys(lc.coefs);
        await writeU32(idxs.length);
        for (let s in lc.coefs) {
            let lSignal = ctx.signals[s];

            while (lSignal.e >=0 ) lSignal = ctx.signals[lSignal.e];

            await writeU32(lSignal.id);
            await writeBigInt(lc.coefs[s]);
        }
    }

    async function writeBigInt(n) {

        const bytes = bigInt(n).toArray(256).value.reverse();

        await fd.write(Buffer.from([bytes.length, ...bytes ]));

        p += bytes.length+1;
    }
}
