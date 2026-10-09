---
title: pChangeStyle
description: 指定regionを通過するParticleのStyleやSet assignmentを途中から変更するParticle Style Node。
doc_type: node
term_id: pchangestyle
term_short: pChangeStyleは、particleがregionへ入ったときに見た目やSetを変更するNode。
verification: partial
aliases: [pChangeStyle, pChange Style, pCS]
concepts: [particle-data, particle-region]
nodes: [pChangeStyle]
node_family: particles
controls: [Random Seed, Change Sets, Style, Conditions, Region]
inputs: [particle, region]
outputs: [particle]
tasks: [particles, change-style, event]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-04"
---

# pChangeStyle

pChangeStyleは、<Term id="particle-data">Particle</Term>が指定regionへ入ったとき、見た目やSet assignmentを変更するNodeです。

多くのParticle Nodeがmovementを変えるのに対し、pChangeStyleはparticleのappearanceを途中から変える用途が中心です。

## 入力

オレンジ色のParticle inputへ前段Particleを接続します。

Region tabをBitmap / Meshへするとregion inputが追加され、style changeを起こす範囲を定義できます。

## 主な設定

### Change Sets

particleのSet assignmentを変更します。

後段Forceを別Setだけへ作用させる構成へ切り替えるときに使えます。

### Style

pEmitterのStyle tabに近いControlでparticle appearanceを変更します。

色・size・bitmap style等、Style側で扱う属性をevent後に切り替えられます。

## Node順が重要

pChangeStyleとcollision系Nodeで同じRegionを使う場合、pChangeStyleを**eventを起こすNodeより前**へ置く必要があることがあります。

Manualの例では、pBounceより後ろへpChangeStyleを置くと、particleは先にbounceしてRegionから離れるため、pChangeStyleがintersectionを検出できません。

```text
pEmitter → pChangeStyle → pBounce → pRender
              ↑             ↑
              └── same Region
```

## 運用例

床へ当たったparticleの色を変える場合:

1. pChangeStyleとpBounceへ同じRegionを設定します。
2. pChangeStyleをpBounceより前へ置きます。
3. Styleでcollision後に見せたいColor / appearanceを設定します。
4. pBounceで反射させます。

## 関連Node

- [pBounce](./pbounce)
- [pEmitter](./p-emitter)
- [pCustom](./pcustom)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 114 pp.2651–2652で、RegionによるStyle change、Change Sets、Node順の公式例を確認しました。

Style共通Controlの全項目は個別に未展開です。
