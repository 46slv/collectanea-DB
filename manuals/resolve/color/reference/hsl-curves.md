---
title: HSL Curves（色相・彩度・輝度カーブ）
description: Resolve Colorページの6種類のHue／Lum／Satカーブを、選択基準・実用例・Qualifierとの差から理解する。
doc_type: reference
verification: partial
product_scope: color
suite_surfaces: [color]
controls: [Hue vs Hue, Hue vs Sat, Hue vs Lum, Lum vs Sat, Sat vs Sat, Sat vs Lum, Six-Vector Color Patches, Enable Bezier]
tasks: [hue-adjustment, selective-saturation, secondary-grading, shot-matching]
level: intermediate
updated: "2026-10-22"
---

# HSL Curves（色相・彩度・輝度カーブ）

DaVinci ResolveのColorページでは、**HSL Curves**を使って「特定の色相だけ彩度を下げる」「暗部だけ色の濃さを抑える」といった補正ができます。[Custom Curves](./custom-curves)が主に入力階調とY／R／G／Bチャンネルの対応を変更するのに対し、こちらは**何を条件に選ぶか**と**その範囲の何を変えるか**を組み合わせます。

たとえば赤い服の彩度を抑える場合、その服という物体を選ぶのではなく、画像内の「赤系の色相」を選びます。同じ赤を持つ看板や肌にも影響することがあるため、補正後は対象外の部分も確認する必要があります。

## 6種類をどう使い分けるか

Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』Chapter 134（PDF p.3202–3208）では、次の6種類を説明しています。

| カーブ | 横軸が表す条件 | 変化するもの | 用途の例 |
| --- | --- | --- | --- |
| **Hue vs Hue** | 入力の色相 | 色相 | シアン寄りの空を少し青へ寄せる |
| **Hue vs Sat** | 入力の色相 | 彩度 | 赤い衣装の彩度を控える |
| **Hue vs Lum** | 入力の色相 | 明るさ | 青い海を少し深く見せる |
| **Lum vs Sat** | 入力の輝度域 | 彩度 | 暗部の色の濃さを弱める |
| **Sat vs Sat** | 入力の彩度 | 彩度 | 最も鮮やかな色だけを抑える |
| **Sat vs Lum** | 入力の彩度 | 明るさ | 高彩度の空を少し暗くする |

名称は**横軸で選ぶ量 vs 調整する量**と読みます。特に *Lum vs Sat*（明るさで選び彩度を変える）と *Sat vs Lum*（彩度で選び明るさを変える）は逆の処理です。

