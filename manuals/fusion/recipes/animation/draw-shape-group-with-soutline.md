---
title: sOutlineで複数の図形の輪郭をまとめて描く
description: 色と寸法の異なる2つの円をsMergeでまとめ、sOutlineのLengthを1か所でアニメーションさせる。
doc_type: recipe
verification: partial
aliases: [複数図形の線描画, sOutline Length, グループの輪郭アニメーション]
concepts: [shape-data, keyframes, rasterization]
patterns: [defer-domain-conversion]
nodes: [sEllipse, sMerge, sOutline, sRender]
tasks: [animation, shape, outline, motion-graphics]
level: foundation
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-11-25"
---

# sOutlineで複数の図形の輪郭をまとめて描く

## 作るもの

大きさと色が異なる2つの円を横に並べ、それぞれの輪郭が短い円弧から閉じた円へ伸びるアニメーションを作ります。個別のsEllipseにLengthのキーフレームを打つ代わりに、合流後のsOutlineで輪郭の太さと表示範囲をまとめて調整します。

ここで示す値と見え方は21.1公式Manualから組み立てた確認用の例であり、実機で測定した結果ではありません。

## 必要なものと入力条件

- 空のFusion Composition。作業範囲は開始から48フレーム以上とします。
- sEllipse 2個、sMerge、sOutline、sRenderを各1個。
- sRenderの出力は1920×1080、正方形ピクセルを想定します。
- 図形は重ならないように置き、輪郭の接合や重なりの影響を避けます。

各sEllipseはSolidをオンにし、次の値を開始点にします。

| 図形 | Width / Height | X Offset | Y Offset | Styleの色 / Alpha |
| --- | --- | ---: | ---: | --- |
| A | 0.20 / 0.20 | -0.19 | 0 | 青 / 1 |
| B | 0.12 / 0.12 | 0.19 | 0 | 黄 / 1 |

## 接続

~~~text
sEllipse A ─→ Input1 ┐
                      ├─ sMerge ─→ sOutline ─→ sRender ─→ Viewer
sEllipse B ─→ Input2 ┘
                          Shape       Shape      2D Image
~~~

sOutlineのInput1には、2つの図形をまとめたsMergeの出力を接続します。図形の配置と色は上流に残し、線の処理をsOutlineへ集約します。

## 手順

### 1. 元になる2つの円を並べる

1. 2つのsEllipseに表の寸法、位置、色を設定します。
2. AとBをsMergeの別々の入力へ接続します。
3. いったんsMergeをsRenderへ直接つなぎ、Viewerで青と黄の塗りつぶされた円が離れて並ぶことを確認します。必要なら寸法と位置を調整します。
4. sMergeのOverride Axisは比較中に変更しません。2つの円の位置と寸法もここで固定します。

### 2. まとめて輪郭へ変える

1. sMergeとsRenderの間にsOutlineを挿入します。
2. sOutlineのControlsでThicknessを0.012程度から試し、Lengthを1.0に設定します。
3. sRenderの出力をViewerで表示します。2つの円がそれぞれ元の色を持つ閉じた輪郭として見える状態を目標にします。
4. Thicknessだけを0.025へ変更して線幅の変化を比べ、確認後に元の値へ戻します。
5. Positionを固定したまま、Lengthを0.35に変更します。輪郭に開いた部分が生じるかを観察します。

円の線幅を厳密に揃えたい場合は出力画像で実際に測定してください。設定値が同じでも、出力上の画素幅を確認したことにはなりません。

### 3. 共通のLengthを動かす

1. Composition開始から12フレーム目でsOutlineのLengthを0.35にし、キーフレームを設定します。
2. 開始から36フレーム目でLengthを1.0にし、もう1つのキーフレームを設定します。
3. 12、24、36フレーム目を順に表示し、2つの円の輪郭が伸びて閉じるか確認します。
4. 途中のフレームでCap StyleをFlatとRoundで比較します。端の形状以外の設定は変えません。

