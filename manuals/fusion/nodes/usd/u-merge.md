---
title: uMerge
description: 複数のUSDオブジェクト、カメラ、照明を同じ3DシーンにまとめるuMergeの接続、追加入力、全体Transform、使い分けを解説する。
doc_type: node
term_id: u-merge
term_short: uMergeは、別々のUSDシーンやカメラ、照明を一つの3D環境へまとめるノード。
verification: partial
aliases: [uMerge, USD Merge, uMg]
concepts: [usd-scene, scene-graph]
nodes: [uMerge]
node_family: usd
controls: [Transform, Translation, Rotation Order, Rotation, Pivot, Scale, Lock X/Y/Z]
inputs: [usd]
outputs: [usd]
tasks: [usd, combine-3d, scene, parenting]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uMerge

**uMergeは、別々に作った3Dの物体、カメラ、ライトを一つのUSDシーンにまとめるノード**です。たとえば建物のモデル、撮影用カメラ、照明を個別に用意しても、それらが同じシーンに入っていなければ、一つの場面として描画できません。uMergeで合流させると、カメラから建物を見て、ライトで照らす構成を作れます。

ここでいう<Term id="usd-scene">USDシーン</Term>とは、立体の形状だけでなく、配置、カメラ、照明などの3D情報をまとめて扱うデータです。**uMergeの出力もUSDシーンのまま**で、合成済みの2D画像ではありません。最終的に映像として確認する場合は[uRenderer](./u-renderer)で描画します。

<!-- capture:S327 -->

## 実機例：2つの立体をまとめる

CapsuleとSphereを別々の`uShape`で作り、`uMerge`の2つのscene入力へ接続しました。`uRenderer`を通したViewerには、左右に配置した両方の立体が表示されます。カメラ、ライトや外部USDの組み合わせ、階層衝突や変形はこの例では確認していません。市松模様はViewerの透明表示です。[接続と設定の記録](/img/fusion/captures/S327/readback.json)に条件を記載しています。

[![2つのuShapeをuMergeに接続しuRendererへ渡す構成](/img/fusion/captures/S327/graph.png)](/img/fusion/captures/S327/graph.png)

2つのUSD sceneをuMergeに接続しています。

[![選択したuMergeのInspector](/img/fusion/captures/S327/controls.png)](/img/fusion/captures/S327/controls.png)

uMergeを選択した状態です。

[![CapsuleとSphereを左右に表示した描画結果](/img/fusion/captures/S327/result.png)](/img/fusion/captures/S327/result.png)

1つの描画結果に両方の立体が表示されています。

[再現用Graph](/img/fusion/captures/S327/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S327/capture.json)

<!-- /capture:S327 -->

## 入力・出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **SceneInput[#]** | USDシーン | 物体、カメラ、ライト、別のuMergeの出力などを受け取る。複数接続できる |
| **出力** | USDシーン | 接続した要素を一つの3D環境へまとめ、次のUSDノードへ渡す |

uMergeは最初から**3つの入力**を表示します。入力を接続していくと新しい空き入力が追加されるため、毎回別のuMergeを作って入力口を増やす必要はありません。21.1 Reference Manualでは**入力数に上限を設けない動的入力**として説明されています。これは実機であらゆる規模のシーンの処理性能を保証する意味ではありません。

複数の入力は「前景・背景の二枚の画像」という区別ではありません。**どの入力もUSDの3D要素**を渡すためのものです。接続順と前後の重なりを通常の2D MergeのBackground / Foregroundとして解釈しないでください。

## 最初の接続例：立方体をカメラで描画する

~~~text
uShape（立方体） ───────┐
uCamera ─────────────────┼→ uMerge → uRenderer → MediaOut
uDistant Light ─────────┘
~~~

1. [uShape](./ushape)で立方体を作ります。これが画面に映したい3Dの被写体です。
2. [uCamera](./ucamera)で撮影位置と向きを決めます。立方体がカメラの視野に入る位置へ調整します。
3. 必要なら[uDistant Light](./udistant-light)で光の向きを設定します。
4. 3つのUSD出力をuMergeへ接続し、**uMergeの出力をuRendererのSceneInputへ**つなぎます。
5. uRendererのCameraとLightingを確認してViewerに表示します。配置したライトを使う場合は、Lightingの**Scene**設定を確認します。

uMergeへつなぐ前の各ノードは、それぞれ物体・カメラ・ライトのデータを作っています。uMergeで同じ環境へまとめ、uRendererで**カメラから見た画像**へ変換する、という役割分担です。

外部USDモデルを使う場合はuShapeの代わりに[uLoader](./uloader)を接続できます。uLoaderのファイル内に既にカメラやライトが含まれているケースでは、必ずしもそれらを別のノードで作り直す必要はありません。

## Transform：まとめた要素を一緒に動かす

**uMergeのTransformは、接続した要素のまとまり全体へ作用します。** これが、個々の物体を別々に動かす[uTransform](./utransform)との大きな違いです。

