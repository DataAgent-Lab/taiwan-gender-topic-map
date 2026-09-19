// build-edges.cjs — 從 entries.json 推導網絡圖的邊，輸出 edges.json + 摘要。
// 原則：只建「可查證的公開關係」。每條邊兩端都須為現存節點；對不上者丟棄並列出。
const fs = require('node:fs');
const path = require('node:path');
const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'entries.json'), 'utf8'));
const nodes = db.entries;
const byId = new Map(nodes.map(n => [n.id, n]));
const edges = [];
const seen = new Set();
const drop = { unresolvedFoundVia: [], curatedMissing: [] };

function add(from, to, rel, src) {
  if (from === to) return;
  if (!byId.has(from) || !byId.has(to)) { if (src === 'curated') drop.curatedMissing.push(`${from} → ${to} (${rel})`); return; }
  const k = from + '|' + to + '|' + rel;
  if (seen.has(k)) return;
  seen.add(k);
  edges.push({ from, to, rel, src });
}

// name index for matching found_via strings to a node
const nameEntries = nodes.map(n => ({ id: n.id, name: n.name_zh, type: n.type }))
  .sort((a, b) => b.name.length - a.name.length); // longest first
function matchNode(text, selfId) {
  const t = (text || '');
  for (const n of nameEntries) {
    if (n.id === selfId) continue;
    if (n.name.length >= 2 && t.includes(n.name)) return n;
  }
  return null;
}
function relFromContext(via, matched) {
  if (matched.type === 'work') return '創作';
  if (/講座|講者/.test(via)) return '講者';
  if (/會員|聯盟/.test(via)) return '會員';
  if (/友善連結|友善空間|友善店家|名錄/.test(via)) return '友善';
  if (/出版/.test(via)) return '出版';
  return '關聯';
}

// hub 關鍵字對照（found_via 常只寫核心名，節點卻有社團法人/財團法人前綴）
const HUB = [
  ['熱線', 'tongzhi-hotline'], ['平權大平台', 'equallove-tw'], ['防暴聯盟', 'tcav'],
  ['紅絲帶', 'taiwan-aids-foundation'], ['女書店', 'fembooks'], ['婦女新知', 'awakening'],
  ['女性影展', 'wmw-film-org'], ['杰德影音', 'portico-media'], ['女性學學會', 'twfeminist'],
  ['伴侶盟', 'tapcpr'], ['露德', 'lourdes'], ['基地協會', 'gdi-taichung'],
];
function matchHub(via, selfId) {
  for (const [kw, id] of HUB) if (via.includes(kw) && id !== selfId && byId.has(id)) return byId.get(id) && { id, type: byId.get(id).type };
  return null;
}

// (1)+(2) found_via 解析：先試作品名/一般節點名，再試 hub 關鍵字
for (const e of nodes) {
  if (!e.found_via) continue;
  let m = matchNode(e.found_via, e.id);
  if (!m) m = matchHub(e.found_via, e.id);
  if (m) add(e.id, m.id, relFromContext(e.found_via, m), 'found_via');
  else drop.unresolvedFoundVia.push(`${e.name_zh} ⟵ ${e.found_via}`);
}

// (3) 作品描述中出現的人物名 → 創作候選（標 name-scan，待審）
// 黑名單：作品是「關於/書寫」某人而非其創作，避免誤判為創作
const NOT_AUTHOR = new Set(['qiu-miaojin|afterwards', 'yu-mei-nu|asia-first-yumeinu-book']);
const persons = nodes.filter(n => n.type === 'person');
for (const w of nodes.filter(n => n.type === 'work')) {
  const blob = (w.desc_zh || '') + (w.basis || '');
  for (const p of persons) {
    if (p.name_zh.length >= 2 && blob.includes(p.name_zh) && !NOT_AUTHOR.has(p.id + '|' + w.id)) add(p.id, w.id, '創作', 'name-scan');
  }
}

