---
title: Bend
description: Krokodove Bendの放射状の画像変形を、入出力、作例、近いノードとの違いから説明。
doc_type: node
term_id: bend
term_short: 画像を放射状に曲げる、Krokodoveの2D画像変形ツール。
verification: partial
aliases: [Bend]
concepts: [image-data]
nodes: [Bend]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# Bend

**Bendは、画像を放射状に曲げるKrokodoveの画像変形ツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類され、画像を曲げるradial warpと説明されています。

例えば、格子模様やまっすぐ伸びる線のある画像を、部分的に曲げられたような見た目にしたいときの候補です。「曲げる」のは画像を構成する画素の位置関係であり、映像を曲線オブジェクトへ変換する操作ではありません。

## 放射状の画像変形とは

「放射状」とは、一点を中心に周囲へ広がる方向のことです。車輪の中心から外へ伸びるスポークを想像すると分かりやすくなります。

通常の平行移動では画像の点を同じ方向へずらします。一方、**画像変形（warp）では場所ごとに画素の動かし方が異なる**ため、直線や格子の間隔、輪郭が曲がったような見え方を作れます。Bendは、そのうち放射状の曲げを目的とするものです。

ただし、21.1 ManualのBend説明は短い一文です。曲げる中心の指定方法、何点で曲線を決めるか、実際にどの式で画素を移すかは記載されていません。上の説明は見た目を理解するためのもので、特定のアルゴリズムの保証ではありません。

<!-- capture:S236 -->

## 実機例：文字を曲線に沿わせる

合成した `Text+` の文字を `Bend` に渡し、MidpointをX 0.5、Y 0.75に設定しました。

この例では文字が弧に沿って曲がります。Viewerの操作用オーバーレイも画像に写っています。ほかのモードやAlphaの数値は未検証です。[接続と設定の記録](/img/fusion/captures/S236/readback.json)に条件を記載しています。

[![文字画像をKrokodove Bendへつなぐ構成](/img/fusion/captures/S236/graph.png)](/img/fusion/captures/S236/graph.png)

文字画像をBendへ渡します。

[![BendのInspector](/img/fusion/captures/S236/controls.png)](/img/fusion/captures/S236/controls.png)

MidpointをX 0.5、Y 0.75に設定しています。

[![処理前の文字](/img/fusion/captures/S236/low.png)](/img/fusion/captures/S236/low.png)

処理前の文字です。

[![Bendで曲げた文字](/img/fusion/captures/S236/high.png)](/img/fusion/captures/S236/high.png)

処理後は文字が弧に沿います。

[再現用Graph](/img/fusion/captures/S236/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S236/capture.json)

<!-- /capture:S236 -->

## 入力と出力

| 段階 | データ | 根拠・確認範囲 |
| --- | --- | --- |
| 入力 | **2D Image** | 21.1 ManualのImage Warp Tools分類と、既存COLLECTANEAカタログの分類。 |
| 処理 | 放射状に曲げる画像変形 | Manualで直接確認できるBendの役割。 |
| 出力 | **2D Image** | 変形後の画像を後段の画像合成へ渡す分類。 |
| 未確認 | 正式な端子名・端子数、補助入力、Inspectorの項目名・初期値・値域 | Manualの一覧だけでは特定できない。 |

ここでいう<Term id="image">Image</Term>は静止画や映像などの画素データです。線や面の輪郭を扱う<Term id="shape-data">Shape</Term>とは違います。BendはShape ToolsではなくImage Warp Toolsに分類されるため、**画像化された文字や図形も含め、入力画像の見た目を変形するツール**として考えます。

Frontmatterの入出力はデータ分類であり、実機の接続端子の正式名称や本数ではありません。

## 主な用途

### 曲がった模様の背景

格子、ストライプ、直線的な建築物の写真などは、変形前後の違いが見えやすい素材です。MVやタイトル映像の背景に、単なる位置移動とは異なる歪みを加える表現を検討できます。

### 実写の輪郭を変形する

