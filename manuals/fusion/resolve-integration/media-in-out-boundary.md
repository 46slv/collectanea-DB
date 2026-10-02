---
title: MediaIn / MediaOutの境界
description: Resolve timelineのclipがFusion Flowへ入り、Fusion結果がtimelineへ戻る入口と出口を理解する。
doc_type: concept
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion]
tasks: [cross-page-workflow, inspect-flow, choose-surface]
level: foundation
---

# MediaIn / MediaOutの境界

## User intent

「Fusion FlowのSourceとOutputが、Resolve timelineの何に対応しているか」を理解します。

## Which Resolve surface owns what

Blackmagic Designの現行Fusion documentationでは、MediaIn NodeはEdit Page timeline上のclipを表す入口として説明されています。

MediaOutはFusion compositionの最終ImageをResolve側へ返す出口です。

```text
Edit / Cut Timeline
       ↓
    MediaIn
       ↓
   Fusion Flow
       ↓
    MediaOut
       ↓
Resolve timeline / downstream workflow
```

## When Fusion is appropriate

MediaInとMediaOutの間へ、

- compositing
- tracking
- keying
- motion graphics
- 2D / 3D processing

を構成します。

## When Fusion is not the primary surface

clipそのものの順序・trim・timeline timingを変更する仕事は、MediaIn以降のGraphへ持ち込む前にEdit側の責任か確認します。

## Handoff / boundary

### MediaIn

timeline / Media Pool等からFusionへ入るsource boundaryとして読みます。

### MediaOut

Fusion Node treeの最終結果をResolve側へ渡すboundaryとして読みます。

MediaOutをNode treeから外すと、Fusion resultがtimeline側へ届かなくなるため、単なるViewer用Nodeとして扱いません。

## Related Fusion Concepts

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Nodeを読む](../start/read-a-node)

## Related cross-page workflow

- [Edit ↔ Fusionの境界](./edit-fusion-boundary)
- [どのworking surfaceを使うか](./choose-working-surface)

---

Verification note: MediaIn / MediaOutのResolve timelineとの境界はBlackmagic Design現行Fusion資料およびResolve 20 VFX Guideで確認。
