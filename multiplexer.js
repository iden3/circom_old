const bigInt = require("big-integer");
const __P__ = new bigInt("21888242871839275222246405745257275088696311157297823662689037894645226208583");
const __MASK__ = new bigInt(2).pow(253).minus(1);
const circuit = {};
module.exports = circuit;

circuit.signals={
 "one": {
  "fullName": "one",
  "value": "1",
  "equivalence": "",
  "direction": "",
  "id": 0
 },
 "main.inp[0][0]": {
  "fullName": "main.inp[0][0]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][0]"
  ],
  "id": 1
 },
 "main.inp[0][1]": {
  "fullName": "main.inp[0][1]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][1]"
  ],
  "id": 2
 },
 "main.inp[0][2]": {
  "fullName": "main.inp[0][2]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][2]"
  ],
  "id": 3
 },
 "main.inp[0][3]": {
  "fullName": "main.inp[0][3]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][3]"
  ],
  "id": 4
 },
 "main.inp[0][4]": {
  "fullName": "main.inp[0][4]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][4]"
  ],
  "id": 5
 },
 "main.inp[0][5]": {
  "fullName": "main.inp[0][5]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][5]"
  ],
  "id": 6
 },
 "main.inp[0][6]": {
  "fullName": "main.inp[0][6]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][6]"
  ],
  "id": 7
 },
 "main.inp[0][7]": {
  "fullName": "main.inp[0][7]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[0][7]"
  ],
  "id": 8
 },
 "main.inp[1][0]": {
  "fullName": "main.inp[1][0]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][0]"
  ],
  "id": 9
 },
 "main.inp[1][1]": {
  "fullName": "main.inp[1][1]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][1]"
  ],
  "id": 10
 },
 "main.inp[1][2]": {
  "fullName": "main.inp[1][2]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][2]"
  ],
  "id": 11
 },
 "main.inp[1][3]": {
  "fullName": "main.inp[1][3]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][3]"
  ],
  "id": 12
 },
 "main.inp[1][4]": {
  "fullName": "main.inp[1][4]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][4]"
  ],
  "id": 13
 },
 "main.inp[1][5]": {
  "fullName": "main.inp[1][5]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][5]"
  ],
  "id": 14
 },
 "main.inp[1][6]": {
  "fullName": "main.inp[1][6]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][6]"
  ],
  "id": 15
 },
 "main.inp[1][7]": {
  "fullName": "main.inp[1][7]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[1][7]"
  ],
  "id": 16
 },
 "main.inp[2][0]": {
  "fullName": "main.inp[2][0]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][0]"
  ],
  "id": 17
 },
 "main.inp[2][1]": {
  "fullName": "main.inp[2][1]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][1]"
  ],
  "id": 18
 },
 "main.inp[2][2]": {
  "fullName": "main.inp[2][2]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][2]"
  ],
  "id": 19
 },
 "main.inp[2][3]": {
  "fullName": "main.inp[2][3]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][3]"
  ],
  "id": 20
 },
 "main.inp[2][4]": {
  "fullName": "main.inp[2][4]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][4]"
  ],
  "id": 21
 },
 "main.inp[2][5]": {
  "fullName": "main.inp[2][5]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][5]"
  ],
  "id": 22
 },
 "main.inp[2][6]": {
  "fullName": "main.inp[2][6]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][6]"
  ],
  "id": 23
 },
 "main.inp[2][7]": {
  "fullName": "main.inp[2][7]",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp[2][7]"
  ],
  "id": 24
 },
 "main.sel": {
  "fullName": "main.sel",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.sel"
  ],
  "id": 25
 },
 "main.out[0]": {
  "fullName": "main.out[0]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[0].out",
  "alias": [
   "main.out[0]",
   null
  ],
  "id": 26
 },
 "main.out[1]": {
  "fullName": "main.out[1]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[1].out",
  "alias": [
   "main.out[1]",
   null
  ],
  "id": 27
 },
 "main.out[2]": {
  "fullName": "main.out[2]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[2].out",
  "alias": [
   "main.out[2]",
   null
  ],
  "id": 28
 },
 "main.out[3]": {
  "fullName": "main.out[3]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[3].out",
  "alias": [
   "main.out[3]",
   null
  ],
  "id": 29
 },
 "main.out[4]": {
  "fullName": "main.out[4]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[4].out",
  "alias": [
   "main.out[4]",
   null
  ],
  "id": 30
 },
 "main.out[5]": {
  "fullName": "main.out[5]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[5].out",
  "alias": [
   "main.out[5]",
   null
  ],
  "id": 31
 },
 "main.out[6]": {
  "fullName": "main.out[6]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[6].out",
  "alias": [
   "main.out[6]",
   null
  ],
  "id": 32
 },
 "main.out[7]": {
  "fullName": "main.out[7]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "main.ep[7].out",
  "alias": [
   "main.out[7]",
   null
  ],
  "id": 33
 },
 "main.dec.inp": {
  "fullName": "main.dec.inp",
  "direction": "IN",
  "component": "main.dec",
  "equivalence": "main.sel",
  "alias": [
   "main.dec.inp",
   null
  ],
  "id": 25
 },
 "main.dec.out[0]": {
  "fullName": "main.dec.out[0]",
  "direction": "OUT",
  "component": "main.dec",
  "equivalence": "",
  "alias": [
   "main.dec.out[0]"
  ],
  "id": 34
 },
 "main.dec.out[1]": {
  "fullName": "main.dec.out[1]",
  "direction": "OUT",
  "component": "main.dec",
  "equivalence": "",
  "alias": [
   "main.dec.out[1]"
  ],
  "id": 35
 },
 "main.dec.out[2]": {
  "fullName": "main.dec.out[2]",
  "direction": "OUT",
  "component": "main.dec",
  "equivalence": "",
  "alias": [
   "main.dec.out[2]"
  ],
  "id": 36
 },
 "main.dec.success": {
  "fullName": "main.dec.success",
  "direction": "OUT",
  "component": "main.dec",
  "equivalence": "",
  "alias": [
   "main.dec.success"
  ],
  "id": 37
 },
 "main.ep[0].in1[0]": {
  "fullName": "main.ep[0].in1[0]",
  "direction": "IN",
  "component": "main.ep[0]",
  "equivalence": "main.inp[0][0]",
  "alias": [
   "main.ep[0].in1[0]",
   null
  ],
  "id": 1
 },
 "main.ep[0].in1[1]": {
  "fullName": "main.ep[0].in1[1]",
  "direction": "IN",
  "component": "main.ep[0]",
  "equivalence": "main.inp[1][0]",
  "alias": [
   "main.ep[0].in1[1]",
   null
  ],
  "id": 9
 },
 "main.ep[0].in1[2]": {
  "fullName": "main.ep[0].in1[2]",
  "direction": "IN",
  "component": "main.ep[0]",
  "equivalence": "main.inp[2][0]",
  "alias": [
   "main.ep[0].in1[2]",
   null
  ],
  "id": 17
 },
 "main.ep[0].in2[0]": {
  "fullName": "main.ep[0].in2[0]",
  "direction": "IN",
  "component": "main.ep[0]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[0].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[0].in2[1]": {
  "fullName": "main.ep[0].in2[1]",
  "direction": "IN",
  "component": "main.ep[0]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[0].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[0].in2[2]": {
  "fullName": "main.ep[0].in2[2]",
  "direction": "IN",
  "component": "main.ep[0]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[0].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[0].out": {
  "fullName": "main.ep[0].out",
  "direction": "OUT",
  "component": "main.ep[0]",
  "equivalence": "",
  "alias": [
   "main.ep[0].out"
  ],
  "id": 26
 },
 "main.ep[0].aux[0]": {
  "fullName": "main.ep[0].aux[0]",
  "direction": "",
  "component": "main.ep[0]",
  "equivalence": "",
  "alias": [
   "main.ep[0].aux[0]"
  ],
  "id": 38
 },
 "main.ep[0].aux[1]": {
  "fullName": "main.ep[0].aux[1]",
  "direction": "",
  "component": "main.ep[0]",
  "equivalence": "",
  "alias": [
   "main.ep[0].aux[1]"
  ],
  "id": 39
 },
 "main.ep[0].aux[2]": {
  "fullName": "main.ep[0].aux[2]",
  "direction": "",
  "component": "main.ep[0]",
  "equivalence": "",
  "alias": [
   "main.ep[0].aux[2]"
  ],
  "id": 40
 },
 "main.ep[1].in1[0]": {
  "fullName": "main.ep[1].in1[0]",
  "direction": "IN",
  "component": "main.ep[1]",
  "equivalence": "main.inp[0][1]",
  "alias": [
   "main.ep[1].in1[0]",
   null
  ],
  "id": 2
 },
 "main.ep[1].in1[1]": {
  "fullName": "main.ep[1].in1[1]",
  "direction": "IN",
  "component": "main.ep[1]",
  "equivalence": "main.inp[1][1]",
  "alias": [
   "main.ep[1].in1[1]",
   null
  ],
  "id": 10
 },
 "main.ep[1].in1[2]": {
  "fullName": "main.ep[1].in1[2]",
  "direction": "IN",
  "component": "main.ep[1]",
  "equivalence": "main.inp[2][1]",
  "alias": [
   "main.ep[1].in1[2]",
   null
  ],
  "id": 18
 },
 "main.ep[1].in2[0]": {
  "fullName": "main.ep[1].in2[0]",
  "direction": "IN",
  "component": "main.ep[1]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[1].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[1].in2[1]": {
  "fullName": "main.ep[1].in2[1]",
  "direction": "IN",
  "component": "main.ep[1]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[1].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[1].in2[2]": {
  "fullName": "main.ep[1].in2[2]",
  "direction": "IN",
  "component": "main.ep[1]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[1].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[1].out": {
  "fullName": "main.ep[1].out",
  "direction": "OUT",
  "component": "main.ep[1]",
  "equivalence": "",
  "alias": [
   "main.ep[1].out"
  ],
  "id": 27
 },
 "main.ep[1].aux[0]": {
  "fullName": "main.ep[1].aux[0]",
  "direction": "",
  "component": "main.ep[1]",
  "equivalence": "",
  "alias": [
   "main.ep[1].aux[0]"
  ],
  "id": 41
 },
 "main.ep[1].aux[1]": {
  "fullName": "main.ep[1].aux[1]",
  "direction": "",
  "component": "main.ep[1]",
  "equivalence": "",
  "alias": [
   "main.ep[1].aux[1]"
  ],
  "id": 42
 },
 "main.ep[1].aux[2]": {
  "fullName": "main.ep[1].aux[2]",
  "direction": "",
  "component": "main.ep[1]",
  "equivalence": "",
  "alias": [
   "main.ep[1].aux[2]"
  ],
  "id": 43
 },
 "main.ep[2].in1[0]": {
  "fullName": "main.ep[2].in1[0]",
  "direction": "IN",
  "component": "main.ep[2]",
  "equivalence": "main.inp[0][2]",
  "alias": [
   "main.ep[2].in1[0]",
   null
  ],
  "id": 3
 },
 "main.ep[2].in1[1]": {
  "fullName": "main.ep[2].in1[1]",
  "direction": "IN",
  "component": "main.ep[2]",
  "equivalence": "main.inp[1][2]",
  "alias": [
   "main.ep[2].in1[1]",
   null
  ],
  "id": 11
 },
 "main.ep[2].in1[2]": {
  "fullName": "main.ep[2].in1[2]",
  "direction": "IN",
  "component": "main.ep[2]",
  "equivalence": "main.inp[2][2]",
  "alias": [
   "main.ep[2].in1[2]",
   null
  ],
  "id": 19
 },
 "main.ep[2].in2[0]": {
  "fullName": "main.ep[2].in2[0]",
  "direction": "IN",
  "component": "main.ep[2]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[2].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[2].in2[1]": {
  "fullName": "main.ep[2].in2[1]",
  "direction": "IN",
  "component": "main.ep[2]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[2].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[2].in2[2]": {
  "fullName": "main.ep[2].in2[2]",
  "direction": "IN",
  "component": "main.ep[2]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[2].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[2].out": {
  "fullName": "main.ep[2].out",
  "direction": "OUT",
  "component": "main.ep[2]",
  "equivalence": "",
  "alias": [
   "main.ep[2].out"
  ],
  "id": 28
 },
 "main.ep[2].aux[0]": {
  "fullName": "main.ep[2].aux[0]",
  "direction": "",
  "component": "main.ep[2]",
  "equivalence": "",
  "alias": [
   "main.ep[2].aux[0]"
  ],
  "id": 44
 },
 "main.ep[2].aux[1]": {
  "fullName": "main.ep[2].aux[1]",
  "direction": "",
  "component": "main.ep[2]",
  "equivalence": "",
  "alias": [
   "main.ep[2].aux[1]"
  ],
  "id": 45
 },
 "main.ep[2].aux[2]": {
  "fullName": "main.ep[2].aux[2]",
  "direction": "",
  "component": "main.ep[2]",
  "equivalence": "",
  "alias": [
   "main.ep[2].aux[2]"
  ],
  "id": 46
 },
 "main.ep[3].in1[0]": {
  "fullName": "main.ep[3].in1[0]",
  "direction": "IN",
  "component": "main.ep[3]",
  "equivalence": "main.inp[0][3]",
  "alias": [
   "main.ep[3].in1[0]",
   null
  ],
  "id": 4
 },
 "main.ep[3].in1[1]": {
  "fullName": "main.ep[3].in1[1]",
  "direction": "IN",
  "component": "main.ep[3]",
  "equivalence": "main.inp[1][3]",
  "alias": [
   "main.ep[3].in1[1]",
   null
  ],
  "id": 12
 },
 "main.ep[3].in1[2]": {
  "fullName": "main.ep[3].in1[2]",
  "direction": "IN",
  "component": "main.ep[3]",
  "equivalence": "main.inp[2][3]",
  "alias": [
   "main.ep[3].in1[2]",
   null
  ],
  "id": 20
 },
 "main.ep[3].in2[0]": {
  "fullName": "main.ep[3].in2[0]",
  "direction": "IN",
  "component": "main.ep[3]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[3].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[3].in2[1]": {
  "fullName": "main.ep[3].in2[1]",
  "direction": "IN",
  "component": "main.ep[3]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[3].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[3].in2[2]": {
  "fullName": "main.ep[3].in2[2]",
  "direction": "IN",
  "component": "main.ep[3]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[3].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[3].out": {
  "fullName": "main.ep[3].out",
  "direction": "OUT",
  "component": "main.ep[3]",
  "equivalence": "",
  "alias": [
   "main.ep[3].out"
  ],
  "id": 29
 },
 "main.ep[3].aux[0]": {
  "fullName": "main.ep[3].aux[0]",
  "direction": "",
  "component": "main.ep[3]",
  "equivalence": "",
  "alias": [
   "main.ep[3].aux[0]"
  ],
  "id": 47
 },
 "main.ep[3].aux[1]": {
  "fullName": "main.ep[3].aux[1]",
  "direction": "",
  "component": "main.ep[3]",
  "equivalence": "",
  "alias": [
   "main.ep[3].aux[1]"
  ],
  "id": 48
 },
 "main.ep[3].aux[2]": {
  "fullName": "main.ep[3].aux[2]",
  "direction": "",
  "component": "main.ep[3]",
  "equivalence": "",
  "alias": [
   "main.ep[3].aux[2]"
  ],
  "id": 49
 },
 "main.ep[4].in1[0]": {
  "fullName": "main.ep[4].in1[0]",
  "direction": "IN",
  "component": "main.ep[4]",
  "equivalence": "main.inp[0][4]",
  "alias": [
   "main.ep[4].in1[0]",
   null
  ],
  "id": 5
 },
 "main.ep[4].in1[1]": {
  "fullName": "main.ep[4].in1[1]",
  "direction": "IN",
  "component": "main.ep[4]",
  "equivalence": "main.inp[1][4]",
  "alias": [
   "main.ep[4].in1[1]",
   null
  ],
  "id": 13
 },
 "main.ep[4].in1[2]": {
  "fullName": "main.ep[4].in1[2]",
  "direction": "IN",
  "component": "main.ep[4]",
  "equivalence": "main.inp[2][4]",
  "alias": [
   "main.ep[4].in1[2]",
   null
  ],
  "id": 21
 },
 "main.ep[4].in2[0]": {
  "fullName": "main.ep[4].in2[0]",
  "direction": "IN",
  "component": "main.ep[4]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[4].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[4].in2[1]": {
  "fullName": "main.ep[4].in2[1]",
  "direction": "IN",
  "component": "main.ep[4]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[4].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[4].in2[2]": {
  "fullName": "main.ep[4].in2[2]",
  "direction": "IN",
  "component": "main.ep[4]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[4].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[4].out": {
  "fullName": "main.ep[4].out",
  "direction": "OUT",
  "component": "main.ep[4]",
  "equivalence": "",
  "alias": [
   "main.ep[4].out"
  ],
  "id": 30
 },
 "main.ep[4].aux[0]": {
  "fullName": "main.ep[4].aux[0]",
  "direction": "",
  "component": "main.ep[4]",
  "equivalence": "",
  "alias": [
   "main.ep[4].aux[0]"
  ],
  "id": 50
 },
 "main.ep[4].aux[1]": {
  "fullName": "main.ep[4].aux[1]",
  "direction": "",
  "component": "main.ep[4]",
  "equivalence": "",
  "alias": [
   "main.ep[4].aux[1]"
  ],
  "id": 51
 },
 "main.ep[4].aux[2]": {
  "fullName": "main.ep[4].aux[2]",
  "direction": "",
  "component": "main.ep[4]",
  "equivalence": "",
  "alias": [
   "main.ep[4].aux[2]"
  ],
  "id": 52
 },
 "main.ep[5].in1[0]": {
  "fullName": "main.ep[5].in1[0]",
  "direction": "IN",
  "component": "main.ep[5]",
  "equivalence": "main.inp[0][5]",
  "alias": [
   "main.ep[5].in1[0]",
   null
  ],
  "id": 6
 },
 "main.ep[5].in1[1]": {
  "fullName": "main.ep[5].in1[1]",
  "direction": "IN",
  "component": "main.ep[5]",
  "equivalence": "main.inp[1][5]",
  "alias": [
   "main.ep[5].in1[1]",
   null
  ],
  "id": 14
 },
 "main.ep[5].in1[2]": {
  "fullName": "main.ep[5].in1[2]",
  "direction": "IN",
  "component": "main.ep[5]",
  "equivalence": "main.inp[2][5]",
  "alias": [
   "main.ep[5].in1[2]",
   null
  ],
  "id": 22
 },
 "main.ep[5].in2[0]": {
  "fullName": "main.ep[5].in2[0]",
  "direction": "IN",
  "component": "main.ep[5]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[5].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[5].in2[1]": {
  "fullName": "main.ep[5].in2[1]",
  "direction": "IN",
  "component": "main.ep[5]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[5].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[5].in2[2]": {
  "fullName": "main.ep[5].in2[2]",
  "direction": "IN",
  "component": "main.ep[5]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[5].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[5].out": {
  "fullName": "main.ep[5].out",
  "direction": "OUT",
  "component": "main.ep[5]",
  "equivalence": "",
  "alias": [
   "main.ep[5].out"
  ],
  "id": 31
 },
 "main.ep[5].aux[0]": {
  "fullName": "main.ep[5].aux[0]",
  "direction": "",
  "component": "main.ep[5]",
  "equivalence": "",
  "alias": [
   "main.ep[5].aux[0]"
  ],
  "id": 53
 },
 "main.ep[5].aux[1]": {
  "fullName": "main.ep[5].aux[1]",
  "direction": "",
  "component": "main.ep[5]",
  "equivalence": "",
  "alias": [
   "main.ep[5].aux[1]"
  ],
  "id": 54
 },
 "main.ep[5].aux[2]": {
  "fullName": "main.ep[5].aux[2]",
  "direction": "",
  "component": "main.ep[5]",
  "equivalence": "",
  "alias": [
   "main.ep[5].aux[2]"
  ],
  "id": 55
 },
 "main.ep[6].in1[0]": {
  "fullName": "main.ep[6].in1[0]",
  "direction": "IN",
  "component": "main.ep[6]",
  "equivalence": "main.inp[0][6]",
  "alias": [
   "main.ep[6].in1[0]",
   null
  ],
  "id": 7
 },
 "main.ep[6].in1[1]": {
  "fullName": "main.ep[6].in1[1]",
  "direction": "IN",
  "component": "main.ep[6]",
  "equivalence": "main.inp[1][6]",
  "alias": [
   "main.ep[6].in1[1]",
   null
  ],
  "id": 15
 },
 "main.ep[6].in1[2]": {
  "fullName": "main.ep[6].in1[2]",
  "direction": "IN",
  "component": "main.ep[6]",
  "equivalence": "main.inp[2][6]",
  "alias": [
   "main.ep[6].in1[2]",
   null
  ],
  "id": 23
 },
 "main.ep[6].in2[0]": {
  "fullName": "main.ep[6].in2[0]",
  "direction": "IN",
  "component": "main.ep[6]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[6].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[6].in2[1]": {
  "fullName": "main.ep[6].in2[1]",
  "direction": "IN",
  "component": "main.ep[6]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[6].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[6].in2[2]": {
  "fullName": "main.ep[6].in2[2]",
  "direction": "IN",
  "component": "main.ep[6]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[6].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[6].out": {
  "fullName": "main.ep[6].out",
  "direction": "OUT",
  "component": "main.ep[6]",
  "equivalence": "",
  "alias": [
   "main.ep[6].out"
  ],
  "id": 32
 },
 "main.ep[6].aux[0]": {
  "fullName": "main.ep[6].aux[0]",
  "direction": "",
  "component": "main.ep[6]",
  "equivalence": "",
  "alias": [
   "main.ep[6].aux[0]"
  ],
  "id": 56
 },
 "main.ep[6].aux[1]": {
  "fullName": "main.ep[6].aux[1]",
  "direction": "",
  "component": "main.ep[6]",
  "equivalence": "",
  "alias": [
   "main.ep[6].aux[1]"
  ],
  "id": 57
 },
 "main.ep[6].aux[2]": {
  "fullName": "main.ep[6].aux[2]",
  "direction": "",
  "component": "main.ep[6]",
  "equivalence": "",
  "alias": [
   "main.ep[6].aux[2]"
  ],
  "id": 58
 },
 "main.ep[7].in1[0]": {
  "fullName": "main.ep[7].in1[0]",
  "direction": "IN",
  "component": "main.ep[7]",
  "equivalence": "main.inp[0][7]",
  "alias": [
   "main.ep[7].in1[0]",
   null
  ],
  "id": 8
 },
 "main.ep[7].in1[1]": {
  "fullName": "main.ep[7].in1[1]",
  "direction": "IN",
  "component": "main.ep[7]",
  "equivalence": "main.inp[1][7]",
  "alias": [
   "main.ep[7].in1[1]",
   null
  ],
  "id": 16
 },
 "main.ep[7].in1[2]": {
  "fullName": "main.ep[7].in1[2]",
  "direction": "IN",
  "component": "main.ep[7]",
  "equivalence": "main.inp[2][7]",
  "alias": [
   "main.ep[7].in1[2]",
   null
  ],
  "id": 24
 },
 "main.ep[7].in2[0]": {
  "fullName": "main.ep[7].in2[0]",
  "direction": "IN",
  "component": "main.ep[7]",
  "equivalence": "main.dec.out[0]",
  "alias": [
   "main.ep[7].in2[0]",
   null
  ],
  "id": 34
 },
 "main.ep[7].in2[1]": {
  "fullName": "main.ep[7].in2[1]",
  "direction": "IN",
  "component": "main.ep[7]",
  "equivalence": "main.dec.out[1]",
  "alias": [
   "main.ep[7].in2[1]",
   null
  ],
  "id": 35
 },
 "main.ep[7].in2[2]": {
  "fullName": "main.ep[7].in2[2]",
  "direction": "IN",
  "component": "main.ep[7]",
  "equivalence": "main.dec.out[2]",
  "alias": [
   "main.ep[7].in2[2]",
   null
  ],
  "id": 36
 },
 "main.ep[7].out": {
  "fullName": "main.ep[7].out",
  "direction": "OUT",
  "component": "main.ep[7]",
  "equivalence": "",
  "alias": [
   "main.ep[7].out"
  ],
  "id": 33
 },
 "main.ep[7].aux[0]": {
  "fullName": "main.ep[7].aux[0]",
  "direction": "",
  "component": "main.ep[7]",
  "equivalence": "",
  "alias": [
   "main.ep[7].aux[0]"
  ],
  "id": 59
 },
 "main.ep[7].aux[1]": {
  "fullName": "main.ep[7].aux[1]",
  "direction": "",
  "component": "main.ep[7]",
  "equivalence": "",
  "alias": [
   "main.ep[7].aux[1]"
  ],
  "id": 60
 },
 "main.ep[7].aux[2]": {
  "fullName": "main.ep[7].aux[2]",
  "direction": "",
  "component": "main.ep[7]",
  "equivalence": "",
  "alias": [
   "main.ep[7].aux[2]"
  ],
  "id": 61
 }
};

circuit.components={
 "main": {
  "signals": [
   "main.inp[0][0]",
   "main.inp[0][1]",
   "main.inp[0][2]",
   "main.inp[0][3]",
   "main.inp[0][4]",
   "main.inp[0][5]",
   "main.inp[0][6]",
   "main.inp[0][7]",
   "main.inp[1][0]",
   "main.inp[1][1]",
   "main.inp[1][2]",
   "main.inp[1][3]",
   "main.inp[1][4]",
   "main.inp[1][5]",
   "main.inp[1][6]",
   "main.inp[1][7]",
   "main.inp[2][0]",
   "main.inp[2][1]",
   "main.inp[2][2]",
   "main.inp[2][3]",
   "main.inp[2][4]",
   "main.inp[2][5]",
   "main.inp[2][6]",
   "main.inp[2][7]",
   "main.sel",
   "main.out[0]",
   "main.out[1]",
   "main.out[2]",
   "main.out[3]",
   "main.out[4]",
   "main.out[5]",
   "main.out[6]",
   "main.out[7]"
  ],
  "params": {
   "wIn": "8",
   "nIn": "3"
  },
  "template": "Multiplexor",
  "inputSignals": 25
 },
 "main.dec": {
  "signals": [
   "main.dec.inp",
   "main.dec.out[0]",
   "main.dec.out[1]",
   "main.dec.out[2]",
   "main.dec.success"
  ],
  "params": {
   "w": "3"
  },
  "template": "Decoder",
  "inputSignals": 1
 },
 "main.ep[0]": {
  "signals": [
   "main.ep[0].in1[0]",
   "main.ep[0].in1[1]",
   "main.ep[0].in1[2]",
   "main.ep[0].in2[0]",
   "main.ep[0].in2[1]",
   "main.ep[0].in2[2]",
   "main.ep[0].out",
   "main.ep[0].aux[0]",
   "main.ep[0].aux[1]",
   "main.ep[0].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[1]": {
  "signals": [
   "main.ep[1].in1[0]",
   "main.ep[1].in1[1]",
   "main.ep[1].in1[2]",
   "main.ep[1].in2[0]",
   "main.ep[1].in2[1]",
   "main.ep[1].in2[2]",
   "main.ep[1].out",
   "main.ep[1].aux[0]",
   "main.ep[1].aux[1]",
   "main.ep[1].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[2]": {
  "signals": [
   "main.ep[2].in1[0]",
   "main.ep[2].in1[1]",
   "main.ep[2].in1[2]",
   "main.ep[2].in2[0]",
   "main.ep[2].in2[1]",
   "main.ep[2].in2[2]",
   "main.ep[2].out",
   "main.ep[2].aux[0]",
   "main.ep[2].aux[1]",
   "main.ep[2].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[3]": {
  "signals": [
   "main.ep[3].in1[0]",
   "main.ep[3].in1[1]",
   "main.ep[3].in1[2]",
   "main.ep[3].in2[0]",
   "main.ep[3].in2[1]",
   "main.ep[3].in2[2]",
   "main.ep[3].out",
   "main.ep[3].aux[0]",
   "main.ep[3].aux[1]",
   "main.ep[3].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[4]": {
  "signals": [
   "main.ep[4].in1[0]",
   "main.ep[4].in1[1]",
   "main.ep[4].in1[2]",
   "main.ep[4].in2[0]",
   "main.ep[4].in2[1]",
   "main.ep[4].in2[2]",
   "main.ep[4].out",
   "main.ep[4].aux[0]",
   "main.ep[4].aux[1]",
   "main.ep[4].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[5]": {
  "signals": [
   "main.ep[5].in1[0]",
   "main.ep[5].in1[1]",
   "main.ep[5].in1[2]",
   "main.ep[5].in2[0]",
   "main.ep[5].in2[1]",
   "main.ep[5].in2[2]",
   "main.ep[5].out",
   "main.ep[5].aux[0]",
   "main.ep[5].aux[1]",
   "main.ep[5].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[6]": {
  "signals": [
   "main.ep[6].in1[0]",
   "main.ep[6].in1[1]",
   "main.ep[6].in1[2]",
   "main.ep[6].in2[0]",
   "main.ep[6].in2[1]",
   "main.ep[6].in2[2]",
   "main.ep[6].out",
   "main.ep[6].aux[0]",
   "main.ep[6].aux[1]",
   "main.ep[6].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 },
 "main.ep[7]": {
  "signals": [
   "main.ep[7].in1[0]",
   "main.ep[7].in1[1]",
   "main.ep[7].in1[2]",
   "main.ep[7].in2[0]",
   "main.ep[7].in2[1]",
   "main.ep[7].in2[2]",
   "main.ep[7].out",
   "main.ep[7].aux[0]",
   "main.ep[7].aux[1]",
   "main.ep[7].aux[2]"
  ],
  "params": {
   "w": "3"
  },
  "template": "EscalarProduct",
  "inputSignals": 6
 }
};

circuit.signalConstrains=[
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.sel": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {}
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "one": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.sel": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {}
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "one": "21888242871839275222246405745257275088696311157297823662689037894645226208581",
    "main.sel": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {}
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.success": "1",
    "main.dec.out[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.dec.out[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.dec.out[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.success": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.success": "1",
    "one": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {}
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[0].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[0].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[0].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[0].out": "1",
    "main.ep[0].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[0].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[0].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[1].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[1].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[1].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[1].out": "1",
    "main.ep[1].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[1].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[1].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[2].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[2].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[2].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[2].out": "1",
    "main.ep[2].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[2].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[2].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][3]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[3].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][3]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[3].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][3]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[3].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[3].out": "1",
    "main.ep[3].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[3].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[3].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][4]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[4].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][4]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[4].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][4]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[4].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[4].out": "1",
    "main.ep[4].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[4].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[4].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][5]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[5].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][5]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[5].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][5]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[5].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[5].out": "1",
    "main.ep[5].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[5].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[5].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][6]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[6].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][6]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[6].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][6]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[6].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[6].out": "1",
    "main.ep[6].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[6].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[6].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[0][7]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[0]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[7].aux[0]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[1][7]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[1]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[7].aux[1]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.inp[2][7]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.out[2]": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[7].aux[2]": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.ep[7].out": "1",
    "main.ep[7].aux[0]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[7].aux[1]": "21888242871839275222246405745257275088696311157297823662689037894645226208582",
    "main.ep[7].aux[2]": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.dec.success": "1",
    "one": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 }
];

circuit.witnessNames=[
 [
  "one"
 ],
 [
  "main.inp[0][0]",
  "main.ep[0].in1[0]"
 ],
 [
  "main.inp[0][1]",
  "main.ep[1].in1[0]"
 ],
 [
  "main.inp[0][2]",
  "main.ep[2].in1[0]"
 ],
 [
  "main.inp[0][3]",
  "main.ep[3].in1[0]"
 ],
 [
  "main.inp[0][4]",
  "main.ep[4].in1[0]"
 ],
 [
  "main.inp[0][5]",
  "main.ep[5].in1[0]"
 ],
 [
  "main.inp[0][6]",
  "main.ep[6].in1[0]"
 ],
 [
  "main.inp[0][7]",
  "main.ep[7].in1[0]"
 ],
 [
  "main.inp[1][0]",
  "main.ep[0].in1[1]"
 ],
 [
  "main.inp[1][1]",
  "main.ep[1].in1[1]"
 ],
 [
  "main.inp[1][2]",
  "main.ep[2].in1[1]"
 ],
 [
  "main.inp[1][3]",
  "main.ep[3].in1[1]"
 ],
 [
  "main.inp[1][4]",
  "main.ep[4].in1[1]"
 ],
 [
  "main.inp[1][5]",
  "main.ep[5].in1[1]"
 ],
 [
  "main.inp[1][6]",
  "main.ep[6].in1[1]"
 ],
 [
  "main.inp[1][7]",
  "main.ep[7].in1[1]"
 ],
 [
  "main.inp[2][0]",
  "main.ep[0].in1[2]"
 ],
 [
  "main.inp[2][1]",
  "main.ep[1].in1[2]"
 ],
 [
  "main.inp[2][2]",
  "main.ep[2].in1[2]"
 ],
 [
  "main.inp[2][3]",
  "main.ep[3].in1[2]"
 ],
 [
  "main.inp[2][4]",
  "main.ep[4].in1[2]"
 ],
 [
  "main.inp[2][5]",
  "main.ep[5].in1[2]"
 ],
 [
  "main.inp[2][6]",
  "main.ep[6].in1[2]"
 ],
 [
  "main.inp[2][7]",
  "main.ep[7].in1[2]"
 ],
 [
  "main.sel",
  "main.dec.inp"
 ],
 [
  "main.out[0]",
  "main.ep[0].out"
 ],
 [
  "main.out[1]",
  "main.ep[1].out"
 ],
 [
  "main.out[2]",
  "main.ep[2].out"
 ],
 [
  "main.out[3]",
  "main.ep[3].out"
 ],
 [
  "main.out[4]",
  "main.ep[4].out"
 ],
 [
  "main.out[5]",
  "main.ep[5].out"
 ],
 [
  "main.out[6]",
  "main.ep[6].out"
 ],
 [
  "main.out[7]",
  "main.ep[7].out"
 ],
 [
  "main.dec.out[0]",
  "main.ep[0].in2[0]",
  "main.ep[1].in2[0]",
  "main.ep[2].in2[0]",
  "main.ep[3].in2[0]",
  "main.ep[4].in2[0]",
  "main.ep[5].in2[0]",
  "main.ep[6].in2[0]",
  "main.ep[7].in2[0]"
 ],
 [
  "main.dec.out[1]",
  "main.ep[0].in2[1]",
  "main.ep[1].in2[1]",
  "main.ep[2].in2[1]",
  "main.ep[3].in2[1]",
  "main.ep[4].in2[1]",
  "main.ep[5].in2[1]",
  "main.ep[6].in2[1]",
  "main.ep[7].in2[1]"
 ],
 [
  "main.dec.out[2]",
  "main.ep[0].in2[2]",
  "main.ep[1].in2[2]",
  "main.ep[2].in2[2]",
  "main.ep[3].in2[2]",
  "main.ep[4].in2[2]",
  "main.ep[5].in2[2]",
  "main.ep[6].in2[2]",
  "main.ep[7].in2[2]"
 ],
 [
  "main.dec.success"
 ],
 [
  "main.ep[0].aux[0]"
 ],
 [
  "main.ep[0].aux[1]"
 ],
 [
  "main.ep[0].aux[2]"
 ],
 [
  "main.ep[1].aux[0]"
 ],
 [
  "main.ep[1].aux[1]"
 ],
 [
  "main.ep[1].aux[2]"
 ],
 [
  "main.ep[2].aux[0]"
 ],
 [
  "main.ep[2].aux[1]"
 ],
 [
  "main.ep[2].aux[2]"
 ],
 [
  "main.ep[3].aux[0]"
 ],
 [
  "main.ep[3].aux[1]"
 ],
 [
  "main.ep[3].aux[2]"
 ],
 [
  "main.ep[4].aux[0]"
 ],
 [
  "main.ep[4].aux[1]"
 ],
 [
  "main.ep[4].aux[2]"
 ],
 [
  "main.ep[5].aux[0]"
 ],
 [
  "main.ep[5].aux[1]"
 ],
 [
  "main.ep[5].aux[2]"
 ],
 [
  "main.ep[6].aux[0]"
 ],
 [
  "main.ep[6].aux[1]"
 ],
 [
  "main.ep[6].aux[2]"
 ],
 [
  "main.ep[7].aux[0]"
 ],
 [
  "main.ep[7].aux[1]"
 ],
 [
  "main.ep[7].aux[2]"
 ]
];

{
}

circuit.templates = [];

circuit.templates["EscalarProduct"] = function(ctx) {
    ctx.setVar("lc", [], "0");
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt(ctx.getVar("w",[])) ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add("1").mod(__P__))).add(__P__).minus(1).mod(__P__))
    {
        ctx.setSignal("aux", [ctx.getVar("i",[])], bigInt(ctx.getSignal("in1", [ctx.getVar("i",[])])).times(ctx.getSignal("in2", [ctx.getVar("i",[])])).mod(__P__));
        ctx.assert(bigInt(ctx.getSignal("aux", [ctx.getVar("i",[])])).equals(bigInt(ctx.getSignal("in1", [ctx.getVar("i",[])])).times(ctx.getSignal("in2", [ctx.getVar("i",[])])).mod(__P__)));
        ctx.setVar("lc", [], bigInt(ctx.getVar("lc",[])).add(ctx.getSignal("aux", [ctx.getVar("i",[])])).mod(__P__));
    }
    ctx.setSignal("out", [], ctx.getVar("lc",[]));
    ctx.assert(bigInt(ctx.getSignal("out", [])).equals(ctx.getVar("lc",[])));
}
;

circuit.templates["Decoder"] = function(ctx) {
    ctx.setVar("lc", [], "0");
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt(ctx.getVar("w",[])) ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add("1").mod(__P__))).add(__P__).minus(1).mod(__P__))
    {
        ctx.setSignal("out", [ctx.getVar("i",[])], bigInt(bigInt(ctx.getSignal("inp", [])).eq(ctx.getVar("i",[])) ? 1 : 0).neq(0) ? ("1") : ("0"));
        ctx.assert(bigInt(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).times(bigInt(ctx.getSignal("inp", [])).add(__P__).minus(ctx.getVar("i",[])).mod(__P__)).mod(__P__)).equals("0"));
        ctx.setVar("lc", [], bigInt(ctx.getVar("lc",[])).add(ctx.getSignal("out", [ctx.getVar("i",[])])).mod(__P__));
    }
    ctx.setSignal("success", [], ctx.getVar("lc",[]));
    ctx.assert(bigInt(ctx.getSignal("success", [])).equals(ctx.getVar("lc",[])));
    ctx.assert(bigInt(bigInt(ctx.getSignal("success", [])).times(bigInt(ctx.getSignal("success", [])).add(__P__).minus("1").mod(__P__)).mod(__P__)).equals("0"));
}
;

circuit.templates["Multiplexor"] = function(ctx) {
    ctx.setPin("dec", [], "inp", [], ctx.getSignal("sel", []));
    ctx.assert(bigInt(ctx.getPin("dec", [], "inp", [])).equals(ctx.getSignal("sel", [])));
    for (ctx.setVar("j", [], "0");bigInt(ctx.getVar("j",[])).lt(ctx.getVar("wIn",[])) ? 1 : 0;(ctx.setVar("j", [], bigInt(ctx.getVar("j",[])).add("1").mod(__P__))).add(__P__).minus(1).mod(__P__))
    {
        for (ctx.setVar("k", [], "0");bigInt(ctx.getVar("k",[])).lt(ctx.getVar("nIn",[])) ? 1 : 0;(ctx.setVar("k", [], bigInt(ctx.getVar("k",[])).add("1").mod(__P__))).add(__P__).minus(1).mod(__P__))
        {
            ctx.setPin("ep", [ctx.getVar("j",[])], "in1", [ctx.getVar("k",[])], ctx.getSignal("inp", [ctx.getVar("k",[]),ctx.getVar("j",[])]));
            ctx.assert(bigInt(ctx.getPin("ep", [ctx.getVar("j",[])], "in1", [ctx.getVar("k",[])])).equals(ctx.getSignal("inp", [ctx.getVar("k",[]),ctx.getVar("j",[])])));
            ctx.setPin("ep", [ctx.getVar("j",[])], "in2", [ctx.getVar("k",[])], ctx.getPin("dec", [], "out", [ctx.getVar("k",[])]));
            ctx.assert(bigInt(ctx.getPin("ep", [ctx.getVar("j",[])], "in2", [ctx.getVar("k",[])])).equals(ctx.getPin("dec", [], "out", [ctx.getVar("k",[])])));
        }
        ctx.setSignal("out", [ctx.getVar("j",[])], ctx.getPin("ep", [ctx.getVar("j",[])], "out", []));
        ctx.assert(bigInt(ctx.getSignal("out", [ctx.getVar("j",[])])).equals(ctx.getPin("ep", [ctx.getVar("j",[])], "out", [])));
    }
    ctx.assert(bigInt(ctx.getPin("dec", [], "success", [])).equals("1"));
}
;
