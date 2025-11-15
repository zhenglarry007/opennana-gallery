export interface PromptCard {
  id: number;
  title: string;
  tags: string[];
  imageUrl: string;
}

export const categories = [
  '3d', 'animal', 'architecture', 'branding', 'cartoon', 'character', 'clay', 
  'creative', 'emoji', 'fashion', 'felt', 'food', 'futuristic', 'gaming', 
  'illustration', 'infographic', 'interior'
];

export const mockCards: PromptCard[] = [
  {
    id: 425,
    title: '案例 425：穿着充羽绒服的鸟儿',
    tags: ['nature', 'photography'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=nature%20photography%20bird%20wearing%20down%20jacket&image_size=square'
  },
  {
    id: 424,
    title: '案例 424：一个可爱的拟人化动物',
    tags: ['animal', 'cartoon', 'fashion', 'vehicle'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20anthropomorphic%20animal%20cartoon%20style&image_size=square'
  },
  {
    id: 423,
    title: '案例 423：高质量的全身肖像',
    tags: ['character', 'fashion', 'logo', 'nature'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=high%20quality%20full%20body%20portrait&image_size=square'
  },
  {
    id: 422,
    title: '案例 422：逼真的海量全身逼真人物',
    tags: ['character', 'fashion', 'futuristic', 'landscape'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=realistic%20full%20body%20character%20futuristic%20landscape&image_size=square'
  },
  {
    id: 421,
    title: '案例 421：超逼真的野生动物摄影场景',
    tags: ['animal', 'landscape', 'nature', 'photography'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=ultra%20realistic%20wildlife%20photography%20scene&image_size=square'
  },
  {
    id: 335,
    title: '案例 335：美丽的日本女子',
    tags: ['food', 'landscape', 'nature', 'photography'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20japanese%20woman&image_size=square'
  },
  {
    id: 334,
    title: '案例 334：全身夜景肖像',
    tags: ['branding', 'fashion', 'landscape', 'portrait'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=full%20body%20night%20portrait&image_size=square'
  },
  {
    id: 333,
    title: '案例 333：女生室内沙发上',
    tags: ['interior', 'illustration', 'minimalist', 'logo'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=girl%20on%20sofa%20indoor&image_size=square'
  },
  {
    id: 331,
    title: '案例 331：走廊上的女性',
    tags: ['character', 'interior', 'landscape', 'logo'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=woman%20in%20corridor&image_size=square'
  },
  {
    id: 330,
    title: '案例 330：照片级真实室内躺姿人物',
    tags: ['3d', 'cartoon', 'illustration', 'interior'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=photorealistic%20indoor%20lying%20pose%20character&image_size=square'
  },
  // Additional cards to ensure 5 per row display
  {
    id: 329,
    title: '案例 329：美女车拍肖像',
    tags: ['nature', 'portrait'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20woman%20car%20photography&image_size=square'
  },
  {
    id: 328,
    title: '案例 328：工作室风格照片',
    tags: ['nature', 'portrait', 'toy'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=studio%20style%20photo&image_size=square'
  },
  {
    id: 327,
    title: '案例 327：美女电影级肖像画',
    tags: ['landscape', 'minimalist', 'nature'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20portrait%20beautiful%20woman&image_size=square'
  },
  {
    id: 326,
    title: '案例 326：电影感街头美女摄影',
    tags: ['fashion', 'landscape', 'nature', 'photography'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20street%20photography%20beautiful%20woman&image_size=square'
  },
  {
    id: 325,
    title: '案例 325：未来主义建筑概念',
    tags: ['architecture', 'futuristic', '3d'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20architecture%20concept&image_size=square'
  },
  {
    id: 324,
    title: '案例 324：创意品牌设计',
    tags: ['branding', 'creative', 'logo'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=creative%20branding%20design&image_size=square'
  },
  {
    id: 323,
    title: '案例 323：卡通角色设计',
    tags: ['character', 'cartoon', 'illustration'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cartoon%20character%20design&image_size=square'
  },
  {
    id: 322,
    title: '案例 322：粘土风格艺术',
    tags: ['clay', '3d', 'creative'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=clay%20style%20art&image_size=square'
  },
  {
    id: 321,
    title: '案例 321：表情符号设计',
    tags: ['emoji', 'creative', 'illustration'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=emoji%20design%20creative&image_size=square'
  },
  {
    id: 320,
    title: '案例 320：毛毡材质艺术',
    tags: ['felt', 'creative', 'texture'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=felt%20material%20art&image_size=square'
  },
  {
    id: 319,
    title: '案例 319：食物摄影艺术',
    tags: ['food', 'photography', 'creative'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=food%20photography%20art&image_size=square'
  },
  {
    id: 318,
    title: '案例 318：游戏角色概念',
    tags: ['gaming', 'character', 'illustration'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=gaming%20character%20concept&image_size=square'
  },
  {
    id: 317,
    title: '案例 317：信息图表设计',
    tags: ['infographic', 'creative', 'design'],
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=infographic%20design&image_size=square'
  }
];