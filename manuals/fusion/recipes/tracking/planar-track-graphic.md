---
title: 平面をtrackしてgraphicへ適用する
description: Planar Trackerで平面の動きを解析し、Planar Transformへ分けてgraphicを追従させる基本Recipe。
doc_type: recipe
verification: partial
aliases: [planar track graphic, screen replacement]
concepts: [tracking, coordinate-space]
patterns: [solve-then-apply-track]
nodes: [Planar Tracker, Planar Transform, Merge]
tasks: [track, attach-graphics, screen-replace]
prerequisites: [data-domain]
level: intermediate
product_scope: fusion
updated: "2026-10-04"
---

# 平面をtrackしてgraphicへ適用する

## できあがるもの

footage内の看板・壁・画面などの平面を解析し、replacement graphicへ同じperspective movementを適用します。

```text
Footage → Planar Tracker
               ↓ Create Planar Transform

Graphic → Planar Transform → Merge
```

## 必要なもの

- planar surfaceを含むfootage
- <Term id="planar-tracker">Planar Tracker</Term>
- replacement graphic
- <Term id="planar-transform">Planar Transform</Term>
- Merge

## 手順

1. footageをPlanar TrackerのBackgroundへ接続します。
2. Operation ModeをTrackにします。
3. planeが見やすいframeをReferenceとしてSetします。
4. Viewerで解析するplaneをclosed polygonとして囲みます。
5. Motion TypeとTrack Channelを確認します。
6. Reference frameから前後へ解析します。
7. Steady modeへ切り替え、planeがずれないか確認します。
8. Track modeへ戻し、Create Planar Transformを押します。
9. graphicをPlanar Transformへ接続します。
10. Planar Transformの出力をMergeのForegroundへ接続します。
11. graphic固有の位置・大きさは別段階で調整します。

## Reference frame

planeが大きく、輪郭やtextureを読み取りやすいframeを選びます。

tracking用に囲むpatternと、Corner Pinで使う4cornerは別です。

## Track Channel

Red / Green / Blue / Luminanceのうち、contrastが高くfeatureが多いchannelを選びます。

OutputをBackground - Preprocessedへすると、解析前処理後のImageを確認できます。

## Track qualityを確認する

Steady modeでは、解析したplaneが固定されて見えるか確認できます。

この時点でplaneがずれる場合は、graphic側を調整せずPlanar Tracker側を見直します。

## Graphic側の調整

Planar Transformはplaneのmovementを担当します。

graphicのlocal offsetやscaleはgraphic側または別Transformへ分けると、解析結果と見た目調整を別々に扱えます。

## うまくいかないとき

- lens distortionが強くないか。
- Reference frameでplaneが十分見えているか。
- Motion Typeがshotに合っているか。
- Track Channelにcontrastがあるか。
- Steady modeの時点でずれていないか。
- graphic側のanimationとPlanar Transformが重なっていないか。

## 関連パターン

- [Trackを解いてから適用先を分ける](../../patterns/tracking/solve-then-apply-track)

## 関連Node

- [Planar Tracker](../../nodes/tracking/planar-tracker)
- [Planar Transform](../../nodes/tracking/planar-transform)
- [Merge](../../nodes/compositing/merge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 119 pp.2819–2828、Chapter 120 pp.2870–2872、およびFusion Fundamentals Chapter 82を基にしています。

実機でのshot別精度は未検証のため `verification: partial` を維持します。
