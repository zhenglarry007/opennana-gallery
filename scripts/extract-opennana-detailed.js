const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractDetailedOpenNanaData() {
  const browser = await puppeteer.launch({ 
    headless: false, // 设置为非无头模式以便调试
    defaultViewport: { width: 1920, height: 1080 },
    slowMo: 100 // 添加延迟以便观察操作
  });
  
  const page = await browser.newPage();
  const allCards = [];
  
  try {
    console.log('导航到 OpenNana 画廊...');
    await page.goto('https://opennana.com/awesome-prompt-gallery/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 滚动页面加载所有内容
    await autoScroll(page);
    
    console.log('开始提取详细数据...');
    
    // 首先获取页面上所有卡片的初始信息
    const initialCards = await page.evaluate(() => {
      const cards = [];
      
      // 查找所有卡片元素 - 多种策略
      const cardSelectors = [
        '.card',
        '[class*="card"]',
        '.gallery-item',
        '[class*="gallery"]',
        'img[alt*="案例"]',
        'img[src*="images/"]'
      ];
      
      let cardElements = [];
      
      for (const selector of cardSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`找到 ${elements.length} 个元素使用选择器: ${selector}`);
          cardElements = Array.from(elements);
          break;
        }
      }
      
      // 如果没有找到，尝试基于图片查找
      if (cardElements.length === 0) {
        const images = document.querySelectorAll('img[src*="images/"]');
        console.log(`找到 ${images.length} 张图片`);
        
        images.forEach((img, index) => {
          // 找到图片的父元素作为卡片容器
          let cardContainer = img.parentElement;
          while (cardContainer && cardContainer !== document.body) {
            if (cardContainer.tagName === 'DIV' || cardContainer.tagName === 'ARTICLE' || cardContainer.className.length > 0) {
              break;
            }
            cardContainer = cardContainer.parentElement;
          }
          
          if (cardContainer) {
            cardElements.push(cardContainer);
          }
        });
      }
      
      console.log(`总共找到 ${cardElements.length} 个卡片元素`);
      
      // 提取每个卡片的基本信息
      cardElements.forEach((card, index) => {
        try {
          // 查找标题
          const titleSelectors = [
            '.card-title',
            '[class*="title"]',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p strong',
            '.case-title'
          ];
          
          let title = '';
          for (const selector of titleSelectors) {
            const titleEl = card.querySelector(selector);
            if (titleEl && titleEl.textContent.trim()) {
              title = titleEl.textContent.trim();
              break;
            }
          }
          
          // 如果还是没有标题，尝试从图片alt文本获取
          if (!title) {
            const img = card.querySelector('img');
            if (img && img.alt) {
              title = img.alt;
            }
          }
          
          // 查找图片
          const img = card.querySelector('img');
          const imageUrl = img ? img.src : '';
          const imageAlt = img ? img.alt : '';
          
          // 查找案例编号
          let caseNumber = null;
          const caseMatch = title.match(/案例\s*(\d+)/);
          if (caseMatch) {
            caseNumber = parseInt(caseMatch[1]);
          }
          
          cards.push({
            index,
            title,
            imageUrl,
            imageAlt,
            caseNumber,
            elementIndex: index,
            hasClickableElement: card.tagName === 'A' || card.onclick !== null || card.querySelector('a') !== null
          });
          
        } catch (error) {
          console.error(`处理卡片 ${index} 时出错:`, error);
        }
      });
      
      return cards;
    });
    
    console.log(`找到 ${initialCards.length} 个初始卡片`);
    console.log('前5个卡片:', initialCards.slice(0, 5));
    
    // 逐个点击卡片获取详细信息
    for (let i = 0; i < initialCards.length; i++) {
      const card = initialCards[i];
      console.log(`\n处理卡片 ${i + 1}/${initialCards.length}: ${card.title}`);
      
      try {
        // 在页面上找到对应的元素并点击
        const detailedInfo = await page.evaluate((cardInfo) => {
          return new Promise((resolve) => {
            // 查找对应的元素
            const findCardElement = () => {
              // 多种查找策略
              const strategies = [
                // 根据图片URL查找
                () => {
                  const img = document.querySelector(`img[src="${cardInfo.imageUrl}"]`);
                  return img ? img.closest('div, article, section') : null;
                },
                // 根据标题文本查找
                () => {
                  const titleElements = document.querySelectorAll('[class*="title"], h1, h2, h3, h4, h5, h6, p');
                  for (let el of titleElements) {
                    if (el.textContent.includes(cardInfo.title)) {
                      return el.closest('div, article, section');
                    }
                  }
                  return null;
                },
                // 根据案例编号查找
                () => {
                  if (cardInfo.caseNumber) {
                    const allElements = document.querySelectorAll('*');
                    for (let el of allElements) {
                      if (el.textContent.includes(`案例 ${cardInfo.caseNumber}`)) {
                        return el.closest('div, article, section');
                      }
                    }
                  }
                  return null;
                }
              ];
              
              for (let strategy of strategies) {
                const element = strategy();
                if (element) return element;
              }
              return null;
            };
            
            const cardElement = findCardElement();
            if (!cardElement) {
              resolve({ error: '找不到卡片元素' });
              return;
            }
            
            // 查找可点击的元素
            const clickableElement = cardElement.querySelector('a') || 
                                   cardElement.querySelector('[onclick]') || 
                                   cardElement.querySelector('img') ||
                                   cardElement;
            
            if (clickableElement) {
              // 模拟点击
              clickableElement.click();
              
              // 等待一段时间让内容加载
              setTimeout(() => {
                // 查找弹出的详细信息
                const detailSelectors = [
                  '.modal',
                  '.popup',
                  '[class*="detail"]',
                  '[class*="prompt"]',
                  '.overlay',
                  'dialog'
                ];
                
                let detailContainer = null;
                for (let selector of detailSelectors) {
                  const element = document.querySelector(selector);
                  if (element && element.style.display !== 'none') {
                    detailContainer = element;
                    break;
                  }
                }
                
                if (detailContainer) {
                  // 提取详细信息
                  const extractDetailInfo = () => {
                    const info = {
                      prompts: [],
                      fullDescription: '',
                      tags: [],
                      rawText: detailContainer.innerText
                    };
                    
                    // 查找提示词
                    const promptSelectors = [
                      '[class*="prompt"]',
                      '[class*="prompt1"]',
                      '[class*="prompt2"]',
                      'textarea',
                      'pre',
                      'code'
                    ];
                    
                    promptSelectors.forEach(selector => {
                      const elements = detailContainer.querySelectorAll(selector);
                      elements.forEach(el => {
                        const text = el.textContent.trim();
                        if (text && text.length > 10) {
                          info.prompts.push(text);
                        }
                      });
                    });
                    
                    // 查找标签
                    const tagSelectors = [
                      '[class*="tag"]',
                      '[class*="category"]',
                      '.chip',
                      '.badge'
                    ];
                    
                    tagSelectors.forEach(selector => {
                      const elements = detailContainer.querySelectorAll(selector);
                      elements.forEach(el => {
                        const text = el.textContent.trim();
                        if (text && text.length < 20) {
                          info.tags.push(text);
                        }
                      });
                    });
                    
                    return info;
                  };
                  
                  const detailInfo = extractDetailInfo();
                  
                  // 关闭弹窗
                  const closeButtons = detailContainer.querySelectorAll('[class*="close"], button, [role="button"]');
                  closeButtons.forEach(btn => {
                    if (btn.textContent.includes('关闭') || btn.textContent.includes('Close') || btn.textContent.includes('✕')) {
                      btn.click();
                    }
                  });
                  
                  resolve(detailInfo);
                } else {
                  resolve({ error: '未找到详细信息容器' });
                }
              }, 2000);
            } else {
              resolve({ error: '找不到可点击元素' });
            }
          });
        }, card);
        
        // 合并基本信息和详细信息
        const completeCard = {
          ...card,
          detailedInfo,
          extractionStatus: 'success'
        };
        
        allCards.push(completeCard);
        console.log(`✓ 成功提取: ${card.title}`);
        if (detailedInfo.prompts && detailedInfo.prompts.length > 0) {
          console.log(`  提示词数量: ${detailedInfo.prompts.length}`);
        }
        
        // 等待一下再处理下一个
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`✗ 处理卡片失败: ${card.title}`, error);
        allCards.push({
          ...card,
          detailedInfo: { error: error.message },
          extractionStatus: 'failed'
        });
      }
    }
    
    console.log(`\n提取完成！总共处理 ${allCards.length} 个卡片`);
    
    return {
      metadata: {
        website: 'https://opennana.com/awesome-prompt-gallery/',
        extractionDate: new Date().toISOString(),
        totalCards: allCards.length,
        successfulExtractions: allCards.filter(c => c.extractionStatus === 'success').length,
        failedExtractions: allCards.filter(c => c.extractionStatus === 'failed').length
      },
      cards: allCards
    };
    
  } catch (error) {
    console.error('爬取过程中出错:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// 自动滚动函数
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(timer);
        resolve();
      }, 15000);
    });
  });
}

