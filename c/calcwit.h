#ifndef CIRCOM_CALCWIT_H
#define CIRCOM_CALCWIT_H

#include "circom.h"
#include "zqfield.h"
#include <mutex>
#include <condition_variable>

#define NMUTEXES 128

class Circom_CalcWit {

#ifdef SANITY_CHECK
    bool *signalAssigned;
#endif

    // componentStatus -> For each component
    // >0 Signals required to trigger
    // == 0 Component triggered
    // == -1 Component finished
    int *inputSignalsToTrigger;
    std::mutex *mutexes;
    std::condition_variable *cvs;

    std::mutex printf_mutex;

    BigInt *signalValues;

    Circom_Circuit *circuit;

    void triggerComponent(int newCIdx);
    void calculateWitness(void *input, void *output);

    void syncPrintf(const char *format, ...);


public:
    ZqField *field;
// Functions called by the circuit
    Circom_CalcWit(Circom_Circuit *aCircuit);
    ~Circom_CalcWit();

    int getSubComponentOffset(int cIdx, u64 hash);
    Circom_Sizes getSubComponentSizes(int cIdx, u64 hash);
    int getSignalOffset(int cIdx, u64 hash);
    Circom_Sizes getSignalSizes(int cIdx, u64 hash);

    PBigInt allocBigInts(int n);
    void freeBigInts(PBigInt bi, int n);

    void getSignal(int currentComponentIdx, int cIdx, int sIdx, PBigInt value);
    void setSignal(int currentComponentIdx, int cIdx, int sIdx, PBigInt value);

    void checkConstraint(int currentComponentIdx, PBigInt value1, PBigInt value2, char const *err);

    void log(PBigInt value);

    void finished(int cIdx);
    void join();


// Public functions
    inline void setInput(int idx, PBigInt val) {
        setSignal(0, 0, circuit->wit2sig[idx], val);
    }
    inline void getWitness(int idx, PBigInt val) {
        mpz_set(*val, signalValues[circuit->wit2sig[idx]]);
    }

    void reset();

};



#endif // CIRCOM_CALCWIT_H
