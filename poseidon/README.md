# Poseidon hash in Circom SNARK circuit
Example of poseidon hash pre-image knowledge SNARK proof in Circom.

## Organization
- `./`: circom files
    - `poseidon.circom`: SNARK circuit for 1 input up to 1536 bits (can be modified up to 6 inputs `var chunks = 6;`)
    - `input.json`: inputs values should be of the form `{"inputs":["in_1",...,"in_N"]}`
- `./python`: A python implementation of Poseidon hash

## Run
`./do <command>`
Possible commands: `clean`, `compile`, `setup`, `witness`, `proof`, `verify`

