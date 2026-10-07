---
title: Frame Average
description: 複数の前後frameを平均して1枚のImageへまとめ、long-shutter風の残像、time-warp表現、noise低減に使う時間方向の平均Node。
doc_type: node
term_id: frame-average
term_short: Frame Averageは、複数frameを平均して現在frameのImageを作るNode。
verification: partial
aliases: [Frame Average, Avg]
concepts: [image-data, time]
nodes: [Frame Average]
node_family: time-metadata
controls: [Sample Direction, Missing Frames, Frames]
inputs: [image]
outputs: [image]
tasks: [frame-average, temporal-denoise, average, motion-trail]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-07"
---

# Frame Average

Frame Averageは、**現在frameの前後から複数frameを読み、その画素値を平均して1枚のImageを作るNode**です。

DaVinci Resolve 21.1 Reference Manualでは、long shutterで撮影したような見た目の再現に加え、time warpやnoise removalにも使えるNodeとして説明されています。

~~~text
2D Image
   ↓
Frame Average
   ├─ Sample Direction
   ├─ Frames
   └─ Missing Frames
   ↓
複数frameを平均した2D Image
~~~

動いている被写体は複数の位置が同時に混ざるため、残像やmotion blurに近い見た目になります。逆にcameraとsceneがほぼ固定され、frameごとの差が主にnoiseなら、複数frameの平均によってnoiseを目立ちにくくできます。

## 入力と出力

21.1 Manualで確認できる入力は1つです。

- **Input** — orangeの2D Image input。平均化したいImageを接続します。
- **Output** — Frame Averageで時間方向に平均化されたImageを後段へ渡します。

Frame Averageはmotion vectorや別のguide inputを受け取るNodeではありません。入力Imageの複数frameそのものを使って平均します。

## Inspector

### Sample Direction

どの方向のframeを平均に含めるかを選びます。

- **Forward** — 現在frameより後ろにあるfuture frameを、Framesで指定した数だけ平均します。
- **Both** — 現在frameの前後からframeを取り、平均します。
- **Backward** — 現在frameより前にあるpast frameを、Framesで指定した数だけ平均します。

たとえば右へ移動するobjectをBackwardで平均すると、現在位置より前の軌跡が混ざります。Forwardでは現在位置より後の位置が混ざります。Bothは前後をまとめて平均するため、現在frameを中心に広がる残像を作るときに使えます。

### Frames

平均に使うframe数を指定します。

値を増やすほど、より長い時間範囲のImageが1枚へ混ざります。long-shutter風の残像は長くなり、固定shotのnoise低減ではより多くのframeが平均対象になります。その一方で、cameraや被写体が動いている場合はghostingやblurも大きくなります。

### Missing Frames

必要なframeがclip内に存在しない場合の扱いを指定します。clipの先頭・末尾付近でSample Directionが範囲外を参照するときにも関係します。

- **Duplicate Original** — 新しい有効frameが得られるまで、最後のoriginal frameを使います。
- **Blank Frame** — 存在しないframeをblankとして扱います。

clip edgeで平均結果の明るさや見え方が変わる場合は、FramesだけでなくMissing Framesも確認します。

## 主な用途

### long-shutter風の残像

moving objectをFrame Averageへ通し、Framesを増やすと、複数時刻のobject位置が1枚へ平均されます。

motion blurのように1frame内の移動量を推定してblurを生成するのではなく、**実際の複数frameを混ぜる**ため、動き方や背景との重なりによっては輪郭が複数見える残像になります。

Sample Directionで、現在frameより過去・未来・前後のどこを混ぜるかを選べます。

### 固定shotのnoise低減

cameraも被写体もほぼ動かないshotでは、frameごとに変化するnoiseを平均して目立ちにくくできます。

~~~text
固定cameraのplate
      ↓
Frame Average
Sample Direction: Both
Frames: 数frame
      ↓
時間方向に平均されたplate
~~~

ただし、葉の揺れ、人物、照明変化、camera vibrationなども平均されます。noiseだけを分離して処理するNodeではないため、scene内に動きがあると、その部分はghostやblurとして残ります。

### time-warp表現の時間blend

Manualではtime warpも用途として挙げられています。

Frame Averageは再生速度やsource timeそのものを変更するNodeではありません。retimeしたImageの前後frameを平均して、時間方向のblendを追加したい場合に使います。

## Time Speed / Time Stretcherとの違い

[Time Speed](./time-speed)と[Time Stretcher](./time-stretcher)は、current frameにどのsource timeを対応させるかを変更するretime Nodeです。

Frame Averageはsource timeの対応関係を作り替えるのではなく、**1つの出力frameを作るために複数のinput frameを平均**します。

- 再生速度を変える — Time Speed
- source timeを直接指定してretime / freezeする — Time Stretcher
- 複数frameを1枚へ平均する — Frame Average

retimeとtemporal averagingは役割が異なるため、必要なら組み合わせて使います。

## Optical Flow系との違い

Frame Averageはmotionを解析してobjectを追跡したり、motion vectorで位置をalignしてから平均したりしません。

Optical Flow系は隣接frame間のmotionを解析し、そのvectorをretimeやframe生成などに利用します。Frame Averageはより単純で、指定方向の複数frameをそのまま平均します。

そのため、camera movementや速いsubject movementを含む素材では、Frame Averageだけでmotion-compensatedなnoise reductionにはなりません。

## 注意点

Frame Averageは時間方向に複数frameを参照するため、現在frameだけを処理する通常のImage effectとは評価の仕方が異なります。Framesを大きくすると参照する時間範囲も広がります。

また、平均化したい対象にscene cutが含まれると、cut前後のImageが同時に混ざる場合があります。long-shutter表現では意図した結果になることもありますが、noise低減では通常避けます。

このページでは21.1 Manualで確認できるControl名と選択肢を基準にしています。current runtimeのREGID、内部Parameter ID、Manualに記載されていないdefault / range、edition差は確定していません。

## 関連ページ

- [Time / Metadata / Utility Family Overview](./)
- [Time Speed](./time-speed)
- [Time Stretcher](./time-stretcher)
- [SpeedWarp](./speedwarp)
- [Optical Flow Family](../optical-flow/)

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 111「Miscellaneous Nodes」pp.2596–2597を基準にしています。

p.2596で、Frame Averageが複数frameを平均し、long-shutter風の表現、time warp、noise removalに使えることと、single orange 2D Image inputを確認しています。pp.2596–2597でSample Direction、Missing Frames、Framesの各Controlと、Forward / Both / Backward、Duplicate Original / Blank Frameの選択肢を確認しています。
