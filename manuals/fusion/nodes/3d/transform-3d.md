---
title: "Transform 3D"
description: "3Dの物体やシーンに追加の移動・回転・拡大縮小を適用し、階層的な動きを組み立てるNode。"
doc_type: node
term_id: "transform-3d"
term_short: "Transform 3Dは、入力された3D物体やシーン全体を移動・回転・拡大縮小するNode。"
verification: partial
aliases: ["Transform 3D", "Transform3D", "3XF"]
concepts: ["classic-3d", "transform"]
nodes: ["Transform 3D"]
node_family: "3d"
controls: ["X/Y/Z Offset", "Rotation Order", "X/Y/Z Rotation", "X/Y/Z Pivot", "Lock X/Y/Z Scale", "X/Y/Z Scale", "Use Target", "Import Transform"]
inputs: ["classic-3d"]
outputs: ["classic-3d"]
tasks: ["build-3d-scene", "transform-3d", "hierarchy"]
product_scope: fusion
suite_surfaces: ["fusion"]
updated: "2026-10-09"
---

# Transform 3D

Transform 3D [3XF]は、入力した3Dオブジェクトやシーンを**移動・回転・拡大縮小する**Nodeです。たとえば3D文字の配置を後から調整したり、複数の3D物体をひとまとまりとして動かしたりできます。

[Shape 3D](./shape-3d.md)などにもTransformの設定がありますが、Transform 3Dを後段へ接続すると、**元の形状やTransformの設定を残して、さらに変形を重ねられます**。複数のTransform 3Dをつなぎ、物体ごとの移動とグループ全体の移動を分けることもできます。

## 入力と出力

- **Scene Input（オレンジ、必須）**：変形したい3Dオブジェクト、または複数の要素が入った3Dシーンを受け取ります。
- **出力**：変形を追加した<Term id="classic-3d">Classic 3Dシーン</Term>です。[Merge 3D](./merge-3d.md)や[Renderer 3D](./renderer-3d.md)へ接続できます。

~~~text
Shape 3D → Transform 3D → Merge 3D → Renderer 3D → 2D画像
                            ↑
                         Camera 3D
~~~

Transform 3Dが変形するのは**入力シーンに含まれる要素すべて**です。物体とCameraを先にMerge 3Dでまとめ、その後ろにTransform 3Dを接続すると、Cameraも変形の対象になります。物体だけを動かす場合は、CameraやLightが合流する前に置きます。

出力は2D画像ではありません。映像へ合成する場合は後段でRenderer 3Dによって描画します。

## Inspectorの主な設定

### Translation：位置を移動する

**X / Y / Z Offset**で3D空間内の位置を変更します。Cameraから見た画像上の横・縦とは必ずしも一致しません。どの軸が手前や奥に見えるかはCameraの向きによって変わります。

### Rotation：向きを変える

**X / Y / Z Rotation**で各軸の回転量を指定します。**Rotation Order**は3軸の回転を適用する順序です。たとえばXYZならX、Y、Zの順に適用されます。同じ3つの角度でも順序が違うと最終的な向きが異なるため、複数の軸を回すアニメーションでは確認しておきます。

### Pivot：回転・拡大縮小の中心

**X / Y / Z Pivot**で変形の基準位置をずらします。たとえば箱を中心ではなく端付近で回転させたい場合、Pivotを移してからRotationを調整します。

Translationは物体の**配置位置**を変更し、Pivotは**どこを中心に回すか**を変更します。Pivotを変えると、同じRotation値を使っても物体の通り道が変わります。

### Scale：大きさを変える

**Lock X/Y/Z Scale**が有効なら3軸のScaleをまとめて変更します。Lockを外すと**X / Y / Z Scale**を別々に設定でき、幅だけを広げるなどの変形が可能です。

Lockが有効な場合、Viewerで1軸のScaleハンドルを動かしても、その軸だけを拡大縮小することはできません。

### Use Target：目標の位置を向かせる

**Use Target**を有効にすると、向かせたい地点のXYZ位置を指定する設定が現れます。物体は指定した地点を向くように回転します。動く目標を追う動きを作るときに、X・Y・Zの回転角を個別に組み立てる代わりに使用できます。

Use Targetが有効な場合は、通常のRotation値による回転と計算の仕方が変わるため、Viewerで向きを確認します。

### Import Transform：外部の変換データを使う

