# 投稿分類規則（Claude 研究分類時遵循）

> 用途：投稿者只給「名稱＋連結」。Claude 讀 `submission-queue.json`，逐筆研究連結後，依本規則填成完整 entry，輸出 `submission-review.json`（每筆 `approved:false` 等主編確認）。
> 觸發語：「研究並分類 contribute/submission-queue.json，依 CLASSIFY-RULES.md，輸出 submission-review.json」。

## 每筆要判定並填入的欄位

- `type`：`person` 人物｜`org` 組織｜`venue` 場所｜`event` 活動｜`work` 作品｜`milestone` 里程碑
- `issues`：`["LGBT"]`、`["女性"]` 或兩者（交集）
- `layer`（由淺入深）：
  - `入口` 大眾可能已接觸（藝人／爆紅作品／大事件）
  - `認識` 想多懂（作家／影展／講座／媒體）
  - `深入` 認真理解（NGO／學者／政策／理論）
  - `參與` 走出螢幕（可造訪場所／可參加活動／可支持組織）
- `desc_zh`：一句話介紹（客觀、具體）
- `why_entry`：一句話「為何是好的入門起點」
- `region`／`address`：實體場所填（address 供地圖定位；查證是否仍營運）
- `found_via`：與哪個既有節點有關（利於網絡圖的邊）；投稿者若在「想補一句」提到就採用，否則自行判斷或填「投稿」
- `sources`：至少 1 個可查證公開連結（投稿連結＋你查到的補充）
- `contributor`：沿用投稿者署名（有的話）
- `submitted: true`

## 人物身分角色（`person_role`）— 同意的紅線

- `當事人`＝**本人在公開場合自我表明**（出櫃、自述女性主義者…），依據須為當事人自己的公開言論／作品／官方資料。
- `盟友`＝公開支持該群體、但未宣稱自身屬於。
- `推廣者`＝以公開的學術／創作／教學／倡議工作推動此議題（**identity-neutral，不涉及也不推斷其個人身分**）。
- **絕不**由姓名、外表、傳聞、作品題材推斷任何人的性傾向或性別認同。**不確定 → 用「推廣者」或留空**，並在 `basis` 註明依據。
- 每筆人物填 `basis`（收錄依據：哪個公開事實／作品／職務）。

## 通則

- **查不到可查證出處 → 不要硬填**，標記 `_flags:["缺出處"]`、`approved:false`，留待主編或退回投稿者補。
- **與現有節點重複**（比對 `entries.json` 的 name_zh）→ 標 `_flags:["重複"]`，不重收。
- 場所／活動查不到現況 → status 標「狀態待確認」。
- 有爭議／身分被公開質疑／收錄恐造成傷害的對象 → 不收，於 `_flags` 說明。
- 產出每筆為 entry 物件加上 `approved:false`、`_flags:[]`；聯絡方式保留在 `_contact`（併入時會被剝除，不進公開資料）。

## 輸出格式（submission-review.json，陣列）
```jsonc
{ "approved": false, "_flags": [], "_contact": "",
  "id": "kebab", "name_zh": "", "name_en": "", "type": "",
  "person_role": "(僅person)", "occupation": "(僅person)",
  "issues": [], "layer": "", "region": "", "address": "",
  "desc_zh": "", "why_entry": "", "basis": "(僅person)",
  "found_via": "", "contributor": "", "submitted": true,
  "status": "", "sources": [] }
```
主編確認後 `node contribute/submissions.mjs merge` → 併入 → `node build-edges.cjs && node build.mjs`。
