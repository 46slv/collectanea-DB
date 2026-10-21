---
title: Erode Dilate
description: Erode Dilateでマットの輪郭を縮小・拡張する方法。RGBA、Effect Mask、Amountの解像度依存性とキー抜き後の調整例を説明する。
doc_type: node
term_id: erode-dilate
verification: partial
aliases: [Erode Dilate, ErDl]
concepts: [image-data, mask-data, morphology]
nodes: [Erode Dilate]
node_family: blur-filter
controls: [Color Channels, Lock X/Y, Amount]
inputs: [image, mask]
outputs: [image]
tasks: [erode, dilate, matte, edge-thickness]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-13"
---

# Erode Dilate

Erode Dilateは、画像の明るい領域を縮めたり広げたりするFusionのフィルターノードです。キーイングで作ったマットの輪郭を少し内側へ寄せる、白い図形を太らせる、細かな穴を埋めるといった用途で使います。

**Erode（縮小）とDilate（拡張）は、ぼかしではありません。** 近くにある暗い値または明るい値が広がるため、境界の位置や太さが変わります。細部が消えたり、緩やかな階調が単純化されたりする場合もあります。DaVinci Resolve 21.1 Reference Manualは、この副作用を明記しています。

## 入力と出力

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Input（橙）** | 2D Image（RGBA） | 輪郭や明暗を縮小・拡張する元画像を受け取る |
| **Effect Mask（青、省略可）** | Mask | 処理結果を適用する場所を制限する |
| **Output** | 2D Image | Erode / Dilateを適用した画像を次のノードへ渡す |

入力は画像です。白黒マットを画像のAlphaに保持している場合も、RGBやAlphaのどのチャンネルを処理するかを選ぶ必要があります。

**Effect Mask入力と画像のAlphaは別のもの**です。たとえばキー抜き後のAlphaを細くしたい場合は、Inputへキー抜き画像を入れ、後述のColor ChannelsでAlphaを有効にします。Effect Maskへ別のマスクをつなぐと、フィルターの適用範囲をさらに絞れます。

公式マニュアルでは、Effect Maskは**フィルター処理の後で適用される**と説明されています。Effect Maskを接続しても、入力画像のAlphaを直接「マスクとして取り出す」わけではありません。

## Amount：輪郭を縮めるか、広げるか

**Amount**の符号で処理方向が変わります。

| Amount | 処理 | 結果 |
| --- | --- | --- |
| **負** | Erode | 暗い領域が広がり、明るい領域が縮む |
| **0** | 変化なし | 元画像を保つ |
| **正** | Dilate | 明るい領域が広がり、暗い領域が縮む |

白い前景と黒い背景のマットで考えると、負の値では白い前景が細くなり、正の値では太くなります。反対に、明暗を反転したマットでは見かけの効果も逆になるため、**「負なら被写体が必ず縮む」と覚えず、処理するチャンネルの白黒を先に確認**します。

### Amountはピクセル数ではなく画像幅を基準にする

21.1マニュアルによると、**Amountの1.0は入力画像の幅に相当**します。HD（幅1920ピクセル）の画像で約1ピクセル縮めたいなら、目安は次の値です。

```text
Amount = -1 / 1920 ≈ -0.00052083
```

同じ数値を幅の異なる素材へ使うと、ピクセル単位の移動量は変わります。たとえば幅3840ピクセルの画像で1ピクセル相当を指定するなら、基準値は`1 / 3840`です。数値だけを別解像度へコピーせず、画像幅から換算してください。

この換算はマニュアルにあるAmountスケールの説明に基づくものです。実際の境界の見え方は入力画像の階調や処理対象によっても変わるため、Viewerを拡大して確認します。

### Lock X/Y：横方向と縦方向を分ける

**Lock X/Y**を解除すると、Amount XとAmount Yを別々に設定できます。

たとえば横方向だけ細くしたい文字マットでは、X側だけ負の値を与え、Y側は0付近にします。縦長の線を太くするなら横方向の拡張量から調整します。両軸を同時に大きく変える前に、どの方向の線幅が問題なのかを見てください。

## Color Channels：RGBAの何を変えるか

Erode DilateのControlsタブでは、**R / G / B / A**の各チャンネルを処理対象として選べます。21.1マニュアルでは、**既定で4チャンネルとも有効**です。

- **Alphaだけを処理**：キー抜き後のマットの太さを調整したいとき。R / G / Bを外し、Aだけを有効にします。
- **RGBを処理**：明暗や色の境界そのものを広げたり縮めたりしたいとき。意図しない色・細部の変化がないか確認します。
- **RGBAすべてを処理**：色もAlphaも同時に変化させるため、キー抜き後の輪郭調整だけが目的なら必要性を確認します。

ここでのColor Channelsは、**フィルターの計算前にチャンネルを選別**します。Settingsなどにある**共通のRGBAチャンネル制御は、処理後に適用**されます。両者は計算順序が異なり、マニュアルは前者で処理対象を減らすことが描画負荷の軽減にもつながると説明しています。

