---
title: Colorページ
description: DaVinci Resolve Colorページの学習、操作ツール、実践手順、トラブルシューティングの入口。
doc_type: index
verification: partial
product_scope: color
suite_surfaces: [color]
tasks: [grade, color-correct, color-management, match-shots]
updated: "2026-10-22"
---

# Colorページ

Colorページは、素材の明るさや色の偏りを整え、複数ショットの見え方をそろえ、必要な部分だけを調整して作品全体の色を仕上げる場所です。ノードで補正を分けながら、ViewerとScopesで結果を確かめます。

ここでは**理解する（Learn）／機能を引く（Reference）／作り方から探す（Recipes）／症状から調べる（Troubleshooting）**を分けて増やします。未作成のページへのリンクは置きません。

## 初めて開く場合

1. [最初のグレーディング：補正前に何を確認するか](./learn/first-grade)
2. [ColorページのNode Graph](./learn/color-node-graph)
3. [Primariesのカラーホイール](./reference/primaries-color-wheels)
4. [Scopesで明暗と色の偏りを読む](./reference/scopes)

## 学ぶ（Learn）

- [最初のグレーディング](./learn/first-grade) — 撮影素材の条件、補正順、比較の基礎
- [ColorページのNode Graph](./learn/color-node-graph) — シリアルノードと処理順の基本
- [カラーマネージメントの基礎](./learn/color-management-basics) — Input／Timeline／OutputとRCM／CSTの使い分け

## 機能を引く（Reference）

- [Primariesのカラーホイール](./reference/primaries-color-wheels) — Lift / Gamma / Gain / Offsetを目的別に使い分ける
- [Scopes](./reference/scopes) — Waveform / Parade / Vectorscopeを補正判断に使う
- [Log Wheels](./reference/log-wheels) — LogホイールのShadows／Midtones／Highlightsとレンジ設定
- [HDRパレット](./reference/hdr-palette) — Global、6つの明暗ゾーン、Range／Falloff
- [Custom Curves](./reference/custom-curves) — YRGBとチャンネル別カーブ、階調の形の調整
- [HSL Curves](./reference/hsl-curves) — 色相・彩度・輝度を条件にした6種類のカーブ
- [HSL Qualifier](./reference/hsl-qualifier) — 色相・彩度・輝度による抽出とMatte Finesse
- [Power Windows](./reference/power-windows) — 形・位置による局所補正、Qualifierとの併用と追跡時の注意
- [Color Tracker](./reference/color-tracker) — 動く被写体へのWindow追従
- [KeyパレットとMatte](./reference/key-matte) — 選択範囲と補正強度の分離
- [Gallery／Stills](./reference/gallery-stills) — グレードの保存、比較、ショット間での再利用
- [Versions／グレード比較](./reference/versions-and-grade-comparison) — 1ショットの複数案を管理して比較する
- [RGB Mixer](./reference/rgb-mixer) — 色チャンネルの混合とモノクロの階調設計
- [Color Warper](./reference/color-warper) — 色相・彩度のグリッドで色の関係を調整
- [Serial／Parallel／Layerノード](./reference/serial-parallel-layer-nodes) — 補正の入力と合成順序を使い分ける
- [Color Sizing](./reference/color-sizing) — Edit／Input／Output／Node／Referenceの適用範囲
- [Keyframes](./reference/color-keyframes) — 色補正を時間とともに変化させる
- [Color Match／Color Chart](./reference/color-match-chart) — カラーチャートを基準にした補正とShot Matchとの使い分け
- [Noise Reduction](./reference/noise-reduction) — Temporal／SpatialとLuma／Chromaの調整、細部を残す判断
- [Camera RAW](./reference/camera-raw) — RAWの現像解釈、WB・露出・ハイライトとColorノードの役割分担
- [Group Pre-Clip／Clip／Post-Clip](./reference/group-grading) — 共通補正とショット別補正を分ける
- [Shared Node](./reference/shared-nodes) — 複数クリップで共通Lookを共有し、個別補正と分ける
- [Color Space Transform（CST）](./reference/color-space-transform) — 入出力の色域・GammaとRCMとの役割分担
- [Blur／Sharpen](./reference/blur-sharpen) — ぼかしと輪郭調整、Window・Noise Reductionとの使い分け
- [Timelineグレーディング](./reference/timeline-grading) — 全編共通のLookと納品前QCの適用範囲

## 実践する（Recipes）

- [3カメラのインタビューをショットマッチングする](./recipes/matching-multicamera-interview) — 基準StillとScopesを使ってカット間の色を整える
- [肌の色を整える：Qualifier・Power Window・Scopes](./recipes/skin-tone-secondary-grading) — 肌の必要な領域だけを抽出して自然な補正にする
- [納品前のColor QC](./recipes/pre-delivery-color-qc) — Lightbox、Scopes、Stills、再生で補正漏れと副作用を点検する

## トラブルシューティング（Troubleshooting）

- [二次補正がちらつく・範囲が揺れるとき](./troubleshooting/secondary-matte-flicker) — Qualifier、Window、Tracker、Keyの原因を分ける
- [書き出し後に色や明るさが違うとき](./troubleshooting/export-color-mismatch) — 出力変換、色タグ、Levels、再生環境を切り分ける

## 次に整備する領域

機能固有の操作、使い分け、実践的な手順を、公式21.1マニュアルと実機確認を基に段階的に追加します。次の候補はLUTの適用位置と管理方法のReference、外部映像モニタリングと表示環境の確認手順です。

## Fusionとの差

- Colorページの補正はショットの色と階調の調整が中心です。
- Fusionの色処理は合成フローの内部でも行えますが、Colorページと同じNode一覧ではありません。
- 色空間変換や効果が複数ページで行える場合は、その位置と前後の処理条件を確認します。

## 出典と検証状況

- [Blackmagic Design：Colorページの機能紹介](https://www.blackmagicdesign.com/products/davinciresolve/color)
- [DaVinci Resolve 21.1 Reference Manual（公式サポート）](https://www.blackmagicdesign.com/support)

現段階は公式機能紹介と21.1 Reference Manualを基にした記事群です。全Control、初期値、Free／Studio差、21.1実機画面の網羅は未検証であり、**全記事完成や実機受入を意味しません**。
