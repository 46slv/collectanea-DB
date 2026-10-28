---
title: pMerge
description: 2本のParticle streamを統合し、Setを保持したまま共通のForceやpRenderへ渡すノード。統合の前後で処理を分ける方法を解説する。
doc_type: node
term_id: pmerge
term_short: pMergeは、2本のParticle streamを1本にまとめるノード。
verification: partial
aliases: [pMerge, pMg]
concepts: [particle-data]
nodes: [pMerge]
node_family: particles
inputs: [particle, particle]
outputs: [particle]
tasks: [particles, merge-particles]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pMerge

**pMerge [pMg]は、別々に作った2本のParticle stream（粒子の流れ）を1本にまとめるノード**です。たとえば火花と煙を別々のpEmitterで発生させ、1つのpRenderで表示したい場合に使います。

Fusionでいう<Term id="particle-data">Particle stream</Term>は、粒子の位置・速度・寿命・色などの情報を渡すデータで、まだ2D画像ではありません。pMergeは画像を重ねるのではなく、**2つの粒子の集合を統合**します。基礎から確認したい場合は[パーティクル（Particle）](../../learn/02-data/particle)を参照してください。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| Particle 1（橙） | Particle | 1本目のParticle streamを受け取る |
| Particle 2（緑） | Particle | 2本目のParticle streamを受け取る |
| Output | Particle | 両方を含む1本のParticle streamを後段へ渡す |

**2つの入力はどちらもParticle用**です。端子色は橙と緑ですが、通常の2D MergeにあるForeground／Backgroundのような違いはありません。[pEmitter](./p-emitter)や、Forceなどを通したParticle出力を接続します。2D Imageを直接重ねる端子ではありません。

~~~text
pEmitter A ─┐
            ├→ pMerge → pRender
pEmitter B ─┘
~~~

後段のParticleノードは、AとBがまとまった1本のstreamを受け取ります。pMerge自身は粒子を新しく生成せず、色や動きを変えるInspector Controlも持ちません。**pMerge固有の設定項目はありません。**

出力は引き続きParticleデータです。表示するには[pRender](./p-render)へ渡して2D Imageまたは3D側の出力へ変換します。

## 統合前と統合後で処理が変わる

pMergeをどこに置くかで、特定の流れだけを処理するのか、両方へ同じ処理をするのかが変わります。

### 統合前：それぞれ異なる動きを付ける

~~~text
pEmitter A → pTurbulence ─┐
                          ├→ pMerge → pRender
pEmitter B → pFriction ───┘
~~~

Aの粒子には[pTurbulence](./pturbulence)で不規則な動きを加え、Bには[pFriction](./pfriction)で速度の減衰を加えます。これらは**pMergeより前の流れだけ**に作用します。統合後は、別々に調整した粒子をまとめて描画できます。

### 統合後：同じForceを共有する

~~~text
pEmitter A ─┐
            ├→ pMerge → pDirectionalForce → pRender
pEmitter B ─┘
~~~

[pDirectionalForce](./pdirectionalforce)は統合済みの粒子を受け取ります。条件で絞らなければ、AとBの両方が同じ方向の力を受けます。別々の粒子を同じ風や重力で動かしたいときの構成です。

3本以上のstreamをまとめる場合は、2入力のpMergeを複数段つなぎます。

~~~text
pEmitter A ─┐
            ├→ pMerge 1 ─┐
pEmitter B ─┘             ├→ pMerge 2 → pRender
pEmitter C ───────────────┘
~~~

<!-- capture:S307 -->

## 実機例：2系統の粒子をまとめる

赤と青の `pEmitter` を `pMerge` のParticle 1とParticle 2へ接続し、`pRender` の2D出力を `MediaOut` に送ります。48フレームでは両方の粒子群が表示されました。

Setの保持や3D出力はこの例では確認していません。[接続と設定の記録](/img/fusion/captures/S307/readback.json)に条件を記載しています。

[![2つのpEmitterをpMergeに接続しpRenderとMediaOutへ送る構成](/img/fusion/captures/S307/graph.png)](/img/fusion/captures/S307/graph.png)

2系統の粒子をpMergeに入力します。

[![pMergeのInspectorにコントロールがない画面](/img/fusion/captures/S307/controls.png)](/img/fusion/captures/S307/controls.png)

このpMergeのInspectorに調整コントロールは表示されません。

[![赤と青の粒子群を表示した2D出力](/img/fusion/captures/S307/result.png)](/img/fusion/captures/S307/result.png)

赤と青の粒子群を同じViewerへ表示します。

[![pRenderのInspectorと2D出力設定](/img/fusion/captures/S307/render-controls.png)](/img/fusion/captures/S307/render-controls.png)

pRenderの2D出力を使用します。

[再現用Graph](/img/fusion/captures/S307/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S307/capture.json)

<!-- /capture:S307 -->

## 制作例1：火花と煙を一緒に表示する

火花と煙を異なる見た目・速度で発生させ、1枚の2D映像として背景へ重ねる例です。

~~~text
pEmitter（火花）─┐
                 ├→ pMerge → pRender（2D）─┐
