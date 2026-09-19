// build.mjs — 把 entries.json 注入 template.html，產生自包含的 index.html。
// 改完資料就跑：node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const data = readFileSync(join(dir, 'entries.json'), 'utf-8');
JSON.parse(data); // 驗證 JSON 合法，壞掉就丟錯
const n = JSON.parse(data).entries.length;
let edges = '{"edges":[]}';
try { edges = readFileSync(join(dir, 'edges.json'), 'utf-8'); JSON.parse(edges); } catch { /* edges 尚未建 */ }

for (const [tplName, outName] of [['template.html', 'index.html'], ['map-template.html', 'map.html'], ['network-template.html', 'network.html']]) {
  let tpl;
  try { tpl = readFileSync(join(dir, tplName), 'utf-8'); } catch { continue; }
  let out = tpl.replace('/*__DATA__*/ null', data.trim());
  if (out.includes('/*__EDGES__*/ null')) out = out.replace('/*__EDGES__*/ null', edges.trim());
  if (!out.includes('"entries"')) throw new Error(`注入失敗：${tplName} 找不到 /*__DATA__*/ 佔位`);
  writeFileSync(join(dir, outName), out);
  console.log(`✓ ${outName} 已產生（${n} 筆）`);
}