「Alphaだけ細くしたはずなのに色まで変わる」場合は、まずControlsタブのColor ChannelsがAだけになっているか確かめます。

## 制作例

### 1. キー抜き後の白い縁を少し内側へ寄せる

被写体を抜いたマットがわずかに広く、背景色の細い縁が見えている場面を想定します。公式マニュアルも、Luma Keyerの後段でErode Dilateを使い、Matte Controlへ結果を渡す構成を紹介しています。

```text
Luma Keyer → Erode Dilate → Matte Control
                 ↑
        Color Channels: Aのみ
        Amount: 小さな負の値
```

1. [Luma Keyer](../matte-keying/luma-keyer)などでマットを作ります。
2. Erode Dilateを間に入れ、処理対象を**Alphaのみ**にします。
3. Amountを0から少しずつ負へ動かし、輪郭が被写体の内側へどの程度入るか確認します。
4. [Matte Control](../matte-keying/matte-control)などの後段処理と組み合わせ、前景画像と背景の境界を確認します。

縮めすぎると髪や細い輪郭が欠けます。縁の色の問題が残る場合は、マットの縮小だけでなく、元画像の色成分やキーイングの設定も確認する必要があります。**マットを内側へ寄せる処理は、残った色を自動的に補正する機能ではありません。**

### 2. 白いロゴを太らせて隙間を埋める

白いロゴと黒い背景の画像をInputへ接続し、Amountを小さな**正の値**にします。明るい部分が広がるため、細い線を太くしたり、小さな黒い隙間を埋めたりできます。

```text
白いロゴ画像 → Erode Dilate（Amount > 0）→ Merge
```

画像のRGBを直接加工するのか、ロゴのAlphaを加工するのかで結果が異なります。透明背景のロゴなら、まずAlphaだけを処理する構成と、RGBも処理する構成を比較してください。線が潰れ始める前で止めます。

### 3. 横方向だけマットを縮める

細い縦線が太く抜けてしまう場合は、Lock X/Yを解除します。Amount Xを小さく負へ設定し、Amount Yは0に保ちます。縦方向の太さをできるだけ維持しながら、横方向の幅を絞る使い方です。

全方向へ同じAmountをかけるより調整しやすい場合がありますが、対象が斜線や曲線なら他の方向の輪郭にも影響します。Viewerを拡大し、文字や髪などの細部を確認します。

## BlurやEffect Maskとの使い分け

| 処理 | 主に変わるもの | 適した場面 |
| --- | --- | --- |
| **Erode Dilate** | 明暗の境界位置や太さ | マットを細くする、白い線を広げる |
| [Blur](./blur) | 境界のなだらかさ | 硬い輪郭を柔らかくする |
| **Effect Mask入力** | Erode Dilateの結果を適用する場所 | 画面の一部だけ輪郭を調整する |

Erode Dilateではマットの境界位置を変え、Blurでは境界を柔らかくします。両方必要なら別の目的の処理として順に調整します。Effect Maskはこの2つの代わりではなく、処理を適用する範囲の指定です。

## 期待した結果にならないとき

- **処理を入れたのにマットの縁が変わらない**：Color ChannelsでAが有効か、入力画像のAlphaが実際にマットを保持しているか、Amountの値が画像幅に対して小さすぎないか確認します。
- **色も変わってしまう**：RGBのチャンネルを処理対象から外し、Alphaだけの構成で比較します。
- **境界が細くなりすぎる／消える**：負のAmountを0に近づけます。細い髪や線から確認してください。
- **小さい数値なのに輪郭が大きく変わる**：Amountは入力画像の幅に対して正規化されます。画像幅と現在の値を照合します。
- **一部分だけ変化する**：青色のEffect Mask入力にマスクがつながっていないか確認します。
- **輪郭が角張る、細部が潰れる**：Erode / Dilateは細部を消し、緩やかな階調を単純化する場合があります。Amountを減らし、必要なら別の手段を併用します。

## 関連ノード

[Luma Keyer](../matte-keying/luma-keyer)は輝度からキーを作り、[Matte Control](../matte-keying/matte-control)はマットの取り扱いと合成を補助します。[Blur](./blur)は柔らかい境界を作るためのノードです。フィルターの一覧は[Blur / Filterノード](./index.md)にまとめています。

## バージョンと根拠

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 99「Filter Nodes」、**pp.2337–2338**。Erode Dilateの画像入力、青色のEffect Mask、Color Channelsの計算順序、Lock X/Y、Amountの正負・画像幅基準、細部とグラデーションへの影響を確認しました。[Blackmagic Design公式サポート](https://www.blackmagicdesign.com/support)。

キーの縁の処理、ロゴの太さ変更、X/Yの分離はこの仕様に基づく制作例です。21.1実機でのレンダリング結果、ノードの内部識別子、すべての既定値・数値範囲、Edition差は未確認のため、`verification: partial`を維持します。
