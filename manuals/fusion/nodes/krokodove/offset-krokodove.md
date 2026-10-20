---
title: Offset（Krokodove）
description: Krokodove Offsetが画像を水平・垂直方向へずらしたり歪ませたりする意味、入出力、検証用の格子画像、Transformとの使い分けを解説。
doc_type: node
term_id: offset-krokodove
term_short: 2D画像に水平・垂直方向の位置ずれや歪みを加えるKrokodoveのImage Warpツール。
verification: partial
aliases: [Offset]
concepts: [image-data]
nodes: [Offset]
node_family: krokodove
inputs: [image]
outputs: [image]
tasks: [motion-graphics]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-20'
---

# Offset（Krokodove）

**Offsetは、画像を水平方向または垂直方向にずらしたり、歪ませたりするKrokodoveのツール**です。DaVinci Resolve 21.1 Reference Manualでは「Image Warp Tools」に分類され、画像に対する水平・垂直方向のdisplacement / warpとして紹介されています。

ここでいう「ずらす」は、画像のピクセルをどこに表示するか変えることです。例えば縦線と横線が規則的に並ぶ格子画像では、処理後に線の位置が移れば、画像の位置関係が変わったことを目で確認できます。

ただし、**画像全体を一律に平行移動するだけなのか、場所ごとに異なる量で画素を動かせるのか**は、この短いマニュアル記述だけでは確定できません。Offsetという名称から、画面外のピクセルを反対側へ回り込ませる処理や、別の画像による変形量の制御が必ずあると考えないでください。

## 水平・垂直方向の変形とは

水平（horizontal）は画面の左右、垂直（vertical）は上下の方向です。画像の中に縦線を引いたとき、その線が右へ移動すれば水平方向の位置が変わっています。横線が上へ移れば垂直方向の位置が変わっています。

例えば、ロゴの背後にある格子模様を右へ寄せると、格子とロゴの位置関係が変わります。一方で、格子の一部分だけを曲げられるツールなら、直線の形そのものも変化します。どちらも画像の「ずれ」ですが、見た目と用途は異なります。

21.1 ManualはOffsetを *Displaces/warps an image on the horizontal/vertical axis* と説明しています。**位置ずれと変形の双方を表す表現**ですが、変形の数式、領域ごとの制御、方向の正負、画面端での処理は記載されていません。実際にどちらの変化が起きるかは、使用するコントロールと入力画像によってViewerで確認する必要があります。

## 入力と出力

| 段階 | 役割 | 根拠・確認範囲 |
| --- | --- | --- |
| 入力 | 加工したい2D <Term id="image">Image</Term> | Image Warp Toolsという分類と既存カタログに基づくデータ種別 |
| 処理 | 水平・垂直方向へ画像をずらす、または歪ませる | 21.1 ManualのOffsetの説明 |
| 出力 | 加工後の2D Image | 画像を変形するツールという分類と既存カタログに基づくデータ種別 |
| 未確認 | 正式な入力・出力端子名、端子の本数、第2画像やMask入力の有無 | Manualの一覧には端子図がない |

Imageはピクセルで表された静止画・映像です。映像素材だけでなく、Text+で描いた文字やBackgroundで作った模様も、Imageになった後なら画像処理の対象として扱えます。画像のピクセルを動かすことと、輪郭を保持するShapeデータの点を編集することは別です。

frontmatterの `inputs: [image]` と `outputs: [image]` は、**主なデータ分類**を記したものです。実際のポート数を1本に限定する記述ではありません。

以前のこの記事には「第2の画像で水平・垂直のdisplacementを制御する」という説明がありました。しかし**DaVinci Resolve 21.1 ManualのOffsetの一覧説明には、第2入力の存在も使い方も書かれていません**。本記事ではその説明を確定事項から外し、実機で端子と動作を確認する項目として扱います。

## 主な用途

### 格子やストライプを方向性のある模様に変える

縦横の線を並べた背景は、左右・上下どちらに変化しているかを観察しやすい素材です。格子の直線が平行なまま動くのか、一部が曲がるのかを見れば、選んだ操作が何を変えているかを判断できます。

### 背景と前景の位置関係を調整する

背景だけにOffsetを使い、前景の文字やロゴは加工せずに重ねる構成を取れば、文字の読みやすさを残して背景の位置ずれや歪みを試せます。Offsetに文字を通さなければ、文字のピクセルはOffsetの処理対象にはなりません。

### 標準Transformでは足りない変形を検討する

画像全体を移動するだけなら、まず標準の[Transform](../transform/transform)が分かりやすい選択です。Krokodove Offsetは21.1 Manualでwarpに分類されているため、単純な配置変更とは異なる結果を得たい場合に比較する候補になります。ただし、**特定の局所変形が必ずできることまでは確認できていません**。

