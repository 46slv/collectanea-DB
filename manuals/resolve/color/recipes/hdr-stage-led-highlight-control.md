---
title: ライブ映像のLEDと肌の階調をHDRゾーンで分ける
description: Resolve 21.1のHDRパレットを使い、夜のステージ映像で強いLED・人物の中間調・暗い客席を別々に評価する実践レシピ。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [HDR Palette, Zones, Light, Highlight, Specular, Shadow, Dark, Exposure, Saturation, Range, Falloff, Waveform]
tasks: [grade, primary-correction, hdr-grading, live-performance]
level: intermediate
updated: "2026-10-27"
---

# ライブ映像の強いLEDを抑え、人物の階調を残す

ステージの白いスポットライトと青紫のLEDパネルが強く、歌手の顔は中間調にあり、客席は暗い。そんなライブ映像では、全体のGainやコントラストだけを下げると、人物まで暗くなることがあります。Colorページの**HDRパレット**は、Light／Highlight／Specularなど重なり合う明暗ゾーンに異なるExposureやSaturationを与えられます。

この例では、照明を暗くすること自体よりも、**LEDの形が読める明部、歌手の顔、暗い客席を同時に評価する**ことを目標にします。HDRという名前ですが、Rec.709 SDR納品の素材にも使用できます。以下はDaVinci Resolve 21.1公式マニュアルの操作説明を基にした**仮想制作例**であり、特定の素材の実測結果ではありません。

## 素材と作業条件

- **想定クリップ**：Sony FX3、S-Gamut3.Cine／S-Log3、10-bit、UHD 3840×2160、25fps、約10秒。ワンカットで歌手が舞台中央に立ち、白いスポットライト、背後の青紫LED、暗い客席が同時に写る。後半でカメラが少し横に振られ、LEDの見える面積が増える。
- **表示上の問題**：LED周辺の明部がひとかたまりに見え、白いスポットに階調差が少ない。一方、肌と衣装の明るさは大きく変えたくない。
- **Color Management**：Resolve Color Management（RCM）を使い、素材に対応したInput Color SpaceをS-Gamut3.Cine／S-Log3、Timeline Color SpaceをDaVinci Wide Gamut／Intermediate、Output Color SpaceをRec.709 Gamma 2.4とする例。納品仕様・素材メタデータを確認して決める。RCMと同じ入力変換を追加CSTで二重に行わない。
- **達成条件**：ライトの縁とLEDの色が区別しやすく、顔の中間調が保たれ、客席の暗部が必要以上に浮かない。少なくとも冒頭・LEDが最大面積になる中盤・終盤で不自然な明暗の境界が出ない。

[カラーマネージメントの基礎](../learn/color-management-basics)と[HDRパレットの機能](../reference/hdr-palette)を先に確認すると、操作の役割を追いやすくなります。

## 1. HDR補正を独立したノードに置く

1. 対象クリップで**基本補正 → HDRゾーン補正**の2つのSerial Nodeを用意します。すでにGroup Pre-ClipやTimelineでLookが適用されている場合は、それらを含めて評価します。[Node Graphの基礎](../learn/color-node-graph)も参照してください。
2. 基本補正ノードで入力色空間・ホワイトバランス・肌の露出を点検します。最初からHDR側のExposureを大きく動かして、入力の誤設定を覆い隠さないようにします。
3. [Scopes](../reference/scopes)でWaveformとRGB Paradeを、Viewerでは顔・白いスポットライト・LED・客席を確認します。Waveformの高い部分がLEDかスポットかを、画面内の位置と合わせて確かめます。
4. HDRゾーン補正ノードを選択して**HDRパレット**を開き、ControlsとZonesを行き来できる状態にします。最初は既定ゾーンのまま、効果がどこに現れるかを調べます。

**予想する開始状態**：肌が見やすい露出のまま、LEDの一部が強く見える。ここでは「Waveformが高い＝必ずクリップしている」とは判断しません。出力トーンマッピングや表示環境による見え方と、素材に記録された情報の欠損を分けて扱います。

## 2. LightからHighlight／Specularへ絞る

1. **LightのExposure**を少し下げた場合を試します。Lightは明部側の広い範囲に作用するため、LEDだけでなく顔の明るい側にも変化が出る可能性があります。肌が下がりすぎるならこの段階で戻します。
2. **HighlightのExposure**を調整し、LEDの面と白いスポットの階調差を観察します。HighlightはLightの上に重なる明部のゾーンです。LEDの文字や模様が残るか、白い衣装のハイライトがくすまないかを見ます。
3. さらに明るい反射やスポットの中心だけを整えたい場合は**Specular**を試します。効果が見えないときはExposureを極端に下げず、次の手順でZone Graphを確認します。
4. **ZonesパネルのヒストグラムとSpecularのRange境界**を見て、境界がクリップの階調分布に重なっているか確認します。公式マニュアルでは、境界が分布の外側にあるとそのゾーンの調整は画像に作用しないと説明されています。必要なら境界を対象側へ移動し、どこまで変化するかを確認します。
5. **Falloff**で隣のゾーンとの移行を見ます。鋭い境界がLED周辺の空や壁に見える場合、Falloffを広げる方向を試し、補正量も控えめに戻します。Falloffは対象物マスクのぼかしではなく、明暗ゾーンが重なる幅を調整します。

