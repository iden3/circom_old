
const Readable = require("stream").Readable;

module.exports = function streamFromArrayBin(a) {
    const  rs = Readable();

    let curIndex = 0;

    rs._read = function(size) {
        if (curIndex >= a.length) {
            rs.push(null);
            return;
        }
        const start = curIndex;
        const end = Math.min(a.length, curIndex+size);
        curIndex = end;
        rs.push(a.slice(start, end));
    };

    return rs;
};
