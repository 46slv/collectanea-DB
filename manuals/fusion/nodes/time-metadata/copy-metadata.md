---
title: "Copy Metadata"
description: "Foreground ImageのmetadataをBackground Imageへ結合・置換し、必要ならmetadataをすべて消去するFusion Metadata Node。"
doc_type: node
term_id: "copy-metadata"
term_short: "Copy Metadataは、Foreground ImageのmetadataをBackground Imageへ結合・置換するNode。"
verification: partial
aliases: ["Copy Metadata", "Meta"]
concepts: ["image-data"]
nodes: ["Copy Metadata"]
node_family: "time-metadata"
inputs: ["image", "image"]
outputs: ["image"]
controls: ["Operation"]
tasks: ["metadata"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Copy Metadata

Copy Metadata [Meta]は、Foreground Imageが持つ**metadataをBackground Imageへ結合（merge）または置換する**Metadata Nodeです。必要なら、出力Imageのmetadataをすべて消去することもできます。

このNodeで扱うのは画素ではなく、Imageに付随するmetadataです。21.1 ManualではBackground Inputの2D Imageが出力の基準になり、Foreground Inputは移したいmetadataの供給元として説明されています。

## 入力と出力

21.1 Manualでは、2系統の2D Image入力が記載されています。

- **Background Input**: orange input。出力の基準になる2D Imageを接続します。
- **Foreground Input**: green input。Background側へmergeまたはoverwriteしたいmetadataを持つ2D Imageを接続します。
- **Output**: Background InputのImageに、`Operation`で指定した方法でmetadataを反映した結果です。

基本構成は次のようになります。

```text
Background Image ───────────────┐
                               ├─ Copy Metadata → Result
Foreground Image (metadata) ───┘
```

Copy Metadataは、[Merge](../compositing/merge.md)のようにForegroundを画として重ねるNodeではありません。Foreground Inputは、ここではmetadataの供給元として使います。

## 何をするNodeか

たとえばBackground ImageとForeground Imageの両方にmetadataがあり、Foreground側の情報をBackground側へ引き継ぎたい場合に使います。

処理の結果として画面上の見た目が変わらなくても、出力Imageのmetadata tableは変化します。metadataはViewerのsubviewで確認できます。

Copy Metadataが変更する対象はmetadataです。再生速度やsource frameを変更するretime、Imageのbit depth変更、Domain of Definitionの変更とは別の処理です。

## Controls

### Operation

`Operation`は、BackgroundとForegroundのmetadataをどう扱うかを決めます。

- **Merge (Replace Duplicates)**: 両方のmetadataを結合します。同じ名前のfieldがある場合は、Foreground側の値を採用します。
- **Merge (Preserve Duplicates)**: 両方のmetadataを結合します。同じ名前のfieldがある場合は、Background側の値を残します。
- **Replace**: Background側のmetadata全体をForeground側のmetadataで置き換えます。
- **Clear**: metadataをすべて破棄します。

同名fieldがあるときにどちらを残したいかで、2つのMerge modeを選び分けます。

Settings tabにはMetadata Nodeで共通するControlsがあります。このページではCopy Metadata固有の`Operation`を中心に扱います。

## 主な用途

### 別branchのmetadataを処理済みImageへ引き継ぐ

画素処理を進めたBackground Imageへ、別branchが保持しているmetadataを移したい場合に使えます。

```text
MediaIn A → 画素処理 ───────────────────→ Background
MediaIn B ─────────────────────────────→ Foreground
                                           │
                                      Copy Metadata
                                           ↓
                             Aの画 + 反映されたmetadata
```

ここでForeground側の画を合成したいわけではなく、必要なのはそのImageが持つmetadataです。

### 同名fieldの優先側を決めて結合する

BackgroundとForegroundに同じ名前のmetadata fieldがある場合は、`Merge (Replace Duplicates)`と`Merge (Preserve Duplicates)`で残す側を選べます。

Foreground側を新しい値として優先したいなら`Merge (Replace Duplicates)`、Background側の既存値を守りたいなら`Merge (Preserve Duplicates)`を使います。

### metadataだけを消去する

`Clear`を使うと、Copy Metadataの出力からmetadataをすべて破棄できます。後段処理がmetadataに依存しているかを確認したいときなど、metadataの有無を切り分ける用途にも使えます。

ただし、ここで消えるのはCopy Metadataを通過するImageのmetadataです。最終fileへどのmetadataが入るかは、Saver / Deliver、container、codecなどの出力経路とは別に確認します。

## 最小構成

既存metadataを別Imageへ移す最小構成は次の形です。

```text
Background Image ─────→ Copy Metadata → Viewer
                         ↑
Foreground Image ────────┘
```

Viewerで出力を表示し、metadata subviewでfieldが期待どおりmerge / replace / clearされているか確認します。

## 運用例

任意のfieldを作る[Set Metadata](./set-metadata.md)と組み合わせると、Copy Metadataの挙動を小さな構成で確認できます。

```text
MediaIn A ─────────────────────────────→ Background
MediaIn B → Set Metadata ─────────────→ Foreground
              ShotName = SH010              │
                                       Copy Metadata
                                       Operation:
                                       Merge (Replace Duplicates)
```

この構成では、Background側の画を維持したまま、Foreground側に用意した`ShotName = SH010`をmetadataとして出力へ反映する、という確認ができます。これはNodeの挙動を確認するための構成例であり、21.1 Manualの公式作例そのものではありません。

## Set Metadata / Set Timecodeとの違い

- **Copy Metadata**: 2つ目のImageがすでに持っているmetadataをBackground Imageへmerge / replaceする。必要ならclearする。
- **Set Metadata**: `Field Name`と`Field Value`を指定し、新しいName = Value pairを1系統のImageへ追加する。
- **Set Timecode**: FPSとframe位置に基づくtimecode metadataを生成する。

新しい任意fieldを作るなら[Set Metadata](./set-metadata.md)、別Imageから既存metadataを移すならCopy Metadata、timecodeを生成するなら[Set Timecode](./set-timecode.md)を使います。

## 確認方法

21.1 Manualでは、metadataはViewerのsubviewで確認できると説明されています。

Copy Metadataを接続しても通常のViewer画像だけでは差が分からないことがあります。見た目の変化ではなく、metadata subviewで対象fieldと値を確認します。特に同名fieldがある場合は、選んだ`Operation`に応じてForeground / Backgroundのどちらの値が残ったかを確認すると、modeの違いを判断できます。

## 注意点

- Copy Metadataはretime Nodeではありません。source frameや再生速度を変更しません。
- bit depthやDomain of Definitionを変更するNodeでもありません。
- `Replace`はBackground側のmetadata全体をForeground側のmetadataで置き換えます。単一fieldだけを追加する用途とは挙動が異なります。
- `Clear`でNode出力のmetadataを消しても、最終fileにmetadataが一切含まれないことまで保証するものではありません。出力経路側で追加される情報は別に確認します。
- runtime REGID、Effects Library上のcurrent表示、edition差、Operationのdefaultは、このページの確認範囲では断定していません。

## 関連Node

- [Time / Metadata / Utility Family Overview](./index.md)
- [Set Metadata](./set-metadata.md): 任意のName = Value metadata pairを作る場合。
- [Set Timecode](./set-timecode.md): timecode metadataを生成する場合。
- [Merge](../compositing/merge.md): 2つのImageを画として合成する場合。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、Chapter 110「Metadata Nodes」の`Copy Metadata [Meta]`（pp.2571–2573）を基準にしています。

確認した項目は、orange Background Inputとgreen Foreground Inputの2系統の2D Image入力、Background Imageが出力の基準になること、Foreground Imageがmetadata sourceになること、Viewer subviewでmetadataを確認できること、`Operation`の4 modeとduplicate fieldの扱いです。

runtime REGID、Effects Library上のcurrent表示、edition差、Operationのdefaultはこの確認範囲に含めていないため、`verification: partial`を維持しています。
