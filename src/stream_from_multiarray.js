
const Readable = require("stream").Readable;

module.exports = function streamFromMultiarray(ma) {
    const  rs = Readable();

    let curIndex = getFirstIdx(ma);

    rs._read = function() {
        let res;
        do {
            res = objFromIdx(ma, curIndex);
            curIndex = nextIdx(curIndex);
        } while (res==="");
        rs.push(res);
    };


    return rs;


    function getFirstIdx(ma) {
        if (!Array.isArray(ma)) return [];
        return [0, ...getFirstIdx(ma[0])];
    }

    function nextIdx(idx) {
        if (idx == null) return null;
        if (idx.length == 0) return null;

        const parentIdx = idx.slice(0,-1);

        const itObj = objFromIdx(ma, parentIdx);
        const newLastIdx = idx[idx.length-1]+1;
        if (newLastIdx < itObj.length) {
            const resIdx = idx.slice();
            resIdx[resIdx.length-1] = newLastIdx;
            return [...resIdx, ...getFirstIdx(itObj[newLastIdx])];
        } else {
            return nextIdx(parentIdx);
        }
    }

    function objFromIdx(ma, idx) {
        if (idx == null) return null;
        if (idx.length == 0) return ma;
        if (ma.length == 0) return "";
        return objFromIdx(ma[idx[0]], idx.slice(1));
    }
};
