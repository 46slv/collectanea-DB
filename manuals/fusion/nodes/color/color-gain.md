---
title: Color Gain
description: Fusionで2D ImageのRGBA別Lift・Gamma・Gain、RGB Saturation、明暗域別のBalance・Hueを調整するColor Node。
doc_type: node
term_id: color-gain
term_short: RGBAの明暗補正と、暗部・中間部・明部ごとの色かぶりや色相を調整するNode。
verification: partial
aliases: [Color Gain, Clr]
concepts: [image-data, color-adjustment, alpha, premultiplication]
nodes: [Color Gain]
node_family: color
controls: [Lock R/G/B, Gain RGBA, Lift RGBA, Gamma RGBA, Pre-Divide/Post-Multiply, RGB Saturation, CMY Brightness Highs/Mids/Darks, High/Mid/Dark Hue, Spline Display, Preset Simple/Smooth Ranges]
inputs: [image, mask]
outputs: [image]
tasks: [color-correct, channel-balance]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# Color Gain

Color Gainは、Fusionの2D <Term id="image">Image</Term>の明るさや色かぶりを補正するNodeです。R・G・B・Alphaを個別に扱う**Lift / Gamma / Gain**に加え、RGBの彩度、暗部・中間部・明部ごとの色の偏り（Balance）と色相（Hue）を調整できます。

たとえば、素材全体の赤みを少し弱めたあと、暗い部分だけ青く寄せる、といった補正を1つのNode内で組めます。ここでいうColor GainはFusionのNode名であり、Colorページのプライマリーカラーホイールそのものを指す名前ではありません。

## 入力・出力

```text
MediaIn / Loader ──→ Color Gain ──→ 後段のColor Node / Merge / MediaOut
                           ↑
                      Effect Mask（任意）
```

- **Input（オレンジ、必須）** — 補正したい2D Imageを接続します。
- **Effect Mask（青、任意）** — 補正を適用する場所を制限します。たとえばRectangleやPolygon Maskで一部分だけ色を変えられます。マニュアルでは、このマスクはNodeの色処理後に適用されると説明されています。
- **Output** — 色を補正した2D Imageを次のNodeへ渡します。

Effect Maskは「どこに補正を見せるか」を決める入力です。Imageに含まれるAlphaチャンネルそのものとは役割が異なります。詳しくは[マスク（Mask）](../../learn/02-data/mask)を参照してください。

## Gainタブ：Lift・Gamma・Gainの違い

3つとも明るさに関わりますが、同じ数値を入れても同じ結果にはなりません。

| Control | 主に変わる部分 | 調整の考え方 |
| --- | --- | --- |
| **Gain RGBA** | 明るい画素ほど変化量が大きい | 画素値に係数を掛ける。黒（0）は係数を変えても黒のまま |
| **Lift RGBA** | 暗い画素ほど変化量が大きい | 白（1）を保ちながら、暗部・中間部を持ち上げたり下げたりする |
| **Gamma RGBA** | 主に中間の明るさ | 黒（0）と白（1）を保ち、中間値を非線形に動かす |

### Gain：画素値を掛け算する

Gainを**1.2**にすると、値が**0.5**の画素は**0.6**になります（0.5 × 1.2）。値が**0**の画素は**0**のままです。明部の強さや、特定の色チャンネルの量を調整するときに使います。

たとえばR / G / Bがそれぞれ0.5の画素で、RのGainだけを1.2にすると、ほかの補正が無い場合は概ね **R 0.6 / G 0.5 / B 0.5** になります。RGBの連動を解除している場合の例です。

### Lift：暗部側を動かす

LiftはGainと違い、暗部ほど影響が大きくなります。マニュアルの例ではLiftを**0.5**にすると黒のRGB値（0, 0, 0）が（0.5, 0.5, 0.5）になり、白（1, 1, 1）は変わりません。暗い部分だけ持ち上げたいときはGainより意図に近くなる場合があります。

### Gamma：中間の明るさを動かす

Gammaは黒と白の端点を保ちつつ、その間の値を曲線的に動かします。中間調が暗すぎる、または明るすぎる場合に使います。Gainの掛け算とは異なるため、同じ画素へGainとGammaを順に適用しても、単一のGainで置き換えられるとは限りません。

### Lock R/G/BとAlpha

**Lock R/G/B**を有効にすると、R・G・Bの各Controlが連動します。解除すると、Rだけを弱くする、Bだけを上げるといったチャンネル別補正ができます。

**AlphaはRGBの連動対象ではありません。** Gain / Lift / GammaのRGBA欄でAlphaも調整できますが、Alphaは合成時の不透明度に関わります。色だけを直す作業では、意図せずAlphaを変えないよう注意してください。

### Pre-Divide/Post-Multiply

半透明のエッジを持つ素材など、RGBにAlphaが掛け合わされた（premultiplied）Imageを補正するための設定です。有効にすると、補正前にRGBをAlphaで割り、補正後に再びAlphaを掛けます。

合成済みCGやキーイング素材で縁の色がおかしくなる場合は、この設定と入力画像のAlpha形式を確認します。すべての素材で機械的に有効にする設定ではありません。仕組みは[プリマルチプライ（Premultiplication）](../../learn/04-compositing/premultiplication)を参照してください。

## Saturationタブ：RGBごとの彩度

**RGB Saturation**はR・G・Bそれぞれの色の強さを調整するControlです。個別チャンネルで**0.0**にすると、そのチャンネルに由来する色の強さを取り除き、**1.0**を超えると対応する原色の方向を強めます。

これは「Rチャンネルの画素値を0にする」という意味ではありません。単純にRGBの値を入れ替えたり、特定チャンネルを消去したりする処理とは分けて考えてください。全体の彩度調整だけで済む場合は[Brightness Contrast](./brightness-contrast)も候補です。

