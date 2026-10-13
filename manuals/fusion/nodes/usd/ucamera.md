---
title: uCamera
description: USDシーンにカメラを追加し、画角・Film Back・被写界深度・クリッピング・Viewer表示を設定する方法。
doc_type: node
term_id: ucamera
term_short: uCameraは、USDの3Dシーンをどこからどの画角で見るかを決める仮想カメラ。単体では2D画像を出力しない。
verification: partial
aliases: [uCamera, uCa]
concepts: [usd-scene, camera, scene-tree]
nodes: [uCamera]
node_family: usd
controls: [Override Selection, Projection Type, Near/Far Clip, Focal Length, Focal Distance, F Stop, Film Back, Aperture, Lens Shift, Shutter, Transform]
inputs: [usd]
outputs: [usd]
tasks: [usd, camera, frame-scene]
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-14"
---

# uCamera

**uCameraは、<Term id="usd-scene">USDシーン</Term>の3D空間をどこから、どの範囲まで撮影するかを決める仮想カメラ**です。画角、焦点距離、センサーに相当するFilm Back、ピント位置などを設定できます。実写の構図に3Dを合わせる場合や、3Dの中でカメラを動かす場合に使います。

uCameraは**画像を描画するノードではありません**。カメラをUSDシーンに組み込み、[uRenderer](./u-renderer)で最終的な2D画像にします。形状を作る[uShape](./ushape)とも、既存の形状へ画像を照射する[uProjector](./uprojector)とも役割が異なります。

## 入力・出力と最小構成

| 接続 | データ | 役割 |
| --- | --- | --- |
| **Scene Input（黄色）** | USD scene | 読み込んだUSDシーン内のカメラを選んで調整する場合に接続する。 |
| **出力** | USD scene | カメラを含むシーンをuMergeなどへ渡す。2D画像ではない。 |

カメラを単独で追加する場合の例です。

~~~text
uShape / uLoader（被写体） ──┐
                             ├→ uMerge → uRenderer → 2D Image
uCamera（カメラ） ────────────┘
~~~

1. [uShape](./ushape)で形状を作るか、[uLoader](./uloader)でUSDアセットを読み込みます。
2. uCameraを追加し、被写体とuCameraを[uMerge](./u-merge)で同じシーンにまとめます。
3. uMerge以降をViewerに表示し、Viewerの右クリックメニューから **uCamera > カメラ名** を選びます。
4. カメラのTransformで位置・向きを調整し、Projection TypeやFocal Lengthで構図を決めます。
5. uRendererでUSDシーンを画像に変換します。

**uCamera単体をViewerに表示しても空のシーンになる**のは正常です。見る対象がまだ同じシーンにないためです。Viewerでカメラ視点を選べても、最終出力の範囲は別途確認します。

## PerspectiveとOrthographic

**Projection Type**には次の2方式があります。

| 設定 | 見え方 | 向いている用途 |
| --- | --- | --- |
| **Perspective** | 近い物体ほど大きく、遠い物体ほど小さく見える。実写カメラに近い遠近感。 | 実写との合成、奥行きのあるショット、通常のカメラワーク。 |
| **Orthographic** | 視線が平行で、距離による見かけの大きさの変化がない。 | 平面図に近い表示、等寸法での比較、図解的な構図。 |

**Orthographic**では、Perspectiveで使う焦点距離やFilm Backの項目がそのまま利用できるとは限りません。21.1 Manualは、Orthographic時にはNear / Far Clipと**Viewing Scale**の操作に限定されると説明しています。

例えば同じ大きさの立方体を前後に配置し、Projection Typeだけを切り替えると違いを確認できます。Perspectiveでは奥の立方体が小さく見え、Orthographicでは前後の位置でサイズが変わりません。

## 画角を決める：Focal LengthとFilm Back

**Perspectiveでの画角は、焦点距離だけでなくFilm Backの大きさにも依存**します。

- **Focal Length**：ミリメートル単位の焦点距離。同じFilm Backなら値が小さいほど広く写り、大きいほど狭く写ります。
- **Horizontal Aperture Width / Vertical Aperture Height**：Film Back内の撮影領域の幅・高さ。実写カメラのセンサー／フィルム面の寸法に相当します。
- **Lens Shift X/Y**：レンズ位置のずれによる構図の移動を調整します。カメラ自体の位置変更と混同しないでください。

Manualが示す画角の関係式は **画角 = 2 × atan(開口寸法 ÷ (2 × 焦点距離))** です。横の画角にはHorizontal Aperture、縦の画角にはVertical Apertureを用います。単位をそろえて計算します。

