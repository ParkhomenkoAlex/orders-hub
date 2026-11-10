import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const outputPath = resolve(root, "public/wasm/inventory-value.wasm");
const encoder = new TextEncoder();

const u32 = (value) => {
    const bytes = [];
    let remaining = value;

    do {
        let byte = remaining & 0x7f;
        remaining >>>= 7;
        if (remaining) byte |= 0x80;
        bytes.push(byte);
    } while (remaining);

    return bytes;
};

const string = (value) => [...u32(encoder.encode(value).length), ...encoder.encode(value)];
const vector = (...values) => [...u32(values.length), ...values.flat()];
const section = (id, payload) => [id, ...u32(payload.length), ...payload];

const typeSection = section(1, [
    ...u32(1), // one function type
    0x60,
    ...u32(2),
    0x7f,
    0x7f, // two i32 parameters
    ...u32(1),
    0x7e, // one i64 result
]);
const functionSection = section(3, vector([0x00]));
const memorySection = section(5, vector([0x01, 0x01, 0x01]));
const exportSection = section(
    7,
    vector([...string("memory"), 0x02, 0x00], [...string("sum_cents"), 0x00, 0x00]),
);

// This instruction sequence is the binary encoding of wasm/inventory-value.wat.
const functionBody = [
    ...vector([0x01, 0x7f], [0x01, 0x7e]), // local i32 index; local i64 total
    0x02,
    0x40, // block $done
    0x03,
    0x40, // loop $sum
    0x20,
    0x02, // local.get $index
    0x20,
    0x01, // local.get $length
    0x4e, // i32.ge_s
    0x0d,
    0x01, // br_if $done
    0x20,
    0x03, // local.get $total
    0x20,
    0x00, // local.get $pointer
    0x20,
    0x02, // local.get $index
    0x41,
    0x04, // i32.const 4
    0x6c, // i32.mul
    0x6a, // i32.add
    0x28,
    0x02,
    0x00, // i32.load align=4 offset=0
    0xac, // i64.extend_i32_s
    0x7c, // i64.add
    0x21,
    0x03, // local.set $total
    0x20,
    0x02, // local.get $index
    0x41,
    0x01, // i32.const 1
    0x6a, // i32.add
    0x21,
    0x02, // local.set $index
    0x0c,
    0x00, // br $sum
    0x0b, // end loop
    0x0b, // end block
    0x20,
    0x03, // local.get $total
    0x0b, // end function
];
const codeSection = section(10, vector([...u32(functionBody.length), ...functionBody]));

const wasmModule = new Uint8Array([
    0x00,
    0x61,
    0x73,
    0x6d,
    0x01,
    0x00,
    0x00,
    0x00,
    ...typeSection,
    ...functionSection,
    ...memorySection,
    ...exportSection,
    ...codeSection,
]);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, wasmModule);
