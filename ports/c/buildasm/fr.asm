

        global Fr_copy
        global Fr_copyn
        global Fr_add
        global Fr_sub
        global Fr_neg
        global Fr_mul
        global Fr_square
        global Fr_band
        global Fr_bor
        global Fr_bxor
        global Fr_bnot
        global Fr_eq
        global Fr_neq
        global Fr_lt
        global Fr_gt
        global Fr_leq
        global Fr_geq
        global Fr_land
        global Fr_lor
        global Fr_lnot
        global Fr_toNormal
        global Fr_toLongNormal
        global Fr_toMontgomery
        global Fr_toInt
        global Fr_isTrue
        global Fr_q
        extern Fr_fail
        DEFAULT REL

        section .text
















;;;;;;;;;;;;;;;;;;;;;;
; copy
;;;;;;;;;;;;;;;;;;;;;;
; Copies
; Params:
;   rsi <= the src
;   rdi <= the dest
;
; Nidified registers:
;   rax
;;;;;;;;;;;;;;;;;;;;;;;
Fr_copy:

        mov     rax, [rsi + 0]
        mov     [rdi + 0], rax

        mov     rax, [rsi + 8]
        mov     [rdi + 8], rax

        mov     rax, [rsi + 16]
        mov     [rdi + 16], rax

        mov     rax, [rsi + 24]
        mov     [rdi + 24], rax

        mov     rax, [rsi + 32]
        mov     [rdi + 32], rax

        ret

;;;;;;;;;;;;;;;;;;;;;;
; copy an array of integers
;;;;;;;;;;;;;;;;;;;;;;
; Copies
; Params:
;   rsi <= the src
;   rdi <= the dest
;   rdx <= number of integers to copy
;
; Nidified registers:
;   rax
;;;;;;;;;;;;;;;;;;;;;;;
Fr_copyn:
Fr_copyn_loop:
        mov     r8, rsi
        mov     r9, rdi
        mov     rax, 5
        mul     rdx
        mov     rcx, rax
        cld
   rep  movsq
        mov     rsi, r8
        mov     rdi, r9
        ret

;;;;;;;;;;;;;;;;;;;;;;
; rawCopyS2L
;;;;;;;;;;;;;;;;;;;;;;
; Convert a 64 bit integer to a long format field element
; Params:
;   rsi <= the integer
;   rdi <= Pointer to the overwritted element
;
; Nidified registers:
;   rax
;;;;;;;;;;;;;;;;;;;;;;;

rawCopyS2L:
        mov     al, 0x80
        shl     rax, 56
        mov     [rdi], rax    ; set the result to LONG normal

        cmp     rsi, 0
        js      u64toLong_adjust_neg

        mov     [rdi + 8], rsi
        xor     rax, rax

        mov     [rdi + 16], rax

        mov     [rdi + 24], rax

        mov     [rdi + 32], rax

        ret

u64toLong_adjust_neg:
        add    rsi, [q]         ; Set the first digit
        mov    [rdi + 8], rsi   ;

        mov    rsi, -1          ; all ones

        mov    rax, rsi                       ; Add to q
        adc    rax, [q + 8 ]
        mov    [rdi + 16], rax

        mov    rax, rsi                       ; Add to q
        adc    rax, [q + 16 ]
        mov    [rdi + 24], rax

        mov    rax, rsi                       ; Add to q
        adc    rax, [q + 24 ]
        mov    [rdi + 32], rax

        ret

;;;;;;;;;;;;;;;;;;;;;;
; toInt
;;;;;;;;;;;;;;;;;;;;;;
; Convert a 64 bit integer to a long format field element
; Params:
;   rsi <= Pointer to the element
; Returs:
;   rax <= The value
;;;;;;;;;;;;;;;;;;;;;;;
Fr_toInt:
        mov     rax, [rdi]
        bt      rax, 63
        jc      Fr_long
        movsx   rax, eax
        ret

Fr_long:
        bt      rax, 62
        jnc     Fr_longNormal
Fr_longMontgomery:
        call    Fr_toLongNormal

Fr_longNormal:
        mov     rax, [rdi + 8]
        mov     rcx, rax
        shr     rcx, 31
        jnz     Fr_longNeg

        mov     rcx, [rdi + 16]
        test    rcx, rcx
        jnz     Fr_longNeg

        mov     rcx, [rdi + 24]
        test    rcx, rcx
        jnz     Fr_longNeg

        mov     rcx, [rdi + 32]
        test    rcx, rcx
        jnz     Fr_longNeg

        ret

Fr_longNeg:
        mov     rax, [rdi + 8]
        sub     rax, [q]
        jnc     Fr_longErr

        mov     rcx, [rdi + 16]
        sbb     rcx, [q + 8]
        jnc     Fr_longErr

        mov     rcx, [rdi + 24]
        sbb     rcx, [q + 16]
        jnc     Fr_longErr

        mov     rcx, [rdi + 32]
        sbb     rcx, [q + 24]
        jnc     Fr_longErr

        mov     rcx, rax
        sar     rcx, 31
        add     rcx, 1
        jnz     Fr_longErr
        ret

Fr_longErr:
        push    rdi
        mov     rdi, 0
        call    Fr_fail
        pop     rdi









;;;;;;;;;;;;;;;;;;;;;;
; rawMontgomeryMul
;;;;;;;;;;;;;;;;;;;;;;
; Multiply two elements in montgomery form
; Params:
;   rsi <= Pointer to the long data of element 1
;   rdx <= Pointer to the long data of element 2
;   rdi <= Pointer to the long data of result
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;

rawMontgomeryMul:
        sub     rsp, 32  ; Reserve space for ms
        mov     rcx, rdx            ; rdx is needed for multiplications so keep it in cx
        mov     r11, 0xc2e1f593efffffff ; np
        xor     r8,r8
        xor     r9,r9
        xor     r10,r10

        mov     rax, [rsi + 0]
        mul     qword [rcx + 0]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0





        mov     rax, r8
        mul     r11
        mov     [rsp + 0], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsi + 0]
        mul     qword [rcx + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsi + 8]
        mul     qword [rcx + 0]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsp + 0]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, r9
        mul     r11
        mov     [rsp + 8], rax
        mul     qword [q]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsi + 0]
        mul     qword [rcx + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsi + 8]
        mul     qword [rcx + 8]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsi + 16]
        mul     qword [rcx + 0]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsp + 8]
        mul     qword [q + 8]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, r10
        mul     r11
        mov     [rsp + 16], rax
        mul     qword [q]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsi + 0]
        mul     qword [rcx + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsi + 8]
        mul     qword [rcx + 16]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsi + 16]
        mul     qword [rcx + 8]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsi + 24]
        mul     qword [rcx + 0]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsp + 16]
        mul     qword [q + 8]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 16]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, r8
        mul     r11
        mov     [rsp + 24], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsi + 8]
        mul     qword [rcx + 24]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsi + 16]
        mul     qword [rcx + 16]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsi + 24]
        mul     qword [rcx + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsp + 24]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 16]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 24]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     [rdi + 0 ], r9
        xor     r9,r9



        mov     rax, [rsi + 16]
        mul     qword [rcx + 24]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsi + 24]
        mul     qword [rcx + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsp + 24]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 24]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     [rdi + 8 ], r10
        xor     r10,r10



        mov     rax, [rsi + 24]
        mul     qword [rcx + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsp + 24]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     [rdi + 16 ], r8
        xor     r8,r8







        mov     [rdi + 24 ], r9
        xor     r9,r9



        test    r10, r10
        jnz     rawMontgomeryMul_mulM_sq
        ; Compare with q

        mov rax, [rdi + 24]
        cmp rax, [q + 24]
        jc rawMontgomeryMul_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul_mulM_sq         ; q is lower

        mov rax, [rdi + 16]
        cmp rax, [q + 16]
        jc rawMontgomeryMul_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul_mulM_sq         ; q is lower

        mov rax, [rdi + 8]
        cmp rax, [q + 8]
        jc rawMontgomeryMul_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul_mulM_sq         ; q is lower

        mov rax, [rdi + 0]
        cmp rax, [q + 0]
        jc rawMontgomeryMul_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul_mulM_sq         ; q is lower

        ; If equal substract q

rawMontgomeryMul_mulM_sq:

        mov rax, [q + 0]
        sub [rdi + 0], rax

        mov rax, [q + 8]
        sbb [rdi + 8], rax

        mov rax, [q + 16]
        sbb [rdi + 16], rax

        mov rax, [q + 24]
        sbb [rdi + 24], rax


rawMontgomeryMul_mulM_done:
        mov rdx, rcx            ; recover rdx to its original place.
        add rsp, 32   ; recover rsp
        ret



