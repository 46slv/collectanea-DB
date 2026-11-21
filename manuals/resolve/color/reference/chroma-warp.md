---
title: Chroma Warp（Normal／Point to Point／Pin Point）
description: Color WarperのChroma Warpで色度図上のストロークを使い、色の移動・保護・影響範囲を判断する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Color Warper, Chroma Warp, Normal, Point to Point, Pin Point, Chroma Range, Exposure, Tonal Range Low, Tonal Range High, Tonal Range Pivot]
tasks: [selective-color, hue-shift, color-protection, create-look, troubleshoot]
level: intermediate
updated: "2026-11-11"
---

# Chroma Warp：色を動かす経路と保護する色を指定する

**Chroma Warp**は、ColorページのColor Warperパレットにある、色度図上のストロークで色の関係を調整する方式です。たとえば緑の草を黄緑へ自然に寄せたいときと、青い衣装を別の色へ大きく変えたいときでは、選ぶストロークが異なります。

[従来のColor Warper](./color-warper)は網目状のコントロールポイントを動かします。Chroma Warpは**元の色・変更先の色・影響する周辺色**を色度図上で扱います。両方式は**同じノードでは併用できない**ため、必要なら独立したシリアルノードに分けます（Blackmagic Design公式ガイド、p.74）。色度図に白く重なる分布は現在画像の色の目安であり、画素数を厳密に数えたヒストグラムではありません。

## NormalとPoint to Pointをどう選ぶか

| 操作 | 色の移動の考え方 | 最初に向く用途 |
| --- | --- | --- |
| **Add Stroke (Normal)** | 元色と変更先の間にある色域も含む、連続的な変化を作る | 空の青や草の緑など、周辺色をつなげて調整する |
| **Add Stroke (Point to Point)** | 元色を別の色へ直接移し、経路上の全色を順番に通す必要がない | 衣装や看板の色を大きく変更する |
| **Add Pin Point** | 指定した色域を変更の影響から保護する | 肌、白い文字、ニュートラルな壁の色づきを抑える |

これは「Normalは安全、Point to Pointは危険」という分類ではありません。どちらも選択範囲内の周辺色へ影響し得ます。Blackmagic Design公式ガイドでは、**同じChroma Warpノード内でNormalとPoint to Pointのストロークを複数使える**と説明しています。対照的に、メッシュ型Color Warperとの排他は**ノード単位**です。

## 色度図の読み方

ストロークでは選択元が**青い点**、変更先が**オレンジの点**で示され、矢印が移動先を表します。変更先を中央の白色点へ寄せる方向は彩度を弱め、外側へ向ける方向は彩度を強めます。色を選ぶ方法は、Viewerでスポイトを使うか、色度図内の色分布を直接選ぶ方法です。

色度図は知覚的な色差を扱いやすい表示ですが、**同じ色を持つ別の物体を区別する人物・物体認識ツールではありません**。衣装と背景が同じ青なら両方に作用する可能性があり、その場合は[Power Window](./power-windows)などによる位置の制限を別途検討します。

## 調整幅・明るさ・階調域

| コントロール | 公式ガイドで説明された働き | 見るべき副作用 |
| --- | --- | --- |
| **Chroma Range** | ストロークに含める周辺色の幅。狭いほど対象を限定し、広いほど隣接色を含む | 肌や背景まで変わる／同じ衣装の影だけ残る |
| **Exposure** | ストロークの変更先側（オレンジの点）を明るく、または暗くする | 衣装の質感や明暗の連続性が失われる |
| **Tonal Range Low** | 選択色の暗い領域側への作用を調整する | 暗い袖だけ色が残る、暗部が不自然になる |
| **Tonal Range High** | 選択色の明るい領域側への作用を調整する | ハイライトの色が途中で切り替わる |
| **Tonal Range Pivot** | Low／Highの作用域が分かれ始める位置を調整する | 影と中間調のつながりが急になる |

**Tonal Range Low／Highは個々のストロークだけでなく、色度図内の全ストロークに作用する設定**として公式ガイドに記載されています。ストロークを複数作ったあとに調整すると、別の色の変更まで影響することがあります。各コントロールの値を固定プリセット化せず、実素材の明暗分布で判断してください。

## 判断例1：草の緑と空の青を自然につなげる

