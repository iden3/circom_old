# Binary format for R1CS

---
eip:
title: r1cs binary format
author:  Jordi Baylina <jordi@baylina.cat>
discussions-to:
status: draft
type: Standards Track
category: ERC
created: 2019-09-24
requires:
---

## Simple Summary

This standard defines a standard format for a binery representation of a r1cs constraint system.

## Abstract


## Motivation

The zero knowledge primitives, requires the definition of a statment that wants to be proved. This statment can be expressed as a deterministric program or an algebraic circuit. Lots of primitives like zkSnarks, bulletProofs or aurora, requires to convert this statment to a rank-one constraint system.

This standard specifies a format for a r1cs and allows the to connect a set of tools that compiles a program or a circuit to r1cs that can be used for the zksnarks or bulletproofs primitives.

## Specification

### General considerations

All integers are represented in Little Endian Fix size format

The standard extension is `.r1cs`

The constraint is in the form

$$
\left\{  \begin{array}{rclclcl}
(a_{0,0}s_0 + a_{0,1}s_1 + ... + a_{0,n-1}s_{n-1}) &\cdot& (b_{0,0} s_0 + b_{0,1} s_1 + ... + b_{0,n-1} s_{n-1}) &-& (c_{0,0} s_0 + c_{0,1} s_1 + ... + c_{0,n-1}s_{n-1}) &=& 0 \\
(a_{1,0}s_0 + a_{1,1}s_1 + ... + a_{1,n-1}s_{n-1}) &\cdot& (b_{1,0} s_0 + b_{1,1} s_1 + ... + b_{1,n-1} s_{n-1}) &-& (c_{1,0} s_0 + c_{1,1}s_1 + ... + c_{1,n-1}s_{n-1}) &=& 0 \\
...\\
(a_{m-1,0}s_0 + a_{m-1,1}s_1 + ... + a_{m-1,n-1}s_{n-1}) &\cdot& (b_{m-1,0} s_0 + b_{m-1,1} s_1 + ... + b_{m-1,n-1} s_{n-1}) &-& (c_{m-1,0} s_0 + c_{m-1,1}s_1 + ... + c_{m-1,n-1}s_{n-1}) &=& 0
 \end{array} \right.
$$


### Format

````

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │   72 31 63 73   ┃     Magic  "r1cs"
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │   01 00 00 00   ┃       Version 1
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │       nW        ┃
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ nW │   01 00 00 00   ┃        nWires
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ nW │   01 00 00 00   ┃        nPubOut
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ nW │   01 00 00 00   ┃        nPubIn
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ nW │   01 00 00 00   ┃        nPrvIn
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ nW │m := NConstraints┃
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                     ╲
     ┃ nW │       nA        ┃                                      ╲
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓        ╲
     ┃ nW │     idx_1       ┃  V  │     a_{0,idx_1}        ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ nW │     idx_2       ┃  V  │     a_{0,idx_2}        ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nA      ┃  V  │     a_{0,idx_nA}       ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ nW │       nB        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_1       ┃  V  │     b_{0,idx_1}        ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         ╲
     ┃ nW │     idx_2       ┃  V  │     b_{0,idx_2}        ┃          ╲
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛          ╱  Constraint_0
                ...                          ...                     ╱
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nB      ┃  V  │     b_{0,idx_nB}       ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ nW │       nC        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_1       ┃  V  │     c_{0,idx_1}        ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ nW │     idx_2       ┃  V  │     c_{0,idx_2}        ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nB      ┃  V  │     c_{0,idx_nC}       ┃        ╱
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛       ╱
                                                                  ╱


     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                     ╲
     ┃ nW │       nA        ┃                                      ╲
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓        ╲
     ┃ nW │     idx_1       ┃  V  │     a_{1,idx_1}        ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ nW │     idx_2       ┃  V  │     a_{1,idx_2}        ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nA      ┃  V  │     a_{1,idx_nA}       ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ nW │       nB        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_1       ┃  V  │     b_{1,idx_1}        ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         ╲
     ┃ nW │     idx_2       ┃  V  │     b_{1,idx_2}        ┃          ╲
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛          ╱  Constraint_1
                ...                          ...                     ╱
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nB      ┃  V  │     b_{1,idx_nB}       ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ nW │       nC        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_1       ┃  V  │     c_{1,idx_1}        ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ nW │     idx_2       ┃  V  │     c_{1,idx_2}        ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nB      ┃  V  │     c_{1,idx_nC}       ┃        ╱
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛       ╱
                                                                  ╱

                         ...
                         ...
                         ...

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                     ╲
     ┃ nW │       nA        ┃                                      ╲
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓        ╲
     ┃ nW │     idx_1       ┃  V  │    a_{m-1,idx_1}       ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ nW │     idx_2       ┃  V  │    a_{m-1,idx_2}       ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nA      ┃  V  │    a_{m-1,idx_nA}      ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ nW │       nB        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_1       ┃  V  │    b_{m-1,idx_1}       ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         ╲
     ┃ nW │     idx_2       ┃  V  │    b_{m-1,idx_2}       ┃          ╲
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛          ╱  Constraint_{m-1}
                ...                          ...                     ╱
     ┏━━━━━━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW       idx_nB      ┃  V  │    b_{m-1,idx_nB}      ┃         │
     ┗━━━━━━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ nW │       nC        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_1       ┃  V  │    c_{m-1,idx_1}       ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ nW │     idx_2       ┃  V  │    c_{m-1,idx_2}       ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ nW │     idx_nB      ┃  V  │    c_{m-1,idx_nC}      ┃        ╱
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛       ╱
                                                                  ╱                                                                  ╱
````


### Magic Number

Size: 4 bytes
The file start with a constant 4 byts (magic number) "r1cs"

```
0x72 0x31 0x63 0x73
```

### Version

Size: 4 bytes
Format: Little-Endian

For this standard it's fixed to

```
0x01 0x00 0x00 0x00
```

### Word With (nW)

Size: 4 bytes
Format: Little-Endian

This is the standard word size in bytes used to specify lenghts and indexes in the file.

The format of this field is little endian.

In most of the cases this will be 4 (32bit values)

Example:
```
0x04 0x00 0x00 0x00
```

### Number of wires

Size: nW bytes
Format: Little-Endian

Total Number of wires including ONE signal (Index 0).

### Number of public outputs

Size: nW bytes
Format: Little-Endian

Total Number of wires public output wires. They should be starting at idx 1

### Number of public inputs

Size: nW bytes
Format: Little-Endian

Total Number of wires public input wires. They should be starting just after the public output

### Number of private inputs

Size: nW bytes
Format: Little-Endian

Total Number of wires private input wires. They should be starting just after the public inputs

### Number of constraints

Size: nW bytes
Format: Little-Endian

Total Number of constraints

### Constraints

Each constraint contains 3 linear combinations A, B, C.

The constraint is such that:
```
A*B-C = 0
```

### Linear combination

Each linear combination is of the form:

$$
a_{0,0}s_0 + a_{0,1}s_1 + ... + a_{0,n-1}s_{n-1}
$$

### Number of nonZero Factors

Size: nW bytes
Format: Little-Endian

Total number of non Zero factors in the linear compination.

The factors MUST be sorted in ascending order.

### Factor

For each factor we have the index of the factor and the value of the factor.

### Index of the factor


Size: nW bytes
Format: Little-Endian

Index of the nonZero Factor

### Value of the factor

The first byte indicate the length N in bytes of the number in the upcoming bytes.

The next N bytes represent the value in Little Endian format.

For example, to represent the linear combination:

$$
5s_4 +8s_5 + 260s_886
$$

The linear combination would be represented as:

````
    ┏━━━━━━━━━━━━━━━━━┓
    ┃   03 00 00 00   ┃
    ┣━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━┓
    ┃   04 00 00 00   ┃      01 05      ┃
    ┣━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━┫
    ┃   05 00 00 00   ┃      01 08      ┃
    ┣━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━┫
    ┃   76 03 00 00   ┃    02 04 01     ┃
    ┗━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━┛
````
## Rationale

Variable size for field elements allows to shrink the size of the file and allows to work with any field.

Version allows to update the format.

Have a very good comprasion ratio for sparse r1cs as it's the normal case.


## Backward Compatibility

N.A.

## Test Cases
### Example

Given this r1cs in a 256 bit Field:


$$
\left\{  \begin{array}{rclclcl}
(3s_5 + 8s_6) &\cdot& (2s_0 + 20s_2 + 12s_3) &-& (5s_0 + 7s_9) &=& 0 \\
(4s_1 + 8s_5 + 3s_9) &\cdot& (6s_6 + 44s_3) &&  &=& 0 \\
(4s_6) &\cdot& (6s_0 + 5s_3 + 11s_9) &-& (600s_700) &=& 0
\end{array} \right.
$$

The format will be:

````

        ┏━━━━━━━━━━━━━━┓
        ┃ 72 31 63 77  ┃        Magic
        ┣━━━━━━━━━━━━━━┫
        ┃ 01 00 00 00  ┃       Version
        ┣━━━━━━━━━━━━━━┫
        ┃ 04 00 00 00  ┃          nW
        ┣━━━━━━━━━━━━━━┫
        ┃ 04 23 45 00  ┃      # of wires
        ┣━━━━━━━━━━━━━━┫
        ┃ 01 00 00 00  ┃    # Public Outs
        ┣━━━━━━━━━━━━━━┫
        ┃ 02 00 00 00  ┃     # Public Ins
        ┣━━━━━━━━━━━━━━┫
        ┃ 05 00 00 00  ┃    # Private Ins
        ┗━━━━━━━━━━━━━━┛

        ┏━━━━━━━━━━━━━━┓
        ┃ 03 00 00 00  ┃   # of constraints
        ┗━━━━━━━━━━━━━━┛

        ┏━━━━━━━━━━━━━━┓   Constraint 0: (3s_5 + 8s_6) * (2s_0 + 20s_2 + 12s_3) - (5s_0 + 7s_9) = 0
        ┃ 02 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┓
        ┃ 05 00 00 00  ┃ 01 03  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┫
        ┃ 06 00 00 00  ┃ 01 08  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 03 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┓
        ┃ 00 00 00 00  ┃ 01 02  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┫
        ┃ 02 00 00 00  ┃ 01 14  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┫
        ┃ 03 00 00 00  ┃ 01 0C  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 02 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┓
        ┃ 00 00 00 00  ┃ 01 05  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━┫
        ┃ 09 00 00 00  ┃ 01 07  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━┛


        ┏━━━━━━━━━━━━━━┓   Constraint 1: (4s_1 + 8s_5 + 3s_9) * (6s_6 + 44s_3) = 0
        ┃ 03 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 01 00 00 00  ┃  01 04  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 05 00 00 00  ┃  01 08  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 09 00 00 00  ┃  01 03  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 02 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 03 00 00 00  ┃  01 2C  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 06 00 00 00  ┃  01 06  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 00 00 00 00  ┃
        ┗━━━━━━━━━━━━━━┛


        ┏━━━━━━━━━━━━━━┓   Constraint 2: (4s_6) * (6s_0 + 5s_3 + 11s_9) - (600s_700) = 0
        ┃ 01 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 06 00 00 00  ┃  01 04  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 03 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 00 00 00 00  ┃  01 06  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 03 00 00 00  ┃  01 05  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 09 00 00 00  ┃  01 0B  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 01 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━┓
        ┃ BC 02 00 00  ┃  02 58 02   ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┛
````

And the binary representation in Hex:

````
72 31 63 77
01 00 00 00
04 00 00 00
04 23 45 00
01 00 00 00
02 00 00 00
05 00 00 00
03 00 00 00
02 00 00 00
05 00 00 00 01 03
06 00 00 00 01 08
03 00 00 00
00 00 00 00 01 02
02 00 00 00 01 14
03 00 00 00 01 0C
02 00 00 00
00 00 00 00 01 05
09 00 00 00 01 07
03 00 00 00
01 00 00 00 01 04
05 00 00 00 01 08
09 00 00 00 01 03
02 00 00 00
03 00 00 00 01 2C
06 00 00 00 01 06
00 00 00 00
01 00 00 00
06 00 00 00 01 04
03 00 00 00
00 00 00 00 01 06
03 00 00 00 01 05
09 00 00 00 01 0B
01 00 00 00
BC 02 00 00 02 58 02
````

## Implementation

circom will output this format.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
