const errs = require("./errs");


const buildWasmFf = require("fflib").buildWasmFf;


module.exports = function buildRuntime(module, builder) {

    function buildInit() {
        const f = module.addFunction("init");
        f.addLocal("i", "i32");

        const c = f.getCodeBuilder();

        // Set the stack to current memory
        f.addCode(
            c.i32_store(
                c.i32_const(4),
                c.i32_shl(
                    c.i32_and(
                        c.current_memory(),
                        c.i32_const(0xFFFFFFF8)
                    ),
                    c.i32_const(16)
                )
            )
        );

        f.addCode(
            // i=0
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
                // if (i==NComponents) break
                c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(builder.header.NComponents))),

                // inputSignalsToTrigger[i] = components[i].nInputSignals
                c.i32_store(
                    c.i32_add(
                        c.i32_const(builder.pInputSignalsToTrigger),
                        c.i32_mul(
                            c.getLocal("i"),
                            c.i32_const(4)
                        )
                    ),
                    c.i32_load(
                        c.i32_add(
                            c.i32_load(c.i32_const(builder.ppComponents)),
                            c.i32_mul(
                                c.getLocal("i"),
                                c.i32_const(builder.sizeofComponent)     // Sizeof component
                            )
                        ),
                        builder.offsetComponentNInputSignals
                    )
                ),

                // i=i+1
                c.setLocal(
                    "i",
                    c.i32_add(
                        c.getLocal("i"),
                        c.i32_const(1)
                    )
                ),
                c.br(0)
            ))
        );

        if (builder.sanityCheck) {
            f.addCode(
                // i=0
                c.setLocal("i", c.i32_const(0)),
                c.block(c.loop(
                    // if (i==NSignals) break
                    c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(builder.header.NSignals))),

                    // signalsAssigned[i] = false
                    c.i32_store(
                        c.i32_add(
                            c.i32_const(builder.pSignalsAssigned),
                            c.i32_mul(
                                c.getLocal("i"),
                                c.i32_const(4)
                            )
                        ),
                        c.i32_const(0)
                    ),

                    // i=i+1
                    c.setLocal(
                        "i",
                        c.i32_add(
                            c.getLocal("i"),
                            c.i32_const(1)
                        )
                    ),
                    c.br(0)
                ))
            );
        }

        f.addCode(
            c.call(
                "Fr_copy",
                c.i32_const(builder.pSignals),
                c.i32_add(
                    c.i32_load(c.i32_const(builder.ppConstants)),
                    c.i32_const(builder.addConstant(1) * builder.sizeFr)
                )
            )
        );
        if (builder.sanityCheck) {
            f.addCode(
                c.i32_store(
                    c.i32_const(builder.pSignalsAssigned),
                    c.i32_const(1)
                )
            );
        }

        f.addCode(
            // i=0
            c.setLocal("i", c.i32_const(0)),
            c.block(c.loop(
                // if (i==NComponents) break
                c.br_if(1, c.i32_eq(c.getLocal("i"), c.i32_const(builder.header.NComponents))),

                // if (inputSignalsToTrigger[i] == 0) triggerComponent(i)
                c.if(
                    c.i32_eqz(
                        c.i32_load(
                            c.i32_add(
                                c.i32_const(builder.pInputSignalsToTrigger),
                                c.i32_mul(
                                    c.getLocal("i"),
                                    c.i32_const(4)
                                )
                            )
                        )
                    ),
                    c.call(
                        "triggerComponent",
                        c.getLocal("i")
                    )
                ),

                // i=i+1
                c.setLocal(
                    "i",
                    c.i32_add(
                        c.getLocal("i"),
                        c.i32_const(1)
                    )
                ),
                c.br(0)
            ))
        );

    }


    function buildTriggerComponent() {
        const f = module.addFunction("triggerComponent");
        f.addParam("component", "i32");

        const c = f.getCodeBuilder();

        f.addCode(
            c.call_indirect(
                c.getLocal("component"),        // Idx in table
                c.getLocal("component")         // Parameter
            )
        );

    }


    function buildHash2ComponentEntry() {
        const f = module.addFunction("hash2ComponentEntry");
        f.addParam("component", "i32");
        f.addParam("hash", "i64");
        f.setReturnType("i32");

        f.addLocal("pComponent", "i32");
        f.addLocal("pHashTable", "i32");
        f.addLocal("hIdx", "i32");
        f.addLocal("h", "i64");

        const c = f.getCodeBuilder();

        f.addCode(
            c.setLocal(
                "pComponent",
                c.i32_add(
                    c.i32_load(c.i32_const(builder.ppComponents)), // pComponents
                    c.i32_mul(
                        c.getLocal("component"),
                        c.i32_const(20)         // sizeof(Component)
                    )
                )
            ),
            c.setLocal(
                "pHashTable",
                c.i32_load(c.getLocal("pComponent"))
            ),
            c.setLocal(
                "hIdx",
                c.i32_and(
                    c.i32_wrap_i64(c.getLocal("hash")),
                    c.i32_const(0xFF)
                )
            ),
            c.block(c.loop(
                c.setLocal(
                    "h",
                    c.i64_load(
                        c.i32_add(
                            c.getLocal("pHashTable"),
                            c.i32_mul(
                                c.getLocal("hIdx"),
                                c.i32_const(12)
                            )
                        )
                    )
                ),
                c.br_if(1, c.i64_eq(c.getLocal("h"), c.getLocal("hash"))),
                c.if(
                    c.i64_eqz(c.getLocal("h")),
                    c.call(
                        "err",
                        c.i32_const(errs.HASH_NOT_FOUND.code),
                        c.i32_const(errs.HASH_NOT_FOUND.pointer)
                    )
                ),
                c.setLocal(
                    "hIdx",
                    c.i32_and(
                        c.i32_add(
                            c.getLocal("hIdx"),
                            c.i32_const(1)
                        ),
                        c.i32_const(0xFF)
                    )
                ),
                c.br(0)
            )),

            c.i32_add(                          // pComponentEntry
                c.i32_load(                     // pComponentEntryTable
                    c.i32_add(
                        c.getLocal("pComponent"),
                        c.i32_const(4)
                    )
                ),
                c.i32_mul(
                    c.i32_load(                 // idx to the componentEntry
                        c.i32_add(
                            c.getLocal("pHashTable"),
                            c.i32_mul(
                                c.getLocal("hIdx"),
                                c.i32_const(12)
                            )
                        ),
                        8
                    ),
                    c.i32_const(12)
                )
            )
        );
    }

    function buildGetFromComponentEntry(fnName, offset, type) {
        const f = module.addFunction(fnName);
        f.addParam("pR", "i32");
        f.addParam("component", "i32");
        f.addParam("hash", "i64");
        f.addLocal("pComponentEntry", "i32");

        const c = f.getCodeBuilder();

        f.addCode(
            c.setLocal(
                "pComponentEntry",
                c.call(
                    "hash2ComponentEntry",
                    c.getLocal("component"),
                    c.getLocal("hash")
                )
            ),
            c.if(                       // If type is not signal
                c.i32_ne(
                    c.i32_load(
                        c.getLocal("pComponentEntry"),
                        8               // type offset
                    ),
                    c.i32_const(type)
                ),
                c.call(
                    "err",
                    c.i32_const(errs.INVALID_TYPE.code),
                    c.i32_const(errs.INVALID_TYPE.pointer)
                )
            ),
            c.i32_store(
                c.getLocal("pR"),
                c.i32_load(
                    c.getLocal("pComponentEntry"),
                    offset
                )
            )
        );

        const f2 = module.addFunction(fnName + "32");
        f2.addParam("pR", "i32");
        f2.addParam("component", "i32");
        f2.addParam("hashMSB", "i32");
        f2.addParam("hashLSB", "i32");

        const c2 = f2.getCodeBuilder();

        f2.addCode(
            c2.call(
                fnName,
                c2.getLocal("pR"),
                c2.getLocal("component"),
                c2.i64_or(
                    c2.i64_shl(
                        c2.i64_extend_i32_u(c2.getLocal("hashMSB")),
                        c2.i64_const(32)
                    ),
                    c2.i64_extend_i32_u(c2.getLocal("hashLSB"))
                )
            )
        );

    }


    function buildGetSignal() {
        const f = module.addFunction("getSignal");
        f.addParam("cIdx", "i32");
        f.addParam("pR", "i32");
        f.addParam("component", "i32");
        f.addParam("signal", "i32");

        const c = f.getCodeBuilder();

        if (builder.sanityCheck) {
            f.addCode(
                c.if(
                    c.i32_eqz(
                        c.i32_load(
                            c.i32_add(
                                c.i32_const(builder.pSignalsAssigned),
                                c.i32_mul(
                                    c.getLocal("signal"),
                                    c.i32_const(4)
                                )
                            ),
                        )
                    ),
                    c.call(
                        "err",
                        c.i32_const(errs.ACCESSING_NOT_ASSIGNED_SIGNAL.code),
                        c.i32_const(errs.ACCESSING_NOT_ASSIGNED_SIGNAL.pointer)
                    )
                )
            );
        }

        f.addCode(
            c.call(
                "Fr_copy",
                c.getLocal("pR"),
                c.i32_add(
                    c.i32_const(builder.pSignals),
                    c.i32_mul(
                        c.getLocal("signal"),
                        c.i32_const(builder.sizeFr)
                    )
                )
            )
        );
    }


    function buildSetSignal() {
        const f = module.addFunction("setSignal");
        f.addParam("cIdx", "i32");
        f.addParam("component", "i32");
        f.addParam("signal", "i32");
        f.addParam("pVal", "i32");
        f.addLocal("signalsToTrigger", "i32");

        const c = f.getCodeBuilder();


        if (builder.sanityCheck) {
            f.addCode(
                c.if(
                    c.i32_load(
                        c.i32_add(
                            c.i32_const(builder.pSignalsAssigned),
                            c.i32_mul(
                                c.getLocal("signal"),
                                c.i32_const(4)
                            )
                        ),
                    ),
                    c.call(
                        "err",
                        c.i32_const(errs.SIGNAL_ASSIGNED_TWICE.code),
                        c.i32_const(errs.SIGNAL_ASSIGNED_TWICE.pointer)
                    )
                ),
                c.i32_store(
                    c.i32_add(
                        c.i32_const(builder.pSignalsAssigned),
                        c.i32_mul(
                            c.getLocal("signal"),
                            c.i32_const(4)
                        )
                    ),
                    c.i32_const(1)
                ),
            );
        }

        f.addCode(
            c.call(
                "Fr_copy",
                c.i32_add(
                    c.i32_const(builder.pSignals),
                    c.i32_mul(
                        c.getLocal("signal"),
                        c.i32_const(builder.sizeFr)
                    )
                ),
                c.getLocal("pVal"),
            )
        );

        f.addCode(
            c.if(   // If ( mapIsInput[s >> 5] & 1 << (s & 0x1f) )
                c.i32_and(
                    c.i32_load(
                        c.i32_add(
                            c.i32_load(c.i32_const(builder.ppMapIsInput)),
                            c.i32_shl(
                                c.i32_shr_u(
                                    c.getLocal("signal"),
                                    c.i32_const(5)
                                ),
                                c.i32_const(2)
                            )
                        )
                    ),
                    c.i32_shl(
                        c.i32_const(1),
                        c.i32_and(
                            c.getLocal("signal"),
                            c.i32_const(0x1F)
                        )
                    )
                ),
                [

                    ...c.setLocal(
                        "signalsToTrigger",
                        c.i32_load(
                            c.i32_add(
                                c.i32_const(builder.pInputSignalsToTrigger),
                                c.i32_mul(
                                    c.getLocal("component"),
                                    c.i32_const(4)
                                )
                            )
                        )
                    ),

                    ...c.if(       // if (signalsToTrigger > 0)
                        c.i32_gt_u(
                            c.getLocal("signalsToTrigger"),
                            c.i32_const(0)
                        ),
                        [
                            ...c.setLocal( // signalsToTrigger--
                                "signalsToTrigger",
                                c.i32_sub(
                                    c.getLocal("signalsToTrigger"),
                                    c.i32_const(1)
                                )
                            ),
                            ...c.i32_store(
                                c.i32_add(
                                    c.i32_const(builder.pInputSignalsToTrigger),
                                    c.i32_mul(
                                        c.getLocal("component"),
                                        c.i32_const(4)
                                    )
                                ),
                                c.getLocal("signalsToTrigger"),
                            ),
                            ...c.if(    // if (signalsToTrigger==0) triggerCompomnent(component)
                                c.i32_eqz(c.getLocal("signalsToTrigger")),
                                c.call(
                                    "triggerComponent",
                                    c.getLocal("component")
                                )
                            )
                        ],
                        c.call(
                            "err2",
                            c.i32_const(errs.MAPISINPUT_DONT_MATCH.code),
                            c.i32_const(errs.MAPISINPUT_DONT_MATCH.pointer),
                            c.getLocal("component"),
                            c.getLocal("signal")
                        )
                    )
                ]
            )
        );
    }

    function buildComponentFinished() {
        const f = module.addFunction("componentFinished");
        f.addParam("cIdx", "i32");

        const c = f.getCodeBuilder();

        f.addCode(c.ret([]));
    }

    function buildCheckConstraint() {
        const pTmp = module.alloc(builder.sizeFr);
        const f = module.addFunction("checkConstraint");
        f.addParam("cIdx", "i32");
        f.addParam("pA", "i32");
        f.addParam("pB", "i32");
        f.addParam("pStr", "i32");

        const c = f.getCodeBuilder();

        if (builder.sanityCheck) {
            f.addCode(
                c.call(
                    "Fr_eq",
                    c.i32_const(pTmp),
                    c.getLocal("pA"),
                    c.getLocal("pB")
                ),
                c.if (
                    c.i32_eqz(
                        c.call(
                            "Fr_isTrue",
                            c.i32_const(pTmp),
                        )
                    ),
                    c.call(
                        "err4",
                        c.i32_const(errs.CONSTRAIN_DOES_NOT_MATCH.code),
                        c.i32_const(errs.CONSTRAIN_DOES_NOT_MATCH.pointer),
                        c.getLocal("cIdx"),
                        c.getLocal("pA"),
                        c.getLocal("pB"),
                        c.getLocal("pStr"),
                    )
                )
            );
        }
    }

    function buildGetNVars() {
        const f = module.addFunction("getNVars");
        f.setReturnType("i32");

        const c = f.getCodeBuilder();

        f.addCode(c.i32_const(builder.header.NVars));
    }

    function buildGetFrLen() {
        const f = module.addFunction("getFrLen");
        f.setReturnType("i32");

        const c = f.getCodeBuilder();

        f.addCode(
            c.i32_const(builder.sizeFr));
    }

    function buildGetPRawPrime() {
        const f = module.addFunction("getPRawPrime");
        f.setReturnType("i32");

        const c = f.getCodeBuilder();

        f.addCode(
            c.i32_const(module.modules["Fr_F1m"].pq));
    }

    function buildGetPWitness() {
        const f = module.addFunction("getPWitness");
        f.addParam("w", "i32");
        f.addLocal("signal", "i32");
        f.setReturnType("i32");

        const c = f.getCodeBuilder();


        f.addCode(
            c.setLocal(
                "signal",
                c.i32_load(  // wit2sig[w]
                    c.i32_add(
                        c.i32_load( c.i32_const(builder.ppWit2sig)),
                        c.i32_mul(
                            c.getLocal("w"),
                            c.i32_const(4)
                        )
                    )
                )
            )
        );

        if (builder.sanityCheck) {
            f.addCode(
                c.if(
                    c.i32_eqz(
                        c.i32_load(
                            c.i32_add(
                                c.i32_const(builder.pSignalsAssigned),
                                c.i32_mul(
                                    c.getLocal("signal"),
                                    c.i32_const(4)
                                )
                            ),
                        )
                    ),
                    c.call(
                        "err",
                        c.i32_const(errs.ACCESSING_NOT_ASSIGNED_SIGNAL.code),
                        c.i32_const(errs.ACCESSING_NOT_ASSIGNED_SIGNAL.pointer)
                    )
                )
            );
        }

        f.addCode(
            c.i32_add(
                c.i32_const(builder.pSignals),

                c.i32_mul(
                    c.getLocal("signal"),
                    c.i32_const(builder.sizeFr)
                )
            )
        );
    }

    const fErr = module.addIimportFunction("err", "runtime");
    fErr.addParam("code", "i32");
    fErr.addParam("pStr", "i32");

    const fErr1 = module.addIimportFunction("err1", "runtime");
    fErr1.addParam("code", "i32");
    fErr1.addParam("pStr", "i32");
    fErr1.addParam("param1", "i32");

    const fErr2 = module.addIimportFunction("err2", "runtime");
    fErr2.addParam("code", "i32");
    fErr2.addParam("pStr", "i32");
    fErr2.addParam("param1", "i32");
    fErr2.addParam("param2", "i32");

    const fErr3 = module.addIimportFunction("err3", "runtime");
    fErr3.addParam("code", "i32");
    fErr3.addParam("pStr", "i32");
    fErr3.addParam("param1", "i32");
    fErr3.addParam("param2", "i32");
    fErr3.addParam("param3", "i32");

    const fErr4 = module.addIimportFunction("err4", "runtime");
    fErr4.addParam("code", "i32");
    fErr4.addParam("pStr", "i32");
    fErr4.addParam("param1", "i32");
    fErr4.addParam("param2", "i32");
    fErr4.addParam("param3", "i32");
    fErr4.addParam("param4", "i32");

    const fLog = module.addIimportFunction("log", "runtime");
    fLog.addParam("code", "i32");

    buildWasmFf(module, "Fr", builder.header.P);

    builder.pSignals=module.alloc(builder.header.NSignals*builder.sizeFr);
    builder.pInputSignalsToTrigger=module.alloc(builder.header.NComponents*4);
    if (builder.sanityCheck) {
        builder.pSignalsAssigned=module.alloc(builder.header.NSignals*4);
    }

    buildHash2ComponentEntry();

    buildTriggerComponent();
    buildInit();

    buildGetFromComponentEntry("getSubComponentOffset", 0 /* offset */, builder.TYPE_COMPONENT);
    buildGetFromComponentEntry("getSubComponentSizes", 4 /* offset */, builder.TYPE_COMPONENT);

    buildGetFromComponentEntry("getSignalOffset", 0 /* offset */, builder.TYPE_SIGNAL);
    buildGetFromComponentEntry("getSignalSizes", 4 /* offset */, builder.TYPE_SIGNAL);

    buildGetSignal();
    buildSetSignal();

    buildComponentFinished();

    buildCheckConstraint();

    buildGetNVars();
    buildGetFrLen();
    buildGetPWitness();
    buildGetPRawPrime();

//    buildFrToInt();

    module.exportFunction("init");
    module.exportFunction("getNVars");
    module.exportFunction("getFrLen");
    module.exportFunction("getSignalOffset32");
    module.exportFunction("setSignal");
    module.exportFunction("getPWitness");
    module.exportFunction("Fr_toInt");
    module.exportFunction("getPRawPrime");

};
