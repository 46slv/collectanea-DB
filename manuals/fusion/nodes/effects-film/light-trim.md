---
title: "Light Trim"
description: "log Imageの見かけの露出を、film scanner / labのlight trim pointで調整するNode。"
doc_type: node
term_id: "light-trim"
term_short: "Light Trimは、log Imageの見かけの露出をfilm scanner / labのtrim point単位で調整するNode。"
verification: partial
aliases: ["Light Trim", "LT"]
concepts: ["image-data", "mask-data"]
nodes: ["Light Trim"]
node_family: "effects-film"
controls: ["Lock RGBA", "Trim"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["stylize-image"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-05"
---
# Light Trim

Light Trimは、film scannerのlight trimを再現する考え方で、logarithmic dataの見かけの露出を上げ下げするNodeです。

21.1 Manualでは、Cineon、ARRI、Blackmagic RAWなどのlogarithmic dataで使うことを想定しています。一般的なlinear Imageの露出調整Nodeとして使うのではなく、log sourceをlinearへ変換する前段に置くのが基本です。

## 何をするNodeか

Light Trimはlog encodingそのものを変換するNodeではありません。入力されたlog 2D Imageに対して、film / optical printing / lab printingで使うtrim pointの尺度で明るさを調整します。

log → linear変換は[Cineon Log](./cineon-log)など別のNodeが担当します。

    Log Source → Light Trim → Cineon Log (Log to Lin) → Comp

この順序にすると、Light Trimでlog状態の露出を整えてから、compositing用のlinear Imageへ変換できます。

## 入力

### Input

オレンジ色の入力です。露出を調整したいlog 2D <Term id="image">Image</Term>を接続します。

### Effect Mask

青色の任意入力です。<Term id="mask">Mask</Term>を接続すると、Light Trimの効果をMask内へ限定できます。

たとえば画面全体ではなく、窓の外や人物だけを少し明るくしたい場合に使えます。21.1 Manualでは、Effect MaskはNodeの処理後に適用されると説明されています。

## 出力

trim後の2D Imageを出力します。log Imageをそのまま後段へ渡すので、必要に応じて後ろにCineon Logなどの変換Nodeを置きます。

## 主な設定項目

### Lock RGBA

有効時はR / G / B / Aをまとめて1つのTrimで動かします。21.1 Manualでは既定で有効です。

解除するとchannelごとにTrimを調整できます。全体の露出だけでなく、channel間のバランスも個別に調整したい場合に使います。

### Trim

film、optical printing、lab printingのtrim point単位で値を動かします。

21.1 Manualでは **8 points = 1 stop** とされています。たとえば1 stop相当の変化量を考えるときは、Light Trimの尺度では8 pointsが基準になります。

この値は一般的なlinear gainの数値ではなく、Light Trim固有のprinting / scanner系の尺度として扱います。

## 具体的な使い方

### log sourceの露出をcompositing前に整える

    MediaIn / Loader
        ↓
    Light Trim
        ↓
    Cineon Log (Log to Lin)
        ↓
    Key / Color / Composite

素材がlog状態のうちにLight Trimで明るさを整え、その後linearへ変換して合成処理へ進みます。

### 一部だけtrimする

    Log Source ─────────────→ Light Trim → Cineon Log
                                  ↑
    Polygon / Ellipse Mask ───────┘

Effect Maskを使えば、同じlog Imageの一部だけtrimできます。Nodeを分岐してMergeする必要がない単純な局所補正なら、この構成で済みます。

## Cineon Logとの違い

[Cineon Log](./cineon-log)はlog Imageとlinear Imageの変換を担当します。Light Trimはその変換前のlog Imageに対して、trim point単位で見かけの露出を調整します。

- **Light Trim** — log状態の露出をtrim pointで調整
- **Cineon Log** — log ↔ linearの変換

役割が違うため、Light TrimをCineon Logの代わりにはできません。

## 注意点

Light Trimはlogarithmic data向けです。すでにlinearへ変換したImageに対して同じ意味の「1 stop調整」を期待する使い方は、21.1 Manualの基本構成とは異なります。

また、exactな内部処理式、trim pointからpixel値への変換式、camera log curveごとの差はManualのこの節では説明されていません。本ページではそれらを推測していません。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）Chapter 98 Film Nodes pp.2320–2321で、Light Trimの用途、2 inputs、log data前提、Cineon Logより前へ置く構成、Lock RGBA、Trim、8 points = 1 stopを確認しました。
