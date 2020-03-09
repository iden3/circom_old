#ifndef __CIRCOM_H
#define __CIRCOM_H

#include <gmp.h>
#include <stdint.h>
#include "fr.h"

class Circom_CalcWit;
typedef unsigned long long u64;
typedef uint32_t u32;
typedef uint8_t u8;

typedef int Circom_Size;
typedef Circom_Size *Circom_Sizes;

struct Circom_HashEntry {
    u64 hash;
    int pos;
};
typedef Circom_HashEntry *Circom_HashTable;

typedef enum  { _typeSignal, _typeComponent} Circom_EntryType;

struct Circom_ComponentEntry {
    int offset;
    Circom_Sizes sizes;
    Circom_EntryType type;
};
typedef Circom_ComponentEntry *Circom_ComponentEntries;

typedef void (*Circom_ComponentFunction)(Circom_CalcWit *ctx, int __cIdx);

struct Circom_Component {
    Circom_HashTable hashTable;
    Circom_ComponentEntries entries;
    Circom_ComponentFunction fn;
    int inputSignals;
    bool newThread;
};

class Circom_Circuit {
public:
    int NSignals;
    int NComponents;
    int NInputs;
    int NOutputs;
    int NVars;
    int *wit2sig;
    Circom_Component *components;
    u32 *mapIsInput;
    PFrElement constants;
    const char *P;
};

#define BITMAP_ISSET(m, b) (m[b>>5] & (1 << (b&0x1F)))
extern struct Circom_Circuit _circuit;

#endif