;;;;;;;;;;;;;;;;;;;;;;
; rawMontgomerySquare
;;;;;;;;;;;;;;;;;;;;;;
; Square an element
; Params:
;   rsi <= Pointer to the long data of element 1
;   rdi <= Pointer to the long data of result
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;

rawMontgomerySquare:
        sub     rsp, 32  ; Reserve space for ms
        mov     rcx, rdx            ; rdx is needed for multiplications so keep it in cx
        mov     r11, 0xc2e1f593efffffff ; np
        xor     r8,r8
        xor     r9,r9
        xor     r10,r10



        mov     rax, [rsi + 0]
        mul     rax
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0







        mov     rax, r8
        mul     r11
        mov     [rsp + 0], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsi + 0]
        mul     qword [rsi + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0







        mov     rax, [rsp + 0]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, r9
        mul     r11
        mov     [rsp + 8], rax
        mul     qword [q]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsi + 0]
        mul     qword [rsi + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsi + 8]
        mul     rax
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0





        mov     rax, [rsp + 8]
        mul     qword [q + 8]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, r10
        mul     r11
        mov     [rsp + 16], rax
        mul     qword [q]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsi + 0]
        mul     qword [rsi + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsi + 8]
        mul     qword [rsi + 16]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0







        mov     rax, [rsp + 16]
        mul     qword [q + 8]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 16]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, r8
        mul     r11
        mov     [rsp + 24], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsi + 8]
        mul     qword [rsi + 24]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsi + 16]
        mul     rax
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0





        mov     rax, [rsp + 24]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 16]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 24]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     [rdi + 0 ], r9
        xor     r9,r9



        mov     rax, [rsi + 16]
        mul     qword [rsi + 24]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0







        mov     rax, [rsp + 24]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 24]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     [rdi + 8 ], r10
        xor     r10,r10





        mov     rax, [rsi + 24]
        mul     rax
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0





        mov     rax, [rsp + 24]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     [rdi + 16 ], r8
        xor     r8,r8











        mov     [rdi + 24 ], r9
        xor     r9,r9



        test    r10, r10
        jnz     rawMontgomerySquare_mulM_sq
        ; Compare with q

        mov rax, [rdi + 24]
        cmp rax, [q + 24]
        jc rawMontgomerySquare_mulM_done        ; q is bigget so done.
        jnz rawMontgomerySquare_mulM_sq         ; q is lower

        mov rax, [rdi + 16]
        cmp rax, [q + 16]
        jc rawMontgomerySquare_mulM_done        ; q is bigget so done.
        jnz rawMontgomerySquare_mulM_sq         ; q is lower

        mov rax, [rdi + 8]
        cmp rax, [q + 8]
        jc rawMontgomerySquare_mulM_done        ; q is bigget so done.
        jnz rawMontgomerySquare_mulM_sq         ; q is lower

        mov rax, [rdi + 0]
        cmp rax, [q + 0]
        jc rawMontgomerySquare_mulM_done        ; q is bigget so done.
        jnz rawMontgomerySquare_mulM_sq         ; q is lower

        ; If equal substract q

rawMontgomerySquare_mulM_sq:

        mov rax, [q + 0]
        sub [rdi + 0], rax

        mov rax, [q + 8]
        sbb [rdi + 8], rax

        mov rax, [q + 16]
        sbb [rdi + 16], rax

        mov rax, [q + 24]
        sbb [rdi + 24], rax


rawMontgomerySquare_mulM_done:
        mov rdx, rcx            ; recover rdx to its original place.
        add rsp, 32   ; recover rsp
        ret




;;;;;;;;;;;;;;;;;;;;;;
; rawMontgomeryMul1
;;;;;;;;;;;;;;;;;;;;;;
; Multiply two elements in montgomery form
; Params:
;   rsi <= Pointer to the long data of element 1
;   rdx <= second operand
;   rdi <= Pointer to the long data of result
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;

rawMontgomeryMul1:
        sub     rsp, 32  ; Reserve space for ms
        mov     rcx, rdx            ; rdx is needed for multiplications so keep it in cx
        mov     r11, 0xc2e1f593efffffff ; np
        xor     r8,r8
        xor     r9,r9
        xor     r10,r10

        mov     rax, [rsi + 0]
        mul     rcx
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0





        mov     rax, r8
        mul     r11
        mov     [rsp + 0], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsi + 8]
        mul     rcx
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsp + 0]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, r9
        mul     r11
        mov     [rsp + 8], rax
        mul     qword [q]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, [rsi + 16]
        mul     rcx
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsp + 8]
        mul     qword [q + 8]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, r10
        mul     r11
        mov     [rsp + 16], rax
        mul     qword [q]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, [rsi + 24]
        mul     rcx
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, [rsp + 16]
        mul     qword [q + 8]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 16]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, r8
        mul     r11
        mov     [rsp + 24], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0





        mov     rax, [rsp + 24]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 16]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 24]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     [rdi + 0 ], r9
        xor     r9,r9





        mov     rax, [rsp + 24]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 24]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     [rdi + 8 ], r10
        xor     r10,r10





        mov     rax, [rsp + 24]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     [rdi + 16 ], r8
        xor     r8,r8







        mov     [rdi + 24 ], r9
        xor     r9,r9



        test    r10, r10
        jnz     rawMontgomeryMul1_mulM_sq
        ; Compare with q

        mov rax, [rdi + 24]
        cmp rax, [q + 24]
        jc rawMontgomeryMul1_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul1_mulM_sq         ; q is lower

        mov rax, [rdi + 16]
        cmp rax, [q + 16]
        jc rawMontgomeryMul1_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul1_mulM_sq         ; q is lower

        mov rax, [rdi + 8]
        cmp rax, [q + 8]
        jc rawMontgomeryMul1_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul1_mulM_sq         ; q is lower

        mov rax, [rdi + 0]
        cmp rax, [q + 0]
        jc rawMontgomeryMul1_mulM_done        ; q is bigget so done.
        jnz rawMontgomeryMul1_mulM_sq         ; q is lower

        ; If equal substract q

rawMontgomeryMul1_mulM_sq:

        mov rax, [q + 0]
        sub [rdi + 0], rax

        mov rax, [q + 8]
        sbb [rdi + 8], rax

        mov rax, [q + 16]
        sbb [rdi + 16], rax

        mov rax, [q + 24]
        sbb [rdi + 24], rax


rawMontgomeryMul1_mulM_done:
        mov rdx, rcx            ; recover rdx to its original place.
        add rsp, 32   ; recover rsp
        ret




;;;;;;;;;;;;;;;;;;;;;;
; rawFromMontgomery
;;;;;;;;;;;;;;;;;;;;;;
; Multiply two elements in montgomery form
; Params:
;   rsi <= Pointer to the long data of element 1
;   rdi <= Pointer to the long data of result
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;

rawFromMontgomery:
        sub     rsp, 32  ; Reserve space for ms
        mov     rcx, rdx            ; rdx is needed for multiplications so keep it in cx
        mov     r11, 0xc2e1f593efffffff ; np
        xor     r8,r8
        xor     r9,r9
        xor     r10,r10

        add     r8, [rdi + 0]
        adc     r9, 0x0
        adc     r10, 0x0





        mov     rax, r8
        mul     r11
        mov     [rsp + 0], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        add     r9, [rdi + 8]
        adc     r10, 0x0
        adc     r8, 0x0



        mov     rax, [rsp + 0]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     rax, r9
        mul     r11
        mov     [rsp + 8], rax
        mul     qword [q]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        add     r10, [rdi + 16]
        adc     r8, 0x0
        adc     r9, 0x0



        mov     rax, [rsp + 8]
        mul     qword [q + 8]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     rax, r10
        mul     r11
        mov     [rsp + 16], rax
        mul     qword [q]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        add     r8, [rdi + 24]
        adc     r9, 0x0
        adc     r10, 0x0



        mov     rax, [rsp + 16]
        mul     qword [q + 8]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 16]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0

        mov     rax, [rsp + 0]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     rax, r8
        mul     r11
        mov     [rsp + 24], rax
        mul     qword [q]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0





        mov     rax, [rsp + 24]
        mul     qword [q + 8]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 16]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0

        mov     rax, [rsp + 8]
        mul     qword [q + 24]
        add     r9, rax
        adc     r10, rdx
        adc     r8, 0x0



        mov     [rdi + 0 ], r9
        xor     r9,r9





        mov     rax, [rsp + 24]
        mul     qword [q + 16]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0

        mov     rax, [rsp + 16]
        mul     qword [q + 24]
        add     r10, rax
        adc     r8, rdx
        adc     r9, 0x0



        mov     [rdi + 8 ], r10
        xor     r10,r10





        mov     rax, [rsp + 24]
        mul     qword [q + 24]
        add     r8, rax
        adc     r9, rdx
        adc     r10, 0x0



        mov     [rdi + 16 ], r8
        xor     r8,r8







        mov     [rdi + 24 ], r9
        xor     r9,r9



        test    r10, r10
        jnz     rawFromMontgomery_mulM_sq
        ; Compare with q

        mov rax, [rdi + 24]
        cmp rax, [q + 24]
        jc rawFromMontgomery_mulM_done        ; q is bigget so done.
        jnz rawFromMontgomery_mulM_sq         ; q is lower

        mov rax, [rdi + 16]
        cmp rax, [q + 16]
        jc rawFromMontgomery_mulM_done        ; q is bigget so done.
        jnz rawFromMontgomery_mulM_sq         ; q is lower

        mov rax, [rdi + 8]
        cmp rax, [q + 8]
        jc rawFromMontgomery_mulM_done        ; q is bigget so done.
        jnz rawFromMontgomery_mulM_sq         ; q is lower

        mov rax, [rdi + 0]
        cmp rax, [q + 0]
        jc rawFromMontgomery_mulM_done        ; q is bigget so done.
        jnz rawFromMontgomery_mulM_sq         ; q is lower

        ; If equal substract q

