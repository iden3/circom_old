# circom and snarkjs tutorial

This tutorial will guide you in creating your first zero-knowledge SNARK circuit. It will take you through the various techniques to write circuits and show you how to create and verify proofs off-chain and on-chain on Ethereum.

## 1. Installing the tools

### 1.1 Pre-requisites

If you don't have it installed yet, you need to install `Node.js`.

You should install at least version 10 of node. It's important to note here that the latests versions of javascript, includes big integer support and web assembly compilers that make the code run fast.

### 1.2 Install **circom** and **snarkjs**

Run:

```sh
npm install -g circom
npm install -g snarkjs
```


## 2. Working with a circuit

Let's create a circuit that will allow you to prove that you are able to factor a number!

### 2.1 Create a circuit in a new directory

1. Create an empty directory called `factor` where you will put all the files that you will use in this tutorial.
```
mkdir factor
cd factor
```


> In a real circuit, you will probably want to create a `git` repository with a `circuits` directory and a `test` directory with all your tests, and the needed scripts to build all the circuits.

2. Create a new file named `circuit.circom` with the following content:

```
template Multiplier() {
    signal private input a;
    signal private input b;
    signal output c;

    c <== a*b;
}

component main = Multiplier();
```

This circuit has 2 private input signals named `a` and `b` and one output named `c`.

The only thing that the circuit does is forcing the signal `c` to be the value of `a*b`

After declaring the `Multiplier` template, we instantiate it with a component named`main`.

Note: When compiling a circuit, a component named `main` must always exist.

### 2.2 Compile the circuit

We are now ready to compile the circuit. Run the following command:

```sh
circom circuit.circom --r1cs --wasm --sym
```

The `--r1cs` option will generate `circuit.r1cs` (the r1cs constraint system of the circuit in binary format).

The `--wasm` option will generate `circuit.wasm` (the wasm code to generate the witness).

The `--sym` option will generate `circuit.sym` (a symbols file required for debugging or if you want to print the constraint system in an annotated mode).


## 3. Taking the compiled circuit to *snarkjs*

Now that the circuit is compiled, we will continue with `snarkjs`.
Please note that you can always access the help of `snarkjs` by typing:

```sh
snarkjs --help
```

### 3.1 View information and stats regarding a circuit

To show general statistics of this circuit, you can run:

```sh
snarkjs r1cs info circuit.r1cs
```

You can also print the constraints of the circuit by running:

```sh
snarkjs r1cs print circuit.r1cs circuit.sym
```


### 3.2 Setting up using *snarkjs*


Setup must be a trusted setup ceremony in snarks.

