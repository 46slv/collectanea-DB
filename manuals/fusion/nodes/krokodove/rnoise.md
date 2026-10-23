---
title: rNoise
description: Perlinノイズから不規則な作用範囲（Region）を作るKrokodoveノード。画像用Noiseとの違いと接続時の確認事項を説明。
doc_type: node
term_id: rnoise
term_short: Perlinノイズで不規則な作用範囲を作り、Region入力を持つツールへ渡す。
verification: partial
aliases: [rNoise]
nodes: [rNoise]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# rNoise

**rNoiseは、Perlinノイズを使ってRegion（リージョン）を生成するKrokodoveノード**です。箱や球のように決まった形で範囲を区切る代わりに、不規則な分布をもとに作用範囲を作りたいときの候補になります。

ここで作るのは、画面に重ねるノイズ画像ではありません。**別のツールへ「どこを処理対象にするか」を伝えるためのRegion**です。Regionを受け取るツールがなければ、rNoise単体で映像にノイズ模様が描かれるとは限りません。

## RegionとPerlinノイズを理解する

Regionは、効果を適用する場所や範囲を表すデータです。例えば箱状の[rCube](./rcube)なら箱の位置を、球状の[rSphere](./rsphere)なら球の周辺を、作用範囲の基準として使います。どの映像・3Dデータを実際に変更するかは、**Regionを受け取る側のツール**が決めます。データの区別は[Krokodoveの画像・Shape・3D・Region](./)にもまとめています。

Perlinノイズは、近い位置どうしの値が比較的なめらかにつながる、不規則な分布を作る方法です。細かな粒を無関係に散らすだけの乱数とは異なり、ゆるやかなむらや起伏の元になる分布を考えると理解しやすくなります。

ただし、これは**Perlinノイズ一般の説明**です。rNoiseがその分布を具体的にどのような形・境界・次元のRegionへ変換するか、どの設定で調整するかは、21.1 Reference Manualの短い説明からは確定できません。「自動的に煙のような形になる」「時間とともに動く」といった結果は実機確認前に断定しません。

## 入力と出力

| 段階 | データ・役割 | 確認範囲 |
| --- | --- | --- |
| 入力 | 必須のImage入力やRegion入力について、Manualに記載なし | **入力が存在しないと断定するものではない** |
| 生成 | Perlinノイズを使ったRegion | 21.1 Manualに記載 |
| 出力 | Region | Region入力を備えた別のツールと組み合わせる用途がManualに記載 |
| 未確認 | 正式な端子名・本数、Inspectorの項目・初期値・値域、時間変化、対応ツール一覧 | 実機または追加の一次資料による確認が必要 |

この表の「Region」は接続する**情報の種類**を表しています。端子に実際に表示される名前や色、内部データ型を確認済みという意味ではありません。通常のImage入力や、標準的なEffect Mask入力へそのまま接続できるとも限りません。

## どんな場面で使うか

箱や球で区切った範囲だけでは、境界や分布が規則的すぎる場合に検討できます。例えば、空間の一部へかける効果について、均一な球状の範囲ではなく、変化のある作用範囲を試したい場合です。

ただし、**rNoiseが特定の3Dエフェクトに接続できることや、望んだ見た目になることを保証する例ではありません**。KrokodoveのRegion入力に対応した受け手を見つけ、実際の結果を比較する必要があります。

## 運用例：単純な範囲とノイズの範囲を比べる

次は正式な端子配置を再現した図ではなく、データの流れを示す概念図です。

```text
rCube（箱状のRegion） ─┐
                       ├─→ Region入力を持つ効果ツール → 結果を確認
rNoise（ノイズのRegion）┘        ↑
                           処理する画像・シーンは別経路
```

1. **受け手を先に確認する。** 使用する効果ツールに、実際のRegion入力があることを確かめます。Image入力、3D Scene入力、通常のEffect Maskと混同しません。
2. **基準となる範囲を作る。** まずrCubeなど、形の意味が分かりやすいRegionを使い、その効果が範囲に応じて変わるかを確認します。
3. **rNoiseに替えて比較する。** 同じ受け手へrNoiseのRegionを渡せるかを確かめ、処理される場所や境界の変わり方を見ます。見た目が変わらない場合は、接続先の互換性も確認します。
4. **必要な調整項目だけを探す。** Inspectorに表示される実際の設定を確認します。ノイズのスケール、シード、アニメーションなどがあると想定して操作を進めず、存在する項目だけを使います。
5. **時間方向も確認する。** 動画で使う場合、別のフレームでも結果を見ます。rNoiseが自動で時間変化するかどうかは、Manualの記述だけでは不明です。

この手順は**受け手との互換性と結果を確かめるための検証例**です。特定の対応ノードで実際に動いたことを記録したチュートリアルではありません。

## 関連ノードと使い分け

| ツール | 役割 | rNoiseとの違い |
| --- | --- | --- |
| [rCube](./rcube) | 箱状のRegionを生成 | 直方体を基準に範囲を考えられる |
| [rSphere](./rsphere) | 球状のRegionを生成 | 球を中心とした範囲を考えられる |
| [rPlane](./rplane) | 平らなカード状のRegionを生成 | 平面を基準に範囲を考えられる |
| **rNoise** | PerlinノイズのRegionを生成 | 決まった幾何形状ではなくノイズによる範囲を作る |
| [rMerge](./rmerge) | Regionをまとめる | 範囲を作るのではなく、複数のRegionを扱う。具体的な演算方法は未確認 |
| [rModify](./rmodify) / [rTransform](./rtransform) | Regionを変更・変形 | 生成後のRegionに対して処理する |

**Fast Noiseなどの画像用ノイズとは出力の目的が違います。** 画像用ノイズは色や明るさを持つ画像を別の画像処理へ渡すのに対し、rNoiseの目的はRegion入力へ作用範囲を渡すことです。Perlinノイズという言葉が共通していても、同じ端子・設定・出力形式を持つとは限りません。

## バージョンと確認できていない点

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、**Chapter 105「Krokodove Nodes」p.2438、Region ToolsのrNoise項目**。ここでは「PerlinノイズのRegionを作り、Region入力を持つ他のツールと組み合わせる」役割が説明されています。

**確認済み**なのはノード名、Region生成の目的、Perlinノイズを用いること、Region入力のあるツールとの組み合わせです。**未確認**なのは端子の正式名称・本数、Inspectorの設定値、出力Regionの具体的な形状・次元、時間変化、対応ツールの一覧、Resolve Free / Studio / Fusion Studio間の提供差、実機での結果です。よって `verification: partial` を維持します。

関連：[Krokodove全体像](./) / [rMerge](./rmerge) / [rTransform](./rtransform)
