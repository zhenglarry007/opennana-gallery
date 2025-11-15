const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractPreciseOpenNanaData() {
  const browser = await puppeteer.launch({ 
    headless: true, // 使用无头模式提高速度
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  const extractedData = [];
  
  try {
    console.log('导航到 OpenNana 画廊...');
    await page.goto('https://opennana.com/awesome-prompt-gallery/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('分析页面结构...');
    
    // 首先分析页面结构，找到卡片元素
    const pageStructure = await page.evaluate(() => {
      const structure = {
        cards: [],
        selectors: {
          cardContainer: '',
          titleElement: '',
          imageElement: '',
          clickableElement: ''
        }
      };
      
      // 尝试多种选择器组合来找到卡片
      const cardSelectors = [
        '.card',
        '[class*="card"]',
        '.gallery-item',
        '[class*="gallery"]',
        'img[src*="images/"]'
      ];
      
      // 查找卡片容器
      for (const selector of cardSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 10) { // 找到足够数量的元素
          console.log(`找到 ${elements.length} 个卡片使用选择器: ${selector}`);
          
          // 分析第一个卡片来确定结构
          const firstCard = elements[0];
          const cardContainer = firstCard.closest('div, article, section, li');
          
          if (cardContainer) {
            structure.selectors.cardContainer = cardContainer.tagName.toLowerCase() + 
              (cardContainer.className ? '.' + cardContainer.className.split(' ').join('.') : '');
            
            // 查找标题元素
            const titleSelectors = ['.card-title', '[class*="title"]', 'h3', 'h2', 'h4', 'p strong'];
            for (const titleSel of titleSelectors) {
              const titleEl = cardContainer.querySelector(titleSel);
              if (titleEl) {
                structure.selectors.titleElement = titleSel;
                break;
              }
            }
            
            // 查找图片元素
            const imgEl = cardContainer.querySelector('img');
            if (imgEl) {
              structure.selectors.imageElement = 'img';
            }
            
            // 查找可点击元素
            const clickableEl = cardContainer.querySelector('a') || cardContainer;
            if (clickableEl) {
              structure.selectors.clickableElement = clickableEl.tagName.toLowerCase() + 
                (clickableEl.className ? '.' + clickableEl.className.split(' ').join('.') : '');
            }
          }
          
          // 收集所有卡片的基本信息
          elements.forEach((element, index) => {
            const container = element.closest('div, article, section, li');
            if (container) {
              const titleEl = container.querySelector(structure.selectors.titleElement);
              const imgEl = container.querySelector('img');
              
              const cardInfo = {
                index,
                title: titleEl ? titleEl.textContent.trim() : '',
                imageUrl: imgEl ? imgEl.src : '',
                imageAlt: imgEl ? imgEl.alt : '',
                elementSelector: structure.selectors.cardContainer
              };
              
              // 提取案例编号
              const caseMatch = cardInfo.title.match(/案例\s*(\d+)/);
              if (caseMatch) {
                cardInfo.caseNumber = parseInt(caseMatch[1]);
              }
              
              structure.cards.push(cardInfo);
            }
          });
          
          break;
        }
      }
      
      return structure;
    });
    
    console.log(`找到 ${pageStructure.cards.length} 个卡片`);
    console.log('页面结构:', pageStructure.selectors);
    
    // 限制处理数量进行测试
    const cardsToProcess = pageStructure.cards.slice(0, 50); // 先处理前50个
    console.log(`将处理前 ${cardsToProcess.length} 个卡片`);
    
    // 逐个处理卡片获取详细信息
    for (let i = 0; i < cardsToProcess.length; i++) {
      const card = cardsToProcess[i];
      console.log(`\n处理卡片 ${i + 1}/${cardsToProcess.length}: ${card.title}`);
      
      try {
        // 在新标签页中打开卡片链接
        const detailInfo = await page.evaluate(async (cardInfo) => {
          return new Promise((resolve) => {
            // 找到对应的卡片元素
            const cards = document.querySelectorAll(cardInfo.elementSelector);
            const targetCard = cards[cardInfo.index];
            
            if (!targetCard) {
              resolve({ error: '找不到卡片元素' });
              return;
            }
            
            // 查找可点击的元素（图片或链接）
            const clickableElement = targetCard.querySelector('img') || 
                                   targetCard.querySelector('a') || 
                                   targetCard;
            
            if (!clickableElement) {
              resolve({ error: '找不到可点击元素' });
              return;
            }
            
            // 创建新窗口打开详情页
            const detailUrl = clickableElement.href || window.location.href;
            const detailWindow = window.open(detailUrl, '_blank');
            
            // 等待新窗口加载
            setTimeout(() => {
              if (detailWindow && !detailWindow.closed) {
                try {
                  // 在新窗口中查找提示词信息
                  const prompts = [];
                  const promptSelectors = [
                    '[class*="prompt"]',
                    'textarea',
                    'pre',
                    'code',
                    '.prompt1',
                    '.prompt2',
                    '[id*="prompt"]'
                  ];
                  
                  promptSelectors.forEach(selector => {
                    const elements = detailWindow.document.querySelectorAll(selector);
                    elements.forEach(el => {
                      const text = el.textContent.trim();
                      if (text && text.length > 10 && !prompts.includes(text)) {
                        prompts.push(text);
                      }
                    });
                  });
                  
                  // 提取其他信息
                  const tags = [];
                  const tagSelectors = ['[class*="tag"]', '[class*="category"]'];
                  tagSelectors.forEach(selector => {
                    const elements = detailWindow.document.querySelectorAll(selector);
                    elements.forEach(el => {
                      const text = el.textContent.trim();
                      if (text && text.length < 20 && !tags.includes(text)) {
                        tags.push(text);
                      }
                    });
                  });
                  
                  detailWindow.close();
                  
                  resolve({
                    prompts,
                    tags,
                    url: detailWindow.location.href
                  });
                } catch (error) {
                  detailWindow.close();
                  resolve({ error: error.message });
                }
              } else {
                resolve({ error: '无法打开详情窗口' });
              }
            }, 3000);
            
          });
        }, card);
        
        // 创建完整的数据对象
        const completeCard = {
          id: card.caseNumber || card.index,
          caseNumber: card.caseNumber,
          title: card.title,
          titleEn: '', // 可以后续添加翻译
          description: card.title,
          imageUrl: card.imageUrl,
          imageAlt: card.imageAlt,
          categories: detailInfo.tags || [],
          prompt1: detailInfo.prompts && detailInfo.prompts[0] ? detailInfo.prompts[0] : '',
          prompt2: detailInfo.prompts && detailInfo.prompts[1] ? detailInfo.prompts[1] : '',
          allPrompts: detailInfo.prompts || [],
          tags: detailInfo.tags || [],
          language: 'bilingual',
          extractionDate: new Date().toISOString(),
          extractionStatus: detailInfo.error ? 'failed' : 'success',
          detailUrl: detailInfo.url
        };
        
        extractedData.push(completeCard);
        
        if (detailInfo.error) {
          console.log(`✗ 提取失败: ${detailInfo.error}`);
        } else {
          console.log(`✓ 成功提取: ${detailInfo.prompts ? detailInfo.prompts.length : 0} 个提示词`);
        }
        
        // 等待一下再处理下一个
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`✗ 处理卡片失败: ${card.title}`, error.message);
        extractedData.push({
          ...card,
          extractionStatus: 'failed',
          error: error.message
        });
      }
    }
    
    console.log(`\n提取完成！总共处理 ${extractedData.length} 个卡片`);
    
    return {
      metadata: {
        website: 'https://opennana.com/awesome-prompt-gallery/',
        extractionDate: new Date().toISOString(),
        totalCards: extractedData.length,
        successfulExtractions: extractedData.filter(c => c.extractionStatus === 'success').length,
        failedExtractions: extractedData.filter(c => c.extractionStatus === 'failed').length
      },
      cards: extractedData
    };
    
  } catch (error) {
    console.error('爬取过程中出错:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// 创建更新现有JSON文件的函数
async function updateExistingJson() {
  try {
    // 读取现有的JSON文件
    const existingDataPath = '/Users/larryzheng/Downloads/code/solo_build-/opennana-gallery/opennana-cards-1763198999682.json';
    const existingData = JSON.parse(fs.readFileSync(existingDataPath, 'utf8'));
    
    console.log(`读取现有数据: ${existingData.length} 个卡片`);
    
    // 提取新数据
    const newData = await extractPreciseOpenNanaData();
    
    // 合并数据 - 用新的prompt数据更新现有的卡片
    const updatedData = existingData.map(existingCard => {
      // 根据案例编号或标题找到对应的新数据
      const newCard = newData.cards.find(newCard => 
        (existingCard.caseNumber && newCard.caseNumber === existingCard.caseNumber) ||
        (existingCard.title && newCard.title === existingCard.title)
      );
      
      if (newCard && newCard.extractionStatus === 'success') {
        // 更新prompt数据
        return {
          ...existingCard,
          prompt: newCard.prompt1 || newCard.allPrompts[0] || existingCard.prompt,
          prompt1: newCard.prompt1,
          prompt2: newCard.prompt2,
          allPrompts: newCard.allPrompts,
          tags: newCard.tags,
          categories: newCard.categories,
          extractionStatus: 'updated',
          extractionDate: newData.metadata.extractionDate
        };
      }
      
      return {
        ...existingCard,
        extractionStatus: 'not_updated'
      };
    });
    
    // 保存更新后的数据
    const updatedFilename = 'opennana-cards-updated.json';
    fs.writeFileSync(updatedFilename, JSON.stringify(updatedData, null, 2));
    
    console.log(`\n数据更新完成！`);
    console.log(`更新后的数据已保存到: ${updatedFilename}`);
    console.log(`成功更新: ${updatedData.filter(c => c.extractionStatus === 'updated').length} 个卡片`);
    console.log(`未更新: ${updatedData.filter(c => c.extractionStatus === 'not_updated').length} 个卡片`);
    
    return updatedData;
    
  } catch (error) {
    console.error('更新现有数据失败:', error);
    throw error;
  }
}

// 主执行函数
async function main() {
  try {
    console.log('开始精确的 OpenNana 数据提取...');
    
    // 首先尝试更新现有数据
    const updatedData = await updateExistingJson();
    
    // 创建简化版本，只包含成功更新的数据
    const successfulUpdates = updatedData.filter(c => c.extractionStatus === 'updated');
    const simplifiedData = {
      metadata: {
        website: 'https://opennana.com/awesome-prompt-gallery/',
        extractionDate: new Date().toISOString(),
        totalCards: successfulUpdates.length,
        description: '精确提取的OpenNana提示词数据，包含完整的prompt1和prompt2'
      },
      prompts: successfulUpdates.map(card => ({
        id: card.id,
        caseNumber: card.caseNumber,
        title: card.title,
        titleEn: card.titleEn || '',
        description: card.description,
        prompt: card.prompt,
        prompt1: card.prompt1,
        prompt2: card.prompt2,
        allPrompts: card.allPrompts || [card.prompt1, card.prompt2].filter(p => p),
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt,
        categories: card.categories || card.tags || [],
        tags: card.tags || [],
        language: card.language || 'bilingual',
        extractionDate: card.extractionDate
      }))
    };
    
    const simplifiedFilename = 'opennana-prompts-final.json';
    fs.writeFileSync(simplifiedFilename, JSON.stringify(simplifiedData, null, 2));
    
    console.log(`\n最终提示词数据已保存到: ${simplifiedFilename}`);
    console.log(`包含 ${simplifiedData.prompts.length} 个完整提示词`);
    
  } catch (error) {
    console.error('主执行函数出错:', error);
    process.exit(1);
  }
}

// 运行爬虫
if (require.main === module) {
  main();
}

module.exports = { extractPreciseOpenNanaData, updateExistingJson };