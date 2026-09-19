// geocode.cjs — 用 OpenStreetMap Nominatim 為有地址的實體查經緯度，寫回 entries.json。
// 遵守 Nominatim 規範：每筆 >1s、帶 User-Agent。只處理場所/組織/活動中可落點者。
const fs = require('node:fs');
const https = require('node:https');
const path = require('node:path');
const FILE = path.join(__dirname, 'entries.json');
const db = JSON.parse(fs.readFileSync(FILE, 'utf8'));

function baseAddr(e) {
  let a = (e.address && e.address.trim()) ? e.address : (e.region || '');
  return a.replace(/[（）()]/g, '').replace(/，?近[^，,]*/g, '').replace(/樓.*$/, '').replace(/\s+/g, '');
}
// 降級查詢：完整 → 路名層級 → 行政區層級
function queryCascade(e) {
  const full = baseAddr(e);
  const road = full.replace(/\d+巷.*$/, '').replace(/\d+弄.*$/, '').replace(/[0-9\-之]+號.*$/, '').replace(/[0-9\-]+$/, '');
  const distM = full.match(/^.*?(市|縣).*?(區|鄉|鎮|市)/);
  const dist = distM ? distM[0] : full.match(/^.*?(市|縣)/)?.[0] || full;
  return [...new Set([full, road, dist])].filter(Boolean);
}
const targets = db.entries.filter(e =>
  ['venue', 'org', 'event'].includes(e.type) &&
  !/全國|線上|各縣市/.test(e.region || '') &&
  ((e.address && e.address.trim()) || /[路街巷弄號]/.test(e.region || '') || /市|縣/.test(e.region || '')) &&
  e.lat == null
);

function geocode(q) {
  return new Promise((resolve) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tw&q=${encodeURIComponent(q)}`;
    https.get(url, { headers: { 'User-Agent': 'gender-map-geocoder/1.0 (research; contact via repo)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { const j = JSON.parse(data); resolve(j[0] ? { lat: +(+j[0].lat).toFixed(5), lng: +(+j[0].lon).toFixed(5) } : null); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  let ok = 0, fail = [];
  for (const e of targets) {
    const qs = queryCascade(e);
    let hit = null, usedFull = false;
    for (let i = 0; i < qs.length; i++) {
      hit = await geocode(qs[i]);
      await new Promise(res => setTimeout(res, 1200));
      if (hit) { usedFull = (i === 0); break; }
    }
    if (hit) { e.lat = hit.lat; e.lng = hit.lng; e.geo_precise = usedFull && /號/.test(qs[0]); ok++; }
    else fail.push(e.name_zh + ' ⟵ ' + qs.join(' | '));
  }
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2) + '\n');
  console.log(`geocoded ok=${ok} / ${targets.length}`);
  if (fail.length) console.log('FAILED:\n  ' + fail.join('\n  '));
  const withGeo = db.entries.filter(e => e.lat != null);
  console.log('total with lat/lng now:', withGeo.length);
})();
