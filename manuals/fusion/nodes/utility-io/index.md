---
title: I/O・Graph Utilityノード
description: Resolve・Fusion Studioの素材入力、出力、ファイル保存、Node Editorの整理・再利用を役割と接続先から選ぶための案内。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, io, graph-organization]
updated: "2026-10-15"
---

# I/O・Graph Utilityノード

このカテゴリは、**素材をFusionへ入れる／結果を外へ渡す**機能と、**Node Editorの接続・構成を整理する**機能をまとめています。どちらも「Utility」と呼ばれますが、Imageを出力するNodeと、画像の入出力端子を持たない注釈機能は別物です。

Fusionの**Image**は画素とAlpha（透明度）を含む画像データ、**Mask**は処理・表示する領域を指定するデータです。接続の種類が分からない場合は[Image・Mask・Dataの基本](../../learn/02-data/image-mask-data)を先に参照してください。

## 素材をFusionへ入れる

| 何を取り込むか | Node | 入力経路と出力 |
| --- | --- | --- |
| ResolveのTimeline・Media Poolにある動画や画像 | [MediaIn](./media-in) | Resolveが素材を参照し、Fusionへ2D Imageを出す。**Resolve専用** |
| ディスク上の画像・動画・連番 | [Loader](./loader) | Filenameでファイルを指定し、2D Imageを出す。Fusion Studioでは一般的なファイル入力、**ResolveのFusionページでは主にOpenEXRの直接読み込み**に使う |
| OGraf・Lottieのアニメーション | [OGrafLoader](./ografloader) | Template Pathで外部テンプレートを指定し、2D Imageを出す。必要ならEffect Maskで表示領域を制限する |

MediaInとLoaderは、どちらも合成の入口に置けますが、**「素材をResolveが管理するか」「ファイルを直接指定するか」**が違います。MediaInには画像をつなぐ入力端子がなく、素材参照はTimelineやMedia Poolとの関係で決まります。

OGrafLoaderは21.1 Manualでは**Generator Nodes（Chapter 103）**に掲載されています。このDBでは外部アニメーションの入力機能としてI/O側に分類しています。Fusion内で文字を新たに作る[Text+](../generators/text-plus)とは用途が異なります。

## 処理した画像・マットを外へ渡す

| 出力したいもの | Node | どこへ渡すか |
| --- | --- | --- |
| ResolveのTimelineに返す完成画像 | [MediaOut](./media-out) | 2D Image入力を受け、Resolve内部の出力経路へ渡す。**ファイル保存Nodeではない** |
| 画像・連番をディスクへ保存する | [Saver](./saver) | Image入力からファイルへ書き出す。Fusion Studioでは一般的なファイル出力、**ResolveのFusionページではOpenEXR連番の保存**に使う |
| 人物・空など複数のマットを1本のEXRにまとめる | [External Matte Saver](./external-matte-saver) | 複数の2D RGBA入力から、名前付きマットをOpenEXRへ保存する。**Fusion Studio専用** |

MediaOutには次のNodeへ画像を渡すための通常のImage出力端子はありません。Timelineから動画ファイルを納品するなら、MediaOutでResolveへ返したあと**Deliverページ**などから書き出します。

一方、Saverはディスクへ直接保存します。ResolveのFusionページでLoader／Saverを使うと、重い処理の一部をEXR連番に固定し、その連番を再読込する**手動ディスクキャッシュ**も作れます。保存したEXRは元の処理を変更しても自動更新されません。

External Matte SaverはFusion StudioからColorページへ領域別のマットを渡す用途です。Resolve内のFusionページから直接マットをColorページへ渡す方法は、[MediaOut](./media-out)の追加出力も参照してください。

## Node Editorを整理・再利用する

| やりたいこと | 機能 | 何が変わるか |
| --- | --- | --- |
| 複数Nodeを折りたたみ、内部を開いて編集する | [Group](./group) | 外部との接続がGroupの端子としてまとまる。内部の画像処理は残る |
| 内部Nodeの一部のControlだけ公開し、別のショットで使う | [Macro](./macro) | 公開するInspector項目を設計した、再利用できるToolになる |
| ノードを色付きの枠で囲って工程を分ける | [Underlay](./underlay) | Node Editor上の配置・見た目を整理する。画像処理は追加しない |
| 修正意図や引き継ぎ事項を文章で残す | [Sticky Note](./sticky-note) | 接続を持たない注釈を置く。レンダリング結果に出ない |
| 長い接続線を曲げたり分岐点を整理したりする | [Pipe Router](./pipe-router) | データを通す中継点を置くが、画像の値は加工しない |

**Graphを整理する機能が、すべて画像の結果に無関係という意味ではありません。** GroupとMacroの内部にはBlurやMergeなどの実処理が残ります。箱にまとめる操作だけでは映像は変わりませんが、内部の設定や配線を変えれば最終画像も変わります。一方、UnderlayとSticky Noteは処理経路に入りません。Pipe Routerは経路上に入りますが、値を変更しません。

## 構成を選ぶ3つの例

### 1. Timelineのクリップを加工する

```text
MediaIn → Delta Keyer → MediaOut → Resolve Timeline
```

MediaInで編集素材を受け、Delta Keyerでグリーンバックを透明にし、MediaOutで結果をEdit／Cutページへ戻します。単純なTimelineクリップの加工なら、Loaderで同じ素材を読み直す必要はありません。

### 2. 処理の重い背景だけをファイルに固定する

```text
重い背景処理 → Saver → EXR連番（ディスク）
                               ↓
                       Loader → Merge → MediaOut
                                 ↑
                              前景画像
```

背景の最終ImageをSaverでEXRへ保存し、Loaderで再読込して前景とMergeします。元の背景処理を修正した場合は、EXRを再レンダリングしてから確認します。

### 3. 複数のマットをColorページへ渡す

Fusion Studioで人物・空などのRGBA画像をExternal Matte Saverへ接続し、各入力のAlphaを名前付きマットとしてEXRに保存します。Resolve側でEXRを外部マットとして読み込み、ColorページのEXT MATTEで対象レイヤーを選び、補正ノードのKey入力へつなぎます。これは完成画像の書き出しとは別の経路です。

## バージョン・分類について

**DaVinci Resolve 21.1 Reference Manual（September 2026）**に基づき、操作対象の違いを整理しました。

- Chapter 64 pp.1344–1346：Timeline／Media Poolからの入力、Resolve内Loader・SaverのEXR用途
- Chapter 101 pp.2349–2353：Group、Macro、Pipe Router
- Chapter 103 pp.2376–2378：OGrafLoader（Manual上はGenerator）
- Chapter 104 pp.2407–2430：Loader、MediaIn、MediaOut、Saver
- Chapter 116 pp.2723–2725：Fusion Studio限定のExternal Matte Saver
- Chapter 66：Underlay、Sticky Note、Node Editor上の整理操作

このDBのカテゴリ分けは**用途別の案内**であり、Effects Library内のカテゴリ名や全ノードの利用可否をそのまま示したものではありません。個別のInspector項目、入力型、ホスト差は各Node記事の確認範囲を参照してください。
