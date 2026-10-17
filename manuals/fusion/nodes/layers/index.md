---
title: Layerノード
description: Fusionのマルチレイヤー画像を理解し、Layer Muxer・Layer Regex・Layer Remover・Swizzlerを用途から選ぶガイド。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, multilayer, exr]
updated: "2026-10-10"
---

# Layerノード

Layerノードは、**マルチレイヤー画像に入っている複数のLayerを結合・選別・削除・再構成する**ためのノードです。たとえばCGレンダーのEXRにBeautyとDepthが入り、別のレンダーにMotionがある場合、必要なデータを整理して後段へ渡せます。

単に画像を重ねて見た目を合成する[Merge](../compositing/merge)とは役割が異なります。

## まず「Layer」と「Channel」を区別する

- **Layer**：マルチレイヤー画像に含まれる、名前付きの画像データのまとまり。Beauty・Depth・Normal・MotionなどがLayer名として現れる場合があります。
- **Channel**：各Layerなどを構成する個別の成分。典型的なRGBA画像ではR・G・B・Aが該当し、深度などの補助データにも専用の成分があります。
- **Default / [Main] Layer**：画像の主な表示先として扱うLayer。Layer MuxerやLayer Regexの**Conflicts**は、2つの入力のどちらを出力のDefault / [Main]として選ぶかの設定です。
- **マルチレイヤー画像**：複数のLayerを同じ画像データの流れに保持している状態。通常のRGBA画像が、必ずDepthやNormalのLayerまで持っているわけではありません。

これらはFusionタイムライン上のクリップのレイヤーとは別の概念です。深度などのデータの使い方は[補助Channel / AOV](../../learn/02-data/auxiliary-channels)を参照してください。

## どのノードを使うか

| やりたいこと | 入力されるもの | 出力で変わるもの | ノード |
| --- | --- | --- | --- |
| 2つのEXRのLayerをまとめたい | Layerを持つ画像を2つ | Image 2から選んだLayerをImage 1へ追加 | [Layer Muxer](./layer-muxer) |
| 命名規則で一括処理したい | 名前付きLayerを持つ画像を2つ | 正規表現に一致したLayer名の変更・保持・除外 | [Layer Regex](./layer-regex) |
| 決まった不要Layerを消したい | Layerを持つ画像を1つ | チェックしたLayerを除外 | [Layer Remover](./layer-remover) |
| Layerの中身やChannelを組み替えたい | Layer / Channelを持つ画像 | 新しいLayerへのChannel割り当てなど | [Swizzler](../color/swizzler) |

Layer MuxerとLayer Regexは**Image 1 / Image 2の2入力**、Layer Removerは**Image 1の1入力**をManualに記載しています。ポート数や個別のInspector設定は各記事を確認してください。

## 制作の流れで考える

### 例1：別々のレンダーからDepthとMotionをまとめる

レンダーAにBeautyとDepth、レンダーBにBeautyとMotionが入っているとします。完成した合成でAのBeautyとDepth、BのMotionを使う場合です。

```text
レンダーA：Beauty / Depth  ─→ Layer Muxer：Image 1 ─┐
                                                     ├─ 統合したLayerを後段へ
レンダーB：Beauty / Motion ─→ Layer Muxer：Image 2 ─┘
```

Layer Muxerの**Layer = Custom**でB側のMotionだけを選びます。こうすると不要なB側のLayerまで受け取らず、必要なデータを一緒に扱えます。

両ソースにDefault / Main画像があるときは、**Conflicts**でどちらを出力のMainにするか指定します。この設定を同名の補助Layerすべての上書き規則と同一視しないでください。名前が衝突するなら、必要に応じてLayer Regexで接頭辞を付けるなどして整理します。

### 例2：合成に不要な仮出力Layerを消す

一つのEXRにBeauty・Depth・Normal・Tempがあり、Tempだけを使用しない場合は、次のように接続します。

```text
Loader（Beauty / Depth / Normal / Temp）
  → Layer Remover（Tempだけチェック）
  → 後段の合成やLayer処理
```

**Layer Removerはチェックした項目を残すのではなく、削除します。** ほかのLayerのチェックを誤って付けないようにします。

### 例3：多数のLayerを名前で整理する

Layer名に`right.1`、`right.2`などが含まれている場合、Layer Regexで`^right(.*)`を検索し、Transformと`Left$1`を指定すると、該当する名前を`Left.1`、`Left.2`へ変更できます。

正規表現の`^`は名前の先頭、`(.*)`は任意の文字列、`$1`はその取得部分を表します。対象の確認には**Tester**を使います。単に数個の固定Layerを除外したいだけなら、Layer RegexよりLayer Removerのチェックリストが簡単です。

## 確認しておくこと

マルチレイヤーを操作する前に、入力画像に実際に必要なLayerが存在するかを確認します。入力にないDepthやNormalをLayer Muxer / Layer Removerが生成するわけではありません。また、Layerを持つ出力が得られても、保存形式や後段ノードが同じLayer構造を保持するとは限りません。書き出し後の用途まで確認してください。

各ノードはLayerの操作を担当し、最終的な画面合成、Depthによるぼかし、法線を使ったリライティングなどは別の処理です。

## 出典と確認範囲

**DaVinci Resolve 21.1 Reference Manual、Chapter 106「Layer Nodes」、pp.2439–2451**のLayer Muxer、Layer Regex、Layer Remover、Swizzlerを基に整理しました。CGレンダーのLayer名と接続例は用途を説明するための例です。

21.1実機での全入力形式・同名Layer競合の細部・Free / Studio差は未検証です。
