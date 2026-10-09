---
title: Layer Regex
description: マルチレイヤー画像のLayer名を正規表現で検索し、名前の変更・選別・削除を行うFusionノード。
doc_type: node
term_id: layer-regex
verification: partial
aliases: [Layer Regex, LRx]
concepts: [image-data, multilayer]
nodes: [Layer Regex]
node_family: layers
controls: [Expression, Mode, Name Template, Unmatched, Tester, Conflicts]
inputs: [image, image]
outputs: [image]
tasks: [multilayer, regex, rename-layers, filter-layers]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# Layer Regex

**Layer Regexは、マルチレイヤー画像に含まれるLayerを「名前の規則」で操作するノード**です。CGレンダーの各Layerに共通の接頭辞を付ける、`copy`を含むLayerを除く、`right`で始まる名前を`Left`へ変更する、といった処理に使えます。

**正規表現（RegEx）**とは、「特定の文字列」「指定の語で始まる名前」「いくつかの語のどれか」などをパターンで表す記法です。Layer Regexでは**画素の色ではなくLayer名**を照合します。Fusionの数値パラメータ用Expressionとは用途が異なります。

LayerはマルチレイヤーEXRなどに入っている名前付きの画像データのまとまりで、RGBAのチャンネルそのものやタイムライン上のクリップとは区別します。[Layerノードの概要](./index)も参照してください。

## 入力と出力

| 接続 | 役割 |
| --- | --- |
| **Image 1（オレンジ）** | 名前で選別・変更したいLayerを持つマルチレイヤー画像。 |
| **Image 2（緑）** | もう一方のマルチレイヤー画像。 |
| **Output** | 指定した名前の変換・選別後のマルチレイヤー画像。 |

21.1 ManualはImage 1とImage 2の**2入力**を記載し、両方のソースにあるLayerを名前でフィルタリングする構成を示しています。

```text
Loader A（複数Layer）──→ Image 1（オレンジ）┐
                                          ├─ Layer Regex ─→ 後段のLayer処理
Loader B（複数Layer）──→ Image 2（緑） ────┘
```

## Inspectorの主要項目

| 項目 | 何を決めるか |
| --- | --- |
| **Expression** | 対象のLayer名を見つける正規表現。 |
| **Mode** | 名前の変換（Transform）・一致Layerの保持（Keep）・削除（Remove）。 |
| **Name Template** | Transform時に用いる置換後の名前。 |
| **Unmatched** | Expressionに一致しなかったLayerを保持するか、除外するか。 |
| **Tester** | 設定した式がLayer名へどう作用するかを確認する。 |
| **Conflicts** | 2入力のどちらを出力のDefault / [Main] Layerとして扱うか選ぶ。 |

### Mode：Transform / Keep / Remove

- **Transform**は、一致した名前をName Templateに従って書き換えます。画像の色や画素そのものを修正する機能ではありません。
- **Keep**は、一致する名前のLayerを残すためのモードです。
- **Remove**は、一致する名前のLayerを除くためのモードです。

**Unmatched**は一致しなかったLayerの扱いを別途指定するため、Modeだけ見て最終的なLayer一覧を決めつけないでください。ManualではUnmatchedのKeepは非一致Layerを保持し、Removeは非一致Layerを除くと説明されています。意図どおりの結果になったかはTesterで確かめます。

### Name Templateと`$1`

正規表現の`(.*)`は、任意の文字列を1つのグループとして取得します。`$1`は、その**最初の括弧で取得した文字列**を置換後の名前へ差し込む指定です。

```text
Expression:    (.*)
Mode:          Transform
Name Template: Right.$1
```

入力に`Diffuse`、`Depth`があれば、出力名を`Right.Diffuse`、`Right.Depth`のようにできます。末尾に付けたい場合は`$1.Right`です。どちらも21.1 Manualに掲載された例を基にしています。

## 実際の使い方

### 例1：左右レンダーのLayer名を区別する

左右の素材にどちらも`Diffuse`や`Depth`があると、後段でどちらのLayerを使っているか分かりにくくなります。右目側の名前に接頭辞を付けるなら、対象素材をLayer Regexへ接続し、**Mode = Transform、Expression = `(.*)`、Name Template = `Right.$1`**と設定します。

Testerで`Diffuse → Right.Diffuse`、`Depth → Right.Depth`となることを確認してから、[Layer Muxer](./layer-muxer)などで他の素材と組み合わせます。繰り返し同じ変換を適用すると接頭辞も繰り返されるため、変換前の名前を確認します。

### 例2：`right`で始まる名前だけ`Left`に変更する

```text
Expression:    ^right(.*)
Mode:          Transform
Name Template: Left$1
```

たとえば`right.1`を`Left.1`へ変換します。`^`は**文字列の先頭**を意味するため、`copyright`の中にある`right`には一致しません。先頭の`^`を外すと、想定外のLayer名まで変換するおそれがあります。大小文字を区別せずに探したいときは、Manualで紹介されている`(?i)`を使います。

### 例3：仮出力Layerをまとめて除く

```text
Expression: (?i)(copy|temp)
Mode:       Remove
```

`|`は「いずれか」を表し、`(?i)`は大小文字の差を無視します。`copy`や`Temp`などを名前に含むLayerが削除候補になります。

このパターンは文字列の途中にも一致するため、必要なLayer名の一部に`copy`が入っていた場合も対象になり得ます。実際のLayer名を調べ、**Testerで一致先を確認してから**次のノードへ渡します。特定の文字列で始まる名前だけに限定するなら`^`を追加します。

## Layer Remover / Muxerとの違い

- [Layer Remover](./layer-remover)は、入力中のLayer一覧からチェックを入れて個別に除外します。名前が固定で少数なら簡単です。
- [Layer Muxer](./layer-muxer)は、Image 2側で選んだLayerをImage 1側へ加えます。名前規則による一括変換はLayer Regexの担当です。
- [Swizzler](../color/swizzler)は、Layerと個々のチャンネルの割り当てを組み替える用途です。

**Conflicts**は、出力のDefault / [Main] LayerとしてImage 1とImage 2のどちらを選ぶかの設定です。同名の補助Layerの全衝突について、優先順位が一律に保証されると解釈しないでください。

## バージョンと出典

**DaVinci Resolve 21.1 Reference Manual、Chapter 106「Layer Nodes」、pp.2441–2444**で、Image 1 / Image 2、Expression、Mode、Name Template、Unmatched、Tester、Conflictsと、接頭辞・置換・選別のRegEx例を確認しました。

実際のマルチレイヤー素材に対する出力Layer一覧、正規表現エンジンの全機能、Free / Studio差は21.1実機では未検証です。
