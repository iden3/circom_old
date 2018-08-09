const bigInt = require("big-integer");

module.exports = calculateWitness;

function calculateWitness(circuit, inputSignals) {
    const ctx = new RTCtx(circuit);

    function iterateSelector(values, sels, cb) {
        if (!Array.isArray(values)) {
            return cb(sels, values);
        }
        for (let i=0; i<values.length; i++) {
            sels.push(i);
            iterateSelector(values[i], sels, cb);
            sels.pop(i);
        }
    }

    ctx.setSignal("one", [], bigInt(1));

    for (let c in ctx.notInitSignals) {
        if (ctx.notInitSignals[c] == 0) ctx.triggerComponent(c);
    }

    for (let s in inputSignals) {
        ctx.currentComponent = "main";
        iterateSelector(inputSignals[s], [], function(selector, value) {
            ctx.setSignal(s, selector, bigInt(value));
        });
    }

    for (let i=0; i<ctx.witness.length; i++) {
        if (typeof(ctx.witness[i]) == "undefined") {
            throw("Signal not assigned: " + ctx.circuit.witnessNames[i].join(", "));
        }
        console.log(ctx.circuit.witnessNames[i].join(",") + " --> " + ctx.witness[i].toString());
    }
    return ctx.witness;
}

class RTCtx {
    constructor(circuit) {
        this.scopes = [];
        this.circuit = circuit;
        this.witness = [];
        this.notInitSignals = {};
        for (let c in this.circuit.components) {
            this.notInitSignals[c] = this.circuit.components[c].inputSignals;
            if (this.notInitSignals == 0) {
                this.currentComponent = c;
                this.components.calc(this);
                this.currentComponent = null;
            }
        }
    }

    _sels2str(sels) {
        let res = "";
        for (let i=0; i<sels.length; i++) {
            res += `[${sels[i]}]`;
        }
        return res;
    }

    setPin(componentName, componentSels, signalName, signalSels, value) {
        let fullName = componentName=="one" ? "one" : this.currentComponent + "." + componentName;
        fullName += this._sels2str(componentSels) +
                    "."+
                    signalName+
                    this._sels2str(signalSels);
        this.setSignalFullName(fullName, value);
    }

    setSignal(name, sels, value) {
        let fullName = this.currentComponent ? this.currentComponent + "." + name : name;
        fullName += this._sels2str(sels);
        this.setSignalFullName(fullName, value);
    }

    triggerComponent(c) {
        console.log("Component Treiggered: " + c);

        // Set notInitSignals to -1 to not initialize again
        this.notInitSignals[c] --;
        const oldComponent = this.currentComponent;
        this.currentComponent = c;
        const template = this.circuit.components[c].template;

        const newScope = {};
        for (let p in this.circuit.components[c].params) {
            newScope[p] = this.circuit.components[c].params[p];
        }

        const oldScope = this.scopes;
        this.scopes = [ this.scopes[0], newScope ];

        // TODO set params.

        this.circuit.templates[template](this);
        this.scopes = oldScope;
        this.currentComponent = oldComponent;
    }

    callFunction(functionName, params) {

        const newScope = {};
        for (let p=0; p<this.circuit.functionParams[functionName].length; p++) {
            const paramName = this.circuit.functionParams[functionName][p];
            newScope[paramName] = params[p];
        }

        const oldScope = this.scopes;
        this.scopes = [ this.scopes[0], newScope ];

        // TODO set params.

        const res = this.circuit.functions[functionName](this);
        this.scopes = oldScope;

        return res;
    }

    setSignalFullName(fullName, value) {
        console.log("set " + fullName + " <-- " + value.toString());
        const sId = this.circuit.signals[fullName].id;
        let firstInit =false;
        if (!this.witness[sId]) {
            firstInit = true;
        }
        this.witness[sId] = value;
        const callComponents = [];
        for (let i=0; i<this.circuit.witnessNames[sId].length; i++) {
            const ss = this.circuit.witnessNames[sId][i];
            if (this.circuit.signals[ss].direction == "IN") {
                if (firstInit) this.notInitSignals[ this.circuit.signals[ss].component] --;
                callComponents.push(this.circuit.signals[ss].component);
            }
        }
        for (let i in callComponents) {
            const c= callComponents[i];
            if (this.notInitSignals[c] == 0) this.triggerComponent(c);
        }
        return value;
    }

    setVar(name, sels, value) {
        function setVarArray(a, sels2, value) {
            if (sels2.length == 1) {
                a[sels2[0]] = value;
            } else {
                if (typeof(a[sels2[0]]) == "undefined") a[sels2[0]] = [];
                setVarArray(a[sels2[0]], sels2.slice(1), value);
            }
        }
        const scope = this.scopes[this.scopes.length-1];
        if (sels.length == 0) {
            scope[name] = value;
        } else {
            if (typeof(scope[name]) == "undefined") scope[name] = [];
            setVarArray(scope[name], sels, value);
        }
        return value;
    }

    getVar(name, sels) {
        function select(a, sels2) {
            return  (sels2.length == 0) ? a : select(a[sels2[0]], sels2.slice(1));
        }
        for (let i=this.scopes.length-1; i>=0; i--) {
            if (typeof(this.scopes[i][name]) != "undefined") return select(this.scopes[i][name], sels);
        }
        throw new Error("Variable not defined: " + name);
    }

    getSignal(name, sels) {
        let fullName = name=="one" ? "one" : this.currentComponent + "." + name;
        fullName += this._sels2str(sels);
        return this.getSignalFullName(fullName);
    }


    getPin(componentName, componentSels, signalName, signalSels) {
        let fullName = componentName=="one" ? "one" : this.currentComponent + "." + componentName;
        fullName += this._sels2str(componentSels) +
                    "."+
                    signalName+
                    this._sels2str(signalSels);
        return this.getSignalFullName(fullName);
    }

    getSignalFullName(fullName) {
        const sId = this.circuit.signals[fullName].id;
        if (typeof(this.witness[sId]) == "undefined") {
            throw new Error("Signal not initialized: "+fullName);
        }
        console.log("get --->" + fullName + " = " + this.witness[sId].toString() );
        return this.witness[sId];
    }

    assert(a,b) {
        const ba = bigInt(a);
        const bb = bigInt(b);
        if (!ba.equals(bb)) {
            throw new Error("Constrain doesn't match: " + ba.toString() + " != " + bb.toString());
        }
    }


}
