---
title: "Text 3D"
description: "文字を立体化するClassic 3D Node。入力、Extrusion・Bevel、文字単位のTransform、Shading、実写合成までを説明する。"
doc_type: node
term_id: "text-3d"
term_short: "Text 3Dは、文字の形状を3D空間に置き、厚みや面取り、材質を設定できるNode。"
verification: partial
aliases: ["Text 3D", "Text3D", "3Txt"]
concepts: ["classic-3d", "text", "material"]
nodes: ["Text 3D"]
node_family: "3d"
controls: ["Styled Text", "Font", "Size", "Tracking", "Write On", "Extrusion Depth", "Bevel Depth", "Bevel Width", "Custom Extrusion", "Force Monospaced", "Layout Type", "Transform", "Use One Material", "Specular Intensity"]
inputs: ["classic-3d", "image", "image"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "text-3d", "title"]
level: intermediate
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Text 3D

**Text 3D [3Txt]は、入力した文字を3D空間で扱える形状にするNode**です。文字の正面だけでなく側面も作り、厚み（Extrusion）や角の面取り（Bevel）を付けられます。文字列、フォント、配置などはText+と似ていますが、出力されるデータは2Dの文字画像ではなく、<Term id="classic-3d">Classic 3Dシーン</Term>です。

たとえばタイトルをカメラの斜め前から見せると、文字の側面や厚みが見えるようになります。Text 3Dだけでは通常の2D映像へ重ねられないため、[Renderer 3D](./renderer-3d.md)で画像に変換してから、実写素材と合成します。

## 入力と出力

Text 3Dは文字を自分で生成するため、入力を何も接続せずに使い始められます。

| 接続 | 受け取るもの | 役割 |
| --- | --- | --- |
| **SceneInput**（オレンジ、任意） | Classic 3Dシーン | 入力された3Dシーンに新しい文字を加えます。カメラや他の物体と後段の[Merge 3D](./merge-3d.md)で合流させる方法もあります |
| **ColorImage**（緑、条件付き） | 2D画像 | Shadingの材質をImageにしたとき、文字の表面へ貼る画像を渡します |
| **BevelTexture**（マゼンタ、条件付き） | 2D画像 | 文字の面取り部分へ、正面と別の画像を貼るための入力です。Shadingで材質を分け、Bevel側をImageにすると現れます |
| **出力** | Classic 3Dシーン | 文字の形状、配置、材質などを含む3Dデータです |

**ColorImageとBevelTextureは常に見える端子ではありません。** Shadingの選択内容に応じて表示されます。また、Text 3Dには、一般的な3D形状NodeにあるMaterialInputがありません。別の3D Materialを使う場合は[Replace Material 3D](./replace-material-3d.md)を後段に挿入します。

## 文字の入力と整列

**Styled Text**へ表示する文字列を入力します。Fontでは書体とRegular／Boldなどのスタイルを選びます。Sizeはワープロのポイント数ではなく、画像の幅を基準とした相対値です。Text 3Dのほかの大きさの調整と混同しないでください。

- **Tracking**：文字と文字の間隔を一律に調整します。
- **Line Spacing**：複数行の行間を調整します。
- **H Anchor / V Anchor**：文字列の基準位置を左右／上下で決めます。基準が変わると、回転の中心や行間・文字間の見え方にも影響します。
- **H Justify / V Justify**：特にFrame内で文字を均等配置したい場合の調整です。
- **Direction / Line Direction**：文字の進む向きや行の流れる向きを指定します。
- **Write On**：StartとEndで、文字列のうち表示する範囲を変えます。範囲をアニメーションすれば文字が順に現れる、または消える演出を作れます。

日本語を使う場合も、方向設定があることと、縦書きの句読点・回転文字・禁則処理が期待どおりになることは別です。組版の細部は使用フォントと21.1の実際の表示で確認してください。

### 文字間隔を個別に詰めたい場合

Trackingは文字列全体に効きます。隣り合う特定の2文字だけを調整する**手動カーニング**は、まずText+で行い、その設定をText 3Dへコピーする方法が21.1 Manualに記載されています。

1. Text+で同じ文字列を作り、必要な文字間だけ手動で調整します。
2. Text+のInspectorでNode名を右クリックして**Copy**を選びます。
3. Text 3DのInspectorから**Paste Settings**を実行します。
4. Text 3Dで文字間隔が再現されたか確認します。