窓枠や路面の白線など、直線が多い実写を入力すると、歪みの性質を比較しやすくなります。ただし、Bendが画像のどこに作用するか、画面外へ移動した画素がどう補われるかは未確認です。Viewerで中間結果を見ながら判断します。

### 文字を曲げず、背景だけに使う

Bendの後からタイトルを合成すると、文字は読めるまま背景の歪みを使えます。文字も含む合成画像をBendへ通すと、文字も画像の一部として変形対象になります。

## 制作例：格子の背景を変形し、タイトルを重ねる

以下は公式の設定値付きチュートリアルではなく、接続関係と効果を把握するための制作案です。

    MediaIn（格子・ストライプ） → Bend → Merge（Background） → MediaOut
    Text+（タイトル） ────────────────→ Merge（Foreground）

1. 格子やストライプの映像をMediaInからBendへ接続し、Bendの結果だけをViewerに表示します。
2. 曲がる場所や輪郭の見え方を観察し、別の入力素材やフレームとも比べます。存在を確認していないInspector設定名を前提にしません。
3. 必要なら前段に標準Transformを置き、入力画像の位置や大きさを変えた結果を比較します。これはBend内部の基準点を直接操作したとみなす方法ではありません。
4. Text+を標準MergeのForegroundへ、Bendの結果をBackgroundへ接続します。背景の歪みと文字の可読性を分離できます。
5. 再生して、画面端の欠け、意図しない透明部分、タイトルの読みやすさを確認します。

最初から人物の顔や細い文字で調整するより、格子で変形を把握してから実素材に替える方が、意図した見た目か判断しやすくなります。

## 近いノードとの違い

| ノード | 21.1 Manualで確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Bend** | 放射状の画像変形で画像を曲げる | 曲がるような歪みを作りたい |
| [Directional Scale](./directional-scale) | 指定方向へ画像を伸縮・変形する | 一方向への伸びを重視する |
| [Radial](./radial) | へこみ（dent）型の歪み。追加warp mask入力も記載されている | へこみ状の歪みと作用範囲の制御を検討する |
| [Spherize](./spherize) | 指定した形状領域に虫眼鏡のような変形を加える | 局所的な拡大鏡風の見え方を試す |
| [Warped Transform](./warped-transform) | 伸ばす、押し縮める、回す | 曲げ以外も含む変形を試す |
| [Mirror](./mirror) | 指定した線に沿って反転する | 曲げではなく鏡映が欲しい |

BendとRadialはどちらも放射状の変化を連想させますが、ManualではBendを「曲げ」、Radialを「dent distortion」と区別しています。**Radialに記載された追加warp mask入力がBendにもあるとは断定できません。**

## 注意点と未確認の仕様

- **3-point splineの扱い**：旧記事には「3-point splineによるradial bend」とありましたが、21.1 ManualのBend説明は「Radial warp, bending the image」です。3点スプラインによる操作が可能かどうかは、この一次資料だけでは確認できません。
- **Inspector**：実機ではType、Start、Midpoint、End、Radiusなどの表示を確認しました。初期値の普遍性、値域、補間方法は未確認です。未確認の設定名を実操作として案内しません。
- **画面端・Alpha**：画面外の画素の扱い、透明度、premultiply、境界の補間方法は未確認です。透明素材ならMerge後も確認します。
- **時間変化**：専用の速度制御やアニメーション設定の存在は確認していません。上の構成は入力に動画を用いる例です。
- **Edition差**：21.1 Manualに掲載されていることは確認済みですが、Resolve Free / Studio / Fusion Studioそれぞれの提供条件、現在の表示名は別途確認が必要です。実機のREGIDはKD_Bendです。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2436「Image Warp Tools / Bend」**。同ページのDirectional Scale、Radial、Mirror、p.2437のSpherizeも比較しました。

入出力のImage分類は公式のカテゴリと既存COLLECTANEAカタログを併用しています。上記の文字画像の曲げは実機で確認しました。その他の具体例は確認できた役割から組み立てた制作案です。端子・Inspector・Alpha・Editionの詳細は未確認のため、verificationはpartialとしています。

[Krokodove全体像](./)と[画像（Image）](../../learn/02-data/image)も参照してください。
