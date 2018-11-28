


template A() {
    signal a;
}

template B() {
    component a[2] = A();
}

component main = B();
