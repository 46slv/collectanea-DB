---
title: Text+
description: 2D Text Imageを生成し、Styled Text・Layout・character/word/line Transform・最大8 Shading elements・Follower等を扱う基本Text Generator。
doc_type: node
term_id: text-plus
verification: partial
aliases: [Text+, Text Plus, TXT+]
concepts: [image-data, parameter-data, keyframes]
nodes: [Text+]
node_family: generators
controls: [Styled Text, Font, Color, Size, Tracking, Line Spacing, Write On, Layout Type, Center, Perspective, Width, Height, Position on Path, Transform, Spacing, Pivot, Rotation, Shear, Shading Element, Appearance, Opacity, Follower]
inputs: [mask]
outputs: [image]
tasks: [text, motion-graphics, title, animate]
level: foundation
product_scope: fusion
suite_surfaces: [fusion, edit]
updated: "2026-10-04"
---

# Text+

Text+は、文字を2D <Term id="image">Image</Term>として生成するFusionの基本Text Generatorです。

文章内容、font、layout、文字単位のtransform、複数layerのshading、characterごとのanimationを1 Node内で扱えます。

## 役割

title、lower third、caption、motion graphics用textなどをImageとして作り、MergeのForegroundへ接続します。

```text
Text+ ──────┐
            ├─ Merge → Output
Image ──────┘
```

Text+は2D Imageを出力します。extruded 3D textが必要ならText 3D、Shape domainの文字が必要ならsTextと役割が異なります。

## 入力

### Effect Mask

青色の任意入力です。

生成したtext ImageをMask範囲へ限定します。

## 出力

透明背景を持つ2D text Imageを出力します。

Layout tabのBackground Colorを設定しない通常状態では、文字以外の背景はtransparentです。

## Text tab

### Styled Text

表示する文字列を入力します。

右クリックmenuからAnimate、Character Level Styling、Follower、Text Scramble、Text Timer、Time Code、Publish、Connect Toなどのmodifier / connectionを追加できます。

Viewer上でText+を選び、in-viewer text editingを有効にすると、Viewer内でも文字入力・選択を行えます。

### Font

font familyとtypefaceを選びます。

21.1 ManualではTrueType、OpenType、PostScript Type 1 fontを利用でき、Unicode / multibyte text、right-to-left、vertical textにも対応すると説明されています。

### Color / Size

Colorは基本fill color、Sizeは文字の大きさを調整します。

Text+のSizeはword processorのpoint sizeではなく、Image widthに対するrelative sizeとして扱われます。

### Tracking / Line Spacing

- **Tracking** — character間隔
- **Line Spacing** — 行間

Layoutやanimationとは別に、text自身の組版間隔を調整します。

### V / H Anchor・Justify

Textのvertical / horizontal alignmentを調整します。

Frame Layoutでは、frame内でtextをどこへ寄せるかを決める重要なControlです。

### Direction / Line Direction

文字の書字方向と、複数lineが進む方向を設定します。

縦書きやright-to-left languageを扱う場合に使います。

### Write On

textの表示範囲をStart / Endで制御します。

EndまたはStartをanimateすると、文字列を順番に出す / 消す単純なwrite-on effectを作れます。

## Layout tab

Textをどの形に配置するかを選びます。

### Point

1つのCenterを基準に通常のtext blockを配置します。

### Frame

矩形frame内へtextを配置します。

Width / Heightとalignmentを使い、一定領域内にtitleやparagraphを収める用途です。

### Circle

circle / ovalのcurveに沿ってtextを配置します。

### Path

custom pathに沿ってtextを配置します。

Position on Pathでpath上の位置を動かせるため、文字列をcurveに沿って移動させるanimationにも使えます。

### Center / Size / Perspective / Rotation

Layout element全体の位置・大きさ・3D-like rotation / perspectiveを調整します。

これはTransform tabの「character / word / line単位の変形」と別です。

## Transform tab

TextをCharacters / Words / Lines単位で変形します。

### Transform

どの粒度を変形するか選びます。

- **Characters**
- **Words**
- **Lines**

各粒度のtransformを同時に使えます。

### Spacing

