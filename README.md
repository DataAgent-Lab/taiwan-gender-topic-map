# 台灣性別議題入門地圖 · Taiwan Gender Issues Map

一份**開放、經策展、每筆附出處**的互動地圖，把台灣的性別（LGBT＋女性）議題——人物、組織、場所、活動、作品、歷史里程碑——組織成「由淺入深」的樣子，給**有一點意識、但還不知道從哪開始**的人。

這是一個持續成長的社群協作專案。**歡迎你補上你熟悉的那塊**（見 [CONTRIBUTING](CONTRIBUTING.md)）。

## 三種看法（同一份資料，三個成品）

| 檔案 | 是什麼 | 用途 |
|---|---|---|
| `index.html` | 分層目錄（入口→認識→深入→參與）× 議題 × 類型 × 搜尋 | 查資料、瀏覽 |
| `map.html` | 實體地理地圖（Leaflet + OpenStreetMap） | 找附近可造訪的場所／活動 |
| `network.html` | 關係星圖（d3 力導向、手繪紙感、故事線導覽） | 看脈絡與社群的樣貌 |

> `map.html`／`network.html` 開啟需連網（載入 Leaflet／d3 與地圖圖磚）。

## 收錄原則（這份地圖的信譽）

1. **每一筆都附出處。** 沒有可查證公開來源的不收。
2. **人物只依公開資訊**，並分三種角色：
   - **當事人**＝本人公開自我表明（出櫃、自述女性主義者…）
   - **盟友**＝公開支持，但未宣稱自身屬於該群體
   - **推廣者**＝以公開的研究／創作／教學／倡議推動此議題（不涉及、也不推斷其個人身分）
   - **絕不**由姓名、外表、傳聞、作品題材推斷任何人的身分；不確定就保守處理。
3. 場所／活動盡量查證是否仍在營運。

完整分類規則見 [`contribute/CLASSIFY-RULES.md`](contribute/CLASSIFY-RULES.md)。

## 開發／重建

```bash
node build.mjs         # 由 entries.json（+ edges.json）產生 index/map/network.html
node build-edges.cjs   # 由 entries.json 推導 edges.json（關係）
node geocode.cjs       # 為有地址的實體補經緯度（Nominatim）
```
資料源是 `entries.json`（節點）與 `edges.json`（關係）。改資料 → 跑 `build-edges.cjs` → `build.mjs`。

## 怎麼貢獻

- **不熟技術** → 用投稿表單（見 [CONTRIBUTING](CONTRIBUTING.md)），只要給名稱＋連結。
- **熟 git** → Fork、編輯 `entries.json`、開 PR。

## 授權

- **程式碼**（build 腳本、HTML 模板）：MIT（見 `LICENSE`）。
- **資料**（`entries.json`、`edges.json` 等）：CC BY 4.0——可自由使用與改作，請標示來源本專案。
- 資料中每一筆各自的原始出處請見該筆的 `sources`。