Range境界は「明るい画素から順に拾う」ため、**LEDだけを識別する機能ではありません**。同じ明るさの額・衣装・金属反射にも影響します。色や位置だけで分けたい場合は[Power Windows](../reference/power-windows)や[Qualifier](../reference/hsl-qualifier)による別ノードを検討します。

## 3. 色の強さと暗部を別に調整する

1. LEDが明るさだけでなく過度に鮮やかに見える場合は、**HighlightまたはSpecularのSaturation**を少し調整します。LEDの青紫と肌・白い衣装を見比べ、明るい部分の色が一律に抜けていないかを確認します。
2. 客席が青かぶりしている場合は**ShadowのColor Balance**を小さく調整し、深い暗部への影響は**Dark**でも確認します。Shadow／Dark／Blackは互いに重なるため、三つを大きく動かす必要はありません。
3. 暗部を持ち上げる必要があっても、客席のノイズが急に目立つなら補正量を戻します。深い暗部に元から記録されていない情報は補正で生成できません。[暗部のノイズと浮いた黒の診断](../troubleshooting/shadow-noise-and-lifted-blacks)を参照してください。
4. LEDと顔で同程度の明るさの領域が重なり、肌の色まで変わる場合は、HDRゾーン補正だけで人物保護を完成させようとしません。独立したQualifier／Windowで局所補正するか、求めるLook自体を弱めます。

ここでの**期待結果**は、LEDの明部の圧迫感が下がり、白いスポットとの違いが見える一方、肌の露出感と暗い客席の落ち着きが維持される状態です。どの値で達成できるかは撮影時の記録レベルとトーンマッピングによります。

## 4. カメラ移動と前後ショットで判定する

1. クリップの冒頭、中盤、終盤を同じViewer倍率で見ます。LEDの面積が変わるとヒストグラムも変化します。**同じRange設定が全フレームで適切とは限りません**。
2. 全10秒を再生し、ライト周辺のグラデーションに急な段差、彩度の跳ね、暗部のちらつきがないかを確認します。静止画で狙いどおりでも、動いていると境界が目立つ場合があります。
3. HDRゾーン補正ノードのオン／オフを切り替え、元の問題が改善したかを確認します。次に隣のカメラショットと[Image Wipe](./image-wipe-two-shot-comparison)やStillsで比較し、人物の肌が急に暗く見えないか確認します。
4. Rec.709 Gamma 2.4の出力条件で書き出し試写を行う場合、Viewerだけでなく同じ表示系で再生結果を確認してください。出力差があれば[書き出し後の色の違い](../troubleshooting/export-color-mismatch)を切り分けます。

## 失敗条件と次の手

| 症状 | 原因候補 | 対応 |
| --- | --- | --- |
| Specularを動かしても変わらない | Range境界が入力ヒストグラムの外にある | Zones Graphで重なりを確かめ、必要な場合だけ境界を移動する |
| LEDは落ち着いたが顔まで暗い | Light／Highlightが肌の明部にも作用している | 広いLightの調整を弱め、Highlightの範囲を再評価する |
| LED周囲の壁に急な明暗境界が出る | Range／Falloffが画像の階調分布に合っていない、補正量が大きすぎる | 境界とFalloffを再調整し、Exposureを控える |
| LEDが灰色っぽく、白い衣装もくすむ | 露出やSaturationを明部全体へ強く掛けている | 元画像と比較し、影響ゾーンと調整量を縮める |
| 暗い客席にノイズが出る | 暗部の露出を上げすぎた、元の収録ノイズが顕在化 | 暗部補正を戻し、元素材の記録条件を確認する |
| 明るいLEDの模様が戻らない | 収録時点の飽和・クリップ、または出力変換の影響 | 入力と出力を分けて確認する。失われた収録情報の復元は保証できない |
| 一部フレームで効き方が違う | 被写体やLEDの移動でゾーン内の画素分布が変化 | 全尺で影響範囲を確認し、必要ならカット分割や時間的調整を検討する |

## 出典・対象版・検証範囲

- **一次資料**：Blackmagic Design, [*DaVinci Resolve 21.1 Reference Manual*](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf), September 2026, Color / Chapter 132「HDR Palette」pp.3172–3175（重なるゾーンの働きとExposure）、pp.3178–3182（Zone-specific controls、Range、Falloff、Zones Graph）。該当ページを2026-10-27に確認しました。
- **マニュアル根拠**：Light／Shadowが広い範囲を担い、Highlight／Specularが明部に重なること、ゾーン別Exposure／Saturation、Zones Graphのヒストグラムと境界、RangeとFalloffの役割。
- **制作例として設計した内容**：FX3撮影条件、RCM設定、舞台照明の構図、2ノード構成、観察順序、作品上の合格基準。Blackmagic公式が示すこの撮影条件向けの完成プリセットではありません。
- **verification: partial**。Resolve 21.1での実機操作、10秒素材での描画結果、具体的な露出・彩度値、出力ファイル、再生性能、外部モニタリングは未検証です。ここに書いた「期待結果」は実測値ではありません。
