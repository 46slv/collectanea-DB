---
title: sBooleanで穴を開けたカードの内外周をsOutlineで描く
description: 長方形と円から作った穴あきShapeの輪郭を、sOutlineの共通Thicknessで一度に調整する。
doc_type: recipe
verification: partial
aliases: [穴あきカードの縁取り, sOutline 複合Shape, 内側と外側の輪郭]
concepts: [shape-data, rasterization]
patterns: [defer-domain-conversion]
nodes: [sRectangle, sEllipse, sBoolean, sOutline, sRender]
tasks: [shape, cutout, outline, graphic]
prerequisites: [shape-data]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-24"
---

# sBooleanで穴を開けたカードの内外周をsOutlineで描く

## 作るもの

長方形の中央に円形の穴を開け、**外側の四角い縁と、穴の周りの丸い縁を線で示す**図形を作ります。塗りつぶしたカードを完成させるのではなく、穴あきの形状から輪郭線を取り出すことが目的です。

[sBooleanで円穴を開けるレシピ](./cut-circle-from-rectangle-with-sboolean)に、sOutlineを1つ足した構成です。sBooleanで残す領域を決め、sOutlineのThicknessで輪郭の太さを調整します。ここに示す寸法と線幅は制作開始用の提案値であり、Resolve 21.1で測定した完成値ではありません。

## 必要なものと入力条件

- DaVinci Resolve / Fusion 21.1。例として1920×1080のFusion Compositionを想定します。
- **sRectangle**：穴を開ける元の長方形。Solidをオンにします。
- **sEllipse**：円形の抜き領域。こちらもSolidをオンにします。
- **sBoolean**：Subtractで長方形から円を取り除きます。
- **sOutline**：得られた複合Shapeの輪郭に共通のThicknessとBorder Styleを適用します。
- **sRender**：Shapeを通常の2D Imageに変換し、Viewerで確認します。

sBooleanとsOutlineの出力はどちらもShapeです。通常の画像用Mergeへ直接接続しません。

## 接続

~~~text
sRectangle（残す領域） ──> Input1（オレンジ） ┐
                                             ├─ sBoolean（Subtract）─ sOutline ─ sRender ─ Viewer
sEllipse（取り除く領域）─> Input2（緑） ─────┘           Shape           Shape        2D Image
~~~

**sOutlineのInput1（オレンジ）にはsBooleanの出力を接続**します。sOutlineは2本の図形を独立に入力するノードではありません。先にsBooleanで一つの複合Shapeを作る順番が重要です。

## 手順

### 1. 長方形と円を作る

1. sRectangleの**Solid**をオンにします。Width=0.70、Height=0.40、Corner Radius=0.0を開始値の目安にします。
2. sEllipseを追加してSolidをオンにし、WidthとHeightをそれぞれ0.20程度にします。
3. 両方を中央付近に置き、円の外周が長方形の内側に収まるようにします。数値と画面上の距離はViewerで調整してください。
4. sRectangleをsBooleanの**Input1**、sEllipseを**Input2**に接続します。

両方を塗りShapeとして作るのは、円の面積を長方形から取り除くためです。最初から輪郭だけの円をInput2へ渡す構成とは目的が異なります。

### 2. sBooleanで穴を開ける

1. sBooleanの**Controls → Operation**を**Subtract**にします。
2. sBooleanの**Style → Color**で見やすい色を選び、Alphaを1.0から試します。sBooleanのStyle Modeは21.1公式ManualではReplaceです。
3. いったんsBooleanをsRenderへ直結し、Viewerで円形の抜けを持つカードを確認します。
4. 円形の抜けがない場合は入力順・2つのShapeの重なり・Subtract設定を見直します。

この段階でできるのは**面積を持つ穴あきのShape**です。次の工程で輪郭線へ切り替えます。

### 3. sOutlineで輪郭だけを取り出す

1. sBooleanとsRenderの間へ**sOutline**を挿入します。
2. sOutlineの**Controls → Thickness**を0.02程度の提案値から始めます。
3. **Lengthを1.0**にして、輪郭が途中で切れない状態を基準にします。
4. **Border Style**を**Miter**から**Round**へ切り替え、外周の角でつながり方がどう変わるかを比較します。Thicknessと形状はそのままにします。
5. sRenderをViewerに表示し、外周の角と、中央の穴の周囲を観察します。

sOutlineはManual上、sBooleanで作った複合Shapeを入力でき、輪郭の太さ・角の処理・表示範囲をまとめて調整するノードです。ここでは**外周と内周が狙いどおりに描かれることを確認目標**とし、この設定での実機描画済みとは扱いません。

