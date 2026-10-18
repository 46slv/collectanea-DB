---
title: rModify
description: KrokodoveのrModifyがRegionを変更する役割と、Regionの基本、使い分け、実機で確認する手順を説明。
doc_type: node
term_id: rmodify
term_short: すでに作ったRegionを変更するKrokodoveツール。変更可能な項目は実機で確認する。
verification: partial
aliases: [rModify]
nodes: [rModify]
node_family: krokodove
inputs: [region]
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# rModify

**rModifyは、KrokodoveのRegion（リージョン）を変更するためのツール**です。Regionは、映像や3Dシーンそのものではなく、別のツールに「処理をどの範囲へ適用するか」を伝える情報です。

たとえば、球状の範囲を用意し、その範囲を使う効果を調整する場面を考えます。球のモデルを画面に表示するのではなく、球の内側など、効果が作用する場所を指定する考え方です。rModifyは、このように**作成済みの範囲を後から変更する工程**の候補になります。

ただし、DaVinci Resolve 21.1 Reference ManualがrModifyについて明記するのは、Regionを変更できるという基本的な役割だけです。何を、どの計算で変更できるかは、名前から推測して断定しません。

## Regionとは何か

Regionは、ある処理を「どこに効かせるか」を決めるためのデータです。Krokodoveでは次のツールがRegionを作ります。

- [rCube](./rcube)：箱の形をした作用範囲を作る。
- [rSphere](./rsphere)：球状の作用範囲を作る。
- [rPlane](./rplane)：平らなカード状の作用範囲を作る。
- [rNoise](./rnoise)：Perlinノイズに基づく作用範囲を作る。

形が球状だからといって、映像に球体が描画されるわけではありません。**Regionを受け取る別のツールが、その範囲を利用して処理する**という関係です。

Regionは、写真・動画・描画済み文字を扱う2D Imageとも、3Dオブジェクトを含むシーンとも区別します。通常のEffect Maskと同じ入力へ接続できるとも限りません。データの分類は[Krokodoveの画像・Shape・3D・Region](./)で整理しています。

## rModifyが担当する工程

Regionを使う作業は、役割ごとに分けて考えると理解しやすくなります。

1. **範囲を用意する**：rSphereやrCubeなどで、効果を適用したい元の範囲を作る。
2. **範囲を変更する**：必要ならrModifyを挟み、作成済みのRegionに変更を加える。
3. **範囲を使う**：Region入力を持つ対応ツールへ渡し、実際の処理に利用する。

このうちrModifyが担当するのは2番目です。画像そのものを変形・合成するノードとして説明するのは適切ではありません。また、**「変更する」という説明は、特定の変更項目が備わるという保証ではありません**。

21.1 Manualには、rCube・rSphere・rPlane自体についてはSoftness（境界の柔らかさ）、Invert（反転）、Transform（変形）に相当する調整が挙げられています。しかし、**それらと同じ項目がrModifyにもあるとは書かれていません**。元のRegionで行う調整と、rModifyで行える調整は分けて確認する必要があります。

## 入力と出力

| 段階 | 扱う情報 | 根拠と確認範囲 |
| --- | --- | --- |
| 入力 | Region | 既存のRegionを変更するというManual上の役割と、COLLECTANEAのRegion分類に基づく |
| 処理 | Regionの変更 | 21.1 Manualに明記されている |
| 出力 | 変更後のRegion | Regionツール群で後段のRegion対応ツールへ渡す、というカタログ上の整理 |
| 未確認 | 端子の正式名称・本数、補助入力、Inspector項目、各値の範囲 | Manualの一覧だけでは確定できない |

この表は**データの役割**を示します。実際のノードにどの端子が何個表示されるかを検証したものではありません。

## 制作例：球状の作用範囲を変更して比較する

球状の範囲を使う効果で、元の範囲と変更後の範囲を比較したい場合を想定します。

```text
rSphere ──→ rModify ──→ （Region入力を持つ対応ツール）
                              ↑
                    処理対象の素材は別経路
```

これは**役割を示す構成案**であり、接続端子や特定の効果との互換性を確認済みの実機レシピではありません。

1. [rSphere](./rsphere)で球状のRegionを用意します。まずrSphereだけで必要な範囲を作れるかを確認します。
2. 使用する効果に**Region入力が実在するか**を調べます。通常のImage入力やEffect Mask入力を代用品として扱いません。
3. rSphereから直接その対応ツールへ渡せることを確認したうえで、間にrModifyを挟む構成を検討します。
4. rModifyのInspectorに実際に表示される項目を確認します。項目名や機能をあらかじめ決めつけず、ひとつの操作だけを変更します。
5. 元のRegionを使った結果と、rModifyを経由した結果を、**同じ素材・同じフレーム**で比較します。変化があれば、作用する範囲がどこでどう変わったのかを確かめます。
6. 期待した変更がrModifyで行えない場合は、rSphere側の調整や[rTransform](./rtransform)など、役割の明確な工程へ戻ります。

この例で重要なのは、**元の範囲を作る操作と、その後の変更を分離して試すこと**です。rModifyに存在すると確認できていない機能を前提に、操作手順や推奨値を記載していません。

## rTransform・rMergeとの違い

| ツール | Manualで確認できる役割 | 選ぶときの考え方 |
| --- | --- | --- |
| **rModify** | Regionの変更 | 作成済みのRegionを変更する工程が必要なときに検討する |
| [rTransform](./rtransform) | Regionツール群のTransform | Regionの変形を独立した工程として扱いたいとき |
| [rMerge](./rmerge) | Regionツール群のMerge | 複数のRegionを組み合わせたいとき |
| [rCube](./rcube) / [rSphere](./rsphere) | 箱状・球状のRegionを生成 | まず基本となる作用範囲を作りたいとき |
| 標準Transform | 2D Imageを変形 | Regionではなく、画像自体の位置・大きさを変えたいとき |
| 標準Merge | 2D Imageを合成 | 作用範囲ではなく、前景と背景の映像を重ねたいとき |

rModifyとrTransformは名前だけでは機能の境界を確定できません。特に、rModifyがTransform以外のどの属性を変更できるか、rTransformとの処理順序で結果がどう変わるかは未確認です。必要な操作が具体的に決まっている場合は、Inspectorと実際の結果で使い分けます。

## 使用前に確認したい点

- **Inspector**：変更できる属性、正式な名称、初期値、値域、キーフレーム対応は未確認です。境界ぼかし・反転・値の乗算などをrModify固有の機能として紹介しません。
- **接続**：Region対応ツールの全一覧、端子数、補助入力、通常のEffect Maskとの変換可否は未確認です。
- **結果の確認**：Regionそのものが通常の画像と同じようにViewerへ表示できるとは限りません。対応する処理の作用範囲がどう変わるかで確認します。
- **製品差**：21.1 Manualへの掲載は確認済みですが、Resolve Free／Studio／Fusion Studioでの提供条件や、各環境の実際のUIは確認していません。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、**p.2438**。Region Toolsの項目でrModifyは「Regionを変更する」と説明されています。同じページに、rCube・rSphere・rPlane・rNoise・rMerge・rTransformの基本的な役割も記載されています。

**確認済み**なのは、rModifyの名称、Region Tools内での位置づけ、Regionの変更という役割です。入出力のデータ分類は既存のCOLLECTANEAカタログを踏まえた整理で、正式なポート仕様の実測ではありません。制作例は検証方法を示す構成案です。そのため `verification: partial` を維持しています。

関連：[Krokodove全体像](./) / [rTransform](./rtransform) / [rMerge](./rmerge)
