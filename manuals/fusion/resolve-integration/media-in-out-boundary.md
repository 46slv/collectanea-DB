---
title: MediaIn / MediaOutの境界
description: Resolve timelineのclipがFusion Flowへ入り、Fusion結果がtimelineへ戻る入口と出口を理解する。
doc_type: concept
term_id: media-in-out-boundary
term_short: Resolve timelineとFusion FlowをつなぐMediaIn・MediaOutの入口と出口。
verification: partial
product_scope: resolve
suite_surfaces: [edit, fusion]
tasks: [cross-page-workflow, inspect-flow, choose-surface]
level: foundation
---

# MediaIn / MediaOutの境界

## 目的

「Fusion FlowのSourceとOutputが、Resolve timelineの何に対応しているか」を理解します。

## どのページで何を担当するか

Blackmagic Designの現行Fusion 資料では、MediaIn NodeはEdit Page timeline上のclipを表す入口として説明されています。

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
Resolve timeline / downstream 作業の流れ
```

## Fusionが向いている場合

MediaInとMediaOutの間へ、

- 合成
- トラッキング
- キーイング
- モーショングラフィックス
- 2D / 3D 処理

を構成します。

## Fusionを主に使わない場合

clipそのものの順序・trim・timeline timingを変更する仕事は、MediaIn以降のGraphへ持ち込む前にEdit側の責任か確認します。

## ページ間の受け渡し

### MediaIn

timeline / Media Pool等からFusionへ入る参照元 boundaryとして読みます。

### MediaOut

Fusion Node treeの最終結果をResolve側へ渡すboundaryとして読みます。

MediaOutをNode treeから外すと、Fusion 結果がtimeline側へ届かなくなるため、単なるViewer用Nodeとして扱いません。

## 関連するFusionの考え方

- [Graphとして考える](../learn/01-flow/graph-as-flow)
- [Nodeを読む](../start/read-a-node)

## 関連するページ間の流れ

- [Edit ↔ Fusionの境界](./edit-fusion-boundary)
- [どの作業ページを使うか](./choose-working-surface)

---

検証メモ: MediaIn / MediaOutのResolve timelineとの境界はBlackmagic Design現行Fusion資料およびResolve 20 VFX Guideで確認。
