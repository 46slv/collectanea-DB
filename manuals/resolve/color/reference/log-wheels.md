---
title: Log Wheels（Logホイール）
description: DaVinci Resolve ColorページのLog WheelsでShadows／Midtones／Highlightsを補正し、Low／High Rangeを使い分ける。
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

Colorページの**Log Wheels**は、Primariesパレット内にある、Shadows／Midtones／Highlightsを明暗域別に補正するモードです。[Primaries Wheels](./primaries-color-wheels)のLift／Gamma／Gainに比べて対象とする階調が狭く、**Low Range／High Range**で帯域の境界を変えられます。

名前に「Log」がありますが、Log収録素材だけの専用機能ではありません。公式21.1マニュアルでは、(1)Logエンコードされた画像を正規化する前の補正、(2)正規化済み画像の特定の階調を調整する表現、という二つの使い方を説明しています。同じホイールでも入力画像の状態で作用の見え方が変わります。

## Primaries Wheels／HDR Wheelsと何が違うか

| ツール | 明暗域の扱い | 向いている用途 |
| --- | --- | --- |
| [Primaries Wheels](./primaries-color-wheels) | Lift／Gamma／Gainは広い範囲で影響が重なる | 画像全体の色や明暗を自然に整える |
| **Log Wheels** | Shadows／Midtones／Highlightsを比較的狭い範囲で調整し、帯域の境界を変更できる | 特定の暗部・中間調・明部の色かぶりを補正する |
| HDR Wheels | 複数の明暗ゾーンを使い、ゾーンの範囲や減衰を細かく設計する | 黒付近やハイライトをより細分化して補正する |

Log WheelsはLift／Gamma／Gainの単なる別名ではありません。特に正規化済みの画像では、隣接する帯域のつながりを損なうほど強く動かさないことが重要です。

## 操作する場所と各Control

Colorページでショットと補正ノードを選び、Primariesパレットのモードを**Log**に切り替えます。Resolve 21.1 Reference Manualでは、モード切替にドロップダウンまたはモードボタンを使用すると説明しています。

- **Shadows／Midtones／Highlights**：それぞれ暗部・中間調・明部の色バランスを変える。各Master Wheelでは同じ帯域の明るさを動かす。
- **Offset**：全体的な明るさや色バランスを動かす。局所的な補正前の基準作りに使える。
- **Low Range**：ShadowsとMidtonesの境界。下げるとShadowsが狭まり、Midtonesが広がる。上げるとその逆。
- **High Range**：MidtonesとHighlightsの境界。下げるとHighlightsが広がり、Midtonesが狭まる。上げるとその逆。
- **Contrast／Pivot**：全体のコントラストと、その作用の中心を調整する。

Low／High Rangeで変更できるのは主に各帯域の範囲です。**帯域どうしの重なり量そのものは自由に調整できません。** 設定値を先に決めるのではなく、[Scopes](./scopes)とViewerで意図した場所が変わるか確認します。

## 例1：Log収録素材を正規化する前に補正する

次は、色管理を手動で行う**DaVinci YRGB**の一例です。

```text
Logで記録したショット
  → [01 Log Wheels：基礎バランスと階調別の色補正]
  → [02 色空間とガンマを正規化するCST]
  → [03 必要なら正規化後の仕上げ]
  → Output
```

1. カメラの収録色域とガンマを確認し、プロジェクト内で色空間変換がどこに設定されているか把握します。Resolve Color Management（RCM）やACESで既に自動変換されている場合、同じ変換をCSTで重ねません。
2. Log画像を扱うノードで、OffsetのMaster Wheel、Contrast、Pivotを使い、黒付近の基準と全体の明暗差を整えます。
3. Offsetのカラーバランスで全体的な色かぶりを調整します。
4. Shadows／Midtones／Highlightsを一度に大きく動かさず、気になる階調だけ少しずつ補正します。
5. 正規化後の画像をViewerで見ながら[Scopes](./scopes)でも確認し、暗部の階調や肌の色が不自然になっていないか比べます。

この順序で重要なのは**Log Wheelsの補正が正規化の前に評価されること**です。公式マニュアルによれば、同一CorrectorノードにLUTを適用する場合、LUTはそのノードのLog補正の後に評価されます。一方、同一ノード内でのWheels（Lift／Gamma／Gain）とLogの評価順は画面上の操作順と同じとは限りません。Log補正を先に行い、その後でWheels補正を行いたい場合は、後段に別ノードを置きます。

RCMやACESを使っているプロジェクトでは、上のノード構成をそのまま適用せず、入力変換・タイムライン処理・出力変換の位置を確認してください。[Color Node Graph](../learn/color-node-graph)も参照できます。

## 例2：正規化済み映像の暗い壁だけ少し青くする

夕方の人物ショットで、暗い壁をやや寒色に寄せつつ、顔の中間調をなるべく保ちたい場合です。

1. 基本補正が済んだ後段のノードでLog Wheelsを開き、Shadowsを少し寒色へ動かします。
2. 顔や服まで変わりすぎた場合は、**Low Rangeを下げて**Shadowsの範囲を狭め、再度確認します。
3. ノードの有効／無効を切り替え、ViewerとRGB Paradeで暗い部分と顔の両方を比較します。
4. 暗部に不自然な境界が現れたら補正量を戻し、背景だけを選ぶ必要があればQualifierやPower Windowを検討します。

Log Wheelsは**階調を選ぶ補正**であり、壁という被写体を自動判別する機能ではありません。壁と顔が近い輝度なら、Low Rangeだけでは分離できない場合があります。

正規化済み映像では、Shadowsを持ち上げすぎてMidtonesを越えたり、Highlightsを下げすぎてMidtonesを下回ったりすると、**ソラリゼーションに似た階調反転**が生じることがあります。公式マニュアルも極端なMaster Wheel操作への注意を挙げています。

## 旧プロジェクトと挙動が違う場合

21.1マニュアルは、Project SettingsのGeneral Optionsにある「Use legacy Log grading ranges and curve」を互換設定として説明しています。Resolve 12.5以前の挙動を引き継いだ古いプロジェクトと、新規プロジェクトで同じ値なのに見え方が違う場合は、この設定を確認します。比較目的のために元のプロジェクト設定を無断で変更しないでください。

## 出典・検証範囲

- Blackmagic Design, **DaVinci Resolve 21.1 Reference Manual**, Color / Chapter 131「Primaries Palette」、PDF **p.3152–3156**。Log Wheelsの使い分け、Range、処理順序、旧互換設定、過補正によるソラリゼーションの注意を確認。[公式サポート](https://www.blackmagicdesign.com/support)
- Blackmagic Design, [DaVinci Resolve – Color](https://www.blackmagicdesign.com/products/davinciresolve/color)：「Log Grading」「Primary Wheels」の説明を照合。

**検証状態：partial。** 上記の公式21.1文書を照合済みですが、Resolve 21.1の実機UI、OS別操作、Free／Studio差、Rangeの初期値や推奨数値は未検証です。推測のパラメータ値は記載していません。

関連：[Primaries Wheels](./primaries-color-wheels)／[Scopes](./scopes)／[Colorページ索引](../index)
