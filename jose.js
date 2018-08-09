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
 "main.s1": {
  "fullName": "main.s1",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.s1"
  ],
  "id": 1
 },
 "main.s2": {
  "fullName": "main.s2",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.s2"
  ],
  "id": 2
 },
 "main.s3": {
  "fullName": "main.s3",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.s3"
  ],
  "id": 3
 }
};

circuit.components={
 "main": {
  "signals": [
   "main.s1",
   "main.s2",
   "main.s3"
  ],
  "params": {},
  "template": "AND",
  "inputSignals": 2
 }
};

circuit.signalConstrains=[
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.s1": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.s2": "1"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.s3": "1"
   }
  }
 },
 {
  "type": "QEQ",
  "a": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.s1": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.s1": "1",
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
    "main.s2": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.s2": "1",
    "one": "21888242871839275222246405745257275088696311157297823662689037894645226208582"
   }
  },
  "c": {
   "type": "LINEARCOMBINATION",
   "values": {}
  }
 }
];

circuit.witnessNames=[
 [
  "one"
 ],
 [
  "main.s1"
 ],
 [
  "main.s2"
 ],
 [
  "main.s3"
 ]
];

{
}

circuit.templates = {};

circuit.templates["AND"] = function(ctx) {
    ctx.setSignal("s3", [], bigInt(ctx.getSignal("s1", [])).times(ctx.getSignal("s2", [])).mod(__P__));
    ctx.assert(ctx.getSignal("s3", []), bigInt(ctx.getSignal("s1", [])).times(ctx.getSignal("s2", [])).mod(__P__));
    ctx.assert(bigInt(ctx.getSignal("s1", [])).times(bigInt(ctx.getSignal("s1", [])).add(__P__).minus("1").mod(__P__)).mod(__P__), "0");
    ctx.assert(bigInt(ctx.getSignal("s2", [])).times(bigInt(ctx.getSignal("s2", [])).add(__P__).minus("1").mod(__P__)).mod(__P__), "0");
}
;
circuit.functionParams={};


circuit.functions = {};