rawFromMontgomery_mulM_sq:

        mov rax, [q + 0]
        sub [rdi + 0], rax

        mov rax, [q + 8]
        sbb [rdi + 8], rax

        mov rax, [q + 16]
        sbb [rdi + 16], rax

        mov rax, [q + 24]
        sbb [rdi + 24], rax


rawFromMontgomery_mulM_done:
        mov rdx, rcx            ; recover rdx to its original place.
        add rsp, 32   ; recover rsp
        ret



;;;;;;;;;;;;;;;;;;;;;;
; toMontgomery
;;;;;;;;;;;;;;;;;;;;;;
; Convert a number to Montgomery
;   rdi <= Pointer element to convert
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;
Fr_toMontgomery:
    mov     rax, [rdi]
    bts     rax, 62                     ; check if montgomery
    jc      toMontgomery_doNothing
    bts     rax, 63
    jc      toMontgomeryLong

toMontgomeryShort:
    mov     [rdi], rax
    add     rdi, 8
    push    rsi
    lea     rsi, [R2]
    movsx   rdx, eax
    cmp     rdx, 0
    js      negMontgomeryShort
posMontgomeryShort:
    call    rawMontgomeryMul1
    pop     rsi
    sub     rdi, 8
    ret

negMontgomeryShort:
    neg     rdx              ; Do the multiplication positive and then negate the result.
    call    rawMontgomeryMul1
    mov     rsi, rdi
    call    rawNegL
    pop     rsi
    sub     rdi, 8
    ret


toMontgomeryLong:
    mov     [rdi], rax
    add     rdi, 8
    push    rsi
    mov     rdx, rdi
    lea     rsi, [R2]
    call    rawMontgomeryMul
    pop     rsi
    sub     rdi, 8

toMontgomery_doNothing:
    ret

;;;;;;;;;;;;;;;;;;;;;;
; toNormal
;;;;;;;;;;;;;;;;;;;;;;
; Convert a number from Montgomery
;   rdi <= Pointer element to convert
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;
Fr_toNormal:
    mov     rax, [rdi]
    btc     rax, 62                     ; check if montgomery
    jnc     toNormal_doNothing
    bt      rax, 63                     ; if short, it means it's converted
    jnc     toNormal_doNothing

toNormalLong:
    mov     [rdi], rax
    add     rdi, 8
    call    rawFromMontgomery
    sub     rdi, 8

toNormal_doNothing:
    ret

;;;;;;;;;;;;;;;;;;;;;;
; toLongNormal
;;;;;;;;;;;;;;;;;;;;;;
; Convert a number to long normal
;   rdi <= Pointer element to convert
; Modified registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;
Fr_toLongNormal:
    mov     rax, [rdi]
    bt      rax, 62                     ; check if montgomery
    jc      toLongNormal_fromMontgomery
    bt      rax, 63                     ; check if long
    jnc     toLongNormal_fromShort
    ret                                 ; It is already long

toLongNormal_fromMontgomery:
    add     rdi, 8
    call    rawFromMontgomery
    sub     rdi, 8
    ret

toLongNormal_fromShort:
    mov     r8, rsi                     ; save rsi
    movsx   rsi, eax
    call    rawCopyS2L
    mov     rsi, r8                     ; recover rsi
    ret












;;;;;;;;;;;;;;;;;;;;;;
; add
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_add:
        mov    rax, [rsi]
        mov    rcx, [rdx]
        bt     rax, 63          ; Check if is short first operand
        jc     add_l1
        bt     rcx, 63          ; Check if is short second operand
        jc     add_s1l2

add_s1s2:                       ; Both operands are short

        xor    rdx, rdx
        mov    edx, eax
        add    edx, ecx
        jo     add_manageOverflow   ; rsi already is the 64bits result

        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

add_manageOverflow:                 ; Do the operation in 64 bits
        push   rsi
        movsx  rsi, eax
        movsx  rdx, ecx
        add    rsi, rdx
        call   rawCopyS2L
        pop    rsi
        ret

add_l1:
        bt     rcx, 63          ; Check if is short second operand
        jc     add_l1l2

;;;;;;;;
add_l1s2:
        bt     rax, 62          ; check if montgomery first
        jc     add_l1ms2
add_l1ns2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rsi, 8
        movsx rdx, ecx
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_1
        neg rdx
        call rawSubLS
        sub rdi, 8
        sub rsi, 8
        ret
tmp_1:
        call rawAddLS
        sub rdi, 8
        sub rsi, 8
        ret



add_l1ms2:
        bt     rcx, 62          ; check if montgomery second
        jc     add_l1ms2m
add_l1ms2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toMontgomery
        mov  rdx, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret


add_l1ms2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret



;;;;;;;;
add_s1l2:
        bt     rcx, 62          ; check if montgomery first
        jc     add_s1l2m
add_s1l2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        lea rsi, [rdx + 8]
        movsx rdx, eax
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_2
        neg rdx
        call rawSubLS
        sub rdi, 8
        sub rsi, 8
        ret
tmp_2:
        call rawAddLS
        sub rdi, 8
        sub rsi, 8
        ret


add_s1l2m:
        bt     rax, 62          ; check if montgomery second
        jc     add_s1ml2m
add_s1nl2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toMontgomery
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret


add_s1ml2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret


;;;;
add_l1l2:
        bt     rax, 62          ; check if montgomery first
        jc     add_l1ml2
add_l1nl2:
        bt     rcx, 62          ; check if montgomery second
        jc     add_l1nl2m
add_l1nl2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret


add_l1nl2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toMontgomery
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret


add_l1ml2:
        bt     rcx, 62          ; check if montgomery seconf
        jc     add_l1ml2m
add_l1ml2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toMontgomery
        mov  rdx, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret


add_l1ml2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawAddLL
        sub rdi, 8
        sub rsi, 8
        ret




;;;;;;;;;;;;;;;;;;;;;;
; rawAddLL
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of type long
; Params:
;   rsi <= Pointer to the long data of element 1
;   rdx <= Pointer to the long data of element 2
;   rdi <= Pointer to the long data of result
; Modified Registers:
;    rax
;;;;;;;;;;;;;;;;;;;;;;
rawAddLL:
        ; Add component by component with carry

        mov rax, [rsi + 0]
        add rax, [rdx + 0]
        mov [rdi + 0], rax

        mov rax, [rsi + 8]
        adc rax, [rdx + 8]
        mov [rdi + 8], rax

        mov rax, [rsi + 16]
        adc rax, [rdx + 16]
        mov [rdi + 16], rax

        mov rax, [rsi + 24]
        adc rax, [rdx + 24]
        mov [rdi + 24], rax

        jc rawAddLL_sq   ; if overflow, substract q

        ; Compare with q


        cmp rax, [q + 24]
        jc rawAddLL_done        ; q is bigget so done.
        jnz rawAddLL_sq         ; q is lower


        mov rax, [rdi + 16]

        cmp rax, [q + 16]
        jc rawAddLL_done        ; q is bigget so done.
        jnz rawAddLL_sq         ; q is lower


        mov rax, [rdi + 8]

        cmp rax, [q + 8]
        jc rawAddLL_done        ; q is bigget so done.
        jnz rawAddLL_sq         ; q is lower


        mov rax, [rdi + 0]

        cmp rax, [q + 0]
        jc rawAddLL_done        ; q is bigget so done.
        jnz rawAddLL_sq         ; q is lower

        ; If equal substract q
