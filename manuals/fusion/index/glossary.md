---
title: Glossary
description: Fusion Manual内で使う主要用語の短い定義とcanonical owner。
doc_type: index
verification: partial
product_scope: fusion
tasks: [lookup-term]
---

# Glossary

| Term | Short definition | Canonical page |
|---|---|---|
| Alpha | Imageが合成へ寄与する度合いを持つchannel | [Alpha](../learn/04-compositing/alpha) |
| Background | Mergeで合成の基準になるImage role | [Foreground / Background / Mask](../learn/04-compositing/foreground-background-mask) |
| Data domain | Flowを流れるtyped dataの種類 | [Data domainを辿る](../learn/07-debugging/trace-data-domain) |
| DoD | 実際に有効pixelが存在する領域 | [Domain of Definition](../learn/03-space/domain-of-definition) |
| Effect Mask | Nodeのeffect適用範囲を制限するMask inputの役割 | [Image / Mask / Data](../learn/02-data/image-mask-data) |
| Flow | Nodeとconnectionで構成されるGraph | [Graphとして考える](../learn/01-flow/graph-as-flow) |
| Foreground | MergeでBackgroundへ重ねるImage role | [Foreground / Background / Mask](../learn/04-compositing/foreground-background-mask) |
| Instance | 複数Node間でparameter settingsを共有する関係 | [Instance](../learn/06-reuse/instances) |
| Macro | Graphを公開interface付きの再利用単位へbundle化する仕組み | [Macro / Template](../learn/06-reuse/macros-templates) |
| Mask | effect範囲などを空間的に制御するdata | [Image / Mask / Data](../learn/02-data/image-mask-data) |
| Modifier | parameter valueを別data / procedureから供給する層 | [Modifier / Parameter Sources](../learn/05-time/modifier-parameter-sources) |
| Node | Flow上でdataを生成・処理・結合するTool / Operator | [Graphとして考える](../learn/01-flow/graph-as-flow) |
| Normalized Coordinates | frame/reference sizeに対するrelative coordinateの考え方 | [Normalized Coordinates](../learn/03-space/normalized-coordinates) |
| Premultiplication | RGBとAlphaの保存関係 | [Premultiplication](../learn/04-compositing/premultiplication) |
| RoI | rendererが今回計算を要求する領域 | [Domain of Definition](../learn/03-space/domain-of-definition) |
| User Control | internal parameterを意味あるpublic controlへまとめるinterface | [User Controls](../learn/06-reuse/user-controls) |

短い定義だけを置き、詳細説明はcanonical pageへ戻します。
