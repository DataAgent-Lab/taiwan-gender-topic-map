# CLAUDE.md — 給在此 repo 工作的 Claude

**這裡是「台灣性別議題入門地圖」的正式維護家（source of truth）。**
（前身在私有 repo `ai-academy/content/womens_social/gender-map/`，已遷來這裡；那份請視為凍結備份，不要再各改一份。）

## 資料與重建
- 資料源：`entries.json`（節點）、`edges.json`（關係）。**只改這兩個**，不要手改 `index.html`／`map.html`／`network.html`（那是產物）。
- 重建：
  ```bash
  node build-edges.cjs   # entries.json → edges.json（推導關係）
  node build.mjs         # entries.json(+edges.json) → index/map/network.html
  node geocode.cjs       # 為有 address 的實體補經緯度（Nominatim）
  ```
- 版面／互動改對應 `*-template.html` 再重跑 `build.mjs`。

## 三個成品
- `index.html` 分層目錄（入口→認識→深入→參與 × 議題 × 類型 × 搜尋）
- `map.html` 實體地理地圖（Leaflet + OSM，需連網）
- `network.html` 關係星圖（d3 力導向、暖紙手作風、故事線導覽）
- 深連結：三頁都支援 `?focus=<node id>`（目錄捲動閃卡片／星圖直接聚焦），用於通知投稿者。

## 投稿協作流程（`contribute/`）
表單匯出 CSV → `node contribute/submissions.mjs import x.csv` → 產 `submission-queue.json`
→ Claude 依 `contribute/CLASSIFY-RULES.md` 研究分類 → 產 `submission-review.json`
→ 主編設 `approved:true` → `node contribute/submissions.mjs merge` → 重建。
（`submission-queue.json`／`submission-review.json`／`*.csv` 含投稿者聯絡方式 PII，已 gitignore，勿提交。）

## 收錄鐵律（公開地圖的信譽）
- **每一筆都要附出處**（`sources` 至少一個可查證公開連結），否則不收。
- **人物身分角色**：`當事人`＝本人公開自述；`盟友`＝公開支持但未宣稱屬該群體；`推廣者`＝以公開研究／創作／倡議推動、不涉及本人身分。**絕不由姓名／外表／傳聞／作品題材推斷身分**；不確定用「推廣者」或留空，並填 `basis`。
- 場所／活動查證是否仍營運；查不到現況標「狀態待確認」。
- 有爭議／身分被公開質疑／收錄恐造成傷害者不收。

完整規則見 `contribute/CLASSIFY-RULES.md`；貢獻方式見 `CONTRIBUTING.md`。
