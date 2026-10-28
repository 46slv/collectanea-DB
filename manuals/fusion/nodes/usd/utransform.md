---
title: uTransform
description: USDシーン内の一部または全体を選び、位置・回転・中心・大きさを変更するuTransformをPrim Selectionと制作例から説明する。
doc_type: node
term_id: utransform
term_short: uTransformは、USDシーンの選択した物体やグループに移動・回転・拡大縮小を追加するノード。
verification: partial
aliases: [uTransform, uXF]
concepts: [usd-scene, transform, scene-tree]
nodes: [uTransform]
node_family: usd
controls: [Pick, Prim Selection, Translation, Rotation Order, Rotation, Use Target, Pivot, Scale, Lock X/Y/Z]
inputs: [usd]
outputs: [usd]
tasks: [usd, transform, prim-selection, hierarchy]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-15"
---

# uTransform

**uTransformは、USDシーンの3Dオブジェクトを移動・回転・拡大縮小するノード**です。シーン全体だけでなく、一部の物体やグループを選んで動かせます。例えば、車のボディを動かさずにドアだけを回す、複数の家具をまとめて移動するといった操作に使います。

<Term id="usd-scene">USDシーン</Term>は、立体、マテリアル、カメラなどを階層構造で扱える3Dデータです。階層中の要素を**Prim（プリム）**と呼びます。車全体のグループ、ドアの立体、ライトなどがそれぞれPrimになりえます。**Prim Selection**は、そうした要素のうち、どれを変更するか指定する仕組みです。

uTransformは3Dシーンを加工し、出力もUSDデータのままです。合成用の2D画像にするには[uRenderer](./u-renderer)でレンダリングします。レンダリングした画像を動かす通常の2D Transformとは、扱うデータと編集可能な対象が異なります。

## 入力・出力

| 接続 | データ | 説明 |
| --- | --- | --- |
| **Scene Input（オレンジ）** | USDシーン／USDオブジェクト | 追加の変形を適用する対象。必須入力 |
| **出力** | USDシーン | 変形後の3Dシーンを後段へ渡す |

~~~text
uLoader ─→ uTransform ───────┐
uCamera ────────────────────┼→ uMerge → uRenderer → MediaOut
uDistant Light ─────────────┘
~~~

[uLoader](./uloader)から読み込んだモデルの配置をuTransformで調整し、[uMerge](./u-merge)でカメラや照明と組み合わせます。**uTransform自体が2D画像を生成したり、カメラを追加したりするわけではありません。**

前段にuShapeなどのTransform設定があっても、それを置き換えるのではなく、**新しい変形段階を重ねる**ノードです。複数のuTransformを直列に接続して、部品ごとの動きと全体の動きを分けられます。

## Prim Selection：動かす部分を選ぶ

例えば車のUSDファイルが「車全体」「ボディ」「左ドア」「右ドア」という階層を持つ場合、左ドアのPrimを選べば、その部品だけの回転を調整できます。車全体の親グループを選べば、まとまりとして動きます。実際に選べる粒度は、元のUSDファイルの階層構造によって決まります。

1. uLoaderなどからUSDシーンを**Scene Input**へ接続します。
2. uTransformのInspectorで**Pick**を押し、**USD Scene Tree**を開きます。
3. ツリーを展開して変更したい立体またはグループを選択します。必要に応じて表示の絞り込みや複数選択を使います。
4. **Translation**か**Rotation**を少し変え、想定した部分だけが動くかViewerで確認します。
5. 余計な物体まで動く場合、親Primを選んでいないか、選択範囲と階層を見直します。

Scene Treeは**すでにあるUSD内の要素を選ぶ画面**です。形状を切り離したり、新しくドアを生成したりする機能ではありません。ドアがボディと一体のメッシュなら、Primを選ぶだけでは独立して動かせません。

ManualではPickでオブジェクトやマテリアルを選べると説明しています。ただし、マテリアルPrimを選択した場合に幾何形状へどのような変形が及ぶかは、この説明から確定できません。位置・回転の用途では、まず立体やグループのPrimを選びます。

<!-- capture:S328 -->

## 実機例：Capsuleを回転する

`uShape`のCapsuleを`uTransform`に接続し、RotationのZを60に設定しました。左Viewerは変換前、右Viewerは変換後を別々のuRendererで描いた表示です。傾きの違いとInspectorの値を確認できます。Prim Selection、位置・Scale・Pivotの変更やanimationはこの例では試していません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S328/readback.json)に条件を記載しています。

[![uShapeからuTransformと2つのuRendererへ分岐する構成](/img/fusion/captures/S328/graph.png)](/img/fusion/captures/S328/graph.png)

uTransformを通す経路と変換前の描画経路を用意しています。

[![uTransformのRotation Zを60に設定したInspector](/img/fusion/captures/S328/controls.png)](/img/fusion/captures/S328/controls.png)

Rotation Zを60に設定しています。

[![左に変換前、右に傾いたCapsuleを並べたViewer](/img/fusion/captures/S328/comparison.png)](/img/fusion/captures/S328/comparison.png)

左は変換前、右は変換後です。

[再現用Graph](/img/fusion/captures/S328/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S328/capture.json)

<!-- /capture:S328 -->

## Inspector：位置・向き・大きさ

