---
title: dResize
description: Deep Imageの出力幅・高さを変更するNode。通常の2D Resizeとの違い、dMerge前の使い方、Deep dataで確認すべき点を説明する。
doc_type: node
term_id: dresize
term_short: "dResizeは、1画素に複数の奥行きサンプルを含み得るDeep Imageの幅・高さを変更し、Deep処理を続けるためのNode。"
verification: partial
aliases: [dResize, dRz]
concepts: [deep-image, resolution]
nodes: [dResize]
node_family: deep
controls: [Width, Height]
inputs: [deep-image]
outputs: [deep-image]
tasks: [deep, resize, resolution]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-16"
---

# dResize

dResize [dRz]は、**Deep Imageの画像幅と高さを変更する**Nodeです。複数のCGパスを奥行き情報付きで合成するとき、素材ごとの画像サイズを揃える用途などに使います。

通常の画像は、1つの画素に基本的に1組のRGBA値を持ちます。一方、<Term id="deep-image">Deep Image</Term>は、同じ画素に手前と奥の**複数のサンプル**を持てます。例えば、半透明の煙の手前側と奥側を、まだ1枚の色へまとめずに扱える形式です。

dResizeが変えるのは**そのDeep Imageの幅と高さ**です。映像を普通の2D画像へ変換するNodeではありません。また、物体の奥行き位置（Z）を直接動かすNodeでもありません。

## 入力と出力

| 端子 | データ | 役割 |
| --- | --- | --- |
| **Image**（オレンジの入力） | Deep Image | 幅・高さを変更したいDeepデータを受け取る。 |
| **出力** | Deep Image | サイズ変更後もDeep処理の流れへ渡す。 |

21.1 ManualでdResize固有の入力として説明されているのは**Imageの1つだけ**です。dTransformやdCropにあるEffect Mask入力を、dResizeにもあるものとして接続図へ描かないでください。

~~~text
Deep EXR（Loader / MediaIn）
             │ Deep Image
             ▼
          dResize
             │ Deep Image
             ├──────────────→ dMerge → Deep to Image → 2DのMerge / Colorなど
             │                   ▲
             └─（サイズ確認）     │
                                別のDeep Image
~~~

**Deep to Image**は、複数の奥行きサンプルを通常の2D画像へまとめるNodeです。dResizeの直後では必須ではなく、Deep処理を終えて2D画像として確認・合成する場所で使います。

## Inspector：Width / Height

21.1 Reference ManualがdResizeのControlsタブで説明する固有設定は、次の2つです。

| 設定 | 変更するもの | 確認すること |
| --- | --- | --- |
| **Width** | 出力Deep Imageの横方向の大きさ | 合成先が必要とする画像幅になっているか。 |
| **Height** | 出力Deep Imageの縦方向の大きさ | 合成先が必要とする画像高さになっているか。 |

幅と高さは別々に調整します。そのため、片方だけ変えると元画像とは**縦横比が異なる**結果になる可能性があります。人物や円形のCGを扱う場合は、見た目が意図せず縦長・横長になっていないか確認します。

ManualはWidth / Heightをそれぞれ画像の幅・高さをスケールする項目と説明しています。ただし、**Inspector上の具体的な値の単位・初期値・上限、およびDeep sampleの再サンプリング方式**までは、この節から確定できません。通常の2D Resizeと同じ補間方式や、1画素あたりのサンプル数が常に変わらないことを前提にしないでください。

## 実際の使い方：異なる画像サイズのDeepレンダーを合わせる

背景と手前のCGを別々にレンダリングし、両方にDeep情報が含まれている例を考えます。背景と手前のレンダーで画像の幅・高さが違う場合、まず出力サイズを確認し、必要な素材だけをdResizeへ通します。

1. 背景用と手前用のDeep EXRをLoaderまたはMediaInから読み込みます。通常のRGBAだけのEXRではなく、Deepデータを持つソースか確認します。
2. サイズを合わせたい側へ**dResize**を挿入し、Width / Heightを調整します。もう一方の画像と、意図する出力の幅・高さを比較します。
3. サイズ変更後のDeep Imageを[dMerge](./d-merge.md)へ送り、奥行きサンプルを使って合成します。
4. [Deep to Image](./deep-to-image.md)を通して2D画像にし、輪郭や透明物の重なりに不自然な段差がないか確認します。
5. 位置や大きさにずれが残る場合は、[dTransform](./dtransform.md)でのXY位置・サイズ調整が必要かを別途判断します。

~~~text
背景Deep ────────────────────┐
                             ├→ dMerge → Deep to Image → 結果確認
手前Deep → dResize ─────────┘
~~~

**画像の幅・高さが一致しても、カメラ位置・画角・投影関係まで一致するわけではありません。** Deepレンダーを重ねるときは、各パスのレンダリング条件も揃っているか確認します。dResizeだけでカメラの不一致を補正できるとは限りません。

## dTransform・dCrop・通常Resizeとの違い

| Node | 対象 | 変更したいもの |
| --- | --- | --- |
| **dResize** | Deep Image | Deep画像そのものの幅・高さ。 |
| [dTransform](./dtransform.md) | Deep Image | 画面内のXY位置・スケール、およびサンプルのZ値のScale / Translate。 |
| [dCrop](./dcrop.md) | Deep Image | 指定した奥行き範囲に含まれるサンプルを残す、または除外する。 |
| 通常のResize | 2D Image | 一般的なRGBA画像の幅・高さ。 |

例えば、**手前のCGをZ方向へ近づけたい**ならdResizeではなくdTransformのTranslate Zを検討します。**ある奥行きより遠い部分だけ取り除きたい**ならdCropです。Deep処理を終えた2D画像の解像度を変えるだけなら、Deep to Imageの後段に通常のResizeを置く構成もあります。

## 結果が期待と違うとき

- **Deepの重なり方がおかしい**：dResizeはWidth / Heightを扱うNodeです。入力DeepのZ値、各レンダーのカメラ条件、dMergeで重ねる素材を別々に確認します。
- **輪郭や半透明部分に差が出る**：元解像度と変換後解像度でDeep to Imageの結果を比較します。ManualのdResize節は補間アルゴリズムやサンプル保持数を詳述していないため、細部の変化をゼロと断定できません。
- **普通のMergeに入れるときに迷う**：Deep合成を続けるならdMergeを使い、通常の2D Mergeへ渡す段階でDeep to Imageへ変換します。
- **Nodeを見つけられない**：Deep Image Compositing Toolsetは、21.1 Manualで**Studio Version Only**と明記されています。利用している製品・Editionを確認します。

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 95「Deep Image Nodes」。**dResize [dRz] pp.2249–2250**でImage入力とWidth / Height、**pp.2226–2227**でDeep Image、Studio限定、linear colorspace要件を確認しました。

Deep compositingでは**linear colorspace**を使う必要があります。dResizeは色空間変換を行うNodeとしては説明されていないため、素材の色管理は合成フロー全体で扱います。通常の2D画像とDeep Imageの違いは[Deep Imageの基礎](../../learn/02-data/deep-image.md)、ほかの関連Nodeは[Deep / Auxiliary Channel一覧](./index.md)を参照してください。

本記事の接続例はManualで確認した機能を組み合わせた運用例です。21.1実機での補間・サンプル数の変化、Inspectorの初期値・range、Edition以外のホスト固有差は未検証のため、`verification: partial`を維持しています。