pEmitter（煙）───┘                         ├→ Merge → MediaOut
背景映像（MediaIn）──────────────────────┘
~~~

1. 2つの[pEmitter](./p-emitter)を作ります。火花側は短い寿命と速い初速、煙側は長い寿命と遅い動きなど、異なる設定にします。
2. それぞれのParticle出力をpMergeのParticle 1／2へ接続します。発生量や見た目は各pEmitterで調整します。
3. pMergeの出力をpRenderへ接続し、**Output Modeを2D**にします。ここで両方の粒子が画像として描画されます。
4. pRenderの画像を通常の[Merge](../compositing/merge)のForegroundへ、背景映像をBackgroundへ接続します。

火花だけを減速したい場合は火花側のpEmitterとpMergeの間にpFrictionを挿入します。両方に同じ風を加えたい場合は、pMergeの後ろにpDirectionalForceを置きます。**どの粒子に処理を適用するか**が配置の判断基準です。

## 制作例2：統合後もSetで処理を分ける

pMergeは、粒子が作られたときに割り当てられた**Set情報を保持**します。Setは粒子をグループとして識別する番号で、見た目を示すStyleとは別です。統合後でも、後段ノードの**Conditions**で対象Setを指定できます。

~~~text
pEmitter A（Set 1）─┐
                    ├→ pMerge → pDirectionalForce（Set 2のみ）→ pRender
pEmitter B（Set 2）─┘
~~~

1. AのEmitterにSet 1、BにSet 2を割り当てます。
2. 両方をpMergeへ接続します。2つのSetが同じstreamに入っても、**Set番号は保持されます**。
3. 後段のpDirectionalForceの**Conditions**で、Set Modeを**Affect Specified Sets**、Set #を**2**にします。
4. pRenderで動きを比べます。Forceの向きと強さを明確にすると、Set 2だけに作用しているか確認しやすくなります。

**pMergeがSet番号を自動で振り直すわけではありません。** AとBが同じSetなら、統合後にその番号だけで発生元を区別できません。区別したいときはEmitterで異なるSetを割り当てます。途中でSetを変更したい場合は[pChangeStyle](./pchangestyle)も使えます。

## 制作例3：3Dシーンへ組み込む

Particleを3Dシーンの物体と組み合わせる場合も、pMergeの出力はまだParticleです。

~~~text
pEmitter A ─┐
            ├→ pMerge → pRender（3D）─┐
pEmitter B ─┘                        ├→ Merge 3D → Renderer 3D → Merge（2D）
Shape 3D ────────────────────────────┘
~~~

pRenderの**3D出力**で粒子をClassic 3Dシーン側のデータへ変換し、[Merge 3D](../3d/merge-3d)でShape 3Dなどとまとめます。[Renderer 3D](../3d/renderer-3d)を通して初めて2D画像として合成できます。

pMergeとMerge 3Dは名前が似ていますが、入力するデータが異なります。pMergeのParticle出力をそのまま2D MergeやMerge 3Dへ渡すものではありません。

## 似たノードとの違い

| ノード | 入力 | 出力 | 用途 |
| --- | --- | --- | --- |
| **pMerge** | Particle × 2 | Particle | 異なるEmitterの粒子を後段でまとめて処理・描画する |
| [Merge](../compositing/merge) | 2D Image | 2D Image | 前景と背景の画像を合成する |
| [Merge 3D](../3d/merge-3d) | Classic 3Dの物体・シーン | Classic 3Dシーン | 物体・カメラ・ライトを3D空間へ集める |

pMergeは**粒子を統合する段階**、pRenderは**粒子を描画可能な結果へ変換する段階**、通常のMergeは**描画済み画像を重ねる段階**です。

## うまく動かないとき

- **片方の粒子が見えない**：2本ともParticle入力に接続したか、各pEmitterで発生しているか確認します。片方ずつpRenderへ直結して表示を比べると、原因を切り分けられます。
- **両方の粒子が同じ動きになる**：ForceをpMergeの後ろへ置くと統合済みの両方に作用します。片方だけなら統合前へ移すか、後段のConditionsでSetを限定します。
- **Setを指定しても分かれない**：Emitter側のSet割り当てと、後段のSet Mode／Set #を確認します。
- **Viewerに出ない／2D Mergeへつながらない**：pMergeはImageを出しません。pRenderを接続し、2D合成ならOutput Modeを2Dにします。
- **再生位置によって状態が違う**：Particleは前フレームの状態に依存します。[pRender](./p-render)のPre-Rollなどを確認し、連続再生でも再現するか切り分けます。

## 出典と確認範囲

- **DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 114「Particle Nodes」、**p.2676**：Particle 1／2の端子色・データ型、Controlなし、Set保持、後段への接続。
- 同マニュアル Chapter 86「Particle Systems」、**pp.1891–1897**：複数Emitterの統合、Force、pRenderを使った描画。
- 同マニュアル Chapter 114「Conditions」、**pp.2697–2699**：Setを利用した処理対象の限定。

本文の火花・煙などの例は、公式の接続仕様を基にした**構成例**であり、実機で同じ見た目を再現した検証記録ではありません。現在のResolve 21.1での性能やEdition差は未確認のため、verificationはpartialです。
