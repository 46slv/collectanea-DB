---
title: ACES Transform
description: ACESのIDTとODTを使った色変換、Fusionでの接続、Gamut Compression、プロジェクト側のACES管理との違いを説明する。
doc_type: node
term_id: aces-transform
term_short: ACESが定義する入力変換（IDT）と出力変換（ODT）を画像に適用するノード。
verification: partial
aliases: [ACES Transform, ACESTransform, ATr]
concepts: [image-data, color-space]
nodes: [ACES Transform]
node_family: color
controls: [ACES Version, Input Transform, Output Transform, Gamut Compress Type]
inputs: [image, mask]
outputs: [image]
tasks: [aces, color-space, color-management]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# ACES Transform

ACES Transformは、カメラなどの入力画像をACESの基準へ変換する**Input Device Transform（IDT）**と、ACESから表示・納品先へ変換する**Output Device Transform（ODT）**を指定するノードです。

ACESは、カメラごとに異なる色の記録方式を共通の基準へそろえ、合成・カラー調整を経て、上映や配信用の色へ出力するための仕組みです。ACES Transformは、その中の入力と出力の変換をFusionのノードグラフ内で使います。単に彩度やコントラストを調整するノードではありません。

概念上は次の順序です。

~~~text
入力画像（カメラの記録方式など）
  ↓ Input Transform / IDT
ACESのシーン基準の画像
  ↓ Output Transform / ODT
表示・納品先に合わせた画像
~~~

**注意：** 上図は変換の役割を示したものです。ACES内部の作業用データを常にこのノードで往復させる、という意味ではありません。ACESで管理されたプロジェクトや、すでにACES形式へ変換済みの画像に重ねて適用すると、不要な二重変換になります。

## 入力・出力

| 接続 | 渡すデータ・役割 |
| --- | --- |
| Input（オレンジ） | 変換対象の2D <Term id="image">Image</Term>。MediaIn、Loaderなどの画像出力をつなぐ。 |
| Effect Mask（青） | 任意のマスク。指定した領域だけへ変換を適用する。マスクはノードの処理後に適用される。 |
| Output | IDT・ODTの指定に従って変換した2D画像。Merge、後続の画像処理ノード、MediaOutなどへつなぐ。 |

MediaIn / Loader → ACES Transform → MediaOutのように接続できます。ただし、ノードへ**現在どの色表現の画素値が届いているか**を確認してからInput Transformを指定します。MediaInや上流ノードで既に色変換されていれば、元ファイルのカメラ設定とノード入力の状態は一致しないことがあります。

Effect Maskを使うと、画面の一部だけ表示向けの色に変わることがあります。異なる色表現の領域をそのまま合成・加工すると結果が不自然になるため、色管理全体の変換は原則として画像全体に一貫して適用します。

## Inspector：4つの主な項目

### ACES Version

使用するACES仕様のバージョンを選びます。プロジェクトとノードで異なるバージョンを混在させず、受け渡す素材や制作全体で採用した仕様にそろえます。

DaVinci Resolve 21.1マニュアルの**プロジェクト設定**にはACES 1.0.3、1.1、1.2、1.3、2.0が記載されています。ただし、これはプロジェクト設定側の列挙であり、Fusionノードの全メニュー項目や初期値を個別に実機確認したものではありません。

### Input Transform（IDT）

入力画像をACESへ変換するための設定です。通常は、素材を撮影したカメラや、その素材を**現在**符号化している形式に合わせます。

例えば、あるカメラのLog素材を別の色表現へ変換せずMediaInから受け取るなら、その記録方式に対応するIDTを候補にします。カメラ名だけで決めず、撮影時の色域・Log設定、デコードや上流変換の有無を確認します。

IDTは「映像を少し明るくするプリセット」ではありません。入力の定義が違えば、白・肌色・ハイライトなどの再現も意図とずれます。

### Output Transform（ODT）

ACES基準の画像を、表示装置や納品形式が要求する色表現へ変換する設定です。例えばRec.709向けの監視・納品であれば、その表示条件に合う出力変換を選びます。

同じ素材でも、SDRモニター、HDRモニター、デジタルシネマでは必要な出力変換が異なります。ODTを変更すると画面の見た目が変わるのは、出力先の前提が変わるためです。

