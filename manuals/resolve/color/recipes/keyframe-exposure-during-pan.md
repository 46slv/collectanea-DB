---
title: パン中の露出変化をColor Keyframesで補正する
description: 明るい窓へパンする連続ショットで、被写体の不要な暗さをDynamic Keyframeでなめらかに補い、ハイライトと自然な明暗変化を残す制作例。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Keyframe Editor, Dynamic Keyframe, Color Corrector, Primaries, Offset, Scopes, Dynamic Attributes]
tasks: [correct-exposure-drift, keyframe-grade, preserve-highlights, moving-shot]
level: intermediate
updated: "2026-10-25"
---

# パン中の露出変化をColor Keyframesで補正する

カメラを窓へ振ったとき、画面内の明るい面積が増えた影響で露出が変わり、手前の人物が一時的に暗く見えることがあります。このレシピでは、**1ショット内で時間とともに変わる不要な暗さ**をColorページのDynamic Keyframeで補います。窓の明るさや、実際に人物へ当たる光の変化をすべて一定にする方法ではありません。

Colorページの[Keyframe機能](../reference/color-keyframes)と[Primaries](../reference/primaries-color-wheels)を使います。以下は公式Manualの操作から組み立てた**想定素材の制作例**であり、21.1実機で完成映像を確認した記録ではありません。

## 素材条件と完成条件

例は24fps・12秒の連続ショットです。3秒付近までは室内の人物を捉え、その後ゆっくり明るい窓へパンします。6秒付近で窓が大きく写り、人物の顔が必要以上に暗くなります。10秒付近でカメラの自動露出が落ち着きます。人物の顔は3〜10秒のあいだ観察でき、カットやフラッシュによる不連続な切り替わりはありません。

目標は、顔の明るさの不自然な落ち込みを減らしながら、窓の白飛びを増やさず、パンに伴う自然な明暗の印象を残すことです。固定のIRE値をすべてのフレームに当てはめません。入力色空間・ガンマと表示変換の責任が曖昧な場合は先に[カラーマネージメント](../learn/color-management-basics)を確認します。

比較には、パンが始まる直前、顔が最も暗く見える位置、露出が落ち着いた位置と、その間の再生映像を使います。同一フレーム内の人物と窓では役割が違うため、画面全体のWaveformの高さだけで成功を判定しません。

## 1. 問題がクリップ内の時間変化か確認する

1. Colorページで対象の単一クリップを選び、補正を一時的に無効化した状態も見比べます。暗さが既存の別ノードや二重の色変換から生じていないか確認します。
2. [Scopes](../reference/scopes)のWaveformとViewerで、顔の位置・階調と窓のハイライトをそれぞれ見ます。構図が変わればWaveform全体の形も変わるので、顔の見え方を主な比較対象にします。
3. 窓が元の撮影データでクリップしている場合、Keyframeで階調を復元できると考えません。[ハイライトのクリッピング](../troubleshooting/highlight-shadow-clipping)を参照して、残っている情報を先に見極めます。
4. パン中の暗さが照明の自然な結果なら、無理に全尺を均一にせず、補正する理由と量を見直します。

## 2. 時間補正だけのノードを設ける

まず単純な直列構成を使います。

| ノード | 役割 |
| --- | --- |
| 01：入力・基礎調整 | 色変換の責任と、補正前の階調を整える |
| 02：時間変化の補正 | Dynamic KeyframeとPrimariesで不要な暗さを調整する |
| 03：仕上げ | シーンのコントラストやLookを整える |

02ノードを選び、Colorページ下部の**Keyframe Editor**を開きます。キーフレームの対象を**Color**（選択中ノード）にして、既定の**All**のまま全ノードやSizingへキーを増やさないようにします。必要なら02ノードのトラックを展開し、**Color Corrector**サブトラックを使用します。公式Manual 21.1では、Color CorrectorトラックがColor Wheels・Primary Controls・Curvesなどの色調整を受け持ちます。

後からKeyframeをやり直しやすいよう、02ノードにはWindow追跡や別のLookを重ねません。公式Manualも時間変化を独立したノードに分ける方法を紹介しています。

## 3. Dynamic Keyframeで前後をつなぐ

