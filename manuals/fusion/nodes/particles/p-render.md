---
title: pRender
description: Particle setを2D ImageまたはClassic 3D geometryへ変換する終端Node。Output Mode、時間計算、描画と画像設定を説明する。
doc_type: node
term_id: p-render
verification: partial
aliases: [pRender, Particle Render, pRn]
concepts: [particle-data, rendering, data-domain, time]
nodes: [pRender]
node_family: particles
controls: [Output Mode, Restart, Pre-Roll, Automatic Pre-Roll, Only Render in Hi-Q, View, Blur, Glow, Blur Blend, Sub-Frame Calculation Accuracy, Pre-Generate Frames, Kill Particles That Leave the View, Generate Z Buffer, Depth Merge Particles, Z Clip, Process Mode, Use Frame Format Settings, Width, Height, Pixel Aspect, Depth, Source Color Space, Source Gamma Space]
inputs: [particle, camera, mask]
outputs: [image, 3d-scene]
tasks: [particles, render, convert-domain]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pRender

pRenderは、粒子を発生・移動させるNodeの最後で、<Term id="particle-data">Particle set</Term>を画像または3Dの形状へ変換します。

pEmitterやForce系Nodeが扱うのは、各粒子の位置・速度・寿命・色などを含むParticleデータです。通常の2D ImageとしてBlurやMergeへ接続するには、pRenderで**2D出力**へ変える必要があります。一方、立体的なシーンへ粒子を配置して他の3Dオブジェクトと一緒に描画するなら、**3D出力**を使います。pRenderのOutput Modeは既定で3Dです。

## 入力と出力

| 接続 | 受け取るもの・出すもの | 役割 |
| --- | --- | --- |
| Input（オレンジ） | Particle set | pEmitter、pMerge、各Force／Behavior系Nodeから粒子データを受け取る。通常の2D映像を直接つなぐ入力ではない。 |
| Camera Input（緑、任意） | Camera 3D、またはCameraを含む3D scene | 粒子を描く視点の指定に使う。 |
| Effect Mask（青、任意） | 2D Mask | 2D出力で、粒子が見える範囲をMaskで制限する。粒子そのものの移動範囲を変更する入力ではない。 |
| Region用の追加入力（条件付き・緑） | BitmapまたはMesh | RegionタブでBitmap／Meshを選んだときに現れる。Camera Inputとは別の目的で使う。 |
| Output | 2D Image **または** 3D geometry | Output Modeに従って出力のデータ種類が切り替わる。 |

Region用の接続は常時表示される端子ではありません。外部画像や形状をRegionの基準にする構成では、Regionタブの選択と実際に現れた端子を確認してください。Regionの共通概念は[Particleノード](./index.md)にもまとめています。

## Output Modeと後段への接続

### 2D：粒子を通常の映像へ重ねる

```text
pEmitter → pDirectionalForce → pRender（Output Mode: 2D）
                                   ↓
                        MergeのForeground入力
背景素材 ───────────────→ MergeのBackground入力 → MediaOut
```

火花や雨を素材へ合成するときの構成です。pEmitterが粒子を作り、pDirectionalForceが移動を変え、pRenderがRGBA画像として描画します。MergeのBackgroundには合成先の画像、ForegroundにはpRenderの出力を入れます。粒子の見た目に通常のBlurやColor Correctorを使いたい場合も、pRenderの**2D出力の後**へ接続します。

### 実機例：2系統の粒子を2D表示する

2つのpEmitterからpMergeへ粒子を送り、pRenderのOutput Modeを2DにしてMediaOutへ接続します。これは[pMergeの実機例](./pmerge)と同じ構成です。

[![2つのpEmitterをpMerge、pRender、MediaOutへ接続したGraph](/img/fusion/captures/S307/graph.png)](/img/fusion/captures/S307/graph.png)

`ParticleRender`はpRenderの名前です。

[![pRenderのInspectorで2D出力を選択した状態](/img/fusion/captures/S307/render-controls.png)](/img/fusion/captures/S307/render-controls.png)

Output Modeは2Dです。

[![frame 48で赤と青の粒子群を描いた2D画像](/img/fusion/captures/S307/result.png)](/img/fusion/captures/S307/result.png)

frame 48に赤と青の粒子群が表示されました。[接続と設定の記録](/img/fusion/captures/S307/readback.json)に条件を記載しています。3D出力や時間経過、他の描画設定はこの静止例では確認していません。

### 3D：他の立体要素と一緒に描く

```text
pEmitter → pRender（Output Mode: 3D） → Merge 3D → Renderer 3D → Merge
                                        ↑
                                    他の3D要素
```

3DではpRenderが出すのは完成画像ではなく、Classic 3Dシーンに組み込める粒子geometryです。たとえば3Dの建物や地形と一緒に火花を配置し、最後にRenderer 3Dで画像へ変換します。pRenderとRenderer 3Dは別の役割を持つため、3D出力を直接通常の2D Mergeへ接続することはできません。

