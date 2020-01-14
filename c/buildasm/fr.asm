

        global Fr_add
        global Fr_sub
        global Fr_neg
        global Fr_mul
        global Fr_band
        global Fr_bor
        global Fr_bxor
        global Fr_eq
        global Fr_neq
        global Fr_lt
        global Fr_gt
        global Fr_leq
        global Fr_geq
        global Fr_toNormal
        global Fr_toMontgomery
        global Fr_q
        DEFAULT REL

        section .text


















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
    jnc     fromMontgomery_doNothing
    bt      rax, 63                     ; if short, it means it's converted
    jnc      fromMontgomery_doNothing

fromMontgomeryLong:
    mov     [rdi], rax
    add     rdi, 8
    call    rawFromMontgomery
    sub     rdi, 8

fromMontgomery_doNothing:
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
        
        jns tmp1
        neg rdx
        call rawSubLS
        sub rdi, 8
        sub rsi, 8
        ret
tmp1:
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
        
        jns tmp2
        neg rdx
        call rawSubLS
        sub rdi, 8
        sub rsi, 8
        ret
tmp2:
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
        
        jns tmp3
        neg rdx
        call rawAddLS
        sub rdi, 8
        sub rsi, 8
        ret
tmp3:
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
        
        js tmp4

        ; First Operand is positive
        push rsi
        add rdi, 8
        movsx rsi, eax
        add rdx, 8
        call rawSubSL
        sub rdi, 8
        pop rsi
        ret

tmp4:   ; First operand is negative
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
        
        jns tmp5
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp6
tmp5:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp6:



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
        
        jns tmp7
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp8
tmp7:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp8:


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
        
        jns tmp9
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp10
tmp9:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp10:



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
        
        jns tmp11
        neg rdx
        call rawMontgomeryMul1
        mov rsi, rdi
        call rawNegL
        sub rdi, 8
        pop rsi
        
        jmp tmp12
tmp11:
        call rawMontgomeryMul1
        sub rdi, 8
        pop rsi
tmp12:


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
; and
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
        
        js     tmp13

        cmp    r9d, 0
        js     tmp13
        xor    rdx, rdx         ; both ops are positive so do the op and return
        mov    edx, r8d
        and    edx, r9d
        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

tmp13:
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
        
        js     tmp14
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

tmp14:
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
        
        js     tmp15
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

tmp15:
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
        
        js     tmp16
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

tmp16:
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
        
        js     tmp17
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

tmp17:
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
; or
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
        
        js     tmp18

        cmp    r9d, 0
        js     tmp18
        xor    rdx, rdx         ; both ops are positive so do the op and return
        mov    edx, r8d
        or    edx, r9d
        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

tmp18:
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
        
        js     tmp19
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

tmp19:
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
        
        js     tmp20
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

tmp20:
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
        
        js     tmp21
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

tmp21:
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
        
        js     tmp22
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

tmp22:
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
; xor
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
        
        js     tmp23

        cmp    r9d, 0
        js     tmp23
        xor    rdx, rdx         ; both ops are positive so do the op and return
        mov    edx, r8d
        xor    edx, r9d
        mov    [rdi], rdx       ; not necessary to adjust so just save and return
        ret

tmp23:
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
        
        js     tmp24
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

tmp24:
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
        
        js     tmp25
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

tmp25:
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
        
        js     tmp26
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

tmp26:
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
        
        js     tmp27
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

tmp27:
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
; eq
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_eq:
    sub     rsp, 40  ; Save space for the result of the substraction
    push    rdi                    ; Save rdi
    lea     rdi, [rsp+8]           ; We pushed rdi so we need to add 8
    call    Fr_sub          ; Do a substraction
    call    Fr_toNormal     ; Convert it to normal
    pop     rdi

    mov     rax, [rsp]             ; We already poped do no need to add 8
    bt      rax, 63                ; check is result is long
    jc      eq_longCmp

eq_shortCmp:
    cmp     eax, 0
    je      eq_s_eq
    js      eq_s_lt
eq_s_gt:

        mov qword [rdi], 0
        add rsp, 40
        ret

eq_s_lt:

        mov qword [rdi], 0
        add rsp, 40
        ret

eq_s_eq:

        mov qword [rdi], 1
        add rsp, 40
        ret


eq_longCmp:


    cmp     qword [rsp + 32], 0
    jnz eq_neq

    cmp     qword [rsp + 24], 0
    jnz eq_neq

    cmp     qword [rsp + 16], 0
    jnz eq_neq

    cmp     qword [rsp + 8], 0
    jnz eq_neq

eq_eq:

        mov qword [rdi], 1
        add rsp, 40
        ret

eq_neq:

        mov qword [rdi], 0
        add rsp, 40
        ret