フレーム番号はComposition開始からの相対値です。開始フレームが0以外の場合は読み替えます。Length以外にはキーフレームを設定しません。

## 期待される結果と確認ポイント

| 条件 | 観察する変化 |
| --- | --- |
| sMergeを直接sRenderへ接続 | 異なる色と大きさの塗り円が2つ並ぶ |
| sOutlineを挿入しLength = 1.0 | 両方の輪郭が閉じる |
| Thicknessのみ増やす | 両方の輪郭の太さが変わる |
| Length = 0.35 | 各輪郭の一部が表示され、開いた端が見える |
| Lengthを0.35から1.0へ動かす | 1つの設定の変化で両方の輪郭が伸びる |

ManualはsOutlineの輪郭設定が入力図形へ共通に適用されると説明しています。ただし、この2円での描画開始角度、途中の実際の弧長、補間の挙動は未測定です。円ごとの物理的な線の伸びる速度が同じになるとは限りません。

## この構成で動く理由

sMergeは複数のShapeをまとめ、sOutlineはその入力に対して共通のThickness、Border Style、Position、Lengthを適用します。各円の色、位置、寸法の設定と、輪郭の描画設定を分離できるため、図形を追加した場合にも共通の設定を使う構成にできます。

最後のsRenderまでShapeのまま処理するため、途中で個々の図形を画像にする必要はありません。[Shapeの基本](../../learn/02-data/shape)と[必要な場所で画像化する考え方](../../patterns/data-domain/defer-domain-conversion)も参照してください。

## バリエーション

- 角のある図形を追加し、Border StyleのMiterとRoundを比べると、円だけでは分かりにくい角の接合形状を観察できます。
- 各図形の描画を別のタイミングで始めたい場合は、合流前に個別のsOutlineを置く構成を検討します。同じ図形の時間差複製なら[sDuplicateのTime Offset](./stagger-ring-drawing-with-sduplicate)が別の候補になります。
- 線の開始位置を変える場合はLengthを固定し、Positionだけを変更します。各形状の経路でどこが開始点になるかはViewerで確認します。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| 円が塗りつぶされたまま | sOutlineの後段にあるsRenderを表示しているか |
| 一方の円が見えない | sMergeへ両方が接続されているか、元の色のAlphaや位置は適切か |
| 輪郭の端が見えない | Lengthを1.0未満にしているか。閉じた輪郭ではCap Styleの違いが見えない |
| 1つの円だけ動く | 上流のsEllipseに意図しないキーフレームがないか、sOutlineが合流後にあるか |
| 最後まで閉じない | 最終キーフレームのLengthが1.0か、作業範囲内にあるか |

## 関連資料

- [sEllipse](../../nodes/shapes/s-ellipse) — 円の作成
- [sMerge](../../nodes/shapes/smerge) — 複数のShapeの合流
- [sOutline](../../nodes/shapes/soutline) — 複合Shapeの輪郭
- [sRender](../../nodes/shapes/s-render) — 画像化
- [穴あきカードの内外周を描く](../shapes/outline-punched-card-with-soutline) — sBoolean後の輪郭処理
- [複数図形をまとめて動かす](./move-shape-group-with-stransform) — 合流後の共通変形

## 出典と検証範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 117「Shape Nodes」を直接参照しました。

- pp.2738–2740：sEllipseの役割、Solid、色、Offset、寸法。
- pp.2746–2747：sMergeの入力、重ね順、Override Axis。
- pp.2750–2752：sOutlineの複合Shape入力、共通の輪郭設定、Thickness、Cap Style、Position、Lengthとキーフレーム。
- pp.2759–2761：sRenderのShape入力と出力解像度、Pixel Aspect。

[公式Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)

**確認済み**：公式Manualの機能と入力・出力の関係、原稿の構造と関連資料への相対リンク。

**未検証**：Resolve 21.1実機での2円の輪郭描画、元色の画素値、実際の開始角度・補間・弧長、Thicknessの画素換算、Alpha、Edition差および処理性能。verificationはpartialとします。
