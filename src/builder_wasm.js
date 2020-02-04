class BuilderWasm {
    constructor() {

    }

    setHeader(header) {
        this.header=header;
    }

    // ht is an array of 256 element that can be undefined or [Hash, Idx, KeyName] elements.
    addHashMap(name, ht) {
        this.hashTables[name] = ht;
    }

    addComponentEntriesTable(name, cet) {
        this.componentEntriesTables[name] = cet;
    }

    addSizes(name, accSizes) {
        this.sizes[name] = accSizes;
    }

    build() {

    }
}

module.exports = BuilderWasm;
