// Patches kiliandeca/excalidraw-storage-backend for Redis-backed Keyv.
// The 2021 controllers push Keyv's parsed values into a Readable stream, which
// requires strings/Buffers -> ERR_INVALID_ARG_TYPE crash on every GET.
// Keyv/redis returns: objects (JSON bodies), plain strings, or Buffer wrappers
// - either as objects ({type:"Buffer",data:[...]}) or as their JSON string
// form. This rewrite emits the original payload in every case.
const fs = require("fs");
const files = ["scenes", "rooms", "files"];
const REPL = [
  // matches  stream.push(data);   in all three controllers
  [/stream\.push\(data\);/g,
   'stream.push(typeof data==="string"? (data.startsWith(\'{"type":"Buffer"\')?Buffer.from(JSON.parse(data).data):data) : (data&&data.type==="Buffer")?Buffer.from(data.data):JSON.stringify(data));'],
  // debug dump of the raw keyv value for one GET
  [/(const data = await this\.storageService\.get\(params\.id, this\.namespace\);)/,
   '$1\n    console.log("KVDEBUG", JSON.stringify({t: typeof data, d: data && data.type, s: typeof data === "string" ? data.slice(0, 60) : null}));'],
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