1. 02ノードの**Color Corrector**トラックを展開し、パン前の安定したフレーム（例：3秒付近）へPlayheadを移動します。
2. トラック上で右クリックし、**Add Dynamic Keyframe**を選びます。この時点の補正を開始状態とします。
3. 顔の暗さが最も目立つ位置（例：6秒付近）へ進み、同じトラックへ2個目のDynamic Keyframeを作ります。
4. その位置でPrimariesの**Offset**などを使い、顔の明るさの落ち込みだけを必要な範囲で補います。Offsetは画像全体の明るさに働くため、窓のハイライトと影も必ず確認します。固定の補正値は指定しません。
5. 露出が落ち着いた位置（例：10秒付近）へ進み、3個目を作ります。パン後の見え方を確認して必要ならOffsetを戻します。最後を無条件に初期値と同じにするのではなく、その時点の照明と構図で判断します。
6. 3〜10秒を通して再生し、暗さが補われる速度と量を評価します。基準点だけでなく、各Keyframe間の中間フレームを確認してください。

この例は徐々に変化する露出を補正するので**Dynamic**を使います。**Static Keyframe**は境界で補正が一度に切り替わる方式であり、緩やかなパンにそのまま用いると段差が出る可能性があります。

手動でキーを置く間は、必要がなければ**Auto-Keyframeをオフ**にします。Autoをオンにした場合は操作に応じてキーが生成されるため、作業後にオフへ戻し、意図しないキーがないか確認します。

## 4. 補間の速度と意図しない影響を調べる

Dynamic Keyframe間の補間は公式Manual上、既定で線形です。人物の暗さが始まるより前から補正が強まりすぎるなら、まずKeyframeを左右へ動かして開始・終了タイミングを合わせます。

それでも移行が急なら、対象のDynamic Keyframeを右クリックし、**Change Dynamic Attributes**を開きます。Start／Endの加速曲線を調整すると前後の補間速度を変えられます。画質が良くなる固定設定として扱わず、Viewerの連続再生で比較します。

02ノードを無効化した時と有効時を比較し、顔の落ち込みが減る一方で窓の白飛びや背景の過剰な持ち上がりが増えていないか見ます。詳しい比較手順は[ノード無効化による切り分け](../troubleshooting/node-bypass-diagnostics)を参照してください。

**完成判定：** パン前→暗くなる途中→パン後を等速再生し、補正の開始・終了に明るさの段差がない。顔の変動が目立ちにくくなり、窓の階調と本来の照明変化が可能な範囲で維持されている。02ノードのオン／オフで補正対象が説明できる。

## 失敗しやすい条件

| 症状 | 確認すること | 対処 |
| --- | --- | --- |
| 3秒より前から画面が明るくなる | 最初のDynamic Keyframeと補間の開始位置 | 最初のキーの位置と初期値を確認する |
| 6秒で明るさが急に跳ぶ | Staticが混在していないか、キーの配置 | Dynamicの種類・時間位置を点検する |
| 顔は良いが窓が白く広がる | Offsetで全画面を上げすぎていないか | 全体の補正量を戻し、局所補正の要否を検討する |
| 調整したはずの他ノードまで時間変化する | Keyframe Timeline modeがAllではないか | Color／個別Correctorトラックへ限定する |
| 中間フレームで色や明るさが不自然 | Keyframe間の補間、既存ノードの変化 | 中間のViewerとScopesを確認し、時間位置・補正量を調整する |
| キーを置くたびに予期しない変化が増える | Auto-Keyframeが有効になっていないか | Autoを切り、不要なキーを個別に確認する |
| 保存したStillを適用しても動きが再現しない | 保存／適用時のKeyframe扱いと整列方式 | 通常のStill保存はKeyframeを保持しない点を確認する |

一つのショット内で色や露出の変化を自動解析したい場合にはColor Stabilizerも候補です。ただし今回のように、**どの時点の暗さをどの程度残すか**を人が判断したい場合は、Keyframeで補正時刻を管理する方法を比較できます。[インタビューのホワイトバランス変動を整える](./stabilize-interview-white-balance)も併せて参照してください。

## 出典と検証範囲

- Blackmagic Design, [*DaVinci Resolve 21.1 Reference Manual*](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（September 2026）、Chapter 148「Keyframing in the Color Page」pp.3452–3464。2026-10-25に該当ページを直接確認。Dynamic／Static、All／Color／Sizing、Corrector個別トラック、Auto-Keyframe、Dynamic Attributes、Still保存時のKeyframe扱いの根拠。
- 同Manual、Chapter 131「Primaries Palette」p.3157、Offset wheelの全体明るさ調整の説明を確認。
- [Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support) — Manual配布元。

**確認済み：** 21.1 Manualの操作とトラックの役割、補間・ノード分離・Stillの注意事項。

**未検証：** Resolve 21.1実機での操作、12秒素材での見た目とOffset補正量、局所補正との併用、Free／Studio差、色管理設定による見え方。ここでの24fps・12秒・3／6／10秒は説明用の想定条件であり、実測結果ではありません。実機未確認のため verification: partial を維持します。
