"""Insert reviewed capture sections into existing local articles. No network publication."""
import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((root/'docs/fusion-screenshot-candidates.json').read_text(encoding='utf-8'))
cases={
'S04':('Shapeを画像へ変換する','sEllipseのWidthを0.5、Heightを0.28にし、sRenderへ接続しました。Inspectorの自動解像度を有効にした状態で1920×1080が表示され、右Viewerには横長の白い楕円が出ています。','sEllipse → sRender → MediaOut','sRenderのImageタブ。1920×1080、自動解像度とDepthの表示','sRenderによって画像化された白い楕円'),
'S05':('同じ2形状でUnionとSubtractを比べる','円のWidth / Heightは0.5、X Offsetは−0.10です。星は5点、Width / Heightは0.4、X Offsetは0.16にしました。同じ円と星を2つのsBooleanへ送り、左はUnion、右はSubtractで画像化しています。SubtractのInput1は円、Input2は星です。右では円と星が重なった部分が欠けています。Inspectorの「差集合」はSubtractに対応します。IntersectionとXorの出力比較は未確認です。','sEllipse + sStar → sBoolean → sRender。上段Union、下段Subtract','sBooleanのエフェクトを差集合にしたInspector','左はUnionで一体化した円と星、右はSubtractで星の部分を除いた円'),
'S06':('四隅を見ながら位置・大きさ・回転を変える','同梱のテストチャートをLoaderで読み込み、TransformのCenterを0.65 / 0.55、Pivotを0.5 / 0.5、Sizeを1.25、Angleを12にしました。左が入力、右が変換後です。右ではTR・BR側が画面外へ出て、グリッドと文字が回転しています。緑の枠とハンドルは編集用Controlです。','Loader → Transform → MediaOut','TransformのCenter、Pivot、Size 1.25、Angle 12','同一チャートの変換前と移動・拡大・回転後'),
'S07':('楕円の内側だけをぼかす','チャートを2つのBlurへ送り、どちらもBlur Sizeを20、Blendを1にしました。右側のBlurだけ、青いEffect Mask入力へEllipseを接続します。EllipseのCenterは0.5 / 0.5、Widthは0.55、Heightは0.5、Soft Edgeは0.02です。左は全体がぼけ、右は楕円の外のグリッドと四隅が鮮明に残ります。緑の楕円は編集用の範囲表示です。Invertの出力比較は未確認です。','Loaderを2つのBlurへ分岐。Ellipseは右のBlurの青い入力へ接続','EllipseのCenter、Width、Height、Soft Edge、InvertのInspector','左はマスクなしのBlur、右はEllipse Maskで範囲を限定したBlur'),
'S08':('2行タイトルに塗りとアウトラインを付ける','Text+へ「COLLECTANEA」「FUSION 21.1」の2行を入力し、Arial Bold、Size 0.1にしました。ShadingのElement 1は白い塗り、Element 2はRed Outlineを有効にし、太さ0.02で赤い縁取りを表示しています。実機のTextタブとShadingタブをそれぞれ撮影しました。','Text+ → MediaOut','Text+の2行のStyled Text、Arial Bold、Size 0.1','白い塗りと赤いアウトラインを持つ2行タイトル'),
'S09':('粒子の生成と時間変化を確かめる','pEmitterのRandom Seedを7、Numberを3、Lifespanを80、Velocityを0.002にしました。StyleはBlob、Sizeは3、RegionはSphere、Region Sizeは0.55です。pRenderを2Dにして画像化します。下のフレーム0では3粒、フレーム48では蓄積した多数の白い粒子が見えます。赤い円はRegionの操作用Controlです。Numberは画面内の総粒子数と同じではありません。小さすぎるSizeでは40%表示で粒子を判別できなかったため、この例では読める大きさに調整しています。','pEmitter → pRender（2D）→ MediaOut','pEmitterのRandom Seed 7、Number 3、Lifespan 80、Velocity 0.002','フレーム48のpRender出力。白いBlob粒子が多数表示される'),
'S10':('移動する面を追跡して文字を合成する','専用の120フレーム連番をLoaderで読み込みました。1920×1080、24fps、各フレームでチャートを右へ3px移動させた素材です。フレーム0で中央の文字と周囲を四角く囲み、Operation ModeをTrack、TrackerをPoint、Motion TypeをTranslation、Track ChannelをLumaにして前方解析しました。Create Planar Transformから作ったNodeへ黄色いTRACKED文字を接続し、元の連番へMergeしています。フレーム60では素材の180pxの移動に文字も追従します。変形・遠近変化・実写の遮蔽への頑健性は未確認です。','LoaderをPlanar TrackerとMergeの背景へ分岐。Text+ → Planar Transform → Mergeの前景','Planar TrackerのTrack、Point、Translation、Lumaと解析ボタン','フレーム60。右へ移動したテスト面に黄色いTRACKED文字が追従した結果'),
'S11':('3D Viewerとカメラからの描画を見分ける','球、Camera 3D、Point LightをMerge 3Dへ接続し、Renderer 3DをSoftware Renderer、Lighting有効で描画しました。CameraのZは7、Point LightのX / Y / Zは2 / 2 / 3です。左はMerge 3Dの操作用ビュー、右はCameraから描画した2D Imageです。右では照明による明暗が付き、操作用グリッドは画像に入りません。左右は同じカメラのBefore / Afterではありません。OpenGL、影、全補助チャンネルは未確認です。','Shape 3D + Camera 3D + Point Light → Merge 3D → Renderer 3D → MediaOut','Renderer 3DのSoftware RendererとLighting有効のInspector','左は3Dシーン操作ビュー、右はSoftware Rendererがカメラから描いた球'),
'S12':('USDのカプセルをStormで描画する','uShapeのCapsuleをuMergeからuRendererへ渡し、Renderer TypeはStorm、CameraはDefault、LightingはCamera、AOVはcolorで確認しました。実機Viewerには陰影の付いたカプセルが表示されています。AOVメニューではcolor、primId、depth、cameraDepth、Neyeを観測しましたが、Depth等の出力内容と精度は今回の確認範囲に含めません。','uShape → uMerge → uRenderer → MediaOut','uRendererのStorm、Default Camera、color AOV、Camera Lighting','Stormで描画したUSDカプセルのColor出力'),
'S13':('文字・細い線・ドットでBlurを比べる','同梱チャートを読み込み、Fast Gaussian、Lock X/Y有効、Blur Size 10、Blend 1で比較しました。左は入力、右はBlur後です。細いグリッドとドットの輪郭が弱まり、中央の文字が読みにくくなる一方、大きな色面は残っています。他FilterやClipping Modeの違いは未確認です。','Loader → Blur → MediaOut','BlurのFast Gaussian、Blur Size 10、Clipping Mode、Blend 1','同じテストチャートのBlur前とBlur Size 10の結果'),
'S14':('彩度とゲインでチャートがどう変わるかを見る','Color CorrectorのMasterを選び、Saturationを0.3、RGB Gainを1.15にしました。左は入力、右は補正後です。右の色面は彩度が下がり、明るいグレーは白に近づいています。InspectorにはColorsとRGBの階調Controlを表示しています。この比較は同じプロジェクト・同じViewer条件での見た目の確認です。測色、Histogram Match、全Rangeとメニューの出力は未確認です。','Loader → Color Corrector → MediaOut','Color CorrectorのMaster、Saturation 0.3、RGB Gain 1.15','同じチャートの補正前と彩度低下・ゲイン増加後'),
}
def img(case,slug,alt):
 path=f'/img/fusion/captures/{case}/{slug}.png'
 return f'[![{alt}]({path})]({path})'
