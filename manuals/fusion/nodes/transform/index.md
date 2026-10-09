---
title: Transform / Formatノード
description: 2D Imageを移動・回転する処理と、解像度やキャンバス自体を変更する処理を分けて選ぶ入口。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, transform-image, resize, crop, format]
updated: "2026-10-04"
---

# Transform / Formatノード

このFamilyでは、2D Imageの位置・大きさ・向きを変える処理と、画像そのものの解像度・キャンバスを変える処理を扱います。

最初に区別したいのは、**同じ解像度の中で見た目を動かすのか、出力画像のピクセル寸法そのものを変えるのか**です。

## まず選ぶ

| やりたいこと | Node | 出力解像度 |
| --- | --- | --- |
| 位置・大きさ・回転を変える | [Transform](./transform) | 変えない |
| 幅・高さをピクセル数で指定する | [Resize](./resize) | 変える |
| 元解像度に対する倍率で変更する | [Scale](./scale) | 変える |
| 画像の一部を切り出す / 新しいキャンバス寸法にする | [Crop](./crop) | 変える |

この違いは、後段のMergeや配置に直接影響します。

## Transform

```text
Image → Transform → Image
```

Centerで位置、Pivotで回転・拡大縮小の中心、Sizeで大きさ、Angleで回転を変えます。

Transformは画像の見た目を移動・拡大縮小しても、出力のWidth / Height自体は変更しません。通常の2D配置では最初に検討しやすいNodeです。

## Resize

```text
1920×1080 Image
       ↓
     Resize
       ↓
1280×720 Image
```

Width / Heightをピクセル数で指定し、実際の出力解像度を変更します。

「画面内で小さく見せたい」のではなく、「このImageを1280×720のデータにしたい」という場合に使います。

## Scale

Scaleも出力解像度を変更しますが、Resizeと違って元画像に対する倍率で指定します。

```text
1920×1080
  ↓ Scale 0.5
960×540
```

2倍・半分など、元サイズとの比率で考えたい場合に向きます。

## Crop

Cropは画像の一部を切り出し、出力のWidth / Heightを変更します。

Maskで見える範囲だけ隠す処理とは異なり、Cropでは画像の物理的な解像度が変わります。

## Mergeとの関係

MergeではBackground入力が出力解像度の基準になります。

そのため、Resize / Scale / CropをBackgroundの前へ置くと、Merge全体の出力解像度にも影響します。Transformは解像度を変えないため、単純な位置・大きさ調整でキャンバス寸法まで変えたくない場合に使いやすくなります。

## Animationするときの注意

21.1 Manualでは、Resize / Scale / Cropは画像の物理解像度を変更するため、これらのサイズControlをアニメーションすることは推奨されていません。

位置や大きさを時間的に動かしたい場合は、まずTransformで目的を満たせないか確認します。

## 関連する考え方

- [Center / Pivot / Size / Angle](../../learn/03-space/center-pivot-size-angle)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)
- [正規化座標（Normalized Coordinates）](../../learn/03-space/normalized-coordinates)
- [有効領域（Domain of Definition）](../../learn/03-space/domain-of-definition)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 120、pp.2862–2883を基に、Crop / Resize / Scale / Transformの役割、解像度変更の有無、主要Controlを整理しています。

Camera Shake、DVE、Letterbox、Planar TransformもChapter 120に含まれますが、このFamily Overviewではまず「配置」と「解像度変更」の基礎4 Nodeを優先しています。これらは次のTransform batchで個別に深くします。
