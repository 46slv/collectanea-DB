---
title: sOffset
description: Shapeの輪郭を外側・内側へ変化させるKrokodoveツール。Numberによる反復と、位置移動・拡大縮小との違いを説明する。
doc_type: node
term_id: soffset
term_short: Shapeの輪郭を広げたり縮めたりする。Numberでその処理を繰り返せる。
verification: partial
aliases: [sOffset]
concepts: [shape-data]
nodes: [sOffset]
node_family: krokodove
inputs: [shape]
outputs: [shape]
controls: [Number]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sOffset

**sOffset**は、円や四角などの**輪郭を外側へ広げたり、内側へ縮めたりする**KrokodoveのShapeツールです。図形そのものを画面の右や左へ動かす「位置のオフセット」ではありません。たとえば四角形を入力した場合、四角形を置いた場所ではなく、四辺で囲まれる領域の広がり方が変わる、という違いがあります。

ここで扱う<Term id="shape-data">Shape</Term>は、輪郭や図形の情報を保持した**画像化前のデータ**です。通常の2D画像にするには、後段で[sRender](./s-render)を使います。Shapeと画像の基本的な違いは[シェイプ（Shape）](../../learn/02-data/shape)で説明しています。

## 何を変えるのか

たとえばロゴの周りにもう一段広い形を作りたい場合、元の輪郭を外へ広げる処理が候補になります。逆に、同じ輪郭を内側へ寄せて小さく見せたい場合にも使えます。

- **外側への拡張**：輪郭が囲む領域を広げる方向の処理。図形の周囲に別の外形を作る用途で考えられます。
- **内側への収縮**：輪郭が囲む領域を狭める方向の処理。図形を内側へ絞る用途で考えられます。
- **反復**：同じ輪郭変更の効果を複数回適用する機能。21.1 Manualはこのための`Number`スライダーがあると明記しています。

ここでの「輪郭を広げる」は、**図形を中心から一律に拡大することと同じとは限りません**。拡大縮小は一般に中心を基準に図形全体の寸法を変える考え方ですが、sOffsetは輪郭の拡張・収縮として説明されています。ただし角の処理、輪郭からの距離の測り方、複雑な図形での交差処理など、正確な形状計算はManualの短い説明だけでは決められません。

## 入力と出力

| 段階 | データ | 役割 |
| --- | --- | --- |
| 入力 | Shape | 円・四角・パスなど、前段で作った図形の輪郭を受け取る。 |
| 処理 | 輪郭の拡張・収縮 | 図形の位置移動ではなく、輪郭の広がり方を変える。 |
| 出力 | Shape | さらにShapeとして加工するか、sRenderへ渡して画像化する。 |

Shape入出力の分類は既存COLLECTANEAのカタログに基づきます。**正式な端子ラベル・入力端子数・接続色は実機未確認**です。後段へ一般的なBlurやMergeを置く場合は、Shapeのままではなく[sRender](./s-render)で画像にしてから渡します。

## 主な設定：Number

DaVinci Resolve 21.1 Reference ManualのKrokodove Shape Toolsには、sOffsetの輪郭拡張・収縮を**`Number`スライダーで繰り返せる**と記載されています。

ただし、`Number`の**初期値・上下限・端数の扱い・数値と反復回数の対応**は、この資料からは確認できません。また、反復が何本の独立した輪郭を出すか、前回の出力へ再適用するかといった内部処理も、実機で確認するまで断定しません。

拡張・収縮の量を調整する具体的なInspector項目名や正負の値の意味も、Manual本文だけでは未確認です。表示されるコントロールを確認したうえで変更してください。

## 最初に試す構成

次は各ノードの役割に基づく**実機確認用の構成案**です。Krokodoveでの接続と結果を検証済みのレシピではありません。

```text
sEllipse → sOffset → sRender → MediaOut
 円を作る   輪郭を変える   画像化      表示
```

