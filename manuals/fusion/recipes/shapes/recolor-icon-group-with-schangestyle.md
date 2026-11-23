---
title: sChangeStyleで図形の配色を部分変更・一括変更する
description: 2つの円と長方形をShapeのまま組み合わせ、sChangeStyleの挿入位置によって色変更の対象を切り替える。
doc_type: recipe
verification: partial
aliases: [Shapeの一括配色, 図形の部分配色, sChangeStyle 色変更]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sEllipse, sMerge, sChangeStyle, sRender]
tasks: [shape, graphic, style-shape]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sChangeStyleで図形の配色を部分変更・一括変更する

## 作るもの

横長の背景と、左右に並ぶ2つの丸いマークからなる表示パネルを作ります。背景の色は残したまま2つのマークを同じ色に揃える構成と、背景を含めた全図形の色を揃える構成を比較します。

図形の位置や形状を変更せずに配色だけを編集する練習です。配色の範囲はsChangeStyleを挿入する位置で決まります。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1。1920×1080のFusion Compositionを想定します。
- sRectangle ×1：背景の長方形。
- sEllipse ×2：左右のマーク。
- sMerge ×2：マークの組と、パネル全体を別々にまとめます。
- sChangeStyle ×1：色とAlphaを上書きします。
- sRender ×1：Shapeを2D Imageに変換します。

以下の寸法・色は操作を試すための提案値です。実機で測定した完成値ではありません。

## 接続

~~~text
sEllipse_L ─┐
            ├─ sMerge_Marks ─ sChangeStyle ─┐
sEllipse_R ─┘                               ├─ sMerge_Panel ─ sRender
sRectangle ────────────────────────────────┘
~~~

sMerge_Panelでは長方形を最初の入力（オレンジ）、マークの組を2番目の入力（緑）へ接続します。図では線の上下ではなく、実際の入力番号が重なり順を決めます。

## 手順

### 1. 背景とマークを配置する

1. sRectangleのSolidをオンにし、Width=0.65、Height=0.20程度にします。StyleのColorは暗い灰色、Alphaは1.0にします。
2. 2つのsEllipseのSolidをオンにし、WidthとHeightをそれぞれ0.08程度にします。X Offsetを左は-0.15、右は0.15程度に設定します。
3. 左の円は赤、右の円は青、どちらもAlpha=1.0にします。
4. 円が重ならず、両方が長方形の内側に収まるように調整します。必要に応じてsRenderで確認します。

円を異なる色にしておくと、色が一括で変わったかを確認しやすくなります。

### 2. 元の3色を表示する

1. 2つの円をsMerge_Marksの別々の入力へ接続します。
2. sMerge_Panelを追加し、sRectangleをInput1、sMerge_MarksをInput2へ接続します。
3. sMerge_PanelからsRenderへ接続してViewerに表示します。

暗い長方形の上に赤と青の円が並ぶことを確認目標にします。ここではまだsChangeStyleを挿入しません。

### 3. マークだけを同じ色にする

1. sMerge_MarksとsMerge_Panelの間にsChangeStyleを挿入します。
2. sChangeStyleのColorで緑（例：R=0.1、G=0.8、B=0.3、Alpha=1.0）を指定します。
3. Allow Combiningは比較中に切り替えず、位置やサイズも変えません。
4. sRenderを表示し、左右のマークが同じ緑色になり、長方形が元の灰色を保っているかを確認します。

元の赤と青は各sEllipseの設定に残ります。sChangeStyleを通さずにsMerge_Marksを直接sMerge_Panelへ接続し直せば、元の配色と比較できます。

### 4. 色変更をパネル全体へ広げる

sChangeStyleをマーク側の枝から取り除き、次のようにsMerge_PanelとsRenderの間へ移動します。

~~~text
sEllipse_L ─┐
            ├─ sMerge_Marks ─┐
sEllipse_R ─┘                ├─ sMerge_Panel ─ sChangeStyle ─ sRender
sRectangle ─────────────────┘
~~~

Colorは同じ緑、Alphaは1.0のままにします。今度は背景を含む3つのShapeが色変更の対象です。不透明で同色の円と長方形が重なるので、円の輪郭が見分けにくくなることも想定されます。これは形状が消失した証拠ではありません。元の配色に戻して確認します。

## 期待する結果

| sChangeStyleの挿入位置 | 色変更の対象 | 背景 |
| --- | --- | --- |
| 挿入なし | なし | 灰色 |
| sMerge_Marksの後 | 左右の円 | 灰色のまま |
| sMerge_Panelの後 | 長方形と左右の円 | 緑に変更 |

表は21.1 Manualの仕様に基づく期待結果です。実機で各Shapeの色やAlphaを測定したものではありません。

## この構成で動く理由

sMergeは複数のShapeを入力順にまとめ、画像化せずに次のShapeノードへ渡します。sChangeStyleは入力されたShapeの組に対し、上流で指定したColorとAllow Combiningを上書きします。

マークをまとめた直後にsChangeStyleを配置すれば、背景はまだその入力に含まれません。パネル全体をまとめた後では背景も入力に含まれます。このように、ノードの前後関係を利用してスタイルの適用範囲を決められます。

画像に変換するのは最後のsRenderです。[Shapeの基礎](../../learn/02-data/shape)と[必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)も参照してください。

## バリエーション

- 左のマークだけを変えたい場合は、sEllipse_LとsMerge_Marksの間へsChangeStyleを移します。
- マークの組を複数の表示パネルで使う場合は、パネルごとの配色を設定する位置と、全パネル共通の配色を設定する位置を分ける構成を検討できます。
- Alphaを変更する場合は、まずマークが重ならない状態で比較します。Allow Combiningによる重複領域のAlphaの違いは[半透明ドットの比較レシピ](./compare-allow-combining-on-overlapping-dots)で別に確認します。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| マークが背景に隠れる | sMerge_Panelで背景がInput1、マークの組がInput2になっているか |
| 背景まで色が変わる | sChangeStyleがsMerge_Panelの後ろに入っていないか |
| 片方の円しか色が変わらない | 両方の円がsMerge_Marksに入力され、その出力がsChangeStyleへつながっているか |
| 全体を同色にすると円が見えなくなる | 不透明で同じ色になった結果か。色変更を外して形状が残っているか |
| Viewerに表示できない | sRenderが接続されているか、ColorのAlphaが0になっていないか |

## 関連資料

- [sChangeStyle](../../nodes/shapes/schangestyle)
- [sMerge](../../nodes/shapes/smerge)
- [sRectangle](../../nodes/shapes/srectangle)
- [sEllipse](../../nodes/shapes/s-ellipse)
- [sRender](../../nodes/shapes/s-render)
- [Shapeの基礎](../../learn/02-data/shape)
- [必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)
- [重複する半透明ドットの比較](./compare-allow-combining-on-overlapping-dots)

## 出典と検証範囲

一次資料：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」pp.2733–2735（sChangeStyleの上流スタイルの上書き・Color・Allow Combining）、pp.2746–2747（sMergeの動的入力と重なり順）。今回、公式Manualの該当本文を直接照合しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

確認済み：上記Manualのノード仕様、既存Node Referenceとの対応、原稿の構造と相対リンク。

未検証：今回の3図形の階層構成を使ったResolve 21.1の実機描画、色・Alphaの測定、寸法の画素換算、Free / Studio差、OS・GPU差。したがって **verification: partial** を維持します。
