---
title: 映像VFX表現調査の出典
description: 候補表現の名称、UE5原理、DaVinci/Fusion 21.1のNode仕様、After Effects対照を出典と確認範囲付きで管理。
doc_type: research
verification: partial
product_scope: fusion
updated: "2026-10-23"
---

# 映像VFX表現調査の出典

調査日: **2026-10-23**。このページのリンクは**候補の出典一覧**であり、73件すべてのFusion再現を個別に証明した一覧ではありません。

## S1 — 発想元：UE5のシルエット型粒子消失

- 著者: HeyYo CG / yohanashima
- 記事: [Beyond Skeletal Mesh Location: A “Silhouette Cutout” Approach to Dissolve Effects](https://heyyocg.link/en/ue5-screenspace-dissolve-overview/)
- 記事日: 2026-10-20、確認: 2026-10-23
- 支える範囲: **スクリーン上の人物の矩形範囲を粒子で埋め、Stencilでシルエットを切り出す**方式の説明。Skeletal Mesh Location方式の密度依存との比較。UE5 Niagara固有のScratch Pad、Depth/G-Buffer等を利用。
- 支えない範囲: Fusion上での再現済みという主張、粒子を消失境界に限定して発生させるという主張。詳細は[個別調査](./screen-space-silhouette-dissolve)。

## S2 — DaVinci Resolve / Fusion 21.1公式一次資料

- 発行元: Blackmagic Design
- 資料: [DaVinci Resolve 21.1 Reference Manual（Support Center）](https://www.blackmagicdesign.com/support)
- 発行: 2026-09、確認: 2026-10-23（プロジェクト添付のSeptember 2026版PDFを確認）。
- 用途・章:
  - Chapter 86（pp.1890–1898）: Particle Systemsのワークフロー
  - Chapter 92（pp.2108–2132）: Blur/Filter
  - Chapter 94（pp.2207–2225）: Dissolve/Merge/MultiMerge
  - Chapter 103（pp.2356–2405）: Generators、Text+
  - Chapter 108（pp.2462–2502）: Mask
  - Chapter 109（pp.2503–2570）: Matte/Keying、Magic Mask
  - Chapter 114（pp.2646–2703）: pEmitter、pImage Emitter、pRender、pTurbulence、Force等
  - Chapter 119（pp.2803–2857）: Tracker、Planar Tracker、Camera Tracker
  - Chapter 120（pp.2858–2885）: Transform、Camera Shake
  - Chapter 123（pp.2960–2990）: Warp/Distortion
- 支える範囲: 個々のNodeの役割・入力・構成例・主要Control。**索引に載せた演出ごとの完成品質や性能の保証はしていません**。

## S3 — After Effects公式リファレンス（名前・比較対象）

- Adobe: [シミュレーションエフェクト](https://helpx.adobe.com/jp/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/simulation-effects.html)（最終更新 2025-06-26）。Particle World、CC Pixel Polly、Shatter、Rainfallなどの演出系の比較に利用。
- Adobe: [After Effects エフェクト一覧](https://helpx.adobe.com/jp/after-effects/desktop/apply-effects-and-animation-presets/effects-and-animation-presets/effect-list.html)。Distort、Time、Transition、Simulation等の効果名とカテゴライズの参考に利用。
- Adobe: [時間エフェクト](https://helpx.adobe.com/jp/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/time-effects.html)。Echo、Posterize Time、Pixel Motion Blur等の挙動を区別する参考。
- 支える範囲: **Adobe側の機能と効果名**。Resolve/Fusionへの完全互換や、同名Nodeの存在の根拠にはしません。

## S4 — Fusionの公式紹介（機能ファミリー）

- Blackmagic Design: [DaVinci Resolve – Fusion](https://www.blackmagicdesign.com/jp/products/davinciresolve/fusion)
- 支える範囲: 2D/3D合成、Particle、Tracking、モーショングラフィックス等の機能分野。特に平面トラッキングによるスクリーン置換、3Dカメラトラッキングによるオブジェクト統合。
- 支えない範囲: 細かなInspectorのデフォルト値、特殊な映像表現をすべて標準Nodeだけで作れるという保証。

## 出典の扱い

1. 元記事は**具体的に説明された手法**の証拠として扱い、類似演出全般の証明に拡張しない。
2. 技術名の列挙と最小実装は別。Adobeのエフェクト名をFusionのNode名と同一視しない。
3. Node名・端子・設定値を断定する場合は21.1 Manualの章・ページ、または実機を示す。
4. 追加の事例や動画の出典は、発見時にURL・著者・確認日・支える主張を追記する。
