---
title: OCIO Color Space
description: OCIO configのSource SpaceからOutput Spaceへ画像を変換し、ACEScgでの合成などに使用する色管理ノード。
doc_type: node
term_id: ocio-colorspace
term_short: OCIO configに従い、入力画像を指定の色空間へ変換するノード。
verification: partial
aliases: [OCIO Color Space, OCS]
concepts: [image-data, color-space, ocio]
nodes: [OCIO Color Space]
node_family: color
controls: [OCIO Config, Source Space, Output Space, Look]
inputs: [image, mask]
outputs: [image]
tasks: [ocio, color-space]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-24"
---

# OCIO Color Space

OCIO Color Spaceは、**入力画像のRGB値がどの色を意味するか**を、別の色空間の表現に変換するノードです。OpenColorIO（OCIO）の設定ファイル（config）に定義された変換を使います。

たとえば、異なるカメラで撮影したLog映像をそのまま合成すると、数値の意味が異なる画像同士を扱うことになります。両方を共通の作業色空間に変換すれば、合成ノードが同じ前提で画像を処理できます。ACEScgはそのような合成用のscene-linear（光の強さに比例する値）の色空間の一例です。

このノードは**色空間をそろえるための変換**であり、カメラ素材の色を目分量で好みに調整するノードではありません。入力素材の色空間を誤って指定すると、変換結果も意図と異なります。

## 入力と出力

| 接続 | 内容 |
| --- | --- |
| **Input**（オレンジ、必須） | 色空間を変換する2D画像。MediaInやLoaderなどを接続します。 |
| **Effect Mask**（青、任意） | マスクが示す領域だけに変換結果を適用します。マスクは変換処理の後に適用されます。 |
| **Output** | 指定した色空間へ変換された2D画像を次のノードに渡します。 |

通常の色管理では、画像全体の色空間を統一するためマスクなしで使います。Effect Maskによる部分変換もできますが、**変換済み領域と未変換領域が1枚の画像に混在**するため、後続ノードが画像の色空間を正しく解釈できなくなることがあります。

## Inspector：Controls

### OCIO Config

使用する `.ocio` ファイルを読み込む項目です。ファイル選択ダイアログから指定します。

OCIOでは、環境変数 `OCIO` でconfigファイルの場所を指定する運用もあります。ほかのconfigを読み込んでいなければ、FusionのLUTsディレクトリ内の `DefaultConfig.ocio` が使用されます。

configには、選択できる色空間とその間の変換が定義されています。施設・案件の共通configを使うことにより、異なる素材やアプリケーション間でも変換の前提を共有できます。

### Source Space

**今の入力画像の色空間**を指定します。「これから変換したい色空間」ではありません。

たとえばカメラのLog素材なら、実際に収録したカメラの色空間に対応する項目を選びます。読み込んだconfigによって選択肢は変わるため、メニュー名を固定して覚えるより、素材の記録設定とconfigの定義を照合してください。

### Output Space

**このノードを通った後の画像をどの色空間として扱うか**を指定します。利用できる項目はconfigに依存します。

合成の途中ではACEScgなどのscene-linear作業色空間を選びます。一方、納品・後工程に渡す手前では、受け手が要求する色空間へ戻す必要がある場合があります。ACEScgを選んだだけでは、ディスプレイ表示や納品用の変換まで完了したことにはなりません。

### Look

インストールされたOCIO Color Transform Lookを選びます。選択できるLookがなければ、メニューには`None`だけが表示されます。

**Look（画像の色表現を変える変換）**は、Display / View（どの表示環境でどう見せるかの変換）と同じものではありません。表示用の変換をノードとして扱う場合は[OCIO Display](./ocio-display)を使い分けます。

SettingsタブはColorノードに共通する項目です。ここではOCIO Color Space固有のControlsに絞っています。

## 運用例：Log素材をACEScgへ変換して合成

以下は**Fusion Studio、またはResolve側で同等の入力変換を自動実行していない構成**を想定した例です。使用するOCIO configが、入力カメラの色空間とACEScgの両方を定義している必要があります。

1. 素材の収録設定から元の色空間を確認し、案件で使用するOCIO configを決めます。
2. Loader（ResolveではMediaIn）の直後へOCIO Color Spaceを接続します。
3. OCIO Configに共通configを指定します。
4. Source Spaceには**入力素材の実際の色空間**を、Output Spaceには**ACEScg**を選びます。正確な選択肢名はconfig依存です。
5. 複数素材をMergeで合成するときは、それぞれ適切なSource Spaceから**同じ作業色空間**へ変換してから接続します。
6. 後工程がACEScg以外の色空間を要求する場合は、最後にもう1つOCIO Color Spaceを置き、ACEScgから**次工程が要求する色空間**へ変換します。

```text
Loader / MediaIn（カメラ素材）
  ↓
OCIO Color Space（元の色空間 → ACEScg）
  ↓
Merge / Blur / 合成処理
  ↓
OCIO Color Space（ACEScg → 次工程の色空間）
  ↓
Saver / MediaOut
```

ここで最後の変換は常に必要なわけではありません。**Resolve Color ManagementやACES管理ですでに入力・出力変換されている場合、Fusion側で同じ変換を重ねると二重変換になります。** MediaInに渡される画像の色空間と、MediaOutへ返すべき色空間をプロジェクト設定に照らして決定します。

## Viewerの表示は別に管理する

scene-linear画像をモニターへそのまま表示すると、通常期待する見え方にならないことがあります。Fusion Studioでは、Viewerの**OCIO Color Space View LUT**で作業色空間から表示用の色空間への変換を設定できます。

