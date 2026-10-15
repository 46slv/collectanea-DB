---
title: "Channel Boolean（3D Material）"
description: "画像や3D材質のRGBAをチャンネルごとに選び、加算・反転などの演算で新しい材質を作るNode。"
doc_type: node
term_id: "channel-boolean-material"
term_short: "Channel Booleanは、画像や材質のRGBA成分を別の成分に割り当てたり、数値演算して新しい3D Materialを作ったりするNode。"
verification: partial
aliases: ["Channel Boolean", "Channel Boolean Material", "3Bol"]
concepts: ["classic-3d"]
nodes: ["Channel Boolean"]
node_family: "materials-lights"
controls: ["Operand A", "Operand B", "Operation", "Material ID"]
inputs: ["image", "material"]
outputs: ["material"]
tasks: ["shade-3d"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-15"
---

# Channel Boolean（3D Material）

Channel Boolean [3Bol]は、**3D物体の材質を、赤・緑・青・Alphaの成分ごとに計算して組み直す**Nodeです。例えば、画像の赤成分をAlphaへ移したり、2つの材質の色を足したり、数値を反転させたりできます。

「チャンネル」は赤・緑・青・Alphaなどを別々に扱う数値の区分です。通常の材質合成なら[Material Merge 3D](./material-merge-3d.md)で混合比を調整できますが、**出力Redは加算、Greenは背景側、Alphaは別の成分**というように独立して計算したいときはChannel Booleanを使います。

名前が似た[2DのChannel Booleans](../color/channel-boolean.md)とは異なります。こちらは<Term id="classic-3d">Classic 3D</Term>のMaterialを扱うNodeで、映像の2D Imageを直接合成するものではありません。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualには、次の2つの入力が記載されています。**両方とも2D Imageまたは3D Materialを受け取れます。**

| 入力 | 色 | 意味 |
| --- | --- | --- |
| **BackgroundMaterial** | オレンジ | 基礎になる画像・材質。InspectorではBG。 |
| **ForegroundMaterial** | 緑 | 追加・演算する画像・材質。InspectorではFG。 |

出力は**3D Material**です。[Shape 3D](../3d/shape-3d.md)などのMaterial入力へつなぎ、形状を[Merge 3D](../3d/merge-3d.md)でCamera・Lightとまとめ、[Renderer 3D](../3d/renderer-3d.md)で2D Imageにします。MaterialそのものをMerge 3DのScene入力へ渡すわけではありません。

~~~text
Blinn［Material］──────────→ Channel Boolean［BackgroundMaterial］
Cook Torrance［Material］─→ Channel Boolean［ForegroundMaterial］
                                        │ Material
                                        ▼
                                  Shape 3D［Material］──┐
Camera 3D ────────────────────────────────────────────┼→ Merge 3D → Renderer 3D
必要ならLight ────────────────────────────────────────┘
~~~

これは接続関係の例であり、**どの成分が残るかはInspectorの演算設定次第**です。

## Inspectorの主な設定

### Operand A / Operand B：値の取り出し元

Controlsタブの**Red・Green・Blue・Alpha**それぞれに、Operand A、Operation、Operand Bがあります。Operandは「何の数値を使うか」、Operationは「どう計算するか」を指定します。

| Operandで選ぶ項目 | 取り出す値 |
| --- | --- |
| Red / Green / Blue / Alpha **BG** | Background側の指定した成分 |
| Red / Green / Blue / Alpha **FG** | Foreground側の指定した成分 |
| **Black / Mid Gray / White** | 0 / 0.5 / 1の固定値 |
| **Hue / Lightness / Saturation BG・FG** | 入力色をHLSとして評価した値 |
| **Luminance BG・FG** | 入力色から計算した輝度 |
| **X / Y / Z Position FG** | 位置の成分。ManualではEye Spaceで返る |
| **U / V / W Texture FG** | Foreground側のテクスチャ座標 |
| **U / V / W EnvCoords FG** | 環境マップ用のテクスチャ座標 |
| **X / Y / Z Normal** | 表面の法線（向き）の成分。ManualではEye Spaceで返る |

例えば出力AlphaのOperand Aを**Red BG**にすれば、Backgroundの赤の値をAlphaとして取り出せます。**Eye Space**はカメラの視点を基準とした座標系です。PositionやNormalの選択は画像のXY位置や物体のローカル座標と同じではありません。

### Operation：数値の計算方法

操作は**出力するチャンネルごとに別々に指定**できます。

| Operation | 結果 |
| --- | --- |
| **A** / **B** | Operand Aのみ／Bのみ |
| **1-A** / **1-B** | 1からA／Bを引く（反転） |
| **A+B** / **A-B** | 加算／減算 |
| **A*B** / **A/B** | 乗算／AをBで除算 |
| **min(A,B)** / **max(A,B)** | 小さい方／大きい方 |
| **avg(A,B)** | AとBの平均 |

例えば出力Redに**Operand A = Red BG、Operation = A+B、Operand B = Red FG**を指定すると、2つの材質の赤成分を足します。同じ設定をGreenやBlueへ自動的に適用するわけではありません。Alphaだけ**A**を選びBackgroundの値を維持する、といった構成も可能です。

除算や加算で値が想定範囲を外れた場合のクリップ処理など、Manualのこの節だけで確定できない内部挙動は断定しません。

### Material ID

**Material ID**は材質の識別番号です。Renderer 3Dで対応する補助チャンネルを出力すると**MatID**に記録できます。色の演算や混合率を変える数値ではありません。Settingsタブには3D Node共通の設定があります。

## 具体的な運用例

### 赤の濃淡をAlphaへ移す

1. 赤い部分に濃淡のある画像またはMaterialを**BackgroundMaterial**へ入力します。
2. Channel Booleanの**Alpha**行で、**Operand A = Red BG、Operation = A**を選びます。
3. 必要ならRGBはそれぞれ背景側の元の成分を使う設定にします。
4. 出力を、**Alphaを数値として参照することが分かっている**後段のMaterial入力へ渡します。

21.1 Manualには、赤成分をBlinnの**Specular Exponent**のようにAlphaを参照する入力へ対応させる例があります。赤をAlphaへ移すことが、必ず映像の透明度を変えることと同義ではありません。**後段でAlphaを何に使うか**が重要です。

### BlinnとWardの光沢を組み合わせる

[Blinn](./blinn.md)は一般的な光沢、[Ward](./ward.md)はブラシ仕上げの金属のような方向性のあるハイライトを作ります。Blinnの完成した材質をWardのDiffuseへ入れると、Blinn側で計算された結果がWardでさらに照明の影響を受けます。

21.1 ManualのChapter 84では、**Blinnの結果にWardの異方性ハイライト成分を足す**ためにChannel Booleanを使う例を紹介しています。これにより、2D画像を重ねず、3D物体の表面を描画する前に材質成分を合成できます。

### Cook TorranceとBlinnで変化する表面を作る

Chapter 90の公式作例は**Cook TorranceとBlinn**を入力し、成分を切り替え・反転・混合してネオンがちらつくような見た目を作ります。

まずSphereに異なる2種類の材質を用意し、出力RedのOperationを**A、B、1-A、avg(A,B)**と切り替えて確認します。Green・Blue・Alphaも別々に変更すれば、どの数値がどこに影響するか分かります。ここでの操作は演算の説明であり、実機で点滅を再現済みのプリセットではありません。

## 似たNode・注意点

- **[Material Merge 3D](./material-merge-3d.md)**はBlendで2材質を混ぜます。RGBA別に演算を指定するものではありません。
- **[2D Channel Booleans](../color/channel-boolean.md)**は2D Imageの各チャンネルを扱います。Channel Boolean [3Bol]は3D Material用です。
- **[Blinn](./blinn.md)／[Ward](./ward.md)**は照明に対する表面の反応を作ります。Channel Boolean自体は照明モデルではありません。
- **[Classic 3Dの基礎](../../learn/02-data/classic-3d.md)**でMaterial・Geometry・Sceneの違いを確認できます。

見た目がおかしい場合は、**OperandがBGとFGのどちらを参照するか → Operation → 出力を受けるMaterial入力の意味**の順で確かめます。

## バージョンと出典

**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』**（2026年9月）、Chapter 90「3D Material Nodes」**Channel Boolean [3Bol]（pp.2051–2054）**で入力・演算・Material IDとCook Torrance／Blinnの例を照合しました。Chapter 84「3D Compositing Basics」（pp.1852–1853）も材質のRGBA値とBlinn／Wardの合成例の根拠です。

21.1の節名に合わせタイトルを**Channel Boolean**へ修正し、従来の名称は別名として残しました。ファイル名と`term_id`は既存リンクを壊さないため維持します。**runtime REGID、Inspector初期値・数値範囲、Edition差、実機描画は未検証**のため`verification: partial`です。