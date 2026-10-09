---
title: Wireless Link
description: 離れた2D Nodeのoutputをpipeなしで参照し、同じImage streamを別の位置から取り出すrouting Node。
doc_type: node
term_id: wireless-link
term_short: 離れた2D Nodeのoutputをpipeなしで参照するrouting Node。
verification: partial
aliases: [Wireless Link, Wire]
concepts: [graph-flow, connection, image-data]
nodes: [Wireless Link]
node_family: time-metadata
controls: [Input]
outputs: [image]
tasks: [route-graph, organize-flow]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-07"
---

# Wireless Link

Wireless Link [Wire]は、Node Editor上で離れた2D Nodeのoutputを長いpipeで接続せずに参照し、そのImageを自分のoutputから取り出すNodeです。

ImageへEffectを加えるNodeではなく、複雑になったNode treeの配線を整理するために使います。

## 何をするNodeか

通常は、あるNodeのoutputを別のNodeへ渡すとき、両者をpipeで直接つなぎます。

~~~text
Source Node ─────────────────────→ Target Node
~~~

Wireless Linkを使うと、Source NodeをInspectorから参照し、Node Editor上ではSourceからWireless Linkまでのpipeを引かずに同じ2D Imageを受け取れます。

~~~text
Source Node
    ⋮  Inspectorから参照
Wireless Link → Target Node
~~~

元のNodeに加えた変更はWireless Link側にも反映されます。固定したImageを複製する機能ではなく、元Nodeの現在のoutputを別の位置から参照するための接続です。

## 入力と出力

### 入力端子

Wireless Linkには**入力端子がありません**。

Node Editorでpipeを接続する代わりに、Inspectorの`Input` fieldへ参照元の2D Nodeを指定します。

### 出力

Wireless Linkからは、参照した2D NodeのImageを後段へ接続できます。

つまり、接続の入口だけが通常のpipeではなくInspector参照になり、Wireless Link以降は通常の2D Imageとして扱えます。

## 主な設定項目

### Input

Controls tabにある唯一のWireless Link固有Controlです。

21.1 Manualでは、Node Editorにある参照元の2D Nodeを、この`Input` fieldへドラッグして設定します。現在の記事で以前記載していた「Node名を入力して参照する」という操作ではありません。

設定後は、参照元Nodeの変更がWireless Linkへ反映され、そのoutputを近くのNodeへ接続できます。

## 最小構成

たとえば、Graphの左側で作ったTransform後のImageを、右側の処理へ渡したい場合は次のように使えます。

~~~text
MediaIn → Transform
             ⋮
             ⋮ TransformをWireless LinkのInputへ指定
             ⋮
        Wireless Link → Blur → Merge
~~~

これはWireless Linkの接続方法を示す構成例です。TransformとWireless Linkの間には長いpipeを引かず、Wireless LinkからBlur以降だけを通常どおり接続します。

## 主な用途

### 離れた処理へ中間Imageを渡す

大きなGraphで、左側にある中間結果を右側のbranchでも使いたい場合に、画面を横切る長いpipeを減らせます。

参照元をWireless Linkの`Input`へ指定し、Wireless Linkを利用先の近くへ置くことで、利用先周辺の配線を短くできます。

### 長いpipeが重なって読みにくい箇所を整理する

複数の長いpipeが交差して、どの線がどこへ向かっているか追いにくい場合に使えます。

ただし、Wireless Linkへ置き換えれば常に読みやすくなるわけではありません。参照元との線が見えなくなるため、必要な場所だけに使います。

## 通常のpipeとの使い分け

Blackmagic DesignのManualでも、Node treeは接続関係が見えること自体に利点があるため、できるだけGraphを可視のまま保つよう注意されています。

そのため、基本は通常のpipeで接続し、次のような場合にWireless Linkを検討します。

- 参照元と利用先が大きく離れていて、長いpipeがGraphを横断する
- 長距離pipeが他の接続と重なり、追跡しにくくなっている
- Wireless Linkを置くことで、利用先のまとまりを明確にできる

短い接続までWireless Linkへ置き換えると、画面を見ただけではdataの流れを追えなくなります。

## Switchとの違い

[Switch](./switch.md)は、複数の2D Image inputから**どれをoutputへ通すか選ぶ**Nodeです。

Wireless Linkは複数sourceを切り替えるNodeではありません。1つの2D Nodeをpipeなしで参照し、そのoutputを別の場所へ渡すために使います。

## 関連する考え方

- [画像（Image）](../../learn/02-data/image.md)
- [Time / Metadata / Utility Family Overview](./index.md)

## 挙動と注意点

- Wireless Link自体には入力端子がありません。参照元はControls tabの`Input` fieldで指定します。
- 参照できる対象として21.1 Manualが明記しているのは**2D Node**です。Shape、Particle、Classic 3D、USD等の別data domainを同じ方法で直接参照できるとは、このページでは断定しません。
- 元Nodeの変更はWireless Link側へ反映されます。参照時点のImageを固定保存するNodeではありません。
- Wireless Linkを多用すると、Node Editor上のpipeだけでは依存関係を追えなくなります。配線を短くする利点と、接続元が見えなくなる欠点を比較して使います。
- runtime REGID、内部Parameter ID、edition差、参照元Nodeのrename / delete時のexactな挙動は、このページの確認範囲では断定していません。

## バージョンと出典

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 111「Miscellaneous Nodes」の`Wireless Link [Wire]`（pp.2613–2614）を基準にしています。

Manualで確認した範囲は、Wireless Linkが2D Node同士をwirelessに接続する用途、入力端子がないこと、Controls tabの単一`Input` field、Node Editorから2D Nodeを`Input`へドラッグして設定する操作、元Nodeの変更がWireless Linkへ反映されること、Wireless Linkのoutputを後段へ接続できることです。

runtime REGID、内部Parameter ID、edition差、参照切れ時の挙動は別verification対象として残しているため、`verification: partial`を維持しています。
