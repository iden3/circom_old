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
 "main.in": {
  "fullName": "main.in",
  "direction": "IN",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.in"
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
 },
 "main.out[3]": {
  "fullName": "main.out[3]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[3]"
  ],
  "id": 5
 },
 "main.out[4]": {
  "fullName": "main.out[4]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[4]"
  ],
  "id": 6
 },
 "main.out[5]": {
  "fullName": "main.out[5]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[5]"
  ],
  "id": 7
 },
 "main.out[6]": {
  "fullName": "main.out[6]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[6]"
  ],
  "id": 8
 },
 "main.out[7]": {
  "fullName": "main.out[7]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[7]"
  ],
  "id": 9
 },
 "main.out[8]": {
  "fullName": "main.out[8]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[8]"
  ],
  "id": 10
 },
 "main.out[9]": {
  "fullName": "main.out[9]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[9]"
  ],
  "id": 11
 },
 "main.out[10]": {
  "fullName": "main.out[10]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[10]"
  ],
  "id": 12
 },
 "main.out[11]": {
  "fullName": "main.out[11]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[11]"
  ],
  "id": 13
 },
 "main.out[12]": {
  "fullName": "main.out[12]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[12]"
  ],
  "id": 14
 },
 "main.out[13]": {
  "fullName": "main.out[13]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[13]"
  ],
  "id": 15
 },
 "main.out[14]": {
  "fullName": "main.out[14]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[14]"
  ],
  "id": 16
 },
 "main.out[15]": {
  "fullName": "main.out[15]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[15]"
  ],
  "id": 17
 },
 "main.out[16]": {
  "fullName": "main.out[16]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[16]"
  ],
  "id": 18
 },
 "main.out[17]": {
  "fullName": "main.out[17]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[17]"
  ],
  "id": 19
 },
 "main.out[18]": {
  "fullName": "main.out[18]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[18]"
  ],
  "id": 20
 },
 "main.out[19]": {
  "fullName": "main.out[19]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[19]"
  ],
  "id": 21
 },
 "main.out[20]": {
  "fullName": "main.out[20]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[20]"
  ],
  "id": 22
 },
 "main.out[21]": {
  "fullName": "main.out[21]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[21]"
  ],
  "id": 23
 },
 "main.out[22]": {
  "fullName": "main.out[22]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[22]"
  ],
  "id": 24
 },
 "main.out[23]": {
  "fullName": "main.out[23]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[23]"
  ],
  "id": 25
 },
 "main.out[24]": {
  "fullName": "main.out[24]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[24]"
  ],
  "id": 26
 },
 "main.out[25]": {
  "fullName": "main.out[25]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[25]"
  ],
  "id": 27
 },
 "main.out[26]": {
  "fullName": "main.out[26]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[26]"
  ],
  "id": 28
 },
 "main.out[27]": {
  "fullName": "main.out[27]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[27]"
  ],
  "id": 29
 },
 "main.out[28]": {
  "fullName": "main.out[28]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[28]"
  ],
  "id": 30
 },
 "main.out[29]": {
  "fullName": "main.out[29]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[29]"
  ],
  "id": 31
 },
 "main.out[30]": {
  "fullName": "main.out[30]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[30]"
  ],
  "id": 32
 },
 "main.out[31]": {
  "fullName": "main.out[31]",
  "direction": "OUT",
  "component": "main",
  "equivalence": "",
  "alias": [
   "main.out[31]"
  ],
  "id": 33
 }
};

circuit.components={
 "main": {
  "signals": [
   "main.in",
   "main.out[0]",
   "main.out[1]",
   "main.out[2]",
   "main.out[3]",
   "main.out[4]",
   "main.out[5]",
   "main.out[6]",
   "main.out[7]",
   "main.out[8]",
   "main.out[9]",
   "main.out[10]",
   "main.out[11]",
   "main.out[12]",
   "main.out[13]",
   "main.out[14]",
   "main.out[15]",
   "main.out[16]",
   "main.out[17]",
   "main.out[18]",
   "main.out[19]",
   "main.out[20]",
   "main.out[21]",
   "main.out[22]",
   "main.out[23]",
   "main.out[24]",
   "main.out[25]",
   "main.out[26]",
   "main.out[27]",
   "main.out[28]",
   "main.out[29]",
   "main.out[30]",
   "main.out[31]"
  ],
  "params": {},
  "template": "ToBin",
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
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[3]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[3]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[4]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[4]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[5]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[5]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[6]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[6]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[7]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[7]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[8]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[8]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[9]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[9]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[10]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[10]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[11]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[11]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[12]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[12]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[13]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[13]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[14]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[14]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[15]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[15]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[16]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[16]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[17]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[17]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[18]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[18]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[19]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[19]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[20]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[20]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[21]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[21]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[22]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[22]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[23]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[23]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[24]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[24]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[25]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[25]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[26]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[26]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[27]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[27]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[28]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[28]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[29]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[29]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[30]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[30]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[31]": "1"
   }
  },
  "b": {
   "type": "LINEARCOMBINATION",
   "values": {
    "main.out[31]": "1",
    "one": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
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
    "main.out[3]": "8",
    "main.out[4]": "16",
    "main.out[5]": "32",
    "main.out[6]": "64",
    "main.out[7]": "128",
    "main.out[8]": "256",
    "main.out[9]": "512",
    "main.out[10]": "1024",
    "main.out[11]": "2048",
    "main.out[12]": "4096",
    "main.out[13]": "8192",
    "main.out[14]": "16384",
    "main.out[15]": "32768",
    "main.out[16]": "65536",
    "main.out[17]": "131072",
    "main.out[18]": "262144",
    "main.out[19]": "524288",
    "main.out[20]": "1048576",
    "main.out[21]": "2097152",
    "main.out[22]": "4194304",
    "main.out[23]": "8388608",
    "main.out[24]": "16777216",
    "main.out[25]": "33554432",
    "main.out[26]": "67108864",
    "main.out[27]": "134217728",
    "main.out[28]": "268435456",
    "main.out[29]": "536870912",
    "main.out[30]": "1073741824",
    "main.out[31]": "2147483648",
    "main.in": "21888242871839275222246405745257275088548364400416034343698204186575808495616"
   }
  }
 }
];

