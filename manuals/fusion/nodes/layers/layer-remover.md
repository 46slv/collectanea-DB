---
title: Layer Remover
description: マルチレイヤー画像から指定したLayerをチェックリストで除外し、必要なLayerだけを後段へ渡すFusionノード。
doc_type: node
term_id: layer-remover
verification: partial
aliases: [Layer Remover, LRm]
concepts: [image-data, multilayer]
nodes: [Layer Remover]
node_family: layers
inputs: [image]
outputs: [image]
tasks: [multilayer, remove-layers, exr]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Layer Remover

**Layer Removerは、マルチレイヤー画像に含まれるLayerのうち、不要なものを指定して後段から取り除くノード**です。CGレンダーにBeauty・Depth・Normal・仮出力用のLayerが入っているとき、使わないLayerを整理してから合成や書き出しへ渡せます。

ここでのLayerは、マルチレイヤーEXRなどに含まれる**名前付きの画像データのまとまり**です。RGBAを構成する個別のチャンネルや、タイムライン上で重ねたクリップのことではありません。[Layerノードの概要](./index)も参照してください。

Layer Removerは画像の画素を塗り消す処理ではなく、**Layerの構成を整理する処理**です。画面の一部を透明にしたいときはMaskなどを使います。

## 入力と出力

| 接続 | 役割 |
| --- | --- |
| **Image 1（オレンジ）** | 除外したいLayerを含むマルチレイヤー画像。 |
| **Output** | 指定したLayerを除いたマルチレイヤー画像。 |

21.1 Manualに記載されている入力は**Image 1の1つ**です。複数のソースをこのノードだけで統合する機能ではありません。

```text
Loader（Beauty / Depth / Normal / Temp）
  → Layer Remover（Tempを除外）
  → 後段のLayer処理（Beauty / Depth / Normalを利用）
```

この構成では、Tempを出力から外し、ほかの必要なLayerを残します。各Layerに付いた名称はレンダーやファイルによって異なるため、実際のInspectorの一覧を確認してください。

## Inspectorの操作

**Controlsタブには、入力画像に含まれるLayerのチェックリストが表示されます。**

重要なのは、**チェックを入れたLayerが「残る」のではなく、「無効化／除外される」**という動作です。選択したLayerだけを出力するフィルターだと誤解しやすいので注意してください。Manualでは、チェックボックスをオンにすると該当LayerがLayer一覧から外れると説明されています。

操作は次の順序です。

1. Image 1へマルチレイヤー画像を接続します。
2. ControlsタブのLayer一覧で、削除したい名前を探します。
3. **削除したいLayerのチェックをオン**にします。使いたいLayerにはチェックを付けません。
4. 下流のノードで、必要なLayerが残っているか確認します。

どのLayerを削除してもよいか確信がないときは、一度にすべて外さず、不要と確認できたLayerから除外してください。とくに後段がDepthやNormalなどの補助情報を参照する場合、そのLayerを除くと処理に必要な情報を渡せなくなります。

## 制作例：VFX納品用のEXRを整理する

レンダラーから受け取ったEXRに次のLayerがあるとします。

| 入力にあるLayerの例 | 今回の用途 |
| --- | --- |
| Main / Beauty | 表示用の画像として利用する |
| Depth | 後段の被写界深度処理で利用する |
| Normal | 後段のリライティングなどで利用する |
| Temp / Preview | 今回は使わない仮出力 |

Layer RemoverのControlsタブでTemp / Previewに相当する項目へチェックを入れます。その後、DepthやNormalを使うノードにデータが届いているか確認します。

```text
マルチレイヤーEXR
  → Layer Remover（Temp / Previewのみチェック）
  → Depth / Normalを利用する後段処理
```

この例は「不要なLayerを後段へ渡さない」ための整理です。**ファイル容量やレンダー時間が必ず減ることは意味しません。** ディスクへ書き出す場合は、出力ノードとファイル形式がマルチレイヤーを保持できるかを別途確認します。

## Layer Regex / Muxer / Swizzlerとの違い

- [Layer Regex](./layer-regex) — 名前に規則がある大量のLayerを、正規表現でまとめて残す・除く・名前を変える。
- [Layer Muxer](./layer-muxer) — 2つのソースから必要なLayerを1つのマルチレイヤー画像へまとめる。
- [Swizzler](../color/swizzler) — 個々のチャンネルを別のLayerへ割り当てるなど、データ構成を組み替える。
- [補助Channel / AOV](../../learn/02-data/auxiliary-channels) — Depth・Normalなど、CGレンダーから渡す補助データの基礎。

Layerを丸ごと消したいだけならLayer Removerが簡単です。一方、RGBAのRチャンネルだけを別Layerへ移すなど、**チャンネル単位の再配置はLayer Removerの用途ではありません**。

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual、Chapter 106「Layer Nodes」、pp.2444–2445**で、Image 1の入力、ControlsタブのLayer一覧、チェックをオンにしたLayerが除外される動作を確認しました。

実際のEXRでのLayer名、保存形式ごとの出力結果、Free / Studio差は21.1実機では未検証です。
