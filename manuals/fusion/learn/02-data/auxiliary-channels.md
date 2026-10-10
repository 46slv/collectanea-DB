---
title: 補助Channel / AOV
description: 3D画像のZ・Normal・UV・Object IDなどを2D合成で使う方法。Renderer 3Dからマスク、被写界深度、AO、診断までを接続例で説明。
doc_type: concept
term_id: auxiliary-channels
term_short: 色や透明度とは別に、距離・表面方向・物体IDなどを画像の各画素へ保持する補助データ。
verification: partial
aliases: [Auxiliary Channels, AOV, Deep Pixel, Z channel, Normal channel, UV channel]
concepts: [image-data, aov, depth]
nodes: [Ambient Occlusion, Depth Blur, Fog, Shader, Texture]
tasks: [aov, post-process, depth, relight]
level: advanced
product_scope: fusion
suite_surfaces: [fusion]
updated: "2026-10-10"
---

# 補助Channel / AOV

3Dシーンをレンダリングすると、完成した色（RGBA）以外の情報も画像に残せます。例えば「この画素はカメラからどのくらい離れているか」「どの物体が写っているか」「表面はどちらを向いているか」です。これらを**補助チャンネル（Auxiliary Channel / AOV）**と呼びます。

通常の写真は、色と透明度だけでは物体の距離や識別番号を判断できません。補助チャンネルを含む3Dレンダリング画像なら、**レンダリングした後の2Dノードでも**物体別の色調整、奥行きに応じたぼかし、照明の追加などを行えます。

## RGBA、補助チャンネル、Deep Imageの違い

- **RGBA**：画素の赤・緑・青と透明度。Viewerで見える通常の画像を構成します。
- **補助チャンネル付き2D Image**：同じ画像の各画素へ、RGBAに加えてZ、Normal、IDなどを格納します。補助情報は通常のRGB画像としてそのまま見えるとは限りません。
- **Deep Image**：一つの画素位置に、前後へ重なる複数の深度サンプルを保持する別のデータ形式です。Zチャンネルを一つ持つ2D Imageと同じではありません。

Fusionマニュアルの**Deep Pixel Nodes**（Depth Blur、Fog、Ambient Occlusionなど）は、主に**補助チャンネル付きの2D Imageを処理するノード群**です。一方、dMergeなどの**Deep Image**ノードは別のデータ領域を扱います。名称の「Deep」だけで接続できると判断しないでください。

## よく使うチャンネル

| チャンネル | 画素ごとに記録するもの | 具体的な使い道 |
| --- | --- | --- |
| **Z（Depth）** | カメラに対する奥行きの値 | 手前と奥でぼけを変える、距離に応じて霧を重ねる |
| **Normal** | 表面が向いている3D方向（X・Y・Z） | レンダリング後のライティング・陰影処理 |
| **TexCoord / UV** | 表面テクスチャ上の位置（U・V） | 別の画像を同じ面へ貼り直す |
| **ObjectID** | その画素を描いた物体の識別番号 | 特定の物体だけをマスクで取り出す |
| **MaterialID** | その画素で使われたマテリアルの識別番号 | 同じ材質の部分をまとめて処理する |
| **Coverage** | 境界画素を手前の物体がどれだけ占めるか | Zを利用する合成の輪郭を補助する |
| **BgColor** | Coverageで記録した手前の物体の背後にある色 | 前後が重なる画素の合成を補助する |

ここでの**ObjectIDは「物体の名前」ではなく数値**です。別の物体に同じ番号を与えると、同じIDとして扱われます。0は背景など物体のない画素です。MaterialIDも同様に、異なる材質へ同じ番号を割り当てられます。単にObjectIDを出力しただけで、物体がすべて自動的に別番号になるわけではありません。

FusionのRenderer 3Dでは、SoftwareとOpenGLで使える出力チャンネルに違いがあります。例えば**Coverage / BgColorはSoftwareの出力項目**です。外部から読み込んだEXRでは、AOV名・データ範囲・格納方法が別のことがあります。

