---
title: Layer Muxer
description: 2つのマルチレイヤー画像を受け、Image 2から必要なLayerを選んでImage 1へまとめるFusionノード。
doc_type: node
term_id: layer-muxer
verification: partial
aliases: [Layer Muxer, LMx]
concepts: [image-data, multilayer]
nodes: [Layer Muxer]
node_family: layers
controls: [Layer, Conflicts]
inputs: [image, image]
outputs: [image]
tasks: [multilayer, combine-layers, exr]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Layer Muxer

**Layer Muxerは、別々の画像に入っているLayerを1つのマルチレイヤー画像へまとめるノード**です。たとえばCGのBeauty・Depthを含むEXRと、別工程で出力したMotionのLayerを後段で一緒に扱いたいときに使います。

ここでの**Layer**は、マルチレイヤーEXRなどが持つ名前付きの画像データのまとまりです。RGBAのチャンネルや、Depth・Normal・Motionなどの補助情報をLayerとして保持できる場合があります。Fusionタイムライン上のクリップの重なりとは異なります。詳しくは[Layerノードの使い分け](./index)と[補助Channel / AOV](../../learn/02-data/auxiliary-channels)を参照してください。

Layer Muxerは、2枚の画像を前後に重ねて画面を合成する[Merge](../compositing/merge)の代わりではありません。画面の見た目を合成するのではなく、**後段へ渡すLayerの集合**を組み立てます。

## 入力と出力

| 接続 | 役割 |
| --- | --- |
| **Image 1（オレンジ）** | 統合先となるマルチレイヤー画像。 |
| **Image 2（緑）** | Image 1に加えたいLayerを持つマルチレイヤー画像。 |
| **Output** | 選択・統合後のLayerを持つ画像。 |

Manualで説明されている入力はImage 1とImage 2の2つです。両入力に、利用したいLayerを含むソースを接続します。

```text
Loader A：Beauty / Depth ──→ Image 1（オレンジ）┐
                                            ├─ Layer Muxer ─→ 後段のLayer処理
Loader B：Motion / Normal ─→ Image 2（緑） ──┘
```

この例では、Loader Aを統合の基点にし、Loader Bにある必要なLayerだけを足します。出力から特定の補助情報を取り出したい場合は、後段で[Swizzler](../color/swizzler)などを使います。

## Inspectorの設定

### Layer — Image 2のどのLayerを受け取るか

**LayerはImage 2側の選択項目**です。Image 1の全Layerを個別に選び直す設定ではありません。

| 選択肢 | 動作 |
| --- | --- |
| **Default Layer** | Image 2のDefault Layerを使う。 |
| **All Layers** | Image 2の全Layerを組み合わせる。 |
| **Custom** | Image 2のLayer一覧から、通すLayerをチェックリストで選ぶ。 |

Customは、追加元のEXRに多くのAOVがあるものの、Motionだけが必要な場合に使えます。Manualでは、All Layers以外を選ぶとノード上に小さなLayerアイコンが表示されると説明されています。

### Conflicts — Default / [Main]の選択

Image 1とImage 2のどちらを**出力のDefault / [Main] Layer**として扱うかを、Conflictsで選びます。両方のソースが表示用のMain画像を持つ場合は、どちらを基準にしたいか明示します。

名称から「同名Layerのすべてについて上書き優先順位を設定する」と読み取らないでください。21.1 Manualがこの項目で明示しているのは、**出力のDefault / [Main] Layerの選択**です。同名の補助Layerを大量に統合する場合は、事前に名前を分け、結果を確認する方が確実です。

## 制作例：CGのMotion AOVを別レンダーから追加する

Beauty・Depthを含むレンダーAと、Motion・Normalを含むレンダーBを受け取ったとします。後段の処理ではBeautyとDepthに加えてMotionだけを使いたく、Normalは不要です。

1. レンダーAをImage 1、レンダーBをImage 2に接続します。
2. **Layer = Custom**にして、Image 2の一覧からMotionに相当するLayerだけを選びます。実際の名前はレンダー側の命名に合わせます。
3. 両ソースにDefault / Mainがある場合は、**Conflicts**で表示基準にするソースを選びます。
4. 後段のLayer対応ノードで、Beauty・Depthと選択したMotionが利用できるか確認します。

こうすると、不要なNormalを含めずに必要なデータを同じ流れへ渡せます。なお、保存先がLayerを保持する形式・設定になっていることは別途確認が必要です。Layer Muxerを通しただけで、どの書き出し形式にも全Layerが保存されるわけではありません。

## 似たノードとの違いと注意点

- [Layer Regex](./layer-regex) — Layer名の規則で選別・名称変更する。レンダーごとに同名Layerがあるなら、結合前に名前を整理する用途にも向きます。
- [Layer Remover](./layer-remover) — 既存の1ソースから不要なLayerを除く。
- [Swizzler](../color/swizzler) — Layerやチャンネルの内容を組み替え、新しいLayer構成を作る。
- [Merge](../compositing/merge) — ForegroundとBackgroundを画像として合成する。Layerの一覧を統合する操作とは異なります。

Image 2で期待するLayerが選択できない場合は、まず入力ファイルにそのLayerが含まれているか、別の名前になっていないかを確認します。Inspectorの選択肢と出力のLayer構成を合わせて確認すると、接続ミスと命名ミスを切り分けられます。

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual、Chapter 106「Layer Nodes」、pp.2440–2441**で、Image 1 / Image 2、Layer（Default Layer / All Layers / Custom）、Conflictsの説明を確認しました。具体的なレンダー名と接続例は、これらの動作に基づく運用例です。

21.1実機での同名補助Layerの競合順序、書き出し形式ごとの保持結果、Free / Studio差は本記事では未検証です。
