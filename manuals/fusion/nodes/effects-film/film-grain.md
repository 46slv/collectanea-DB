---
title: "Film Grain"
description: "生成したfilm grainを2D Imageへ加え、composite全体の粒状感を揃えるNode。"
doc_type: node
term_id: "film-grain"
term_short: "Film Grainは、生成したfilm grainをImageへ加えて複数素材の質感を揃えるNode。"
verification: partial
aliases: ["Film Grain", "FGr"]
concepts: ["image-data", "mask-data", "alpha", "premultiplication"]
nodes: ["Film Grain"]
node_family: "effects-film"
controls: ["Complexity", "Alpha Multiply", "Log Processing", "Seed", "Time Lock", "Monochrome", "Lock Size X/Y", "Size", "Strength", "Roughness", "Offset"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---
# Film Grain

Film Grainは、2D <Term id="image">Image</Term>へ生成したfilm grainを加えるNodeです。

素材ごとに残っているgrain量が違うまま合成すると、同じ画面の中でも要素ごとの質感が分かれて見えます。21.1 Manualでは、keyingやcompositingのために一度grainを減らした素材へ、最終compositeの後段で共通grainを戻す使い方が示されています。

旧[Grain](./grain)も互換性のため残っていますが、新規作業ではFilm Grainが基本です。

## 役割

入力Imageの明るさや設定に応じてgrain patternを生成し、元Imageへ加えます。

    Composite → Film Grain → MediaOut
                    ↑
                 Effect Mask

Film Grainは素材をぼかしてgrainを消すNodeではありません。grainを減らしたい場合は[Remove Noise](./remove-noise)などで前処理し、必要ならcomposite後にFilm Grainで共通grainを戻します。

## 入力

### Input

オレンジ色の入力です。grainを加えたい2D Imageを接続します。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>を接続すると、grainを見せる範囲を制限できます。

21.1 ManualではEffect MaskはNodeの処理後に適用されると説明されています。grain生成用の別Imageを受け取る端子ではありません。

## 出力

grainを加えた2D Imageを出力します。通常は最終compositeからMediaOut / Saverへ向かう終盤に置きます。

## 主な設定項目

### Complexity

独立したgrain layerを何層計算するかを決めます。

Complexityが1なら1 layer、4なら4つのgrain layerを別々に計算し、その平均結果を最終Imageへ使います。値を増やすと、digital grainに見えやすい規則性を減らしやすくなります。

「粒の大きさが異なる複数scaleを重ねる」設定ではありません。grainの大きさはSizeで別に調整します。

### Alpha Multiply

grain結果へsource ImageのAlphaを掛けます。

透明領域へgrainを出したくないpost-multiplied Imageでは有効にします。特に半透明pixelを含むelementへLog Processingを使う場合、最終的なpixel値は背景と合成するまで確定しないため、21.1 Manualはlog-processed grainを個別elementへ先に加えず、composite後に適用することを勧めています。

### Log Processing

有効時は、Imageの明るさに応じてgrain強度を非線形に変化させます。21.1 Manualでは既定で有効です。

film negativeのgrainは暗部より明部で目立ちやすく、RGB channelごとにも応答差があります。Log Processingはその傾向を近似し、blackではgrainを弱く、明るいpixelほどgrain variationを大きくします。

無効にすると、pixelの明るさに関係なくより均一なgrain responseになります。film matchingでは有効、一定強度のgrainが必要なImageでは無効から比較できます。

### Seed / Time Lock

Seedはrandom grain patternを決めます。同じSeedを使うNodeは同じrandom resultを生成します。Reseedで別patternへ切り替えられます。

Time Lockを有効にすると、frameごとのrandom seed更新を止めます。静止画やpattern比較には便利ですが、動画で使うとgrain patternも固定されます。

### Monochrome

有効時はRed / Green / Blueへ同じgrain設定を使います。

無効にすると、Size / Strength / RoughnessをRGB channelごとに調整できます。channelごとのgrain量や粒の見え方を合わせたい場合に使います。

### Lock Size X/Y / Size

Lock Size X/Yを外すと、grain kernelの横方向と縦方向の大きさを別々に調整できます。

Sizeはpixel sizeに対して相対的に計算されます。21.1 ManualではSize 1.0でgrain kernelが概ね2 pixelを覆うと説明されています。

### Strength

元pixel値からどの程度variationさせるかを決めます。

Strengthを上げるほど、元の値から離れた明暗variationが出やすくなります。Log Processingが有効な場合は、そのvariation量がImageの明るさにも影響されます。

### Roughness

grainへ低周波のvariationを加え、粒が均一に散るのではなく、まとまりを持って見える状態を作ります。

Roughnessが低いと全体のgrain variationは比較的均一で、高くするとcell状のむらやclumpingが見えやすくなります。

### Offset

deep blackでgrainをどの程度見せるかを調整します。

grain strengthを計算する前にpixel値をoffsetするため、暗部の値を持ち上げたものとしてgrain量を計算できます。黒でgrainが消えすぎる素材を合わせるときに使います。

## 最小構成

keyingやnoise reductionを含むcompositeでは、まず素材をcleanにしてから画面を完成させ、最後にFilm Grainを置きます。

    MediaIn → Remove Noise → Keyer → Merge ┐
                                            ├→ Film Grain → MediaOut
    CG / Graphic ───────────────────────────┘

1. Film Grainを最終Mergeの後段へ置きます。
2. まずMonochromeを有効にしたままSizeとStrengthを合わせます。
3. grainが均一すぎる場合だけRoughnessを調整します。
4. film sourceへ合わせる場合はLog Processingを有効にして暗部と明部の見え方を確認します。
5. RGB channel差が必要ならMonochromeを外してchannel別に追い込みます。

## 運用例

denoiseしたgreen screen素材とcleanなCGを同じshotへ合成する場合、素材ごとにgrainを戻すのではなく、keyingとMergeを終えた後のImageへFilm Grainを1回適用すると、画面全体へ同じgrain patternとresponseを与えられます。

一部分だけgrainを変えたい場合はEffect Maskで適用範囲を限定できます。ただし、要素ごとに異なるgrainを先に焼き込むと、後段で色やAlphaを調整したときにgrain量まで揃わなくなるため、目的が「shot全体の質感を統一すること」なら後段適用の方が管理しやすくなります。

## 挙動と注意点

- Complexityはgrain layer数と平均化を変える設定で、Sizeの代わりではありません。
- Log Processingを有効にすると暗部と明部でgrain強度が変わります。均一なdigital noiseを作る設定とは挙動が異なります。
- 半透明elementへlog-processed grainを先に適用すると、背景合成後の最終値に対してgrain量を合わせられません。最終composite後へ置く理由の一つです。
- Time Lockを有効にするとframeごとのgrain更新も止まります。動くgrainが必要なshotでは意図せず有効になっていないか確認します。
- Effect MaskはFilm Grain処理後の結果を制限します。

## 似たNode・関連Node

- [Grain](./grain) — legacy grain emulation。旧composition互換用
- [Remove Noise](./remove-noise) — grain / noiseを減らしてkeyingやcompositingをしやすくする
- [Merge](../compositing/merge) — 複数elementを合成し、その後Film Grainで共通grainを加えられる

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 98、pp.2313–2316で、Image / Effect Mask入力、最終composite後の基本配置、Complexity、Alpha Multiply、Log Processing、Seed / Reseed、Time Lock、Monochrome、Lock Size X/Y、Size、Strength、Roughness、Offsetを確認しました。

Film Grainの内部random algorithm、runtime上のexact parameter range、edition差、実機性能は未確認のため verification: partial としています。
