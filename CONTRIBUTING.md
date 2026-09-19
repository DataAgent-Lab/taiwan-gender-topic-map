# 貢獻指南

謝謝你願意讓這張地圖更完整。有兩種方式，選你順手的。

## 方式 A：投稿表單（最低門檻，不用懂 git）

你**只需要給名稱＋一個相關連結**（官網／維基／報導／他的 IG/YouTube 都行），其餘的分類（類型／議題／層級／身分角色／關係）由維護者研究後整理——這樣分類比較一致，你也不用糾結。

→ 投稿說明見 [`contribute/CONTRIBUTOR-GUIDE.md`](contribute/CONTRIBUTOR-GUIDE.md)。網站右下角也有「投稿」按鈕。

## 方式 B：發 Pull Request（熟 git 者）

1. Fork 這個 repo。
2. 編輯 **`entries.json`**，在 `entries` 陣列加一筆（照下面 schema）。
3. （選填）在 `edges.json` 加關係邊。
4. 本機跑 `node build-edges.cjs && node build.mjs` 確認能正常重建。
5. 開 PR，說明你加了什麼、附上你的出處。

### entries.json 一筆的 schema

```jsonc
{
  "id": "kebab-case-唯一代號",
  "name_zh": "中文名", "name_en": "",
  "type": "person | org | venue | event | work | milestone",
  "person_role": "當事人 | 盟友 | 推廣者",   // 僅 type=person
  "issues": ["LGBT", "女性"],                // 交集則兩者都放
  "layer": "入口 | 認識 | 深入 | 參與",
  "region": "台北大安區 | 全國 | 線上 …",
  "address": "",                            // 實體場所填，供地圖定位
  "desc_zh": "一句話介紹",
  "why_entry": "為何是好的入門起點",
  "basis": "",                              // 僅 person：收錄依據（公開事實／作品／職務）
  "found_via": "與哪個既有節點有關（利於網絡圖）",
  "sources": ["https://…"]                  // ⭐ 至少一個可查證公開連結
}
```

## 收錄標準（PR 會依此審）

1. **每一筆都要附出處**（`sources` 至少一個可點的公開連結）。沒有出處的不會合併。
2. **人物身分角色**——`當事人` 只在**本人公開自我表明**時用；只是公開支持用 `盟友`；用研究／創作／倡議推動、但不涉及本人身分用 `推廣者`。**絕不由姓名、外表、傳聞、作品題材推斷任何人的身分**；不確定就用 `推廣者` 或留空。
3. **場所／活動**請盡量確認仍在營運（否則於 `status` 標「狀態待確認」）。
4. **不收**：與現有節點重複、查不到出處、身分被公開質疑或收錄恐造成傷害的對象。

完整規則見 [`contribute/CLASSIFY-RULES.md`](contribute/CLASSIFY-RULES.md)。

## 行為準則
這是關於真實的人與社群的資料。請以尊重、查證、不越界（不替人貼身分標籤）為前提。維護者保留為了整體一致與查證而調整或不收的權利，並會盡量說明理由。