## 制作例：格子画像でずれ方を確かめる

次はOffsetの動作を観察するための**検証用の構成案**です。21.1 Manualに掲載された設定値や、実機で再現済みの操作手順ではありません。

```text
MediaIn（格子画像） → Offset → Merge（Background） → MediaOut
Text+（見比べる文字） ─────────────→ Merge（Foreground）
```

1. 縦線と横線を等間隔に描いた格子画像をMediaInから読み込みます。可能なら線の交点に小さな番号や目印を付けます。元の位置が分かれば、変形方向を判断しやすくなります。
2. MediaInをOffsetへ渡し、処理前と処理後をそれぞれViewerで表示します。最初は同じフレーム、同じ解像度で比較してください。
3. Inspectorに実際に現れる水平・垂直の移動や変形に関係する項目を探し、**正式な表示名を確認してから**値を一つずつ変えます。Manualの短い一覧から特定のスライダー名や数値範囲は指定できません。
4. 格子の**全部の交点が同じ量だけ動くのか、場所によって動く量が異なるのか**を観察します。線の曲がり方も見て、単純な平行移動とwarpを区別します。
5. 水平方向を変えた結果と垂直方向を変えた結果を別々に確認します。両方向を同時に大きく変えると、どちらがどの見た目を作ったのか分かりにくくなります。
6. Offsetの出力をMergeのBackgroundへ、Text+をForegroundへ接続します。文字が変形されていないことと、背景だけが加工されていることを確認します。
7. 最後に動画素材や透明部分を持つ画像でも確認します。画像端の欠け、透明部分、合成したときの輪郭を見ます。特に端の繰り返しや補間方法は、結果を見ずに決めつけないでください。

比較のために、格子画像の別系統へ標準Transformを接続しても構いません。同じ位置に見える設定を探すと、Offsetでしか生じない変化があるかを調べられます。**一致したとしても、内部の処理が同じである証拠にはなりません。**

## 近いノードとの違い

| ノード | 確認できる役割 | 選ぶ目安 |
| --- | --- | --- |
| **Offset（Krokodove）** | 水平・垂直方向のdisplacement / warp | 方向を意識した画像の位置ずれ・歪みを試したい |
| [Transform](../transform/transform) | 位置・回転・拡大縮小による通常の2D配置 | 画像全体の場所と大きさを調整したい |
| [Directional Scale](./directional-scale) | 指定方向へ画像を伸ばす・歪ませる | 一方向への伸縮を重視したい |
| [Relative Transform](./relative-transform) | 第2入力を利用した変形と、画素を基準にしたPivot | 別入力や変形の基準点を検討したい |
| [Warped Transform](./warped-transform) | 伸縮・圧縮・回転などを使った画像変形 | 複数の変形操作を比較したい |
| [Mirror](./mirror) | 指定した線に沿って画像を反転する | 鏡像のように向きを変えたい |

OffsetとDirectional Scaleはどちらも方向を使った変形ですが、**Offsetはdisplacement / warp、Directional Scaleは指定方向へのstretch / distort**とManualで説明されています。同じパラメータ構成や演算方法だとは確認できません。

## 注意点と未確認事項

- **第2入力**：旧記事の「第2の画像で制御」という記述は、21.1 Manualの該当行から確認できません。実際に第2画像を接続できるか、制御に使うかは未確認です。
- **Inspector**：水平・垂直方向に関係する正式な項目名、初期値、座標系、値域、符号と方向の対応、アニメーション方法は未確認です。
- **画素の移動方法**：画像全体が一様に移るのか、場所による変化があるのか、画面外の画素がどう扱われるのか、端の繰り返しや補間方式は未確認です。
- **追加端子とMask**：入力・出力端子数、Effect MaskやRegionの利用可否、入力のデータ型は実機で確認する必要があります。
- **解像度・Alpha**：処理前後の出力解像度、Domain of Definition、透明画素の扱い、premultiplicationへの影響は未確認です。
- **製品差**：Resolve Free / Studio / Fusion Studioの対応差、内部REGID、実際のEffects Library上の表示は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、**Chapter 105「Krokodove Nodes」p.2436、Image Warp Tools / Offset**。水平・垂直方向のdisplacement / warpという役割を確認しました。

データ分類には既存COLLECTANEAカタログを併用しています。制作例は公式の操作手順ではなく、この役割を観察するための提案です。正式な端子構成、Inspector項目、追加画像入力、Edition差は未確認のため、`verification: partial`を維持しています。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/jp/support/)から現行の資料を確認できます。

[Krokodoveの全体像](./)と[Imageデータの説明](../../learn/02-data/image)も参照してください。
