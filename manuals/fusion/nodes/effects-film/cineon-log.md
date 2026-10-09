---
title: "Cineon Log"
description: "カメラのログ画像を合成用のリニア画像へ変換し、必要に応じてログへ戻すFusionノード。"
doc_type: node
term_id: "cineon-log"
term_short: "Cineon Logは、カメラのログ記録方式に応じて画像の階調カーブをリニアとの間で変換するノード。"
verification: partial
aliases: ["Cineon Log", "Log"]
concepts: ["image-data"]
nodes: ["Cineon Log"]
node_family: "effects-film"
controls: ["Depth", "Mode", "Log Type", "Lock RGB", "Level", "Soft Clip", "Film Stock Gamma", "Conversion Gamma", "Conversion Table"]
inputs: ["image", "mask"]
outputs: ["image"]
tasks: ["linear-workflow", "composite"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Cineon Log

Cineon Logは、カメラでログ（Log）記録された映像を、光の強さに対応するリニア（Linear）画像へ変換するノードです。逆方向の変換もできます。たとえば、ログ素材をそのまま合成せず、いったんリニアへ変換してから画像を重ねたり光を加えたりし、必要な場合にログ形式へ戻す構成で使います。

名前にCineonとありますが、Cineon専用ではありません。DaVinci Resolve 21.1のManualには、ARRI、Blackmagic Design、REDなどのカメラ向けログ形式も挙げられています。

## 役割

ログ画像では、明るい部分から暗い部分までを記録しやすいよう、光の強さと画素値の関係が圧縮されています。Cineon Logは、その階調カーブを指定した形式として読み取り、リニアとの間で変換します。

この処理は、画像の色域（色を表現できる範囲）を選び直すこととは別です。色域も変える必要がある場合は、[Gamut](../color/gamut)や[Color Space Transform](../color/color-space-transform)などを含めて管理方法を決めます。すでに別の場所でログからリニアへ変換済みの素材に、さらに同じ変換をかけることは避けます。

## 入力

### Input（オレンジ）

変換したい2D <Term id="image">Image</Term>を接続する入力です。通常はログ素材を出すMediaIn、またはFusion StudioのLoaderから接続します。逆変換するときは、合成後のリニア画像を接続します。

### Effect Mask（青）

任意の<Term id="mask">Mask</Term>入力です。Polygon、Ellipse、Paintなどで作ったマスクを接続すると、変換結果をその範囲にだけ適用できます。Manualでは、Effect Maskはノードの処理後に適用されると説明されています。

画面全体の色管理を目的とする場合、通常は画像全域を同じ変換条件で扱います。Effect Maskは、変換結果を部分的に比較したいときなどに使い、複数のログ状態とリニア状態が画面内で混在しないよう注意します。

## 出力

階調カーブの変換後の2D Imageを出力します。Log to Linであれば、後段のMergeや色・光の合成処理へ接続できます。Lin to Logであれば、指定したログ記録方式へ戻した画像を後段へ渡します。

出力端子そのものが特別な「ログデータ」型になるわけではなく、接続するデータ領域は通常の2D Imageです。何の階調カーブとして扱うかは、処理内容と後段の設定で判断します。

## 主な設定項目

### ModeとLog Type

Modeでは変換方向を選びます。

- Log to Lin：ログ画像からリニア画像へ変換します。素材をリニア環境で合成する前段に置くときに選びます。
- Lin to Log：リニア画像からログ画像へ変換します。後段へログ状態の画像を渡す必要があるときに選びます。

Log Typeには、変換したい素材のログ方式を指定します。21.1 Manualに記載されている選択肢は、Cineon、Arri Log C、BMD Film、Canon Log、Nikon N Log、Panalog、Panasonic V-Log、Red Log Film、Sony S-Log、Viper Film Stream、ACESlogです。

たとえば、ManualはBlackmagic DesignのRAW素材を合成するときの例として、ModeをLog to Lin、Log TypeをBMD Filmにする構成を示しています。ただし、RAWのデコード設定や色管理によって、MediaInの時点ですでに変換されている場合があります。カメラ名だけで決めず、実際にノードへ入っている画像の状態に合わせて選択します。

### Depth

ノードが画像を処理する際の色深度を指定します。既定のAutoでは、読み込んだファイル形式に基づいて決まります。Manualの例ではJPEGは8-bit、Blackmagic RAWはFloatとして扱われます。形式から判断できない場合はFrame Formatの設定が使われます。

後述するLevelで0未満または1超の値を保持したい場合は、処理深度に注意してください。

### Lock RGB

有効にすると、R・G・Bの各チャンネルへ同じ変換設定を適用します。解除すると、チャンネルごとに変換条件を調整できます。

通常のカメラログを正しく復元する目的なら、意図なくチャンネル別の条件へ変更しない方が、元の色バランスを保ちやすくなります。別々に調整するのは、チャンネルごとの応答を明示的に補正するときです。

### Level

ログ画像上の黒レベルと白レベルを、範囲コントロールの左右のハンドルで設定します。左が黒、右が白です。値を変えると、変換後のどの値を0.0、どの値を1.0付近とみなすかが変わります。

Manualによれば、設定した範囲より低いログ画素は変換後に0.0未満、高い画素は1.0超の値になります。浮動小数点（Float）処理ではこうした範囲外の値も保持されますが、8-bit / 16-bit整数処理ではクリップされます。白く見える部分の階調が消える場合、元画像だけでなくLevelと処理深度も確認します。

### Soft Clip (Knee)

変換カーブの上下を滑らかにして、範囲外になりやすい値を画像内へ収めるための設定です。単なる明るさの調整ではなく、階調の端の扱いを変えます。

**21.1 Manualには、Soft Clipを1以外にすると16-bit整数処理になり、Soft Clipで表現できない範囲外の値が失われると明記されています。** Floatでハイライトの1.0超の値を後段へ渡したい場合には、Soft Clipの使用を慎重に判断します。

### Film Stock Gamma / Conversion Gamma / Conversion Table

ログからの変換で使う応答カーブを調整する項目です。Manualには、指定した変換値を持つカスタムASCII LUTを作り、Browseで読み込む方法も記載されています。

通常はまず素材に合ったLog Typeを選びます。これらの項目を調整するのは、フィルムスキャンなどで既知の変換カーブへ合わせる必要がある場合です。資料で確認できない値を「そのカメラの正しい既定値」として流用しません。

## 主な用途

- ログで撮影した素材に、グローや光源の加算など光量を扱う合成処理を施す前にリニア化する。
- ログ素材とCG・グラフィックを同じ合成工程へ入れる前に、各素材の階調カーブを揃える。
- リニア環境で完成した合成結果を、ログ画像を受け取る後段の工程へ戻す。
- フィルムスキャン素材を、指定したログ応答カーブで変換する。

## 最小構成

ログの入力画像をリニアへ変換して確認する最小構成です。

    MediaIn / Loader（ログ画像）
      → Cineon Log（Mode: Log to Lin、Log Type: 素材の方式）
      → Viewer / 後段の合成ノード

InspectorでCineon Logを一時的に無効化すると、ログ画像と変換後の画像を比較できます。ただし、Viewerの表示変換が有効な場合、見た目の差だけで変換の正しさを断定しないでください。

## 運用例：ログ素材へCGの光を合成する

ログ撮影の夜景に、別途作った発光グラフィックを重ねる場合を考えます。

1. MediaInで夜景を読み込み、入力がログ状態かを素材の設定と表示経路から確認します。
2. Cineon LogをMediaInの後ろへ置き、ModeをLog to Lin、Log Typeをその入力に合った方式へ設定します。
3. グラフィックも合成先の作業空間と階調状態を揃えたうえで、Mergeや必要な光の処理に接続します。
4. 合成結果をリニア画像として渡すならそのまま後段へ進み、後段が同じログ方式を必要とする場合だけ、もう1つのCineon LogをLin to Logにして接続します。

    夜景（ログ）→ Cineon Log（Log to Lin） ─┐
                                              Merge → 合成結果
    CG（作業空間を揃えた画像）───────────────┘

    合成結果 → ［必要な場合のみ Cineon Log（Lin to Log）］ → 出力

両端に変換ノードを置くこと自体が目的ではありません。Fusionの前後ですでに色管理が行われる構成なら、二重の変換にならないよう、どこでログ／リニア変換を担当するか先に決めます。

## 挙動と注意点

- **Log Typeを取り違えない**：異なるカメラのログカーブを選ぶと、暗部・明部の階調や色バランスが意図と異なる結果になるおそれがあります。
- **色域とログカーブを混同しない**：ログからリニアへ戻しただけでは、必要な色域変換が完了したとは限りません。
- **範囲外の値を失わない**：Floatで保持したい0未満／1超の値は、整数処理やSoft Clip設定で失われることがあります。
- **Effect Maskの用途を分ける**：部分的な変換は比較や局所処理には使えますが、全画面の合成色管理では入力全域の状態を揃える方が判断しやすくなります。
- **カーブの往復を無条件に可逆とみなさない**：途中でクリップ・Soft Clip・チャンネル別補正を入れると、最初の画素値へ完全に戻らない場合があります。

## 似たノード・関連する考え方

- [Light Trim](./light-trim)：ログ状態の画像を、フィルムのトリムポイント単位で露出調整します。ログからリニアへの変換は担当しません。
- [Gamut](../color/gamut)：色域とガンマカーブを指定して変換します。色域を含めて調整するときに検討します。
- [Color Space Transform](../color/color-space-transform)：色空間の変換を、より広いカラーマネジメントの設定と併せて扱う場合の候補です。
- [Imageの基礎](../../learn/02-data/image)：2D Imageが何を受け渡しているかを確認できます。
- [Effect Maskを使う構成](../../patterns/masking/limit-effect-with-mask)：処理を画面の一部へ限定する一般的な考え方です。

## バージョンと検証状況

**資料確認：** DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 98「Film Nodes」、pp.2310–2312。2入力、基本接続、Depth / Mode / Log Type / Lock RGB / Level / Soft Clip / Film Stock Gamma / Conversion Gamma / Conversion Tableの記述を確認しました。

**未確認：** この記述はManualに基づくもので、現在のホスト上での入力端子・Inspector表示・具体的なデコード設定・往復変換の画素値・Free/Studio間の差異は実機検証していません。Manualが保証していない色管理の自動適用や変換精度を確定事項として扱いません。
