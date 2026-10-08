---
title: "Custom Tool"
description: "数式で2D Imageの各channelを計算し、複数Image・matte・任意Controlを使って独自のpixel処理を組むFusion Node。"
doc_type: node
term_id: "custom-tool"
term_short: "Custom Toolは、3本の2D Image、matte、Effect Maskと式Controlを使い、pixel単位のchannel処理を自分で定義するNode。"
verification: partial
aliases: ["Custom Tool", "CT"]
concepts: ["image-data"]
nodes: ["Custom Tool"]
node_family: "time-metadata"
controls: ["Point In 1-4", "Number In 1-8", "LUT In 1-4", "Setup 1-4", "Intermediate 1-4", "Random Seed", "Channel Expressions"]
inputs: ["image", "image", "image", "matte", "mask"]
outputs: ["image"]
tasks: ["custom-effect", "pixel-expression", "channel-processing"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-08"
---

# Custom Tool

Custom Tool [CT]は、**式を使って2D Imageのpixelやchannelを直接計算する**ためのNodeです。

既存Nodeに目的の処理がないとき、Red / Green / Blue / Alphaだけでなく、Z、UV、Normal、motion vectorなどのchannelを式で読み書きできます。3本のImage、1本のmatte、Effect Maskを組み合わせ、NumberやPointなどのControlを式のparameterとして使えるため、小さな独自Effectや検証用処理をNode tree内だけで組めます。

timeやmetadataを変更するNodeではありません。中心になるのは、**入力Imageから値を読み、式を評価し、出力Imageの各channelへ新しい値を書くこと**です。

## 入力と出力

DaVinci Resolve 21.1 Reference Manualでは、次の入力が記載されています。

- **Image 1**（orange）: 1本目の2D Image。式では主に1番のchannel変数として参照します。
- **Image 2**（green）: 2本目の2D Image。
- **Image 3**（magenta）: 3本目の2D Image。
- **Matte Input**（white）: matteを式の中で値として使うための入力。式では **m1** として参照します。
- **Effect Mask**（blue）: Custom Toolの処理を適用する範囲を制限します。
- **Output**: 式で計算したchannelを持つ2D Imageを返します。

Matte InputとEffect Maskは役割が異なります。Matte Inputは**式の材料として読む値**で、Effect Maskは**Nodeの処理をどこへ適用するか**を制限する入力です。

Manualの基本例では、2本のImageとMatteをCustom Toolへ入れ、式で計算した結果をMergeなどの後段へ渡しています。

## 何をするNodeか

Custom Toolでは、出力Imageのchannelごとに式を書きます。

たとえば次のような処理を作れます。

- RGBの値を独自の数式で変換する
- 2枚以上のImageをchannel単位で組み合わせる
- matteの値を式へ取り込み、pixelごとに処理量を変える
- UV、Normal、Z、motion vectorなどの補助channelを計算する
- 周囲のpixelをsampleして独自filterを作る
- Number / Point / LUTをユーザー調整用Controlとして使う
- frameごと・pixelごとの計算を分け、同じ式の重複評価を減らす

「Expressionを書けるNode」というだけでなく、**式をどの頻度で評価するかをSetup / Intermediate / Channelsへ分離できる**ことが重要です。

## 計算の流れ

Custom Toolの式は大きく3段階で評価されます。

~~~text
Setup
  ↓
Intermediate
  ↓
Channels
  ↓
Output Image
~~~

### Setup 1-4

Setupには最大4本の式を置けます。

Setup式は**1 frameにつき1回**だけ評価され、その結果は **s1〜s4** として後段の式から参照できます。

pixelごとに変わらない値をここへ置きます。たとえば次のような値です。

- Number Inの値
- current frameを表すtime
- Imageのwidth / height
- 三角関数など、frame内では同じ結果になる計算

x / yや現在pixelのRGBのようにpixelごとに変わる値をSetupへ置く用途ではありません。

### Intermediate 1-4

Intermediateには最大4本の式を置けます。

Intermediate式は**各pixelにつき1回**、Setupの後、Channelsの前に評価されます。結果は **i1〜i4** としてChannel式から参照できます。

複数channelで共通して使うpixel単位の座標計算などをここへ置くと、Red / Green / Blue / Alphaの各式で同じ計算を繰り返さずに済みます。

### Channels

Channelsでは、出力Imageの各channelへ式を設定します。

21.1 Manualでは、RGBAに加えて次のchannelが対象として説明されています。

- Z / Z-Coverage
- U / V texture coordinate
- X / Y / Z Normal
- Background RGBA
- X / Y motion vector

Channel式はpixelごとに評価され、Setupの **s1〜s4** とIntermediateの **i1〜i4** を利用できます。

RGBAの式は通常0.0〜1.0のfloating-point値として扱います。Manualでは、integerの出力先では範囲外の値がclipされると説明されています。Vector / Normal、Coverage、Depthはそれぞれ適切な値域が異なるため、RGBAと同じ0〜1だけを前提にしません。

## Controls tab

### Point In 1-4

4つのXY Point Controlです。

式からは、たとえば1番目のPointを **p1x / p1y** として参照します。通常のPoint Controlとしてanimationやmodifier接続も行えます。

### Number In 1-8

8本のsliderです。

式からは **n1〜n8** として参照します。angle、gain、thresholdなど、Custom Toolで作った処理をInspectorから調整するparameterに使えます。

Config tabでは表示名を変更できますが、式から参照するときの変数名はn1〜n8のままです。

### LUT In 1-4

4本のLUT splineを使えます。

Manualでは **getlut1()〜getlut4()** を使って式からLUTを参照でき、RGBAそれぞれへLUTを適用してColor Curvesに似た処理を作る例が示されています。

## Config tab

### Random Seed

rand() / rands()で使うseedを設定します。

複数のCustom Toolで異なるrandom結果が必要な場合にseedを分けられます。

### Number / Point Controlの表示と名前

Config tabでは、8本のNumber Controlと4本のPoint Controlについて、Inspectorへ表示するかどうかと表示名を調整できます。

複雑な式をそのまま利用者へ見せず、必要なControlだけを名前付きで表へ出すために使えます。

## よく使う変数

Custom Toolには多数の変数があります。最初は次だけ押さえると式を読みやすくなります。

- **n1〜n8**: Number In
- **p1x〜p4x / p1y〜p4y**: Point InのX / Y
- **s1〜s4**: Setupの計算結果
- **i1〜i4**: Intermediateの計算結果
- **time**: current frame
- **x / y**: current pixelの正規化座標。0.0〜1.0
- **w / h**: primary Imageのwidth / height
- **w1〜w3 / h1〜h3**: 各Image inputのwidth / height
- **r1〜r3 / g1〜g3 / b1〜b3 / a1〜a3**: 各Image inputのRGBA
- **c1〜c3**: 現在計算しているchannelに対応する各Image inputの値
- **m1**: Matte Input

たとえばRedの式でr1を使えばImage 1の現在pixelのRedを読みます。c1を使うと、式を別channelへコピーしたときに、そのchannelに対応するImage 1の値として使えます。

## 別位置のpixelを読む

Custom Toolには、現在位置とは別のpixelをsampleする関数があります。

21.1 Manualでは、代表的に次の3種類が説明されています。

- **get[ch][#]b(x, y)**: 範囲外なら0を返す
- **get[ch][#]d(x, y)**: 範囲外ならedge pixelを使う
- **get[ch][#]w(x, y)**: 範囲外なら反対側へwrapする

[ch]にはchannel、[#]にはImage input番号が入ります。

たとえば **getr1b(x, y)** はImage 1のRedを指定座標から読みます。座標はpixel番号ではなく、x / yと同じ0.0〜1.0の正規化座標として扱います。

## 具体的な使い方

### Inspectorから調整できる独自処理を作る

簡単な処理なら、Number Inをparameterとして使い、Channel式へ渡します。

~~~text
Image 1 → Custom Tool → Output
              ↑
          Number In
~~~

たとえばn1をgainとして使えば、式の数値を書き換えずInspectorから処理量をanimationできます。

### 同じ座標計算をRGBAで使い回す

Manualのrotation例では、angleから求める三角関数をSetupへ、pixelごとの回転後座標をIntermediateへ分けています。

その後、各Channel式ではIntermediateの結果を使って入力Imageをsampleします。

この分け方なら、同じ三角関数を全pixel・全channelで何度も計算する必要がありません。**frame内で変わらない計算はSetup、pixelごとに共通する計算はIntermediate、最終的なchannel値だけをChannelsへ置く**と整理できます。

### 3×3のfilterを式で試作する

21.1 Manualには、周囲9 pixelを平均して3×3 Custom Filter相当を作る例があります。

SetupでImage width / heightから隣接pixelまでの正規化距離を計算し、Channel式で周囲のpixelをsampleして平均します。

既存の[Custom Filter](../blur-filter/custom-filter.md)で足りる処理なら専用Nodeの方が読みやすい一方、数式を変えながら独自kernelを試す用途ではCustom Toolが使えます。

### LUTを使ってchannelをremapする

LUT In 1-4とgetlut関数を使い、channelごとに入力値をremapできます。

ManualにはRGBAへ4本のLUTを割り当て、[Color Curves](../color/color-curves.md)に近い処理を組む例があります。Custom Toolで可能だからといって、通常のColor Curvesを置き換える必要はありません。独自式とLUTを一緒に使いたい場合に候補になります。

## Custom Toolを使う判断

Custom Toolは自由度が高い一方、専用Nodeより意図を読み取りにくくなることがあります。

次のような場合に向きます。

- 必要なpixel式を既存Nodeだけでは直接組みにくい
- 複数channelや補助channelを独自に計算したい
- 数式やfilterのprototypeをFusion内で素早く試したい
- いくつかのNumber / Point / LUTだけを表に出した小さな専用処理を作りたい

既存Nodeで同じ処理が明確に表現できる場合は、Graphを読む人が目的を理解しやすい専用Nodeを優先した方が扱いやすいことがあります。

## 注意点

- Custom Toolはtime / metadata / DoDをまとめて操作する汎用Nodeではありません。中心はImage channelの式評価です。
- Image inputは3本、Matte InputとEffect Maskは別入力です。Matteは式で参照し、Effect Maskは適用範囲を制限します。
- Setup / Intermediate / Channelsは評価頻度が異なります。同じ重い計算をChannel式へ重複して書くと、その分だけpixelごとの計算量が増えます。
- x / yはpixel番号ではなく0.0〜1.0の正規化座標です。
- channelごとに意味のある値域が違います。RGBA向けの値域をDepthやVectorへそのまま当てはめません。
- expression syntax、利用可能なfunctionの全一覧、runtime REGID、Effects Library上のcurrent表示、edition差はこのページですべてを列挙していません。

## 関連

- [Time / Metadata / Utility Family Overview](./index.md)
- [Custom Filter](../blur-filter/custom-filter.md): convolution filterを専用Controlで組むNode。
- [Color Curves](../color/color-curves.md): curveでchannel値をremapする専用Node。
- pCustom: Particle domainでcustom expressionを使う別Node。2D Image用Custom Toolとはdata domainが異なります。

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual（September 2026）、Chapter 111「Miscellaneous Nodes」のCustom Tool [CT]（pp.2583–2593）を基準にしています。

確認した項目は、3本の2D Image input、Matte Input、Effect Mask、Point In 1-4、Number In 1-8、LUT In 1-4、Setup 1-4、Intermediate 1-4、Random Seed、Number / Point Control設定、Channel expressions、主要なvalue / channel variables、pixel sample関数、rotation・3×3 filter・LUTの公式例です。

Blackmagic Design Support Centerでは2026年9月8日公開のDaVinci Resolve 21.1 Manualが現行21.1 Reference Manualとして掲載されています。

runtime REGID、Effects Library上のcurrent表示、edition差、全expression functionの網羅、実機上のperformanceは別verification対象として残しているため、verification: partialを維持しています。