ODTを適用した画像を、まだACESの作業用画像であるかのように後続の合成へ渡さないよう注意します。合成中に用いるシーンリニアの色空間と、表示用に変換された色は用途が異なります。

### Gamut Compress Type

鮮やかな光源などで、変換後に色域を超えた値が不自然に切り捨てられることを軽減するための、ACES Gamut Compressionを選ぶ項目です。

対象になりやすい例は、LED照明、ネオンサイン、車のテールランプなど、特定の色成分が極端に強い部分です。色域とは、ある色表現や表示装置が扱える色の範囲を指します。Gamut Compressionは、範囲を超える鮮やかな色を調整して、階調や色のつながりを保ちやすくする処理です。

21.1マニュアルは、この項目でACES Gamut Compressionの種類を選べることを説明していますが、Fusionノードの各選択肢名とバージョン別の動作差までは本記事で確定していません。色域外の色が実際に問題になる場面で、変換前後を比較してください。

## 実践例：カメラ素材をACES経由でRec.709向けに出す

**前提：** プロジェクト側の自動色管理が同じ変換を行っておらず、MediaInから入力素材の記録方式に対応する画像を受け取っている場合の例です。

~~~text
MediaIn（カメラ素材）
        ↓
ACES Transform
  IDT: 素材の記録方式に対応するもの
  ODT: 納品・監視先のRec.709条件に対応するもの
        ↓
MediaOut（後段で同じ出力変換を繰り返さない）
~~~

1. Project SettingsのColor Managementを確認し、Resolveが素材の入力変換や出力変換をすでに実行していないか調べます。
2. カメラの収録設定と、MediaInから実際に出ている画像の色表現を確認します。
3. ACES Versionを制作全体で使うバージョンに合わせ、Input Transformに該当するIDTを指定します。
4. Output Transformにモニター・納品条件へ対応するODTを指定します。Rec.709であっても、実際の表示条件を確かめます。
5. LEDやネオンの色が不自然に飽和する場合はGamut Compress Typeを比較します。
6. Viewerでの見た目だけではなく、MediaOut以降で追加の出力変換が適用されていないか確認します。

この構成は**入出力変換そのものを説明する最小例**です。複数素材を合成する場合は、各素材をいったん同じシーン基準の作業色空間へそろえ、Mergeなどの合成を行い、その後に表示用の変換を行う構成が適しています。IDTとODTを持つACES Transform一つを、あらゆる合成工程の色管理として流用しないでください。

## ResolveのACES管理・OCIO・CSTとの違い

| 方法 | 何を基準に変換するか | 使い分け |
| --- | --- | --- |
| **ACES Transform** | ACES仕様で定められたIDTとODT | ノード内でACESの入出力変換を明示的に使う。 |
| **Project SettingsのACES管理** | プロジェクト全体のACES設定 | Edit、Fusion、Colorを通して同じ管理を行う場合。通常はこちらを先に検討する。 |
| [OCIO Color Space](./ocio-colorspace) | 使用するOCIO configのSource / Output Space | Fusion Studioや、ACEScgなど合成用のシーンリニア色空間を明示して運用する場合。 |
| [Color Space Transform](./color-space-transform) | 入力・出力のColor SpaceとGammaなど | 一般の色空間・ガンマ変換やTone / Gamut Mappingが必要な場合。 |
| [Gamut](./gamut) | Source / Output SpaceとGammaの追加・除去 | Fusionの画像を合成用の色表現へ変換する場合。 |

21.1マニュアルは、CSTにもACESの選択肢がある一方、**正式なACESワークフローではAcademyが規定する変換を使うACES Transformを利用する**と区別しています。CSTでACESと表示された色空間を選ぶことだけでは、ACESのIDT・ODTを再現したことにはなりません。

ResolveのプロジェクトをACEScc / ACEScctで管理している場合、Fusionページでは合成用に画像が自動でリニア化されます。さらに同じ目的でACES Transformを挿入すると、すでに処理した画像を別の入力形式として再解釈してしまうおそれがあります。**ACES Transformが必須なのではなく、上流と下流を含めて変換を一度ずつ行うこと**が重要です。

