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
updated: "2026-10-24"
---

# Layer Remover

**Layer Removerは、マルチレイヤー画像に含まれるLayerのうち、不要なものを指定して後段から取り除くノード**です。CGレンダーにBeauty・Depth・Normal・仮出力用のLayerが入っているとき、使わないLayerを整理してから合成や書き出しへ渡せます。

ここでのLayerは、マルチレイヤーEXRなどに含まれる**名前付きの画像データのまとまり**です。RGBAを構成する個別のチャンネルや、タイムライン上で重ねたクリップのことではありません。[Layerノードの概要](./)も参照してください。

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

## 実機例：チェックしたGoldだけを除く

<!-- capture-case:S100 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。Layerの入力は外部EXRではなく、LoaderのチャートとBackgroundをSwizzlerでまとめたテスト画像です。

SwizzlerにGoldとChartの2つのLayerを作り、その出力をLayer Removerへ接続しました。Goldはオレンジ色のBackground、ChartはLoaderのチャートを持ちます。Layer Removerの出力はMediaOutへ渡しています。

[![GoldとチャートをSwizzlerで2つのLayerにし、Layer Removerを経てMediaOutへ接続した実機Graph](/img/fusion/captures/S100/graph.png)](/img/fusion/captures/S100/graph.png)

[![除外前はGoldもChartも未チェックで、左右のViewerにオレンジ色のGoldが見える実機画面](/img/fusion/captures/S100/before.png)](/img/fusion/captures/S100/before.png)

両方のチェックがOFFの状態では、右ViewerにもGoldが表示されました。次にInspectorのGoldだけをONにします。

[![実機Layer Removerの一覧でGoldがON、ChartがOFFになっているInspector](/img/fusion/captures/S100/inspector.png)](/img/fusion/captures/S100/inspector.png)

[![左のSwizzlerにはGoldが残り、右のLayer Remover出力にはChartが表示された実機比較](/img/fusion/captures/S100/compare.png)](/img/fusion/captures/S100/compare.png)

Goldをチェックすると、そのLayerが出力から除かれ、右ViewerにはChartが表示されました。左ViewerのSwizzlerはオレンジ色のままです。入力の画素を塗り消したのではなく、後段へ渡すLayerを減らした結果です。最後はGoldだけONの状態で保存しました。

外部EXR、Depth・Normalなどのデータ、複数Layerの同時除外、書き出し後の保持、他OS・Edition差と性能は未確認です。`verification: partial`を維持します。

[再現用Graph](/img/fusion/captures/S100/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S100/capture.json)

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual、Chapter 106「Layer Nodes」、pp.2444–2445**で、Image 1の入力、ControlsタブのLayer一覧、チェックをオンにしたLayerが除外される動作を確認しました。

実際のEXRでのLayer名、保存形式ごとの出力結果、Free / Studio差は21.1実機では未検証です。
