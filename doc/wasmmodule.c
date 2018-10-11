/*

(module
 (export "get_signal_ptr" (func $get_signal_ptr))
 (export "solve" (func $solve))
 (func $get_signal_ptr (result i32)
  (i32.const 22)
 )
 (func $solve (result i32)
  (i32.const 22)
 )
)

 */


typedef int u32;
typedef u32 u256[8];

struct Signals {
    u256 one;
    u256 output1;
    u256 output2;
    u256 pubInput1;
    u256 pubInput2;
    u256 prvInput1;
    u256 prvInput2;
    u256 internal1;
    u256 internal2;
};

static Signals signals;

#ifdef __cplusplus
extern "C" {
#endif

u256 *get_signal_ptr() {
    return (u256 *)&signals;
}

int solve() {
    for (int i=0; i<8; i++) {
      signals.internal1[i]  = signals.pubInput1[i];
      signals.internal2[i]  = signals.pubInput2[i];
      signals.output1[i]    = signals.prvInput1[i];
      signals.output2[i]    = signals.prvInput2[i];
    }
}

#ifdef __cplusplus
} // extern "C"
#endif