実写素材へCGを合わせるときは、焦点距離の数値だけを入力して終わりにせず、**Film Backの寸法、カメラの向き、撮影位置、画像の縦横比**を別々に確かめます。焦点距離が同じでもFilm Backが異なれば写る範囲は変わります。

### Viewerの枠と最終レンダーの範囲

Viewerの形とCameraのFilm Backの縦横比、uRendererが生成するフレームの縦横比は一致しない場合があります。Viewerで合って見えても、レンダーでは端が切れる可能性があります。

1. **uMerge以降**をViewerに表示して、対象のuCamera視点を選びます。
2. Viewerの右クリックメニューで **Guides > Frame Aspect** を開き、出力の構図を確認します。既定のGuideはCompositionのFrame Formatを参照します。
3. **Guides > Show Guides** で表示を切り替えます。WindowsではViewerがアクティブなとき **Ctrl+G** でも切り替えられます。
4. uRendererの出力を別Viewerで表示し、実際の画像端と意図した構図を比較します。

Film Backの縦横比だけを出力解像度の指定と考えず、**カメラの視野とレンダーフレームを別に確認**するのが確実です。

## どこからどこまで描画するか：Near / Far Clip

**Near Clip**より手前、**Far Clip**より奥の物体はカメラの描画範囲から外れます。値はシーンの距離単位です。Manualの例では、Nearが0.1なら0.1未満の距離、Farが20なら20を超える距離が除外されます。

ただし、**Perspectiveの既定状態ではAdaptive Near/Far Clipが有効**で、手動のNear / Far設定は反映されません。距離を変更しても結果が変わらない場合は、まずAdaptive Near/Far Clipの状態を確認します。

Depth計算の精度はNearとFarの範囲にも影響されます。遠方の物体に不自然な描画アーティファクトが出るときは、Manualの案内どおりNear Clipを遠ざける方法を試します。ただし、必要な手前の物体まで切り落とさないかを同時に確認します。

**資料上の注意**：21.1 Manual p.2891では「Exposure」という見出しの下に、シーンの広がりに合わせてNear/Farを自動調整する説明があります。直前のAdaptive Near/Far Clipと関係する記述に見えますが、**この見出しをそのままInspectorの別項目名とは断定しません**。

## ピント・絞り・シャッター

| 設定 | 何を表すか | 実際に確認すること |
| --- | --- | --- |
| **Focal Distance** | カメラからピントの対象までの距離。被写界深度の計算に用いる。 | ピントを合わせたい物体までの距離が合っているか。 |
| **F Stop** | 仮想レンズの絞り。ManualではExposureとDepth of Fieldへ影響すると説明される。 | 焦点距離やFocal Distanceだけを動かしたときと、F Stopを動かしたときの差。 |
| **Shutter Open / Close** | シャッターが開閉する時間範囲。ManualではExposureとMotion Blurに関係すると説明される。 | 動く被写体と静止した被写体での見え方。 |

これらは**カメラ側の制御項目**です。効果が最終画像にどのように出るかは、レンダー側の設定やシーンの条件にも依存します。本記事は実機でDepth of FieldやMotion Blurのオン／オフ条件・既定値までは確認していません。

## USDファイルに含まれる既存カメラを調整する

[uLoader](./uloader)などで読み込んだUSDにカメラがある場合、uCameraの**Scene Input**へそのシーンを接続できます。

1. 対象のUSDシーンをuCameraへ入力します。
2. **Override Selection > Pick** を使い、Scene Treeで調整したいカメラを選びます。
3. Projection TypeやFocal Lengthなどを調整し、意図したカメラだけが変化しているかViewerで確認します。

この操作は新しい撮影画像を読み込むことではありません。**USD内に定義済みのカメラを選び、その設定を変更する**ための操作です。シーン内に複数カメラがあるときは、選択中のカメラ名も確認します。

## 画面上でカメラを確認する

**Control Visibility**ではViewerのカメラ補助表示を切り替えられます。これらはシーンを理解するためのガイドで、最終画像を直接描く図形ではありません。

- **Show View Controls**：カメラの補助表示全体を表示／非表示にします。
- **Frustum**：カメラが捉える立体的な視野の範囲を示します。
- **View Vector**：カメラの向きとフレーム中心を示す線です。
- **Near Clip / Far Clip**：描画範囲の手前と奥の面を可視化します。
- **Focal Plane**：Focal Distanceで設定したピント位置の面を示します。
- **Convergence Distance**：ステレオ撮影時の左右カメラの収束位置を示します。