Blackmagicの[Color製品紹介](https://www.blackmagicdesign.com/products/davinciresolve/color)はCustom以外に5種類を掲載していますが、**21.1のリファレンスマニュアルにはSat vs Lumもあります**。製品紹介の簡略な一覧だけから21.1の全カーブを判断しないでください。

## カーブの軸・選択範囲

Hue vs Hue／Hue vs Sat／Hue vs Lumの横軸は色相環に対応します。左から赤→緑→青→赤と一周するため、**左端と右端は連続した色相**です。赤に近い色を調整すると、グラフの両端が連動して変化する場合があります。[Custom Curves](./custom-curves)の「左＝黒／右＝白」という対角線とは違い、これらのカーブは中立状態で水平です。

目的の範囲を3つの制御点で挟み、中央点を動かして調整します。両側の点は周辺色への影響が弱まる幅を決める目安です。選択幅を広げれば近い色にも補正がかかり、狭くし過ぎれば色の境界が不自然になることがあります。表示されるグラフ上の選択だけで判断せず、Viewerで連続した色の変化を確認します。

Sat vs SatとSat vs Lumは、左が低彩度、右が高彩度を意味します。色相を問わず「鮮やかさ」で対象を選ぶため、赤だけを調整したい場合はHue vs Satの方が直接的です。

## 操作の始め方と選択方法

1. Colorページでクリップと補正ノードを選び、中央のツール群から**Curves**を開きます。
2. パレットのカーブ切替アイコンから、目的に対応するHue／Lum／Satのカーブを選びます。
3. **Hue vs Hue、Hue vs Sat、Hue vs Lum、Lum vs Sat、Sat vs Sat**では、Viewer内をクリックするか、領域をドラッグしてサンプリングできます。21.1マニュアルでは、サンプル範囲を挟む**3点がカーブ上に追加される**と説明しています。
4. 中央点を少し動かし、Viewerと[Scopes](./scopes)で意図した変化かを判断します。過補正なら点の移動量と範囲を戻します。

**Sat vs Lumに対する同じViewerサンプリング操作は、このマニュアルの該当説明からは確認できていません。** 他の5種類から操作互換を推測しません。

Hue系3種類には、赤・黄・緑・シアン・青・マゼンタの範囲へ制御点を追加する**Six-Vector Color Patches**があります。色ボタンを使えば3点を素早く作れますが、実際の被写体がその代表色と一致するとは限りません。必要に応じてViewerで対象をサンプルし直します。**Enable Bezier**では、制御点に表示されるハンドルを使ってカーブのつながり方を調整できます。

## 例1：シアン寄りの空を少し青にする

人物の背後に青空があるショットを想定します。まず[Primaries](./primaries-color-wheels)などで露出と全体の色バランスを確認し、空の補正を別のシリアルノードへ分けます。

1. **Hue vs Hue**を開き、Viewerで空のシアン寄りの部分をサンプルします。白い雲や建物などはサンプル範囲に入れ過ぎないようにします。
2. 中央点を少しずつ動かし、空が望む青へ近づくか確認します。大きく色を回す前に、微調整で足りないか試します。
3. 空のグラデーションに不自然な段差がないか、青い服や窓の反射まで変わっていないかを確認します。
4. ノードの有効／無効を切り替え、補正前の空と見比べます。空と同じ色相の物体だけ影響を除く必要があれば、別のQualifierやPower Windowを検討します。

これは空そのものの選択ではありません。青い服にも同じ入力色相があれば補正対象になります。

## 例2：強すぎる赤い看板の彩度を抑える

赤い看板が強く見えるショットでは、何が過剰かを先に分けます。

- **赤い色相全体が強い**なら、Hue vs Satで赤系をサンプルし、中央点を少し下げます。肌・唇・背景の赤い小物まで彩度が落ちていないか、Viewerで確認します。
- **色を問わず、最も高彩度の領域が強い**なら、Sat vs Satの高彩度側を少し下げます。ほかの高彩度の青・緑にも作用することを確認します。

どちらも調整後に[Vectorscope](./scopes)で分布の変化を確認できます。ただし、スコープ上の広がりが小さくなることだけを完成条件にはしません。映像の意図を損なわず、必要な色の違いを残せているかをViewerで判断します。

## 例3：暗部の不自然な彩度を抑える

黒い服や室内の暗い壁に色が残りすぎて見える場合、**Lum vs Sat**で暗部側の彩度を少し下げます。中間調へ滑らかにつながるように調整し、肌がくすんだり、暗部の階調そのものが潰れたりしていないか確認します。このカーブは明るさを変えるのではなく、**明るさを選択条件として彩度を調整**します。

反対に「高彩度の青だけ少し暗くしたい」なら**Sat vs Lum**が候補です。彩度に応じて明るさを変えるため、青以外の高彩度部分も暗くなり得ます。どちらの操作も、映像に応じて必要な範囲と変化量を決めます。

## 同じノードで複数カーブを組み合わせる際の重要な注意

21.1マニュアルは、Hueカーブで選択する色相は**その補正ノードに入力されたRGB**を基準にすると説明しています。

例として、同じノードのHue vs Hueで**青いシャツを赤に変えた**とします。続けてHue vs Satでシャツの彩度を上げたい場合、選ぶべき色相は**変更後の赤ではなく入力時の青**です。赤に対応する点を動かしても、期待したシャツに効かない場合があります。

ノードを分けたときは、後段ノードへの入力画像が変わります。前段で色を回した場合は、後段で選ぶ色相をもう一度確かめてください。Color Managementや手前のノードの変更も入力値に影響するため、既存の制御点の位置を無条件に流用しません。

## Qualifier・Color Warperとの違い

**HSL Curves**は、色相・彩度・輝度の連続的な範囲へ滑らかに補正をかけたい場合に向きます。21.1マニュアルでは、HSL Qualifierによるキーより滑らかな変化を作りやすい一方、色が似ていても**物体同士の境界を明確に分けたい場面ではQualifierが有利**な場合があると説明しています。

**Power Window**は色とは別に形と位置で範囲を限定する手段です。**Color Warper**は色相と彩度（あるいは明るさ）の分布を二次元の網／グリッドで見ながら色を動かす方式で、1本のカーブによる補正とは異なります。どちらを使うかは「どんな入力条件で、画面のどの範囲を変更したいか」によって判断します。

## 出典・対象版・検証範囲

- **対象版：DaVinci Resolve 21.1。** Blackmagic Design『DaVinci Resolve 21.1 Reference Manual』（2026年9月8日公開）、**Color / Chapter 134「Curves」、PDF p.3202–3208**。6種類の曲線、Hue横軸の循環、Viewerサンプリング、Six-Vector、同じノード内の入力色相基準、Qualifierとの違いを確認。[公式サポート](https://www.blackmagicdesign.com/support)。
- Blackmagic Design、[DaVinci Resolve – Color](https://www.blackmagicdesign.com/products/davinciresolve/color)「Adjust Contrast and Color with Curves」「Secondary Color Correction」「Color Warper」。5種類の紹介と用途例を照合。

**検証状態：partial。** 上記21.1マニュアルと公式製品紹介による仕様確認済み。Resolve 21.1実機上の動作、OS別操作、Free／Studio差、実素材での定量的な効果や推奨値は未検証です。操作例は具体的な判断手順を示したもので、固定数値のプリセットではありません。

関連：[Custom Curves](./custom-curves)／[Primaries](./primaries-color-wheels)／[Scopes](./scopes)／[Color Node Graph](../learn/color-node-graph)