rawAddLL_sq:

        mov rax, [q + 0]
        sub [rdi + 0], rax

        mov rax, [q + 8]
        sbb [rdi + 8], rax

        mov rax, [q + 16]
        sbb [rdi + 16], rax

        mov rax, [q + 24]
        sbb [rdi + 24], rax

rawAddLL_done:
        ret


;;;;;;;;;;;;;;;;;;;;;;
; rawAddLS
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of type long
; Params:
;   rdi <= Pointer to the long data of result
;   rsi <= Pointer to the long data of element 1
;   rdx <= Value to be added
;;;;;;;;;;;;;;;;;;;;;;
rawAddLS:
        ; Add component by component with carry

        add rdx, [rsi]
        mov [rdi] ,rdx

        mov rdx, 0
        adc rdx, [rsi + 8]
        mov [rdi + 8], rdx

        mov rdx, 0
        adc rdx, [rsi + 16]
        mov [rdi + 16], rdx

        mov rdx, 0
        adc rdx, [rsi + 24]
        mov [rdi + 24], rdx

        jc rawAddLS_sq   ; if overflow, substract q

        ; Compare with q

        mov rax, [rdi + 24]
        cmp rax, [q + 24]
        jc rawAddLS_done        ; q is bigget so done.
        jnz rawAddLS_sq         ; q is lower

        mov rax, [rdi + 16]
        cmp rax, [q + 16]
        jc rawAddLS_done        ; q is bigget so done.
        jnz rawAddLS_sq         ; q is lower

        mov rax, [rdi + 8]
        cmp rax, [q + 8]
        jc rawAddLS_done        ; q is bigget so done.
        jnz rawAddLS_sq         ; q is lower

        mov rax, [rdi + 0]
        cmp rax, [q + 0]
        jc rawAddLS_done        ; q is bigget so done.
        jnz rawAddLS_sq         ; q is lower

        ; If equal substract q
rawAddLS_sq:

        mov rax, [q + 0]
        sub [rdi + 0], rax

        mov rax, [q + 8]
        sbb [rdi + 8], rax

        mov rax, [q + 16]
        sbb [rdi + 16], rax

        mov rax, [q + 24]
        sbb [rdi + 24], rax

rawAddLS_done:
        ret















;;;;;;;;;;;;;;;;;;;;;;
; sub
;;;;;;;;;;;;;;;;;;;;;;
; Substracts two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_sub:
        mov    rax, [rsi]
        mov    rcx, [rdx]
        bt     rax, 63          ; Check if is long first operand
        jc     sub_l1
        bt     rcx, 63          ; Check if is long second operand
        jc     sub_s1l2

sub_s1s2:                       ; Both operands are short

        xor    rdx, rdx
        mov    edx, eax
        sub    edx, ecx
        jo     sub_manageOverflow   ; rsi already is the 64bits result

        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

sub_manageOverflow:                 ; Do the operation in 64 bits
        push   rsi
        movsx  rsi, eax
        movsx  rdx, ecx
        sub    rsi, rdx
        call   rawCopyS2L
        pop    rsi
        ret

sub_l1:
        bt     rcx, 63          ; Check if is short second operand
        jc     sub_l1l2

;;;;;;;;
sub_l1s2:
        bt     rax, 62          ; check if montgomery first
        jc     sub_l1ms2
sub_l1ns2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rsi, 8
        movsx rdx, ecx
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_3
        neg rdx
        call rawAddLS
        sub rdi, 8
        sub rsi, 8
        ret
tmp_3:
        call rawSubLS
        sub rdi, 8
        sub rsi, 8
        ret


sub_l1ms2:
        bt     rcx, 62          ; check if montgomery second
        jc     sub_l1ms2m
sub_l1ms2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toMontgomery
        mov  rdx, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret


sub_l1ms2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret



;;;;;;;;
sub_s1l2:
        bt     rcx, 62          ; check if montgomery first
        jc     sub_s1l2m
sub_s1l2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp eax, 0
        
        js tmp_4

        ; First Operand is positive
        push rsi
        add rdi, 8
        movsx rsi, eax
        add rdx, 8
        call rawSubSL
        sub rdi, 8
        pop rsi
        ret

tmp_4:   ; First operand is negative
        push rsi
        lea rsi, [rdx + 8]
        movsx rdx, eax
        add rdi, 8
        neg rdx
        call rawNegLS
        sub rdi, 8
        pop rsi
        ret


sub_s1l2m:
        bt     rax, 62          ; check if montgomery second
        jc     sub_s1ml2m
sub_s1nl2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toMontgomery
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret


sub_s1ml2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret


;;;;
sub_l1l2:
        bt     rax, 62          ; check if montgomery first
        jc     sub_l1ml2
sub_l1nl2:
        bt     rcx, 62          ; check if montgomery second
        jc     sub_l1nl2m
sub_l1nl2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret


sub_l1nl2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toMontgomery
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret


sub_l1ml2:
        bt     rcx, 62          ; check if montgomery seconf
        jc     sub_l1ml2m
sub_l1ml2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toMontgomery
        mov  rdx, rdi
        pop  rdi

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret


sub_l1ml2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawSubLL
        sub rdi, 8
        sub rsi, 8
        ret



;;;;;;;;;;;;;;;;;;;;;;
; rawSubLS
;;;;;;;;;;;;;;;;;;;;;;
; Substracts a short element from the long element
; Params:
;   rdi <= Pointer to the long data of result
;   rsi <= Pointer to the long data of element 1 where will be substracted
;   rdx <= Value to be substracted
;   [rdi] = [rsi] - rdx
; Modified Registers:
;    rax
;;;;;;;;;;;;;;;;;;;;;;
rawSubLS:
        ; Substract first digit

        mov rax, [rsi]
        sub rax, rdx
        mov [rdi] ,rax
        mov rdx, 0

        mov rax, [rsi + 8]
        sbb rax, rdx
        mov [rdi + 8], rax

        mov rax, [rsi + 16]
        sbb rax, rdx
        mov [rdi + 16], rax

        mov rax, [rsi + 24]
        sbb rax, rdx
        mov [rdi + 24], rax

        jnc rawSubLS_done   ; if overflow, add q

        ; Add q
rawSubLS_aq:

        mov rax, [q + 0]
        add [rdi + 0], rax

        mov rax, [q + 8]
        adc [rdi + 8], rax

        mov rax, [q + 16]
        adc [rdi + 16], rax

        mov rax, [q + 24]
        adc [rdi + 24], rax

rawSubLS_done:
        ret


;;;;;;;;;;;;;;;;;;;;;;
; rawSubSL
;;;;;;;;;;;;;;;;;;;;;;
; Substracts a long element from a short element
; Params:
;   rdi <= Pointer to the long data of result
;   rsi <= Value from where will bo substracted
;   rdx <= Pointer to long of the value to be substracted
;
;   [rdi] = rsi - [rdx]
; Modified Registers:
;    rax
;;;;;;;;;;;;;;;;;;;;;;
rawSubSL:
        ; Substract first digit
        sub rsi, [rdx]
        mov [rdi] ,rsi


        mov rax, 0
        sbb rax, [rdx + 8]
        mov [rdi + 8], rax

        mov rax, 0
        sbb rax, [rdx + 16]
        mov [rdi + 16], rax

        mov rax, 0
        sbb rax, [rdx + 24]
        mov [rdi + 24], rax

        jnc rawSubSL_done   ; if overflow, add q

        ; Add q
rawSubSL_aq:

        mov rax, [q + 0]
        add [rdi + 0], rax

        mov rax, [q + 8]
        adc [rdi + 8], rax

        mov rax, [q + 16]
        adc [rdi + 16], rax

        mov rax, [q + 24]
        adc [rdi + 24], rax

rawSubSL_done:
        ret

;;;;;;;;;;;;;;;;;;;;;;
; rawSubLL
;;;;;;;;;;;;;;;;;;;;;;
; Substracts a long element from a short element
; Params:
;   rdi <= Pointer to the long data of result
;   rsi <= Pointer to long from where substracted
;   rdx <= Pointer to long of the value to be substracted
;
;   [rdi] = [rsi] - [rdx]
; Modified Registers:
;    rax
;;;;;;;;;;;;;;;;;;;;;;
rawSubLL:
        ; Substract first digit

        mov rax, [rsi + 0]
        sub rax, [rdx + 0]
        mov [rdi + 0], rax

        mov rax, [rsi + 8]
        sbb rax, [rdx + 8]
        mov [rdi + 8], rax

        mov rax, [rsi + 16]
        sbb rax, [rdx + 16]
        mov [rdi + 16], rax

        mov rax, [rsi + 24]
        sbb rax, [rdx + 24]
        mov [rdi + 24], rax

        jnc rawSubLL_done   ; if overflow, add q

        ; Add q
