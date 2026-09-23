import type { Route } from '../types'

export const routes: Route[] = [
  {
    id: 'classic', title: '经典参观', subtitle: '粤海进，沧海出，第一次来更顺', durationLabel: '约 3-4 小时',
    description: '用一条连续路线看校园、湖景、餐饮和洞洞楼，减少回头路。',
    placeIds: ['north-gate', 'library-south', 'tianren-square', 'wenshan-lake-upper', 'tingli-restaurant', 'alumni-square', 'zhiyi-building'],
    transportNote: '从北门出发时，可看看校园小巴的现场线路。',
  },
  {
    id: 'photo', title: '拍照出片', subtitle: '把最值得拍的节点串起来', durationLabel: '约 2 小时',
    description: '从入口、湖景、广场到洞洞楼，适合第一次做校园 Citywalk。',
    placeIds: ['lide-gate', 'wenshan-lake-upper', 'tianren-square', 'time-square', 'zhiyi-building'],
    transportNote: '想拍洞洞楼外立面，可以把它放在光线柔和的时段。',
  },
  {
    id: 'family', title: '亲子遛娃', subtitle: '少走冤路，留出吃饭和休息', durationLabel: '半天',
    description: '先用校园小巴了解空间，再选择美术馆、湖边和食堂等低压力节点。',
    placeIds: ['north-gate', 'tianren-square', 'wenshan-lake-upper', 'tingli-restaurant', 'alumni-square'],
    transportNote: '亲子路线优先安排遮阴、补给和可随时退出的节点。',
  },
  {
    id: 'walk', title: '安静散步', subtitle: '把深大当成一段城市绿道', durationLabel: '约 1.5-2 小时',
    description: '降低打卡密度，留出树荫、湖边和校园日常。',
    placeIds: ['lide-gate', 'litchi-grove', 'wenshan-lake-lower', 'alumni-square', 'time-square'],
    transportNote: '这条线不追求覆盖更多地点，走累了随时从地图切换到其他节点。',
  },
  {
    id: 'architecture', title: '人文建筑', subtitle: '看空间关系，不只找网红点',
    description: '把档案馆、汇星楼、校友广场和时光广场放在一条建筑观察线里。',
    placeIds: ['north-gate', 'archives', 'huixing-building', 'alumni-square', 'time-square'],
    transportNote: '建筑内部权限与校园预约分开，当前以外部观察为主。',
  },
  {
    id: 'free', title: '自由探索', subtitle: '不选路线，直接点地图',
    description: '保留完整地点库，你可以从任意入口开始，按自己的节奏探索。',
    placeIds: [],
    transportNote: '点选地图地点，按自己的节奏逛。',
  },
]
