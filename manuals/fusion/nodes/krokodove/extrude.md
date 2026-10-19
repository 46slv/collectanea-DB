---
title: Extrude（Krokodove）
description: KrokodoveのExtrudeで画像の縁を変形し、奥行きがあるように見せる方法。入力・出力、比較手順、3D系との違いを解説。
doc_type: node
term_id: extrude
term_short: 2D画像の縁を変形し、厚みがあるような見え方を作るKrokodoveの画像処理ツール。
verification: partial
aliases: [Extrude, Krokodove Extrude]
concepts: [image-data]
nodes: [Extrude]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# Extrude（Krokodove）

**Extrude**は、画像の縁を変形して**奥行きや厚みがあるように見せる**Krokodoveのツールです。DaVinci Resolve 21.1 Reference Manualでは、Chapter 105の「Image Pixel Tools」に掲載されています。

平らなロゴやタイトルの輪郭に立体感を加えたいときの候補です。ただし、ここで作るのは**画像の変形による奥行きの錯覚**であり、実際の3Dモデルを作る[Extrude 3D](../3d/extrude-3d)とは異なります。

## どんな変化を作るか

例えば、白い四角形が描かれた画像を考えます。そのままでは、白い面と背景の境界があるだけです。Extrudeは画像の縁を変形することで、その境界の周囲に奥行きを感じさせる見え方を作ります。

「厚みがあるように見える」ことと「厚みのある立体データができる」ことは別です。**Extrudeで加工した画像を斜めから見られる3D物体として操作できるとは限りません。** カメラを回して側面を確認したい場合は、Classic 3DのExtrude 3Dを検討します。

なお、Manualに記載されているのは「画像の縁を歪ませて奥行きの錯覚を作る」という役割までです。**透明部分との境界を参照するのか、色・明るさの差を参照するのか、どの方向へ画素を動かすのか**といった内部規則は、この記述だけでは確定できません。

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | <Term id="image">2D Image</Term> | 加工する画像を受け取る。画像、文字、画像化した図形などを元にできる。 |
| 処理 | 画像の縁の変形 | 境界付近の見え方を変え、奥行き感を作る。 |
| 出力 | 2D Image | 加工結果を通常の画像処理・合成へ渡す。 |

Imageとして整理する根拠は、21.1 Manualの「Image Pixel Tools」という分類と、画像の縁を変形するという説明です。これは**データの種類の説明**であり、実機の正式なポート名・入力数・補助入力の有無を確認したものではありません。

元になる画像が必要な場合は、BackgroundやText+で2D Imageを用意します。Shape系の図形を使う場合は、先に[sRender](../shapes/s-render)で画像化する必要があります。<Term id="shape-data">Shape</Term>は図形の輪郭をピクセル化する前のデータで、[Shapeの基礎](../../learn/02-data/shape)で違いを説明しています。

## 確認例：四角形の縁に効果を加える

初めて使うときは、細かい絵柄よりも**境界がはっきりした単純な画像**の方が、どこが変化したかを比較しやすくなります。

```text
Rectangle ──→ BackgroundのEffect Mask
                  │
              Background → Extrude → Merge（Foreground）→ MediaOut
                                          ↑
                                    背景映像（Background）
```

この図は**操作を確認するための構成案**です。Krokodove Extrudeの個別ポートやInspectorの設定値まで実機検証した公式作例ではありません。

1. Backgroundを作り、RectangleをBackgroundのEffect Maskにつないで、画面の中央に単色の四角形を表示します。四角形以外は透明になる構成です。
2. Backgroundの出力をExtrudeへ渡し、加工前のBackgroundと加工後のExtrudeをそれぞれViewerで確認します。
3. ExtrudeのInspectorで**実際に表示される項目**を一つだけ変え、境界がどのように変わったか比較します。ここでは未確認のスライダー名や既定値を指定しません。
4. 加工後のImageを通常のMergeのForegroundへ、背景映像をBackgroundへ入れます。透明部分や合成後の見え方を確認します。
5. 四角形を細長くしたり、丸い輪郭へ変えたりして、元画像の形による差を調べます。