rawSubLL_aq:

        mov rax, [q + 0]
        add [rdi + 0], rax

        mov rax, [q + 8]
        adc [rdi + 8], rax

        mov rax, [q + 16]
        adc [rdi + 16], rax

        mov rax, [q + 24]
        adc [rdi + 24], rax

rawSubLL_done:
        ret

;;;;;;;;;;;;;;;;;;;;;;
; rawNegLS
;;;;;;;;;;;;;;;;;;;;;;
; Substracts a long element and a short element form 0
; Params:
;   rdi <= Pointer to the long data of result
;   rsi <= Pointer to long from where substracted
;   rdx <= short value to be substracted too
;
;   [rdi] = -[rsi] - rdx
; Modified Registers:
;    rax
;;;;;;;;;;;;;;;;;;;;;;
rawNegLS:
        mov rax, [q]
        sub rax, rdx
        mov [rdi], rax

        mov rax, [q + 8 ]
        sbb rax, 0
        mov [rdi + 8], rax

        mov rax, [q + 16 ]
        sbb rax, 0
        mov [rdi + 16], rax

        mov rax, [q + 24 ]
        sbb rax, 0
        mov [rdi + 24], rax

        setc dl


        mov rax, [rdi + 0 ]
        sub rax, [rsi + 0]
        mov [rdi + 0], rax

        mov rax, [rdi + 8 ]
        sbb rax, [rsi + 8]
        mov [rdi + 8], rax

        mov rax, [rdi + 16 ]
        sbb rax, [rsi + 16]
        mov [rdi + 16], rax

        mov rax, [rdi + 24 ]
        sbb rax, [rsi + 24]
        mov [rdi + 24], rax


        setc dh
        or dl, dh
        jz rawNegSL_done

        ; it is a negative value, so add q

        mov rax, [q + 0]
        add [rdi + 0], rax

        mov rax, [q + 8]
        adc [rdi + 8], rax

        mov rax, [q + 16]
        adc [rdi + 16], rax

        mov rax, [q + 24]
        adc [rdi + 24], rax


rawNegSL_done:
        ret







;;;;;;;;;;;;;;;;;;;;;;
; neg
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element to be negated
;   rdi <= Pointer to result
;   [rdi] = -[rsi]
;;;;;;;;;;;;;;;;;;;;;;
Fr_neg:
        mov    rax, [rsi]
        bt     rax, 63          ; Check if is short first operand
        jc     neg_l

neg_s:                          ; Operand is short

        neg    eax
        jo     neg_manageOverflow   ; Check if overflow. (0x80000000 is the only case)

        mov    [rdi], rax           ; not necessary to adjust so just save and return
        ret

neg_manageOverflow:                 ; Do the operation in 64 bits
        push   rsi
        movsx  rsi, eax
        neg    rsi
        call   rawCopyS2L
        pop    rsi
        ret



neg_l:
        mov [rdi], rax          ; Copy the type

        add rdi, 8
        add rsi, 8
        call rawNegL
        sub rdi, 8
        sub rsi, 8
        ret



;;;;;;;;;;;;;;;;;;;;;;
; rawNeg
;;;;;;;;;;;;;;;;;;;;;;
; Negates a value
; Params:
;   rdi <= Pointer to the long data of result
;   rsi <= Pointer to the long data of element 1
;
;   [rdi] = - [rsi]
;;;;;;;;;;;;;;;;;;;;;;
rawNegL:
        ; Compare is zero

        xor rax, rax

        cmp [rsi + 0], rax
        jnz doNegate

        cmp [rsi + 8], rax
        jnz doNegate

        cmp [rsi + 16], rax
        jnz doNegate

        cmp [rsi + 24], rax
        jnz doNegate

        ; it's zero so just set to zero

        mov [rdi + 0], rax

        mov [rdi + 8], rax

        mov [rdi + 16], rax

        mov [rdi + 24], rax

        ret
doNegate:

        mov rax, [q + 0]
        sub rax, [rsi + 0]
        mov [rdi + 0], rax

        mov rax, [q + 8]
        sbb rax, [rsi + 8]
        mov [rdi + 8], rax

        mov rax, [q + 16]
        sbb rax, [rsi + 16]
        mov [rdi + 16], rax

        mov rax, [q + 24]
        sbb rax, [rsi + 24]
        mov [rdi + 24], rax

        ret



















;;;;;;;;;;;;;;;;;;;;;;
; square
;;;;;;;;;;;;;;;;;;;;;;
; Squares a field element
; Params:
;   rsi <= Pointer to element 1
;   rdi <= Pointer to result
;   [rdi] = [rsi] * [rsi]
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_square:
        mov    r8, [rsi]
        bt     r8, 63          ; Check if is short first operand
        jc     square_l1

square_s1:                       ; Both operands are short

        xor    rax, rax
        mov    eax, r8d
        imul   eax
        jo     square_manageOverflow   ; rsi already is the 64bits result

        mov    [rdi], rax       ; not necessary to adjust so just save and return

square_manageOverflow:                 ; Do the operation in 64 bits
        push   rsi
        movsx  rax, r8d
        imul   rax
        mov    rsi, rax
        call   rawCopyS2L
        pop    rsi

        ret

square_l1:
        bt     r8, 62          ; check if montgomery first
        jc     square_l1m
square_l1n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        call rawMontgomerySquare
        sub rdi, 8
        sub rsi, 8


        push rsi
        add rdi, 8
        mov rsi, rdi
        lea rdx, [R3]
        call rawMontgomeryMul
        sub rdi, 8
        pop rsi

        ret

square_l1m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        call rawMontgomerySquare
        sub rdi, 8
        sub rsi, 8

        ret



;;;;;;;;;;;;;;;;;;;;;;
; mul
;;;;;;;;;;;;;;;;;;;;;;
; Multiplies two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result
;   [rdi] = [rsi] * [rdi]
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_mul:
        mov    r8, [rsi]
        mov    r9, [rdx]
        bt     r8, 63          ; Check if is short first operand
        jc     mul_l1
        bt     r9, 63          ; Check if is short second operand
        jc     mul_s1l2

mul_s1s2:                       ; Both operands are short

        xor    rax, rax
        mov    eax, r8d
        imul   r9d
        jo     mul_manageOverflow   ; rsi already is the 64bits result

        mov    [rdi], rax       ; not necessary to adjust so just save and return

mul_manageOverflow:                 ; Do the operation in 64 bits
        push   rsi
        movsx  rax, r8d
        movsx  rcx, r9d
        imul   rcx
        mov    rsi, rax
        call   rawCopyS2L
        pop    rsi

        ret

mul_l1:
        bt     r9, 63          ; Check if is short second operand
        jc     mul_l1l2

;;;;;;;;
mul_l1s2:
        bt     r8, 62          ; check if montgomery first
        jc     mul_l1ms2
mul_l1ns2:
        bt     r9, 62          ; check if montgomery first
        jc     mul_l1ns2m
mul_l1ns2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        push rsi
        add rsi, 8
        movsx rdx, r9d
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_5
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp_6
tmp_5:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp_6:



        push rsi
        add rdi, 8
        mov rsi, rdi
        lea rdx, [R3]
        call rawMontgomeryMul
        sub rdi, 8
        pop rsi

        ret


mul_l1ns2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret


mul_l1ms2:
        bt     r9, 62          ; check if montgomery second
        jc     mul_l1ms2m
mul_l1ms2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        push rsi
        add rsi, 8
        movsx rdx, r9d
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_7
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp_8
tmp_7:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp_8:


        ret

mul_l1ms2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret


;;;;;;;;
mul_s1l2:
        bt     r8, 62          ; check if montgomery first
        jc     mul_s1ml2
mul_s1nl2:
        bt     r9, 62          ; check if montgomery first
        jc     mul_s1nl2m
mul_s1nl2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        push rsi
        lea rsi, [rdx + 8]
        movsx rdx, r8d
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_9
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp_10
tmp_9:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp_10:



        push rsi
        add rdi, 8
        mov rsi, rdi
        lea rdx, [R3]
        call rawMontgomeryMul
        sub rdi, 8
        pop rsi

        ret

mul_s1nl2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        push rsi
        lea rsi, [rdx + 8]
        movsx rdx, r8d
        add rdi, 8
        cmp rdx, 0
        
        jns tmp_11
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp_12
tmp_11:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp_12:


        ret

mul_s1ml2:
        bt     r9, 62          ; check if montgomery first
        jc     mul_s1ml2m
mul_s1ml2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret

mul_s1ml2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret

;;;;
mul_l1l2:
        bt     r8, 62          ; check if montgomery first
        jc     mul_l1ml2
mul_l1nl2:
        bt     r9, 62          ; check if montgomery second
        jc     mul_l1nl2m
