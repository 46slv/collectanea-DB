---
title: rSphere
description: 球状のRegionを作り、対応する効果がどの範囲へ作用するかを指定する。
doc_type: node
term_id: rsphere
term_short: 球状の作用範囲（Region）を生成するKrokodoveノード。球体のCGを描くものではない。
verification: partial
aliases: [rSphere]
nodes: [rSphere]
node_family: krokodove
outputs: [region]
tasks: [limit-effect-region]
product_scope: fusion
suite_surfaces: [fusion]
updated: '2026-10-18'
---

# rSphere

rSphereは、**球の形を基準に効果の作用範囲を指定する**Krokodoveのノードです。球体を映像に描画するのではなく、「この球状の範囲を処理の対象にしたい」という情報を別のノードへ渡します。

たとえば、空間のある位置を中心に効果のかかる範囲を作りたい場合、球状のRegionが候補になります。実際に画像や3Dシーンを加工するのは、**Regionを受け取る側のノード**です。

## まず、Regionとは

Region（リージョン）は、**処理をどこへ適用するかを表すデータ**です。画像の画素そのものでも、レンダリングする3Dモデルでもありません。rSphereが作る球状のRegionは、その範囲を利用できるノードの**Region入力**へ接続して使います。

球状のRegionと、3D形状を作るツールで用意した球形のCGモデルは用途が違います。球形のモデルはレンダリングして画面に表示する工程を考えますが、rSphereは「別の処理がどの範囲へ作用するか」を指定する役割です。[Krokodoveのデータ分類](./)では、画像・Shape・3D・Regionの違いを説明しています。

## 入力と出力

| 段階 | 扱うもの | 確認状況 |
| --- | --- | --- |
| 入力 | Region生成のための必須入力や補助入力の有無は未確認 | 21.1 Manualの一覧には端子構成の記載なし |
| 生成 | **球状のRegion** | 21.1 Manualに明記 |
| 出力 | Region入力を持つ別の対応ノードへ渡す作用範囲 | 21.1 Manualに明記 |

**「球状のRegionを出す」と「球の画像を出す」は異なります。** Region出力をMediaOutや通常のImage入力につないで球が表示されるとは限りません。実際の端子名、色、入力数、内部データ型や、標準Effect Maskとの互換性は未確認です。

## 主な調整

21.1 Reference Manualに記載されている調整は、**Softness・Invert・Transform**の三系統です。以下はそれぞれの意味を理解するための説明で、実機Inspectorのラベルや数値を再現したものではありません。

- **Softness（境界の柔らかさ）**：球状の範囲の境界を、急に切り替えるか、なだらかに変化させるかを考えるための調整です。実際の減衰方式や値の範囲は確認できていません。
- **Invert（反転）**：指定した球状の範囲と、その外側の扱いを切り替える方向の調整です。受け手によって結果がどう見えるかは実機で比較する必要があります。
- **Transform（変形）**：作用範囲の配置・形を変更するための調整です。中心・大きさ・回転などの独立項目が存在するか、座標系や変形順序がどうなっているかはManualだけでは不明です。

「球状」という言葉だけから、画面のどの位置に初期配置されるか、半径の単位、境界を内側・外側のどちらから評価するかまで断定できません。設定後の実際の範囲はViewerと接続先の処理結果で判断します。

## 最小構成と確認手順

次は、**Region入力を持つ効果ノードが見つかった場合**に、rSphereの役割を理解するための構成案です。特定のKrokodove効果で動作検証済みのレシピではありません。

```text
rSphere ───────────────→ 対応する効果ノードのRegion入力
                               ↑
                    処理対象の画像・シーンは別経路
```

1. Fusionで、効果を担当するノードに**Region入力が実在すること**を確認します。一般的なEffect Maskや3D Sceneの端子と取り違えないでください。
2. 処理対象の画像またはシーンを、効果ノードの通常の入力へ接続します。
3. rSphereを配置し、出力をその効果ノードのRegion入力へ渡します。
4. 効果ノードの結果をViewerに表示し、rSphereのTransformに相当する設定を一つだけ動かします。処理が及ぶ場所や範囲が変化するか確かめます。
5. SoftnessとInvertをそれぞれ変更し、境界や対象範囲の変化を比較します。最後にRegion接続を外した場合とも見比べます。

この例の目的は、**画像・シーンを処理する経路と、作用範囲を伝える経路を分けて理解すること**です。rSphereそのものが画面に球形を描いたかどうかではなく、受け手がRegionに応じて処理結果を変えるかを確認します。

## ほかのRegionノードとの使い分け

| ノード | 作る・変えるもの | 選択の目安 |
| --- | --- | --- |
| **rSphere** | 球状のRegion | 丸い立体的な範囲を基準にしたい |
| [rCube](./rcube) | 箱状のRegion | 箱の辺や面を基準に範囲を考えたい |
| [rPlane](./rplane) | 平らなカード状のRegion | 面を基準に範囲を考えたい |
| [rNoise](./rnoise) | PerlinノイズのRegion | 規則的な幾何形状ではない範囲を試したい |
| [rTransform](./rtransform) | 既存Regionの変形 | 生成と範囲調整を別工程に分けたい |
| [rMerge](./rmerge) / [rModify](./rmodify) | Regionの統合・変更 | 複数の範囲や生成後の調整を扱いたい |

rSphere自体にもTransform系の調整があるため、単純に球状の範囲を配置するだけならrTransformを追加する前にrSphereで調整できる内容を確認します。複数の球状範囲を使う場合、rMergeがどのような演算を提供するかはInspectorと実機で別途確認が必要です。

## バージョン・出典・未確認事項

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 105「Krokodove Nodes」、p.2438、「Region Tools — rSphere」。

**確認済み**：rSphereが球状のRegionを生成し、Softness・Invert・Transformの調整を持ち、Region入力を備える他ツールと組み合わせること。

**未確認**：正式な端子名と数、Inspectorの項目名・初期値・値域、球の幾何学的な厳密な定義と座標系、対応ノード一覧、実機の描画結果、Resolve Free / Studio / Fusion Studioでの提供差。以上の理由から、frontmatterの`verification: partial`を維持しています。
