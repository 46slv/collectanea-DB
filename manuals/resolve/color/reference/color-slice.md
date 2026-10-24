---
title: ColorSlice（7つの色域で色相・濃度・彩度を調整）
description: DaVinci Resolve 21.1のColorSliceを、7つの色スライス、Centerによる選択、Density・Saturation・Hue、全体コントロールと実用例から解説。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [ColorSlice, Center, Hue, Density, Saturation, Den.Depth, Sat.Balance, Sat.Depth, Highlight]
tasks: [grade, secondary-correction, adjust-saturation, match-shots]
level: intermediate
updated: "2026-10-24"
---

# ColorSlice：色の領域ごとに濃度と彩度を整える

**ColorSlice**は、決められた色の領域を滑らかな重みで選び、その領域の色相、濃度、彩度を調整するColorページのツールです。HSL Qualifierで厳密な選択を作るよりも、隣り合う色が自然につながる調整を目指す場面に向いています。

DaVinci Resolve 21.1 Reference Manualでは、彩度の調整に減法混色的なモデルを用いることで、鮮やかな色だけが不自然に明るくならず、深みのある色を得やすいと説明しています。これはすべての素材で明るさが不変になるという意味ではありません。変化はViewerとScopesで確認します。

ここで記載する名称・機能は公式21.1 ManualのChapter 135「ColorSlice」pp.3210–3214に基づきます。実機での見た目や数値の効果は未検証です。

## 7つのColorSlice

ColorSliceには、Vectorscopeの主要な方向に対応する**Red／Green／Blue／Cyan／Magenta／Yellow**と、**Skin**の7つのスライスがあります。各スライスは、その色を中心とした一定の範囲を扱います。

色の境界を完全に切り分けるマスクではありません。空と海がCyanで一緒に変わることも、肌の調整が背景の黄・暖色へ影響することもあります。その重なりをViewerのHighlight表示で確かめながら調整します。

| 各スライスの項目 | 役割 | 操作時の判断 |
| --- | --- | --- |
| **Highlight icon** | 押している間、そのスライスの影響範囲を強調表示する。Viewer側でHighlightを有効にして確認することもできる | 目標の色が大部分含まれるか、背景へどの程度重なるかを見る |
| **Color Wheel** | 明るい扇形で、そのスライスが扱う色の範囲を表示する | どの方向の色を操作しているかを把握する |
| **Center** | 選択範囲の重みの中心を動かす。各スライスで動かせる範囲には制限がある | Highlightを見ながら対象色が最も含まれる位置へ寄せる |
| **Hue** | そのスライスの選択領域内の色相を変える。元の色による選択自体は変えない | 色相だけを寄せたい場合に使う |
| **Density** | 彩度のある色の輝度を調整し、減法混色のような濃度感を作る | 鮮やかさだけでなく明暗の印象も見る |
| **Saturation** | そのスライスの彩度を減法混色モデルに基づいて調整する | 明るさが過度に上がっていないか確認する |
| **Reset icon** | そのスライスの調整を初期状態に戻す | 試行した1領域だけをやり直す |

**選択範囲を決める調整項目はCenterのみ**です。Hue／Density／Saturationを操作しても、選択範囲を構成する元の色は変わりません。HSL Qualifierのように選択境界を独立して細かく設定したい場合は、[HSL Qualifier](./hsl-qualifier)や[Power Windows](./power-windows)を検討します。

## Global：画像全体に効く項目

スライスごとの調整とは別に、ColorSlice上部には画面全体に作用するGlobalコントロールがあります。

| Global項目 | 公式Manualでの役割 |
| --- | --- |
| **Density** | 彩度の高い色の輝度を変え、減法混色的な濃度感を調整する |
| **Den.Depth** | 明るい領域に対するDensity調整の効き方を制御する |
| **Saturation** | 減法混色モデルに基づいて全体の彩度を調整する |
| **Sat.Balance** | 中程度の彩度を持つ色で、彩度変更が輝度バランスへ与える影響を調整する |
| **Sat.Depth** | 明るい領域に対するSaturation調整の効き方を制御する |
| **Hue** | 画像全体の色相を変える |
| **Reset icon** | ColorSlice全体の調整を初期状態に戻す |

