---
title: uCatcher
description: uProjector / uCameraで投影した画像をUSDの物体へテクスチャとして受け取り、Alpha付きの切り抜きや複数投影を扱う方法を解説する。
doc_type: node
term_id: ucatcher
term_short: uCatcherは、USDの物体に向けたTextureモードの投影を受け取り、画像の色と透明度をその表面へ適用するノード。
verification: partial
aliases: [uCatcher]
concepts: [usd-scene, projection, alpha]
nodes: [uCatcher]
node_family: usd
controls: [Color Mode, Alpha Mode, Threshold, Restrict by Projector ID]
inputs: [usd]
outputs: [usd]
tasks: [usd, projection, texture-projection]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uCatcher

**uCatcherは、3D空間に置いた物体へ画像を投影するとき、その画像を「光」ではなく「表面のテクスチャ」として受け取るノード**です。画像を投影する側の[uProjector](./uprojector)または[uCamera](./ucamera)と組み合わせます。

例えば建物の正面写真を3Dの平面へ投影するとします。窓の部分を画像編集で透明にしておけば、uCatcherでは窓越しに後ろの部屋を見せられます。光として投影するだけでは画像のAlphaが物体を切り抜かないため、この違いが重要です。

扱う対象は<Term id="usd-scene">USDシーン</Term>内の形状です。uCatcherが写真から3Dモデルを生成したり、単独で完成した2D画像を出力したりするわけではありません。[USDシーンの基礎](../../learn/02-data/usd)も参照してください。

## Light投影とTexture投影の違い

| | Lightモード | Textureモード + uCatcher |
| --- | --- | --- |
| 投影画像の使われ方 | 物体の表面へ当てる光（拡散・鏡面成分） | 物体に適用するテクスチャ |
| 投影画像のAlpha | 透明部分で形状を切り抜けない | 透明部分を使って背景を見せられる |
| 受ける対象 | 投影範囲にあり、光の影響を受ける物体 | uCatcherを使う物体 |
| ライトの有効化 | 投影結果を見るにはライティングが必要 | 投影画像を受け取ること自体にライティングは不要 |
| 想定用途 | 映像の色や明るさを光として照射する | 看板・建物の投影、切り抜き、後から照明を変えるテクスチャ |

uProjectorのInspectorで**Projection Mode**を**Texture**に切り替えても、受け手の物体にuCatcherがなければ、意図したTexture投影にはなりません。逆に**uCatcherだけを置き、対応するTexture投影がシーン内にない場合、その物体は透明になって見えなくなります**。これはManualに明記された動作です。

## 入力・出力とデータの流れ

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（黄色）** | USD geometry / scene | 投影を受ける形状。uShapeで作った物体やuLoaderから読み込んだUSDアセットなど |
| **出力** | USD scene | 投影を受ける設定を組み込んだ物体を、uMergeなど次のUSDノードへ渡す |

投影画像の**2D Image**は、uCatcherに直接差し込むのではありません。[uProjector](./uprojector)の**Projective Image（白い入力）**へ接続します。uProjectorとuCatcherは、それぞれUSDシーンの要素として[uMerge](./u-merge)でまとめます。

~~~text
MediaIn（投影したい2D画像）
    └→ uProjector（Projection Mode: Texture） ──┐
                                                │
uShape / uLoader → uCatcher ────────────────────┼→ uMerge → uRenderer → 2D Image
                                                │
uCamera ────────────────────────────────────────┘
~~~

図中で**uProjectorからuCatcherへ直接ワイヤーを引いていない**のは、uCatcherが同じUSDシーンにあるTexture投影を受ける仕組みだからです。uCatcherの出力を通常の2D Mergeへ直接つなぐのではなく、[uRenderer](./u-renderer)でUSDシーンを2D画像に変換します。

## 制作例：写真の窓を透明にして背景を見せる

1. 建物の正面画像を用意し、窓部分のAlphaを0にして透明にします。画像のRGBを黒くするだけでは、透明にはなりません。
2. [uShape](./ushape)などで投影先の平面を作り、そのUSD出力を**uCatcherのScene Input**へ接続します。
3. MediaInから画像をuProjectorの**Projective Image**へ接続し、**Projection ModeをTexture**にします。
4. uCatcherとuProjectorの出力をuMergeへ接続し、カメラと必要な背景・3Dの室内を同じシーンへまとめます。
5. uProjectorの位置・向きと、投影先の平面との関係を調整します。uMergeの出力をuRendererで描画し、窓部分の奥に配置した物体が見えるか確認します。

