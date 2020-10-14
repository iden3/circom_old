
const fastFile = require("fastfile");
const assert = require("assert");
const BigArray = require("./bigarray");

module.exports.buildR1cs = buildR1cs;


async function buildR1cs(ctx, fileName) {

    const fd = await fastFile.createOverride(fileName, 1<<24, 1<<22);

    const buffBigInt = new Uint8Array(ctx.F.n8);

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
        await writeConstraint(ctx.constraints[i], i);
    }

    const constraintsSize = fd.pos - pConstraintsSize - 8;

    // Write map
    ///////////
    await fd.writeULE32(3); // wires2label type
    const pMapSize = fd.pos;
    await fd.writeULE64(0); // Temporally set to 0 length


    const arr = new BigArray(NWires);
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
        if ((ctx.verbose)&&(i%100000 == 0)) console.log(`writing wire2label map: ${i}/${arr.length}`);
    }

    const mapSize = fd.pos - pMapSize - 8;

    // Write sizes
    await fd.writeULE64(headerSize, pHeaderSize);
    await fd.writeULE64(constraintsSize, pConstraintsSize);
    await fd.writeULE64(mapSize, pMapSize);

    await fd.close();

    function writeConstraint(c, ctIdx) {
        const n8 = ctx.F.n8;
        const idxA = Object.keys(c.a.coefs);
        const idxB = Object.keys(c.b.coefs);
        const idxC = Object.keys(c.c.coefs);
        const buff = new Uint8Array((idxA.length+idxB.length+idxC.length)*(n8+4) + 12);
        const buffV = new DataView(buff.buffer);
        let o=0;

        buffV.setUint32(o, idxA.length, true); o+=4;
        for (let i=0; i<idxA.length; i++) {
            const coef = idxA[i];
            let lSignal = ctx.signals[coef];
            while (lSignal.e >=0 ) lSignal = ctx.signals[lSignal.e];
            if (lSignal.id >= NWires) throw new Error("Signal Coef A: " + coef + " Constraint: " + ctIdx + " id: " + lSignal.id);
            buffV.setUint32(o, lSignal.id, true); o+=4;
            ctx.F.toRprLE(buff, o, c.a.coefs[coef]); o+=n8;
        }

        buffV.setUint32(o, idxB.length, true); o+=4;
        for (let i=0; i<idxB.length; i++) {
            const coef = idxB[i];
            let lSignal = ctx.signals[coef];
            while (lSignal.e >=0 ) lSignal = ctx.signals[lSignal.e];
            if (lSignal.id >= NWires) throw new Error("Signal Coef B: " + coef + " Constraint: " + ctIdx + " id: " + lSignal.id);
            buffV.setUint32(o, lSignal.id, true); o+=4;
            ctx.F.toRprLE(buff, o, c.b.coefs[coef]); o+=n8;
        }

        buffV.setUint32(o, idxC.length, true); o+=4;
        for (let i=0; i<idxC.length; i++) {
            const coef = idxC[i];
            let lSignal = ctx.signals[coef];
            while (lSignal.e >=0 ) lSignal = ctx.signals[lSignal.e];
            if (lSignal.id >= NWires) throw new Error("Signal Coef C: " + coef + " Constraint: " + ctIdx + " id: " + lSignal.id);
            buffV.setUint32(o, lSignal.id, true); o+=4;
            ctx.F.toRprLE(buff, o, ctx.F.neg(c.c.coefs[coef])); o+=n8;
        }

        return fd.write(buff);
    }

    async function writeBigInt(n, pos) {

        ctx.F.toRprLE(buffBigInt, 0, n);

        await fd.write(buffBigInt, pos);

    }
}