## Renderer 3Dで補助チャンネルを用意する

~~~text
Shape 3D ────┐
Camera 3D ───┼→ Merge 3D → Renderer 3D（RGBA + 必要なAux）
Light ───────┘                          │
                                      └→ 2Dの補正・合成ノード
~~~

1. 3Dの物体・カメラ・ライトをMerge 3Dへ接続し、[Renderer 3D](../../nodes/3d/renderer-3d.md)へ送ります。
2. Renderer 3Dの**Renderer Type**（Software / OpenGL）を確認し、**Output Channels**で必要な項目を有効にします。RGBAだけの出力では、後からZやObjectIDを取り戻せません。
3. ObjectID / MaterialIDを使う場合は、対象の3D物体・マテリアル側に割り当てた識別番号も確認します。
4. レンダリング結果を2Dノードへ接続します。多くの処理はRGBAと補助チャンネルを同じ入力画像から読みます。

必要のないAOVまで有効にすると、メモリと描画時間が増えます。使用する処理から逆算して出力を選びます。

## 例1：球だけ色を変える（ObjectID → Bitmap Mask）

たとえば赤い球と青い箱を同じ3Dシーンに置き、**球だけ**を後から明るくしたいとします。画面上で球の輪郭をなぞる代わりに、球のObjectIDからマスクを作れます。

~~~text
                          ┌→ Color Corrector → 出力
Renderer 3D（ObjectID） ──┤        ↑ Effect Mask
                          └→ Bitmap Mask ────┘
~~~

1. 球と箱に異なるObjectIDを割り当て、Renderer 3Dの**Output Channels → ObjectID**を有効にします。
2. Renderer 3Dの出力を**[Bitmap Mask](../../nodes/masks/bitmap-mask.md)**と色補正ノードへ分岐させます。
3. Bitmap Maskの**Use Object**を利用して球のIDをマスク化し、白く選択された領域と黒い領域を確認します。
4. Bitmap Maskの出力を色補正ノードの青い**Effect Mask**入力へ接続し、球だけに補正がかかることを確認します。

**Use Object / Use Materialは、入力画像に対応するIDチャンネルがないと機能しません。** 球と箱のIDが同じなら両方が対象になります。境界で問題が出た場合、まずRenderer 3D側のIDと補助チャンネルのアンチエイリアス設定を確認し、それからBitmap MaskのSoft Edgeを調整します。

[Cryptomatte](../../nodes/matte-keying/cryptomatte.md)もレンダリング済みの物体を選択できますが、専用のCryptomatte情報を持つEXRを利用する**別の仕組み**です。単純なObjectIDチャンネルをCryptomatte情報として読み替えることはできません。

## 例2：距離に応じてぼかす（Z → Depth Blur）

~~~text
Merge 3D → Renderer 3D（Zを有効） → Depth Blur → 2D Merge
~~~

1. Renderer 3Dの**Z**出力を有効にします。
2. [Depth Blur](../../nodes/deep/depth-blur-deep-pixel.md)の**Input**へレンダリング画像を接続します。ZはRGBAと一緒に保持された補助情報なので、通常はZだけの別配線は不要です。
3. Depth Blurの**Blur Channel**でZを使用し、**Focal Point**をピントを合わせたい距離に、**Depth of Field**をピントが合う奥行きの幅に設定します。
4. **Blur Size**でぼけの強さを、必要なら**Z Scale**で深度値の効き方を調整します。

Zは通常の白黒マスクではありません。FusionのCopy Auxの説明では、Zの生データは負の浮動小数点値を含みます。画面上の白黒表示を、そのまま数値の距離やピントの位置だと解釈しないでください。Zチャンネルを含まない画像では、深度に基づくぼけは作れません。

## 例3：レンダリング後に陰影を足す（Z + Normal + Camera）

