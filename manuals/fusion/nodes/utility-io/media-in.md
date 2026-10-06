---
title: MediaIn
description: Resolve timeline / Media Pool側の参照元をFusion Flowへ渡すResolve-integrated input Node。
doc_type: node
term_id: media-in
verification: partial
aliases: [MediaIn, Media In]
concepts: [image-data, resolve-integration, source-boundary]
nodes: [MediaIn]
node_family: utility-io
outputs: [image]
tasks: [source, import, cross-page-workflow]
level: foundation
product_scope: resolve
suite_surfaces: [edit, fusion]
---
# MediaIn

MediaInは、DaVinci ResolveのTimeline / Media PoolにあるclipをFusion pageへ渡すsource Nodeです。

Fusion StudioのLoaderに近い役割ですが、Resolveのclip context、trim、color / gamma metadata、audio等とつながっています。

## どこから作られるか

- Edit / Cut pageのtimeline clipからFusion pageへ入る
- Media Pool clipをNode Editorへdrag
- OSからclipをdrag
- PSD import

Effects LibraryのMediaInを置くだけでは一般的なclip import方法にはなりません。

## 入力

青色Effect Maskだけを持ち、source Imageの表示範囲を限定できます。

## Image tab

Media Pool / OSから入れたMediaInでは、trim、freeze、loop、reverse等のtiming controlを使えます。

Timeline clip由来の場合は、Edit / Cut側のclip rangeと連動するため利用できるControlが一部異なります。

## Audio

MediaInはsource clipのaudioもFusion playbackへ持ち込めます。Sound OffsetはFusion page内だけでaudio timingをsubframe単位にずらします。

## Loaderとの違い

- MediaIn — Resolve project / Timeline / Media Poolのsource
- Loader — Fusion Studioのfile source。ResolveではEXR限定

## 最小構成

    MediaIn → Transform / Color / Merge → MediaOut

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual Chapter 104 pp.2415–2419で、Resolve限定、4つの作成経路、Effect Mask、timing、audioを確認しました。
