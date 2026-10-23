---
title: パーティクル（Particle）
description: FusionのParticle setを、2D Imageとは別の「多数のparticle状態を保持するデータ」として理解し、pEmitterからpRenderまでの流れを読む。
doc_type: concept
term_id: particle-data
term_short: pEmitterやparticle modifierが扱い、pRenderで2D Imageまたは3D出力へ変換するparticle状態の集合。
verification: partial
aliases: [Particle, Particle set, particle data, パーティクル]
concepts: [particle-set, data-domain, frame-evaluation]
nodes: [pEmitter, pRender, pMerge]
tasks: [particles, debug, choose-node]
prerequisites: [image-data, typed-connections]
level: intermediate
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-23"
---

# パーティクル（Particle）

FusionのParticle setは、雨粒や火花の見た目を描いたImageそのものではありません。各particleの位置・速度・寿命・回転・size・colorなどの状態をまとめて保持し、particle系Nodeの間で受け渡すデータです。

## 基本の流れ

最小構成は次です。

```text
pEmitter → pRender
```

pEmitterがparticleを生成し、pRenderがparticle systemを2D Imageまたは3D出力へ変換します。

pEmitterとpRenderの間へforceやbehavior Nodeを追加すると、Particle setのまま動きや状態を変更できます。

```text
pEmitter → pDirectionalForce → pFriction → pRender
```

## Particle setと2D Imageの違い

pEmitterの出力はViewerへ直接表示する通常のRGBA Imageではありません。

Particle setには「どこにいるか」「どの方向へ動くか」「何frame存在するか」といった状態があります。そのため通常のBlurやColor Correctorは、pRenderでImageへ変換した後に使います。

```text
pEmitter → pTurbulence → pRender → Blur → Merge
            Particle       ↑        Image
              set          └ domain boundary
```

## Particleを作る

- **pEmitter** — Number、Lifespan、Velocity、Angle、Rotation、Spin、Style、Region等でparticleを生成する。
- **pImage Emitter** — 2D Imageのpixel情報を元にparticleを生成する。
- **pSpawn** — 既存particleから新しいparticleを生成する。

## Particleを変える

Particle setの途中へNodeを挟み、状態を変えます。

- **pDirectionalForce** — 一定方向へforceを加える。gravity用途。
- **pFriction** — velocity / spinを減衰する。
- **pTurbulence** — 不規則なmovementを加える。
- **pVortex** — 渦状のforceを加える。
- **pBounce** — regionとのinteractionでmovementを変える。

この段階ではまだ2D Imageへ変換されていません。

## Particle streamをまとめる

pMergeは2つのParticle streamを1つへまとめます。

```text
pEmitter A ─┐
            ├─ pMerge → pRender
pEmitter B ─┘
```

各Emitterで割り当てたParticle Setは保持されるため、pMerge後でもdownstream Nodeから特定Setだけを対象にできます。

## pRenderで表示可能な結果へ変える

pRenderはparticle chainのrender boundaryです。

### 2D Output

2D modeでは通常の2D Imageを出力し、Merge等へ接続できます。

```text
pEmitter → pRender (2D) → Merge
```

<!-- capture-reuse:R10 -->
#### 実機の参考例：Particle setを2D画像にする

pEmitterのParticle setをpRenderの2Dモードで画像化し、フレーム48に蓄積した白いBlob粒子を表示しています。赤い円は編集用Controlです。

[![S09の実機撮影：Particle setを2D画像にするの接続](/img/fusion/captures/S09/graph.png)](/img/fusion/captures/S09/graph.png)

[![S09の実機撮影：Particle setを2D画像にするの表示結果](/img/fusion/captures/S09/result.png)](/img/fusion/captures/S09/result.png)

Resolve Studio 21.1.0.14／Windowsで撮影したS09の固定例を再掲しています。[撮影条件と確認範囲](/img/fusion/captures/S09/capture.json)で元の設定を確認できます。

### 3D Output

pRenderの既定は3D outputです。3D particle systemをMerge 3D等へ渡し、Renderer 3Dで2D Imageへ変換できます。

```text
pEmitter → pRender (3D) → Merge 3D → Renderer 3D → Image
```

したがって、pRenderは必ず2D Image化するNodeではありません。2D / 3Dの出力を選ぶ境界です。