## Balanceタブ：暗部・中間部・明部の色かぶり

**Balance**では、画面の明るさに応じて**Highs / Mids / Darks**を分け、色の偏りと明るさを調整します。「画面の上・中央・下」ではなく、「明るい画素・中間の画素・暗い画素」の区分です。

色の調整では、**Red ↔ Cyan / Green ↔ Magenta / Blue ↔ Yellow**という対になる色の方向へバランスを動かします。たとえば暗部に青みがありすぎる素材なら、Darksの該当する色の対を調整します。Highs側はそのままにできるため、明るい部分の色までまとめて変える必要はありません。

マニュアルの**CMY Brightness Highs/Mids/Darks**に関する説明では、スライダーの通常範囲は**−1〜+1**、**0**が無補正です。範囲外の値を手入力することもできます。ただし大きく動かす前に、どの明るさ帯を対象にしているか確認してください。

## Hueタブ：明るさ帯ごとの色相

**High / Mid / Dark Hue**は、それぞれの明るさ帯の色相を回転させます。Balanceが色の対の方向へ偏りを調整するのに対し、Hueは色相環上で色をずらす操作です。マニュアルでは、Hue操作は明るさや彩度を変えずに色相を移動させるものとして説明されています。

- **正の値** — 色相環をRed → Yellow → Green → Cyan → Blue → Magentaの方向へ回します。たとえば赤は黄色寄りになります。
- **負の値** — 反対方向へ回します。たとえば赤はマゼンタ寄りになります。
- **−1.0または+1.0** — 色相を1周させ、元の色相へ戻ります。

通常のスライダー範囲は**−1〜+1**です。色相を少し直したい場合は小さな値から試し、Darksだけ、あるいはHighsだけを動かして違いを確認します。

## Rangesタブ：High / Mid / Darkの境界を決める

BalanceやHueで「暗部だけ」「明部だけ」を調整しても、素材によっては対象範囲が広すぎたり狭すぎたりします。そのときは**Ranges**タブで、どの明るさまでをDarks / Highsとみなすかを調整します。

**Spline Display**には4つのポイントと各ポイントのベジェハンドルがあり、暗部・明部の範囲が始まる位置、終わる位置、切り替わり方の滑らかさを設定します。**Midsは暗部と明部のどちらにも含まれない範囲として計算**されるため、Mids専用の独立した範囲ハンドルはありません。

**Preset Smooth Ranges**は滑らかな境界の初期状態、**Preset Simple Ranges**は直線的な境界へ戻すためのボタンです。境界を極端に狭くすると、補正する画素が急に切り替わって見えることがあるため、まずSmoothで自然につながる範囲を探します。

## 運用例：CG素材の赤みを抑え、暗部を少し青くする

合成するCG素材だけが背景より赤く、暗部の雰囲気も合わない場合を考えます。

1. `MediaIn → Color Gain → Merge`と接続し、Color Gainの結果をCG側の入力へ渡します。背景の色まで変えないようにします。
2. **Gain**タブでLock R/G/Bを解除し、RのGainを少し下げます。GとBはまず動かさず、赤みが減るかを確認します。
3. 暗部だけ青みを加えたい場合は**Balance → Darks**でBlue / Yellowの色バランスを青側へ少し動かします。明部まで青くなるなら**Ranges**でDarksの範囲を調整します。
4. 青みを足すのではなく色相全体をずらしたい場合は、Balanceを戻し、**Hue → Dark Hue**を少量動かして比較します。
5. 半透明エッジのあるCG素材なら、元のAlpha形式を確認した上で**Pre-Divide/Post-Multiply**の効果を比較します。

素材の一部分だけを調整する場合は、Effect MaskへRectangle / Polygon Maskなどを接続します。補正範囲を場所で限定するEffect Maskと、明るさで分類するRangesは併用できます。

## 迷ったときの確認

- **明部だけを明るくしたい** — まずGain。暗部が変わりすぎるなら別の補正方法も比較します。
- **黒を持ち上げたい** — Lift。Gainでは元の黒（0）は上がりません。
- **中間調を変えたい** — Gamma。暗部・明部とのバランスも確認します。
- **色だけのつもりが透明度も変わった** — RGBAのAlpha欄を確認します。Lock R/G/BはAlphaを保護するスイッチではありません。
- **色の境界が不自然** — Balance / Hueを使っているならRangesのSplineとSmooth / Simpleを確認します。
- **半透明の縁に色が出る** — 入力のpremultiplied AlphaとPre-Divide/Post-Multiplyを確認します。

## 関連Node

- [Brightness Contrast](./brightness-contrast) — Gain / Lift / Gamma / Contrastなど基本的な明るさ調整に集中するとき。
- [Color Corrector](./color-corrector) — Shadows / Midtones / Highlightsに加え、LevelsやHistogram Matchなども必要なとき。
- [White Balance](./white-balance) — グレー基準や色温度を使って色かぶりを補正したいとき。
- [Color Curves](./color-curves) — 特定の入力値を、自由に描いた曲線へ沿って変換したいとき。

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual**（September 2026）、Chapter 93「Color Nodes」、**pp.2171–2175**の「Color Gain [Clr]」を一次資料として確認しました。入力とEffect Mask、Gain / Saturation / Balance / Hue / Ranges各タブ、Lock R/G/B、Pre-Divide/Post-Multiply、RGB Saturation、色相スライダーの方向と範囲、RangesのSpline / presetを確認しています。

本文中の数値例は、確認できる乗算とマニュアルのLift例を基にした説明用です。正確な内部REGID、Gammaの実装式、HDR範囲外での演算、すべての初期値、Edition差や実機の描画性能までは確認していないため、`verification: partial`を維持しています。