Fusion Studioでは、21.1マニュアルはACES色管理の手段としてOCIOを案内しています。OCIOでACEScgを作業色空間にする場合、OCIOの設定とViewer用の表示変換を整えます。Viewer LUTによるプレビュー変換と、ノードで画素値そのものを書き換える処理は別です。

## 問題が起きたとき

- **画面全体が暗い、白っぽい、色が極端に変わる**：IDTが現在の入力画像の記録方式と合っているか、上流やProject Settingsで既に変換されていないか確認する。
- **Rec.709モニターで想定と違う**：選択したODTとモニターの表示条件、Viewer LUT、MediaOut以降の変換を分けて確認する。
- **LEDやネオンの色が不自然に飽和する**：最初にIDT / ODTの組み合わせを確認し、必要ならGamut Compress Typeを比較する。
- **マスク境界だけ色が変わる**：Effect Maskが色変換を局所適用していないかを確認する。
- **合成すると素材同士の明暗が合わない**：Merge前の素材が同じシーンリニアの色空間にあるか確認する。表示用のODTを一方だけにかけない。

## 実機例：入力変換だけの表示とODTを加えた表示

<!-- capture-case:S106 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。左がLoaderのテストチャート、右が処理後です。

[![LoaderからFusionのACES Transformを経てMediaOutへ接続した実機Graph](/img/fusion/captures/S106/graph.png)](/img/fusion/captures/S106/graph.png)

ACES VersionはACES 2.0です。このチャートをsRGBのテクスチャとして扱い、Input Transformに「sRGB (Texture) - CSC」を指定しました。Output TransformがNo Output Transformの状態では、右の中間調が暗く表示されています。

[![ACES2.0で入力sRGB Texture CSC、出力No Output Transformを指定した実機Inspector](/img/fusion/captures/S106/idt-inspector.png)](/img/fusion/captures/S106/idt-inspector.png)

[![sRGBの入力変換だけを適用し、表示用ODTを加えていない右Viewerの実機比較](/img/fusion/captures/S106/idt.png)](/img/fusion/captures/S106/idt.png)

Input Transformを保ち、Output Transformを「Rec.709 BT.1886」へ変えました。右の中間調が入力変換だけの状態より明るくなり、色パッチも変わりました。入力と出力の変換をそろえて指定する場所を確認できます。

[![ACES2.0、入力sRGB Texture CSC、出力Rec709 BT1886、Gamut Compress Noneの実機Inspector](/img/fusion/captures/S106/inspector.png)](/img/fusion/captures/S106/inspector.png)

[![Rec709 BT1886の出力変換を加えた右Viewerと元のテストチャートの実機比較](/img/fusion/captures/S106/compare.png)](/img/fusion/captures/S106/compare.png)

初期状態のNo Input Transform／No Output Transformでは、左右は同じ見え方でした。最後は上記の入出力変換で保存しています。Gamut Compress TypeはNone、プロジェクトの色管理設定は変更していません。これは合成チャートで操作を説明する例です。カメラIDTの適合判定、測色、RCM／プロジェクトACESとの連携、他Version・ODT・Gamut Compression、MaskやAlpha、Edition差と性能は未確認です。

[再現用Graph](/img/fusion/captures/S106/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S106/capture.json)

## 出典と確認範囲

- Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 93「Color Nodes」pp.2134–2135：ノードの入力、マスク、基本接続、InspectorのACES Version / Input Transform / Output Transform / Gamut Compress Type。
- 同Chapter 93 p.2140：CSTのACES選択と、Academyが指定するACES Transformの区別。
- 同Chapter 76「Managing Color for Visual Effects」pp.1658–1662：RCMとACESのFusionページへの適用、Fusion StudioでのOCIO、Viewer LUT。
- 同Chapter 9「Data Levels, Color Management, and ACES」pp.244–247：プロジェクト側のACES Version、IDT / ODTと入出力の考え方。
- [Blackmagic Design公式サポートセンター](https://www.blackmagicdesign.com/support)：DaVinci Resolve 21.1 Reference Manual（2026年9月8日公開）。

S106の接続とInspector、入出力変換による表示を実機確認しました。カメラ素材の構成例はManualに基づく提案で、実写や書き出しの検証結果ではありません。Fusionノードの全プリセット、初期値・数値範囲、Free / Studioの差は未確認です。