**Force Monospaced**はフォント固有の詰め方を無視して、文字間隔を均等に近づける調整です。**Use Font Defined Kerning**はフォントに定義されたカーニングを使う設定です。両者は「特定の2文字だけを手動調整する」操作とは異なります。

## ExtrusionとBevel：文字に厚みを付ける

**Extrusion Depth**は文字を奥行き方向へ押し出す量です。0では厚みのない平らな文字となり、0より大きくすると側面が生まれます。ただし0でも出力は3Dデータのままで、2DのText+には変わりません。

**Bevel Depth**は角の面取りを作り、**Bevel Width**はその幅を調整します。Extrusion Depthが0のときはBevelが効きません。正面と背面の面取りは**Front/Back Bevel**で別々に有効化できます。面取り部分が不自然に角張る場合は**Smoothing Angle**も確認します。

### Custom Extrusion：側面の断面を作る

均一な厚みではなく、文字の側面を途中で膨らませたり、段差を付けたりする場合は**Custom Extrusion**を使います。断面の形をスプライン上の点で編集する仕組みです。

たとえば金属看板のように、正面の縁を一段盛り上げ、側面をくぼませた断面を作れます。**Custom Extrusion Subdivisions**を増やすと、滑らかな曲線部分に使う分割が増えます。一方、断面が自己交差すると表示がちらつくなどの問題が起きるため、無理な形状にしないようにします。

## Layout：文字をどこに並べるか

**Layout Type**は、文字の並べ方を指定します。文字の厚みとは独立した設定です。

| Layout | 何が起きるか | 使いどころ |
| --- | --- | --- |
| **Point** | 指定した中心点を基準に文字を置く | 一般的な3Dタイトル |
| **Frame** | 四角形の領域内に文字を配置する | 複数行の看板、枠内に収めたい文章 |
| **Circle** | 円や楕円の輪郭に沿って文字を並べる | 円形ロゴ、リング状のタイトル |
| **Path** | 自分で編集した線に沿って文字を並べる | カーブした看板、動く文字列 |

Center X/Y/ZやRotationで配置位置と向きを調整できます。Circleでは文字を円周へ収める**Fit Characters**、Pathでは文字列を線の上で移動する**Position on Path**が使えます。

たとえば道路に沿った曲線状のタイトルなら、Pathで線を作ってからPosition on Pathを動かします。単に文字全体の位置を変えたい場合は、後段のTransform 3Dや共通Transformを使う方が分かりやすいこともあります。

## Transform：文字・単語・行を別々に動かす

Text 3DのInspectorには**文字専用のTransform**と、多くの3D Nodeに共通するTransformがあります。役割が異なります。

文字専用のTransformでは、**Characters / Words / Lines**の単位を選び、それぞれの中心を基準に回転、位置関係、傾き、拡大率などを変えます。たとえばCharactersを選んでY軸回転を付けると、文字列全体を1枚の看板のように回すのではなく、各文字がそれぞれの中心で回転します。

- **Spacing**：選んだ単位の間隔を変えます。小さくしすぎると重なります。
- **Pivot X/Y/Z**：各文字・単語・行が回転する中心をずらします。
- **X/Y/Z Rotation**：各要素の向きを変えます。
- **Shear X/Y、Size X/Y**：傾きや大きさを調整します。

文字列全体を3D空間の別の場所へ移す操作は、共通Transformや[Transform 3D](./transform-3d.md)で行えます。**各文字を変形する操作と、完成した文字オブジェクトを移動する操作**を区別すると、意図しない回転や位置ずれを防げます。

## Shading：文字の表面を作る

Text 3Dには標準の材質があり、Shadingタブで色、反射光、透明度を調整できます。**Opacity**を下げると文字の色とAlphaが弱まり、背後が透けて見えるようになります。

**Type**をSolidにすると単色、Imageにすると画像を表面へ貼れます。画像の取得元は**Image Source**でTool（Nodeから入力）、Clip（ファイル）、Brushなどから選べます。

- **Specular Color**：表面に映る反射光の色です。
- **Specular Intensity**：反射光の強さです。
- **Specular Exponent**：反射光がどの程度狭く鋭くまとまるかを調整します。
- **Use One Material**：正面と面取り部分を同じ材質で扱うか、別々に設定するかを切り替えます。

