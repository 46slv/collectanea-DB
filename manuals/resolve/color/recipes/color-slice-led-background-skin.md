---
title: 青緑LEDの背景に深みを出し、人物の肌を保つ（ColorSlice）
description: ColorSliceのCyan／SkinとHighlightを使い、ライブ映像やMVの青緑LEDを調整しながら顔への副作用を切り分ける制作手順。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [ColorSlice, Center, Highlight, Density, Saturation, Hue, Skin, Cyan, Primaries, Scopes, Power Window]
tasks: [grade, create-look, secondary-correction, adjust-saturation, troubleshoot]
level: intermediate
updated: "2026-10-26"
---

# 青緑LEDの背景に深みを出し、人物の肌を保つ

MVやライブ映像で、背景の青緑LEDを濃く見せたいのに全体のSaturationを上げると、顔の色や照明のハイライトまで変わることがあります。**ColorSlice**は、Red／Green／Blue／Cyan／Magenta／Yellow／Skinの7つの色領域に対して、色相、Density、Saturationを個別に調整するツールです。

ここでは**背景のLEDの色を整え、人物の肌を不自然に変えない**ことを目標にします。ColorSliceの選択は色に基づく滑らかな重み付けであり、「Cyanだけ」「Skinだけ」を空間的に完全分離するマスクではありません。

## 素材と完成条件

想定素材は、1920×1080・25fps・約12秒のMV用ワンカットです。人物の顔を暖色のキーライトが照らし、背後には青緑色のLEDパネル、人物の衣装には暗い無彩色の部分があります。動きに合わせてLEDの発光量が少し変化します。入力はすでにRec.709 Gamma 2.4へ変換済みの非RAW素材と仮定します。以下の明暗や色の状態は説明用の仮想例です。

結果を判断する条件は次のとおりです。

- LEDの青緑が狙った濃さになり、明るい部分の階調や模様が不用意に失われない。
- 顔の中間調、唇、白目、衣装の無彩色部分が意図せず緑やシアンに寄らない。
- カット先頭・中央・終端とLEDの発光が変わる区間で、色の急な跳びや局所的なちらつきが目立たない。
- 調整を外した状態と比較して、変更した色域と副作用を説明できる。

収録Log・RAW素材で試す場合は、まず[カラーマネージメント](../learn/color-management-basics)でInput／Timeline／Output、RCM／CST、LUTの適用範囲を確定します。変換前後を取り違えたままColorSliceで補正しないでください。

## 手順1：基礎補正とLookを別ノードにする

1. Colorページで対象クリップを選び、ClipのNode Graphにシリアルノードを2つ用意します。最初を基礎補正、次をColorSliceによるLook用にします。既存のGroupやTimelineに共通Lookがあれば、変更するノードの適用範囲も確認します。
2. 基礎補正ノードで[Primaries](../reference/primaries-color-wheels)を使い、顔が見えるフレームの露出とホワイトバランスを確認します。[Scopes](../reference/scopes)のWaveformとRGB Paradeを見ながら、暗い衣装を一律に持ち上げたり、暖色の照明を強制的に無彩色へ戻したりしないようにします。
3. Lookノードを選び、[ColorSlice](../reference/color-slice)を開きます。GlobalのDensity／Saturation／Hueは、最初は触らず個別スライスの変化を確認します。

この段階で人物の基本的な明るさが揃っていない場合、後の色域別調整だけでは直しにくくなります。

## 手順2：Cyanの影響範囲を見てLEDを整える

1. ColorSliceの**Cyan**スライスでHighlightを表示します。21.1 ManualではスライスのHighlightアイコンを押したまま確認する方法と、ViewerのHighlightを使う方法が説明されています。
2. LEDの青緑部分が主に表示されるか確認し、**Center**を動かして対象色への重みを調整します。Centerは選択の中心を変える項目で、範囲の外へ自由に動かせるものではありません。LEDが青寄りならBlueのHighlightも見比べます。
3. Highlightを解除して、まずCyanの**Density**を少し変えます。Densityは彩度のある色の輝度を変えるため、背景の「濃さ」と明るさの両方をViewerとWaveformで比較します。
4. 次に**Saturation**を少しずつ調整します。ColorSliceのSaturationは減法混色的なモデルを用いるため、単純な全体彩度調整と同じ結果になるとは限りません。LEDの明部が不自然に明るく見えたり、細部が潰れたりしないか確認します。
5. 青緑を青方向へ寄せるなどの色相変更が必要な場合に限り**Hue**を使います。Hueの操作は元の色に対する選択範囲そのものを再計算する操作ではありません。調整の前後でHighlightの範囲と画像の結果を分けて見ます。

