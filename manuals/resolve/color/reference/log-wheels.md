---
title: Log Wheels（Logホイール）
description: Colorページで明暗域を絞り、Log収録素材を正規化する前後の補正を使い分ける。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Shadows, Midtones, Highlights, Offset, Low Range, High Range, Contrast, Pivot]
tasks: [log-grading, primary-correction, tonal-balance]
level: intermediate
updated: "2026-10-22"
---

# Log Wheels（Logホイール）

Colorページの**Log Wheels**は、Shadows／Midtones／Highlightsの明暗域を分けて、色と明るさを補正するPrimariesパレットのモードです。Lift／Gamma／Gainより対象域が限定され、**Low Range／High Range**で境界を調整できます。

名称に「Log」があっても、Log収録素材にしか使えない機能ではありません。公式21.1マニュアルには、(1)正規化前のLogエンコード映像を補正する用途と、(2)正規化済み映像の限られた階調に演出を加える用途が説明されています。同じホイールでも、入力画像の状態によって効き方が変わります。

## Primaries／HDR Wheelsと分けて考える

| ツール | 明暗域の性格 | 使う場面 |
| --- | --- | --- |
| [Primaries Wheels](./primaries-color-wheels) | Lift／Gamma／Gainの影響範囲が広く重なる | 画像全体の自然なバランス調整 |
| **Log Wheels** | Shadows／Midtones／Highlightsの範囲が比較的狭く、境界を調節できる | 特定の明暗域だけの色かぶりやトーンを整える |
| HDR Wheels | 複数のゾーンを扱い、独自のトーンレンジも設計できる | 極端な暗部・明部を細かく調整する |

Log WheelsはLift／Gamma／Gainの別名ではなく、HDR Wheelsと同じゾーン編集機能でもありません。特に正規化済み素材では、Log Wheelsの各帯域の重なりが小さくなるため、強すぎる補正で階調のつながりを損なわないようにします。

## コントロールとRangeの関係

Colorページでクリップと補正ノードを選択し、Primariesパレットのモードを**Log**へ切り替えます。

- **Shadows／Midtones／Highlights**：各明暗域に対して色バランスと明るさを調整する。
- **Offset**：色または明るさを画像全体で動かす。局所のホイールを触る前の基準調整にも使える。
- **Low Range**：ShadowsとMidtonesの境界。下げるとShadowsが狭まり、Midtonesが広がる。上げると逆。
- **High Range**：MidtonesとHighlightsの境界。下げるとHighlightsが広がり、Midtonesが狭まる。上げると逆。
- **Contrast／Pivot**：全体のコントラストの調整に使う。

Low／High Rangeを変えても、各帯域の**重なり方そのもの**を自由に指定できるわけではありません。値を固定せず、Viewerと[Scopes](./scopes)で作用範囲を確かめます。

## Log収録素材を正規化する前に補正する例

以下は**DaVinci YRGBで、色空間変換を手動管理する場合**の一例です。変換前のLog信号に対してLog Wheelsを使い、その後で表示側の画像へ変換します。

```text
Logクリップ
  → [01 Log Wheelsで明暗と色の調整]
  → [02 正しい入力／出力設定のColor Space Transform]
  → [03 必要な仕上げ補正]
  → 出力
```

1. カメラの収録ガンマ・色域とプロジェクトのColor Managementを確認します。RCM／ACESで自動変換している場合、同じ変換をCSTでも重ねません。
2. 正規化前のノードで、Offsetのマスター操作とContrast／Pivotによって黒の基準と全体のコントラストを大まかに合わせます。
3. Offsetのカラーバランスで全体的な色かぶりを整えます。
4. Shadows／Midtones／Highlightsを一度に大きく動かさず、修正したい明暗域を少しずつ調整します。
5. 正規化後のViewer・Scopesで、明部と暗部の階調や肌の色が意図通りか比較します。

重要なのはノード番号ではなく、**Log Wheelsがどの状態の画像に作用し、正規化がその前後のどこにあるか**です。Color Managementで出力変換が処理される場合は、この例のノード配置を機械的に再現しません。[Color Node Graph](../learn/color-node-graph)も参照してください。

## 正規化済み映像で暗い背景だけを調整する例

夕方の人物ショットで、背景の暗い壁へわずかに寒色を加え、顔の中間調を保ちたい場合を考えます。

1. 基本補正後のノードでLog Wheelsを開き、Shadowsを少しだけ動かします。
2. 暗い壁だけでなく顔も変わる場合、Low Rangeを下げてShadowsの範囲を狭め、作用範囲を再確認します。
3. 補正ノードの有効／無効を切り替え、ViewerとRGB Paradeで比較します。
4. 暗部に不自然な境界ができる場合は補正量を戻し、必要ならPower WindowやQualifierなど別の選択手段を検討します。

正規化済み映像では、Shadowsを過度に持ち上げたりHighlightsを強く下げたりすると、隣接する明暗域の順序が逆転し、**ソラリゼーションのような不自然な階調**になる場合があります。Log Wheelsは輝度別の補正であり、被写体を自動的に分離する機能ではありません。

## 古いプロジェクトとの比較

21.1マニュアルはProject Settingsの「**Use legacy Log grading ranges and curve**」を旧プロジェクトとの互換設定として説明しています。古い案件と新しい案件で同じ数値なのに結果が違う場合は、まずこの設定を確認します。既存プロジェクトの設定を理由なく変更しないでください。

## 出典・確認範囲

- Blackmagic Design, **DaVinci Resolve 21.1 Reference Manual**（2026-09-08）、Color / Chapter 131 *Primaries Palette*、PDF p.3152–3156。Log Wheelsの適用方法、Range調整、正規化の順序、旧設定、過度な補正の注意を確認。[公式サポート](https://www.blackmagicdesign.com/support)
- Blackmagic Design, [DaVinci Resolve — Color（日本語）](https://www.blackmagicdesign.com/jp/products/davinciresolve/color)。「Logグレーディング」「HDRカラーホイール」の機能説明を照合。

**検証状態：partial。** 公式21.1文書を確認済みですが、Resolve実機での操作結果、OS別のショートカット、Free／Studio差、正確なRange初期値は未検証です。ここでは推奨数値を創作しません。

関連：[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Colorページ索引](../index)