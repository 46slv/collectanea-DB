---
title: 最小Particle chainを作る
description: pEmitterでParticle setを作り、pRenderで2D Imageへ変換してViewer / Mergeへ渡す最小Recipe。
doc_type: recipe
verification: partial
aliases: [basic particles, particle chain]
concepts: [particle-data, data-domain, frame-evaluation]
nodes: [pEmitter, pRender]
tasks: [particles, emit, render]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
updated: "2026-10-04"
---

# 最小Particle chainを作る

## できあがるもの

pEmitterで<Term id="particle-data">Particle set</Term>を作り、pRenderで2D Imageへ変換してViewerやMergeへ渡します。

```text
pEmitter → pRender (2D) → Merge / Viewer
```

## 手順

1. pEmitterを追加します。
2. pEmitterをpRenderへ接続します。
3. pRenderのOutput Modeを2Dへします。
4. pRenderをViewerへ表示します。
5. pEmitterのNumberを変え、particle数が変わることを確認します。
6. Lifespanでparticleが残る時間を決めます。
7. Velocity / Angleで初期movementを作ります。
8. 必要になった段階でpEmitterとpRenderの間へForce / Behaviorを追加します。

## なぜpRenderが必要か

pEmitterは2D ImageではなくParticle setを出力します。

pRenderがParticle setをImageへ変換するため、pEmitterを直接BlurやMergeへつなぐ構成にはしません。

## movementを追加する

gravityを加える場合:

```text
pEmitter → pDirectionalForce → pRender
```

不規則な動きを加える場合:

```text
pEmitter → pTurbulence → pRender
```

複数のbehaviorを足す場合も、pRenderまでParticle set domainを保ちます。

## frameを飛んだとき結果がおかしい場合

Particle systemは前frameのstateに依存します。

current frameを大きくjumpした後にparticle位置が不自然なら、pRenderのPre-RollまたはAutomatic Pre-Rollを使い、render range先頭から現在frameまでstateを再計算します。

## shot開始時からparticleを存在させる

pRenderのPre-Generate Framesを使います。

煙がframe 0で発生し始めるのではなく、最初から画面内へ立ち上がっている状態にしたい場合に使えます。

## 3Dへ進む場合

pRenderのOutput Modeを3Dにすると、Classic 3D sceneへ渡せます。

```text
pEmitter → pRender (3D) → Merge 3D → Renderer 3D
```

2D Mergeへ直接つなぐ構成とはdomainが異なります。

## うまくいかないとき

- pRenderが後段にあるか。
- pRenderのOutput Modeが2D / 3Dのどちらか。
- Numberが0になっていないか。
- Lifespanが短すぎないか。
- 現在frameでparticleが存在するか。
- frame jump後ならPre-Rollが必要ではないか。
- RegionやConditionsでparticleが全て除外されていないか。

## 関連Node

- [pEmitter](../../nodes/particles/p-emitter)
- [pRender](../../nodes/particles/p-render)
- [pDirectionalForce](../../nodes/particles/pdirectionalforce)
- [pTurbulence](../../nodes/particles/pturbulence)
- [Particleノード](../../nodes/particles/)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2646–2699とFusion Fundamentals Chapter 86のsimple particle systemを基にしています。

実機performanceは未確認のため `verification: partial` を維持します。
