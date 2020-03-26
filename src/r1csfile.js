
const fs = require("fs");
const assert = require("assert");
const bigInt = require("big-integer");

module.exports.buildR1cs = buildR1cs;

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
    await writeU64(0); // Temporally set to 0 length


    const n8 = (Math.floor( (ctx.field.p.bitLength() - 1) / 64) +1)*8;
    // Field Def
    await writeU32(n8); // Temporally set to 0 length
    await writeBigInt(ctx.field.p);

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
    await writeU64(ctx.signals.length);
    await writeU32(ctx.constraints.length);

    const headerSize = p - pHeaderSize - 8;

    // Write constraints
    ///////////
    await writeU32(2); // Constraints type
    const pConstraintsSize = p;
    await writeU64(0); // Temporally set to 0 length

    for (let i=0; i<ctx.constraints.length; i++) {
        if ((ctx.verbose)&&(i%10000 == 0)) {
            if (ctx.verbose) console.log("writing constraint: ", i);
            await fd.datasync();
        }
        await writeConstraint(ctx.constraints[i]);
    }

    const constraintsSize = p - pConstraintsSize - 8;

    // Write map
    ///////////
    await writeU32(3); // wires2label type
    const pMapSize = p;
    await writeU64(0); // Temporally set to 0 length


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
        await writeU64(arr[i]);
        if ((ctx.verbose)&&(i%100000)) console.log("writing wire2label map: ", i);
    }

    const mapSize = p - pMapSize - 8;

    // Write sizes
    await writeU32(headerSize, pHeaderSize);
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

    async function writeU64(v, pos) {
        const b = Buffer.allocUnsafe(8);
        b.writeBigUInt64LE(BigInt(v));

        await fd.write(b, 0, 8, pos);

        if (typeof(pos) == "undefined") p += 8;
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

    async function writeBigInt(n, pos) {
        const b = Buffer.allocUnsafe(n8);

        const dwords = bigInt(n).toArray(0x100000000).value;

        for (let i=0; i<dwords.length; i++) {
            b.writeUInt32LE(dwords[dwords.length-1-i], i*4, 4 );
        }
        b.fill(0, dwords.length*4);

        await fd.write(b, 0, fs, pos);

        if (typeof(pos) == "undefined") p += n8;
    }
}