;;;;;;;;;;;;;;;;;;;;;;
; neq
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_neq:
    sub     rsp, 40  ; Save space for the result of the substraction
    push    rdi                    ; Save rdi
    lea     rdi, [rsp+8]           ; We pushed rdi so we need to add 8
    call    Fr_sub          ; Do a substraction
    call    Fr_toNormal     ; Convert it to normal
    pop     rdi

    mov     rax, [rsp]             ; We already poped do no need to add 8
    bt      rax, 63                ; check is result is long
    jc      neq_longCmp

neq_shortCmp:
    cmp     eax, 0
    je      neq_s_eq
    js      neq_s_lt
neq_s_gt:

        mov qword [rdi], 1
        add rsp, 40
        ret

neq_s_lt:

        mov qword [rdi], 1
        add rsp, 40
        ret

neq_s_eq:

        mov qword [rdi], 0
        add rsp, 40
        ret


neq_longCmp:


    cmp     qword [rsp + 32], 0
    jnz neq_neq

    cmp     qword [rsp + 24], 0
    jnz neq_neq

    cmp     qword [rsp + 16], 0
    jnz neq_neq

    cmp     qword [rsp + 8], 0
    jnz neq_neq

neq_eq:

        mov qword [rdi], 0
        add rsp, 40
        ret

neq_neq:

        mov qword [rdi], 1
        add rsp, 40
        ret





;;;;;;;;;;;;;;;;;;;;;;
; lt
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_lt:
    sub     rsp, 40  ; Save space for the result of the substraction
    push    rdi                    ; Save rdi
    lea     rdi, [rsp+8]           ; We pushed rdi so we need to add 8
    call    Fr_sub          ; Do a substraction
    call    Fr_toNormal     ; Convert it to normal
    pop     rdi

    mov     rax, [rsp]             ; We already poped do no need to add 8
    bt      rax, 63                ; check is result is long
    jc      lt_longCmp

lt_shortCmp:
    cmp     eax, 0
    je      lt_s_eq
    js      lt_s_lt
lt_s_gt:

        mov qword [rdi], 0
        add rsp, 40
        ret

lt_s_lt:

        mov qword [rdi], 1
        add rsp, 40
        ret

lt_s_eq:

        mov qword [rdi], 0
        add rsp, 40
        ret


lt_longCmp:


    cmp     qword [rsp + 32], 0
    jnz lt_neq

    cmp     qword [rsp + 24], 0
    jnz lt_neq

    cmp     qword [rsp + 16], 0
    jnz lt_neq

    cmp     qword [rsp + 8], 0
    jnz lt_neq

lt_eq:



        mov qword [rdi], 0
        add rsp, 40
        ret






        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp29                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp28                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp29                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp28                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp29                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp28                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp29                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp28                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp28:

        mov qword [rdi], 0
        add rsp, 40
        ret

tmp29:

        mov qword [rdi], 1
        add rsp, 40
        ret


lt_neq:








        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp31                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp30                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp31                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp30                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp31                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp30                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp31                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp30                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp30:

        mov qword [rdi], 0
        add rsp, 40
        ret

tmp31:

        mov qword [rdi], 1
        add rsp, 40
        ret






;;;;;;;;;;;;;;;;;;;;;;
; gt
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_gt:
    sub     rsp, 40  ; Save space for the result of the substraction
    push    rdi                    ; Save rdi
    lea     rdi, [rsp+8]           ; We pushed rdi so we need to add 8
    call    Fr_sub          ; Do a substraction
    call    Fr_toNormal     ; Convert it to normal
    pop     rdi

    mov     rax, [rsp]             ; We already poped do no need to add 8
    bt      rax, 63                ; check is result is long
    jc      gt_longCmp

gt_shortCmp:
    cmp     eax, 0
    je      gt_s_eq
    js      gt_s_lt
gt_s_gt:

        mov qword [rdi], 1
        add rsp, 40
        ret

gt_s_lt:

        mov qword [rdi], 0
        add rsp, 40
        ret

gt_s_eq:

        mov qword [rdi], 0
        add rsp, 40
        ret


gt_longCmp:


    cmp     qword [rsp + 32], 0
    jnz gt_neq

    cmp     qword [rsp + 24], 0
    jnz gt_neq

    cmp     qword [rsp + 16], 0
    jnz gt_neq

    cmp     qword [rsp + 8], 0
    jnz gt_neq

gt_eq:



        mov qword [rdi], 0
        add rsp, 40
        ret






        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp33                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp32                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp33                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp32                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp33                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp32                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp33                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp32                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp32:

        mov qword [rdi], 1
        add rsp, 40
        ret

tmp33:

        mov qword [rdi], 0
        add rsp, 40
        ret


gt_neq:








        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp35                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp34                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp35                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp34                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp35                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp34                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp35                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp34                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp34:

        mov qword [rdi], 1
        add rsp, 40
        ret

