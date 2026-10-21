---
title: Krokodoveノード索引とAfter Effectsでの相当機能
description: DaVinci Resolve / Fusion 21・21.1のKrokodoveを機能別に一覧化し、AEで近い機能と各ノード解説を案内する。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-node, motion-graphics]
familiar_apps: [after-effects]
updated: '2026-10-21'
---

# Krokodoveノード索引とAfter Effectsでの相当機能

Krokodoveは、画像の加工・生成からベクトル状のShape、3D、3Dの作用領域（Region）、パラメータやテキストのModifierまで含むツール群です。**名前で探せる一覧**として、機能の要約・After Effects（AE）で近い方法・個別解説へのリンクを並べました。

**読み方:** AE欄は「似た結果を得るための機能・組み合わせ」であり、互換性や設定の一致を意味しません。複数の標準エフェクトを組み合わせるもの、AE標準では直接対応せずCinema 4D Liteなどの3Dソフトや外部プラグインを使うものを区別しています。

この索引に載せるのは、公式資料と既存の個別解説で**名称と役割を追跡できる86項目**です（このフォルダの個別解説85ページ＋共通の[標準ShapeノードsOffset](../shapes/soffset)）。2026年4月のResolve 21ガイドに61項目が記載され、9月の21.1ではShape・3D・Region系が拡張されました。全86項目が独立した「追加エフェクト」であるという意味ではなく、公式の「100以上」という製品全体の数値を網羅した一覧でもありません。

Image（画素）、[Shape](../../learn/02-data/shape)（輪郭）、3Dシーン、Region（作用範囲）、Modifier（値や文字の制御）は**別のデータ**です。Shapeは通常[sRender](../shapes/s-render)で画像にします。Regionを扱うツールは、対応するRegion入力へ接続します。

## 画像の加工・輪郭（Image Tools）

画像の画素や輪郭を加工するツール。

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Bounding Box](./bounding-box) | 指定チャンネルから画像内容を囲む矩形を作る | マスク＋範囲算出（自動化はExpression等） |
| [Color Map](./color-map) | 画像の階調を指定した複数色へ割り当てる | Colorama／Tritone |
| [Connect](./connect) | 複数の指定点を連続した線で結ぶ | シェイプパス＋線 |
| [Dither](./dither) | 階調をノイズパターンで表す | ノイズ＋ポスタリゼーション（近似） |
| [Extend](./extend) | 画像端の画素を縦横に延長する | CC RepeTile／Motion Tile |
| [Fragments](./fragments) | 画像を破片状に分け、出現や消失を制御する | CC Pixel Polly／Shatter |
| [Grow](./grow) | 指定点を起点に画像を現したり消したりする | マスク拡張・アニメーション |
| [Grow Color](./grow-color) | 端の色を透明領域へ伸ばす | Minimax＋エッジ延長（近似） |
| [Microwaves](./microwaves) | 中心から放射状の光線を作る | CC Light Rays／CC Light Burst 2.5 |
| [Pack](./pack) | 指定した範囲へ図形の反復模様を配置する | Repeater＋Expression（近似） |
| [Painterly](./painterly) | 画像を絵画調に加工する | Brush Strokes／Cartoon |
| [Rasterize](./rasterize) | 画像を点・四角形・ひし形などの模様に変換する | CC Ball Action／ハーフトーン |
| [Time Mapper](./time-mapper) | 別画像の値を使って再生時刻を空間的に変える | 時間置き換え（Time Displacement） |
| [Worm](./worm) | 指定した点を直線や曲線でつなぐ | シェイプパス＋パスのトリミング |

## 色の変換・置換（Image Color）

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Invert](./invert) | 色・輝度・色相を反転する | 反転（Invert） |
| [Match Color](./match-color) | 暗部・中間・明部などを選んで色を置換する | Tritone／Colorama |
| [Recolor](./recolor) | 複数の元の色を別の色に置換する | Change to Color |
| [Replace Color](./replace-color) | 選択した色を補正・置換する | Change Color／Change to Color |
| [Threshold](./threshold) | 色や明るさの狭い範囲を抽出する | Extract／色範囲選択 |

## テクスチャ・図形の生成（Image Create）

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Blobs](./blobs) | 複数の指定点に円形を生成する | 楕円シェイプ＋Repeater |
| [Generate](./generate) | ランダムな濃淡のテクスチャを作る | フラクタルノイズ |
| [Lines](./lines) | 線を規則的に繰り返した模様を作る | Grid／シェイプRepeater |
| [Pattern](./pattern) | 幾何図形を敷き詰める | Repeater／Motion Tile |
| [Shapes](./shapes) | 同心円・同心四角形を生成する | シェイプ＋Repeater |

