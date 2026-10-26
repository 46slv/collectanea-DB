---
title: ネオンサインの内側と外側の光をGlowで描き分ける
description: 赤いネオンサインの近い発光と、青い壁へ広がる柔らかな光をResolve FX GlowのSecondary Glowで分ける制作例。
doc_type: recipe
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Resolve FX Glow, Shine Threshold, Spread, Gain, Secondary Glow, Color Filter, Opacity, Blend, Scopes]
tasks: [neon-glow, optical-effects, secondary-glow, highlight-protection, node-workflow]
level: intermediate
updated: "2026-10-26"
---

# ネオンサインの内側と外側の光をGlowで描き分ける

夜のネオンサインに光を足すとき、文字のすぐ周りは赤く、離れた壁には淡い青い光が広がるようにしたい場合があります。ColorページのResolve FX **Glow**には、基本の発光に加えて広がりと色を独立して調整できる**Secondary Glow**があります。このレシピでは、一つのGlowを使い、文字の読みやすさを残したまま二層の光を作ります。

Glowは画像の明るい部分を基に光を重ねる効果です。実写の壁に当たった照明を物理的に計算する機能ではありません。以下はDaVinci Resolve 21.1公式Manualに記された操作から組み立てた想定素材の制作例であり、実機で完成映像を確認した記録ではありません。

## 素材と完成条件

想定素材は1920×1080、25fps、8秒の非RAW映像です。暗い店内の赤い「OPEN」サインが画面の右寄りにあり、背後の壁は暗い青。撮影中にカメラがゆっくり横へ動き、サインの位置もわずかに変わります。入力素材はRec.709／Gamma 2.4として解釈する前提とし、文字の内部に明暗の差が残り、完全な白飛びだけで構成されていないものを使います。数値と舞台設定は説明用です。

完成条件は、文字のすぐ外側に赤い発光があり、その外側へ弱く広がる青い光が見えることです。文字の輪郭が判読でき、背景の暗部が一面に持ち上がらず、カメラが動く8秒間で発光が不自然に出たり消えたりしない状態を目指します。発光を重ねる前から失われている文字の内部階調は、Glowでは復元できません。

Color Managementを使用している場合は、作業前に[入力色空間と表示変換](../learn/color-management-basics)を確認します。Log原本へ技術LUTを重ねて二重変換した状態と、Rec.709変換済み素材とでは、同じShine Thresholdでも光の選ばれ方が変わり得ます。[RCMのInput診断](../troubleshooting/rcm-input-color-space-mismatch)を先に済ませます。

## 1. 発光を専用ノードに分ける

次のような直列構成を使います。番号は説明上のものです。

| ノード | 役割 |
| --- | --- |
| 01：ベース補正 | [Primaries](../reference/primaries-color-wheels)で素材の明るさと色を整える |
| 02：Glow | 基本の赤い発光とSecondary Glowの青い広がりを作る |
| 03：仕上げ | 必要な場合だけ全体のコントラストや色のバランスを調整する |

1. Colorページで対象クリップを選び、ベース補正と別に02のCorrectorノードを設けます。
2. 画面右側のEffectsライブラリからResolve FX LightカテゴリのGlowを探し、02ノードへドラッグします。効果を適用したノードにはFXバッジが付きます。
3. 02ノードを選び、EffectsのSettingsでGlowの設定を開きます。最初は基本のGlowだけを調整し、Secondary GlowとAtmosphereは使わない状態から始めます。
4. 02ノードに別のOpen FXを重ねてドラッグしません。21.1 Manualでは一つのCorrectorノードに適用できるOpen FXは一つで、同じノードへドラッグすると既存の効果が置き換わります。

このように分けるのは、どのノードが色補正を、どのノードが光の演出を担当するかを比較できるようにするためです。21.1 Manualでは、Correctorノード内のOpen FXは他の通常の色補正より前に処理されると説明されています。ノードを分ければ、同一ノード内の処理順と調整が混ざることを避けられます。基本的な接続は[ColorのNode Graph](../learn/color-node-graph)を参照してください。

## 2. 文字の周りに近い赤い光を作る

1. Glowの**View Output**を**Source Regions**にし、何が発光の元として選ばれているか確認します。サインの文字が選ばれ、暗い壁や周囲の小物が不要に含まれないことを目標にします。
2. **Shine Threshold**を調整して、発光の元になる明るさの範囲を決めます。壁まで選ばれる場合は、選択範囲を狭める方向へ調整します。数値を固定せず、その素材の信号で判断します。
3. **Glow Alone**表示に切り替え、**Spread**で文字から出る光の広がりを、**Gain**で明るさを調整します。まず輪郭のすぐ外側に光が見える程度から始めます。
4. 文字の赤をそのまま利用できるなら、**Color Filter**で無理に別の赤へ染めません。光の色を揃える必要があるときだけColor Filterで着色します。**Saturation**は光自体の色の強さを変えます。
5. **Final Result**へ戻し、**Composite Type**を確認します。公式Manualで既定の**Screen**は柔らかい発光向け、**Add**はより強い発光向けと説明されています。まずScreenで文字の内部階調と背景の見え方を確認します。

