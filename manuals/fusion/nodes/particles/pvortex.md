---
title: pVortex
description: Particleに回転する力を与え、渦へ引き込まれるような動きを作るFusionのParticleノード。
doc_type: node
term_id: pvortex
term_short: pVortexは、Particleに回転する力を加えて渦状の動きを作るノード。
verification: partial
aliases: [pVortex, pVt]
concepts: [particle-data, particle-region]
nodes: [pVortex]
node_family: particles
controls: [Random Seed, Strength, Power, Offset XYZ, Size, Angle X, Angle Y, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, vortex, spiral]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# pVortex

pVortexは、<Term id="particle-data">Particle</Term>に回転する力を加え、渦に引き込まれるような軌道を作るノードです。粒子を新しく発生させるノードではありません。pEmitterなどで作った粒子の動きを変え、その結果を後段へ渡します。

砂ぼこりが巻き上がる動き、渦へ集まる光点、旋回する火花などに利用できます。Particleは途中では普通の2D画像ではなく、位置や速度などの情報を持つ粒子の集合です。映像として表示するには通常、最後にpRenderを通します。詳しくは[Particleの基礎](../../learn/02-data/particle)と[Particleノード一覧](./index.md)を参照してください。

## 入力と出力

| 接続 | 受け渡すもの | 役割 |
| --- | --- | --- |
| Input（橙） | Particle | pEmitterなどから来た粒子を受け取り、渦の力を加える |
| Region（条件付き） | 2D Imageまたは3D Mesh | 力が作用する範囲を外部の画像・形状で指定する |
| Output | Particle | 力の影響を受けた粒子を次のParticleノードまたはpRenderへ渡す |

Region入力は常に表示されるわけではありません。Inspectorの**Region**で**Bitmap**または**Mesh**を選択すると現れます。Bitmapでは画像の選択したチャンネル、Meshでは3D形状を作用範囲の指定に使います。入力の色は選択状態によって緑またはマゼンタになります。どちらも通常のParticle入力とは別の接続です。

## 基本の接続

```text
pEmitter → pVortex → pRender
```

1. **pEmitter**で粒子を発生させます。発生範囲と初速を調整すると、渦の影響を見分けやすくなります。
2. **pVortex**で回転する力を加えます。まずStrengthで変化の大きさを確認し、PowerやSizeを調整します。
3. **pRender**で粒子の状態を画像または3Dの結果として確認します。2D合成に使う場合は、pRenderの出力設定も確認してください。

pVortexの前後で動きを比較すると、粒子の発生設定による動きと、渦の力による変化を区別できます。

## 主なInspector設定

### Strength

各粒子へ加える渦の力の強さです。動きが弱く見える場合は、粒子が力の作用範囲に入っているかも確認してください。Strengthだけを大きくしても、発生位置や粒子の初速によって見え方は変わります。

### Power

渦の力が距離に応じてどの程度弱まるかを調整します。外側の粒子まで巻き込むか、近い粒子を中心に動かすかを調整するときに使います。距離減衰の厳密な式と値ごとの数値挙動は、参照したマニュアルでは示されていません。

### X / Y / Z Offset

マニュアルでは、渦が影響を受ける粒子へ加えるオフセット量として説明されています。元記事の「渦の中心位置を移動する」という説明は、21.1の記述だけでは裏付けられないため、その意味に限定しません。各軸を個別に動かし、Viewerで軌道の変化を確認してください。

### Size

渦の力のSizeを設定します。21.1マニュアルは「Vortex ForceのSize」と説明しますが、距離単位や影響境界、Strength・Powerとどのように組み合わされるかまでは示していません。Sizeの効果を調べるときは、StrengthとPowerを固定し、同じ位置から放出した粒子の軌道を比較します。

### Angle X / Angle Y

マニュアルでは、X軸・Y軸に沿って渦が加える回転力を調整する設定として説明されています。単に「渦全体の向きを回す角度」とは断定できないため、必要な回転軸を探すときは各値を一つずつ動かして比較します。

### Random Seed / Randomize

ランダムな結果を扱うノードに共通する設定です。同じSeedで同じランダム結果を得られるようにし、Randomizeで別のSeedを選べます。すべてのParticleが必ずランダム軌道になる、という意味ではありません。