mul_l1nl2n:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8


        push rsi
        add rdi, 8
        mov rsi, rdi
        lea rdx, [R3]
        call rawMontgomeryMul
        sub rdi, 8
        pop rsi

        ret

mul_l1nl2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret

mul_l1ml2:
        bt     r9, 62          ; check if montgomery seconf
        jc     mul_l1ml2m
mul_l1ml2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret

mul_l1ml2m:
        mov r11b, 0xC0
        shl r11, 56
        mov [rdi], r11

        add rdi, 8
        add rsi, 8
        add rdx, 8
        call rawMontgomeryMul
        sub rdi, 8
        sub rsi, 8

        ret

















;;;;;;;;;;;;;;;;;;;;;;
; band
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_band:
        mov    r8, [rsi]
        mov    r9, [rdx]
        bt     r8, 63          ; Check if is short first operand
        jc     and_l1
        bt     r9, 63          ; Check if is short second operand
        jc     and_s1l2

and_s1s2:

        cmp    r8d, 0
        
        js     tmp_13

        cmp    r9d, 0
        js     tmp_13
        xor    rdx, rdx         ; both ops are positive so do the op and return
        mov    edx, r8d
        and    edx, r9d
        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

tmp_13:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret






and_l1:
        bt     r9, 63          ; Check if is short second operand
        jc     and_l1l2


and_l1s2:
        bt     r8, 62          ; check if montgomery first
        jc     and_l1ms2
and_l1ns2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp    r9d, 0
        
        js     tmp_14
        movsx  rax, r9d
        and rax, [rsi +8]
        mov    [rdi+8], rax

        xor    rax, rax
        and rax, [rsi + 16];

        mov    [rdi + 16 ], rax;

        xor    rax, rax
        and rax, [rsi + 24];

        mov    [rdi + 24 ], rax;

        xor    rax, rax
        and rax, [rsi + 32];

        and    rax, [lboMask] ;

        mov    [rdi + 32 ], rax;

        ret

tmp_14:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




and_l1ms2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push   r9              ; r9 is used in montgomery so we need to save it
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        pop    r9

        cmp    r9d, 0
        
        js     tmp_15
        movsx  rax, r9d
        and rax, [rsi +8]
        mov    [rdi+8], rax

        xor    rax, rax
        and rax, [rsi + 16];

        mov    [rdi + 16 ], rax;

        xor    rax, rax
        and rax, [rsi + 24];

        mov    [rdi + 24 ], rax;

        xor    rax, rax
        and rax, [rsi + 32];

        and    rax, [lboMask] ;

        mov    [rdi + 32 ], rax;

        ret

tmp_15:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret





and_s1l2:
        bt     r9, 62          ; check if montgomery first
        jc     and_s1l2m
and_s1l2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp    r8d, 0
        
        js     tmp_16
        movsx  rax, r8d
        and rax, [rdx +8]
        mov    [rdi+8], rax

        xor    rax, rax
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        xor    rax, rax
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        xor    rax, rax
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret

tmp_16:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




and_s1l2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push   r8             ; r8 is used in montgomery so we need to save it
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi
        pop    r8

        cmp    r8d, 0
        
        js     tmp_17
        movsx  rax, r8d
        and rax, [rdx +8]
        mov    [rdi+8], rax

        xor    rax, rax
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        xor    rax, rax
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        xor    rax, rax
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret

tmp_17:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret





and_l1l2:
        bt     r8, 62          ; check if montgomery first
        jc     and_l1ml2
        bt     r9, 62          ; check if montgomery first
        jc     and_l1nl2m
and_l1nl2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


and_l1nl2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


and_l1ml2:
        bt     r9, 62          ; check if montgomery first
        jc     and_l1ml2m
and_l1ml2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


and_l1ml2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi


        mov rax, [rsi + 8]
        and rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        and rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        and rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        and rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret



;;;;;;;;;;;;;;;;;;;;;;
; bor
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_bor:
        mov    r8, [rsi]
        mov    r9, [rdx]
        bt     r8, 63          ; Check if is short first operand
        jc     or_l1
        bt     r9, 63          ; Check if is short second operand
        jc     or_s1l2

or_s1s2:

        cmp    r8d, 0
        
        js     tmp_18

        cmp    r9d, 0
        js     tmp_18
        xor    rdx, rdx         ; both ops are positive so do the op and return
        mov    edx, r8d
        or    edx, r9d
        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

tmp_18:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret






or_l1:
        bt     r9, 63          ; Check if is short second operand
        jc     or_l1l2


or_l1s2:
        bt     r8, 62          ; check if montgomery first
        jc     or_l1ms2
or_l1ns2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp    r9d, 0
        
        js     tmp_19
        movsx  rax, r9d
        or rax, [rsi +8]
        mov    [rdi+8], rax

        xor    rax, rax
        or rax, [rsi + 16];

        mov    [rdi + 16 ], rax;

        xor    rax, rax
        or rax, [rsi + 24];

        mov    [rdi + 24 ], rax;

        xor    rax, rax
        or rax, [rsi + 32];

        and    rax, [lboMask] ;

        mov    [rdi + 32 ], rax;

        ret

tmp_19:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




or_l1ms2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push   r9              ; r9 is used in montgomery so we need to save it
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        pop    r9

        cmp    r9d, 0
        
        js     tmp_20
        movsx  rax, r9d
        or rax, [rsi +8]
        mov    [rdi+8], rax

        xor    rax, rax
        or rax, [rsi + 16];

        mov    [rdi + 16 ], rax;

        xor    rax, rax
        or rax, [rsi + 24];

        mov    [rdi + 24 ], rax;

        xor    rax, rax
        or rax, [rsi + 32];

        and    rax, [lboMask] ;

        mov    [rdi + 32 ], rax;

        ret

tmp_20:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret





or_s1l2:
        bt     r9, 62          ; check if montgomery first
        jc     or_s1l2m
or_s1l2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp    r8d, 0
        
        js     tmp_21
        movsx  rax, r8d
        or rax, [rdx +8]
        mov    [rdi+8], rax

        xor    rax, rax
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        xor    rax, rax
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        xor    rax, rax
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret

tmp_21:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




or_s1l2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push   r8             ; r8 is used in montgomery so we need to save it
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi
        pop    r8

        cmp    r8d, 0
        
        js     tmp_22
        movsx  rax, r8d
        or rax, [rdx +8]
        mov    [rdi+8], rax

        xor    rax, rax
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        xor    rax, rax
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        xor    rax, rax
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret

tmp_22:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret





or_l1l2:
        bt     r8, 62          ; check if montgomery first
        jc     or_l1ml2
        bt     r9, 62          ; check if montgomery first
        jc     or_l1nl2m
or_l1nl2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


or_l1nl2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


or_l1ml2:
        bt     r9, 62          ; check if montgomery first
        jc     or_l1ml2m
or_l1ml2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


or_l1ml2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi


        mov rax, [rsi + 8]
        or rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        or rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        or rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        or rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret



;;;;;;;;;;;;;;;;;;;;;;
; bxor
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_bxor:
        mov    r8, [rsi]
        mov    r9, [rdx]
        bt     r8, 63          ; Check if is short first operand
        jc     xor_l1
        bt     r9, 63          ; Check if is short second operand
        jc     xor_s1l2

xor_s1s2:

        cmp    r8d, 0
        
        js     tmp_23

        cmp    r9d, 0
        js     tmp_23
        xor    rdx, rdx         ; both ops are positive so do the op and return
        mov    edx, r8d
        xor    edx, r9d
        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

tmp_23:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret






xor_l1:
        bt     r9, 63          ; Check if is short second operand
        jc     xor_l1l2


xor_l1s2:
        bt     r8, 62          ; check if montgomery first
        jc     xor_l1ms2
xor_l1ns2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp    r9d, 0
        
        js     tmp_24
        movsx  rax, r9d
        xor rax, [rsi +8]
        mov    [rdi+8], rax

        xor    rax, rax
        xor rax, [rsi + 16];

        mov    [rdi + 16 ], rax;

        xor    rax, rax
        xor rax, [rsi + 24];

        mov    [rdi + 24 ], rax;

        xor    rax, rax
        xor rax, [rsi + 32];

        and    rax, [lboMask] ;

        mov    [rdi + 32 ], rax;

        ret

tmp_24:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




xor_l1ms2:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push   r9              ; r9 is used in montgomery so we need to save it
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        pop    r9

        cmp    r9d, 0
        
        js     tmp_25
        movsx  rax, r9d
        xor rax, [rsi +8]
        mov    [rdi+8], rax

        xor    rax, rax
        xor rax, [rsi + 16];

        mov    [rdi + 16 ], rax;

        xor    rax, rax
        xor rax, [rsi + 24];

        mov    [rdi + 24 ], rax;

        xor    rax, rax
        xor rax, [rsi + 32];

        and    rax, [lboMask] ;

        mov    [rdi + 32 ], rax;

        ret