// 主执行函数
async function main() {
  try {
    console.log('开始详细的 OpenNana 数据提取...');
    const data = await extractDetailedOpenNanaData();
    
    // 保存完整数据
    const filename = `opennana-detailed-data-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`\n详细数据已保存到: ${filename}`);
    console.log(`总卡片数: ${data.cards.length}`);
    console.log(`成功提取: ${data.metadata.successfulExtractions}`);
    console.log(`提取失败: ${data.metadata.failedExtractions}`);
    
    // 创建简化版本，只包含成功提取的数据
    const successfulCards = data.cards.filter(c => c.extractionStatus === 'success');
    const simplifiedData = {
      metadata: data.metadata,
      prompts: successfulCards.map(card => ({
        id: card.id,
        caseNumber: card.caseNumber,
        title: card.title,
        titleEn: card.title, // 可能需要翻译或从提示词中提取
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt,
        categories: card.tags || [],
        prompt1: card.detailedInfo.prompts[0] || '',
        prompt2: card.detailedInfo.prompts[1] || '',
        allPrompts: card.detailedInfo.prompts,
        tags: card.detailedInfo.tags,
        language: 'bilingual'
      }))
    };
    
    const simplifiedFilename = `opennana-prompts-${Date.now()}.json`;
    fs.writeFileSync(simplifiedFilename, JSON.stringify(simplifiedData, null, 2));
    
    console.log(`\n简化版提示词数据已保存到: ${simplifiedFilename}`);
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

module.exports = { extractDetailedOpenNanaData };