**Stereo Role**はステレオ用カメラのLeft / Center / Rightの役割を設定する項目です。単眼カメラの構図調整では、まずProjection Type・Transform・Film Backを優先して確認します。

## uProjectorとの使い分け

| | **uCamera** | **uProjector** |
| --- | --- | --- |
| 第一の役割 | USDシーンを見るカメラを配置・調整する。 | 2D画像をUSDの物体へ投影する。 |
| 得意な制御 | Projection Type、Focal Length、Film Back、クリッピング、ピントなど。 | 照射の強さ・色・距離減衰・影・画像のFit Methodなど。 |
| 構成の例 | 実写カメラの画角に合わせてCGをレンダーする。 | 壁に模様の光を当てる、複数の立体へテクスチャを投影する。 |

21.1 Manualの**uProjector節 p.2907**は、uCameraにも投影機能があり、実際のカメラに一致させる投影にはuCameraが適する、と説明しています。一方で、**uCamera節 p.2889に明記された入力は黄色のScene Inputのみ**です。画像投影に使う追加入力・具体的な設定経路については、この範囲のManualだけでは特定できません。したがって、uCameraにuProjectorと同じ**ProjectiveImage**入力があるとは書かず、カメラからの画像投影の具体的な接続図は実機確認後に追加します。

投影された画像のAlphaを物体に反映させる仕組みは[uCatcher](./ucatcher)、投影する光とテクスチャの違いは[uProjector](./uprojector)を参照してください。

## うまくいかないとき

| 症状 | 確認すること |
| --- | --- |
| uCameraだけをViewerに出しても何も映らない | **uMergeで被写体とカメラをまとめた出力**を表示し、そこでuCamera視点を選びます。 |
| Viewerの見え方とレンダーの端が一致しない | **Guides > Frame Aspect**、CompositionのFrame Format、uRendererの出力を分けて確認します。 |
| 焦点距離を合わせても実写と画角が違う | **Horizontal/Vertical Aperture**、カメラ位置・向き、出力の縦横比を確認します。 |
| 物体を前後へ動かしても見かけの大きさが変わらない | Projection Typeが**Orthographic**になっていないか確認します。 |
| Near / Far Clipを変えても何も変わらない | Perspectiveで**Adaptive Near/Far Clip**が有効になっていないか確認します。 |
| 奥の物体が消える、遠方に描画の乱れが出る | カメラの距離単位と**Near / Far Clip**の範囲を見直します。 |
| F StopやShutterを変えても期待したボケ・ブラーが見えない | まずFocal Distance・動きの有無・レンダー側の設定を切り分けます。この記事では実機の有効化条件を確定していません。 |
| 読み込んだUSDの意図しないカメラを編集している | **Override Selection > Pick** の対象とViewerで選んだカメラ名を確認します。 |

## 関連ノード

- [uMerge](./u-merge)：カメラ、形状、ライトなどを同じUSDシーンへまとめる。
- [uRenderer](./u-renderer)：USDシーンを2D画像へ描画する。
- [uLoader](./uloader)：既存カメラを含むUSDファイルを読み込む。
- [uProjector](./uprojector)：画像をライトまたはテクスチャとして既存の形状へ投影する。
- [uCatcher](./ucatcher)：Texture投影を受け取る形状側の設定。
- [uImage Plane](./uimage-plane)：2D画像を貼った平面をUSDシーン内に作る。

## バージョン・出典と確認範囲

**一次資料**：Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 121 **uCamera [uCa] pp.2889–2892**。入力／出力、uMergeとの接続、Viewerでのカメラ選択とFrame Aspect、Projection Type、Adaptive Near/Far Clip、Focal Length、Film Back、Focal Distance、F Stop、Shutter、Control Visibilityを照合しました。カメラ投影とuProjectorの使い分けは同章 **uProjector pp.2906–2907**、Texture投影は **uCatcher p.2892** を参照しています。公式資料の入手先：[Blackmagic Design Support](https://www.blackmagicdesign.com/support/)。

接続図・比較例・トラブル診断は上記仕様から組み立てた操作案です。**Resolve/Fusion 21.1の実機動作、個別Inspectorの全既定値・数値範囲、画像投影のuCamera側UIと入力口、Edition差、内部REGIDは未検証**です。見出しに不整合がある箇所は断定せず、`verification: partial`を維持します。
