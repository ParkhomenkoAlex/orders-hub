(module
    ;; JavaScript writes signed 32-bit USD-cent values to linear memory.
    (memory (export "memory") 1 1)

    (func (export "sum_cents") (param $pointer i32) (param $length i32) (result i64)
        (local $index i32)
        (local $total i64)

        (block $done
            (loop $sum
                (br_if $done (i32.ge_s (local.get $index) (local.get $length)))
                (local.set $total
                    (i64.add
                        (local.get $total)
                        (i64.extend_i32_s
                            (i32.load
                                (i32.add
                                    (local.get $pointer)
                                    (i32.mul (local.get $index) (i32.const 4)))))))
                (local.set $index (i32.add (local.get $index) (i32.const 1)))
                (br $sum)))

        (local.get $total)))