この段階では、赤い文字の周りだけが光り、壁全体はまだ暗いままでよい状態です。文字が白く塗りつぶされたように見えるなら、GainだけでなくThreshold、Spread、Composite Typeをそれぞれ分けて点検します。

## 3. Secondary Glowで青い外側の光を作る

1. **Secondary Glow**の**Add Secondary Glow**を有効にします。
2. Secondary Glowの**Spread**を基本のGlowより広い見え方へ調整します。光が文字のすぐ周りだけでなく、壁の方向へ柔らかく広がるかを確認します。
3. Secondary Glowの**Color Filter**を青寄りに設定し、基本のGlowの赤と区別します。**Gain**は弱めから加え、青い光が赤い文字を覆わないようにします。
4. **Glow Alone**と**Final Result**を交互に見て、青い成分が遠い範囲に加わる一方、赤い中心部が残ることを確かめます。効果全体が強すぎるなら**Opacity**で戻します。
5. 02ノードを無効／有効にして、青い壁の暗部、赤い文字の縁、文字内部の三か所を比べます。Glowの設定値を変えずに適用前後を見れば、発光の影響範囲を追いやすくなります。

Secondary Glowは基本のGlowへ重なる二段目の発光です。青い壁の奥行きや表面形状を認識して照らすわけではないため、壁の凹凸や前景との遮蔽を厳密に表現する必要がある映像では、Windowなど別の手段を検討します。

## 4. 全尺で副作用を確認する

- **文字が潰れる：** Glowの**Bright Region Recovery**で効果によって消えた明部の見え方を調整できると21.1 Manualに記されています。ただし収録時点でクリップした階調が戻るという意味ではありません。[白飛びの診断](../troubleshooting/highlight-shadow-clipping)も参照します。
- **暗い壁まで一様に光る：** View OutputをSource Regionsへ戻してThresholdを見直します。元の映像に明るい反射が多い場合、Glowはサイン以外にも反応します。
- **画面の端だけ光が強い：** **Glow framing**の設定を確認します。Manualでは**Reflect in Camera**と**Vignette**でフレーム端の扱いが異なります。
- **再生中に光がちらつく：** サインの明るさがThreshold付近を行き来していないか、先頭・中央・終端とその間のフレームを再生して調べます。固定した静止画だけで完成判定しません。
- **青い光が大きすぎる：** Secondary GlowのSpreadとGainを別々に下げ、必要ならOpacityや効果共通の**Blend**を調整します。何を弱めたか分かるよう一度に一項目を変更します。
- **02ノードのオン／オフで変化が分からない：** FXバッジ、効果の有効状態、ノードのバイパスを確認します。[ノードの無効化による診断](../troubleshooting/node-bypass-diagnostics)を参照します。

[Scopes](../reference/scopes)で赤チャンネルの強いピークや暗部の持ち上がりを見ながら、Viewerでは文字の判読性と壁の見た目を確認します。Scopeだけで局所的な光の品質は判断できません。8秒を等速再生し、意図した光が連続するか、前後のショットと見比べて違和感がないか確認します。

## 出典・対象版・未検証範囲

- **対象版：** Blackmagic Design、[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)（September 2026）。Chapter 151「Using Open FX and Resolve FX」pp.3489–3490で、Colorページへの適用、FXバッジ、ノード内処理順、ノードごとの一効果制約を確認。
- **効果の仕様：** 同Manual Chapter 154「Resolve FX」p.3526（共通Blend）およびChapter 160「Resolve FX Light」pp.3590–3591。View Output、Shine Threshold、Spread、Gain、Composite Type、Bright Region Recovery、Secondary Glowの設定と用途を2026-10-26に直接確認。
- **確認済み：** 21.1 Manualに記載されたメニュー・操作と各設定の役割。
- **未検証：** Resolve 21.1実機での操作、上記25fps・8秒の想定素材の実際の画、発光の最適値、処理速度、Free／Studioでの利用差、素材ごとの色管理がGlowへ与える具体的影響。実写の比較画像や測定値はありません。よって**verification: partial**を維持します。

発光の追加は色補正済み素材でも結果が変わるため、納品前には[Color QC](./pre-delivery-color-qc)に沿って全尺を見直します。
