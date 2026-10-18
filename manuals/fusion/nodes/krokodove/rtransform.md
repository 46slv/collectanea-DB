---
title: rTransform
description: KrokodoveのrTransformでRegionという作用範囲を変形する考え方、接続と確認手順、画像用Transformとの違いを説明。
doc_type: node
term_id: rtransform
term_short: Regionで定義した作用範囲を変形して、Region入力に渡すためのKrokodoveツール。
verification: partial
aliases: [rTransform]
nodes: [rTransform]
node_family: krokodove
inputs: [region]
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# rTransform

**rTransformは、KrokodoveのRegion（リージョン）を変形するツール**です。Regionは画像そのものではなく、別の対応ツールへ「どの範囲を処理対象にするか」を伝えるためのデータです。

たとえば球状のRegionを作った後、その範囲の位置や形を調整する工程を別に設けたいときに、rTransformが候補になります。**画像を移動・回転する標準Transformや、3Dモデルを配置するTransform 3Dとは対象が違います。**

## まず、Regionとは何か

Regionは、処理を適用する**場所や範囲**を表すためのデータです。Krokodoveには、立方体状の範囲を作る[rCube](./rcube)、球状の範囲を作る[rSphere](./rsphere)、平らなカード状の範囲を作る[rPlane](./rplane)、Perlinノイズによる領域を作る[rNoise](./rnoise)があります。

例として、映像に「球の中だけ何かの効果を出す」構成を考えます。球そのものを描画したいわけではなく、**効果がどこに及ぶかを球状の範囲で指定したい**場面です。rSphereはその範囲を用意し、rTransformは用意した範囲の変形を担当します。

Regionは、写真や描画済みテキストなどの**2D Image**とも、3Dモデルを表示するための**3Dシーン**とも同一ではありません。一般的なEffect Maskとの相互接続も、名称や見た目だけでは保証できません。**Region入力を明示的に備える対応ツール**へ渡すことを前提に考えます。

Krokodove全体でのデータの分け方は[Krokodoveの画像・Shape・3D・Region](./)を参照してください。

## rTransformが行うこと

21.1 Reference Manualは、rTransformを「Regionツール群のTransform」と説明しています。つまり、すでに作られたRegionに対して、範囲の変形を行う工程です。

作業を分けると、次のようになります。

1. **作る**：rSphereやrCubeなどで、効果を適用したい範囲の元の形を用意する。
2. **変える**：そのRegionをrTransformに渡し、必要に応じて範囲の変形を調整する。
3. **使う**：結果をRegion入力を持つ対応ツールへ渡し、作用範囲として利用する。

rTransformを通しただけで画像に歪みや色変化が加わる、という意味ではありません。変化する対象はまずRegionであり、そのRegionをどの処理が利用するかは接続先次第です。

ただし、Manualの一覧には**具体的なInspector設定、変形の座標系、適用順序、Pivotの扱い**は示されていません。「Transform」という名前だけで、標準Transformと同じCenter・Angle・Sizeなどの項目があると断定しないでください。

## 入力と出力

| 段階 | データ・役割 | 確認できる範囲 |
| --- | --- | --- |
| 入力 | **Region** | Regionツール群の変形という公式分類と、既存カタログに基づくデータ分類 |
| 処理 | Regionの変形 | 21.1 Manualに記載された基本的な役割 |
| 出力 | 変形後の**Region** | 後段のRegion入力へ渡すためのデータ分類 |
| 未確認 | 正式な端子名・端子数、補助入力、変形操作の詳細 | Manualの短い説明だけでは特定できない |

この表の入力・出力は**データの種類**を示したもので、ノード上の端子表示を再現したものではありません。

## 制作例：球状の作用範囲を作り、後から調整する

以下は、Regionの生成と変形を別工程にするための**構成案**です。特定の受け手ノードや設定値まで検証された実機レシピではありません。

```text
rSphere → rTransform → （Region入力を持つ対応ツール）
                            ↑
                 通常の素材入力は別経路
```

