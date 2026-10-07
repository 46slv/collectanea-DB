---
title: "Set Metadata"
description: "2D Imageへ任意のName = Value形式のmetadata fieldを追加するFusion Metadata Node。"
doc_type: node
term_id: "set-metadata"
term_short: "Set Metadataは、Field NameとField Valueを指定して2D Imageへ任意のmetadataを追加するNode。"
verification: partial
aliases: ["Set Metadata", "SMeta"]
concepts: ["image-data"]
nodes: ["Set Metadata"]
node_family: "time-metadata"
inputs: ["image"]
outputs: ["image"]
controls: ["Field Name", "Field Value"]
tasks: ["metadata"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-07"
---

# Set Metadata

Set Metadata [SMeta]は、入力した2D Imageへ**任意のmetadataをName = Valueの組として追加する**Metadata Nodeです。

画素そのものを加工するNodeではありません。Imageに付随する情報を追加し、metadataを含んだ同じ2D Imageを後段へ渡します。追加したmetadataは、metadata表示に対応したViewerのsubviewで確認できます。

## 入力と出力

21.1 Manualで記載されているImage入力は1系統です。

- **Background Input**: orange input。metadataを追加したい2D Imageを接続します。
- **Output**: Background InputのImageに新しいmetadataを埋め込んだ結果。

基本構成は次のようになります。

```text
MediaIn / Loader → Set Metadata → 後段処理
```

Set Metadataを通しても、metadata以外のpixel処理を行わなければViewer上の見た目は変わりません。

## 何を設定するNodeか

Set Metadataでは、metadata fieldの名前と、そのfieldへ入れる値を1組指定します。

たとえば次のような考え方です。

```text
Field Name  = ShotName
Field Value = SH010
```

この場合、入力Imageのmetadata tableへ`ShotName = SH010`という組を追加します。

21.1 Manualでは、Set Metadataを「new Name = Value pairs」を作るNodeとして説明しています。既存metadata全体を別Imageから移す用途ではなく、必要なfieldをこのNodeで明示して追加する用途です。

## Controls

### Field Name

metadata fieldの名前を指定します。

21.1 Manualでは、**Field Nameにspaceを使わない**よう明記されています。複数語にしたい場合は、`ShotName`や`Shot_ID`のようにspaceを含まない名前にします。

### Field Value

上で指定したField Nameへ割り当てる値を入力します。

```text
Field Name  → metadataの項目名
Field Value → その項目に保存する値
```

Set Metadataの中心となる固有Controlはこの2つです。Settings tabにはMetadata Nodeで共通のControlsがありますが、このページではSet Metadata固有部分を扱います。

## 主な用途

### composition内で識別情報を持たせる

Flow内のImageへshot名、処理段階、任意の識別子などをmetadataとして付けたい場合に使えます。

```text
MediaIn → Set Metadata → downstream node
              │
              └─ ShotName = SH010
```

見た目を変えずに付帯情報だけを追加できるため、pixel処理とmetadata管理を分けて扱えます。

### 後段へ任意の値を渡す

metadataを参照する後段処理がある場合、その処理に必要なName = Value pairをSet Metadataで用意できます。

このとき重要なのは、Set Metadataが「画面に文字を描く」Nodeではないことです。追加した値はImageのmetadata tableに入り、metadataを読む側のNodeやViewer subviewから参照します。

## Copy Metadata / Set Timecodeとの違い

- **Set Metadata**: Field NameとField Valueを指定し、任意のmetadata pairを新しく作る。
- **Copy Metadata**: 別のImageが持つmetadataをBackground Imageへmerge / replaceする。
- **Set Timecode**: FPSとframe位置に応じて変化するtimecode metadataを生成する。

固定した任意のfieldを追加したい場合はSet Metadata、既存Imageのmetadataを引き継ぎたい場合は[Copy Metadata](./copy-metadata.md)、frameごとのtimecodeを作りたい場合は[Set Timecode](./set-timecode.md)を使います。

## 確認方法

21.1 Manualでは、metadataはViewerのsubviewで確認できると説明されています。

Set Metadataを接続してもImageの見た目が変わらない場合、pixel差だけで成否を判断せず、metadata tableに指定したName = Value pairが追加されているかを確認します。

## 注意点

- Field Nameにはspaceを使いません。
- Set Metadataはretime Nodeではありません。source frameや再生速度は変更しません。
- Set MetadataがImageへmetadataを埋め込むことと、そのmetadataが最終fileへ保存されることは同じではありません。最終出力での保持可否はSaver / Deliver、container、codecなどの出力経路ごとに確認します。
- 同名fieldがすでに存在する場合の上書き規則、値型の詳細、runtime REGID、edition差、各Controlのdefault / rangeは、このページの確認範囲では断定していません。

## 関連Node

- [Time / Metadata / Utility Family Overview](./index.md)
- [Copy Metadata](./copy-metadata.md): 別Imageのmetadataをmerge / replaceする場合。
- [Set Timecode](./set-timecode.md): FPS基準のtimecode metadataを作る場合。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、Chapter 110「Metadata Nodes」の`Set Metadata [SMeta]`（pp.2573–2574）を基準にしています。

確認した項目は、single orange Background Input、Background Imageへ新しいName = Value metadata pairを追加して出力すること、Viewer subviewでmetadataを確認できること、`Field Name`、`Field Value`、Field Nameにspaceを使わない制約です。

runtime REGID、Effects Library上のcurrent表示、edition差、既存同名fieldとの衝突規則、各Controlのdefault / min / maxはこの確認範囲に含めていないため、`verification: partial`を維持しています。
