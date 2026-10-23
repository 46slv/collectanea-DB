---
title: sRender
description: Shapeを2D Imageへ画像化し、解像度・色深度・マスク・色空間の扱いを決めるShape Renderer。
doc_type: node
term_id: s-render
term_short: Shapeの図形情報を2D Imageへ変換し、通常の合成や画像エフェクトへ渡す。
verification: partial
aliases: [sRender, Shape Render]
concepts: [shape-data, rasterization, image-data]
nodes: [sRender]
node_family: shapes
inputs: [shape, mask]
outputs: [image]
controls: [Process Mode, Width, Height, Pixel Aspect, Auto Resolution, Depth, Source Color Space, Source Gamma Space, Remove Curve]
tasks: [shape, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# sRender

**sRenderは、Shapeの図形情報を通常の2D Imageへ変換するノードです。** 円・四角形・文字を作り、Shapeのまま複製や変形を続けた後、Glowなどの画像エフェクトをかけたり、撮影素材の上へ合成したりする地点に置きます。

<Term id="shape-data">Shape</Term>は輪郭や塗りを保持する図形データで、画素の集まりである2D Imageとは異なります。Shape系ノードの結果を一般的なImage系ノードへ渡すには、sRenderによる変換が必要です。[Shapeの基本](../../learn/02-data/shape)と[2D Image](../../learn/02-data/image)を参照してください。

## 入力と出力

- **Input1（オレンジ、必須）**：最後のShapeノードから図形データを受け取ります。複数の図形は[sMerge](./smerge)などでまとめてから接続できます。
- **Effect Mask（青、任意）**：画像化した結果の表示範囲を限定するマスク入力です。Input1に接続するShapeデータとは目的が異なります。
- **出力（2D Image）**：図形を画像化した結果です。通常のMerge、Soft Glowなどへ接続できます。

```text
sEllipse → sGrid → sRender → Soft Glow → Merge → MediaOut
         Shapeの反復     ↑       2D画像として処理
                      ここで画像化
```

入力側のShape、出力側のImage、青いEffect Maskは別の役割を持ちます。図形を生成するShapeと画像の表示範囲を定める[Mask](../../learn/02-data/mask)を混同しないでください。

## Inspectorの設定

### Process Mode

画像をどのようにフィールド処理するかを指定します。21.1 Manualでは、プログレッシブ形式には既定の**Full Frames**が適切とされています。通常のプログレッシブ映像なら、特別な事情がない限り変更する必要はありません。

### Width / HeightとPixel Aspect

**Width / Height**は画像化後の幅と高さを画素単位で指定します。**Pixel Aspect**は1画素の縦横比です。正方形ピクセルなら1:1で、画像全体の縦横比とは別の値です。

Width、Height、Pixel Aspectを右クリックすると、Preferencesの**Frame Format**で定義された形式を選べます。選択した形式に対応する解像度と画素比が設定されます。

### Auto Resolution

**有効時**はWidth、Height、Pixel AspectをCompositionのFrame Formatへ連動させます。Frame Formatが変われば、sRenderの出力画像もその設定に追従します。

**無効時**は別の解像度を直接指定できます。最終出力とは異なるサイズで図形を画像化したいときに使います。画面上の図形の大きさ、輪郭線、後段エフェクトの広がりを確認し、意図しない解像度のまま合成しないようにします。

### Depth

生成画像の色深度を決めます。21.1 Manualでは、32-bitの画素は8-bitの画素に比べて4倍のメモリを必要とする一方、色の精度が高いと説明されています。浮動小数点の画像は、通常の0〜1の範囲外にあるHDRの値も扱えます。

発光表現や複数段の色処理を続けるときは、必要な値域と精度、メモリ消費を見て選びます。Depthを大きくするだけで必ず画質が改善するわけではありません。

### Source Color Space：メタデータを指定する

**Source Color Space**は生成画像の色空間を下流へ知らせる設定です。Manualは、この操作だけではGamutノードのような**実際の色空間変換を行わない**と明記しています。

- **Auto**：画像にある色空間メタデータを読み取り、引き継ぎます。
- **Space**：Color Space Typeメニューで色空間を指定します。

下流のGamutノードが**From Image**を使う場合などに、このメタデータが利用されます。色空間を選んだだけで画素値が変換されたと考えないでください。

### Source Gamma SpaceとRemove Curve：ガンマの扱い

**Source Gamma Space**のCurve Typeには次の選択肢があります。

- **Auto**：検出できるガンマ情報を引き継ぎます。
- **Space**：Gamma Space Typeで曲線を選びます。
- **Log**：Cineon系に似たLog/Linの設定を表示します。

**Remove Curve**を使うと、指定・検出したガンマ曲線を除去するか、Logからリニアへの変換を行います。これはSource Color Spaceの単なるメタデータ指定と異なり、**画像の値そのものに作用する処理**です。

色管理されたコンポジットでは、上流の画像がすでにリニアなのか、どのガンマで扱われているかを確認します。必要性を確かめずにRemove Curveを使うと、意図しない二重変換につながる可能性があります。

## 制作での使い方

### 図形を撮影映像へ重ねる

テロップの後ろへ半透明の帯を敷く場合、[sRectangle](./srectangle)で形と色・Alphaを作り、sRenderで画像へ変換します。その画像を通常のMergeのForegroundへ、撮影映像をBackgroundへ接続します。

```text
sRectangle → sRender ─────→ Merge（Foreground）→ MediaOut
映像（MediaIn）────────────→ Merge（Background）
```

帯の幅や角の形を編集する間はsRectangleで作業できます。合成はsRenderの後段で行うため、Shapeの編集と2D Imageの合成を分けられます。

### ドット模様を複製してGlowをかける

円を[sGrid](./sgrid)で行列状に配置し、[sJitter](./sjitter)で位置などにばらつきを加えます。その後sRenderで画像化し、Soft Glowで光を広げます。

```text
sEllipse → sGrid → sJitter → sRender → Soft Glow → Merge
```

sGridとsJitterは図形の配置を扱い、Soft Glowは画像化した画素に作用します。複製数や配置を後から調整する場合も、sRenderより前で編集を続けられます。

### マスクで見える範囲だけを絞る

円を並べた模様を、画面中央の窓の内側だけに表示する例です。模様のShapeはInput1へ、別に作ったマスクは青いEffect Maskへ接続します。

```text
sEllipse → sGrid ─────→ sRender → Merge
                          ↑
                    Effect Mask（青）
                          ↑
                        窓型Mask
```

sGridは模様全体を作り、Effect Maskはどこを表示するかを決めます。模様の位置や数と、表示範囲を独立して変更できます。Shape出力をそのままEffect Maskへ接続できるとは限らないため、マスクとして受け入れられるデータ種別を確認してください。

### 合成解像度とは別の大きさで画像化する

最初はAuto Resolutionを有効にしてCompositionのFrame Formatと一致させます。必要があるときだけ無効にし、Width・Height・Pixel Aspectを変更します。

変更の前後で、Viewer上の輪郭、線幅、Maskの位置、後段のGlowなどを比較します。これはManualに記載された解像度設定を利用する手順であり、特定の補間方法や画質向上を保証するものではありません。

## 関連ノードとの違い

- **[sMerge](./smerge)**：複数のShapeをまとめます。画像化はしません。
- **[sChangeStyle](./schangestyle)**：ShapeのColorやAllow Combiningを変更します。Image全体の色補正とは別です。
- **pRender**：Particleデータを2D Imageへ変換します。
- **Renderer 3D**：従来の3Dシーンを描画します。
- **uRenderer**：USDシーンを描画します。

sRenderはShape用のRendererです。別種のRendererへShapeを接続できるという意味ではありません。必要なShape処理を続け、画像系の操作へ移る地点で変換する設計については[データ領域を保つ処理](../../patterns/data-domain/defer-domain-conversion)も参照してください。

<!-- capture:S04 -->
## 実機でShapeを画像へ変換する

DaVinci Resolve Studio 21.1.0.14、Windows、日本語UI。1920×1080、フレーム0で撮影しました。画像を開くと原寸で確認できます。

[![sEllipse → sRender → MediaOut](/img/fusion/captures/S04/graph.png)](/img/fusion/captures/S04/graph.png)

sEllipseのWidthを0.5、Heightを0.28にし、sRenderへ接続しました。Inspectorの自動解像度を有効にした状態で1920×1080が表示され、右Viewerには横長の白い楕円が出ています。

[![sRenderのImageタブ。1920×1080、自動解像度とDepthの表示](/img/fusion/captures/S04/inspector.png)](/img/fusion/captures/S04/inspector.png)

[![sRenderによって画像化された白い楕円](/img/fusion/captures/S04/result.png)](/img/fusion/captures/S04/result.png)

Viewer倍率は40%です。市松模様は透明部分を示します。

[再現用Graph](/img/fusion/captures/S04/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S04/capture.json)

## 出典と確認範囲

**出典：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 117「Shape Nodes」、pp.2759–2762。

Manualにより、Input1、Effect Mask、2D Image出力、Process Mode、Width・Height、Pixel Aspect、Auto Resolution、Depth、Source Color Space、Source Gamma Space、Remove Curveを確認しました。該当箇所には「Background node」「Creator node」という別ノードの名残と思われる表記がありますが、前後の図と説明を基にsRenderの項目として整理しています。

上記の楕円の実機例ではREGID `sRender` とShapeの画像化を確認しました。その他の接続例は確認済み仕様を基に組み立てた運用例です。Edition差、Alpha合成の細部、全選択肢の既定値、他の条件での実機描画結果は未確認のため`verification: partial`を維持します。