### 粒子の見た目を変える場合

pVortexは粒子の**動き**を変えるノードで、粒子の色・形・サイズを設定するためのノードではありません。21.1マニュアルのpVortex個別節（p.2692）は共通項目として**Conditions・Region・Settings**を挙げ、Styleは含めていません。共通Style節（pp.2692、2701）も対象をpEmitter・pSpawn・pChangeStyle・pImage Emitterの4種類としています。一方、同章にはStyleを粒子ノード全般の共通タブとする記述もあり、マニュアルだけからすべての実機UIを断定することはできません。

粒子の見た目を変える場合は、発生時の[pEmitter](./p-emitter)か、途中で属性を変更する[pChangeStyle](./pchangestyle)を使います。pVortexのRegionに接続した画像は**作用範囲の指定**であり、粒子の絵柄になるわけではありません。

## 作用する粒子・範囲を絞る

**Conditions**は「どの粒子にこの力を作用させるか」を指定します。たとえばStart/End Ageを使えば、発生直後は直進させ、寿命の後半だけ渦に巻き込む構成を作れます。Set Modeでは、pEmitterなどで割り当てた粒子のSet番号に応じて対象を分けられます。Probabilityは粒子ごと・フレームごとに作用確率を評価するため、特定の粒子をずっと固定して選ぶための機能ではありません。

**Region**は「どこでこの力を作用させるか」を指定します。たとえばBitmapを選び、白い部分と黒い部分が分かれた画像をRegion入力へ接続すると、選択した画像チャンネルを使って作用範囲を制御できます。粒子の色や見た目をそのBitmapから直接作る機能ではありません。

<!-- capture:S315 -->

## 実機例：pVortexを粒子へ接続する

`pEmitter` から `pVortex` を通して `pRender` の2D出力へ接続します。Strengthを0.1、Sizeを0.5に設定し、24フレームと48フレームの表示を記録しました。緑の円はViewer上の操作表示、透明市松は背景表示です。

評価開始条件を揃えた軌道比較や回転方向は確認していません。[接続と設定の記録](/img/fusion/captures/S315/readback.json)に条件を記載しています。

[![pEmitterからpVortexとpRenderへ接続した構成](/img/fusion/captures/S315/graph.png)](/img/fusion/captures/S315/graph.png)

粒子をpVortexへ入力します。

[![pVortexのStrength、Power、Sizeと中心位置の設定](/img/fusion/captures/S315/controls.png)](/img/fusion/captures/S315/controls.png)

Strengthを0.1、Sizeを0.5に設定します。

[![48フレームの粒子表示とViewerの円形操作表示](/img/fusion/captures/S315/result48.png)](/img/fusion/captures/S315/result48.png)

48フレームの表示です。緑の円はViewer操作表示です。

[![24フレームの粒子表示とViewerの操作表示](/img/fusion/captures/S315/result24.png)](/img/fusion/captures/S315/result24.png)

24フレームの表示です。

[再現用Graph](/img/fusion/captures/S315/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S315/capture.json)

<!-- /capture:S315 -->

## 制作例

### 光点を渦へ巻き込む

```text
pEmitter → pVortex → pRender (2D)
```

pEmitterで画面内の広い範囲に小さな粒子を発生させます。pVortexを挟んだ段階で、StrengthとPowerを順に調整し、離れた粒子の軌道がどの程度変わるか確認します。次にSizeとAngle X/Yを調整し、求める旋回の形を作ります。最後にpRenderを2Dにして背景映像へMergeすれば、渦に巻き込まれる光点の演出になります。

渦の中心へ強く集める動きが必要なら、[pPointForce](./ppointforce)を併用する構成も検討できます。pPointForceは指定した点への引力・斥力を担当し、pVortexは回転する力を担当するため、調整する役割が異なります。

### 特定の場所だけ煙を巻き上げる

```text
pEmitter → pTurbulence → pVortex → pRender
                           ↑
                 Region: Bitmap画像
```

pEmitterで煙の粒子を作り、[pTurbulence](./pturbulence)で不規則な揺れを付けます。pVortexではRegionをBitmapにして、渦を起こしたい場所を示す画像をRegion入力へ接続します。これにより、煙全体を一様に旋回させるのではなく、指定領域に入った粒子へ渦の力を加える構成にできます。