**モードごとのInspectorの効き方にも違いがあります。** 21.1 Reference Manualによれば、3Dモードで粒子システムの計算に作用するpRenderの主な設定はRestart、Pre-Roll、Automatic Pre-Roll、Sub-Frame Calculation Accuracy、Pre-Generate Framesです。Blur、Glow、Viewなど残りの描画系設定を3D出力の見た目へ効かせようとしても、2Dモードと同じようには働きません。3Dシーンの最終画像を調整する場合はRenderer 3D以降も確認します。

## 時間計算：Pre-RollとRestartを区別する

粒子の位置は、それまでのフレームでどのように動いたかに依存します。再生しながらフレーム0から90へ進んだ結果と、途中の状態を計算せずにフレーム90へ直接移動した結果は、一致しないことがあります。

| 設定 | 何をするか | 使う場面 |
| --- | --- | --- |
| **Pre-Roll** | レンダー範囲の先頭から現在フレームまで粒子状態を再計算する。各フレームの完成画像をレンダーする操作ではない。 | タイムラインを飛ばした後、現在フレームの表示を正しい状態に戻したい。 |
| **Automatic Pre-Roll** | 現在フレームが変わるたび、必要な粒子計算を自動的に行う。 | 短く軽い粒子表現を、任意の時刻へ移動して確認したい。 |
| **Restart** | 現在フレームで粒子システムを初期化し、それ以前に生成された粒子を破棄して再開始する。 | その時刻から新たな発生状態を試したい。 |
| **Pre-Generate Frames** | 最初の有効フレームより前に指定フレーム数の粒子状態を計算し、開始時点の状態を作る。 | カットの冒頭から既に煙が立ち上っているように見せたい。 |

長い尺や粒子数の多いシーンでは、Automatic Pre-Rollによる再計算が操作の待ち時間を増やす場合があります。その場合はOFFにして、確認したい時刻で手動Pre-Rollを使います。「最初から粒子を画面内に置く」ためのPre-Generate Framesと、「飛ばしたフレームの状態を再計算する」Pre-Rollは目的が異なります。

### Sub-Frame Calculation Accuracy

1フレームの間に粒子の状態を何回計算するかを調整します。値を上げると、速く移動する粒子や強いForceによる動きの計算を細かくできますが、処理時間も増えます。

例として、pPoint Forceで粒子を一点へ強く引き寄せたとき、1フレームごとの位置更新だけでは目標点を行き過ぎる場合があります。まずForceのStrengthやLimit Forceを見直し、それでも時間方向の刻みが粗ければSub-Frame Calculation Accuracyを上げて比較します。**画像のぼかし量や書き出しfpsを変更する設定ではありません。**

## 2D出力の描画設定

以下は主に2D Output Mode向けの項目です。3Dモードの出力に同じ効果が現れるとは考えないでください。

### Only Render in Hi-Q

Hi-QがOFFのときだけ、Image系やBlob系の重いParticle Styleを軽いPoint表示に置き換えます。編集時に粒子の位置・動きを優先して確認し、完成に近い見た目を確認するときはHi-QをONにします。Point表示を最終的なStyle変更と取り違えないようにします。

### ViewとCamera Input

2DモードではViewメニューでScene (Perspective)、前・上・横からの正投影など、粒子を見る方向を選べます。Scene (Perspective)の視点はSceneタブ側で操作します。

Camera InputへCamera 3Dを接続した場合はView設定より接続したCameraの視点が優先されます。**3D Output ModeではViewの選択は無視されます。** なお2DモードのNode操作用オーバーレイは、表示したViewにかかわらず正面の正投影を基準に描かれるため、操作ハンドルの見え方と完成画像の視点が必ずしも一致しません。

### Blur・Glow・Blur Blend

粒子の2D画像を描く際に、ぼかしや発光、ぼかしの混合を加えます。たとえば小さな光点をpRenderで描き、輪郭を柔らかくしてから実写素材へ重ねられます。粒子の運動や寿命は変更しません。後段にBlurなどの別Nodeを置く方法もあり、Nodeごとの処理を分離したいときに有効です。

### Kill Particles That Leave the View

描画範囲から出た粒子を**削除**します。見えない粒子が増え続ける場面で計算を軽くできる可能性がありますが、後からForceによって画面内へ戻るはずの粒子も復帰しません。単なる一時的な非表示とは異なります。

### Generate Z BufferとDepth Merge Particles

Generate Z Bufferは粒子の深さをZチャンネルに書き出し、後段のDepth BlurやZ Mergeなどで利用できるようにします。ただしManualは描画時間が大きく増える可能性を指摘しています。Depth Merge Particlesは、単純なレイヤー順ではなく深度を使って粒子を合成する設定です。

深度処理が不要な通常の発光パーティクルなら、最初から両方を有効にせず、後段でZ情報が必要になった時点で検討します。