1. 最初に[rSphere](./rsphere)で球状のRegionを用意します。球のような範囲を使いたいのか、[rCube](./rcube)の箱状の範囲が適切なのかを決めます。
2. rSphereの出力をrTransformへ渡します。**実際の端子名・対応データ型はノードを配置した環境で確認**します。
3. rTransformのInspectorに表示される変形操作を一つずつ変更し、作成したRegionの扱いがどう変わるかを確認します。未確認の項目名や推奨数値はここでは指定しません。
4. 利用したい効果側に**Region入力が実在することを確認してから**、rTransformの結果を接続します。Image入力や3D Scene入力にRegionを直接渡せると仮定しません。
5. 変形前後で同じ素材・同じフレームを比べ、効果が及ぶ範囲の違いを見ます。Region単体のViewer表示が通常の画像と同じであることは前提にしません。

この構成が有効なのは、元の球状領域を作る部分を残し、**後から作用範囲だけを調整したい**場合です。逆に、rSphere自体に備わる変形操作だけで十分なら、間にrTransformを増やす必要はありません。21.1 Manualでは、rSphereとrCube自身にも変形を調整する機能が記載されています。

## 似たツールと何が違うか

| ツール | 変える対象 | 使い分け |
| --- | --- | --- |
| **rTransform** | すでに作られたRegion | 作用範囲の変形を別工程で扱う |
| [rSphere](./rsphere) / [rCube](./rcube) | 球状／箱状のRegionの生成 | 最初から範囲の形を決める |
| [rMerge](./rmerge) | 複数のRegionの組み合わせ | 一つの基本形では足りない範囲を扱う |
| [rModify](./rmodify) | Regionの変更 | 変形以外の調整を検討する。ただし具体的な機能差は実機確認が必要 |
| **標準Transform** | 2D Image | 画面上の画像の位置・向き・大きさを変える |
| **Transform 3D** | 3Dシーン内のオブジェクト | モデルや3D配置を変える |
| [Relative Transform](./relative-transform) | 2つ目の画像入力を利用する画像変形 | 画像データ自体の変形を扱う |

rMergeは複数のRegionをまとめる役割、rTransformは**Regionを変形する役割**です。rMergeで使える結合演算（和・差・積など）や、rModifyとrTransformのInspector上の違いは、短い公式説明だけでは断定できません。

## 注意点と未確認の仕様

- **Region入力との接続**：Regionを受け取る対応ツールの全一覧は確認できていません。Krokodove以外のノードにも接続できると一般化しません。
- **Inspector**：移動・回転・拡縮の個別項目の有無、正式名称、初期値、値域、キーフレーム対応は未確認です。
- **座標と順序**：変形の基準点、ローカル／ワールド座標の扱い、複数の変形が合成される順序は未確認です。3DモデルのTransformと同じ計算だとは限りません。
- **Regionの境界**：rSphereなどにはSoftnessやInvertに相当する調整が記載されていますが、rTransformが境界の柔らかさや反転状態をどう扱うかは確認できていません。
- **製品差**：DaVinci Resolve 21.1の公式Manualに掲載されていますが、Resolve Free / Studio / Fusion Studioでの利用条件、内部REGID、実機の端子名は別途確認が必要です。

## バージョンと出典

一次資料：Blackmagic Design『**DaVinci Resolve 21.1 Reference Manual**』（September 2026）、**Chapter 105「Krokodove Nodes」p.2438**。「Region Tools」のrTransform、rSphere、rCube、rPlane、rNoise、rMerge、rModifyの説明を照合しました。

確認できるのは**Regionツール群に属する変形ツールであること**と、周辺ツールの基本的な役割です。具体的な構成例・使い分けは、その範囲から組み立てた説明であり、実機のInspector・計算方式・対応ツールを検証済みという意味ではありません。そのため、Frontmatterの`verification: partial`を維持しています。

[Regionを含むKrokodove全体像](./)も参照してください。
