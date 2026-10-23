---
title: sSpiral Create
description: 中心点や軸の周囲を巻く一本の曲線をShapeとして作るKrokodoveノード。用途と画像化までの流れを説明する。
doc_type: node
term_id: sspiral-create
term_short: 中心点または軸の周囲を巻く、連続したらせん状の曲線を作るKrokodoveのShape生成ツール。
verification: partial
aliases: [sSpiral Create, sSpiralCreate]
concepts: [shape-data]
nodes: [sSpiral Create]
node_family: krokodove
outputs: [shape]
tasks: [build-shape]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-19'
---

# sSpiral Create

**sSpiral Create**は、中心点や軸の周りを巻いて進む、らせん状の曲線を生成するKrokodoveのツールです。円を何枚も重ねるのではなく、巻きながら続く線を図形として扱いたい場合に使います。

たとえば、タイトルの周りを回り込む装飾線や、中心から外へ広がるような線のデザインを考えると、用途をイメージしやすくなります。ただし、線が実際に内側から外側へ進むのか、巻き方向をどう指定するのかは、現在の資料だけでは分かりません。

## 何が生成されるのか

このノードは、DaVinci Resolve 21.1 Reference Manualの「Shape Create Tools」に分類されています。<Term id="shape-data">Shape</Term>は、まだ画像のピクセルに変換されていない図形データです。線の形を保持したままShape用の加工を続けられ、最後に[sRender](../shapes/s-render)で通常の2D画像にします。

**らせん状の曲線**と**立体のばね**は別のものです。Manualが説明しているのは中心点または軸を巻く曲線の生成であり、厚みのある管・3Dメッシュ・奥行き方向に伸びるばねを直接作るとは記載されていません。また「軸」がInspector上のどの座標を指すかも未確認です。

## 入力と出力

| 項目 | 扱うもの |
| --- | --- |
| 入力 | 新しい曲線を作る生成ツールとして掲載されています。上流のShapeが必要とは記載されていませんが、補助入力や端子の有無は未確認です。 |
| 出力 | らせん状の曲線をShapeとして後段のShape系処理へ渡す用途です。正式な出力端子名と内部データ型は未確認です。 |
| 画像として使用する場合 | [sRender](../shapes/s-render)でShapeを2D Imageへ変換してから、通常の[Merge](../compositing/merge)などへ渡します。 |

標準のShape系と同じデータの流れを想定すると、構成は次のようになります。

```text
sSpiral Create → sRender → Merge
   曲線を作る      画像化する  背景などと合成
```

これは**各ツールの記載された役割から組み立てた構成案**です。Krokodove 21.1で実際に端子を接続し、描画結果を確認済みという意味ではありません。sRenderがShapeを画像へ変換すること自体は、同ManualのShape Nodes章で説明されています。

## 具体的な運用例

### タイトルを囲む装飾線

1. まず文字や背景とは別にsSpiral Createを置き、らせんの生成を試します。
2. Shapeを受ける[sRender](../shapes/s-render)につなげられるか確認し、出力をViewerで表示します。線が見えない場合は、接続だけでなく描画範囲や見た目の設定も確認してください。
3. 線の色や輪郭の見た目を変えるときは、[sRestyle](./srestyle)を間に挟む構成が候補です。sRestyleは入力されたShapeの塗り・輪郭を変更するツールですが、この組み合わせの実機結果は未検証です。
4. 画像化した結果をMergeでタイトル・背景と合成し、線が文字の可読性を妨げない位置や大きさを探します。

```text
sSpiral Create → sRestyle → sRender → Merge
   巻く曲線         見た目       2D画像     タイトル・背景
```

この例の目的は、**曲線の生成・見た目の調整・画像化・合成**を分けることです。巻き数、線間隔、半径、中心位置、線幅などを変更する具体的なInspector操作は、21.1 Manualの該当一覧では説明されていません。

### 線を描いて現す演出

らせんの輪郭が少しずつ現れる表現を考えるなら、[sWriteOn](./swriteon)も検討できます。これはShapeの輪郭を描いて現したり、隠したりするKrokodoveツールです。

```text
sSpiral Create → sWriteOn → sRender
   曲線を作る       輪郭の表示   2D画像へ
```

この接続も**運用候補**であり、端子の互換性、線の進む順番、アニメーションのInspector設定、描画方向は実機で確認する必要があります。「中心から外へ自動的に描かれる」とは断定できません。

## 似たツールとの使い分け

| ツール | 選ぶ基準 |
| --- | --- |
| [sPrimitiveCreate](./sprimitive-create) | 十字・多角形・長方形・星形など、基本図形を出発点にしたい |
| **sSpiral Create** | 中心や軸を巻く、連続した曲線を作りたい |
| [sTrace Create](./strace-create) | すでにある2Dの文字や図形をShape環境へ渡したい |
| [sWriteOn](./swriteon) | 生成済みのShapeの輪郭を現したり隠したりしたい |
| [sRender](../shapes/s-render) | Shapeを通常の2D画像として合成・加工したい |

sSpiral Createは図形を**作る**段階のツールです。sWriteOnは輪郭の**見せ方**、sRenderは**画像への変換**を担当します。役割が違うため、互いの代わりとして説明するのは適切ではありません。

## 確認時の注意点

生成直後に通常の画像処理ノードへつながらない場合は、Shapeと2D Imageを混同していないかを確認してください。[Shapeの基礎](../../learn/02-data/shape)には、この二つのデータの違いとsRenderまでの基本的な流れをまとめています。

また、単に「渦巻きが欲しい」という目的だけでは、線の本数・端点・巻き方向・中心付近の形・線の太さが決まりません。これらをInspectorでどこまで直接制御できるかは未確認です。最初はsSpiral CreateとsRenderだけの短い構成で実際の輪郭を確認し、必要に応じて後段のShape処理を加えるのが安全です。

## バージョン・出典・未確認事項

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2437「Shape Create Tools — sSpiral Create」。同Manual、Chapter 117「Shape Nodes」、pp.2759–2760（sRenderによるShapeからImageへの変換）。

**資料から確認できること：** 表記は`sSpiral Create`、分類はShape Create Toolsで、中心点または軸の周りを巻く曲線を生成します。記事中のタイトル装飾・sRestyle・sWriteOnとの連携は、関連ツールの役割から考えた**制作案**であり、実機検証済みのレシピではありません。

**未確認：** 入出力端子の正式名称と個数、Inspector項目名・値域・既定値、巻く方向と線の生成順、座標系、線幅や塗りの既定の扱い、内部REGID、Resolve Free / Studio / Fusion Studioでの提供差、実機結果。スペースなしの`sSpiralCreate`は検索用の別表記であり、内部REGIDと断定しません。確認範囲に合わせて`verification: partial`を維持します。
