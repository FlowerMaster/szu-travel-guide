export type NearbyRoute = {
  id: string
  gate: string
  destination: string
  type: string
  route: string
  description: string
  tip: string
  mapName: string
}

export const nearbyRoutes: NearbyRoute[] = [
  {
    id: 'northeast-snacks',
    gate: '东北门出校',
    destination: '东北门附近小吃街',
    type: '傍晚小吃',
    route: '从东北门出校后，打开地图搜索附近小吃街，按步行导航前往。',
    description: '凉皮凉面、烧烤炸串、果切饮品、糖水、炒粉和饼类集中出现，适合把校园散步接成夜宵线。',
    tip: '小吃摊营业情况可能变化，出发前看看地图。',
    mapName: '深圳大学东北门附近小吃街',
  },
  {
    id: 'guimiao',
    gate: '北门 / 粤海校区出校',
    destination: '桂庙新村',
    type: '平价吃喝',
    route: '校园游览结束后从北门接入桂庙新村生活街区，适合边走边选。',
    description: '深大学生高频提到的校外吃饭区域，适合寻找小店、小吃和夜间补给。',
    tip: '想找小店，可以到附近后边逛边选。',
    mapName: '桂庙新村',
  },
  {
    id: 'mixc-world',
    gate: '北门 / 立功门出校',
    destination: '万象天地',
    type: '商业逛吃',
    route: '从北门出校后向东接城市商业线，适合把深大半日游延长成下午活动。',
    description: '咖啡、餐饮、展览和购物集中，适合与朋友结伴逛逛、顺路拍照。',
    tip: '想看展览，可先查看场馆开放信息。',
    mapName: '深圳万象天地',
  },
  {
    id: 'houhai-mixc',
    gate: '沧海校区 / 深大南站方向',
    destination: '深圳湾万象城',
    type: '亲子 / 拍照',
    route: '从沧海校区结束后接深大南站与后海商圈方向，适合继续逛吃。',
    description: '商业空间、城市展陈、亲子体验和餐饮选择更集中，适合作为校园路线的外延终点。',
    tip: '带孩子出行，可优先选室内活动和休息点。',
    mapName: '深圳湾万象城',
  },
  {
    id: 'talent-park',
    gate: '沧海校区 / 深大南站方向',
    destination: '人才公园',
    type: '夜景散步',
    route: '从后海商圈继续向水岸方向走，适合把晚餐和夜景接在一起。',
    description: '适合吹风、看城市夜景和拍水岸照片，节奏比商场更松。',
    tip: '建议把它放在下午或傍晚，不要和校园暴晒时段重叠。',
    mapName: '深圳人才公园',
  },
  {
    id: 'bay-park',
    gate: '沧海校区 / 深大南站方向',
    destination: '深圳湾公园',
    type: '海边散步',
    route: '校园参观结束后转向深圳湾一带，适合骑行、散步和看海。',
    description: '想吹海风、散步或骑行，可以把这里作为校园游览后的延伸。',
    tip: '更适合天气舒服的下午和傍晚，雨天需要切换室内方案。',
    mapName: '深圳湾公园',
  },
]