比較の際は、**縁がどこからどこへ伸びるか／色がどう変化するか／透明部分を含むか**を分けて観察すると、効果の性質を判断しやすくなります。変化が不明瞭なときは、まずExtrudeを通さない画像へ戻して、元のAlphaや輪郭が意図した状態か確かめます。

## 制作での使い方

### タイトルやロゴに奥行き感を足す

Text+で作った文字や、透過背景のロゴ画像をExtrudeへ通し、元画像と比較します。平面の文字がそのままでは背景から浮かび上がらないとき、**輪郭の見え方を変える候補**になります。

```text
Text+ → Extrude → Merge → MediaOut
```

文字の字体や輪郭自体を作り替えるツールではありません。文字間隔・フォント・行組みはText+側で決め、Extrudeは後段の画像加工として使います。

### 他の縁処理と見比べる

「厚みを足したい」と思っていても、欲しいのが**内側の面取り**なのか、**光沢のある縁**なのか、**輪郭のずれ**なのかで選ぶ処理は変わります。同じ図形に別々のツールを適用し、Viewerで比較すると判断しやすくなります。

## 似た名前・用途のツール

| ツール | 主な働き | このツールとの違い |
| --- | --- | --- |
| **Extrude（このページ）** | 画像の縁を変形し、奥行きがあるように見せる。 | **2D画像を加工する**KrokodoveのImage Pixel Tool。 |
| [Bevel（Krokodove）](./bevel) | 画像の内側に面取りを作り、深さがあるように見せる。 | 縁の**内側の面取り表現**が中心。 |
| [Plastic（Krokodove）](./plastic) | 合成的な面取りや、プラスチック状の膜・光沢を表現する。 | 表面の**質感・光沢**が目的なら比較候補。 |
| [sExtrude](./sextrude) | 接続したShapeを押し出す。 | Shape系の別ツール。**出力の型・押し出し方は未確認**。 |
| [Extrude 3D](../3d/extrude-3d) | 平面Shapeから厚みのある3D形状を作る。 | ShapeInputを持ち、Classic 3Dとして扱う。 |

たとえば立体的な看板をカメラで斜めから撮る演出ならExtrude 3Dの方が目的に合います。一方、平面のタイトル画像の**縁の処理だけで奥行き感を加えたい**なら、Krokodove Extrudeを試す意義があります。

## 注意点と未確認事項

- **3Dジオメトリとは区別する。** Extrude 3Dの`Extrusion Depth`や`Bevel Width`などのInspector項目を、このExtrudeにもあるものとして説明しません。
- **「縁」の検出方法は未確認。** Alpha境界、RGBの差、輝度差など、どの情報に反応するかは実際の画像で確かめます。
- **正式な端子名・補助入力は未確認。** 入出力をImageとして分類できても、追加のMaskや制御用入力があるとまでは断定できません。
- **処理の寸法・方向・アニメーション可能な項目は未確認。** 実機に表示されたコントロールを基準に確認します。
- **製品エディションごとの提供差は未確認。** Resolve Free、Resolve Studio、Fusion Studioでの表示・動作が同じとは断定しません。

## バージョンと出典

- **一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436、Image Pixel Tools — Extrude**。画像の縁を変形して奥行きがあるように見せるツールとして掲載。
- **比較資料：** 同Manual、**p.2435**（Bevel、Plastic）、**p.2437**（sExtrude）、Chapter 88 **pp.1942–1944**（Extrude 3D）。
- **関連：** [画像データの基礎](../../learn/02-data/image)、[Shapeの基礎](../../learn/02-data/shape)、[Krokodoveの全体像](./)。

21.1実機でInspectorの正式名称・出力端子・演算条件などを確認していないため、`verification: partial`を維持します。