投影先とProjectorを別々に動かすと、テクスチャが物体表面を滑るように見えることがあります。これは投影元と物体の相対位置が変わるためです。投影を固定したい場合は、双方を一体として動かす構成を検討します（uProjectorのManual pp.2906–2907）。

**[uImage Plane](./uimage-plane)**との違いも押さえておきます。uImage Planeは写真を貼った平面そのものを作るノードです。uProjector + uCatcherは、別に用意した形状へ指定方向から画像を投影します。複数の面や既存USDアセットへ画像を映したい場合は、後者を検討できます。

## Inspector：主な設定

| 設定 | 何を調整するか | 判断の目安 |
| --- | --- | --- |
| **Color Mode** | 複数の投影画像の色をどう合成・蓄積するか | 画像が重なる部分の色を調整するとき |
| **Alpha Mode** | 複数の投影画像のAlphaをどう合成するか | 重なる投影の透明度が意図と違うとき |
| **Threshold** | 蓄積計算から小さい値を除外する | 薄い成分を合成計算から外したいとき |
| **Restrict by Projector ID** | 指定したIDに一致するProjectorの投影だけ受け取る | 複数Projectorのうち特定の投影だけ受けたいとき |

**Color ModeとAlpha Modeは、Projectorが1つだけなら結果に影響しません。** 変化が見えない場合、先にProjectorの数を確認してください。

**Threshold**は画像のAlphaを一律に切り抜くスライダーと同義ではありません。Manualは例として、**Median Accumulation**でThresholdを**0.01**にすると、0.01未満の画素値が中央値の計算から除外されると説明しています。どの累積方式を選んでいるかと合わせて判断します。

**Restrict by Projector ID**を有効にすると、IDが一致しないProjectorは無視されます。投影画像が消えたときは、Projector側とuCatcher側のIDの対応も確認します。

Transform / SettingsはUSD系ノードに共通するInspectorタブです。ここではuCatcher固有の設定と区別し、未確認の既定値や選択肢を列挙しません。

## うまく表示できないとき

| 症状 | 確認すること |
| --- | --- |
| uCatcherをつないだ途端に物体が消えた | 同じシーンにuProjectorまたはuCameraがあるか、**Projection ModeがTexture**か確認します。対応する投影がなければ透明になります。 |
| 投影しても窓などが透明にならない | LightではなくTexture投影か、画像にAlphaが入っているか、投影先がuCatcherを経由しているかを分けて確認します。 |
| 投影画像そのものが出ない | MediaInの出力、uProjectorの**Projective Image**接続、Projectorの向き、投影対象の位置を確認します。 |
| uCatcherの出力を通常のMergeへ接続できない | 出力は**USD scene**です。uMergeへ渡し、uRendererで2D画像へ変換します。 |
| Color Mode / Alpha Modeを変えても効果がない | 投影Projectorが1つだけなら、複数投影の合成設定は効果を持ちません。 |
| 特定Projectorの投影だけ受けられない | **Restrict by Projector ID**とProjectorのIDが一致しているか確認します。 |
| 動かすと画像が表面を滑る | Projectorと投影先の相対的な位置・向きが変化していないか確認します。 |
| 別の3Dオブジェクトへ投影したい | その物体のUSD経路にuCatcherがあるか確認します。LightモードとTextureモードでは投影を受ける条件が異なります。 |

## 関連ノード

- [uProjector](./uprojector)：画像を投影する側。Light / Textureを切り替え、色・強さ・投影方向などを調整する。
- [uCamera](./ucamera)：カメラの視点から投影する場合にも使用できる。
- [uShape](./ushape) / [uLoader](./uloader)：投影を受ける形状を作る、または読み込む。
- [uMerge](./u-merge)：Projector・投影対象・カメラなどを同じUSDシーンへまとめる。
- [uRenderer](./u-renderer)：USDシーンを通常の2D画像へ描画する。
- [uImage Plane](./uimage-plane)：投影ではなく、画像を貼った平面を直接作るときの選択肢。

## バージョン・出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121「USD Nodes」、**uCatcher [uCa] pp.2892–2894**。投影との関係、Scene Input、Alpha、無投影時の透明化、Color / Alpha Mode、Threshold、Projector IDを確認。投影側の条件は**uProjector [uPj] pp.2906–2910**と照合しました。

制作例と接続図は上記の仕様を組み合わせた説明です。Resolve 21.1実機での動作、Inspectorの全選択肢・既定値・数値範囲、内部REGID、Edition差、複雑なマテリアル入力への接続は確認していません。**verification: partial**を維持し、実機で未確認の項目を確定事項として扱いません。