for case,(title,body,graph,inspector,result) in cases.items():
 candidate=next(x for x in data['candidates'] if x['id']==case)
 p=root/candidate['article'];text=p.read_text(encoding='utf-8')
 if '<!-- capture:'+case+' -->' in text:continue
 folder=root/'static/img/fusion/captures'/case
 assert (folder/'capture.json').exists()
 comparison=(folder/'compare.png').exists();slug='compare' if comparison else 'result'
 frame='48（別カットは0）' if case=='S09' else '0と60' if case=='S10' else '0'
 section=f'<!-- capture:{case} -->\n## 実機で{title}\n\nDaVinci Resolve Studio 21.1.0.14、Windows、日本語UI。1920×1080、フレーム{frame}で撮影しました。画像を開くと原寸で確認できます。\n\n{img(case,"graph",graph)}\n\n{body}\n\n{img(case,"inspector",inspector)}\n\n'
 if case=='S08':section+=img(case,'node','Text+の2D Image出力端子')+'\n\n'+img(case,'shading','ShadingのElement 2、Red Outline、太さ0.02と赤色')+'\n\n'
 if case=='S09':section+=img(case,'region','pEmitterのRegion。Sphere、Size 0.55')+'\n\n'+img(case,'frame0','フレーム0の同じParticle Graph。白い粒子が3個')+'\n\n'
 if case=='S10':section+=img(case,'region','フレーム0で描いたPlanar Trackerの追跡範囲')+'\n\n'+img(case,'reference','フレーム0の合成。TRACKED文字の基準位置')+'\n\n'
 section+=img(case,slug,result)+'\n\n'
 if case!='S11':section+='Viewer倍率は40%です。市松模様は透明部分を示します。\n\n'
 if case in ['S06','S07','S13','S14']:
  section+='[テストチャート](/img/fusion/captures/_fixtures/chart.png)をLoaderで読み込めます。GraphのLoaderは `Comp:/../_fixtures/chart.png` を参照します。\n\n'
 if case=='S10':section+='再現時は `python scripts/create-fusion-chart.py --sequence` で連番を生成します。GraphのLoaderは `Comp:/../_fixtures/plate/frame0000.png` を参照します。追跡データはGraphへ保存済みです。\n\n'
 section+=f'[再現用Graph](/img/fusion/captures/{case}/fixture.comp) · [撮影条件と確認範囲](/img/fusion/captures/{case}/capture.json)\n\n'
 text=text.replace('## 出典と確認範囲',section+'## 出典と確認範囲',1)
 if case=='S04':text=text.replace('内部REGID、Edition差、実機結果は未確認','上記の実機例ではREGID `sRender` と楕円の画像化を確認しました。Edition差と全設定の実機結果は未確認')
 if case=='S07':text=text.replace('内部REGID、全Viewer shortcut','実機のREGIDは `EllipseMask` でした。全Viewer shortcut')
 p.write_text(text,encoding='utf-8')
print('Inserted',', '.join(cases))
