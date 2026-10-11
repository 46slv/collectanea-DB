---
title: OCIO Display
description: OCIO configのSource Space・Display・Viewを使って表示向け変換を画像へ適用する方法、Viewer LUTとの違いと二重変換の注意点。
doc_type: node
term_id: ocio-display
term_short: OCIOで定義されたDisplay / Viewの表示変換を画像そのものに適用するノード。
verification: partial
aliases: [OCIO Display, OCD]
concepts: [image-data, color-space, ocio]
nodes: [OCIO Display]
node_family: color
controls: [OCIO Config File, Source Space, Display, View]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, display-transform]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-11"
---

# OCIO Display

**OCIO Display**は、映像を特定の表示環境で見るための色変換を、入力画像に適用するノードです。OpenColorIO（OCIO）の設定ファイル（`.ocio`）に登録された**Display**と**View**の組み合わせを選び、変換後の画像を後続のノードへ渡します。

たとえば、ACEScgなどの合成用の色空間で作業した画像を、SDRモニター向けの見え方に変換して確認用ファイルへ書き出す場合に使えます。ACEScgのRGB値をそのまま表示装置へ渡すだけでは、制作時に意図したコントラストや明るさにならないことがあるためです。

**これはViewerの表示設定ではなく、画像データを処理するノードです。** 合成中の画像に表示変換を適用すると、以後のノードが受け取る画素値も変わります。プレビューだけを変えたい場合は、後述するViewer LUTとの違いを確認してください。

## 入力と出力

| 接続 | 役割 |
| --- | --- |
| **Input**（画像入力） | 表示変換の対象となる2D <Term id="image">Image</Term>。Loader、MediaIn、Mergeなどの出力を接続します。 |
| **Effect Mask**（任意） | PolygonやRectangleなどで作ったマスクを接続し、変換する領域を限定します。 |
| **Output** | Display / Viewに従って変換された画像を後段へ渡します。 |

基本的な接続は`MediaIn → OCIO Display → MediaOut`です。Fusion StudioではLoaderやSaverなどを使う構成にもできます。

色管理の目的で使う場合、通常は**画像全体に同じ表示変換**を適用します。Effect Maskで一部だけに適用すると、表示変換済みの領域と未変換の領域が混在します。境界が不自然になるだけでなく、後続の処理が画像全体を同一色空間として扱えなくなることがあります。

## Inspector：Controls

### OCIO Config File

`Browse`から使用する`.ocio`設定ファイルを選びます。これは単独の画像LUTではなく、使用可能な色空間、Display、View、変換の対応関係などを定義する**設定ファイル**です。

選択できる項目はconfigによって変わります。OCIO一般の説明として、21.1マニュアルでは別のconfigが指定されていない場合にFusionのLUTsディレクトリ内の`DefaultConfig.ocio`が使われることが説明されています。ただし、案件で採用する色管理が決まっているなら、その案件のconfigを明示的に指定します。

### Source Space

**このノードへ入ってくる画像が現在どの色空間にあるか**を選びます。表示先の色空間を指定する項目ではありません。

例えば、上流の[OCIO Color Space](./ocio-colorspace)でACEScgへ変換した画像を接続するなら、Source Spaceにはconfig内でACEScgに相当する項目を指定します。カメラの撮影時のLog設定をそのまま選ぶとは限りません。上流やResolveの色管理が変換を済ませている場合は、その結果の色空間が基準になります。

### Display

**どの表示装置・表示条件向けの変換を使うか**を、configに定義されたDisplayから選びます。

ここでいうDisplayは単なるモニター名のメモではありません。選んだ表示先に応じて、利用できるViewや変換の内容が決まります。OCIO Displayが実際のモニターを自動検出・校正するという意味でもありません。表示装置の設定やキャリブレーションは別途確認が必要です。

### View

選んだDisplayに対して、**どの見え方で画像を表示するか**を選びます。たとえば、同じディスプレイでも、通常の鑑賞向けの見え方と、Logや変換前の値を確認するための見え方をconfigが別々に用意している場合があります。

Viewを「もう一つのOutput Color Space」と考えると混乱します。OpenColorIOの定義では、Viewは表示側の色空間への変換だけでなく、シーン基準の画像を表示基準へ写す描画変換などを含めて構成できます。実際に何が適用されるかは読み込んだconfigの定義によります。

## 運用例：ACEScgで合成した画像を確認用に書き出す

**前提：** Fusion Studioなどで、表示変換を自動適用しない手動OCIOワークフローを使い、案件のconfigにACEScgと目的のDisplay / Viewが定義されているとします。

~~~text
Loader（カメラ素材）
  ↓
OCIO Color Space（カメラの色空間 → ACEScg）
  ↓
Merge / Blurなど（ACEScgで合成）
  ↓