[Ambient Occlusion](../../nodes/deep/ambient-occlusion-deep-pixel.md)は、物体同士が近い箇所や入り組んだ形状に生じる暗さを、2D画像上で近似するノードです。入力の色だけから3D形状を復元するわけではなく、Z・Normal・カメラ情報が必要です。

~~~text
Camera 3D ──┬→ Merge 3D → Renderer 3D（Z + Normal） → Ambient Occlusion → 出力
            └───────────────────────────────────────→ Camera入力
~~~

Ambient Occlusionの**Input**にはZとNormalを含むRenderer 3Dの画像を、緑の**Camera**入力にはその画像を描画したCamera 3D（または3Dシーン）を接続します。**Kernel Radius**と**Number of Samples**を調整し、陰影が見える範囲と品質を確認します。Camera入力または画像入力が欠けると、Manualでは画像が出力されないと説明されています。

AOは画面上で近似計算するため、透明物体や画面端、カメラ位置が変わる場面では制約があります。通常の3Dライトが作るすべての陰影を置き換える処理ではありません。

## 補助チャンネルの境界処理：アンチエイリアスとHiQ

Renderer 3DのOpenGLでは、表示する色（RGBA）の輪郭を滑らかにする処理と、Z・Normal・ObjectIDなどの補助チャンネルに適用する処理を分けて考えます。異なる物体の値を境界で平均してしまうと、元の3Dシーンには存在しない番号や表面方向、UV座標が作られることがあります。

**物体のIDからマスクを作る場合**は、ObjectID / MaterialIDのアンチエイリアスを無効にします。TexCoord、Normal、Vector、BackVectorも、21.1マニュアルでは原則として無効が強く推奨されています。IDマスクの縁を滑らかにしたければ、番号を平均するのではなく、[Bitmap Mask](../../nodes/masks/bitmap-mask.md)でマスクへ変換した後のSoft Edgeなどを調整します。

**AOでZとNormalを使う場合**は、次の順で確認します。

1. [Renderer 3D](../../nodes/3d/renderer-3d.md)のOutput ChannelsでZとNormalを有効にし、AOのCamera入力にはその画像を描画したカメラを接続します。
2. AO節（21.1 Manual p.2259）には、AOのアンチエイリアスを行うにはRenderer 3DのZ／NormalsパスでHiQを有効にするという案内があります。HiQ表示と最終品質で、陰影や輪郭を見比べます。
3. 同じマニュアルのRenderer 3D節（p.1975）は、Normal値自体のアンチエイリアスを無効にするよう強く推奨しています。HiQで評価することと、Normalの値を境界で平均することを一律に同じ意味だと決めず、不自然な筋やにじみが出る場合はNormal側のアンチエイリアス設定を個別に確認します。Z側も境界で有効・無効を比較します。

**Zを使って前後の画像を合成する場合**も、輪郭が滑らかに見える設定が正しいとは限りません。21.1マニュアルはZへのスーパーサンプリングが役立つ例を挙げる一方、Mergeの**Perform Depth Merge**では逆効果になる場合もあると説明しています。また、Z値はアンチエイリアスを含まないという説明（p.1974）もあるため、内部処理の一律な断定は避け、実際の前後関係と境界を確認します。

AOは透明・半透明の物体や粒子の輪郭でも破綻しやすい処理です。設定だけで解決しない場合は、不透明な物体だけを別の3DシーンでAO処理する方法も検討します。詳しくは[Ambient Occlusion](../../nodes/deep/ambient-occlusion-deep-pixel.md)を参照してください。

## 補助チャンネルを可視化・加工する

補助チャンネルは通常のRGBプレビューで見えなくても、画像に残っていることがあります。**[Copy Aux](../../nodes/color/copy-aux.md)**を使うと、目的の補助チャンネルを一時的にRGBAへコピーして確認できます。

~~~text
Renderer 3D ──┬────────────────────────────────→ 通常の合成
              └→ Copy Aux（Aux to Color） → Viewerで値を確認