Viewer LUTは**画面での見え方**のための設定であり、OCIO Color Spaceノードが後続ノードへ渡す画像データそのものを書き換えません。そのため「Viewerで正しく見える」ことと「SaverやMediaOutへ正しい色空間で出力できる」ことは別に確認します。

[OCIO Display](./ocio-display)は表示変換を画像処理ノードとして適用するため、Viewer LUTとは出力への影響が異なります。

## 近いノードとの違い

| ノード | 用途 |
| --- | --- |
| **OCIO Color Space** | OCIO configのSource SpaceからOutput Spaceへ画像の色空間を変換します。 |
| [OCIO Display](./ocio-display) | OCIO configのDisplay / Viewを指定して画像へ表示用変換を適用します。 |
| [OCIO File Transform](./ocio-filetransform) | LUTなどの変換ファイルを読み込んで適用します。 |
| [OCIO CDL Transform](./ocio-cdl-transform) | CDLの補正値を読み込み・適用します。 |
| [ACES Transform](./aces-transform) | ACESのIDT・ODTを指定する専用の変換です。 |
| [Color Space Transform](./color-space-transform) | 色空間・GammaやTone / Gamut Mappingを指定するResolve側の変換です。 |

## 色が合わない場合

- **変換すると色がおかしい**：まずSource Spaceが素材の収録・書き出し設定と一致するか確認します。誤った入力の解釈はOutputを変えても修正できません。
- **目的の色空間が一覧にない**：OCIO Configを確認します。Source / Outputのリストはconfigが提供した内容に依存します。
- **Lookが`None`しかない**：configに利用可能なLookが登録されていません。
- **明るさやコントラストが急変する**：前後に別の色管理変換がないか確認し、二重変換を疑います。
- **Viewerは正しいが書き出しが異なる**：Viewer LUTと、MediaOut / Saverに送る実画像の変換を別々に点検します。
- **半透明の縁に不自然な色が出る**：前後のAlpha処理も確認します。[Premultiplication](../../learn/04-compositing/premultiplication)が関連します。

## 実機例：Config内のGamma2.2とlinearを選ぶ

<!-- capture-case:S112 -->

Resolve Studio21.1.0.14／Windows、1920×1080、Viewer40%、フレーム0で撮影しました。左が入力、右が処理後です。

[![LoaderからOCIO Color Spaceを経てMediaOutへ接続した実機Graph](/img/fusion/captures/S112/graph.png)](/img/fusion/captures/S112/graph.png)

この環境では、Config欄が空のままだとSource／Outputにrawが表示されました。そこでインストール先の`Fusion/LUTs/DefaultConfig.ocio`をノードのOCIO Configから明示的に指定しています。撮影条件には設定ファイルと付属LUTのハッシュを記録しています。環境変数やユーザー設定、インストール済みのファイルは変更していません。

保存Graphは撮影環境のインストール先を参照します。別の環境で開く場合は、その環境の同じ設定ファイルをOCIO Configで選び直してください。設定ファイルと付属LUTはここでは再配布していません。

この設定ファイルにはGamma2.2とlinearが定義されています。テストチャートをSource Space＝Gamma2.2、Output Space＝linearとして扱うと、右の中間調と色パッチが暗く表示されました。LookはNone、DirectionはForwardです。

[![インストール済みConfigを指定し、Source Gamma2.2とOutput linearを選んだ実機Inspector](/img/fusion/captures/S112/inspector.png)](/img/fusion/captures/S112/inspector.png)

[![OCIO ConfigのGamma2.2からlinearへの変換で右が暗くなる実機比較](/img/fusion/captures/S112/compare.png)](/img/fusion/captures/S112/compare.png)

Sourceを保ち、Output SpaceだけをGamma2.2にすると、左右は同じ見え方へ戻りました。最後はOutput linearで保存しています。

[![SourceとOutputの両方をGamma2.2にそろえたOCIO Color Spaceの実機Inspector](/img/fusion/captures/S112/matched-inspector.png)](/img/fusion/captures/S112/matched-inspector.png)

[![同じGamma2.2を入出力に選ぶと左右が同じ見え方へ戻る実機比較](/img/fusion/captures/S112/matched.png)](/img/fusion/captures/S112/matched.png)

この例は指定した色表現として合成チャートを処理した表示比較です。カメラ素材の入力判定、測色・書き出し精度、ACES／RCMとの連携、別ConfigやLook、ほかの色空間・Direction、MaskやAlpha、Edition差と性能は未確認です。

[再現用Graph](/img/fusion/captures/S112/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/S112/capture.json)

## バージョンと出典

- **DaVinci Resolve 21.1 Reference Manual** Chapter 93「Color Nodes」pp.2193–2195：Input / Effect Mask、Controls、config依存のSource / Output、Look、配置例。
- 同マニュアルChapter 76「Managing Color for Visual Effects」pp.1661–1663：OCIOでのACEScg合成、Fusion Studio Viewer LUT。
- [OpenColorIO公式](https://opencolorio.org/)および[公式config資料](https://opencolorio.readthedocs.io/en/latest/configurations/_index.html#configurations)。

固有のInspector項目名として確認したのは**OCIO Config / Source Space / Output Space / Look**です。メニューの実際の候補はconfigにより異なります。S112で同梱ConfigのGamma2.2／linearの選択と表示を確認しました。各候補の全リスト、厳密なデフォルト値、Free / Studio差は未確認です。
