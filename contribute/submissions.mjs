// submissions.mjs — 投稿處理
//   node contribute/submissions.mjs import <表單匯出.csv>
//       → 產生 contribute/submission-queue.json（只含 名稱＋連結＋補充＋署名＋聯絡；其餘待分類）
//   然後在本專案請 Claude：「研究並分類 submission-queue.json，依 CLASSIFY-RULES.md，
//       輸出 submission-review.json」→ 你審核把 OK 的設 "approved": true
//   node contribute/submissions.mjs merge
//       → 把 approved 的併入 ../entries.json（聯絡方式會被剝除）
// 之後： node build-edges.cjs && node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ENTRIES = resolve(here, '..', 'entries.json');
const QUEUE = join(here, 'submission-queue.json');
const REVIEW = join(here, 'submission-review.json');
const mode = process.argv[2];

// ---- 極簡 CSV 解析（支援引號、逗號、換行）----
function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}

const pick = (H, ...keys) => { for (let i = 0; i < H.length; i++) for (const k of keys) if (H[i].includes(k)) return i; return -1; };
const slug = s => 'sub-' + Buffer.from(s).toString('hex').slice(0, 10);

function importCsv(file) {
  if (!file) { console.error('用法：node contribute/submissions.mjs import <表單.csv>'); process.exit(1); }
  const rows = parseCSV(readFileSync(file, 'utf8'));
  const H = rows[0];
  const col = {
    name: pick(H, '名稱', '名字'),
    link: pick(H, '連結', 'link', 'Link', 'URL', '網址'),
    note: pick(H, '補', '一句', '為什麼', '為何'),
    credit: pick(H, '署名', '貢獻者'),
    contact: pick(H, '通知', 'email', 'Email', 'handle', '聯絡'),
  };
  const out = [];
  for (const r of rows.slice(1)) {
    const g = i => (i >= 0 && r[i] ? r[i].trim() : '');
    const name = g(col.name); if (!name) continue;
    const links = g(col.link).split(/[\s,、；;]+/).filter(s => /^https?:/i.test(s));
    out.push({
      status: '待研究', id: slug(name), name_zh: name,
      links, note: g(col.note), contributor: g(col.credit), _contact: g(col.contact),
    });
  }
  writeFileSync(QUEUE, JSON.stringify(out, null, 2) + '\n');
  console.log(`匯入 ${out.length} 筆 → ${QUEUE}`);
  const noLink = out.filter(e => !e.links.length);
  if (noLink.length) { console.log(`⚠ 沒附連結（研究時要特別查或退回）：`); noLink.forEach(e => console.log('  - ' + e.name_zh)); }
  console.log('\n下一步：請 Claude「研究並分類 submission-queue.json，依 CLASSIFY-RULES.md，輸出 submission-review.json」。');
}

function merge() {
  let review;
  try { review = JSON.parse(readFileSync(REVIEW, 'utf8')); }
  catch { console.error(`找不到 ${REVIEW}。請先完成研究分類步驟。`); process.exit(1); }
  const main = JSON.parse(readFileSync(ENTRIES, 'utf8'));
  const ids = new Set(main.entries.map(e => e.id)), names = new Set(main.entries.map(e => e.name_zh));
  let added = 0, skipped = [];
  for (const e of review) {
    if (!e.approved) continue;
    if (ids.has(e.id) || names.has(e.name_zh)) { skipped.push(e.name_zh + '(重複)'); continue; }
    const { approved, _flags, _contact, status, ...clean } = e; // 不把聯絡方式/審核欄寫進公開資料
    main.entries.push(clean); ids.add(clean.id); names.add(clean.name_zh); added++;
  }
  main.meta.compiled = new Date().toISOString().slice(0, 10) + '（投稿併入）';
  writeFileSync(ENTRIES, JSON.stringify(main, null, 2) + '\n');
  console.log(`併入 ${added} 筆 | 跳過：${skipped.join('、') || '無'} | 總數 ${main.entries.length}`);
  console.log('記得跑： node build-edges.cjs && node build.mjs');
}

if (mode === 'import') importCsv(process.argv[3]);
else if (mode === 'merge') merge();
else console.log('用法：\n  node contribute/submissions.mjs import <表單.csv>\n  （請 Claude 依 CLASSIFY-RULES.md 產出 submission-review.json）\n  node contribute/submissions.mjs merge');