// (4) 手工高信度邊（創辦/任職/主辦/營運/推動/前身）
const curated = [
  ['li-yuan-chen','awakening','創辦'], ['li-yuan-chen','fembooks','創辦'],
  ['ku-yen-lin','awakening','任職'], ['liu-yu-hsiu','awakening','創辦'],
  ['su-chien-ling','fembooks','創辦'], ['jennifer-lu','equallove-tw','任職'],
  ['hsu-chih-yun','tongzhi-hotline','任職'], ['ka-fei','tongzhi-hotline','創辦'],
  ['tu-ssu-cheng','tongzhi-hotline','任職'], ['wang-an-yi','lezs-media','創辦'],
  ['chiu-ai-chih','oii-chinese','創辦'], ['wu-yi-ting','istscare','創辦'],
  ['chi-hui-jung','garden-of-hope','任職'], ['lin-wei-withred','withred-org','創辦'],
  ['fan-yun','awakening','任職'], ['yu-mei-nu','awakening','任職'],
  ['yang-chia-hsien','tapcpr','任職'], ['josephine-ho','ncu-sexualities','任職'],
  ['ning-ying-bin','ncu-sexualities','任職'], ['huang-tao-ming','ncu-sexualities','任職'],
  // org → event 主辦
  ['taiwan-pride-org','taiwan-pride-event','主辦'], ['wmw-film-org','wmwiff','主辦'],
  ['tongzhi-hotline','taiwan-trans-march','主辦'], ['tongzhi-hotline','hotline-fundraising-dinner','主辦'],
  ['awakening','awakening-talks','主辦'], ['bi-the-way','bi-the-way-gathering','主辦'],
  ['fembooks','fembooks-feminism-course','主辦'], ['withred-org','lin-wei-withred','創辦'],
  // org → venue 營運/同一實體
  ['tongzhi-hotline','hotline-taipei','營運'], ['tongzhi-hotline','hotline-south','營運'],
  ['twrf','ama-museum','營運'], ['taiwan-aids-foundation','gisneyland-redhouse','營運'],
  ['taiwan-aids-foundation','gisneyland-hsinchu','營運'],
  // 里程碑 推動/前身
  ['chi-chia-wei','interpretation-748','推動'], ['chi-chia-wei','chi-chia-wei-1986','推動'],
  ['tapcpr','interpretation-748','推動'], ['interpretation-748','same-sex-marriage-act-2019','前身'],
  ['yu-mei-nu','same-sex-marriage-act-2019','推動'], ['chen-chun-ju','gender-equity-education-act','推動'],
  ['gingin-store','gin-gin-bookstore-2003','關聯'],
  ['awakening','between-us-1990','關聯'],
  // 作品「書寫/關於」某人（非創作）
  ['afterwards','qiu-miaojin','書寫'], ['asia-first-yumeinu-book','yu-mei-nu','關於'],
  // 新增作品節點 → 作者（創作/翻譯/編）
  ['ku-yen-lin','fem-theory-evolution','創作'], ['fembooks-culture','fem-theory-evolution','出版'],
  ['chiu-jui-luan','second-sex','創作'], ['shen-yunyan','who-afraid-gender','創作'],
  ['monday-recover','qitan-flower','創作'], ['yang-shuang-zi','qitan-flower','創作'],
  ['wang-hsiao-tan','this-is-misogyny','創作'], ['yang-wan-ying','this-is-misogyny','創作'],
  // 里程碑史鏈互連
  ['anti-harassment-march-1994','sexual-harassment-act-2006','推動'],
  ['taiwan-metoo-2023','wave-makers','關聯'],
  ['peng-wan-ju-1996','pwr','關聯'],
  ['gender-equality-employment-2002','sexual-harassment-act-2006','關聯'],
  // 出版社 → 作者作品體系（女書文化 出版 女性主義理論與流變…以節點為準）
];
for (const [f, t, r] of curated) add(f, t, r, 'curated');

fs.writeFileSync(path.join(__dirname, 'edges.json'), JSON.stringify({ meta: { built: '2026-09-11', note: 'v1 初稿：found_via 解析 + name-scan 創作候選 + 手工高信度邊。name-scan 需人工複核。' }, edges }, null, 2) + '\n');

// ── 摘要 ──
const byRel = {}, bySrc = {};
for (const e of edges) { byRel[e.rel] = (byRel[e.rel] || 0) + 1; bySrc[e.src] = (bySrc[e.src] || 0) + 1; }
const deg = {};
for (const e of edges) { deg[e.from] = (deg[e.from] || 0) + 1; deg[e.to] = (deg[e.to] || 0) + 1; }
const connected = new Set([...edges.flatMap(e => [e.from, e.to])]);
const isolated = nodes.filter(n => !connected.has(n.id));
const topHubs = Object.entries(deg).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, d]) => `${byId.get(id)?.name_zh}(${d})`);

console.log('=== edges.json 初稿 ===');
console.log('總邊數:', edges.length, '| 連到圖上的節點:', connected.size, '/', nodes.length, '| 孤點:', isolated.length);
console.log('依關係:', JSON.stringify(byRel));
console.log('依來源:', JSON.stringify(bySrc));
console.log('\nHub（連結數前 10）:', topHubs.join('、'));
console.log('\nname-scan 創作邊（需複核，樣本）:');
edges.filter(e => e.src === 'name-scan').slice(0, 30).forEach(e => console.log(`  ${byId.get(e.from).name_zh} —創作→ ${byId.get(e.to).name_zh}`));
console.log('\ncurated 缺節點(id 打錯或節點不存在):', drop.curatedMissing.length ? drop.curatedMissing.join(' ; ') : '無');
console.log('\nfound_via 對不到節點而丟棄:', drop.unresolvedFoundVia.length, '筆（樣本）');
drop.unresolvedFoundVia.slice(0, 20).forEach(s => console.log('  ' + s));