## 期待する結果と比較

| 比較する状態 | 公式仕様からの期待 |
| --- | --- |
| sBoolean → sRender | 長方形の領域から円の重なりを除いた、面を持つShapeが画像になる |
| sBoolean → sOutline → sRender | 複合Shapeの輪郭線を取り出し、Thicknessで線幅を変えられる |
| Thicknessだけ増やす | 輪郭線を太くする。元の円穴や長方形の寸法を編集する操作ではない |
| Border StyleをMiter / Roundで切り替える | 外側の角で接合形状が変わる。円周だけを見ても差は見分けにくい |
| sOutlineのLengthを1.0未満にする | 閉じた輪郭の一部に隙間ができる。開始位置はPositionと形状の経路に依存する |

円穴の内周が実際にどの順序・向きで描画されるか、ピクセル上で線が何pxになるか、Alphaの境界値は、この構成では測定していません。

## この構成で動く理由

sBooleanのSubtractは**Input1の領域からInput2との重なりを除く**処理です。sOutlineはその結果の輪郭へ共通のThickness・Border Style・Lengthを適用します。長方形と円のそれぞれにBorder Widthを設定するのとは異なり、演算後の形状に対して線の処理を行います。

図形を画像にするのは最後のsRenderです。詳しくは[Shapeの基本](../../learn/02-data/shape)と[Shapeを必要な場所で画像化する考え方](../../patterns/data-domain/defer-domain-conversion)を参照してください。

## バリエーション

- **穴を端へ寄せる**：sEllipseのX/Y Offsetを動かします。穴が外周を横切る位置では形状が変わるので、元の中央穴とは別に確認します。
- **角丸の外枠**：sRectangleのCorner Radiusを変えます。これは元の外周形状を変える操作で、sOutlineのBorder Styleとは異なります。
- **線を途中まで表示する**：sOutlineのLengthを1.0未満にし、Positionで隙間の位置を調整します。輪郭が描かれる順序は実機で確認してください。
- **塗りと輪郭の両方を表示したい**：sBooleanの出力を2経路へ分け、片方はそのまま、片方はsOutlineを通してからShape系のsMergeでまとめる構成を追加候補にします。こちらの合成結果は本レシピでは未検証です。

## うまくいかないとき

| 症状 | 最初に確認すること |
| --- | --- |
| 穴が開かず、円だけが見える | sBooleanのInput1 / Input2の順番。Subtractで残す側はInput1 |
| 外周が塗りつぶされたまま | sOutlineをsBooleanとsRenderの間に挿入したか、sOutline出力を表示しているか |
| 内側の線が見えない | sBoolean単体で円穴が作れているかを先に確認し、次にsOutlineのThickness・Lengthを確認する |
| 角の違いが分からない | 円周ではなく外周の四隅を見てBorder Styleを比較する |
| 輪郭に切れ目がある | sOutlineのLengthを1.0に戻し、Position変更前の状態と比較する |
| Viewerで何も見えない | sRenderまでShapeの接続が通っているか、sBooleanのStyle Alphaが0でないかを確認する |

## 関連資料

- [穴あきShapeを作る元レシピ](./cut-circle-from-rectangle-with-sboolean)
- [sBooleanのNode Reference](../../nodes/shapes/sboolean)
- [sOutlineのNode Reference](../../nodes/shapes/soutline)
- [sRectangleのNode Reference](../../nodes/shapes/srectangle)
- [sEllipseのNode Reference](../../nodes/shapes/s-ellipse)
- [sRenderのNode Reference](../../nodes/shapes/s-render)
- [Shapeの基本](../../learn/02-data/shape)
- [必要な場所で画像化するパターン](../../patterns/data-domain/defer-domain-conversion)

## 出典と検証範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」pp.2729–2732（sBooleanの2入力・Subtract・Style Mode）、pp.2750–2752（sOutlineのInput1・Thickness・Border Style・Position・Length）。本レシピ作成時に公式Manual本文を直接照合しました。[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)。

**確認済み**：21.1 Manualに記載されたShape演算・複合Shapeの輪郭処理・sRenderへ渡す構造。担当範囲内の新規原稿とリンクの静的確認。

**未検証**：この長方形＋円形穴＋sOutline構成のResolve 21.1実機描画、内周・外周の輪郭位置と方向、Thicknessの画素換算、Alpha境界、Free / Studio差、他OS/GPU、公開サイトのHTTP表示。したがって **verification: partial** を維持します。