## ピクセル・時間の処理（Image Pixel）

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Average](./average) | 連続フレームを平均化して重ねる | Echo／フレームブレンド |
| [Bevel](./bevel) | 画像の内側の縁に擬似的な立体感を加える | Bevel Alpha |
| [Channel Shifter](./channel-shifter) | RGBAごとにずらす・ぼかす・拡大する | Shift Channels＋Transform（RGB分離） |
| [Clean Edges](./clean-edges) | 画像端の画素を補修・置換する | CC RepeTile＋端の調整（近似） |
| [Deflicker](./deflicker) | 時間方向の明滅を抑える | 時間平均／CC Wide Time（近似） |
| [Duplicate](./duplicate) | 画像を図形やパターンに沿って複製する | Repeater／Motion Tile |
| [Extrude](./extrude) | 画像の縁を加工して擬似的な厚みを作る | 積層・長い影（2D近似） |
| [Noise](./noise) | 粒状・ピクセル状のノイズ模様を作る | Noise／Fractal Noise |
| [Plastic](./plastic) | プラスチック風の光沢と縁取りを加える | CC Glass＋Bevel Alpha（近似） |
| [Positioner](./positioner) | 四隅の位置を指定して画像をはめ込む | CC Power Pin／Corner Pin |
| [Push](./push) | 二つの画像を押し出すように切り替える | スライドトランジション |
| [Rest](./rest) | 指定した線を基準に画素を押し寄せて歪める | Mesh Warp／Bezier Warp（近似） |
| [Seamless](./seamless) | 端を鏡像合成して継ぎ目をなじませる | Mirror＋マスク／Offset |
| [Seamless Loop](./seamless-loop) | 素材の始端と終端をなじませてループ化する | Time Remap＋クロスフェード |
| [Sort](./sort) | 画素を色の値などで並べ替える | Pixel Sorter系外部プラグイン（AE標準に直接相当なし） |

## 輪郭と動きの可視化（Image Position / Vector）

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Contour](./contour) | 画像の勾配から繰り返す等高線状の輪郭を作る | Find Edges＋輪郭反復（近似） |
| [Vector Visualisation](./vector-visualisation) | モーションベクトルの向きと速さを重ねて表示する | ベクトル可視化（標準に直接相当なし） |

## 画像の幾何変形（Image Warp）

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Bend](./bend) | 3点の曲線を使って画像を曲げる | CC Bend It／Bezier Warp |
| [Directional Scale](./directional-scale) | 指定角度に沿って片側を伸縮する | Transform＋回転と軸別スケール（近似） |
| [Kaleidoscope](./kaleidoscope) | 放射状の鏡像を繰り返す | CC Kaleida |
| [Mirror](./mirror) | 指定した軸を中心に画像を反射する | Mirror |
| [Offset](./offset-krokodove) | 別画像で水平・垂直方向のずれを制御する | Displacement Map |
| [Radial](./radial) | 中心に向かう／外へ向かう放射状の歪みを作る | Bulge／Liquify |
| [Relative Transform](./relative-transform) | 別入力を参照して位置・回転・拡大率を変形する | Transform＋Expression（近似） |
| [Segment Transform](./segment-transform) | タイルごとに回転・拡大率を変える | タイル分割＋個別Transform |
| [Shear](./shear) | 指定方向へ斜めに押し流す | TransformのSkew |
| [Shuffle](./shuffle) | 細分化した画面の位置を入れ替える | タイル分割＋Expression |
| [Spherize](./spherize) | 球面・円筒状に丸く歪める | Spherize |
| [Stretch](./stretch) | 指定した軸や線に沿って画素を引き延ばす | Mesh Warp／Liquify |
| [Warped Transform](./warped-transform) | 画像を引き伸ばし・押し縮め・回転させる | Transform＋Mesh Warp（近似） |

## 値を動かすModifier

映像へ直接挿すノードではなく、対応するパラメータの値を動かすもの。

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Beat](./beat) | BPM・拍・ADSRを基準にアニメーションする | BPM計算Expression／オーディオ連動 |
| [Color Switcher](./color-switcher) | カラーパレットを切り替え・循環させる | Color Control＋Expression |
| [Random](./random) | 数値をランダムに生成し、時間変化も付ける | random()／wiggle()／seedRandom() |

## 文字を動かすText Modifier

文字の内容や表示を制御する。AEでは主にSource Text ExpressionとText Animatorを組み合わせる。

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Formula](./formula) | 式を使ってテキストの内容を制御する | Source Text Expression |
| [From File](./from-file) | 外部テキストを行単位・時間指定で表示する | CSV・JSONとsourceData／Expression |
| [Juggle](./juggle) | 文字をランダムに入れ替える | 文字オフセット／Source Text Expression |
| [Write](./write) | カーソル付きのタイプライター表示を作る | Text Animator／Source Text Expression |

## 3D配置・形状生成

