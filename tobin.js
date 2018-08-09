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
 "main.inp": {
  "fullName": "main.inp",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.inp"
  ],
  "id": 1
 },
 "main.out[0]": {
  "fullName": "main.out[0]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[0]"
  ],
  "id": 2
 },
 "main.out[1]": {
  "fullName": "main.out[1]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[1]"
  ],
  "id": 3
 },
 "main.out[2]": {
  "fullName": "main.out[2]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[2]"
  ],
  "id": 4
 }
};

circuit.components={
 "main": {
  "signals": [
   "main.inp",
   "main.out[0]",
   "main.out[1]",
   "main.out[2]"
  ],
  "params": {
   "n": "3"
  },
  "template": "toBin",
  "inputSignals": 1
 }
};

circuit.signalConstrains=[
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[0]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[0]": "1",
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
    "main.out[1]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[1]": "1",
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
    "main.out[2]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[2]": "1",
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
   "values": {}
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {}
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[0]": "1",
    "main.out[1]": "2",
    "main.out[2]": "4",
    "main.inp": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  }
 }
];

circuit.witnessNames=[
 [
  "one"
 ],
 [
  "main.inp"
 ],
 [
  "main.out[0]"
 ],
 [
  "main.out[1]"
 ],
 [
  "main.out[2]"
 ]
];

{
}

circuit.templates = [];

circuit.templates["toBin"] = function(ctx) {
    ctx.setVar("lc1", [], "0");
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt(ctx.getVar("n",[])) ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add("1").mod(__P__))).add(__P__).minus(1).mod(__P__))
    {
        ctx.setSignal("out", [ctx.getVar("i",[])], bigInt(bigInt(ctx.getVar("i",[])).greater(256) ? 0 : bigInt(ctx.getSignal("inp", [])).shiftRight(bigInt(ctx.getVar("i",[])).value).and(__MASK__)).and("1").and(__MASK__));
        ctx.assert(bigInt(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).times(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).add(__P__).minus("1").mod(__P__)).mod(__P__)).equals("0"));
        ctx.setVar("lc1", [], bigInt(ctx.getVar("lc1",[])).add(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).times(bigInt("2").modPow(ctx.getVar("i",[]), __P__)).mod(__P__)).mod(__P__));
    }
    ctx.assert(bigInt(ctx.getVar("lc1",[])).equals(ctx.getSignal("inp", [])));
}
;