circuit.witnessNames=[
 [
  "one"
 ],
 [
  "main.in"
 ],
 [
  "main.out[0]"
 ],
 [
  "main.out[1]"
 ],
 [
  "main.out[2]"
 ],
 [
  "main.out[3]"
 ],
 [
  "main.out[4]"
 ],
 [
  "main.out[5]"
 ],
 [
  "main.out[6]"
 ],
 [
  "main.out[7]"
 ],
 [
  "main.out[8]"
 ],
 [
  "main.out[9]"
 ],
 [
  "main.out[10]"
 ],
 [
  "main.out[11]"
 ],
 [
  "main.out[12]"
 ],
 [
  "main.out[13]"
 ],
 [
  "main.out[14]"
 ],
 [
  "main.out[15]"
 ],
 [
  "main.out[16]"
 ],
 [
  "main.out[17]"
 ],
 [
  "main.out[18]"
 ],
 [
  "main.out[19]"
 ],
 [
  "main.out[20]"
 ],
 [
  "main.out[21]"
 ],
 [
  "main.out[22]"
 ],
 [
  "main.out[23]"
 ],
 [
  "main.out[24]"
 ],
 [
  "main.out[25]"
 ],
 [
  "main.out[26]"
 ],
 [
  "main.out[27]"
 ],
 [
  "main.out[28]"
 ],
 [
  "main.out[29]"
 ],
 [
  "main.out[30]"
 ],
 [
  "main.out[31]"
 ]
];

{
}

circuit.templates = {};

circuit.templates["AND"] = function(ctx) {
    ctx.setSignal("c", [], bigInt(ctx.getSignal("a", [])).times(ctx.getSignal("b", [])).mod(__P__));
    ctx.assert(ctx.getSignal("c", []), bigInt(ctx.getSignal("a", [])).times(ctx.getSignal("b", [])).mod(__P__));
}
;

circuit.templates["AND3"] = function(ctx) {
    ctx.setPin("and1", [], "a", [], ctx.getSignal("in1", []));
    ctx.assert(ctx.getPin("and1", [], "a", []), ctx.getSignal("in1", []));
    ctx.setPin("and1", [], "b", [], ctx.getSignal("in2", []));
    ctx.assert(ctx.getPin("and1", [], "b", []), ctx.getSignal("in2", []));
    ctx.setPin("and2", [], "a", [], ctx.getSignal("in3", []));
    ctx.assert(ctx.getPin("and2", [], "a", []), ctx.getSignal("in3", []));
    ctx.setPin("and2", [], "b", [], ctx.getPin("and1", [], "c", []));
    ctx.assert(ctx.getPin("and2", [], "b", []), ctx.getPin("and1", [], "c", []));
    ctx.setSignal("out", [], ctx.getPin("and2", [], "c", []));
    ctx.assert(ctx.getSignal("out", []), ctx.getPin("and2", [], "c", []));
}
;

circuit.templates["ToBin"] = function(ctx) {
    ctx.setVar("lc", [], "0");
    for (ctx.setVar("i", [], "0");bigInt(ctx.getVar("i",[])).lt("32") ? 1 : 0;(ctx.setVar("i", [], bigInt(ctx.getVar("i",[])).add("1").mod(__P__))).add(__P__).minus(1).mod(__P__))
    {
        ctx.setSignal("out", [ctx.getVar("i",[])], bigInt(bigInt(ctx.getVar("i",[])).greater(256) ? 0 : bigInt(ctx.getSignal("in", [])).shiftRight(bigInt(ctx.getVar("i",[])).value).and(__MASK__)).and("1").and(__MASK__));
        ctx.setVar("lc", [], bigInt(ctx.getVar("lc",[])).add(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).times(bigInt("2").modPow(ctx.getVar("i",[]), __P__)).mod(__P__)).mod(__P__));
        ctx.assert(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).times(bigInt(ctx.getSignal("out", [ctx.getVar("i",[])])).add(__P__).minus("1").mod(__P__)).mod(__P__), "0");
    }
    ctx.assert(ctx.getVar("lc",[]), ctx.getSignal("in", []));
}
;
circuit.functionParams={};


circuit.functions = {};
