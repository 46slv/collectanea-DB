---
title: "TV"
description: "アナログテレビの走査線、同期ずれ、ノイズ、横切る暗い帯を作るFusion Node。Inspectorの3つのタブと具体的な使い方を解説。"
doc_type: node
term_id: "tv"
term_short: "TVは、走査線・映像のずれ・ノイズ・横切る帯でアナログテレビ風の乱れを作る2D Node。"
verification: partial
aliases: ["TV"]
concepts: ["image-data", "mask-data", "compositing"]
nodes: ["TV"]
node_family: "effects-film"
controls: ["Scan Lines", "Horizontal", "Vertical", "Skew", "Amplitude", "Frequency", "Offset", "Power", "Size", "Random", "Bar Strength", "Bar Size", "Bar Offset", "Blend"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["analog-tv", "scan-lines", "signal-interference", "stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# TV

TV [TV]は、2D <Term id="image">Image</Term>に走査線、画面全体のずれ、波打つような歪み、ノイズ、横切る暗い帯を加えて、アナログテレビの受信不良や古い画面を表現するNodeです。

Blackmagic Designの21.1 Manualは、DaVinci Resolveではより高機能な**Analog Damage（ResolveFX）**があるため、TVは現在では用途の限られるFusion固有のNodeと説明しています。簡単な走査線や同期ずれを1つのNodeで試したいときに使えます。両者を同一のNodeとして扱わないでください。

## 入力・出力と処理範囲

- **Input（オレンジ）**：効果を加える元の2D画像。動画、静止画、文字を画像化したものを接続します。
- **Effect Mask（青）**：TVの効果を見せる領域を指定する任意入力。Rectangleなどの<Term id="mask">Mask</Term>を接続できます。マスクはTVの処理後に適用されます。
- **出力**：歪みやノイズを加えた2D画像。Mergeなどの後段の画像処理やMediaOutへ接続できます。

MediaIn → TV → MediaOut が最小構成です。別の映像に古いテレビ画面を重ねたい場合は、TVの出力を[Merge](../compositing/merge.md)のForeground側へ接続します。

Effect Maskはノイズを生成する範囲を事前に限定する入力ではありません。画面の一部分だけをTV風にしたい場合に使い、元画像の特定部分だけを入力したい場合はTVより前の段階で画像を加工します。

## Controlsタブ：走査線と画像の歪み

Controlsは**線を間引く処理**と**入力画像を幾何学的にずらす処理**を扱います。まずScan Linesだけを動かし、次に画像のずれを加えると違いを把握しやすくなります。

### Scan Lines

表示する水平ラインを間引き、インターレース風の縞を作ります。Manualはラインを黒・透明Alphaに落とす処理として説明しています。

- **0**：走査線効果なし。
- **1**：1本おきのラインを落とす。21.1 Manualに記載された初期値です。
- **2**：1本を表示し、続く2本を落とすパターンを繰り返す。

線を落とす数を増やすと文字や細線が読みにくくなるため、タイトルを見せる映像では最終表示サイズで確認します。

### Horizontal / Vertical / Skew

- **Horizontal**：画像全体を水平方向へずらします。キーフレームで急に値を切り替えると、水平同期が乱れたような瞬間的なずれを作れます。
- **Vertical**：画像全体を垂直方向へずらします。ゆっくり動かすと、画面位置が落ち着かない映像になります。
- **Skew**：斜め方向の傾きを加えます。正の値では左上方向、負の値では右上方向に傾きます。フレーム外へ押し出された画素は反対側へ回り込んで表示されます。

Skewの回り込みは画像の端で意図しない色や形が見える原因になります。必要に応じて後段で切り取り、構図を調整します。

### Amplitude / Frequency / Offset

この3項目は組み合わせて使い、画像の端がなめらかに波打つような歪みを作ります。

- **Amplitude**：波形による変形の強さ。大きくすると歪みが目立ちます。
- **Frequency**：波形の繰り返しの細かさ。Amplitudeによる変形と組み合わせて使います。
- **Offset**：波形の位置を動かします。アニメーションさせると歪みが画面内を移動するように見せられます。

先にAmplitudeで変形を確認してからFrequencyとOffsetを調整すると、それぞれの変化が分かりやすくなります。

## Noiseタブ：受信ノイズ

Noiseは、映像の上にアナログ放送の受信不良を思わせるノイズを加えるタブです。

- **Power**：ノイズの強さ。0より大きくするとノイズが現れ、値を上げるほど目立ちます。
- **Size**：ノイズパターンの大きさ。増やすとノイズマップが拡大されます。
- **Random**：ノイズパターンの変化を制御します。0に固定すると静止したパターンになり、時間とともに値を変えるとフレームごとにノイズの見え方を変えられます。

テレビの「砂嵐」を静止画像のように見せたくない場合は、PowerだけでなくRandomにもキーフレームを設定します。Randomはノイズ量を決めるPowerとは役割が違います。

## Roll Barタブ：画面を横切る帯

Roll Barは、映像を横切る暗い帯を作るタブです。画像全体の位置ずれや粒状ノイズとは別の現象を表現します。

- **Bar Strength**：帯の暗さ。初期値0では帯を描画せず、大きくすると帯がより暗くなります。
- **Bar Size**：帯の高さ。大きくすると広い範囲を覆います。
- **Bar Offset**：帯の位置。キーフレームで動かすと帯が画面を流れるように見えます。

帯が見えないときは、Bar Offsetを動かす前にBar Strengthが0のままではないか確認します。

## 具体例：古いテレビの受信映像を作る

録画映像やニュース素材を古いテレビの画面に見せたい場合の基本構成です。

1. MediaInの映像をTVのInputへ接続してViewerに表示します。
2. Controlsタブで**Scan Lines = 1**から始め、ライン間引きによる見え方を確認します。文字が読めなくなる場合は調整します。
3. Noiseタブの**Power**を少し上げ、**Size**で粒の大きさを調整します。**Random**へ時間変化を付け、ノイズが毎フレーム変わるようにします。
4. Controlsタブの**Horizontal**や**Skew**を一瞬だけ変えるキーフレームを作り、受信が不安定になったようなカットを挟みます。
5. 必要ならRoll Barの**Bar Strength**と**Bar Size**で暗い帯を作り、**Bar Offset**をアニメーションさせます。
6. 他の映像へ重ねる場合はTVの出力をMergeへ接続します。効果が強すぎるときはSettingsタブの**Blend**を下げ、元画像と混ぜます。

同じ歪みを常に強く掛けるより、通常の映像と短い乱れを交互に置くと、情報を読ませながら受信不良を表現できます。これはManualの各パラメータを使った演出例であり、公式プリセットではありません。

## 具体例：画面の一部分だけを乱す

元映像の一部だけに「電波が乱れた窓」を作る場合は、TVのEffect MaskにRectangleをつなぎます。

1. MediaInをTVへ接続し、NoiseのPowerとControlsのAmplitudeで乱れを作ります。
2. RectangleをTVの青いEffect Mask入力へ接続し、乱れを見せたい範囲に合わせます。
3. TVの出力を確認し、マスク内には処理結果、外には元画像が残ることを確認します。

これは**処理後に適用するマスク**です。TVへ入る映像そのものを切り抜いて処理したい場合は、前段で[Maskの基礎](../../learn/02-data/mask.md)を参照して構成を変えます。

## 使い分け・注意点

- **[Grain](./grain.md) / [Film Grain](./film-grain.md)**：粒状感が主目的ならこちらを検討します。TVはノイズだけでなく、走査線・位置ずれ・歪み・帯を組み合わせます。
- **Analog Damage（ResolveFX）**：21.1 Manualは、DaVinci Resolveでアナログ映像の劣化を幅広く作る手段としてこちらを挙げています。TVと同一のInspector構成ではありません。
- **SettingsタブのBlend**：0なら入力画像のまま、1ならTVの処理結果を表示します。これはノイズ量ではなく、Node全体の処理前後を混ぜる共通設定です。
- **Effect Mask**：TVを処理した後の適用領域を決めます。ImageのAlphaそのものや、前段でどの画像を入力するかとは区別します。
- **実機差**：Manualに記載されていない既定値・全レンジ・Edition別の利用可否・描画性能は、この記述だけでは確定しません。

2D ImageやAlphaの扱いは[Imageの基礎](../../learn/02-data/image.md)、ほかの近い効果は[Effect / Filmノード一覧](./index.md)から確認できます。

## バージョンと出典

**一次資料**：Blackmagic Design, *DaVinci Resolve 21.1 Reference Manual*（September 2026）、Chapter 97「Effect Nodes」、**TV [TV]（pp.2303–2305）**。Input / Effect Maskと、Controls・Noise・Roll Barの3タブについて確認しました。SettingsタブのBlendは同章の「The Common Controls」（p.2306）を参照しています。

本記事の操作例は、Manualが記載するパラメータを用いた構成例です。Resolve / Fusion 21.1実機での挙動、内部REGID、正確な全パラメータ範囲、Edition差は未検証のため、verificationはpartialとしています。