tmp_25:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret





xor_s1l2:
        bt     r9, 62          ; check if montgomery first
        jc     xor_s1l2m
xor_s1l2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        cmp    r8d, 0
        
        js     tmp_26
        movsx  rax, r8d
        xor rax, [rdx +8]
        mov    [rdi+8], rax

        xor    rax, rax
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        xor    rax, rax
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        xor    rax, rax
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret

tmp_26:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




xor_s1l2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push   r8             ; r8 is used in montgomery so we need to save it
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi
        pop    r8

        cmp    r8d, 0
        
        js     tmp_27
        movsx  rax, r8d
        xor rax, [rdx +8]
        mov    [rdi+8], rax

        xor    rax, rax
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        xor    rax, rax
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        xor    rax, rax
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret

tmp_27:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret





xor_l1l2:
        bt     r8, 62          ; check if montgomery first
        jc     xor_l1ml2
        bt     r9, 62          ; check if montgomery first
        jc     xor_l1nl2m
xor_l1nl2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


xor_l1nl2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


xor_l1ml2:
        bt     r9, 62          ; check if montgomery first
        jc     xor_l1ml2m
xor_l1ml2n:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret


xor_l1ml2m:
        mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi


        mov rax, [rsi + 8]
        xor rax, [rdx + 8]

        mov    [rdi + 8 ], rax

        mov rax, [rsi + 16]
        xor rax, [rdx + 16]

        mov    [rdi + 16 ], rax

        mov rax, [rsi + 24]
        xor rax, [rdx + 24]

        mov    [rdi + 24 ], rax

        mov rax, [rsi + 32]
        xor rax, [rdx + 32]

        and    rax, [lboMask]

        mov    [rdi + 32 ], rax

        ret




;;;;;;;;;;;;;;;;;;;;;;
; bnot
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdi <= Pointer to result
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_bnot:
                mov r11b, 0x80
        shl r11, 56
        mov [rdi], r11

        mov     r8, [rsi]
        bt      r8, 63          ; Check if is long operand
        jc      bnot_l1
bnot_s:
                push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        jmp     bnot_l1n

bnot_l1:
        bt     r8, 62          ; check if montgomery first
        jnc    bnot_l1n

bnot_l1m:
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi

bnot_l1n:

        mov    rax, [rsi + 8]
        not    rax

        mov    [rdi + 8], rax

        mov    rax, [rsi + 16]
        not    rax

        mov    [rdi + 16], rax

        mov    rax, [rsi + 24]
        not    rax

        mov    [rdi + 24], rax

        mov    rax, [rsi + 32]
        not    rax

        and    rax, [lboMask]

        mov    [rdi + 32], rax

        ret






;;;;;;;;;;;;;;;;;;;;;;
; rgt - Raw Greater Than
;;;;;;;;;;;;;;;;;;;;;;
; returns in ax 1 id *rsi > *rdx
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rax <= Return 1 or 0
; Modified Registers:
;    r8, r9, rax
;;;;;;;;;;;;;;;;;;;;;;
Fr_rgt:
        mov    r8, [rsi]
        mov    r9, [rdx]
        bt     r8, 63          ; Check if is short first operand
        jc     rgt_l1
        bt     r9, 63          ; Check if is short second operand
        jc     rgt_s1l2

rgt_s1s2:                       ; Both operands are short
        cmp    r8d, r9d
        jg     rgt_ret1
        jmp    rgt_ret0


rgt_l1:
        bt     r9, 63          ; Check if is short second operand
        jc     rgt_l1l2

;;;;;;;;
rgt_l1s2:
        bt     r8, 62          ; check if montgomery first
        jc     rgt_l1ms2
rgt_l1ns2:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        jmp rgtL1L2

rgt_l1ms2:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        jmp rgtL1L2


;;;;;;;;
rgt_s1l2:
        bt     r9, 62          ; check if montgomery second
        jc     rgt_s1l2m
rgt_s1l2n:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        jmp rgtL1L2

rgt_s1l2m:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi
        jmp rgtL1L2

;;;;
rgt_l1l2:
        bt     r8, 62          ; check if montgomery first
        jc     rgt_l1ml2
rgt_l1nl2:
        bt     r9, 62          ; check if montgomery second
        jc     rgt_l1nl2m
rgt_l1nl2n:
        jmp rgtL1L2

rgt_l1nl2m:
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi
        jmp rgtL1L2

rgt_l1ml2:
        bt     r9, 62          ; check if montgomery second
        jc     rgt_l1ml2m
rgt_l1ml2n:
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        jmp rgtL1L2

rgt_l1ml2m:
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toNormal
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        push rdi
        mov  rdi, rdx
        call Fr_toNormal
        mov  rdx, rdi
        pop  rdi
        jmp rgtL1L2


;;;;;;
; rgtL1L2
;;;;;;

