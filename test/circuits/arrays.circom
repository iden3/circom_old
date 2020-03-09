// arr1


function Add3(arr1, arr2, arr3) {
    var res[3];

    res[0] = arr1;
    res[1] = 0;
    for (var i=0; i<2; i += 1) {
        res[1] = res[1] + arr2[i];
    }

    res[2] = 0;
    for (var i=0; i<2; i++) {
        for (var j=0; j<3; j += 1) {
            res[2] = res[2] + arr3[i][j];
        }
    }

    return res;
}

template Main() {
    signal input in;
    signal output out[3];

    var c[3] = Add3(1, [2,3], [[4,5,6], [7,8,9]]); // [1, 5, 39];
    var d[3] = Add3(in, [in+1, in+2], [[in+1, in+2, in+3], [in+1, in+2, in+3]]);

    out[0] <-- d[0] + c[0];
    out[0] === in+c[0];

    out[1] <-- d[1]+c[1];
    // out[1] === (in+in)+3+c[1];
    out[1] === 2*in+3+c[1];

    out[2] <-- d[2]+c[2];
    // out[2] === (in+in+in+in+in+in)+12+c[2];
    out[2] === 6*in+12+c[2];
}

component main = Main();
