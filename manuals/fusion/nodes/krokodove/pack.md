---
title: "Pack"
description: "指定した色チャンネルに図形を重ねた模様を作るKrokodoveの画像ツール。"
doc_type: node
term_id: "pack"
term_short: "Packは、指定した色チャンネル内に図形を重ねて模様を作るKrokodoveの画像ツール。"
verification: partial
aliases: ["Pack"]
concepts: ["image-data"]
nodes: ["Pack"]
node_family: "krokodove"
inputs: ["image"]
outputs: ["image"]
tasks: ["motion-graphics"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-22"
---

# Pack

Packは、**指定した色チャンネルの中に、複数の図形を重ねた模様を作る**Krokodoveの画像ツールです。例えば、単色の面をそのまま使うのではなく、図形が積み重なったような質感を持たせたい場面で候補になります。

## 何をするツールか

DaVinci Resolve 21.1 Reference Manualでは、PackはKrokodoveの**Image Tools**に分類され、「指定した色チャンネル内に、重なった図形のパターンを作る」という役割が説明されています。

ここでの「重なった（stacked）」は、複数の形が同じ領域に重なって見えるという**模様の特徴**です。映像を何枚ものレイヤーに分割したり、Fusionの独立した<Term id="shape-data">Shapeデータ</Term>を出力したりする、と読み替えないでください。

また、「色チャンネル」は画像を構成する色の成分を指します。一般的な<Term id="image">画像データ</Term>では赤・緑・青などの成分を個別に扱えます。ただし、Packで実際に選べるチャンネルの一覧や選択方法は、Manualのこの項目には記載されていません。

## 入力と出力

- **入力分類：Image。** 既存のCOLLECTANEAノード台帳では、画像を受け取るツールとして登録されています。21.1 Manualの一覧には入力端子の正式名称・数・必須性の記載がないため、実際の接続口はFusion上で確認してください。
- **出力分類：Image。** 既存の台帳では画像を返すツールです。図形一つずつのShapeデータを後段で編集するノードではありません。色チャンネルごとの結果やAlphaの挙動は、Viewerで確認する必要があります。

「チャンネル内に模様を作る」ことと、「画像全体を同じ模様で塗りつぶす」ことは同義ではありません。どの成分に変化が現れるかを確認してから後段の色処理や合成へ進みます。

## 主な用途

- **抽象的な背景の素材作り：** 入力画像の色成分に図形状の模様を加える候補として試す。
- **チャンネルを使った質感比較：** 同じ入力画像に対してPackのチャンネル関連設定を変え、色や輝度の変化を比較する。
- **複数の模様生成ツールの選定：** 図形を重ねるPack、画面を敷き詰めるPattern、同心状の形を作るShapesを並べ、求める見た目に近いものを選ぶ。

これらはManualで記述された機能から考えた**制作上の使用案**です。特定の図形プリセットやアニメーション機能があることを示す実機検証結果ではありません。

## 具体的な確認例：単色素材を模様のある背景へ

1. Fusionで`Background`を使い、模様の変化を観察しやすい単色の画像を用意します。
2. Packを追加します。接続が必要な場合は、表示された入力端子にBackgroundをつなぎます。端子の必須性は実機表示に従ってください。
3. Packの結果をViewerに表示し、いったんPackを無効にした状態と比較します。どこに図形状の模様が生じるかを観察します。
4. Inspectorにチャンネルの指定がある場合は、一度に一項目だけ変更します。色ごとの表示だけでなく、透明度に変化がないかも確認します。
5. 別の`Background`を用意し、Packの画像出力が確認できた場合は`Merge`で重ね、タイトルの背面や抽象背景として使えるか試します。

```text
Background（模様を作る素材） → Pack ──→ Merge（前景） → Viewer / MediaOut
Background（背面の色） ─────────────────→ Merge（背景）
```

この接続図は**検証用の構成案**です。公式Manualに掲載された配線図ではなく、Packの入力端子やMerge時のAlphaの挙動を実機で保証するものではありません。

## 似たノードとの違い

| ノード | まず比較する点 |
| --- | --- |
| [Pattern](./pattern) | 図形を画面全体に規則的に敷き詰める。画面を埋める模様が目的ならこちらも候補。 |
| [Shapes](./shapes) | 円や四角などを同心状に重ねる。Packのチャンネル内パターンとは生成の考え方が異なる。 |
| [Lines](./lines) | 線の組を繰り返して模様を作る。線状の反復が欲しい場合に比較する。 |
| [Rasterize](./rasterize) | 画像を点・四角・ひし形などの形状で表し、ハーフトーン状に変換する。入力画像を図形の集まりに見せたいときに比較する。 |
| [Channel Shifter](./channel-shifter) | RGBA各成分を位置移動・ぼかし・拡大などで加工する。模様の生成ではなく、既存の成分をずらしたいときに使う。 |

## 注意点・確認範囲

Packの公式分類は**Image Tools**で、[Shapeデータの仕組み](../../learn/02-data/shape)とは別です。標準Shapeノードへ渡したい場合は、最初にデータ型の違いを確認してください。

21.1 ManualのPack欄は機能の短い紹介のみです。**Inspectorの項目名・値域・初期値、端子数、チャンネル選択肢、Alphaの扱い、Free/Studioの差**は、この資料だけでは確定できません。記述の確認状態は`verification: partial`を維持しています。

## 出典

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 105「Krokodove Nodes」p.2434、**Image Tools / Pack**。指定チャンネル内に図形を重ねた模様を作る機能の記述。
- 同Manual pp.2435–2436、**Pattern / Shapes / Lines / Rasterize / Channel Shifter**。用途の比較に使用。
- 入出力の分類は既存COLLECTANEA台帳を踏襲。実機での端子・Inspector・画質結果は未確認。

Krokodove内のほかのノードは[カテゴリ索引](./)から探せます。
