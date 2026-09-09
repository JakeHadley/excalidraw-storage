// Patches kiliandeca/excalidraw-storage-backend for Redis-backed Keyv.
// The 2021 controllers push Keyv's parsed JSON objects into a Readable stream,
// which requires strings/Buffers -> ERR_INVALID_ARG_TYPE crash on every GET.
// This rewrite emits the original payload: strings as-is, Buffer wrappers
// ({type:"Buffer",data:[...]}) decoded, plain objects re-serialized.
const fs = require("fs");
const files = ["scenes", "rooms", "files"];
for (const f of files) {
  const p = `/app/dist/${f}/${f}.controller.js`;
  if (!fs.existsSync(p)) {
    console.error("missing:", p);
    process.exit(1);
  }
  let s = fs.readFileSync(p, "utf8");
  const before = s;
  s = s.replace(
    /stream\.push\(data\);/g,
    'stream.push(typeof data==="string"?data:data&&data.type==="Buffer"?Buffer.from(data.data).toString():JSON.stringify(data));'
  );
  if (s === before) {
    console.error("pattern not found in", p);
    process.exit(1);
  }
  fs.writeFileSync(p, s);
  console.log("patched", p);
}
console.log("OK");