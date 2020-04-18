const BigArray = require("./bigarray.js");
const F1Field = require("ffjavascript").F1Field;

class TableName {
    constructor (ctx) {
        this.ctx = ctx;
        this.o = {};
    }

    _allocElement(name, _sizes, type) {
        const sizes = _sizes || [];
        let l = 1;
        for (let i=0; i<sizes.length; i++) {
            l = l*sizes[i];
        }
        this.o[name] = {
            sizes: sizes,
            type: type
        };
        return l;
    }

    addSignal(name, sizes) {
        const l = this._allocElement(name, sizes, "S");
        const o = this.ctx.nSignals;
        this.o[name].offset = o;
        this.ctx.nSignals += l;
        if (l>1) {
            return [o, o+l];
        } else {
            return o;
        }
    }

    addComponent(name, sizes) {
        const l = this._allocElement(name, sizes, "C");
        const o = this.ctx.nComponents;
        this.o[name].offset = o;
        this.ctx.nComponents += l;
        if (l>1) {
            return [o, o+l];
        } else {
            return o;
        }
    }

    _getElement(name, _sels, type) {
        const sels = _sels || [];
        const s = this.o[name];
        if (!s) return -1;
        if (s.type != type) return -1;
        if (sels.length > s.sizes.length) return -1;
        let l=1;
        for (let i = s.sizes.length-1; i>sels.length; i--) {
            l = l*s.sizes[i];
        }
        let o =0;
        let p=1;
        for (let i=sels.length-1; i>=0; i--) {
            if (sels[i] > s.sizes[i]) return -1; // Out of range
            if (sels[i] < 0) return -1; // Out of range
            o += p*sels[i];
            p *= s.sizes[i];
        }
        if (l>1) {
            return [s.offset + o, s.offset + o + l];
        } else {
            return s.offset + o;
        }
    }

    getSignalIdx(name, sels) {
        return this._getElement(name, sels, "S");
    }

    getComponentIdx(name, sels) {
        return this._getElement(name, sels, "C");
    }

    getSizes(name) {
        return this.o[name].sels;
    }

}

module.exports = class Ctx {

    constructor(p) {

        this.F = new F1Field(p);

        this.stONE = 1;
        this.stOUTPUT = 2;
        this.stPUBINPUT = 3;
        this.stPRVINPUT = 4;
        this.stINTERNAL = 5;
        this.stDISCARDED = 6;
        this.stCONSTANT = 7;

        this.IN = 0x01;
        this.OUT = 0x02;
        this.PRV = 0x04;
        this.ONE = 0x08;
        this.MAIN = 0x10;
        this.COUNTED = 0x20;

        this.scopes = [{}];
        this.signals = new BigArray();

        this.currentComponent= -1;
        this.constraints= new BigArray();
        this.components= new BigArray();
        this.templates= {};
        this.functions= {};
        this.functionParams= {};
        this.nSignals = 0;
        this.nComponents =0;
        this.names = new TableName(this);
        this.main=false;
        this.error = null;
        this.warnings = [];

        const oneIdx = this.addSignal("one");
        this.signals[oneIdx] = {
            v: this.F.one,
            o: this.ONE,
            e: -1,
        };

        this.uniqueNames = {};
    }

    addSignal(name, sizes) {
        if (this.currentComponent>=0) {
            return this.components[this.currentComponent].names.addSignal(name, sizes);
        } else {
            return this.names.addSignal(name, sizes);
        }
    }

    addComponent(name, sizes) {
        if (this.currentComponent>=0) {
            return this.components[this.currentComponent].names.addComponent(name, sizes);
        } else {
            return this.names.addComponent(name, sizes);
        }
    }

    getSignalIdx(name, sels) {
        if (this.currentComponent>=0) {
            return this.components[this.currentComponent].names.getSignalIdx(name, sels);
        } else {
            return this.names.getSignalIdx(name, sels);
        }
    }

    getComponentIdx(name, sels) {
        if (this.currentComponent>=0) {
            return this.components[this.currentComponent].names.getComponentIdx(name, sels);
        } else {
            return this.names.getComponentIdx(name, sels);
        }
    }

    getSizes(name) {
        if (this.currentComponent>=0) {
            return this.components[this.currentComponent].names.getSizes(name);
        } else {
            return this.names.getSizes(name);
        }
    }

    newTableName() {
        return new TableName(this);
    }

    _buildErr(ast, errStr) {
        if (typeof ast == "string") {
            ast = null;
            errStr = ast;
        }
        if (ast) {
            return {
                pos:   {
                    first_line: ast.first_line,
                    first_column: ast.first_column,
                    last_line: ast.last_line,
                    last_column: ast.last_column
                },
                errStr: errStr,
                ast: ast,
                message: errStr,
                errFile: this.fileName
            };
        } else {
            return {
                errStr: errStr,
                message: errStr
            };
        }
    }

    throwError(ast, errStr) {
        const err = this._buildErr(ast, errStr);
        this.error = err;
    }

    logWarning(ast, errStr) {
        const w = this._buildErr(ast, errStr);
        this.warnings.push(w);
    }

    getUniqueName(suggestedName) {
        if (!suggestedName) {
            suggestedName = "_tmp";
        }

        if (typeof(this.uniqueNames[suggestedName]) == "undefined") {
            this.uniqueNames[suggestedName] = 1;
            return suggestedName;
        } else {
            const name = suggestedName + "_" + this.uniqueNames[suggestedName];
            this.uniqueNames[suggestedName]++;
            return name;
        }
    }

};