3Dシーンを作る。AEの2.5Dレイヤーと同じデータ型ではないため、立体形状の編集はCinema 4D Liteなどが近い。

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [Mapped Duplicate 3D](./mapped-duplicate-3d) | 画像を使って複製した3Dオブジェクトの配置や変化を制御する | C4DのCloner／AEでは3Dレイヤー複製＋Expression |
| [Fold Create 3D](./fold-create-3d) | 区画に分けた平面を順番に折る | CC Page Turn（2D近似）／C4Dで折り面作成 |
| [Heightfield Create 3D](./heightfield-create-3d) | 画像の明るさを使って3Dの平面に起伏を付ける | Displacement Mapは2D近似／C4DのDisplacer |
| [Tube Create 3D](./tube-create-3d) | 経路に沿う管状の立体を生成する | C4DのSweep（AE標準に直接相当なし） |
| [Connect 3D](./connect-3d) | 3D頂点間に接続を生成する | C4D等で頂点間ライン作成（AE標準に直接相当なし） |

## Shapeを生成する

Shapeは画像とは別の図形データ。画像として使うには通常、標準Shape系のsRenderで描画する。

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [sPrimitiveCreate](./sprimitive-create) | 十字・多角形・長方形・星形を作る | 長方形・多角形・星形シェイプ |
| [sSpiral Create](./sspiral-create) | 中心や軸の周囲にらせん状の線を生成する | パスExpression／Illustratorのスパイラル（近似） |
| [sTrace Create](./strace-create) | 2Dの文字・図形をShapeの処理へ渡す | テキストからシェイプを作成／オートトレース（近似） |

## Shapeの輪郭・スタイルを加工する

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [sExtrude](./sextrude) | Shapeへ押し出し処理を加える（出力型は未確認） | パスの積層・押し出し表現（直接互換ではない） |
| [sKill](./skill) | 条件に一致するShapeの線分を取り除く | パス部分編集（直接対応なし） |
| [sOffset](./../shapes/soffset) | 輪郭を内側・外側へずらす（標準Shapeノードの解説へ） | パスのオフセット |
| [sResample](./sresample) | 輪郭のサンプリングを変更する | パス再生成のスクリプト（標準に直接相当なし） |
| [sRestyle](./srestyle) | Shapeの塗り・輪郭線の見た目を変更する | シェイプの塗り・線 |
| [sRound](./sround) | 辺を保ちながら角を丸める | 角を丸くする |
| [sSmooth](./ssmooth) | 角を保ちながら辺を滑らかにする | パスのスムージング（近似） |
| [sTriangulate](./striangulate) | Shape内を三角形に分ける | 三角形分割スクリプト／外部3Dツール |
| [sWriteOn](./swriteon) | 輪郭線を描き現したり消したりする | パスのトリミング |
| [sZigZag](./szigzag) | 輪郭線をジグザグに変形する | ジグザグ |

## 3Dの作用範囲を定義するRegion

Regionは3Dオブジェクトを描画するのではなく、対応するツールへ作用範囲を渡すためのデータ。AEには標準の直接対応がない。

| ノード・個別解説 | できること | AEで近い機能・方法 |
| --- | --- | --- |
| [rCube](./rcube) | 立方体の作用領域を生成する | 3Dボックス状マスク（C4D等で近似） |
| [rPlane](./rplane) | 平面の作用領域を生成する | 3D平面マスク（近似） |
| [rSphere](./rsphere) | 球形の作用領域を生成する | 3D球形マスク（近似） |
| [rNoise](./rnoise) | ノイズに基づく3D作用領域を生成する | 3Dノイズ領域（外部3Dツール） |
| [rMerge](./rmerge) | 複数のRegionを結合する | 3D領域の集合演算（直接対応なし） |
| [rModify](./rmodify) | 既存のRegionを変更する | 3D領域の調整（直接対応なし） |
| [rTransform](./rtransform) | Regionの位置・向き・大きさなどを変形する | 3D領域のTransform（近似） |

## 資料の範囲と検証状況

- **Resolve 21の基礎一覧:** Blackmagic Design『[DaVinci Resolve 21 New Features Guide](https://documents.blackmagicdesign.com/SupportNotes/DaVinci_Resolve_21_New_Features_Guide.pdf)』、2026年4月、pp.108–111。Krokodoveの61項目と主な役割。
- **Resolve 21.1での拡張:** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』、2026年9月、Chapter 105、pp.2434–2438。Krokodoveの記名行85項目。ほか、[Blackmagic Designの21.1発表](https://www.blackmagicdesign.com/media/partial/release/20260908-03)でConnect 3D等の追加を確認。
- この索引は**Manualと公式発表から得た名前・役割**を案内します。各ツールの正確なInspector項目、入出力端子、利用可能なEdition、内部登録ID、実機での動作は未確認の項目があります。各詳細ページの「出典と確認範囲」を参照してください。
- 画像を処理する[Connect](./connect)と3Dの[Connect 3D](./connect-3d)、画像ワープの[Offset](./offset-krokodove)とShapeの[sOffset](../shapes/soffset)、2D画像の[Extrude](./extrude)とShapeの[sExtrude](./sextrude)は別の役割です。

確認日: 2026-10-21。