rgtL1L2:


        mov     rax, [rsi + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc rgtl1l2_n1                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgtl1l2_p1                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rsi + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc rgtl1l2_n1                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgtl1l2_p1                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rsi + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc rgtl1l2_n1                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgtl1l2_p1                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rsi + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc rgtl1l2_n1                           ; half<rax => e1-e2 is neg => e1 < e2

        jmp rgtl1l2_p1



rgtl1l2_p1:


        mov     rax, [rdx + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc rgt_ret1                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgtRawL1L2                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rdx + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc rgt_ret1                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgtRawL1L2                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rdx + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc rgt_ret1                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgtRawL1L2                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rdx + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc rgt_ret1                           ; half<rax => e1-e2 is neg => e1 < e2

        jmp rgtRawL1L2




rgtl1l2_n1:


        mov     rax, [rdx + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc rgtRawL1L2                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgt_ret0                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rdx + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc rgtRawL1L2                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgt_ret0                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rdx + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc rgtRawL1L2                           ; half<rax => e1-e2 is neg => e1 < e2

        jnz rgt_ret0                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rdx + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc rgtRawL1L2                           ; half<rax => e1-e2 is neg => e1 < e2

        jmp rgt_ret0





rgtRawL1L2:

        mov     rax, [rsi + 32]
        cmp     [rdx + 32], rax     ; comare with (q-1)/2
        jc rgt_ret1                      ; rsi<rdi => 1st > 2nd

        jnz rgt_ret0                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rsi + 24]
        cmp     [rdx + 24], rax     ; comare with (q-1)/2
        jc rgt_ret1                      ; rsi<rdi => 1st > 2nd

        jnz rgt_ret0                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rsi + 16]
        cmp     [rdx + 16], rax     ; comare with (q-1)/2
        jc rgt_ret1                      ; rsi<rdi => 1st > 2nd

        jnz rgt_ret0                       ; half>rax => e1 -e2 is pos => e1 > e2


        mov     rax, [rsi + 8]
        cmp     [rdx + 8], rax     ; comare with (q-1)/2
        jc rgt_ret1                      ; rsi<rdi => 1st > 2nd



rgt_ret0:
        xor    rax, rax
        ret
rgt_ret1:
        mov    rax, 1
        ret



;;;;;;;;;;;;;;;;;;;;;;
; req - Raw Eq
;;;;;;;;;;;;;;;;;;;;;;
; returns in ax 1 id *rsi == *rdx
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rax <= Return 1 or 0
; Modified Registers:
;    r8, r9, rax
;;;;;;;;;;;;;;;;;;;;;;
Fr_req:
        mov    r8, [rsi]
        mov    r9, [rdx]
        bt     r8, 63          ; Check if is short first operand
        jc     req_l1
        bt     r9, 63          ; Check if is short second operand
        jc     req_s1l2

req_s1s2:                       ; Both operands are short
        cmp    r8d, r9d
        je     req_ret1
        jmp    req_ret0


req_l1:
        bt     r9, 63          ; Check if is short second operand
        jc     req_l1l2

;;;;;;;;
req_l1s2:
        bt     r8, 62          ; check if montgomery first
        jc     req_l1ms2
req_l1ns2:
        push  rdi
        push   rsi
        mov   rdi, rdx
        movsx rsi, r9d
        call  rawCopyS2L
        mov   rdx, rdi
        pop   rsi
        pop   rdi
        jmp reqL1L2

req_l1ms2:
        push rdi
        mov  rdi, rdx
        call Fr_toMontgomery
        mov  rdx, rdi
        pop  rdi
        jmp reqL1L2


;;;;;;;;
req_s1l2:
        bt     r9, 62          ; check if montgomery second
        jc     req_s1l2m
req_s1l2n:
        push  rdi
        push  rdx
        mov   rdi, rsi
        movsx rsi, r8d
        call  rawCopyS2L
        mov   rsi, rdi
        pop   rdx
        pop   rdi
        jmp reqL1L2

req_s1l2m:
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toMontgomery
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        jmp reqL1L2

;;;;
req_l1l2:
        bt     r8, 62          ; check if montgomery first
        jc     req_l1ml2
req_l1nl2:
        bt     r9, 62          ; check if montgomery second
        jc     req_l1nl2m
req_l1nl2n:
        jmp reqL1L2

req_l1nl2m:
        push rdi
        mov  rdi, rsi
        mov  rsi, rdx
        call Fr_toMontgomery
        mov  rdx, rsi
        mov  rsi, rdi
        pop  rdi
        jmp reqL1L2

req_l1ml2:
        bt     r9, 62          ; check if montgomery second
        jc     req_l1ml2m
req_l1ml2n:
        push rdi
        mov  rdi, rdx
        call Fr_toMontgomery
        mov  rdx, rdi
        pop  rdi
        jmp reqL1L2

req_l1ml2m:
        jmp reqL1L2


;;;;;;
; eqL1L2
;;;;;;

reqL1L2:

        mov     rax, [rsi + 8]
        cmp     [rdx + 8], rax
        jne     req_ret0                      ; rsi<rdi => 1st > 2nd

        mov     rax, [rsi + 16]
        cmp     [rdx + 16], rax
        jne     req_ret0                      ; rsi<rdi => 1st > 2nd

        mov     rax, [rsi + 24]
        cmp     [rdx + 24], rax
        jne     req_ret0                      ; rsi<rdi => 1st > 2nd

        mov     rax, [rsi + 32]
        cmp     [rdx + 32], rax
        jne     req_ret0                      ; rsi<rdi => 1st > 2nd


req_ret1:
        mov    rax, 1
        ret

req_ret0:
        xor    rax, rax
        ret


;;;;;;;;;;;;;;;;;;;;;;
; gt
;;;;;;;;;;;;;;;;;;;;;;
; Compares two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_gt:
        call Fr_rgt
        mov [rdi], rax
        ret

;;;;;;;;;;;;;;;;;;;;;;
; eq
;;;;;;;;;;;;;;;;;;;;;;
; Compares two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_eq:
        call Fr_req
        mov [rdi], rax
        ret

Fr_geq:
Fr_leq:
Fr_lt:
Fr_neq:











;;;;;;;;;;;;;;;;;;;;;;
; land
;;;;;;;;;;;;;;;;;;;;;;
; Logical and between two elements
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result zero or one
; Modified Registers:
;    rax, rcx, r8
;;;;;;;;;;;;;;;;;;;;;;
Fr_land:






    mov     rax, [rsi]
    bt      rax, 63
    jc      tmp_28

    test    eax, eax
    jz      retZero_30
    jmp     retOne_29

tmp_28:

    mov     rax, [rsi + 8]
    test    rax, rax
    jnz     retOne_29

    mov     rax, [rsi + 16]
    test    rax, rax
    jnz     retOne_29

    mov     rax, [rsi + 24]
    test    rax, rax
    jnz     retOne_29

    mov     rax, [rsi + 32]
    test    rax, rax
    jnz     retOne_29


retZero_30:
    mov     qword r8, 0
    jmp     done_31

retOne_29:
    mov     qword r8, 1

done_31:







    mov     rax, [rdx]
    bt      rax, 63
    jc      tmp_32

    test    eax, eax
    jz      retZero_34
    jmp     retOne_33

tmp_32:

    mov     rax, [rdx + 8]
    test    rax, rax
    jnz     retOne_33

    mov     rax, [rdx + 16]
    test    rax, rax
    jnz     retOne_33

    mov     rax, [rdx + 24]
    test    rax, rax
    jnz     retOne_33

    mov     rax, [rdx + 32]
    test    rax, rax
    jnz     retOne_33


retZero_34:
    mov     qword rcx, 0
    jmp     done_35

retOne_33:
    mov     qword rcx, 1

done_35:

        and rcx, r8
        mov [rdi], rcx
        ret


;;;;;;;;;;;;;;;;;;;;;;
; lor
;;;;;;;;;;;;;;;;;;;;;;
; Logical or between two elements
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result zero or one
; Modified Registers:
;    rax, rcx, r8
;;;;;;;;;;;;;;;;;;;;;;
Fr_lor:






    mov     rax, [rsi]
    bt      rax, 63
    jc      tmp_36

    test    eax, eax
    jz      retZero_38
    jmp     retOne_37

tmp_36:

    mov     rax, [rsi + 8]
    test    rax, rax
    jnz     retOne_37

    mov     rax, [rsi + 16]
    test    rax, rax
    jnz     retOne_37

    mov     rax, [rsi + 24]
    test    rax, rax
    jnz     retOne_37

    mov     rax, [rsi + 32]
    test    rax, rax
    jnz     retOne_37


retZero_38:
    mov     qword r8, 0
    jmp     done_39

retOne_37:
    mov     qword r8, 1

done_39:







    mov     rax, [rdx]
    bt      rax, 63
    jc      tmp_40

    test    eax, eax
    jz      retZero_42
    jmp     retOne_41

tmp_40:

    mov     rax, [rdx + 8]
    test    rax, rax
    jnz     retOne_41

    mov     rax, [rdx + 16]
    test    rax, rax
    jnz     retOne_41

    mov     rax, [rdx + 24]
    test    rax, rax
    jnz     retOne_41

    mov     rax, [rdx + 32]
    test    rax, rax
    jnz     retOne_41


retZero_42:
    mov     qword rcx, 0
    jmp     done_43

retOne_41:
    mov     qword rcx, 1

done_43:

        or rcx, r8
        mov [rdi], rcx
        ret


;;;;;;;;;;;;;;;;;;;;;;
; lnot
;;;;;;;;;;;;;;;;;;;;;;
; Do the logical not of an element
; Params:
;   rsi <= Pointer to element to be tested
;   rdi <= Pointer to result one if element1 is zero and zero otherwise
; Modified Registers:
;    rax, rax, r8
;;;;;;;;;;;;;;;;;;;;;;
Fr_lnot:






    mov     rax, [rsi]
    bt      rax, 63
    jc      tmp_44

    test    eax, eax
    jz      retZero_46
    jmp     retOne_45

tmp_44:

    mov     rax, [rsi + 8]
    test    rax, rax
    jnz     retOne_45

    mov     rax, [rsi + 16]
    test    rax, rax
    jnz     retOne_45

    mov     rax, [rsi + 24]
    test    rax, rax
    jnz     retOne_45

    mov     rax, [rsi + 32]
    test    rax, rax
    jnz     retOne_45


retZero_46:
    mov     qword rcx, 0
    jmp     done_47

retOne_45:
    mov     qword rcx, 1

done_47:

        test rcx, rcx

        jz lnot_retOne
lnot_retZero:
        mov qword [rdi], 0
        ret
lnot_retOne:
        mov qword [rdi], 1
        ret


;;;;;;;;;;;;;;;;;;;;;;
; isTrue
;;;;;;;;;;;;;;;;;;;;;;
; Convert a 64 bit integer to a long format field element
; Params:
;   rsi <= Pointer to the element
; Returs:
;   rax <= 1 if true 0 if false
;;;;;;;;;;;;;;;;;;;;;;;
Fr_isTrue:
        





    mov     rax, [rdi]
    bt      rax, 63
    jc      tmp_48

    test    eax, eax
    jz      retZero_50
    jmp     retOne_49

tmp_48:

    mov     rax, [rdi + 8]
    test    rax, rax
    jnz     retOne_49

    mov     rax, [rdi + 16]
    test    rax, rax
    jnz     retOne_49

    mov     rax, [rdi + 24]
    test    rax, rax
    jnz     retOne_49

    mov     rax, [rdi + 32]
    test    rax, rax
    jnz     retOne_49


retZero_50:
    mov     qword rax, 0
    jmp     done_51

retOne_49:
    mov     qword rax, 1

done_51:

        ret





        section .data
Fr_q:
        dd      0
        dd      0x80000000
q       dq      0x43e1f593f0000001,0x2833e84879b97091,0xb85045b68181585d,0x30644e72e131a029
half    dq      0xa1f0fac9f8000000,0x9419f4243cdcb848,0xdc2822db40c0ac2e,0x183227397098d014
R2      dq      0x1bb8e645ae216da7,0x53fe3ab1e35c59e3,0x8c49833d53bb8085,0x0216d0b17f4e44a5
R3      dq      0x5e94d8e1b4bf0040,0x2a489cbe1cfbb6b8,0x893cc664a19fcfed,0x0cf8594b7fcc657c
lboMask dq      0x1fffffffffffffff

