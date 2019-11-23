const fnv = require("fnv-plus");

module.exports.ident =ident;

module.exports.extractSizes =extractSizes;
module.exports.csArr = csArr;
module.exports.subArray = subArray;
module.exports.accSizes = accSizes;
module.exports.fnvHash = fnvHash;

function ident(text) {
    let lines = text.split("\n");
    for (let i=0; i<lines.length; i++) {
        if (lines[i]) lines[i] = "    "+lines[i];
    }
    return lines.join("\n");
}

function extractSizes (o) {
    if (! Array.isArray(o)) return [1, 0];
    return [o.length, ...extractSizes(o[0])];
}

// Input [1,2,3]
// Returns " ,1 ,2, 3"
function csArr(_arr) {
    let S = "";
    const arr = _arr || [];
    for (let i=0; i<arr.length; i++) {
        S = " ,"+arr[i];
    }
    return S;
}

function subArray(value, sels) {
    if ((!sels) || (sels.length == 0)) return value;

    return subArray(value[sels[0]], sels.slice(1));
}

function accSizes(_sizes) {
    const sizes = _sizes || [];
    const accSizes = [1, 0];
    for (let i=sizes.length-1; i>=0; i--) {
        accSizes.unshift(accSizes[0]*sizes[i]);
    }
    return accSizes;
}

function fnvHash(str) {
    return fnv.hash(str, 64).hex();
}



