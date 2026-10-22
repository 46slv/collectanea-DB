---
title: Scopes（映像信号の測定）
description: Waveform、RGB Parade、Vectorscopeを使ってColorページの明暗・色の分布を確認する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
tasks: [read-scopes, balance-image, shot-matching]
level: beginner
updated: "2026-10-21"
---

# Scopes（映像信号の測定）

Scopesは、画像の明るさや色成分がどのように分布しているかを確認する表示機能です。モニターの見え方や周囲の照明だけに頼らず、補正の前後で信号がどこへ動いたかを判断する助けになります。

## 代表的な3つ

| Scope | 主に見るもの | 何が分かるか |
| --- | --- | --- |
| **Waveform** | 画面位置に対応した明るさの分布 | 画面のどの領域が暗いか／明るいか、極端な値が集中していないか |
| **RGB Parade** | R・G・B各成分の分布 | チャンネルの偏りや補正前後のRGBの関係 |
| **Vectorscope** | 色相と彩度の方向・広がり | 画像の色がどの方向へ寄っているか、彩度がどう変化したか |

どれか1つだけで画像全体の色を理解できるわけではありません。Waveformは主に明るさ、Paradeは各チャンネル、Vectorscopeは色の方向と広がりという役割で併用します。

## 見方の最小例

### 明るさを変える

[Primaries](./primaries-color-wheels)で画像を少し明るくしたとき、Waveformの分布がどの部分で上へ動いたかを比較します。単に全体が明るくなったのか、中間調を中心に動かしたのかを考えます。

### 色かぶりを確かめる

無彩色であるはずの部分が色付いて見える場合、RGB Paradeで各チャンネルがどう分布しているか確認します。ただし、画面全体に赤い被写体が多い場合など、チャンネルの高さがそろわないこと自体が異常とは限りません。

### 彩度を変える

彩度を変えたとき、Vectorscope上の分布がどれだけ広がったかを比較します。色相がどちらへ動いたかと、彩度が強くなったかを混同しません。

## 実制作での注意

- Scope上の数値は、信号の処理位置、色空間、表示設定などによって読み方が変わります。
- 画面全体の分布だけで、顔や特定の被写体の色を確定できるとは限りません。
- 各Scopeは、カット間を比較する際の補助です。意図した照明や場面演出と合わせて判断します。
- どのScopeでも、表示される範囲や単位を確認せず、固定の合格ラインを当てはめません。

## 次に読む

- [最初のグレーディング](../learn/first-grade)
- [Primaries](./primaries-color-wheels)

## 出典と確認範囲

[Blackmagic Design公式：ColorページのScopes](https://www.blackmagicdesign.com/products/davinciresolve/color)は、映像の輝度やRGB成分、色相、彩度などを測定し、ショット間の整合に役立てる用途を説明しています。21.1でのScope設定項目、単位、数値レンジ、表示モードの詳細は[公式マニュアル](https://www.blackmagicdesign.com/support)と実機で継続確認します。
