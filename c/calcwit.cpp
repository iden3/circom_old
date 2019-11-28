#include <string>
#include <stdexcept>
#include <sstream>
#include <iostream>
#include <iomanip>
#include <stdlib.h>
#include <gmp.h>
#include "calcwit.h"
#include "utils.h"

Circom_CalcWit::Circom_CalcWit(Circom_Circuit *aCircuit) {
    circuit = aCircuit;

#ifdef SANITY_CHECK
    signalAssigned = new bool[circuit->NSignals];
    signalAssigned[0] = true;
#endif

    inputSignalsToTrigger = new int[circuit->NComponents];
    signalValues = new BigInt[circuit->NSignals];

    // Set one signal
    mpz_init_set_ui(signalValues[0], 1);

    // Initialize remaining signals
    for (int i=1; i<circuit->NSignals; i++) mpz_init2(signalValues[i], 256);

    BigInt p;
    mpz_init_set_str(p, circuit->P, 10);
    field = new ZqField(&p);
    mpz_clear(p);

    reset();
}

void Circom_CalcWit::reset() {

#ifdef SANITY_CHECK
    for (int i=1; i<circuit->NComponents; i++) signalAssigned[i] = false;
#endif

    for (int i=0; i<circuit->NComponents; i++) {
        inputSignalsToTrigger[i] = circuit->components[i].inputSignals;
        if (inputSignalsToTrigger[i] == 0) triggerComponent(i);
    }
}


Circom_CalcWit::~Circom_CalcWit() {
    delete field;

#ifdef SANITY_CHECK
    delete signalAssigned;
#endif

    for (int i=0; i<circuit->NSignals; i++) mpz_clear(signalValues[i]);

    delete[] signalValues;
    delete inputSignalsToTrigger;

}

int Circom_CalcWit::getSubComponentOffset(int cIdx, u64 hash) {
    int hIdx;
    for(hIdx = int(hash & 0xFF); hash!=circuit->components[cIdx].hashTable[hIdx].hash; hIdx++) {
        if (!circuit->components[cIdx].hashTable[hIdx].hash) throw std::runtime_error("hash not found: " + int_to_hex(hash));
    }
    int entryPos = circuit->components[cIdx].hashTable[hIdx].pos;
    if (circuit->components[cIdx].entries[entryPos].type != _typeComponent) {
        throw std::runtime_error("invalid type");
    }
    return circuit->components[cIdx].entries[entryPos].offset;
}


Circom_Sizes Circom_CalcWit::getSubComponentSizes(int cIdx, u64 hash) {
    int hIdx;
    for(hIdx = int(hash & 0xFF); hash!=circuit->components[cIdx].hashTable[hIdx].hash; hIdx++) {
        if (!circuit->components[cIdx].hashTable[hIdx].hash) throw std::runtime_error("hash not found: " + int_to_hex(hash));
    }
    int entryPos = circuit->components[cIdx].hashTable[hIdx].pos;
    if (circuit->components[cIdx].entries[entryPos].type != _typeComponent) {
        throw std::runtime_error("invalid type");
    }
    return circuit->components[cIdx].entries[entryPos].sizes;
}

int Circom_CalcWit::getSignalOffset(int cIdx, u64 hash) {
    int hIdx;
    for(hIdx = int(hash & 0xFF); hash!=circuit->components[cIdx].hashTable[hIdx].hash; hIdx++) {
        if (!circuit->components[cIdx].hashTable[hIdx].hash) throw std::runtime_error("hash not found: " + int_to_hex(hash));
    }
    int entryPos = circuit->components[cIdx].hashTable[hIdx].pos;
    if (circuit->components[cIdx].entries[entryPos].type != _typeSignal) {
        throw std::runtime_error("invalid type");
    }
    return circuit->components[cIdx].entries[entryPos].offset;
}

Circom_Sizes Circom_CalcWit::getSignalSizes(int cIdx, u64 hash) {
    int hIdx;
    for(hIdx = int(hash & 0xFF); hash!=circuit->components[cIdx].hashTable[hIdx].hash; hIdx++) {
        if (!circuit->components[cIdx].hashTable[hIdx].hash) throw std::runtime_error("hash not found: " + int_to_hex(hash));
    }
    int entryPos = circuit->components[cIdx].hashTable[hIdx].pos;
    if (circuit->components[cIdx].entries[entryPos].type != _typeSignal) {
        throw std::runtime_error("invalid type");
    }
    return circuit->components[cIdx].entries[entryPos].sizes;
}

PBigInt Circom_CalcWit::allocBigInts(Circom_Sizes sizes) {
    PBigInt res = new BigInt[sizes[0]];
    for (int i=0; i<sizes[0]; i++) mpz_init2(res[i], 256);
    return res;
}

void Circom_CalcWit::freeBigInts(PBigInt bi, Circom_Sizes sizes) {
    for (int i=0; i<sizes[0]; i++) mpz_clear(bi[i]);
    delete[] bi;
}

void Circom_CalcWit::getSignal(int cIdx, int sIdx, PBigInt value) {
    mpz_set(*value, signalValues[sIdx]);
}

void Circom_CalcWit::setSignal(int cIdx, int sIdx, PBigInt value) {
#ifdef SANITY_CHECK
    assert(signalAssigned[sIdx] == false);
    signalAssigned[sIdx] = true;
#endif
    mpz_set(signalValues[sIdx], *value);
    if ( BITMAP_ISSET(circuit->mapIsInput, sIdx) ) {
        inputSignalsToTrigger[cIdx]--;
        if (inputSignalsToTrigger[cIdx] == 0) triggerComponent(cIdx);
    }

}

void Circom_CalcWit::checkConstraint(PBigInt value1, PBigInt value2, char const *err) {
#ifdef SANITY_CHECK
    if (mpz_cmp(*value1, *value2) != 0) {
        char *pcV1 = mpz_get_str(0, 10, *value1);
        char *pcV2 = mpz_get_str(0, 10, *value1);
        std::string sV1 = std::string(pcV1);
        std::string sV2 = std::string(pcV2);
        free(pcV1);
        free(pcV2);
        throw std::runtime_error(std::string("Constraint does not match,") + err + ". " + sV1 + " != " + sV2 );
    }
#endif
}


void Circom_CalcWit::triggerComponent(int newCIdx) {
    int oldCIdx = cIdx;
    cIdx = newCIdx;
    (*(circuit->components[newCIdx].fn))(this);
    cIdx = oldCIdx;
}