想定は、緑の草地と青空が同じカットに入る昼間のショットです。ここでの作業順は機能説明から構成した**仮想例**で、実機検証済みの完成グレードではありません。

1. 先に入力色域・Gamma、基本露出、ホワイトバランスを確認します（[色管理](../learn/color-management-basics)）。色変換の不一致をChroma Warpで隠さないようにします。
2. Chroma Warp用に一つのColorノードを設け、**Normal**で草の緑を選び、少し黄緑へ移動します。草の明部・影・周囲の木まで見ながら、変更範囲が広すぎないか確認します。
3. 必要なら別のNormalストロークで青空を深めます。空と雲の境界、シアンの反射、人物がいるなら肌の色を確認します。
4. [Scopes](./scopes)とViewerで変更前後を比較し、ノードをバイパスしてカット全尺を再生します。前後のショットとのつながりも見ます。

公式ガイドp.75には草を黄色寄りに、空を青寄りにした例がありますが、**その画像に使われた数値を再現可能な設定値としては提示していません**。

## 判断例2：青い衣装だけを赤紫に変える

1. 衣装と背景の青を見比べ、同じ色域が別の物体にないか確認します。衣装の色変更ノードで**Point to Point**を選び、Viewerの青い布地をスポイトで指定します。
2. 色度図の変更先を赤紫へ動かし、**Chroma Range**を小さな変更から調整します。袖の影や寒色反射が元の青で残る場合は幅を見直します。広げすぎると背景や肌にも作用します。
3. 肌や白いロゴに色づきが出る場合は**Pin Point**でそれらの色を保護します。無彩色全体が色づく場合は中央の**白色点へPin Point**を置く方法が公式ガイドにあります。
4. 色だけでは背景の同色物体を分離できなければWindowを併用し、動く素材では[Tracker](./color-tracker)の追従を確認します。
5. 先頭・中間・末尾と影が変化するフレームで、肌・ロゴ・衣装の階調と色の連続性を判定します。

より具体的な制作条件と手順は既存の[衣装の色変更レシピ](../recipes/chroma-warp-jacket-skin-neutral)を参照してください。**Pin Pointは色域の保護であり、人物領域を理解するマスクではありません**。

## うまくいかないとき

| 症状 | 確認と次の判断 |
| --- | --- |
| 肌まで色が変わる | ストロークのChroma Rangeを小さくし、肌へのPin Pointを検討する |
| 白や灰色が色づく | 中央の白色点にPin Pointを置いた場合と比較する |
| 袖の影に元の色が残る | 影の色分布とTonal Range Low、選択幅を調べる |
| 複数のストロークが同時に変わる | Tonal Range Low／Highは全ストローク共通の調整であることを確認する |
| 変更先の衣装が明るすぎる | Exposureと元画像の階調を比較し、過度な変更を戻す |
| 背景の同色物体も変わる | 色度図だけで分離せずWindowや対象位置で制限する |
| グリッド型Warperを同じノードに足せない | メッシュ方式とChroma Warpを別ノードへ分ける |

## 出典・対象版・検証範囲

- **直接確認した公式一次資料：** Blackmagic Design『[DaVinci Resolve 20 New Features Guide](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_20_New_Features_Guide.pdf)』Color pp.74–78（2026-11-11参照）。Normal／Point to Point、Pin Point、ストロークの色度図、Chroma Range、Exposure、Tonal Range、メッシュとの排他について本文と図を確認しました。
- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』Chapter 136「Color Warper」。既存の[21.1対応レシピ](../recipes/chroma-warp-jacket-skin-neutral)にはpp.3217–3221を2026-10-27に直接確認した記録があります。ただし**本runでは公式21.1 PDF本体の約183MBという取得制限により原文を再照合できていません**。20のガイドにあるコントロールの21.1全UI同一性は断定しません。
- **verification: partial。** Resolve 21.1実機での各モード・UI配置・表示値・Free／Studio差、色域やHDR設定ごとの厳密な数値挙動、実素材での効果量と時間方向の安定性は未検証です。上記の判断例は操作原理に基づく想定手順です。

関連：[Color Warperメッシュ](./color-warper)／[HSL Qualifier](./hsl-qualifier)／[Power Windows](./power-windows)／[Scopes](./scopes)。
