---
title: 定番VFX表現の収集帳（Fusion再現候補）
description: 文字・人物の消滅、粒子、グリッチ、遷移、合成、光学・時間・3D表現を、後で実機再現できるようID付きで収集。
doc_type: index
verification: unverified
product_scope: fusion
aliases: [vfx表現集, VFX expression catalog, motion graphics lookbook, 定番エフェクト]
tasks: [research, visual-effects, reproduce, effect-recipe]
updated: "2026-10-23"
---

# 定番VFX表現の収集帳

映像やモーショングラフィックスで見かける演出を、**完成した作り方ではなく、後から再現を検証するための候補**として集めた資料です。現在73件。新しい表現が見つかれば追記します。

このResearchは「何を表現したいか」「どの技術から着手できそうか」「何を実機で確認するか」を扱います。**具体的な接続・パラメータ・レンダリングを確認できたものだけ** [Fusion Recipes](https://46slv.github.io/collectanea-DB/manuals/fusion/recipes/) の個別ページへ昇格させます。

## 読み方と検証状態

- **全73件の状態は `候補／実機未検証`**。名称がよく知られた効果であること、Nodeが公式マニュアルに載ること、ある組み合わせが実際に目的の映像になることは、それぞれ別の主張です。
- 表の「試す構成」は**初期仮説**です。接続可否、速度、Free/Studio差、視覚品質を保証しません。**Fusion**は主に標準Node案、**併用**はFusion＋他ツール、**外部**は特殊アルゴリズム等の候補です。
- まず**完成映像の条件**を固定し、静止文字 → 透過画像 → 動画人物など入力を変えて比較します。効果を完成させる前に「画像／マスク／粒子／3D」のデータの境界を確認します。
- **UE5の『Screen Space × Stencil』とFusionの2Dアルファ近似は別方式**。この違いは [スクリーンスペース・シルエット粒子化の調査](./screen-space-silhouette-dissolve) に記録しています。
- [実機検証の進め方](./verification-plan) と [一次資料・外部資料](./sources) を参照してください。

## D — 消滅・分解・再構築（10件）

対象が存在しなくなる／別の材質へほどける／集まり直す表現。UE5の記事に直接対応するのは D-01。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `D-01` | [スクリーンスペース・シルエット粒子化](./screen-space-silhouette-dissolve) | 人物や文字の見える面を粒子へ置き換えて消す | Fusion: 被写体アルファ + pImageEmitter / pEmitter（Bitmap領域） | スクリーン上の密度、動画マスク追従、奥行き差 |
| `D-02` | ノイズで浸食される消失 | 輪郭が不規則に欠けながら消える | Fusion: Fast Noise + Dissolve（Gradient Wipe） | 輪郭の硬さ、穴の出方、アルファ |
| `D-03` | 燃えて灰になる消失 | 燃焼境界が明るく光り、灰や火の粉が残る | Fusion: D-02の境界マスク + Glow + pEmitter | 燃焼前線と発生位置の同期 |
| `D-04` | 風に流される砂状分解 | 人物や文字が砂粒へ変化し、一定方向へ飛散 | Fusion: pImageEmitter + pDirectionalForce + pTurbulence | 色の保持、粒子寿命、流れる方向 |
| `D-05` | 煙になって消える | 対象が霧状にほどけて拡散する | Fusion＋素材: 粒子と低周波ノイズ変形を合成 | 透過・煙の厚さ、見えない背景の復元 |
| `D-06` | グリッチ／ピクセル消滅 | 四角い断片が位置をずらしながら消える | Fusion: Grid/Shape あるいは分割タイル + Displace（構成案） | ブロック単位の独立性と処理負荷 |
| `D-07` | 破片へ砕ける消失 | ロゴ・ガラス・人物が硬い断片に分かれる | 併用候補: Blenderで破片を生成してFusionで合成 | 物理演算、破片の面厚・照明 |
| `D-08` | インクが溶けるような消失 | 黒インクや水彩の縁が滲みながら消える | Fusion: Fast Noise + Displace + 境界のブラー | 液体らしい広がりと滲み |
| `D-09` | 輪郭線だけ残して消える | 面が先に消え、エッジの発光線が最後に残る | Fusion: エッジ抽出 + マット差分 + Glow | 面と輪郭の時間差 |
| `D-10` | 粒子が集まって出現 | 散った粒が人物・文字を再形成する | Fusion: D-01/D-04を逆再生または到達位置制御 | 逆再生時の加速度・粒子の被写体色 |

## T — 文字・ロゴ・図形（9件）

Text+やShapeと、アニメーション・粒子・追跡を組み合わせる。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `T-01` | タイプライター／文字送り | 文字が1字ずつ表示される | Fusion: Text+ Write On / Follower | 和文・改行・順送り間隔 |
| `T-02` | 手書き線画の描画 | 線が筆跡に沿って引かれ、文字や図形が完成 | Fusion: Paint stroke / Mask animation / Shape系 | 線幅、書き順、角・交差部 |
| `T-03` | 文字単位のバラバラ登場 | 文字が遅延して回転・落下・飛来する | Fusion: Text+ Follower | 字ごとの位相、カーニング維持 |
| `T-04` | 文字スクランブル／数字カウント | ランダム文字が確定文字へ置き換わる | Fusion: Text+ + Expression / Script（要調査） | 文字列評価と日本語対応 |
| `T-05` | ネオン文字の点灯 | 線をなぞった後で光が点灯・明滅する | Fusion: テキスト輪郭/Mask + Glow / Soft Glow | 線の移動に連動する発光 |
| `T-06` | ロゴの3D押し出し登場 | 平面ロゴが厚みを持って起き上がる | Fusion: Text 3D / Shape 3D または外部メッシュ | 任意SVGの3D変換、法線とライト |
| `T-07` | 文字の弾性・伸縮 | 伸び縮みして跳ね、止まる | Fusion: Text+ / Transform + Spline | 縮尺・位置・速度の連動 |
| `T-08` | 文字から粒子がこぼれる | 字形を保ったまま粉や光点が落ちる | Fusion: Text+ のアルファ + pEmitter（Bitmap領域） | 文字領域外への漏れ、蓄積量 |
| `T-09` | 形状モーフ／ロゴ変形 | 円・線・ロゴが滑らかに別形状へ変わる | Fusion: Shape path / Grid Warp（形状互換性要検証） | 点数やトポロジーが異なる形の補間 |

## X — カット間の画面遷移（9件）

映像AとBの切替を見せる表現。素材を消すVFXと異なるため分ける。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `X-01` | ノイズ浸食ワイプ | 映像の境目がまだらに広がって次カットが見える | Fusion: Dissolve（Gradient Wipe）+ Fast Noise | A/Bの色域、ワイプの閾値 |
| `X-02` | 光漏れ／フィルムバーン | 光のかぶりが画面を覆う瞬間に次へ変わる | Fusion: Light Leak素材 / Glow / Merge | 素材の利用権、露光とクロスフェード |
| `X-03` | ウィップパン／流れブラー | 急な横振り・縦振りで次カットへ接続 | Fusion: Transform + Directional Blur / Motion Blur | 両カットの移動方向と接続点 |
| `X-04` | ズームブラー／吸い込み | 画面中央に吸い込まれた後、次カットが広がる | Fusion: Transform + Rays / Directional Blur | 中心点、画角、被写体の連続性 |
| `X-05` | 歪み・液体ワイプ | 水面や粘液の波で境界が曲がる | Fusion: Displace + ノイズマップ + マット | 輪郭の破れ、被写体との重なり |
| `X-06` | RGB分離グリッチ遷移 | RGBの色ずれと横ノイズを挟んで切替 | Fusion: Channel系 + Transform/Displace + Dissolve | 色ずれの時間幅、破綻フレーム |
| `X-07` | ブロック・ピクセルワイプ | 矩形のタイルが順番に入れ替わる | Fusion: マスクのタイル分割 / sGrid（構成案） | タイルの順序・独立アニメーション |
| `X-08` | フラッシュ／ストロボカット | 数フレームの白飛びや明滅で場面を転換 | Fusion: Background + Merge + キーフレーム | 光量、フレーム長、点滅の安全性 |
| `X-09` | 物体・形状をマッチさせる変化 | 似た形の物体を同じ位置でカット間につなぐ | Edit＋Fusion: Transform / Warp / Optical Flow候補 | 視点と輪郭の一致、補間アーティファクト |

## L — 光学・映像質感・デジタル（12件）

素材全体の見え方を変える処理。現行のResolve FX（OFX）とFusionネイティブを混同しない。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `L-01` | CRT／ブラウン管画面 | 走査線・湾曲・にじみで旧式モニターに見せる | Fusion: TV + Lens Distort + Glow | 水平走査線、サブピクセル色構造 |
| `L-02` | VHS／アナログテープ障害 | 画面の横揺れ・色にじみ・時々の信号切れ | Fusion: Displace / Channel系 + Noise（構成案） | テープ特有の時間的ノイズ |
| `L-03` | デジタル・グリッチ／フレーム裂け | 帯状の映像ずれと断続的な色化け | Fusion: Displace + 横方向マスク + チャネル分岐 | 片フレームだけの乱れ、速度 |
| `L-04` | ピクセルソート | 明暗に沿って画素が長い線状に引き伸びる | 外部／Custom Fuse候補: 画素並べ替えアルゴリズム | 標準Displaceでの見た目近似との違い |
| `L-05` | データモッシュ | 前後の映像が圧縮ブロックと動きベクトルで混ざる | 外部エンコード処理推奨: Codec motion-vector操作 | 単なるグリッチと圧縮状態依存の違い |
| `L-06` | フィルム粒子・傷・ガタ | 粒状感、埃、傷、微小なゲート揺れ | Fusion: Film Grain + Camera Shake / 汚れ素材 | 粒の解像度依存性、時間変化 |
| `L-07` | ハレーション／光のにじみ | 強い光源の周囲に色付きのにじみが出る | Fusion: Glow / Soft Glow、Resolve FXも別途比較 | 元の明部のしきい値、色 |
| `L-08` | 色収差／RGBずれ | 画面端で色チャンネルが分離する | Fusion: チャンネル分岐 + Lens Distort/Transform | 中心と端の変位差 |
| `L-09` | 熱気ゆらぎ／陽炎 | 背景が熱で局所的にゆがむ | Fusion: Fast Noise + Displace | ゆらぎの方向、背景の解像度 |
| `L-10` | ホログラム／HUD投影 | 透けた像に走査線・発光・欠落が重なる | Fusion: マスク + Glow + Fast Noise + 合成 | 奥行き順序、追跡先の照明 |
| `L-11` | ハーフトーン／ドット化 | 階調が細かい丸い印刷網点に変わる | Fusion: Shape反復 / Custom Filter / DCTL候補 | 網点サイズ・角度・階調の関係 |
| `L-12` | ディザリング／パレット制限 | 少色数の粒や模様で陰影を表現する | Resolve FX/DCTLまたはFuse候補 | 誤差拡散か規則ディザか、色深度 |

## P — 粒子・天候・自然現象（9件）

多くは粒子の発生位置・寿命・速度・色・レンダリングの組合せだが、流体現象は別。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `P-01` | 漂う埃／塵 | 空間をゆっくり浮遊する小さな光点 | Fusion: pEmitter + pTurbulence + pRender | 奥行き、被写界深度、逆光 |
| `P-02` | 砂埃・煙の噴き上げ | 地面や対象の一部から舞い上がる | Fusion＋素材: pEmitter + pTurbulence / 合成 | 体積感と遮蔽 |
| `P-03` | 火の粉／エンバー | 不規則に上昇する橙色の小粒 | Fusion: pEmitter + Force + Color Over Life | 燃焼体の発光、粒子サイズ |
| `P-04` | 雨・雪の降下 | 画面手前と奥に粒が異なる速さで降る | Fusion: pEmitter + pDirectionalForce / 3D | 遠近・ブラー・積雪は別処理 |
| `P-05` | 魔法の光跡／きらめき | 動く点から粒子や細い軌跡が流れる | Fusion: pEmitter + Tracker / Trails | 粒子の発生位置を動きに追従 |
| `P-06` | 花火・衝撃波パーティクル | 中心から放射状に広がり消える | Fusion: pEmitter + pSpawn + pFriction | 爆発段階の時間差 |
| `P-07` | 紙吹雪・破片の降下 | 薄いカード状の粒が回転して落ちる | Fusion: Bitmap粒子 / 3D、必要ならBlender | 裏面の見え方と回転 |
| `P-08` | 泡・水滴・しぶき | 飛散・結合する大小の球形の粒 | Fusion: pEmitter + Blob/Bitmap、流体は外部 | 屈折・水滴の合体 |
| `P-09` | 霧・雲・ボリュームの漂い | 複数層の霞が距離によって変化 | Fusion: Fast Noise多層合成 / 3D粒子 / Volume | 深度と遮蔽、実体積との違い |

## C — 実写合成・トラッキング（9件）

見た目の演出と、素材を画面へ固定・統合する処理の両方を集める。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `C-01` | スマホ／看板画面差し替え | 撮影内のディスプレイ表示だけ別映像にする | Fusion: Planar Tracker → Planar Transform → Merge | 反射・手前の遮蔽 |
| `C-02` | 空・背景の置換 | 元の空だけ別の空へ差し替える | Fusion: Magic Mask/Keyer + Merge + Tracking | 木枝・髪・半透明部分 |
| `C-03` | 人物のみ消失／テレポート | 人だけ消え、元の背景が残る | Fusion: Magic Mask + Clean Plate / Object Removal | 元背景の再構成と接地影 |
| `C-04` | 物体除去／不要物消し | 電線・看板・人物などを自然に消去 | Fusion: Paint / Object Removal + Tracking | 背景の動きとパララックス |
| `C-05` | 空間に固定された文字／HUD | カメラが動いても文字が路面や壁に留まる | Fusion: Planar Tracker / Camera Tracker + Text | 平面と3Dの選択 |
| `C-06` | 人物クローン／同時に複数人 | 同一人物を画面内に複製する | Fusion: Roto/Mask + Merge + Tracking | 影・視線・重なり |
| `C-07` | カメラトラックによるCG追加 | 実写のカメラ運動にCGの遠近感を合わせる | Fusion: Camera Tracker + Renderer 3D / USD | スケール・照明・レンズ |
| `C-08` | ダブルエクスポージャー | 人物の内部に別映像や風景を重ねる | Fusion: Magic Mask + Merge/Operator | エッジ、RGB/Alphaの扱い |
| `C-09` | 発光エネルギー・ビーム合成 | 手・目・オブジェクトから光線が放たれる | Fusion: Paint/Shape + Glow + Tracker / Rays | 発生位置、背景への光の回り込み |

## M — 時間・動き・残像（8件）

物体の移動と、映像の時刻を加工する表現は切り分ける。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `M-01` | エコー／残像トレイル | 動く人物や物体の後ろに過去フレームが残る | Fusion: Trails / Time系 | 残像の周期と減衰 |
| `M-02` | ストップモーション／コマ落ち | 少ない更新フレームでカクついた動きを作る | Edit/Fusion: 時間サンプリング制御 | AE Posterize Timeとの適用範囲差 |
| `M-03` | モーションブラー強調 | 移動物が引き伸び、速度を強く感じさせる | Fusion: Vector Motion Blur / Directional Blur | 速度情報・マスク・前後の歪み |
| `M-04` | カメラシェイク／手持ち風 | 小刻みに画面が揺れ、撮影感が増す | Fusion: Camera Shake | ブラー、余白不足 |
| `M-05` | タイムフリーズ／分身 | 特定時刻の人物を静止させ、現在の動きと重ねる | Fusion: Time Stretcher / Merge / Mask | フリーズ前後の動きと背景 |
| `M-06` | スピードランプ／急加減速 | 動きの速度が一瞬で落ち、再び加速する | Edit: Retime Curve / Optical Flow | 画素補間・モーションベクトル破綻 |
| `M-07` | スリットスキャン／時間スライス | 画面の場所ごとに別の時刻を表示する | Fusion: Time系 + スライスマスク（構成案） | 行・列ごとのタイムオフセット |
| `M-08` | 繰り返す無限ループ | 映像や図形が繋がったまま同じ動きを続ける | Fusion: Time/Expression + Merge | 継ぎ目、周期と位相 |

## R — 3D・物理・素材変形（7件）

Fusionの合成だけで完結させず、物理シミュレーションが必要ならBlender等を分離。

| ID | 表現 | できあがる見た目 | 試す構成（仮説） | 特に確認すること |
| --- | --- | --- | --- | --- |
| `R-01` | ガラス粉砕／シャッター破壊 | 割れたガラス片が反射しながら飛ぶ | 併用推奨: Blenderで破砕/照明 → Fusion合成 | 厚み・屈折・反射・遮蔽 |
| `R-02` | 建造物・壁の崩壊 | 巨大な塊が破壊され粉塵が出る | 併用推奨: Blender Rigid Body → Fusion粒子/合成 | 破片数、瓦礫接地、粉塵 |
| `R-03` | 液体へ溶ける／滴る | 文字や物体が液体化して落ちる | Fusion: Drip/Displaceで2D近似、流体は外部 | 粘性・流量・立体的な液面 |
| `R-04` | 布が崩れてほどける | 布のようにたわみ、糸片へ分解する | 併用推奨: Blender Cloth/Geometry Nodes | 布の衝突・繊維表現 |
| `R-05` | 金属・ガラス材質への変換 | 色や粗さが変わり硬い素材に見える | Fusion: 3D Material/Light、実メッシュは外部 | 法線・反射・照明の整合 |
| `R-06` | 投影マッピング・セット拡張 | 現実の壁や地面にCG/別映像を投影 | Fusion: Camera Tracker + Image Plane 3D/Projector | ジオメトリ精度・影・撮影レンズ |
| `R-07` | 奥行きを持つ煙・光芒 | 3D空間に霧や光の筋が伸びる | Fusion: 3D particle / Rays / 外部Volume素材 | Z遮蔽、レイマーチングとの違い |

## どう検証するか

各IDについて、①意図するBefore/After、②出典とNative/OFX/外部の境界、③21.1の最小構成、④1つの主要パラメータを変えた比較、⑤レンダー・画質・処理負荷、⑥失敗例を揃えます。実機動画・画像が無ければ「検証済み」にはしません。

本表には**「再現できる」との確定判定も、「全部がFusion標準だけで可能」との主張も含まれません**。トラッキング、人物切り抜き、流体、物理演算、圧縮コーデック依存効果では外部素材や他アプリの方が合理的な場合があります。

## 参考資料と適用範囲

- Blackmagic Design、*DaVinci Resolve 21.1 Reference Manual*（2026年9月）。Fusion: Chapter 86 Particle Systems、Chapter 94 Composite Nodes、Chapter 103 Generator Nodes、Chapter 108 Mask Nodes、Chapter 109 Matte Nodes、Chapter 114 Particle Nodes、Chapter 119 Tracking Nodes、Chapter 120 Transform Nodes、Chapter 123 Warp Nodesなど。**個別Nodeの役割を示す一次資料**であり、表の全レシピ完成を保証する資料ではありません。
- Adobe公式の[After Effectsエフェクト一覧](https://helpx.adobe.com/jp/after-effects/desktop/apply-effects-and-animation-presets/effects-and-animation-presets/effect-list.html) と[シミュレーションエフェクト](https://helpx.adobe.com/jp/after-effects/desktop/apply-effects-and-animation-presets/list-of-effects/simulation-effects.html)。**表現の名前と比較対象を整理するための資料**であり、Fusionとの一対一の互換性を示しません。
- [HeyYo CG: スクリーンスペース×StencilによるDissolve](https://heyyocg.link/en/ue5-screenspace-dissolve-overview/)（2026-10-20）。**D-01の技術発想**。Niagara/UE5特有の処理はFusionへそのまま移植できません。
- [Blackmagic Design: Fusion公式紹介](https://www.blackmagicdesign.com/jp/products/davinciresolve/fusion)。3D/平面トラッキング、合成、モーショングラフィックスの大枠の機能確認用。

対象資料確認日: 2026-10-23。新しく発見した表現は既存IDを再利用・改名せず、分類と同一目的を照合して追記してください。
