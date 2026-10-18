---
title: rMerge
description: Krokodove rMergeで複数のRegionをまとめる考え方、接続例、画像用Mergeとの違いを説明。
doc_type: node
term_id: rmerge
term_short: 複数の作用領域をまとめるKrokodoveのRegion用ツール。画像用Mergeとは異なる。
verification: partial
aliases: [rMerge]
nodes: [rMerge]
node_family: krokodove
inputs: [region]
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# rMerge

**rMergeは、KrokodoveのRegion（リージョン）をまとめるツール**です。Regionは画像そのものではなく、別のツールへ「どの範囲を処理対象にするか」を伝えるためのデータです。

例えば、箱状の範囲だけでは足りず、その隣に球状の範囲も使いたい場合を考えます。[rCube](./rcube)は箱状、[rSphere](./rsphere)は球状のRegionを作ります。これらを組み合わせる工程を考える際、rMergeが候補になります。ただし、**重なった範囲が加算されるのか、差し引かれるのか、別の規則でまとめられるのか**は、21.1 Reference Manualの説明だけでは決められません。

## まず、Regionとは何か

Regionは**効果が作用する場所・範囲を指定する情報**です。立方体や球の形を使って範囲を指定しても、その形が映像に描画されるわけではありません。実際の映像を変えるのは、Regionを受け取って処理する別のツールです。

Krokodoveには、立方体の[rCube](./rcube)、球の[rSphere](./rsphere)、平らなカード状の[rPlane](./rplane)、Perlinノイズによる[rNoise](./rnoise)があります。これらは、写真や動画を構成する**2D Image**とも、レンダリング対象の**3Dシーン**とも役割が違います。Regionを普通のImage入力へ接続したり、通常のEffect Maskと同じデータだとみなしたりしないでください。

データの違いは[Krokodoveの画像・Shape・3D・Region](./)で先に確認できます。

## rMergeが行うこと

21.1 Reference Manualでは、rMergeは「Regionツール群のMerge」として掲載されています。つまり、複数の範囲を使う構成の中で、Regionをまとめる役割です。

ただし、Manualには次の詳細がありません。

- いくつのRegionを直接入力できるか、端子の正式名称は何か。
- 複数の範囲が重なる場所をどう扱うか。
- 和・差・積などの演算を選択できるか。
- 境界の柔らかさや反転状態が統合結果へどう反映されるか。

**「Mergeだから二つを足し合わせる」「画像用Mergeと同じForeground / Backgroundがある」とは断定できません。** まず役割を理解し、具体的な接続方法と結果は実機で確認します。

## 入力と出力

| 段階 | データ | 確認できる範囲 |
| --- | --- | --- |
| 入力 | **Region** | 公式のRegion Tools分類と既存カタログによるデータ分類 |
| 処理 | Regionの統合 | 21.1 Manualに記載された基本的な役割 |
| 出力 | **Region** | 統合後の作用範囲をRegion対応ツールへ渡す、というカタログ上の分類 |
| 未確認 | 端子名・本数、統合演算、Inspector項目・初期値・値域、対応する受け手 | Manualの短い説明では確定できない |

ここでいう入力・出力は**データの種類**です。ノード上の端子名や、複数端子の存在を実機で確認したことを意味しません。

## 制作例：離れた二つの場所へ同じ効果を使いたい

一つの大きな範囲を指定すると、効果をかけたくない中央部分まで対象になることがあります。そのような場合、別々のRegionを用意して、必要な場所だけをまとめられるか検討します。

以下は考え方を示す**概念図**です。rMergeの正式な入力端子や、効果側の対応を保証する接続図ではありません。

    rCube（箱状の範囲） ─┐
                         ├─ rMerge ─→ （Region入力を持つ対応ツール）
    rSphere（球状の範囲） ┘                  ↑
                                  元の映像やシーンは別経路

1. **範囲を作る**：箱で指定したい場所にrCube、球状に指定したい場所にrSphereを候補として置きます。まず単独のRegionを受け取れるツールを実機で確認します。
2. **統合方法を確認する**：rMergeを配置して、Inspectorと実際の入力端子を調べます。二つのRegionを接続できるか、どのように組み合わさるかを、この段階で確認します。
3. **対応ツールへ渡す**：rMergeの結果を受ける側に**Region入力が存在すること**を確かめてから接続します。Imageや3D Sceneの通常入力と混同しません。
4. **結果を比べる**：rCubeだけ、rSphereだけ、統合後の順に同じフレームを比べます。二つの範囲が重なる場所、境界、意図しない空白を特に確認します。
5. **必要なら構成を分ける**：期待した演算や接続が提供されていない場合は、個々のRegionを別経路で使えるかを検討します。未確認のBoolean操作を前提に組み続けないことが重要です。

この例は**複雑な作用範囲を組み立てるための確認手順**であり、指定した組み合わせで効果が出ることを確認したチュートリアルではありません。

## 似たツールとの違い

| ツール | 扱う対象 | 選ぶ目安 |
| --- | --- | --- |
| **rMerge** | Region | 複数の作用範囲を一つの構成で扱いたい |
| [rCube](./rcube) / [rSphere](./rsphere) | Region | 箱状・球状の範囲を最初に作る |
| [rPlane](./rplane) / [rNoise](./rnoise) | Region | 平らな範囲・ノイズによる範囲を作る |
| [rTransform](./rtransform) | Region | 作成した範囲そのものを変形したい |
| [rModify](./rmodify) | Region | 既存の範囲を変更したい。変更項目は未確認 |
| **標準Merge** | 2D Image | 前景画像と背景画像を重ねて映像として合成する |
| **Merge 3D** | 3Dシーン | 3Dオブジェクトやライトなどを同じシーンへまとめる |

rMergeは画像を重ねるためのノードではありません。**rMergeでRegionをまとめること**と、**その範囲に実際のエフェクトをかけること**は別の工程です。Regionを受け取るツールがなければ、rMergeだけで完成映像を作ることはできません。

## 注意点と未確認の仕様

- **演算方式**：単純な合算、重複領域の扱い、Boolean演算の種類は未確認です。通常のMask演算やShapeの結合方法をそのまま当てはめません。
- **端子とInspector**：正式な入力端子名・本数、各設定名、初期値、値域、アニメーション対応は未確認です。
- **境界と反転**：rCubeとrSphereにはSoftness、Invert、Transformに当たる調整がManualに記載されていますが、rMergeがそれらをどのように引き継ぐかは不明です。
- **表示方法**：Regionが画像としてViewerに描画されると仮定しません。Region対応ツールを使った最終的な作用範囲で結果を確認します。
- **利用環境**：21.1 Manualへの掲載は確認済みですが、Resolve Free / Studio / Fusion Studio別の提供条件、内部REGID、実機での表示名や端子は未確認です。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、**Chapter 105「Krokodove Nodes」p.2438**。Region ToolsのrMergeと、rCube・rSphere・rPlane・rNoise・rModify・rTransformの説明を確認しました。

確認できるのは**Regionツール群に属する統合ツールであること**と周辺のRegion生成ツールの役割です。入力・出力の分類は既存COLLECTANEAカタログも参照しています。制作例はその役割から組み立てた検証案であり、実機の結合演算や対応ノードを確認済みという意味ではありません。そのため `verification: partial` を維持しています。

関連：[Krokodove全体像](./) / [rTransform](./rtransform) / [rModify](./rmodify)
