// Patches kiliandeca/excalidraw-storage-backend for Redis-backed Keyv.
// The 2021 controllers push Keyv's raw value into a Readable stream, which
// requires strings/Buffers -> ERR_INVALID_ARG_TYPE crash on GET of JSON
// bodies (plain objects).
//
// With keyv@4 + json-buffer, stored buffers come back as REAL Buffers
// (not {type:"Buffer",...} wrappers) and JSON bodies come back as objects.
// Emit the payload intact in every case:
//   - Buffer      -> push as-is (original bytes; scenes/files stay byte-perfect)
//   - string      -> push as-is
//   - plain object -> JSON.stringify (recreates the original JSON body)
const fs = require("fs");
const files = ["scenes", "rooms", "files"];
const REPL = [
  [/stream\.push\(data\);/g,
   'stream.push(Buffer.isBuffer(data) ? data : (typeof data === "string" ? data : JSON.stringify(data)));'],
];
for (const f of files) {
  const p = `/app/dist/${f}/${f}.controller.js`;
  if (!fs.existsSync(p)) {
    console.error("missing:", p);
    process.exit(1);
  }
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  for (const [re, to] of REPL) s = s.replace(re, to);
  if (s === before) {
    console.error("pattern not found in", p);
    process.exit(1);
  }
  fs.writeFileSync(p, s);
  console.log("patched", p);
}
console.log("OK");