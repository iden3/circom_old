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

The standard extension is `.r1cs`


A deterministic program (or circuit) is a program that generates a set of deterministic values given an input. All those values are labeled from l_{0} to l_{n_labels}

This file defines a map beween l_{i} -> w_{j}  and defines a series a R1CS of the form

$$
\left\{  \begin{array}{rclclcl}
(a_{0,0}w_0 + a_{0,1}w_1 + ... + a_{0,n}w_{n}) &\cdot& (b_{0,0} w_0 + b_{0,1} w_1 + ... + b_{0,n} w_{n}) &-& (c_{0,0} w_0 + c_{0,1} w_1 + ... + c_{0,n}w_{n}) &=& 0 \\
(a_{1,0}w_0 + a_{1,1}w_1 + ... + a_{1,n}w_{n}) &\cdot& (b_{1,0} w_0 + b_{1,1} w_1 + ... + b_{1,n} w_{n}) &-& (c_{1,0} w_0 + c_{1,1}w_1 + ... + c_{1,n}w_{n}) &=& 0 \\
...\\
(a_{m-1,0}w_0 + a_{m-1,1}w_1 + ... + a_{m-1,n}w_{n}) &\cdot& (b_{m-1,0} w_0 + b_{m-1,1} w_1 + ... + b_{m-1,n} w_{n}) &-& (c_{m-1,0} w_0 + c_{m-1,1}w_1 + ... + c_{m-1,n}w_{n}) &=& 0
 \end{array} \right.
$$

Wire 0 must be always mapped to label 0 and it's an input forced to value "1" implicitly


### Format of the file

````

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │   72 31 63 73   ┃     Magic  "r1cs"
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │   01 00 00 00   ┃       Version 1
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │   03 00 00 00   ┃       Number of Sections
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 4  │ sectionType     ┃  8  │   SectionSize          ┃
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛
     ┏━━━━━━━━━━━━━━━━━━━━━┓
     ┃                     ┃
     ┃                     ┃
     ┃                     ┃
     ┃  Section Content    ┃
     ┃                     ┃
     ┃                     ┃
     ┃                     ┃
     ┗━━━━━━━━━━━━━━━━━━━━━┛

     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 4  │ sectionType     ┃  8  │   SectionSize          ┃
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛
     ┏━━━━━━━━━━━━━━━━━━━━━┓
     ┃                     ┃
     ┃                     ┃
     ┃                     ┃
     ┃  Section Content    ┃
     ┃                     ┃
     ┃                     ┃
     ┃                     ┃
     ┗━━━━━━━━━━━━━━━━━━━━━┛

     ...
     ...
     ...
````

#### Magic Number

Size: 4 bytes
The file start with a constant 4 bytes (magic number) "r1cs"

```
0x72 0x31 0x63 0x73
```

#### Version

Size: 4 bytes
Format: Little-Endian

For this standard it's fixed to

```
0x01 0x00 0x00 0x00
```

#### Number of Sections

Size: 4 bytes
Format: Little-Endian

Number of sections contained in the file

#### SectionType

Size: 4 bytes
Format: Little-Endian

Type of the section.

Currently there are 3 types of sections defined:

* 0x00000001 : Header Section
* 0x00000002 : Constraint Section
* 0x00000003 : Wire2LabelId Map Section

If the file contain other types, the format is valid, but they MUST be ignored.

Any order of the section must be accepted.

Example:
```
0x01 0x00 0x00 0x00
```

#### SectionSize

Size: `ws` bytes
Format: Little-Endian

Size in bytes of the section

### Header Section

Section Type: 0x01
````
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
     ┃ 4  │  FieldDefSize   ┃  FieldDef                    ┃      field Id
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │   00 00 00 00   ┃        bigInt Format
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ 4  │       is        ┃     Id size ( Normally 4 (32bits))
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ is │   01 00 00 00   ┃        nWires
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ is │   01 00 00 00   ┃        nPubOut
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ is │   01 00 00 00   ┃        nPubIn
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ is │   01 00 00 00   ┃        nPrvIn
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ is │   01 00 00 00   ┃        nLabels
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓
     ┃ is │   01 00 00 00   ┃        mConstraints
     ┗━━━━┻━━━━━━━━━━━━━━━━━┛


````

#### fieldDefSize

Size: 4 bytes
Format: Little-Endian

Size of the field Definition

Example:
```
0x00 0x0 0x00 0x00
```

#### fieldDef

Field dfinition the first 4 bytes are the type in LE.  0x0000001 Ar prime fields.

For the prime fields, the next bytes are the prime in variable length LE base 256 format.

NOTE: This number is independent of the bigInt Format defined next

#### bigInt Format

Size: 4 bytes
Format: Little-Endian

0 Means that the Big Int are variable size LE.
That is the First byte indicates the size and the remaining bytes are the number in little enfian (LSB first) base 256.

Numbers from 1 to 16383 are fixed size Litle endian format base 256.

Example:
```
0x00 0x00 0x00 0x00
```

#### Id Size (is)

Size: 4 bytes
Format: Little-Endian

Size of the identifiers for wires, labels and constraints. In small circuits this is going to be 4 (32 bits)
but can be increaset to 8 for bigger circiuits.

The only possible numbers are 4 or 8


#### Number of wires

Size: `is` bytes
Format: Little-Endian

Total Number of wires including ONE signal (Index 0).

#### Number of public outputs

Size: `is` bytes
Format: Little-Endian

Total Number of wires public output wires. They should be starting at idx 1

#### Number of public inputs

Size: `is` bytes
Format: Little-Endian

Total Number of wires public input wires. They should be starting just after the public output

#### Number of private inputs

Size: `is` bytes
Format: Little-Endian

Total Number of wires private input wires. They should be starting just after the public inputs

#### Number of constraints (m)

Size: `ìs` bytes
Format: Little-Endian

Total Number of constraints

### Constraints section

Section Type: 0x02

````
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                     ╲
     ┃ is │       nA        ┃                                      ╲
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓        ╲
     ┃ is │     wireId_1    ┃  V  │     a_{0,wireId_1}     ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ is │     wireId_2    ┃  V  │     a_{0,wireId_2}     ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nA   ┃  V  │     a_{0,wireId_nA}    ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ is │       nB        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_1    ┃  V  │     b_{0,wireId_1}     ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         ╲
     ┃ is │     wireId_2    ┃  V  │     b_{0,wireId_2}     ┃          ╲
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛          ╱  Constraint_0
                ...                          ...                     ╱
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nB   ┃  V  │     b_{0,wireId_nB}    ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ is │       nC        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_1    ┃  V  │     c_{0,wireId_1}     ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ is │     wireId_2    ┃  V  │     c_{0,wireId_2}     ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nC   ┃  V  │     c_{0,wireId_nC}    ┃        ╱
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛       ╱
                                                                  ╱


     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                     ╲
     ┃ is │       nA        ┃                                      ╲
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓        ╲
     ┃ is │     wireId_1    ┃  V  │     a_{1,wireId_1}     ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ is │     wireId_2    ┃  V  │     a_{1,wireId_2}     ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nA   ┃  V  │     a_{1,wireId_nA}    ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ is │       nB        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_1    ┃  V  │     b_{1,wireId_1}     ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         ╲
     ┃ is │     wireId_2    ┃  V  │     b_{1,wireId_2}     ┃          ╲
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛          ╱  Constraint_1
                ...                          ...                     ╱
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nB   ┃  V  │     b_{1,wireId_nB}    ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ is │       nC        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_1    ┃  V  │     c_{1,wireId_1}     ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ is │     wireId_2    ┃  V  │     c_{1,wireId_2}     ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nC   ┃  V  │     c_{1,wireId_nC}    ┃        ╱
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛       ╱
                                                                  ╱

                         ...
                         ...
                         ...

     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                     ╲
     ┃ is │       nA        ┃                                      ╲
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓        ╲
     ┃ is │     wireId_1    ┃  V  │    a_{m-1,wireId_1}    ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ is │     wireId_2    ┃  V  │    a_{m-1,wireId_2}    ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nA   ┃  V  │    a_{m-1,wireId_nA}   ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ is │       nB        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_1    ┃  V  │    b_{m-1,wireId_1}    ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         ╲
     ┃ is │     wireId_2    ┃  V  │    b_{m-1,wireId_2}    ┃          ╲
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛          ╱  Constraint_{m-1}
                ...                          ...                     ╱
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nB   ┃  V  │    b_{m-1,wireId_nB}   ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┓                                        │
     ┃ is │       nC        ┃                                        │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_1    ┃  V  │    c_{m-1,wireId_1}    ┃         │
     ┣━━━━╋━━━━━━━━━━━━━━━━━╋━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫         │
     ┃ is │     wireId_2    ┃  V  │    c_{m-1,wireId_2}    ┃         │
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛         │
                ...                          ...                     │
     ┏━━━━┳━━━━━━━━━━━━━━━━━┳━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━┓         │
     ┃ is │     wireId_nC   ┃  V  │    c_{m-1,wireId_nC}   ┃        ╱
     ┗━━━━┻━━━━━━━━━━━━━━━━━┻━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━┛       ╱
                                                                  ╱                                                                  ╱
````



#### Constraints

Each constraint contains 3 linear combinations A, B, C.

The constraint is such that:
```
A*B-C = 0
```

#### Linear combination

Each linear combination is of the form:

$$
a_{j,0}w_0 + a_{j,1}w_1 + ... + a_{j,n}w_{n}
$$

#### Number of nonZero Factors

Size: `ìs` bytes
Format: Little-Endian

Total number of non Zero factors in the linear compination.

The factors MUST be sorted in ascending order.

#### Factor

For each factor we have the index of the factor and the value of the factor.

#### WireId of the factor

Size: `is` bytes
Format: Little-Endian

WireId of the nonZero Factor

#### Value of the factor

The first byte indicate the length N in bytes of the number in the upcoming bytes.

The next N bytes represent the value in Little Endian format.

For example, to represent the linear combination:

$$
5w_4 +8w_5 + 260w_{886}
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


### WireId2LabelId Map Section

Section Type: 0x03

````
┏━━┳━━━━━━━━━━━━━━━━━━━┳━━┳━━━━━━━━━━━━━━━━━━━┓     ┏━━┳━━━━━━━━━━━━━━━━━━━┓
┃is│ labelId of Wire_0 ┃is│ labelId of Wire_1 ┃ ... ┃is│ labelId of Wire_n ┃
┗━━┻━━━━━━━━━━━━━━━━━━━┻━━┻━━━━━━━━━━━━━━━━━━━┛     ┗━━┻━━━━━━━━━━━━━━━━━━━┛
````

## Rationale

Variable size for field elements allows to shrink the size of the file and allows to work with any field.

Version allows to update the format.

Have a very good comprasion ratio for sparse r1cs as it's the normal case.

The motivation of having a map between l and w is that this allows optimizers to calculate equivalent r1cs systems but keeping the original values geneated by the circuit.


## Backward Compatibility

N.A.

## Test Cases
### Example

Given this r1cs in a 256 bit Field:


$$
\left\{  \begin{array}{rclclcl}
(3w_5 + 8w_6) &\cdot& (2w_0 + 20w_2 + 12w_3) &-& (5w_0 + 7w_2) &=& 0 \\
(4w_1 + 8w_4 + 3w_5) &\cdot& (6w_6 + 44w_3) &&  &=& 0 \\
(4w_6) &\cdot& (6w_0 + 5w_3 + 11s_2) &-& (600w_6) &=& 0
\end{array} \right.
$$

And a Wire to label map.

$$
w_0 := l_0 \\
w_1 := l_3 \\
w_2 := l_{10} \\
w_3 := l_{11} \\
w_4 := l_{12} \\
w_5 := l_{15} \\
w_6 := l_{324} \\
$$

The format will be:

````
     ┏━━━━━━━━━━━━━━┓
     ┃ 72 31 63 77  ┃        Magic
     ┣━━━━━━━━━━━━━━┫
     ┃ 01 00 00 00  ┃       Version
     ┣━━━━━━━━━━━━━━┫
     ┃ 03 00 00 00  ┃       nSections
     ┗━━━━━━━━━━━━━━┛
     ┏━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓
     ┃ 01 00 00 00  ┃ 49 00 00 00 ┃      SectionType: Header
     ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓
        ┃ 25 00 00 00  ┃ 10 00 00 00 ┃  FieldDefSize FieldDef
        ┣━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃ 20 010000f0 93f5e143 9170b979 48e83328 5d588181 b64550b8 29a031e1 724e6430┃
        ┣━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
        ┃ 00 00 00 00  ┃    Big Int format
        ┣━━━━━━━━━━━━━━┫
        ┃ 04 00 00 00  ┃    Id Size
        ┣━━━━━━━━━━━━━━┫
        ┃ 07 00 00 00  ┃    # of wires
        ┣━━━━━━━━━━━━━━┫
        ┃ 01 00 00 00  ┃    # Public Outs
        ┣━━━━━━━━━━━━━━┫
        ┃ 02 00 00 00  ┃    # Public Ins
        ┣━━━━━━━━━━━━━━┫
        ┃ 03 00 00 00  ┃    # Private Ins
        ┣━━━━━━━━━━━━━━┫
        ┃ e8 03 00 00  ┃    # Labels
        ┣━━━━━━━━━━━━━━┫
        ┃ 03 00 00 00  ┃    # Constraints
        ┗━━━━━━━━━━━━━━┛
     ┏━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓
     ┃ 02 00 00 00  ┃ 8b 00 00 00 ┃      SectionType: Constraints
     ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓   Constraint 0: (3w_5 + 8w_6) * (2w_0 + 20w_2 + 12w_3) - (5w_0 + 7w_2) = 0
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
        ┃ 02 00 00 00  ┃ 01 07  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━┛

        ┏━━━━━━━━━━━━━━┓   Constraint 1: (4w_1 + 8w_4 + 3w_5) * (6w_6 + 44w_3) = 0
        ┃ 03 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 01 00 00 00  ┃  01 04  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 04 00 00 00  ┃  01 08  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 05 00 00 00  ┃  01 03  ┃
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

        ┏━━━━━━━━━━━━━━┓   Constraint 2: (4w_6) * (6w_0 + 5w_3 + 11w_2) - (600w_6) = 0
        ┃ 01 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 06 00 00 00  ┃  01 04  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 03 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┓
        ┃ 00 00 00 00  ┃  01 06  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 02 00 00 00  ┃  01 0B  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━┫
        ┃ 03 00 00 00  ┃  01 05  ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 01 00 00 00  ┃
        ┣━━━━━━━━━━━━━━╋━━━━━━━━━━━━━┓
        ┃ 06 00 00 00  ┃  02 58 02   ┃
        ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┛

     ┏━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓
     ┃ 03 00 00 00  ┃ 1c 00 00 00 ┃      Wire to Label Map
     ┗━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┛
        ┏━━━━━━━━━━━━━━┓
        ┃ 00 00 00 00  ┃
        ┣━━━━━━━━━━━━━━┫
        ┃ 03 00 00 00  ┃
        ┣━━━━━━━━━━━━━━┫
        ┃ 0a 00 00 00  ┃
        ┣━━━━━━━━━━━━━━┫
        ┃ 0b 00 00 00  ┃
        ┣━━━━━━━━━━━━━━┫
        ┃ 0c 00 00 00  ┃
        ┣━━━━━━━━━━━━━━┫
        ┃ 0f 00 00 00  ┃
        ┣━━━━━━━━━━━━━━┫
        ┃ 44 01 00 00  ┃
        ┗━━━━━━━━━━━━━━┛
````

And the binary representation in Hex:

````
72 31 63 77
01 00 00 00
03 00 00 00
01 00 00 00  49 00 00 00
25 00 00 00  10 00 00 00
20 010000f0 93f5e143 9170b979 48e83328 5d588181 b64550b8 29a031e1 724e6430
00 00 00 00
04 00 00 00
07 00 00 00
01 00 00 00
02 00 00 00
03 00 00 00
e8 03 00 00
03 00 00 00
02 00 00 00  8b 00 00 00
02 00 00 00
05 00 00 00  01 03
06 00 00 00  01 08
03 00 00 00
00 00 00 00  01 02
02 00 00 00  01 14
03 00 00 00  01 0C
02 00 00 00
00 00 00 00  01 05
02 00 00 00  01 07
03 00 00 00
01 00 00 00  01 04
04 00 00 00  01 08
05 00 00 00  01 03
02 00 00 00
03 00 00 00  01 2C
06 00 00 00  01 06
00 00 00 00
01 00 00 00
06 00 00 00  01 04
03 00 00 00
00 00 00 00  01 06
02 00 00 00  01 0B
03 00 00 00  01 05
01 00 00 00
06 00 00 00  02 58 02
03 00 00 00  1c 00 00 00
00 00 00 00
03 00 00 00
0a 00 00 00
0b 00 00 00
0c 00 00 00
0f 00 00 00
44 01 00 00

````

## Implementation

circom will output this format.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).

