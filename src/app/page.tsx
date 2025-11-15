'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { simplifiedPrompts, categories } from '@/lib/simplified-data';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [layoutInfo, setLayoutInfo] = useState('加载中...');
  const [isClient, setIsClient] = useState(false);

  const filteredCards = simplifiedPrompts.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === '全部' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Debug layout information
  console.log('Total cards:', simplifiedPrompts.length);
  console.log('Filtered cards:', filteredCards.length);
  console.log('Screen width:', typeof window !== 'undefined' ? window.innerWidth : 'server');

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  // Calculate layout based on screen width
  const getLayoutInfo = () => {
    if (typeof window === 'undefined') return '服务器渲染';
    const width = window.innerWidth;
    if (width >= 1280) return '大屏桌面 (≥1280px): 5列';
    if (width >= 1024) return '中屏桌面 (≥1024px): 4列';
    if (width >= 768) return '小屏桌面 (≥768px): 3列';
    if (width >= 640) return '平板 (≥640px): 2列';
    return '移动端 (<640px): 1列';
  };

  // Client-side effect to update layout info
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true);
      setLayoutInfo(getLayoutInfo());
      
      const handleResize = () => {
        setLayoutInfo(getLayoutInfo());
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Grid Overlay */}
      {showGridOverlay && (
        <div className="grid-overlay show">
          <div className="grid grid-cols-5 h-full">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="grid-column relative">
                <div className="absolute top-4 left-2 bg-red-500 text-white text-xs px-1 rounded">列{i}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Layout Inspector - Visual debugging */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-50">
        <div className="font-bold mb-2">布局调试器</div>
        <div className="grid grid-cols-5 gap-1 mb-2">
          <div className="w-4 h-4 bg-blue-500 rounded text-center text-xs leading-4">1</div>
          <div className="w-4 h-4 bg-green-500 rounded text-center text-xs leading-4">2</div>
          <div className="w-4 h-4 bg-yellow-500 rounded text-center text-xs leading-4">3</div>
          <div className="w-4 h-4 bg-red-500 rounded text-center text-xs leading-4">4</div>
          <div className="w-4 h-4 bg-purple-500 rounded text-center text-xs leading-4">5</div>
        </div>
        <div>当前应有5列</div>
        <div className="text-xs opacity-75 mb-2">卡片数: {filteredCards.length}</div>
        <button 
          onClick={() => setShowGridOverlay(!showGridOverlay)}
          className="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
        >
          {showGridOverlay ? '隐藏' : '显示'}网格
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            OpenNana提示词图库
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            浏览、筛选模型提示词案例库，<br />
            快速复制提示词，探索灵感。
          </p>
        </header>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索关键词输入、标题或提示词..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-slate-600 text-gray-300 rounded-full hover:bg-slate-700 transition-colors"
            >
              清除筛选
            </button>
            <span className="text-gray-400 text-sm">
              共 {filteredCards.length}/{simplifiedPrompts.length} 个案例
            </span>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
            <button className="px-4 py-2 rounded-full text-sm bg-slate-700 text-gray-300 hover:bg-slate-600 transition-colors">
              展开
            </button>
          </div>
        </div>

        {/* Layout Debug Info */}
        <div className="mb-4 p-3 bg-slate-700 rounded-lg text-xs text-gray-300">
          <div>总卡片数: {simplifiedPrompts.length} | 过滤后: {filteredCards.length}</div>
          <div>布局: 移动端1列 → 平板2列 → 小屏桌面3列 → 中屏桌面4列 → 大屏桌面5列</div>
          <div className="mt-2 p-2 bg-slate-600 rounded">
            <strong>当前屏幕尺寸测试:</strong>
            <div className="grid grid-cols-5 gap-1 mt-1">
              <div className="bg-blue-500 h-2 rounded"></div>
              <div className="bg-green-500 h-2 rounded"></div>
              <div className="bg-yellow-500 h-2 rounded"></div>
              <div className="bg-red-500 h-2 rounded"></div>
              <div className="bg-purple-500 h-2 rounded"></div>
            </div>
            <div className="text-xs mt-1">以上彩色条应显示为5等分，验证5列布局</div>
            <div className="text-xs mt-1 text-blue-300">{isClient ? layoutInfo : '加载中...'}</div>
          </div>
        </div>

        {/* Cards Grid - Fixed 5 cards per row on desktop, responsive on smaller screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card, index) => (
            <div key={card.id} className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors cursor-pointer border border-slate-600">
              <div className="aspect-square bg-slate-700 relative">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                {/* Debug info on card */}
                <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                  #{card.id}
                </div>
                {/* Row and column position debug */}
                <div className="absolute top-1 left-1 bg-blue-500 bg-opacity-75 text-white text-xs px-1 rounded">
                  行{Math.floor(index / 5) + 1}列{(index % 5) + 1}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium mb-3 text-sm leading-tight">
                  {card.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-700 text-blue-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">没有找到匹配的案例</p>
          </div>
        )}
      </div>
    </div>
  );
}