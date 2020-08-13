const fnv = require("fnv-plus");

module.exports.ident =ident;

module.exports.extractSizes =extractSizes;
module.exports.flatArray = flatArray;
module.exports.csArr = csArr;
module.exports.accSizes = accSizes;
module.exports.fnvHash = fnvHash;
module.exports.sameSizes = sameSizes;
module.exports.isDefined = isDefined;
module.exports.accSizes2Str = accSizes2Str;
module.exports.setUint64 = setUint64;

function ident(text) {
    if (typeof text === "string") {
        let lines = text.split("\n");
        for (let i=0; i<lines.length; i++) {
            if (lines[i]) lines[i] = "    "+lines[i];
        }
        return lines.join("\n");
    } else if (Array.isArray(text)) {
        for (let i=0; i<text.length; i++ ) {
            text[i] = ident(text[i]);
        }
        return text;
    }
}

function extractSizes (o) {
    if (! Array.isArray(o)) return [];
    return [o.length, ...extractSizes(o[0])];
}

function flatArray(a) {
    var res = [];
    fillArray(res, a);
    return res;

    function fillArray(res, a) {
        if (Array.isArray(a)) {
            for (let i=0; i<a.length; i++) {
                fillArray(res, a[i]);
            }
        } else {
            res.push(a);
        }
    }
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

function sameSizes(s1, s2) {
    if (!Array.isArray(s1)) return false;
    if (!Array.isArray(s2)) return false;
    if (s1.length != s2.length) return false;
    for (let i=0; i<s1.length; i++) {
        if (s1[i] != s2[i]) return false;
    }
    return true;
}

function isDefined(v) {
    return ((typeof(v) != "undefined")&&(v != null));
}

function accSizes2Str(sizes) {
    if (sizes.length == 2) return "";
    return `[${sizes[0]/sizes[1]}]`+accSizes2Str(sizes.slice(1));
}

function setUint64(buffV, o, n) {
    const sLSB = n >>> 0;
    const sMSB = (n - sLSB) / 0x100000000;
    buffV.setUint32(o, sLSB , true);
    buffV.setUint32(o+4, sMSB , true);
}