Globalと個別スライスを同時に大きく変えると、どちらの効果で色が変わったか分かりにくくなります。まず必要な範囲のスライスで変化を確認し、画像全体に共通する調整が必要なときにGlobalを使うと比較しやすくなります。

## 数値入力とHighlightでの確認

各スライスの**Center／Hue／Density／Saturation**には数値欄があります。Manualに記載された編集方法は、数値欄のダブルクリック入力、カーソル位置での上下矢印キーによる1桁ずつの変更、数値のカット／コピー／ペースト、欄を左右へドラッグする仮想スライダー操作です。

ColorSliceを調整するときは、次の順序で対象色と副作用を分けて確かめます。

1. 対象ショットの基本的な明暗・ホワイトバランスを整え、ColorページでColorSliceを開きます。
2. 変えたい色に近いスライスを選び、**Highlight**を表示します。必要に応じてViewerのB/W Highlightを使います。
3. **Center**を動かして、目的の色が多く含まれ、変えたくない領域への影響が比較的小さい位置を探します。
4. Highlightを解除し、**Hue／Density／Saturation**を少しずつ変えます。対象色だけでなく肌・背景・明部の変化も比較します。
5. ColorSliceの適用前後と別ショットを比較し、意図しない色転びや濃度差があれば、Centerや各調整を戻します。

結果は、対象の色が狙った方向に変化しながら、ショット内の隣接色とのつながりが不自然にならないことです。絶対的に正しい数値は素材と目標に依存するため、ここでは推奨値を設けません。

## 判断例：夕方の空、肌、丘の色

公式Manualの例は、**夕方の空と海、サイクリストの肌、背景の丘**を1つのColorSliceで調整するものです。

- **Cyan**のHighlightを見てCenterを調整し、空と海を広く拾った状態でDensityとSaturationを調整します。
- **Skin**ではサイクリストの肌へ重みを寄せて暖かな光を強めます。ただし背後の丘まで選択されることがあります。
- **Yellow**を使って丘を中心に選択し、先ほど背景へ及んだDensityとSaturationの変化を抑えます。

この例から分かるのは、1スライスで影響範囲を完全に分離するのではなく、**Highlightで重なりを見つけ、複数のスライスの調整を組み合わせる**という使い方です。肌だけを厳密に保護したいときは、ColorSlice単独ではなく[Qualifier](./hsl-qualifier)や[Window](./power-windows)の方が適する場合があります。

## Color Warper・Qualifierとの使い分け

| 目的 | 第一候補 | 判断の理由 |
| --- | --- | --- |
| 色のまとまりを滑らかに調整して深みを出す | ColorSlice | 固定された7領域と減法混色的なDensity／Saturationを使う |
| 特定の色を細かく選び、選択範囲を吟味する | [HSL Qualifier](./hsl-qualifier) | H／S／Lの抽出とMatteの確認ができる |
| 色同士の配置関係をグリッド上で操作する | [Color Warper](./color-warper) | 色相・彩度の座標関係を見ながら調整できる |

ColorSliceのHighlight表示は、厳密な白黒マスクを完成させるための必須工程ではありません。公式Manualも完全にクリーンなMatteを要求しておらず、調整したい色を主として拾えているかを見る用途としています。

## 出典・対応版・未検証範囲

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, **Chapter 135「ColorSlice」pp.3210–3214**。7スライス、各コントロール、Global項目、数値入力、空・肌・丘の手順を2026-10-24に直接確認。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support) — Reference Manualの配布元。
- [Blackmagic Design：Colorページ](https://www.blackmagicdesign.com/products/davinciresolve/color) — 製品機能の案内。

**確認済み：** 21.1 Manual記載の操作名・役割・操作の順序・公式作例。**未検証：** Resolve 21.1の実機UI配置、Free／Studioでの提供差、カラー管理方式ごとの見え方、数値の推奨範囲、処理性能、実素材での結果。したがって`verification: partial`です。