## Scene・Grid・Imageタブ

**SceneタブのZ Clip**は、カメラ手前のクリッピング面を設定し、近づきすぎた粒子が画面を大きく覆うのを防ぎます。2D描画時、粒子が不自然に画面全体へ広がる場合に確認する項目です。

**Gridタブ**は2D粒子を3D空間に配置するときの目印です。幅、奥行き、線数、色を調整できますが、グリッドは完成画像へ描き込まれません。また、これらのGridコントロールはアニメーションできません。3D Output Modeの粒子には適用されません。

**Imageタブ**には、2Dで描画する画像のWidth／Height、Pixel Aspect、Depthなどがあります。Use Frame Format SettingsをONにすると、コンポジションのFrame Format設定に画像サイズとPixel Aspectを合わせます。OFFなら独立した寸法を指定できます。Depthを浮動小数点形式にすれば、0〜1の範囲外の明るい値を保持するHDR処理が可能です。

同タブのSource Color Spaceは色情報のメタデータを付与・引き継ぐ指定であり、**それ自体でピクセルの色変換を実行しません**。Source Gamma SpaceにはGamma情報とカーブ処理の選択肢があります。色空間を実際に変換したい場合は、後段のGamut等を含めた処理経路を区別して考えます。

## 制作例

### 火花を実写へ重ねる

1. pEmitterで寿命の短い発光粒子を作り、pDirectionalForceで飛散方向を変えます。
2. pRenderを2Dに切り替え、動きの確認中は必要に応じてOnly Render in Hi-Qを使います。
3. pRenderの画像出力をMergeのForegroundへ、実写素材をBackgroundへ接続します。必要ならMergeの手前で色やGlowを調整します。

この例ではpRenderの役割は「飛ぶ粒子の位置を計算すること」ではなく、移動済みの粒子データを合成可能な画像にすることです。

### 開始フレームから煙が見えているカット

1. pEmitterで上昇する煙の粒子を作ります。最初のフレームだけでなく途中の時間にも粒子が蓄積する構成にします。
2. pRenderのPre-Generate Framesを増やし、カット冒頭の時点で既に煙が上空まで到達している状態を作ります。
3. 別の時刻へ移動して煙の位置が不自然なら、Automatic Pre-Rollか手動Pre-Rollで途中フレームの計算を揃えます。

Pre-Generate Framesは「粒子数を増やす」専用の設定ではなく、カット開始前の時間をシミュレーションへ与える設定です。

### 3Dセット内に粒子を置く

1. pEmitterで火の粉を作り、pRenderは既定の3D出力を使います。
2. pRenderの出力と3D背景オブジェクトをMerge 3Dへ接続し、Renderer 3Dで最終画像を作ります。
3. 3D側でカメラや描画の設定を整えます。pRender側の2D Blur／GlowやView設定だけを変えても、3Dシーンの完成画像は同じようには変わりません。

## 表示がおかしいとき

| 症状 | 確認すること |
| --- | --- |
| pEmitterがあるのに画像が出ない | pRenderが末尾にあり、Output Modeが接続先の2D／3Dデータ種類と一致しているか。 |
| フレームを飛ばすと粒子配置が変わる | Automatic Pre-Rollの状態。必要なら手動Pre-Rollで途中フレームを再計算する。 |
| 開始直後に煙が少ない | Pre-Generate Framesで開始以前の粒子状態を作る。 |
| 動きが大きく飛び越える | Force量とSub-Frame Calculation Accuracyを比較する。 |
| 2Dと3DでBlurやViewが違う | Output Modeを確認。描画系Inspector設定の多くは2D用。 |
| 画面外へ出た粒子が戻らない | Kill Particles That Leave the ViewがONになっていないか。 |
| Z Bufferを有効にすると処理が重い | 後段でDepth情報を使用するかを確認し、不要なら無効化する。 |

## 関連ページ

- [Particleノードの全体像](./index.md)
- [pEmitter](./p-emitter)
- [pDirectionalForce](./pdirectionalforce)
- [pPoint Force](./ppointforce)
- [pMerge](./pmerge)
- [パーティクル（Particle）](../../learn/02-data/particle)
- [フレーム評価](../../learn/05-time/frame-evaluation)
- [データ領域を辿って診断する](../../learn/07-debugging/trace-data-domain)

## 出典・確認範囲

- Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）, Chapter 114「Particle Nodes」pp.2678–2684。Input、Output Mode、Pre-Roll、View、2D描画・深度・Scene／Grid／Imageタブを確認。
- pPoint ForceのLimit Forceとフレーム間サンプリングの関係は同Chapter p.2678を参照。

NodeごとのInspector UIや描画負荷をResolve 21.1実機で測定した記事ではありません。Edition差、粒子Styleごとの厳密な描画結果、Renderer 3D側との細かな相互作用は未検証のため、verificationはpartialとしています。
