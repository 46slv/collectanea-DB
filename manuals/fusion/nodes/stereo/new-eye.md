---
title: "New Eye"
description: "左右画像の視差から中間視点を作り、片眼の映像をもう一方から再生成するStereo Node。"
doc_type: node
term_id: "new-eye"
term_short: "New Eyeは、左右画像の視差を使って中間視点の画像を生成したり、一方の眼の映像を作り直したりするStereo Node。"
verification: partial
aliases: ["New Eye", "NE"]
concepts: ["image-data"]
nodes: ["New Eye"]
node_family: "stereo"
controls: ["Enable", "Lock XY", "XY Interpolation Factor", "Depth Ordering", "Clamp Edges", "Softness", "Source Frame and Warp Direction", "Stack Mode", "Swap Eyes"]
inputs: ["image"]
outputs: ["image"]
tasks: ["process-stereo"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-10"
---

# New Eye

New Eye [NE]は、**ステレオ映像の左右2枚の画像をもとに、別の視点から見たような画像を補間する**Nodeです。左右のカメラの中間にある仮想的な視点を作ったり、片方の眼に写った不具合を避けるため、もう片方の画像を変形して置き換えたりできます。

2枚の画像で同じ被写体がどれくらい離れて写っているかを表す**視差（Disparity）**を利用します。視差は元画像の画素をどこへ移動すればよいかを推定するための情報です。**新しい3Dモデルを作る機能ではなく、元画像の画素を移動・補間する処理**であるため、左右どちらのカメラにも写っていない背景を完全に復元することはできません。

**DaVinci Resolve Studio／Fusion Studio限定**のNodeです。

## 役割と前提

New Eyeには、主に2つの使い方があります。

- **中間視点を作る**：左右のカメラのほぼ中間から撮影したような画像を、既存の2枚から推定します。
- **片眼を作り直す**：左眼の画像を右眼の位置へ変形し、右眼の画像を置き換えるといった操作を行います。片眼にだけある撮影上の問題を避けたいときに役立ちます。

正しく動作させるには、左右画像に加え、その対応位置を示す**Disparity補助チャンネル**が必要です。普通のRGB画像を2枚つないだだけでは、Nodeが利用する視差情報は得られません。通常は前段の[Disparity](./disparity.md)で視差を計算し、その左右出力をNew Eyeへ渡します。

New Eyeの入力・出力は<Term id="image">2D Image</Term>です。Camera 3Dや3D Scene、Z深度だけを入力して変換するNodeではありません。

## 入力

| 端子 | 接続するデータ |
| --- | --- |
| **Left Input**（オレンジ） | 左眼画像、または左右を1枚に格納したステレオ画像。 |
| **Right Input**（緑） | 右眼画像。**Stack ModeがSeparateのときだけ表示**されます。 |

左右の素材が個別の画像であれば、同じ時刻の左眼と右眼をそれぞれの入力につなぎ、**Stack Mode: Separate**を選びます。左右が横並び・縦並びなどの1枚の画像に収められている場合は、素材に合うStack Modeで扱います。

重要なのは、New Eyeに渡す時点で**視差補助チャンネルが付加されていること**です。視差を持たない元の撮影画像を直接つないでも、意図した新視点の生成にはなりません。

## 出力

| 端子 | 内容 |
| --- | --- |
| **Left Output** | 左眼側の処理結果。 |
| **Right Output** | 右眼側の処理結果。**Separate時だけ端子が表示**されます。 |

Controlsタブには左右眼それぞれの**Enable**があり、どちらを新しい補間画像へ置き換えるか選べます。片方を基準画像として保持したい場合は、その眼のEnableをオフにします。

ManualにはStack Modeで左右をまとめた場合、L/R出力は同じ画像になると記載されています。一方、右出力端子自体はSeparate時のみ表示されるとの説明もあるため、実際の配線は選択中のモードで表示される端子に従います。

**補助チャンネルの扱いに注意してください。** 21.1 ManualのNew Eye冒頭では、Nodeが補助チャンネルを補間せず、**Disparityを含めて破棄する**と説明しています。後段でも視差を使うなら、New Eyeの後ろに再び[Disparity](./disparity.md)を置いて計算し直します。出力欄には「新しいDisparity channelがある」とも書かれており、同じ節に記述の不一致があります。本記事では再計算を前提にします。

## Inspectorの主な設定

### Enable：作り直す眼を選ぶ

Controlsタブには左眼と右眼について同種の設定が並びます。**Enable**をオンにした眼は、New Eyeによる補間画像で置き換えられます。

たとえば左眼の映像を基準に右眼を作り直す場合、**左眼のEnableをオフ、右眼のEnableをオン**にします。両方の映像を無条件に作り直す必要はありません。

### Lock XY／XY Interpolation Factor：視点の位置を決める

**XY Interpolation Factor**は、補間した画像が左右のどの視点に相当するかを設定します。

| 値 | 意味 |
| --- | --- |
| **-1.0** | 左眼の視点 |
| **0.0** | 左眼と右眼の中間 |
| **1.0** | 右眼の視点 |

たとえば右眼の位置を狙って画像を作り直すとき、X方向のInterpolation Factor **1.0**が基準になります。左右の中間位置を狙うときは**0.0**を使います。これらは**新視点の位置を左右間で補間するための係数**であり、カメラまでの距離や画素数を直接入力する項目ではありません。

**Lock XY**をオンにするとX方向とY方向の係数を連動させます。オフにすると別々に設定できます。Manualの例では、右眼側でXを**1.0**、Yを**-1.0**にすると、横方向は左眼の画像を右眼の位置へ移動しながら、縦方向は左眼に合わせた状態で補間します。左右で高さがずれている素材に対して、補間方向を分けたい場合に使えます。

### Depth Ordering：画素が重なったときの優先順位

新しい視点へ画素を移動すると、異なる場所にあった複数の画素が同じ位置へ重なることがあります。**Depth Ordering**は、その場所でどちらの画素を前面へ描画するかを決めます。

- **Largest Disparity On Top**：視差値の大きい画素を前面に描画します。
- **Smallest Disparity On Top**：視差値の小さい画素を前面に描画します。

手前の人物と背景の境界などで重なりがおかしく見える場合は、両者の結果を比較します。視差推定自体が間違っている場所は、この切り替えだけでは正しくならないことがあります。

### Clamp Edges／Softness：画像端の隙間を扱う

視点を移すと、元画像の範囲外に新しい画像の画素が必要になり、**透明な隙間**が現れることがあります。

**Clamp Edges**は端の画素を引き伸ばすことで、小さな隙間を目立たなくする機能です。隙間が広いと、被写体や画像端が長く引き伸ばされる場合があります。Manualは**小さな隙間の補正に使う**ことを勧めています。

**Softness**は、その引き伸ばしで生じる不自然さを抑えるための項目です。Manualでは、Source Frame and Warp Directionを複数選んでいる場合の例として**0.01程度**、1つだけ選ぶ場合には**0.03程度**を挙げています。これらは推奨する使用例であり、初期値や有効範囲ではありません。

### Source Frame and Warp Direction：どちらの画像と視差を使うか

新しい画像の画素を**左眼・右眼のどちらの元画像から取得するか**、また**左→右・右→左どちらの視差を使って動かすか**を指定します。

| 設定 | 元の画像と視差 |
| --- | --- |
| **Left Forward** | 左眼画像と左→右の視差 |
| **Right Forward** | 右眼画像と左→右の視差 |
| **Left Backward** | 左眼画像と右→左の視差 |
| **Right Backward** | 右眼画像と右→左の視差 |

最大4種類の変形結果を組み合わせられます。一方の画像に写っていない部分を他方から補えることがありますが、視差の推定が一致しない箇所では**輪郭が二重に見える**場合もあります。

**右眼を作り直す場合に、Left系の変形だけを使う**方法がManualに示されています。これは問題のある右眼の色を使わず、左眼に存在する画素で右眼相当の画像を作ろうとする方法です。手前の物体に隠れていた背景など、左眼にも存在しない画素は補えません。

### Stack Mode／Swap Eyes

**Stack Mode**は左右を別々の入力で扱うか、1枚にまとめて扱うかを決めます。**Separate**にすると右入力と右出力が表示されます。

**Swap Eyes**は左右眼の割り当てを入れ替えます。視差の誤推定を直す操作ではありません。共通のSettingsタブについてはStereo Familyの設定と区別してください。

## 具体例：左眼から右眼を作り直す

2台のカメラで撮った人物の映像で、右眼だけに撮影上の問題があるとします。左眼の映像を利用して、右眼の位置にある画像を作成する手順です。

~~~text
左眼画像 ──┐                 ┌─ 左眼＋視差 ─┐            ┌─ 左眼側の結果
           ├─ Disparity ────┤              ├─ New Eye ──┤
右眼画像 ──┘                 └─ 右眼＋視差 ─┘            └─ 再生成した右眼
~~~

1. 左右の画像を同じ時刻へそろえます。全体の大きな位置ずれがある場合は[Global Align](./global-align.md)を前段で使います。
2. **Disparity**の2つの入力に左右をつなぎ、出力された**視差付きの左右画像**をNew Eyeの左右入力へ個別に接続します。
3. **Stack Mode: Separate**を選び、**左眼Enableをオフ、右眼Enableをオン**にします。正常な左眼側は基準として残します。
4. 右眼側の**XY Interpolation Factor**を目的の視点へ設定します。右眼の位置なら**1.0**が基準です。**Left Forward／Left Backward**を比較し、左眼由来の画素から右眼を生成します。
5. 元の右眼画像と比べ、人物の輪郭、髪、手、画像端に穴・二重像・引き伸ばしがないかを確認します。必要ならDepth Ordering、Clamp Edges、Softnessを調整します。元画像にない情報は別途修復が必要です。
6. 後段で[Stereo Align](./stereo-align.md)などの視差を使う処理が必要なら、**New Eyeの出力後にDisparityをもう一度配置**します。

この手順は21.1 Manualの記載に基づく構成例です。特定素材に対して実機で補修効果を確認した記録ではありません。

## 具体例：左右の中間視点を作る

左右2つのカメラの中間に相当する視点の画像を作る場合は、[Disparity](./disparity.md)で求めた視差付き画像をNew Eyeへ入力し、補間する眼の**Interpolation Factorを0.0**にします。

中間視点を生成すると、手前の被写体の位置が変わることで、元の画像では隠れていた背景が必要になる場合があります。**補間は実際の中間カメラで撮影した映像と同一ではありません**。人物の輪郭、遮蔽部分、画像端を確認し、必要に応じて別の補修処理を使います。

## 関連Nodeと注意点

- [Disparity](./disparity.md)：左右の対応位置から視差を計算します。New Eyeの前段、必要なら後段にも置きます。
- [Global Align](./global-align.md)：視差を計算する前に、大きな平行移動や回転のずれを整えます。
- [Stereo Align](./stereo-align.md)：左右の縦ずれ、輻輳位置、眼間距離を視差に基づいて調整します。新しい視点を生成するNew Eyeとは用途が異なります。
- [Combiner](./combiner.md)／[Splitter](./splitter.md)：左右の画像を1枚にまとめる・分ける処理です。視差による画素の補間は行いません。
- [Stereo 3Dノード一覧](./index.md)：Stereo Familyの位置づけと関連Nodeを確認できます。

**視差の品質がNew Eyeの画質を左右します。** 左右の色差・大きな位置ずれ・黒帯・レンズ歪みがあると、前段の視差推定に誤差が生じる可能性があります。元画像にない背景、透明な隙間、二重輪郭は設定だけで完全には解消できないことがあります。

## バージョンと検証状況

**一次資料：Blackmagic Design『[DaVinci Resolve 21.1 Reference Manual](https://documents.blackmagicdesign.com/UserManuals/DaVinci_Resolve_21.1_Reference_Manual.pdf)』Chapter 118「Stereo Nodes」、New Eye [NE]、pp.2787–2789。** Studio限定、入力・出力、Enable、Lock XY、XY Interpolation Factor、Depth Ordering、Clamp Edges、Softness、Source Frame and Warp Direction、Stack Mode、Swap Eyesの名称と基本的な動作はこの節で確認しました。

**Manual内の記述不一致**：p.2787冒頭では補助チャンネル（特にDisparity）を破棄し、後段で再計算する必要があると記載されています。一方、同じページのOutputs欄には新しいDisparity channelを持つと書かれています。本記事は再計算が必要という説明を採用し、出力の視差保持を保証しません。

**verification: partial**：Resolve/Fusion 21.1実機での内部REGID、初期値・数値範囲、Stack Modeの全選択肢、補間結果とStudio間の差は未確認です。接続例は一次資料から組み立てた運用例であり、実機レンダリング済みではありません。
