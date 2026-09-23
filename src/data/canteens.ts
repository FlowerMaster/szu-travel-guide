export type Canteen = {
  id: string
  name: string
  area: string
  image: string
  imageAlt: string
  summary: string
  dishes: string[]
  note: string
  sources: Array<{ label: string; url: string }>
}

export const canteens: Canteen[] = [
  {
    id: 'litian',
    name: '荔天餐厅',
    area: '粤海校区 · 斋区',
    image: '/assets/food/litian-environment-ai.png',
    imageAlt: '荔天餐厅环境示意图',
    summary: '在粤海校区斋区，适合游览途中停下来吃一顿。',
    dishes: ['盖浇饭', '自选菜'],
    note: '可选择的窗口和菜品以到店所见为准。',
    sources: [
      { label: '小红书：深圳大学食堂点餐攻略', url: 'https://www.xiaohongshu.com/search_result/6a943692000000002a033f41' },
    ],
  },
  {
    id: 'tingli',
    name: '听荔餐厅',
    area: '粤海校区 · 西北区',
    image: '/assets/food/tingli-environment-ai.png',
    imageAlt: '听荔餐厅环境示意图',
    summary: '位于粤海校区西北区，可在游览图书馆和广场时顺路用餐。',
    dishes: ['盖浇饭', '自选菜', '小吃点心'],
    note: '可选择的窗口和菜品以到店所见为准。',
    sources: [
      { label: '小红书：深圳大学食堂点餐攻略', url: 'https://www.xiaohongshu.com/search_result/6a943692000000002a033f41' },
      { label: '抖音：深圳大学粤海周围平价推荐', url: 'https://www.douyin.com/search/深圳大学%20听荔餐厅' },
    ],
  },
  {
    id: 'tingshan',
    name: '听山餐厅',
    area: '粤海校区 · 西南区',
    image: '/assets/food/tingshan-environment-ai.png',
    imageAlt: '听山餐厅环境示意图',
    summary: '位于粤海校区西南区，有熟食窗口与用餐空间。',
    dishes: ['椰子鸡', '叉烧煲仔饭', '家常菜'],
    note: '这些是曾被介绍的口味，点餐请看现场窗口。',
    sources: [
      { label: '小红书：深大饭堂之听山吃后感', url: 'https://www.xiaohongshu.com/search_result/6a604087000000001002adc5' },
      { label: '抖音：深圳大学 听山餐厅', url: 'https://www.douyin.com/search/深圳大学%20听山餐厅' },
      { label: '深圳大学后勤：听山餐厅-椰子鸡', url: 'https://hqb.szu.edu.cn/info/1031/2103.htm' },
    ],
  },
  {
    id: 'south-floor-three',
    name: '南区餐厅三楼',
    area: '粤海校区 · 南区',
    image: '/assets/food/south-floor-three-environment-ai.png',
    imageAlt: '南区餐厅三楼环境示意图',
    summary: '位于粤海校区南区，可以在逛完南侧校园后安排用餐。',
    dishes: ['三汁焖锅', '麻辣烫', '烧腊', '陕西面', '鸡公煲', '小炒'],
    note: '这些是曾被分享的口味，点餐请看现场窗口。',
    sources: [
      { label: '小红书：深大南区三楼常吃推荐', url: 'https://www.xiaohongshu.com/search_result/69b404490000000021007537' },
      { label: '小红书：深大南区美食攻略（校外篇）', url: 'https://www.xiaohongshu.com/search_result/6a982e620000000028038aa1' },
    ],
  },
]