金属風タイトルなら、文字の正面を暗く、Bevelを明るくして縁の反射を強調する方法があります。より複雑な反射モデルや別の3D Materialを使いたい場合は、Text 3Dの基本Shadingに固執せず、[Replace Material 3D](./replace-material-3d.md)を使います。照明への反応、Visibility、Matteなどを後段でまとめて制御したいときは[Override 3D](./override-3d.md)も候補です。

## 具体例：厚みのあるタイトルを実写に重ねる

次の構成では、3Dの配置と2D合成を明確に分けます。

```text
Text 3D ─────────┐
Camera 3D ───────┼→ Merge 3D → Renderer 3D ──┐（Foreground）
Spot Light ──────┘                            ↓
MediaIn（実写）──────────────────────────────→ Merge（2D）→ MediaOut
                                            （Background）
```

1. Text 3Dへ短いタイトルを入力し、Extrusion Depthを上げて側面を作ります。Bevelを加えると、縁に光が当たる見え方を作りやすくなります。
2. Camera 3Dを少し斜めに配置します。正面だけでなく文字の奥行きが見える構図にします。
3. Spot LightとともにMerge 3Dへ接続します。[Renderer 3D](./renderer-3d.md)でCamera、Enable Lighting、必要ならEnable Shadowsを確認します。
4. Renderer 3Dの**2D出力**を通常のMergeのForegroundへ、実写をBackgroundへつなぎます。
5. タイトルが背景に馴染まなければ、レンダリング後の2D側で明るさや色、ぼかしを調整します。文字の立体形状やカメラの遠近感は3D側で調整します。

文字が平板に見えるときは、Bevelだけを増やすのではなく、**カメラの角度・文字の厚み・ライトの位置**を組み合わせて調整します。

## Text+やsTextとの使い分け

| Node | 出力 | 適している作業 |
| --- | --- | --- |
| **Text+** | 2D画像 | 通常の字幕、2Dタイトル、文字単位の細かなスタイル調整 |
| **Text 3D** | Classic 3Dシーン | 厚み、遠近感、3Dライト、カメラと連動する文字 |
| **sText** | Shapeデータ | Shape系Nodeを使うベクター文字の加工 |

Text 3DのStyled Textは、Text+と同じ機能がすべて使えるわけではありません。とくに**Character Level StylingはText 3D内で直接設定できず**、Text+で作ったModifierを接続するか設定をコピーする方法がManualに説明されています。また、Text 3DのStyled Textには一度に適用できるModifierの数にも制約があります。細かな字形別調整が必要なら、最初からText+を使うか、必要な見た目をText+で作ってから移すことを検討します。

## うまくいかないとき

- **3D Viewerでは見えるのに映像へ出ない**：Renderer 3Dを通しているか、使用Cameraが文字を向いているかを確認します。
- **厚みが見えない**：Extrusion Depthとカメラの角度を確認します。正面から見ると側面は目立ちません。
- **Bevelが効かない**：Extrusion Depthが0になっていないか確認します。
- **文字が黒くなる**：Renderer 3DのEnable Lightingとシーン内のライトを確認します。
- **画像材質の入力端子がない**：Shading側でImageを選んでいるか、Bevelを別材質にしているかを確認します。
- **ネットワークレンダリングが失敗する**：レンダリングに参加する各マシンへ必要なフォントがインストールされているか確認します。Fusionがフォントを自動配布するわけではありません。

## 関連Node・概念

- [Classic 3Dの基礎](../../learn/02-data/classic-3d.md)：3Dデータと2D画像の違い
- [Merge 3D](./merge-3d.md)：文字・カメラ・ライトを同じシーンへまとめる
- [Camera 3D](./camera-3d.md)：3Dタイトルを撮影する視点を決める
- [Renderer 3D](./renderer-3d.md)：3Dシーンを2D画像にする
- [Replace Material 3D](./replace-material-3d.md)：標準の材質を別の3D Materialに置き換える
- [Override 3D](./override-3d.md)：照明、Visibility、Matteなどをまとめて制御する

## バージョンと出典

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月）、Chapter 88「3D Nodes」、**Text 3D [3Txt]（pp.1998–2006）**。SceneInput／ColorImage／BevelTexture、Styled Textとフォント、Extrusion／Bevel、Layout、Transform、Shading、Text+経由のカーニング・Modifier、ネットワークレンダリング時のフォント条件を確認しました。

操作例はManualにある機能を組み合わせた説明です。日本語組版の細部、フォントごとの形状差、全Modifierの互換性、Free／Studio差は21.1実機で未検証のため、`verification: partial`を維持しています。