Please visit [https://github.com/iden3/snarkjs](https://github.com/iden3/snarkjs) to see how to run a ceremony for a real circuit.

To simplify it, we will run the ceremony ourself.


First we download a power of tau ceremony file:
```sh
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
```

Then we create the zkey file withou any contribution

```sh
snarkjs zkey new circuit.r1cs powersOfTau28_hez_final_10.ptau circuit_0000.zkey
```

We now add out contribution

```
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey
```

Finally, we can export the verification key from the zkey file

```
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
```

### 3.3. Calculating a witness

Before creating any proof, we need to calculate all the signals of the circuit that match (all) the constraints of the circuit.

`circom` generates a wasm module that calculates those for you.  You need to provide a file with the inputs and it will execute the circuit and calculate all the intermediate signals and the output. This set of signals is the *witness*.

The zero-knowledge proofs prove that you know a set of signals (witness) that match all the constraints without revealing any of the signals except the public inputs and the outputs.

For example, imagine you want to prove you are able to factor the number 33. It means that you know two numbers `a` and `b` that when you multiply them, it results in 33.

> Of course you can always use the number one and the same number as `a` or `b`.  We  will deal with this problem later.

So you want to prove that you know 3 and 11.

Let's create a file named `input.json`

```json
{"a": 3, "b": 11}
```

Now let's calculate the witness:

```sh
snarkjs wtns calculate circuit.wasm input.json witness.wtns
```

To see the witness.wtns file, you can export it to jeson and take a look

```sh
snarkjs wtns export json witness.wtns witness.json
cat witness.json
```

If the circuit has any error, you can debug the generation of the witness with
```sh
snarkjs wtns debug circuit.wasm input.json witness.wtns circuit.sym
```

### Create the proof

Now that we have the witness generated, we can create the proof.

```sh
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
```

This command will use the `circuit_final.zkey` and the `witness.wtns` files by default to generate `proof.json` and `public.json`

The `proof.json` file will contain the actual proof and the `public.json` file will contain just the values of the public inputs and the outputs.


### Verifying the proof

To verify the proof run:

```sh
snarkjs groth16 verify verification_key.json public.json proof.json
```

This command will use `verification_key.json`, `proof.json` and `public.json` to verify that is valid.

Here we are verifying that we know a witness that the public inputs and the outputs matches the ones in the `public.json` file.


If the proof is ok, you will see `OK` or `INVALID` if not ok.

### Generate the solidity verifier

```sh
snarkjs zkey export solidityverifier circuit_final.zkey verifier.sol
```

This command will take the `circuit_final.zkey` and generate solidity code in `verifier.sol` file.

You can take the code in `verifier.sol` and cut and paste it in remix.

This code contains two contracts: Pairings and Verifier.  You only need to deploy the `Verifier` contract.

> You may want to use a test net like Rinkeby, Kovan or Ropsten.  You can also use the Javascript VM, but in some browsers the verification takes long and it may hang the page.


### Verifying the proof on-chain

The verifier contract deployed in the last step has a `view` function called `verifyProof`.

This function will return true if the proof and the inputs are valid.

To facilitate the call, you can use `snarkjs` to generate the parameters of the call by typing:

```sh
snarkjs zkey export soliditycalldata public.json proof.json
```

Just cut and paste the output to the parameters field of the `verifyProof` method in Remix.

If every thing works ok, this method should return true.

If you change any bit in the parameters, the result will be verifiably false.


## Bonus track

We can fix the circuit to not accept the number 1 as any of the input values by adding some extra constraints.

Here, the trick is that we use the property that 0 has no inverse.  So `(a-1)` should not have an inverse.

That means that `(a-1)*inv = 1` will be inpossible to match if `a` is 1.

We just calculate inv by `1/(a-1)`.

So, let's modify the circuit:

```
template Multiplier() {
    signal private input a;
    signal private input b;
    signal output c;
    signal inva;
    signal invb;

    inva <-- 1/(a-1);
    (a-1)*inva === 1;

    invb <-- 1/(b-1);
    (b-1)*invb === 1;

    c <== a*b;
}

component main = Multiplier();
```

A nice thing of the circom language is that you can split a `<==` into two independent actions: `<--` and `===`.

The `<--` and `-->` operators assign a value to a signal without creating any constraints.

The `===` operator adds a constraint without assigning any value to a signal.

The circuit also has another problem: the operation works in `Z_r`, so we need to guarantee the multiplication does not overflow. This can be done by converting the inputs to binary and checking the ranges, but we will reserve it for future tutorials.

Another problem of the circuit is that circom works with a field of a prime that in general is arround the 255bits.  That means that it's very easy to factor in that field.

One possible solution to this, is to limit the inputs to 64 bits. that means that this way it will not be possible to have overflow.

The final circuit would look like:

```
template CheckBits(n) {
    signal input in;
    signal bits[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        bits[i] <-- (in >> i) & 1;
        bits[i] * (bits[i] -1 ) === 0;
        lc1 += bits[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

template Multiplier(n) {
    signal private input a;
    signal private input b;
    signal output c;
    signal inva;
    signal invb;

    component chackA = CheckBits(n);
    component chackB = CheckBits(n);

    chackA.in <== a;
    chackB.in <== b;

    inva <-- 1/(a-1);
    (a-1)*inva === 1;

    invb <-- 1/(b-1);
    (b-1)*invb === 1;

    c <== a*b;
}

component main = Multiplier(64);
```

## Where to go from here

You may want to read the [README](https://github.com/iden3/circom)  to learn more features about `circom`.

You can also check a library with many basic circuits lib binarizations, comparators, eddsa, hashes, merkle trees etc [here](https://github.com/iden3/circomlib) (Work in progress).


Or a exponentiation in the Baby Jubjub curve [here](https://github.com/iden3/circomlib) (Work in progress).


# Final note

There is nothing worse for a dev than working with a buggy compiler.  This is a very early stage of the compiler, so there are many bugs and lots of work needs to be done. Please have it present if you are doing anything serious with it.

And please contact us for any isue you have. In general, a github issue with a small piece of code with the bug is very useful to us.

Enjoy zero-knowledge proving!