OCIO Display（Source Space: ACEScg → Display / View）
  ↓
Saver（表示向けの確認ファイル）
~~~

1. 素材の収録方式と、OCIO Color Spaceを出た段階の色空間を確認します。合成に使う各素材を同じ作業色空間へそろえます。
2. 合成結果の後ろにOCIO Displayを接続し、先ほどと**同じOCIO config**を指定します。
3. Source Spaceに現在の作業色空間（この例ではACEScg）を選びます。
4. Displayに確認先のモニターに対応する項目、Viewに目的の表示変換を選びます。**メニューの実際の名前はconfig次第**です。
5. 出力ファイルの色表現と、再生環境側で追加の表示変換が行われないかを確認して書き出します。確認用ファイルが意図した見え方か実際の表示環境で点検します。

この例のOCIO Display以降は**表示向けに変換済み**です。さらにACEScgとして合成処理へ戻したり、同じ表示変換をもう一度適用したりしないでください。シーンリニアの合成結果を後工程へ渡す場合は、Display変換前の画像を別途保持します。

ResolveのColor ManagementやACES管理を使っている場合、MediaIn / MediaOutやタイムラインの変換がこの役割を担当することがあります。その状態で同じ目的のOCIO Displayを追加すると二重変換になるため、**MediaInに実際に入ってくる画像と、MediaOutへ返すべき画像の色空間**を先に確認します。

## Viewer LUTとは何が違うか

Fusion StudioのViewerには、`OCIO Color Space View LUT`を設定する方法があります。これは**Viewer上でどう見せるか**を変えるための機能であり、通常のノードグラフがSaverへ送る画像データは書き換えません。21.1マニュアルのChapter 76では、ViewerのLUTメニューから`OCIO Color Space View LUT`を選び、同じメニューの`Edit`で設定を開く操作が説明されています。

一方、**OCIO Displayはノードなので、変換結果がOutputから後続へ流れます。** Viewerでの確認だけが目的ならViewer LUTが適しており、表示向けに変換した画像を後続ノードや出力ファイルに実際に渡す必要があるときにOCIO Displayを選びます。

| 目的 | 選ぶもの |
| --- | --- |
| 合成データをscene-linearのまま保ち、画面上だけ表示向けに見せる | **Viewer LUT** |
| 指定したDisplay / Viewの変換結果を実際の画像として後続へ渡す | **OCIO Display** |
| 作業用の色空間から別の作業用・受け渡し用の色空間へ変換する | [OCIO Color Space](./ocio-colorspace) |
| LUTファイルなどを直接適用する | [OCIO File Transform](./ocio-filetransform) |
| ACESの入力変換・出力変換を明示的に扱う | [ACES Transform](./aces-transform) |

OCIO Color Spaceの`Look`は、独立して指定する色表現の変換です。OCIO Displayには同名のInspector項目はなく、Display / Viewの組み合わせを指定します。ただし、OCIO configのView定義自体がLookなどを含むことはあります。単に「View＝Look」と置き換えず、configの内容を確認してください。

## 色が期待どおりにならない場合

- **全体が暗い・明るい、色が大きく変わる**：Source Spaceが「ファイルの元の色空間」ではなく**このノードへ届いた画像の現在の色空間**と一致するか確認します。上流とプロジェクト側の自動変換も確認します。
- **目的のDisplayやViewが見つからない**：まず読み込んだ`.ocio`ファイルを確認します。候補はconfigが定義しており、任意の組み合わせを選べるわけではありません。
- **Viewerでは正しいのに書き出し結果が違う**：Viewer LUTはプレビュー用です。Saver / MediaOutへ実際に渡した画像の色空間と、再生側の変換を別々に確認します。
- **変換済みの画像をさらに出力変換してしまう**：OCIO Display、Resolve側の出力変換、再生システムの表示変換を重ねていないか確認します。
- **一部の領域だけ見え方が違う**：Effect Maskが接続されていないか確認します。

## バージョンと出典

- **Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2195–2196**：OCIO Display [OCD]の入力、Effect Mask、接続例と、`OCIO Config File / Source Space / Display / View`の4つのControls。
- **同Chapter 76「Managing Color for Visual Effects」pp.1661–1663**：OCIOによるACEScg合成と、Fusion Studioの`OCIO Color Space View LUT`の運用。
- [OpenColorIO公式「Displays & Views」](https://opencolorio.readthedocs.io/en/latest/guides/authoring/displays_views.html)：Display / View定義、View Transformと表示側の色空間の関係。

本文の項目名は21.1マニュアルで確認したものです。操作例はこの仕様をもとに構成したもので、21.1実機での全設定組み合わせを検証した結果ではありません。Display / Viewの実際の候補、デフォルト値、Free / Studio間の細かな差は、使用するconfigや実機を確認するまで未確定です。