選択した粒度の要素間隔を調整します。

### Pivot X / Y / Z

character / word / lineごとのrotation / scale中心をoffsetします。

### Rotation X / Y / Z

各要素を3軸で回転します。

Text+のoutputは2D Imageですが、内部のtext layoutでは3D-like transformを使えます。

### Shear X / Y・Size X / Y

要素単位のslantとscaleを調整します。

## Shading tab

Textのfill、outline、borderなどを複数layerとして作ります。

最大8個のShading Elementを個別に設定できます。

### Element 1

既定で有効な基本fillです。

### Appearance

各Elementの役割を選びます。

- **Text Fill**
- **Text Outline**
- **Border Fill**
- **Border Outline**

OutlineではThicknessやJoin Style等、選択したAppearanceに応じたControlが表示されます。

### Sort By

Element番号順またはZ PositionでShading layerの重なりを決めます。

### Opacity

Shading Element単位の透明度を調整します。

基本fill・outline・shadow-likeな要素を別Elementへ分けると、後から各layerを独立してanimationできます。

## Follower

Followerは、文字ごとに同じanimationを時間差で伝えるmodifierです。

Styled Textを右クリックしてFollowerを追加し、Modifier側でSize / Position / Opacity等をanimateした後、Timing tabでcharacter間のdelayを決めます。

OrderはLeft to Right、Right to Left、Inside Out、Outside In、Random等から選べます。

「1文字ずつ順番に出す」「characterごとにscale / positionをずらす」場合に、各文字へ個別keyframeを打つ代わりに使えます。

## Character Level Styling

文字列全体ではなく、選択したcharacterだけfont、color、size、transform等を変更します。

Viewer上で対象文字を選択し、Modifier tabから調整します。

Styled Text fieldで文字範囲を選ぶのではなく、Viewer側で選択する点に注意します。

## Image tab

Generator共通Image tabで、Text+が生成するImageのresolutionを決めます。

DaVinci Resolveでは既定でTimeline resolutionを基準にします。

TextのSizeやLayoutを変えることと、Text+ output ImageのWidth / Heightを変えることは別です。

## 最小構成

```text
Text+ → Merge → Output
          ↑
        Image
```

最初はStyled Text、Font、Size、Layoutだけで読みやすいtextを作り、その後にShadingやFollowerを足す方が各設定の役割を追いやすくなります。

## 運用例

2行のlower thirdを作る場合:

1. Styled Textへ文字を入力します。
2. Font / Size / Tracking / Line Spacingを決めます。
3. Layout = PointまたはFrameで位置を整えます。
4. Shading Element 1でfill colorを設定します。
5. 必要ならElement 2をOutlineにします。
6. Text+をMergeのForegroundへ接続します。
7. 文字単位animationが必要ならFollowerを追加します。

## Text 3D / sTextとの違い

- **Text+** — 2D Imageを直接生成
- **Text 3D** — Classic 3D scene内のtext geometry
- **sText** — Shape domainのvector text。sRender前はShape data

同じ文字表示でも、後段で必要なdata domainを基準に選びます。

## 関連する考え方

- [Generatorノード](./)
- [Macro / Templateで再利用単位を作る](../../learn/06-reuse/macros-templates)
- [キーフレーム / スプライン / 時間](../../learn/05-time/keyframes-spline-time)
- [解像度 / アスペクト比（Resolution / Aspect）](../../learn/03-space/resolution-aspect)

## 関連Node

- [MultiText](./multitext)
- Text 3D
- sText
- [Merge](../compositing/merge)

## 出典と確認範囲

DaVinci Resolve 21.1 Reference Manual、September 2026、Chapter 103 pp.2380–2400で、Effect Mask、2D Image出力、Text / Layout / Transform / Shading tabs、Styled Text、Write On、4 Layout types、character/word/line transform、最大8 Shading Elements、Character Level Styling、Follower等を確認しました。Generator共通Image tabはpp.2400–2402、Resolve上の既定resolutionはFusion Fundamentals Chapter 75 p.1642を基にしています。

全modifierの全Control、fontごとの差、Shadingの全parameter、実機performanceは未確認のため `verification: partial` としています。