tmp35:

        mov qword [rdi], 0
        add rsp, 40
        ret






;;;;;;;;;;;;;;;;;;;;;;
; leq
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_leq:
    sub     rsp, 40  ; Save space for the result of the substraction
    push    rdi                    ; Save rdi
    lea     rdi, [rsp+8]           ; We pushed rdi so we need to add 8
    call    Fr_sub          ; Do a substraction
    call    Fr_toNormal     ; Convert it to normal
    pop     rdi

    mov     rax, [rsp]             ; We already poped do no need to add 8
    bt      rax, 63                ; check is result is long
    jc      leq_longCmp

leq_shortCmp:
    cmp     eax, 0
    je      leq_s_eq
    js      leq_s_lt
leq_s_gt:

        mov qword [rdi], 0
        add rsp, 40
        ret

leq_s_lt:

        mov qword [rdi], 1
        add rsp, 40
        ret

leq_s_eq:

        mov qword [rdi], 1
        add rsp, 40
        ret


leq_longCmp:


    cmp     qword [rsp + 32], 0
    jnz leq_neq

    cmp     qword [rsp + 24], 0
    jnz leq_neq

    cmp     qword [rsp + 16], 0
    jnz leq_neq

    cmp     qword [rsp + 8], 0
    jnz leq_neq

leq_eq:



        mov qword [rdi], 1
        add rsp, 40
        ret






        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp37                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp36                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp37                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp36                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp37                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp36                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp37                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp36                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp36:

        mov qword [rdi], 0
        add rsp, 40
        ret

tmp37:

        mov qword [rdi], 1
        add rsp, 40
        ret


leq_neq:








        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp39                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp38                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp39                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp38                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp39                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp38                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp39                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp38                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp38:

        mov qword [rdi], 0
        add rsp, 40
        ret

tmp39:

        mov qword [rdi], 1
        add rsp, 40
        ret






;;;;;;;;;;;;;;;;;;;;;;
; geq
;;;;;;;;;;;;;;;;;;;;;;
; Adds two elements of any kind
; Params:
;   rsi <= Pointer to element 1
;   rdx <= Pointer to element 2
;   rdi <= Pointer to result can be zero or one.
; Modified Registers:
;    r8, r9, 10, r11, rax, rcx
;;;;;;;;;;;;;;;;;;;;;;
Fr_geq:
    sub     rsp, 40  ; Save space for the result of the substraction
    push    rdi                    ; Save rdi
    lea     rdi, [rsp+8]           ; We pushed rdi so we need to add 8
    call    Fr_sub          ; Do a substraction
    call    Fr_toNormal     ; Convert it to normal
    pop     rdi

    mov     rax, [rsp]             ; We already poped do no need to add 8
    bt      rax, 63                ; check is result is long
    jc      geq_longCmp

geq_shortCmp:
    cmp     eax, 0
    je      geq_s_eq
    js      geq_s_lt
geq_s_gt:

        mov qword [rdi], 1
        add rsp, 40
        ret

geq_s_lt:

        mov qword [rdi], 0
        add rsp, 40
        ret

geq_s_eq:

        mov qword [rdi], 1
        add rsp, 40
        ret


geq_longCmp:


    cmp     qword [rsp + 32], 0
    jnz geq_neq

    cmp     qword [rsp + 24], 0
    jnz geq_neq

    cmp     qword [rsp + 16], 0
    jnz geq_neq

    cmp     qword [rsp + 8], 0
    jnz geq_neq

geq_eq:



        mov qword [rdi], 1
        add rsp, 40
        ret






        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp41                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp40                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp41                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp40                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp41                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp40                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp41                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp40                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp40:

        mov qword [rdi], 1
        add rsp, 40
        ret

tmp41:

        mov qword [rdi], 0
        add rsp, 40
        ret


geq_neq:








        mov     rax, [rsp + 32]
        cmp     [half + 24], rax     ; comare with (q-1)/2
        jc tmp43                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp42                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 24]
        cmp     [half + 16], rax     ; comare with (q-1)/2
        jc tmp43                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp42                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 16]
        cmp     [half + 8], rax     ; comare with (q-1)/2
        jc tmp43                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp42                       ; half>rax => e1 -e2 is pos => e1 > e2

        mov     rax, [rsp + 8]
        cmp     [half + 0], rax     ; comare with (q-1)/2
        jc tmp43                           ; half<rax => e1-e2 is neg => e1 < e2
        jnz tmp42                       ; half>rax => e1 -e2 is pos => e1 > e2

                                                ; half == rax => e1-e2 is pos => e1 > e2
tmp42:

        mov qword [rdi], 1
        add rsp, 40
        ret

tmp43:

        mov qword [rdi], 0
        add rsp, 40
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

