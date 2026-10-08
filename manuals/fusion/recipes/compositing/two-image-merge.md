---
title: 2つのImageを重ねる
description: Mergeを使い、Backgroundを基準にForegroundを重ねる最小構成。位置・大きさ・Maskまで確認する。
doc_type: recipe
verification: partial
aliases: [two image composite, 画像を重ねる]
concepts: [foreground-background, compositing]
patterns: [stack-images-with-merge]
nodes: [Merge]
tasks: [composite, layer]
prerequisites: [foreground-background]
level: foundation
product_scope: fusion
updated: "2026-10-04"
---

# 2つのImageを重ねる

## できあがるもの

1枚のBackgroundに、別のImageをForegroundとして重ねます。

```text
Foreground ─┐
            ├─ Merge → Output
Background ─┘
```

## 必要なもの

- BackgroundにするImage
- ForegroundにするImage
- Merge

## 手順

1. BackgroundにしたいImageをMergeのオレンジ色Background入力へ接続します。
2. ForegroundにしたいImageを緑色Foreground入力へ接続します。
3. MergeのOutputをViewerへ表示します。
4. Foregroundの位置を変えたい場合はMergeのCenterを調整します。
5. 大きさを変えたい場合はSize、向きを変えたい場合はAngleを調整します。
6. 一部だけ合成したい場合はMaskを青色Effect Mask入力へ接続します。

最初はApply ModeをNormal、OperatorをOverの基本状態で確認すると、入力・配置・Maskの役割を分けやすくなります。

## 背景を先に決める理由

MergeではBackground入力が出力解像度の基準です。

Foreground側に別解像度のImageを接続することはできますが、出力キャンバスをどのImageに合わせたいかを先に決めてBackgroundへ置くと、構成を読みやすくできます。

## Maskを追加する

```text
Foreground ─┐
Background ─┼─ Merge → Output
Mask ───────↑
```

Maskの白い部分ではForegroundが合成され、黒い部分ではBackgroundだけが残ります。

## うまくいかないとき

- Foregroundだけを接続してBackgroundが空になっていないか。21.1 ManualではForegroundだけではMergeは出力しません。
- Background / Foregroundを逆にしていないか。
- MergeのOutputをViewerで見ているか。
- upstreamの2枚は単体でViewerへ出るか。
- Effect Maskが意図せず接続されていないか。
- 透明Edgeだけがおかしい場合は、Apply Modeを変える前に[premultiplication](../../learn/04-compositing/premultiplication)を確認します。

## 3枚以上を重ねる

2枚ずつ段階的にMergeを追加する方法と、[MultiMerge](../../nodes/compositing/multi-merge)へまとめる方法があります。

選び分けは[Merge chainとMultiMergeを選ぶ](../../patterns/compositing/choose-merge-vs-multimerge)を参照してください。

## 関連する考え方

- [Foreground / Background / Mask](../../learn/04-compositing/foreground-background-mask)
- [合成量と演算（Blend / Apply Mode / Operator）](../../learn/04-compositing/blend-operator)

## 関連Node

- [Merge](../../nodes/compositing/merge)
- [MultiMerge](../../nodes/compositing/multi-merge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 94、pp.2211–2213で、入力、Background基準の出力解像度、Center / Size / Angleを確認しています。実機追試は未実施のため `verification: partial` を維持します。
