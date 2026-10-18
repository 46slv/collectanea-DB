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
updated: "2026-10-18"
---

# uCatcher

**uCatcherは、3D空間に置いた物体へ画像を投影するとき、その画像を「光」ではなく「表面のテクスチャ」として受け取るノード**です。画像を投影する側の[uProjector](./uprojector)または[uCamera](./ucamera)と組み合わせます。

例えば建物の正面写真を3Dの平面へ投影するとします。窓の部分を画像編集で透明にしておけば、uCatcherでは窓越しに後ろの部屋を見せられます。光として投影するだけでは画像のAlphaが物体を切り抜かないため、この違いが重要です。

扱う対象は<Term id="usd-scene">USDシーン</Term>内の形状です。uCatcherが写真から3Dモデルを生成したり、単独で完成した2D画像を出力したりするわけではありません。[USDシーンの基礎](../../learn/02-data/usd)も参照してください。

## Light投影とTexture投影の違い

| | Lightモード | Textureモード + uCatcher |
| --- | --- | --- |
| 投影画像の使われ方 | 投影画像を光として照射する。Manualには拡散テクスチャへの加算と、拡散・鏡面反射への照明寄与の両方の説明がある | 投影画像を物体の表面のテクスチャとして適用する |
| 投影画像のAlpha | 透明部分で形状を切り抜けない | 透明部分を使って背景を見せられる |
| 受ける対象 | 投影範囲にあり、光の影響を受ける物体 | uCatcherを使う物体 |
| ライトの有効化 | 投影結果を見るにはライティングが必要 | 投影画像を受け取ること自体にライティングは不要 |
| 想定用途 | 映像の色や明るさを光として照射する | 看板・建物の投影、切り抜き、後から照明を変えるテクスチャ |

**Lightモード**は画像を照明として投影します。21.1 ManualのuCatcher節（p.2892）は投影画像のRGB値を拡散テクスチャへ加算すると説明していますが、uProjector節（p.2907）では**Diffuse / Specularの光**として作用し、鏡面ハイライトを生み得るとも記しています。**光が鏡面反射に寄与すること**と、**画像を材質のSpecular Textureへ割り当てること**は別の操作です。後者はTexture投影とuCatcherの用途に含まれます（p.2893）。**Textureモード**では投影画像を表面のテクスチャとして受け取り、Alphaを利用して透過部分を表現できます。

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

## 制作例：2台のProjectorで壁に異なる画像を重ねる

1枚目は建物の写真、2枚目は壁面の汚れや模様を表す画像とします。どちらも別々の方向から同じ壁へ投影し、重なる場所の色と透明度を調整する例です。**単に画像を2枚重ねる2D Mergeとは異なり、投影先はUSDシーン内の立体**です。

~~~text
MediaIn（建物写真A） → uProjector A（Texture） ──┐
MediaIn（模様画像B） → uProjector B（Texture） ──┤
uShape / uLoader（壁） → uCatcher ─────────────┼→ uMerge → uRenderer
uCamera ──────────────────────────────────────┘
~~~

1. 壁に使うUSD形状を用意し、その出力を**uCatcherのScene Input**へ接続します。
2. 写真Aと模様画像Bを別々のMediaInから読み込み、それぞれ**別のuProjectorのProjectiveImage**へ接続します。両方とも**Projection Mode: Texture**に設定します。
3. 2つのuProjector、uCatcherを通した壁、uCameraを**uMerge**へ接続し、uRendererで描画します。投影範囲が意図した場所で重なるよう、各Projectorの位置・向きを調整します。
4. まず片方ずつ投影を確認します。ここでは**Color ModeとAlpha Modeを変えても違いは出ません**。これらは複数投影の蓄積方法を選ぶための設定です。
5. 両方の投影を同時に受けた状態で、重なり部分を見ながら**Color Mode**を切り替え、色がどのように組み合わされるか比較します。続いて**Alpha Mode**を切り替え、写真の透明部分と模様画像のAlphaがどう反映されるか確認します。色の合成とAlphaの合成は別の設定なので、片方ずつ変更します。
6. 小さい画素値を蓄積計算から除外したい場合にだけ**Threshold**を調整します。21.1 Manualは、**Median AccumulationでThresholdを0.01にすると、0.01未満の画素値が中央値の計算から外れる**例を示しています。すべてのモードで同じ見た目になる保証や、一律にAlphaを切り抜く機能ではありません。

**重なり部分を確認する理由：** 2台のProjectorを置いただけでは、必ずしも同じ画素位置に両方の画像が届きません。Color ModeやAlpha Modeの違いを見る前に、投影範囲が実際に重なっているか、各画像に想定したAlphaがあるかを確認します。

### Projector IDで投影先を分ける場合

複数の壁があり、それぞれ別の投影だけを受けたいときは、各壁のUSD経路へuCatcherを置き、**Restrict by Projector ID**で対象を絞る方法があります。21.1 Manualが明記するのは、**一致するIDのProjectorからだけ受け取り、異なるIDを無視する**動作です。Projector側のIDの具体的な割り当て操作、既定値、IDの命名方式はこの節から確定できないため、実機で確認してください。

IDの制限を設定してから画像が消えた場合は、Projectorの投影方向とTextureモードを確認したうえで、ID制限の有無を切り替えて原因を切り分けます。**対応するTexture投影を受けられないuCatcherは、対象物体を透明にして見えなくする**点にも注意が必要です。

この例は**pp.2892–2894の複数投影と蓄積設定を組み合わせた手順**で、特定の画像や実機での描画結果を確認したものではありません。メニュー選択肢の全名称・既定値・計算式は未検証のため、見た目の結果を決め打ちしていません。

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