| 設定 | 効果 | 用途 |
| --- | --- | --- |
| **Translation** | X・Y・Z方向へ移動 | モデルの高さ合わせ、家具の配置 |
| **Rotation Order** | 回転を適用する軸の順序 | 複数軸を回した際の姿勢を調整 |
| **Rotation** | Pivotを中心に向きを変更 | ドア、車輪、オブジェクトの向きを変える |
| **Pivot** | 回転中心の位置を変更 | ドアの蝶番側から回す |
| **Scale** | 全体または軸別に拡大縮小 | サイズ合わせ、横幅だけの変更 |
| **Lock X/Y/Z** | Scaleを一括にするか、軸別にするか | 縦横比を保つ／一方向へ伸ばす |
| **Use Target** | 指定したXYZ位置を向くよう回転させる | ターゲットを基準に向きを決める |

### Rotation OrderとPivot

**Rotation Order**は、3軸の回転をどの順番で適用するかを決めます。例えば**XYZ**ならX軸、Y軸、Z軸の順です。複数軸を組み合わせる場合は、順序によって姿勢が変わります。

**Pivot**は回転の中心です。ドアの中央を中心にすれば、その場で回って見えます。Pivotを蝶番へ寄せると、ドアの開閉に近い動きを作れます。Translationで物体全体を移動する操作とは別です。Manualは通常のPivotを物体の中心に相当する**(0, 0, 0)**として説明していますが、モデルの原点や親の変形によってViewerでの見え方は異なります。

### ScaleとLock X/Y/Z

**Lock X/Y/Z**を有効にすると、1つのScaleスライダーで3軸をまとめて拡大縮小できます。無効にすると、X・Y・Z別のスライダーが現れます。元の比率を保つ調整と、一方向だけ伸ばす調整を使い分けます。

### Use Target

**Use Target**を有効にすると、**XYZのターゲット位置を設定するコントロール**が現れ、対象がそのターゲットを向くように回転します。無効の場合、Rotationはグローバル軸を基準に扱います。ターゲットの**座標を指定する**操作であり、チェックを入れるだけで特定のPrimの動きを自動追跡する、とまでは断定できません。

この挙動は21.1 ManualのuTransform節だけでなく、次ページ冒頭のScale見出しの下にも説明されています。ターゲット座標の具体的な初期値や、他のPrimへの自動追従の可否は実機未確認です。

## 制作例：車のドアを開く

1. ドアが独立したPrimになっているUSDモデルをuLoaderで読み込みます。
2. uTransformをつなぎ、PickでドアPrimを選択します。
3. 小さくRotationを変え、車体全体ではなくドアだけが動くことを確認します。
4. Pivotを蝶番の位置へ合わせます。回転軸とRotation Orderも確認します。
5. 開いた角度までRotationを調整します。アニメーションを設定する場合は実際のキーフレームと補間結果を確認します。
6. カメラと照明をuMergeでまとめ、uRendererで見え方を確認します。

元モデルでドアが独立していなければ、この手順は成立しません。また、蝶番の座標はモデルによって違うため、固定値を使い回さずViewerで合わせます。

## 制作例：椅子だけを動かしてから家具全体を動かす

~~~text
家具を含むUSDシーン → uTransform（椅子Prim） → uTransform（家具グループ）
                                              ↓
                                             uMerge ← uCamera / uDistant Light
                                              ↓
                                           uRenderer
~~~

最初のuTransformでは椅子のPrimを選び、Translationで位置を調整します。2つ目のuTransformでは家具の親グループを選び、全体を移動します。**同じTranslationでも、どのPrimを選んだかによって動くものが異なります。** 直列のuTransformによって変形を段階的に追加できますが、接続するだけでUSDの階層を自動再構成する機能ではありません。

## 関連ノードとの使い分け

| ノード | 扱う対象 | 適した操作 |
| --- | --- | --- |
| **uTransform** | USDシーン内の選択したPrim | 一部の立体だけを移動・回転する |
| [uMerge](./u-merge) | 複数のUSD入力をまとめたシーン | 物体・カメラ・ライトを統合し、まとまりとして変形する |
| [uDuplicate](./uduplicate) | USD内の対象の複製 | 建物や街灯を繰り返し並べる |
| [uVisibility](./uvisibility) | 選択したUSD Primの表示状態 | 移動せずに表示・非表示を切り替える |
| **2D Transform** | レンダリング後の2D画像 | 画面上で位置・サイズ・角度を調整する |

uMergeにカメラまでまとめてから全体のTransformを変更すると、カメラも一緒に動く構成になります。被写体だけを移動したい場合は、**uMergeへの合流前にuTransformを配置**するか、選択対象を限定します。

## うまく動かないとき

| 症状 | 確認すること |
| --- | --- |
| 一部だけのつもりが全体が動く | Pickで親グループを選んでいないか。uMerge全体のTransformを変えていないか |
| ドアなどの部品がScene Treeにない | 独立したPrimになっているか。元USDの階層を確認する |
| 回転で思わぬ位置へ動く | Pivotと親の変形、Rotation Orderを確認する |
| 縦横比が変わる | Lock X/Y/Zの状態と3軸のScaleを確認する |
| Use Targetで意図しない向きを向く | XYZターゲット位置とUse Targetの状態を確認する |
| Viewerに変更がない | 対象Prim、Scene Input、uMerge以降の接続、カメラ方向を確認する |
| 2D Mergeへ直接つながらない | uTransformの出力はUSD。uRendererで画像に変える |

## バージョン・出典・確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**uTransform [uXF] pp.2923–2925**、**USD Scene Tree p.2888**、**共通Transform pp.2945–2946**。公式配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

ManualでScene Input、Pick、Translation、Rotation Order、Rotation、Pivot、Scale、Lock X/Y/Z、Use Targetと追加変形の性質を確認しました。車と家具の例はそれらを組み合わせた運用例です。**正確な出力端子名、Prim種類ごとの変形可否、キーフレームの補間挙動、Edition差、21.1実機での結果は未確認**です。このため`verification: partial`を維持しています。
