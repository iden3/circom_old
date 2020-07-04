
const fastFile = require("fastfile");
const assert = require("assert");

module.exports.buildR1cs = buildR1cs;

async function buildR1cs(ctx, fileName) {

    const fd = await fastFile.createOverride(fileName);


    const type = "r1cs";
    const buff = new Uint8Array(4);
    for (let i=0; i<4; i++) buff[i] = type.charCodeAt(i);
    await fd.write(buff, 0); // Magic "r1cs"

    await fd.writeULE32(1); // Version
    await fd.writeULE32(3); // Number of Sections

    // Write the header
    ///////////
    await fd.writeULE32(1); // Header type
    const pHeaderSize = fd.pos;
    await fd.writeULE64(0); // Temporally set to 0 length


    const n8 = (Math.floor( (ctx.F.bitLength - 1) / 64) +1)*8;
    // Field Def
    await fd.writeULE32(n8); // Temporally set to 0 length
    await writeBigInt(ctx.F.p);

    const NWires =
        ctx.totals[ctx.stONE] +
        ctx.totals[ctx.stOUTPUT] +
        ctx.totals[ctx.stPUBINPUT] +
        ctx.totals[ctx.stPRVINPUT] +
        ctx.totals[ctx.stINTERNAL];

    await fd.writeULE32(NWires);
    await fd.writeULE32(ctx.totals[ctx.stOUTPUT]);
    await fd.writeULE32(ctx.totals[ctx.stPUBINPUT]);
    await fd.writeULE32(ctx.totals[ctx.stPRVINPUT]);
    await fd.writeULE64(ctx.signals.length);
    await fd.writeULE32(ctx.constraints.length);

    const headerSize = fd.pos - pHeaderSize - 8;

    // Write constraints
    ///////////
    await fd.writeULE32(2); // Constraints type
    const pConstraintsSize = fd.pos;
    await fd.writeULE64(0); // Temporally set to 0 length

    for (let i=0; i<ctx.constraints.length; i++) {
        if ((ctx.verbose)&&(i%10000 == 0)) {
            if (ctx.verbose) console.log("writing constraint: ", i);
        }
        await writeConstraint(ctx.constraints[i]);
    }

    const constraintsSize = fd.pos - pConstraintsSize - 8;

    // Write map
    ///////////
    await fd.writeULE32(3); // wires2label type
    const pMapSize = fd.pos;
    await fd.writeULE64(0); // Temporally set to 0 length


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
        await fd.writeULE64(arr[i]);
        if ((ctx.verbose)&&(i%100000)) console.log("writing wire2label map: ", i);
    }

    const mapSize = fd.pos - pMapSize - 8;

    // Write sizes
    await fd.writeULE32(headerSize, pHeaderSize);
    await fd.writeULE32(constraintsSize, pConstraintsSize);
    await fd.writeULE32(mapSize, pMapSize);

    await fd.close();

    async function writeConstraint(c) {
        await writeLC(c.a);
        await writeLC(c.b);
        await writeLC(ctx.lc.neg(c.c));
    }

    async function writeLC(lc) {
        const idxs = Object.keys(lc.coefs);
        await fd.writeULE32(idxs.length);
        for (let s in lc.coefs) {
            let lSignal = ctx.signals[s];

            while (lSignal.e >=0 ) lSignal = ctx.signals[lSignal.e];

            await fd.writeULE32(lSignal.id);
            await writeBigInt(lc.coefs[s]);
        }
    }

    async function writeBigInt(n, pos) {

        const s = n.toString(16);
        const b = Buffer.from(s.padStart(n8*2, "0"), "hex");
        const buff = new Uint8Array(b.length);
        for (let i=0; i<b.length; i++) buff[i] = b[b.length-1-i];

        await fd.write(buff, pos);

    }
}
