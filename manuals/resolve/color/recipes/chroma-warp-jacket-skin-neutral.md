---
title: 青い衣装を赤紫に変え、肌と白いロゴを保つ（Chroma Warp）
description: Resolve 21.1のChroma WarpでPoint to PointとPin Pointを使い、衣装の色を変えながら肌・無彩色への影響を見分ける実践手順。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Color Warper, Chroma Warp, Point to Point, Pin Point, Chroma Range, Exposure, Scopes, Power Window]
tasks: [grade, create-look, change-hue, secondary-correction, troubleshoot]
level: intermediate
updated: "2026-10-27"
---

# 青い衣装を赤紫に変え、肌と白いロゴを保つ

MVで青い衣装を赤紫に変えたいとき、色相を大きく動かすだけでは肌の暖色や白いプリントまで変わる場合があります。DaVinci Resolve 21.1のColor Warperにある **Chroma Warp** では、色の始点と終点を指定する **Point to Point** と、変えたくない色を固定する **Pin Point** を組み合わせられます。

ここでは衣装の色を変更し、顔と無彩色を保つ手順を組みます。ただしChroma Warpは色に基づく処理です。**同じ色を持つ別の物体を自動的に見分ける機能ではありません。**

## 素材と完成条件

想定は1920×1080・25fps・約10秒の架空のMVショットです。人物は鮮やかな青いジャケットに白いロゴを付け、暖色のキーライトを受けてベージュの壁の前を歩きます。袖には陰影があり、動くと一部に寒色の反射が入ります。入力はRec.709 Gamma 2.4へ変換済みの非RAW映像とします。この条件は説明用であり、Resolve 21.1実機で得た観測結果ではありません。

完成の判断条件は、ジャケットが狙った赤紫へ近づいて袖の明暗差が残り、顔・唇・白いロゴ・壁に不要な色づきがなく、全10秒を通じて色が突然跳ばないことです。色の正確な指定値は実素材を見て決めます。

Log／RAW素材なら、まず[Input／Timeline／Outputの色管理](../learn/color-management-basics)を確定します。ここでのRec.709は作業条件であって、すべての素材に適用する設定ではありません。

## 1. 基礎補正と色変更を分ける

1. Colorページで対象クリップを選び、Clipノードを基礎補正と衣装の色変更に分けます。[Node Graph](../learn/color-node-graph)で処理順を確認します。
2. 基礎補正側で顔の露出とホワイトバランスを整え、[Scopes](../reference/scopes)とViewerで袖の暗部と白いロゴが残るか確認します。意図的な暖色照明を無理にニュートラルへ戻す必要はありません。
3. 色変更側で **Color Warper → Chroma Warp** を開きます。21.1 Manualによると、Chroma WarpとHue-Saturation／Chroma-Lumaのメッシュは**同一ノード内では併用できません**。両方必要なら別ノードに分けます。

## 2. Point to Pointで衣装の色を変える

1. Chroma Warpの **Add Stroke (Point to Point)** を選びます。QualifierのスポイトでViewerの代表的な青い布地を選ぶか、色度図（chromaticity diagram）上の元の青い色分布を選びます。
2. 色度図で変更先を赤紫の方向へドラッグし、Viewerで結果を確認します。Manualでは選択元が**青い点**、変更先が**オレンジの点**、その間が矢印で示されます。これは操作マーカーの表示色です。
3. **Chroma Range**を小さな変化から調整します。狭めると選択が限定され、広げると隣接色も含まれます。袖の明部と暗部、寒色の反射を見比べ、衣装の一部だけ元の青が残っていないか確認します。
4. 変更先の明るさを調整したい場合だけ **Exposure** を使います。Manualでは変更先のオレンジ点側に作用すると説明されています。色相変更の副作用を隠すために強く明るくせず、布地の階調を比較します。

**Normal**は元色から変更先までの間にある色域も連続的に変える用途、**Point to Point**は特定の色を別色へ移す用途です。今回は大きな色変更なのでPoint to Pointから始め、色域全体の連続した変化が必要な場面でNormalも比較します。

## 3. Pin Pointで肌と無彩色を保つ

1. **Add Pin Point**を選び、Viewer上の顔の中間調を指定します。Pin Pointは指定色域を変更対象から外すための機能で、人物の輪郭を認識するマスクではありません。
2. 白いロゴや壁が色づく場合は、色度図中央の**白色点（white point）**へPin Pointを置きます。21.1 Manualでもニュートラルグレーへの色かぶりを抑える方法として説明されています。
3. Pinの前後で顔、唇、白いロゴを比較します。肌と衣装に近い色成分があると、Pinによって衣装側の変更まで弱くなる場合があります。Pinで完全分離できると考えず、Strokeの範囲と変更量を見直します。
4. 背景にもジャケットと**ほぼ同じ青**があれば、色度図だけで区別できない場合があります。そのときは[Power Window](../reference/power-windows)で空間的に分け、被写体が動くなら[Tracker](../reference/color-tracker)で追従を確認します。遮蔽があれば[追跡のずれの診断](../troubleshooting/power-window-occlusion-tracking)も参照してください。

## 4. 全フレームで判定する

1. 色変更ノードの有効／無効を切り替え、顔・ロゴ・壁の副作用とジャケットの改善を比較します。[Versions](../reference/versions-and-grade-comparison)で元の案を残して比較しても構いません。
2. 先頭・中央・終端と袖に寒色の反射が入る区間で、変更後の色が唐突に切り替わらないか確認します。
3. 前後のショットと比較し、衣装の赤紫が意図したLookと合い、顔と背景の色の連続性が保たれているか判定します。
4. 全尺を再生し、静止フレームでは気づかなかった色のちらつき、Windowのずれ、衣装の模様の消失がないか確認します。

## うまくいかないとき

| 症状 | まず見るもの | 見直し |
| --- | --- | --- |
| 袖の一部に青が残る | 袖の陰影と選択色域 | Chroma Rangeを少し広げ、副作用も再確認 |
| 肌が赤紫に変わる | Pin Point前後の顔と衣装 | 肌色へのPin、Strokeの範囲、変更量 |
| 白いロゴや壁が色づく | 無彩色と色度図の中央 | white pointのPin、必要ならWindow |
| 背景の青い物も変わる | 背景と衣装の色の重なり | 色指定だけで分けずWindowを使う |
| 衣装の質感が平板になる | 袖の明暗、Exposure、元映像 | 変更量を減らし明暗を再調整 |

同じ色域に別の物体が含まれる場合、[HSL Qualifier](../reference/hsl-qualifier)に切り替えても色だけでは完全な物体分離になりません。色のまとまりの濃さを調整したい場合は[ColorSliceのLEDレシピ](./color-slice-led-background-skin)も参考になります。

## 出典と未検証範囲

- Blackmagic Design, [DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（September 2026）、Chapter 136「Color Warper」、**pp.3217–3221**。Chroma Warpとメッシュの排他、Normal／Point to Point、色度図、Pin Point、Chroma Range、Exposureの挙動を2026-10-27に原文で確認しました。
- MVの撮影条件、赤紫への変更先、確認順序は公式Controlから組み立てた**制作例**であり、測定済みの効果や確定プリセットではありません。
- **verification: partial。** Resolve 21.1実機での操作、実素材での色再現、Free／Studio差、OS／UI差、納品環境での表示は未検証です。