~~~

- **Mode: Aux to Color**で、**Aux Channel**にZ / Normal / ObjectIDなどを指定します。Zは各RGBに同じ値、NormalはXYZの3成分がRGBAのRGBへコピーされます。
- **Out Color Depth**は**Match Aux Channel Depth**または**Force Float32**を検討します。負の値や1を超える値を8bitのRGBへコピーすると、切り詰められて情報を失います。
- **Enable Remapping**では、例えばNormalの -1～1 を0～1へ対応づけ、色として確認できます。時間をまたいで比較する場合は、フレームごとに表示範囲が変わるViewerの自動正規化より、固定範囲のRemappingが有用です。
- Copy Auxには**Color to Aux**もありますが、これは加工したRGBA値を補助チャンネルへ書き戻す処理です。単にプレビューするだけなら、元の画像から分岐させ、補助情報を含む元経路を残します。

個別成分を他のチャンネルへコピーしたい場合は[Channel Booleans](../../nodes/color/channel-boolean.md)を使えます。Copy Auxの**Kill Aux Channels**を有効にすると出力から他の補助チャンネルが削除されるため、その先でZ・ID等を使う構成では注意してください。

## よくある問題

- **Depth BlurやFogが意図どおりに効かない**：Renderer 3Dまたは読み込んだEXRにZが実際に入っているか確認します。Viewerで「深度らしく見える画像」と、Z補助チャンネルを保持している画像は別です。
- **ObjectIDで想定外の物体も選択される**：物体のIDが重複していないか、背景IDの0と混同していないかを確認します。
- **Normal / UV / IDの境界に不自然な値が出る**：OpenGLの補助チャンネルのアンチエイリアスを確認します。ID・UV・Normalの推奨設定とAOのHiQとの関係は、上の「補助チャンネルの境界処理」を参照してください。
- **Copy Auxで画面が真っ黒になる**：チャンネル未出力や、負の値・広い値域を整数RGBへコピーした際のクリッピングを疑います。Aux Channel、Out Color Depth、Remappingを確認します。
- **後段で補助データが消える**：RGBAだけで保存・変換したり、Copy AuxのKill Aux Channelsを使ったりしていないか、ノードごとに確認します。

## 関連Node・概念

- [Renderer 3D](../../nodes/3d/renderer-3d.md) — Classic 3Dから必要な補助チャンネルを出力する
- [Bitmap Mask](../../nodes/masks/bitmap-mask.md) — ObjectID / MaterialIDをマスクに変換する
- [Copy Aux](../../nodes/color/copy-aux.md) — 補助チャンネルをRGBAへ取り出し、確認・加工する
- [Channel Booleans](../../nodes/color/channel-boolean.md) — RGBAと補助チャンネルの構成を変更する
- [Deep Image](./deep-image.md) — 画素内に複数の奥行きサンプルを持つ別データ形式

## 出典・バージョン

一次資料：**Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）**。

- Chapter 88「Renderer3D」、pp.1970–1975：Output Channels、IDの意味と範囲、Software / OpenGL差、補助チャンネルのアンチエイリアス、Zの境界処理。
- Chapter 93「Copy Aux」、pp.2182–2185：Aux to Color / Color to Aux、浮動小数点値の表示、固定Remapping、Kill Aux Channels。
- Chapter 96「Deep Pixel Nodes」、pp.2255–2261：Ambient OcclusionのZ・Normal・Camera入力、AOのHiQ案内と透明・半透明素材への制約、Depth BlurのZ・Focal Point・Depth of Field。
- Chapter 108「Bitmap Mask」、pp.2463–2467：ImageからのMask生成、Use Object / Use Material、Threshold、Soft Edge。

この記事の接続例はこれらの仕様を組み合わせたものです。Resolve 21.1実機での各レンダラー・GPU・外部EXRによる差、およびノード間での全チャンネル保持の動作は未検証のため、**verification: partial**としています。
