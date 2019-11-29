#ifndef CIRCOM_CALCWIT_H
#define CIRCOM_CALCWIT_H

#include "circom.h"
#include "zqfield.h"

class Circom_CalcWit {

#ifdef SANITY_CHECK
    bool *signalAssigned;
#endif

    // componentStatus -> For each component
    // >0 Signals required to trigger
    // == 0 Component triggered
    int *inputSignalsToTrigger;

    BigInt *signalValues;

    Circom_Circuit *circuit;

    void triggerComponent(int newCIdx);
    void calculateWitness(void *input, void *output);


public:
    ZqField *field;
    int cIdx;
// Functions called by the circuit
    Circom_CalcWit(Circom_Circuit *aCircuit);
    ~Circom_CalcWit();

    int getSubComponentOffset(int cIdx, u64 hash);
    Circom_Sizes getSubComponentSizes(int cIdx, u64 hash);
    int getSignalOffset(int cIdx, u64 hash);
    Circom_Sizes getSignalSizes(int cIdx, u64 hash);

    PBigInt allocBigInts(int n);
    void freeBigInts(PBigInt bi, int n);

    void getSignal(int cIdx, int sIdx, PBigInt value);
    void setSignal(int cIdx, int sIdx, PBigInt value);

    void checkConstraint(PBigInt value1, PBigInt value2, char const *err);


// Public functions
    inline void setInput(int idx, PBigInt val) {
        setSignal(0, circuit->wit2sig[idx], val);
    }
    inline void getWitness(int idx, PBigInt val) {
        mpz_set(*val, signalValues[circuit->wit2sig[idx]]);
    }

    void reset();

};



#endif // CIRCOM_CALCWIT_H
