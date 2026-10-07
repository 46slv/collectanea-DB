---
title: "Fields"
description: "フレームとインターレースFieldを相互変換し、Field dominanceや処理modeを局所的に制御するFusion Node。"
doc_type: node
term_id: "fields"
term_short: "Fieldsは、2D Imageのframe / interlaced fieldを分離・補間・再結合し、Field dominanceと処理modeを調整するNode。"
verification: partial
aliases: ["Fields", "FLDs"]
concepts: ["image-data"]
nodes: ["Fields"]
node_family: "time-metadata"
controls: ["Operation", "Reverse Field Dominance", "Process Mode"]
inputs: ["image", "image"]
outputs: ["image"]
tasks: ["interlace", "deinterlace", "standards-conversion"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Fields

Fields [FLDs]は、**progressive frameとinterlaced fieldの扱いを変換・調整する**ためのNodeです。1本のImage streamからfieldを分離したり、片方のfieldを補間してframeへ戻したり、2本のImage streamを1つのinterlaced Imageへ組み合わせたりできます。

MediaIn / Loaderやgenerator側で素材全体のinterlace設定を決めるだけでなく、node treeの途中だけframe処理・field処理へ切り替えたい場合にも使います。

## Fieldとは

progressive映像では、1 frameが1枚の完成したImageとして扱われます。interlaced映像では、1 frameを時間の異なる2つの**field**に分けて扱います。

Fields Nodeで重要なのは、単に「映像を速くする / 遅くする」ことではありません。**frameとfieldの構造、field order、処理modeを変える**ことです。

この違いを誤ると、動いている輪郭に櫛状の線が出たり、motionが不自然に前後したりすることがあります。元素材がprogressiveかinterlacedか、field dominanceがどうなっているかを確認してから使います。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、次の2D Image入力が記載されています。

- **Stream1 Input**（orange）: 主入力。変換・補間するImageを接続します。
- **Stream2 Input**（green）: 任意。2本のImage streamをinterlaceするときだけ使います。
- **Output**: OperationとProcess Modeに従って変換された2D Imageを返します。

2入力でInterlaceする場合、ManualではStream1がdominantなField 1、Stream2がField 2として扱われます。

ManualのFields節には「single input」「effect mask」「blurred area」という、このNodeのport説明と整合しない一文もあります。一方、その直後のport一覧と本文ではStream1 / Stream2の2入力が明確に説明されています。このページでは矛盾する一文からEffect Mask入力を推測せず、明示されたStream1 / Stream2だけを確定情報として扱います。

## 何をするNodeか

Fieldsは、interlaced素材を扱うときの変換をnode tree内の特定区間へ限定できます。

たとえば次のような用途があります。

- interlaced frameから片方のfieldを取り出す
- 片方のfieldを除去し、残したfieldから補間して元のImage heightを保つ
- 1本または2本のImage streamからinterlaced Imageを作る
- 1本のinterlaced streamを2倍のfield sequenceへ分離する
- field dominanceを反転する
- node treeの一部だけFull Frame / NTSC Field / PAL Field処理へ切り替える
- PALからNTSCなどのstandards conversionを組む際のfield処理に使う

## Operation

Operationは、frame / fieldへどの変換を行うかを選びます。

### Do Nothing

fieldの分離・結合そのものは行わず、Process Modeの指定だけを適用します。

node treeの一部分だけframe処理またはfield処理へ強制したい場合に使えます。

### Strip Field 2

Field 2を削除します。

残るのはField 1だけなので、ManualではImage heightが元の半分になると説明されています。

### Strip Field 1

Field 1を削除します。

Field 2だけが残り、Image heightは元の半分になります。

### Strip Field 2 and Interpolate

Field 2を削除し、Field 1から新しいfieldを補間して、元のImage heightを維持します。

Manualでは、このmodeには**fieldではなくframeを入力する**よう説明されています。

### Strip Field 1 and Interpolate

Field 1を削除し、Field 2から補間して元のImage heightを維持します。

こちらもManualではframe入力を前提としています。

### Interlace

入力をfieldとして組み合わせ、interlaced Imageを作ります。

1本のImage streamだけを使う場合は、2枚ずつのframeを組み合わせます。Manualでは、結果は**frame数が半分になり、各Imageはdouble-heightになる**と説明されています。

2本のImage streamを使う場合は、Stream1とStream2から1 frameずつ取り、2つのfieldとして1枚のdouble-height Imageへ組み合わせます。

    Image A ── Stream1 / Field 1 ─┐
                                  ├─ Fields (Interlace) → Result
    Image B ── Stream2 / Field 2 ─┘

### De-Interlace

1本のinput streamからfieldを分離します。

Manualでは、**half-heightのImageが2倍の枚数**生成されると説明されています。つまり、interlaced frameをfield単位のsequenceへ展開する処理です。

一般的な「最終的なprogressive映像を作るdeinterlacer」と同じ意味で考えず、出力のframe countとheightがどう変わるかを確認して使います。

## Reverse Field Dominance

Reverse Field Dominanceを有効にすると、ImageのField Order / Dominanceを入れ替えます。

動きのある部分が1 fieldごとに前後して見える、field順が逆に見える、といった場合は、source側のfield dominanceとこの設定が一致しているか確認します。

ManualはここでField 1 / Field 2とupper / lower fieldの固定対応までは示していないため、このページでもその対応は断定しません。

## Process Mode

Process Modeは、このNode以降でImageをframe / fieldのどの形式として処理するかを指定します。

21.1 Manualには次の選択肢が記載されています。

- **Full Frames**: Frame Processingを強制する。
- **NTSC Fields**: NTSC Field Processingを強制する。
- **PAL Fields**: PAL Field Processingを強制する。
- **PAL Fields (Reversed)**: PALのfield orderを反転した状態で処理する。
- **NTSC Fields (Reversed)**: NTSCのfield orderを反転した状態で処理する。
- **Auto**: 入力Imageのmodeへ合わせようとする。入力typeが混在する場合はfield処理を使う。

素材全体のproject設定を変えず、特定のnode区間だけframe処理またはfield処理へ切り替えたいときに使えます。

## 具体的な使い方

### interlaced素材をnode tree内で変換する

Manualには、PAL interlaced ImageをFieldsへ入れ、progressive frameへ変換する例があります。

    PAL interlaced Image → Fields → 後段処理

実際にどのOperationとProcess Modeを選ぶかは、入力がframeとして入っているかfield sequenceとして入っているか、どの形式を後段へ渡したいかで変わります。元素材のfield orderと出力のframe count / heightを確認して設定します。

### 2本のImageからinterlaced Imageを作る

別々のImage streamをField 1 / Field 2としてまとめる場合は、Stream1とStream2を接続してInterlaceを使います。

Stream1がdominantなField 1、Stream2がField 2になります。2つのstreamが同じ解像度・時間位置を前提に扱えるかも確認します。

### node treeの一部だけfield processingへする

MediaIn / Loader側の設定を保ったまま、特定の処理区間だけfield processingへ切り替えたい場合は、FieldsのProcess Modeを使います。

    Image → Fields (Process Modeを指定) → field単位で扱いたい処理

Operation = Do Nothingなら、fieldの分離・結合を行わずProcess Modeだけを指定できます。

## 注意点

- FieldsはTime Speedのようなretime Nodeではありません。frame / fieldの構造と処理modeを扱います。
- Strip Field 1 / 2はImage heightを半分にします。heightを維持したい場合はInterpolationを伴うmodeとの違いを確認してください。
- Interlace / De-Interlaceはframe数やImage heightを変えるため、単にfield metadataだけを書き換える操作ではありません。
- field dominanceを誤ると、motionの順序が不自然になったりcomb状のartifactが見えたりすることがあります。
- ResolveのProject Settingsにあるinterlace processingやDeliver pageのField renderingとは別です。FieldsはFusion node tree内の局所的な処理を担当します。
- runtime REGID、Effects Library上のcurrent表示、edition差、Manual内で矛盾しているEffect Mask記述の実機上のport有無は、このページの確認範囲では断定していません。

## 関連

- [Time / Metadata / Utility Family Overview](./index.md)
- [Time Speed](./time-speed.md): 一定速度でsource frameを読み直すretime。Fieldsとは目的が異なる。
- [Time Stretcher](./time-stretcher.md): source timeをanimationする可変retime。Fieldsとは目的が異なる。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 111「Miscellaneous Nodes」のFields [FLDs]（pp.2593–2595）を基準にしています。

確認した項目は、Stream1 / Stream2、Field 1 / Field 2の扱い、Operation各mode、Reverse Field Dominance、Process Mode、PAL / NTSC field processing、frame countとImage heightへの影響、PAL interlaced Imageをprogressiveへ変換する基本例です。

Manual内にはFieldsのdocumented port構成と一致しないEffect Mask / blurの一文があるため、その部分は確定情報へ採用していません。runtime REGID、Effects Library上のcurrent表示、edition差、実機上のEffect Mask portは別verification対象として残し、verification: partialを維持しています。