**ColorSliceのHighlightが穴のない白黒Matteである必要はありません。** Manualは、選択したい色が主に含まれるかを確かめる方法として説明しています。ただしLEDだけでなく顔のシアン反射も同時に拾う場合、Centerの調整だけで顔を完全保護できるとは限りません。

## 手順3：顔への副作用を確かめる

1. Cyanを調整したまま、顔・唇・首・白目・衣装を元の状態と比較します。肌の明るさ、赤み、緑かぶりが不自然に変わっていないか確認します。
2. **Skin**スライスのHighlightを表示し、顔の暖色領域がどの程度含まれているか調べます。背後の暖色照明や黄系の物体まで拾う場合があります。Skinは人物だけを認識して切り抜く機能ではありません。
3. 必要ならSkinのCenter、Density、Saturationを小さく変更します。ただしCyanで生じた顔への影響をSkinで相殺できるとは限りません。顔を戻した結果、背景が別の方向へ変わる場合は、Cyanの調整量から見直します。
4. LEDと顔の色が重なり、色域選択だけでは両方を分離できない場合は、Lookノードの影響を[Power Window](../reference/power-windows)で空間的に制限する方法を検討します。被写体が動くなら[Color Tracker](../reference/color-tracker)と[遮蔽時の追跡](../troubleshooting/power-window-occlusion-tracking)も確認します。Windowを加えた結果の境界や追跡精度は別途検証が必要です。

## 手順4：動きとカット間で判定する

1. 先頭・中央・終端に加え、LEDの明るさや色が変わるフレームを確認します。ColorSliceの固定された色域選択が別の発光色に切り替わったときに同じように作用するとは限りません。
2. ColorSliceノードを一時的に無効化し、元映像と交互に比較します。**LEDの階調と顔の自然さ**が両立しているかを判断します。
3. Split Screenや[Image Wipe](./image-wipe-two-shot-comparison)で近接ショットと比較し、ColorSliceを設定したカットだけ背景が極端に暗くなったり、肌の色が跳んだりしていないか確認します。
4. 通常表示へ戻して12秒を再生します。静止フレームで良くても、照明の変化や人物の動きで破綻する場合があります。

## 症状ごとの見直し

| 症状 | まず確認すること | 対応の方向 |
| --- | --- | --- |
| 背景のLEDが暗く潰れる | CyanのDensity、元映像の階調、Waveform | Densityを戻し、明部の情報が残る範囲で調整する |
| 顔まで緑・シアンになる | Cyan／BlueのHighlight、顔へのLED反射 | Centerと調整量を見直し、必要ならWindowで影響範囲を制限する |
| 肌を直すと暖色の背景も変わる | SkinのHighlightに含まれる物体 | Skinを人物専用マスクと扱わず、調整を減らすか空間的に分離する |
| 動画にすると色が急に変わる | LEDの発光色の時間変化、選択中のスライス | 変化するフレームで評価し、単一の色域別調整で足りるか再判断する |
| 1カットだけ別のLookに見える | 前後カット、共通ノードの範囲、出力変換 | 近接ショットの連続性を優先してLookの強さを調整する |

ColorSliceは色相付近を滑らかに調整するための選択肢です。**人物と背景で似た色を持つ場合の確実な分離手段ではありません。** 明確な局所マスクが要件なら[HSL Qualifier](../reference/hsl-qualifier)やWindowも検討します。

## 出典・対象版・未検証範囲

- **直接確認した一次資料：** Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』（2026年9月版）、Chapter 135「ColorSlice」**pp.3210–3215**。2026-10-26に、7スライス、Highlight／Center、Hue／Density／Saturation、Globalとの差、複数色域の重なりとWindow併用の説明を確認。
- **補助参照：** [ColorSlice機能解説](../reference/color-slice)、[Primaries](../reference/primaries-color-wheels)、[Scopes](../reference/scopes)。対象とリンク先はmain掲載記事に基づく。
- **verification: partial。** 操作項目と基本的な作用は21.1公式Manualで確認済み。上記のLED・人物ショット、最適調整量、実機画面、色域の具体的な重なり方、動きによる変化、Window／Trackerの実装結果、Free／Studio差、実素材での見え方は未検証。固定数値を設定した実測例ではありません。
