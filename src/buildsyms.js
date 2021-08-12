const Readable = require("stream").Readable;

module.exports = function buildSyms(ctx) {
    const  rs = Readable();

    let it = new ComponentIt(ctx, 0, "main");

    let counter = 0;

    rs._read = function() {
        const actual = it.current();
        if (actual == null ) {
            rs.push(null);
            return;
        }


        let s=actual.offset;
        while (ctx.signals[s].e >= 0) s = ctx.signals[s].e;
        let wId = ctx.signals[s].id;
        if (typeof(wId) == "undefined") wId=-1;
        const line = `${actual.offset},${wId},${actual.cIdx},${actual.name}\n`;
        if ((ctx.verbose)&&(counter%10000 == 0)) {
            console.log("Symbols saved: "+counter);
            setImmediate(function() {
                rs.push(line);
            });
        } else {
            rs.push(line);
        }
        it.next();
        counter ++;
    };

    return rs;
};



class SignalIt {
    constructor (ctx, offset, prefix, cIdx) {
        this.ctx = ctx;
        this.offset = offset;
        this.prefix = prefix;
        this.cur = 0;
        this.cIdx = cIdx;
    }

    next() {
        this.cur = 1;

        return this.current();
    }

    current() {
        if (this.cur == 0) {
            return {offset: this.offset, name: this.prefix, cIdx: this.cIdx};
        }
    }
}

class ArrayIt {
    constructor (ctx, type, sizes, offset, prefix, cIdx) {
        if (sizes.length == 0) {
            if (type == "S") {
                return new SignalIt(ctx, offset, prefix, cIdx);
            } else {
                return new ComponentIt(ctx, offset, prefix);
            }
        }

        this.ctx = ctx;
        this.type = type;
        this.sizes = sizes;
        this.offset = offset;
        this.prefix = prefix;
        this.cIdx = cIdx;



        this.subIt = null;
        this.cur = 0;

        this.subArrSize = 1;

        for (let i=1; i<sizes.length; i++) {
            this.subArrSize *= sizes[i];
        }

        this._loadSubIt();


    }

    _loadSubIt() {
        if (this.cur < this.sizes[0]) {
            this.subIt = new ArrayIt(this.ctx, this.type, this.sizes.slice(1), this.offset + this.cur*this.subArrSize, this.prefix + "[" + this.cur + "]", this.cIdx);
        }
    }

    next() {
        if (this.subIt) {
            const res = this.subIt.next();
            if (res == null) {
                this.subIt = null;
                this.cur++;
                this._loadSubIt();
            }
        }

        return this.current();

    }

    current() {
        if (this.subIt) {
            return this.subIt.current();
        } else {
            return null;
        }
    }
}

class ComponentIt {
    constructor (ctx, idxComponent, prefix) {
        this.ctx = ctx;
        this.idxComponent = idxComponent;
        this.prefix = prefix;
        this.names = Object.keys(ctx.components[idxComponent].names.o);

        this.subIt = null;
        this.cur = 0;
        this._loadSubIt();

    }

    _loadSubIt() {
        if (this.cur < this.names.length) {
            const entrie = this.ctx.components[this.idxComponent].names.o[this.names[this.cur]];
            this.subIt = new ArrayIt(this.ctx, entrie.type, entrie.sizes, entrie.offset, this.prefix + "." + this.names[this.cur], this.idxComponent);
        }
    }

    next() {
        if (this.subIt) {
            const res = this.subIt.next();
            if (res == null) {
                this.subIt = null;
                this.cur++;
                this._loadSubIt();
            }
        }

        return this.current();
    }

    current() {
        if (this.subIt) {
            return this.subIt.current();
        } else {
            return null;
        }
    }
}