1. [sEllipse](./s-ellipse)で円を作り、まず`sEllipse → sRender`で元の輪郭を確認します。中心位置と大きさを固定しておくと変化を比較しやすくなります。
2. sEllipseとsRenderの間にsOffsetを入れます。端子が対応していることをGraph上で確認します。
3. Inspectorで輪郭の拡張・収縮に対応する設定を探し、**一度に一つだけ**変更します。元の円に対して外形がどう変わるか、sRenderの結果を見比べます。
4. 次に`Number`を変更し、反復の有無や輪郭の変化を観察します。数値の大小と輪郭の本数を無条件に同一視しないでください。
5. うまく比較できない場合はsOffsetを一時的に外し、sEllipse単体、sOffsetの有無、sRenderの出力を順に確認します。

四角形の方が角の変化を見分けやすい場合は、[sRectangle](./srectangle)へ置き換えて試せます。ただし、角がどのように丸まるか・交差するかなどの挙動は確認対象であり、既知の仕様ではありません。

## 制作での使い方

### ロゴやタイトルの周囲に外形を加える

図形の輪郭より一回り大きい形を作りたいとき、元のShapeを編集し直す代わりにsOffsetを後段へ置く構成を検討できます。**外側に広がった輪郭が得られるか**を単一図形で確認し、その後で[sRestyle](../krokodove/srestyle)などの外観変更と組み合わせます。

```text
sEllipse → sOffset → sRestyle → sRender → Merge（背景へ重ねる）
```

ここでsOffsetは**形**、sRestyleは**塗り・輪郭の見た目**を担当します。上の順番は役割から考えた構成案であり、sRestyleが反復後の各輪郭へどう作用するかは未確認です。

### 内側へ寄せた輪郭を試す

バッジやアイコンの内側に細い形を置きたい場合、輪郭を内側へ縮める効果が候補になります。ただし、元の図形を残して**内側の線だけを追加する機能**と断定することはできません。元の輪郭と変更後の輪郭を両方見せる必要があるなら、[sMerge](./smerge)などで別系統のShapeを組み合わせる構成を検討します。

## 関連ノード・混同しやすい機能

| ノード | 主な役割 | 選ぶ目安 |
| --- | --- | --- |
| **sOffset** | Shapeの輪郭を拡張・収縮する | 元の輪郭を基準に形を変えたい |
| [sRound](../krokodove/sround) | 辺を保ちながら角を曲線にする | 角だけを丸めたい |
| [sSmooth](../krokodove/ssmooth) | 角を保ち、辺を滑らかに曲げる | 辺の曲がり方を変えたい |
| [sRestyle](../krokodove/srestyle) | 塗り・輪郭の見た目を上書きする | 形より色や輪郭線の外観を変えたい |
| [sTransform](./stransform) | Shapeの位置・回転・拡大縮小を扱う | 図形全体を移動・変形したい |
| [Offset（Krokodove）](../krokodove/offset-krokodove) | **画像**を水平・垂直に変位させる | 2D画像そのものを動かしたい |

特に**sOffsetとOffsetは別項目**です。21.1 ManualのChapter 105でも、sOffsetは「Shape Tools」、Offsetは「Image Warp Tools」に分類されています。名前が似ていても、入力データと変化させる対象が違います。

## 注意点と確認範囲

- **資料で確認できたこと**：輪郭の拡張・収縮、`Number`による効果の反復。分類はKrokodoveのShape Toolsです。
- **カタログ由来の分類**：Shape入力／Shape出力。正式なコネクター名と端子数は未確認です。
- **未確認のInspector仕様**：拡張量のラベル、符号、値域、初期値、`Number`の計算・補間、キーフレーム対応。
- **未確認の形状挙動**：鋭角・自己交差・穴を持つ輪郭・非常に小さい図形での結果、複数Shapeに適用した場合の規則。
- **環境差**：内部REGID、Resolve Free／Studio／Fusion Studioでの提供差、21.1実機結果は未確認です。

## バージョンと出典

Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Tools — sOffset」。輪郭を広げる・縮める役割と`Number`スライダーによる反復を確認しました。同Chapter p.2436「Image Warp Tools — Offset」は、画像の水平・垂直方向の変位を説明しています。

Shapeと画像化の基本的な区別は同Manual Chapter 117「Shape Nodes」および[シェイプ（Shape）](../../learn/02-data/shape)を参照してください。実機や正確なコントロール仕様は未確認のため、`verification: partial`を維持します。