## 実例：落下する粒子を映像に重ねる

雨や火花を背景映像へ重ねる場合も、**粒子の動きを計算する段階**と、**映像として合成する段階**を分けます。ここでは2D出力を使います。

```text
pEmitter → pDirectionalForce → pRender［Output Mode: 2D］ ─┐
                                                         ├→ Merge → MediaOut
MediaIn（背景映像） ──────────────────────────────────────┘
```

1. **pEmitter**で粒子を発生させ、出力を**pDirectionalForce**のオレンジのParticle入力へ、さらに**pRender**のParticle入力へ接続します。途中では画像ではなく粒子の状態が受け渡されます。
2. **pDirectionalForce**は、粒子へ一定方向の力を加えます。既定の方向はY軸の下向き（Directionが-90度）なので、まずStrengthを調整して落ちる動きを確認します。粒子そのものの放出方向・速さはpEmitter側の設定にも依存します。
3. **pRender**のInspectorで**Output Modeを2D**にします。このとき初めて、後段の通常の2D Mergeへ渡せる画像になります。pRenderをViewerに表示し、粒子の形や動きを確認します。
4. **MediaIn**をMergeのBackground入力、pRenderの2D出力をForeground入力へつなぎます。粒子の色や透明度を含むImageを背景映像へ重ねられます。

3Dシーン内のカメラや物体と一緒に粒子を扱いたいなら、pRenderを3D出力にし、**Merge 3D → Renderer 3D**を経由して2D Imageへ変換します。**pRenderは出力モードによって接続先が変わる**ため、単に「線がつながらない」ときは出力モードも確認します。

## 時間を飛ばしたときの計算とPre-Roll

粒子の位置は、そのフレームの設定値だけで決まるとは限りません。誕生した時点から前のフレームまでに、速度・力・寿命などがどのように作用したかが影響します。そのため、**フレーム0から順に再生した結果と、途中のフレームへ一気に移動した結果が一致しない**ことがあります。

1. **pRenderのPre-Roll**は、レンダー範囲の開始から現在フレームまで粒子の状態を再計算します。フレームを大きく飛ばして表示がおかしくなったら、まずこの操作で確認します。
2. **Automatic Pre-Roll**を有効にすると、再生位置を飛ばした際にも自動で再計算します。軽い構成では便利ですが、粒子が多く長尺の場合は計算に時間がかかるため、必要時だけ手動Pre-Rollする方法もあります。
3. **Pre-Generate Frames**はPre-Rollとは別で、最初の有効フレームより前の状態をあらかじめ生成します。たとえば開始フレームから煙がすでに立ち上っている映像を作る用途です。

pRenderの**Restart**は現在位置で粒子の計算を最初からやり直す操作で、過去からの動きを正しく再現するPre-Rollとは異なります。位置がずれた際に無条件でRestartせず、前後のフレームを再計算したいのか、現在位置から新しく発生させたいのかで使い分けます。

## よくある誤解

**pEmitterをViewerへ出せば見える。**  
pEmitterはParticle setを出力するため、表示にはpRenderが必要です。

**Particleは点を描いたImageである。**  
Particle setは位置・velocity・age・rotation等の状態を持つデータで、表示用Imageはrender段階で生成されます。

## 関連Node

- [Particleノード](../../nodes/particles/)
- [pEmitter](../../nodes/particles/p-emitter)
- [pRender](../../nodes/particles/p-render)
- [pMerge](../../nodes/particles/pmerge)

## 次に読む

→ [最小Particle chainを作る](../../recipes/particles/basic-particle-chain)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（2026年9月）を参照しました。

- Chapter 114 pp.2646–2647：pEmitterとpRenderがParticle chainに必要であること。
- 同pp.2658–2659：pDirectionalForceの入力、Direction、Strengthと下向きの既定方向。
- 同pp.2678–2679：pRenderのParticle / Camera / Effect Mask入力、Output Mode（2D / 3D）、Merge・Merge 3Dとの接続。
- 同pp.2680–2681：粒子状態の時間依存、Restart、Pre-Roll、Automatic Pre-Roll、Pre-Generate Framesの使い分け。
- Fusion Fundamentals Chapter 86：Particle systemの基礎。

内部particle representation、全attribute、実機性能は未確認です。