**Import Transform**は、外部3Dアプリで保存・書き出ししたファイルから**変換情報だけ**を取り込みます。21.1 Reference Manualに記載されている形式は、LightWave Scene（.lws）、Max Scene（.ase）、Maya Ascii Scene（.ma）、dotXSI（.xsi）です。

メッシュ、Camera、Lightを丸ごと読み込む機能ではありません。3Dモデルやシーンそのものを取り込む場合は、FileメニューのFBX Importなどを使い分けます。列挙した形式の現行実機での互換性は未確認です。

## 運用例1：2つの物体をまとめて回す

CubeとSphereを別々に配置し、物体同士の距離を保ちながら全体を回転させる例です。

~~~text
Shape 3D（Cube）   → Transform 3D（個別の配置） ─┐
                                                  ├→ Merge 3D（物体のみ）
Shape 3D（Sphere） → Transform 3D（個別の配置） ─┘          ↓
                                                  Transform 3D（全体）
                                                          ↓
Camera 3D ─────────────────────────────────────────→ Merge 3D
                                                          ↓
                                                      Renderer 3D
~~~

1. CubeとSphereを別々のShape 3Dで作り、それぞれのTransform 3Dで位置を決めます。
2. 2つをMerge 3Dでまとめ、後段に**もう1つTransform 3D**を置きます。
3. 後段のTransform 3DでRotationを変えると、前段で設定した相対位置を保ったままCubeとSphereが一緒に回転します。
4. Camera 3Dはさらに後ろのMerge 3Dで合流させ、Renderer 3Dで描画します。

前段のTransform 3Dが**各物体の動き**、後段のTransform 3Dが**グループ全体の動き**を担当します。Manualでは、このように複数のTransform 3Dを重ねて階層的な動きを作る使い方が紹介されています。

## 運用例2：端を支点にして3Dタイトルを回す

3Dタイトルを中央ではなく端付近を中心に回転させる場合、[Text 3D](./text-3d.md)の後段にTransform 3Dを追加します。最初にPivotのXYZを調整して回転の基準をずらし、次にRotationを動かします。最後に必要なTranslationを加え、画面内の位置を整えます。

単にタイトルを横へ移動させるだけならTranslationで足ります。Pivotを変更するのは、**回転や拡大縮小の中心を変えたい場合**です。

## Viewerからの操作

21.1 Reference Manualには、Viewerのハンドルをドラッグして移動・回転・拡大縮小する方法も記載されています。モード切り替えは**Q：移動、W：回転、E：拡大縮小**です。軸のハンドルをドラッグした場合と、中央をドラッグした場合では影響する軸が異なります。

Scaleを1軸だけ調整したいのに全方向へ拡大される場合は、Lock X/Y/Z Scaleの状態を確認します。ショートカットはManualの記述であり、実機の個別キーマッピングは別途確認が必要です。

## 2D Transformやほかの3D Nodeとの違い

- **[Transform](../transform/transform.md)**は2D画像を移動・回転・拡大縮小するNodeです。Transform 3Dは3Dシーンを扱い、出力も3Dのままです。
- **[Merge 3D](./merge-3d.md)**は複数の3D要素を合流させます。Transform 3Dは接続済みの要素をまとめて変形するNodeで、新たな枝をまとめる役割ではありません。
- **[Camera 3D](./camera-3d.md)**はシーンをどこから見るかを決めます。Cameraを動かさず物体だけを変形したい場合は、Cameraが合流する前にTransform 3Dを置きます。
- **[Renderer 3D](./renderer-3d.md)**は3Dシーンを2D画像に描画します。Transform 3D自身は2D画像を生成しません。

## 関連する考え方

- [Classic 3Dの基本](../../learn/02-data/classic-3d.md)：3Dと2Dのデータの違い。
- [Classic 3D Node一覧](./index.md)：各Nodeの役割から探す。
- [Shape 3D](./shape-3d.md)・[Text 3D](./text-3d.md)：動かす3D物体を作る。

## 出典と確認範囲

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（September 2026）、Chapter 88「3D Nodes」、**Transform 3D [3XF]（pp.2007–2010）**を参照しました。Scene Input、階層的な接続、Translation・Rotation・Pivot・Scale、Use Target、Import Transformの形式、Viewer操作はManualで確認しています。

運用例は確認済みの仕様を基に組み立てた構成案で、21.1実機のレンダリング結果ではありません。内部REGID、Edition差、各Controlの初期値と数値範囲、外部形式の現在の互換性は未確認のため、verificationはpartialとしています。