たとえば複数の建物をuMergeにまとめ、そのuMergeのTranslationを変更すると、**建物同士の相対的な並びを保ったまま、まとまりとして移動する**使い方ができます。親グループを動かすような操作です。

| 共通Transform項目 | 調整する内容 |
| --- | --- |
| **Translation** | まとまり全体をX・Y・Z方向へ移動する |
| **Rotation Order** | X・Y・Z軸の回転を適用する順序。XYZならX→Y→Z |
| **Rotation** | Pivotを中心にまとまりを回転する |
| **Pivot** | 回転の中心位置をずらす |
| **Scale / Lock X/Y/Z** | 全体の大きさを調整する。Lockを外すと各軸を個別調整できる |

これらはUSDノードに共通するTransformの説明を踏まえています。同じ数値でもPivotや回転順序が異なれば位置関係の見え方が変わることがあります。個別の建物だけを動かしたい場合は、**建物側のuTransformをuMergeより前に置く**など、どの段階で変形するかを分けて考えます。

### グループを二段階で動かす例

~~~text
建物A ─┐
       ├→ uMerge（建物グループ） ─┐
建物B ─┘                       ├→ uMerge（シーン全体） → uRenderer
uCamera ──────────────────────┤
uDistant Light ──────────────┘
~~~

最初のuMergeは建物A・Bだけをまとめ、二つ目は建物グループとカメラ・ライトを同じシーンに入れます。最初のuMergeを移動すると、**カメラやライトを含めずに建物グループだけを動かす**構成になります。二つ目のuMergeを動かすと、接続済みのカメラやライトも同じ変形の対象となる点に注意してください。

「どの要素を一緒に動かしたいか」でuMergeの位置を決めます。すべてを一つのuMergeへ直接入れるより、**動かす単位ごとにuMergeを分ける**ほうが調整しやすい場面があります。

## uMergeと似たノードの違い

| ノード | 主な働き | 選ぶ場面 |
| --- | --- | --- |
| **uMerge** | 複数のUSD入力を一つのシーンにまとめる | 別々の物体、カメラ、ライトを同じ環境で使う |
| [uTransform](./utransform) | USDシーンの対象を移動・回転・拡大縮小する | 特定のPrimや物体の位置を調整する |
| [uDuplicate](./uduplicate) | 一つのUSDソースから繰り返しコピーを作る | 同じ建物を何棟も並べる |
| [uSwitch](./uswitch) | 複数のUSD入力から使用する一つを選ぶ | モデル案A/Bを切り替える |
| [uRenderer](./u-renderer) | USDシーンを通常の2D画像へ描画する | 映像に合成できる画像を得る |
| **Merge 3D（Classic 3D）** | 従来のFusion 3Dデータをまとめる | Classic 3DのRenderer 3Dへ渡す |

**uMergeとMerge 3Dは同じ3D合流用途でも扱うデータが異なります。** uMergeはUSDのシーン、Merge 3DはClassic 3Dのシーンを受けます。名前の近さだけで直接置き換えることはできません。また、uMergeは「複数の候補から一つを選択する」uSwitchとも違います。

## 表示や配置がおかしい場合

| 症状 | 確認すること |
| --- | --- |
| 物体がViewerに映らない | uMergeのUSD出力がuRendererのSceneInputへ届いているか、カメラが被写体を向いているか確認する |
| カメラを追加しても描画視点が変わらない | uRendererの**Camera**で使用するカメラが選ばれているか確認する |
| ライトを追加しても明るさが変わらない | ライトがuMergeに接続されているか、uRendererの**Lighting**がSceneかを確認する |
| 1つの物体だけ動かしたいのに全体が動く | 変更しているのがuMergeのTransformではないか確認し、必要なら対象にuTransformを追加する |
| グループを動かすとカメラも動いてしまう | そのカメラを同じuMergeへ入れていないか。グループ用とシーン全体用のuMergeを分ける |
| 入力を追加できない | 既存の空きSceneInputを確認する。uMergeは接続に応じて新しい入力が現れる |
| 2DのMergeへ直接つながらない | uMergeの出力はUSD。uRendererで2D画像へ変換してから合成する |
| Classic 3Dのノードと接続できない | USDとClassic 3Dは別のデータ形式。対応するノード系列を確認する |

## バージョン・出典と確認範囲

**一次資料：** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 121「USD Nodes」、**uMerge [uMg] pp.2905–2906**、USD共通Transform **pp.2945–2946**。動的なSceneInput、3入力の初期状態、空き入力の追加、統合するデータの種類、接続全体に作用するTransformと共通Controlを照合しました。配布元：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

接続例、階層化の考え方、トラブル対処はManualの仕様をもとに組み立てた説明です。**端子の厳密な色・REGID、実機での大規模シーンの性能、各設定の数値範囲、Resolve Free / Studioの差、実機レンダリング結果は未確認**です。これらを21.1実機確認済みとはせず、`verification: partial`を維持します。