煙が見えない場合は、Particleの発生範囲とRegion画像の位置、選択チャンネル、pRenderの出力を別々に確認します。Region画像はParticleそのものではないため、橙のInputへ接続しないでください。

### 粒子が成長した後だけ旋回させる

pEmitterで生まれた粒子を最初はそのまま飛ばし、pVortexのConditionsで寿命後半の粒子だけを対象にします。舞い上がった火花が途中から渦へ巻き込まれる動きなどに使えます。寿命の最後の20%だけを対象にするなら、**Start Ageを0.8、End Ageを1.0**にします。必要なら前段に[pDirectionalForce](./pdirectionalforce)を置き、上昇方向の力と渦の力を別々に調整します。

### ある領域を通った粒子だけ渦に巻き込む

```text
pEmitter（Set 1）→ pChangeStyle（RegionでSet 2へ変更）
                → pVortex（Conditions：Set 2のみ）→ pRender
```

pEmitterでSet 1の粒子を発生させます。[pChangeStyle](./pchangestyle)ではRegionをBitmapにし、白い部分と透明部分が分かれた画像を追加のRegion入力へ接続します。**Change Sets**を使って、その領域に入った粒子をSet 2へ変更します。続くpVortexではConditionsの**Set ModeをAffect Specified Sets**にし、**Set 2**を有効にします。

この構成は、pVortexのRegionだけで「**現在その場所にいる粒子**」へ力を加える方法とは異なり、前段で変更したSetを使って**後段の処理対象**を選びます。違いを確認するにはpVortexのRegionをいったん制限せず、Set条件だけで軌道が分かれるかを比べてください。Setを変えたいだけならpChangeStyleで色まで変更する必要はありません。

## 関連ノードと使い分け

| ノード | 主に何を変えるか | pVortexと組み合わせる場面 |
| --- | --- | --- |
| [pPointForce](./ppointforce) | 特定の点へ引き寄せる／遠ざける | 集まる位置をより明確にしたい |
| [pTurbulence](./pturbulence) | 不規則な力で動きを乱す | 渦の軌道に煙のような揺れを重ねたい |
| [pGradientForce](./pgradientforce) | 画像のAlpha勾配から力の方向を作る | 渦とは別に、画像で設計した方向へ粒子を流したい |
| [pRender](./p-render) | Particleを描画可能な結果へ変える | 最終的な画像・3D出力を確認したい |

複数の力を重ねた結果は、各ノードの設定やParticleの状態によって変わります。まず一つずつ有効にし、どの力が軌道へ作用したかを確かめると調整しやすくなります。

## 期待した動きにならないとき

- **粒子が表示されない**：橙色のParticle入力がpEmitterなどに繋がっているか、末端のpRenderが意図した2D／3D出力になっているかを確認します。pVortex自身は画像を描画しません。
- **Strengthを上げても旋回しない**：PowerとSizeだけで判断せず、pEmitterの発生位置・初速とpVortexのRegionを確認します。まずRegionやSetによる絞り込みを外し、pVortexの有無で軌道を比較します。
- **一部の粒子しか動かない**：ConditionsのProbability、Start/End Age、Set ModeとSet番号を確認します。Probabilityは粒子ごとに毎フレーム判定されるため、結果が一定の粒子に固定されるわけではありません。
- **BitmapのRegionが効かない**：Region ModeがBitmapになっているか、追加された入力へ2D Imageを渡したか、判定に使用する画像チャンネルが適切かを確認します。Particleの主入力へ画像を差してもRegionの指定にはなりません。

## 出典・バージョンと未確認事項

- **一次資料**：*DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 114「Particle Nodes」、pp.2690–2692（pVortexの入出力、Strength、Power、Offset、Size、Angle）、pp.2692、2701（Styleタブの対象）、pp.2697–2701（共通Conditions / Region）。
- **対象**：DaVinci Resolve 21.1のFusionページ。上記資料に記載されたノードの説明として整理しています。
- **未確認**：内部の力の計算式、各設定の既定値と厳密な数値範囲、OffsetとAngleの軸別挙動、実機でのパフォーマンス、Edition間の差。これらを21.1で実測済みとは扱いません。
