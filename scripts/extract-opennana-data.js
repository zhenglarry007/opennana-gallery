const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractOpenNanaData() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to OpenNana gallery...');
    await page.goto('https://opennana.com/awesome-prompt-gallery/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Scroll to load all content
    await autoScroll(page);
    
    console.log('Extracting comprehensive data...');
    
    // Extract all visible data from the page
    const extractedData = await page.evaluate(() => {
      const result = {
        pageInfo: {
          title: document.title,
          url: window.location.href,
          scrapedAt: new Date().toISOString()
        },
        header: {},
        cards: [],
        categories: [],
        images: [],
        links: [],
        prompts: [],
        descriptions: []
      };
      
      // Extract header/title information
      const mainTitle = document.querySelector('h1') || document.querySelector('title');
      if (mainTitle) {
        result.header.title = mainTitle.textContent.trim();
      }
      
      const subtitle = document.querySelector('p, .subtitle, [class*="subtitle"]');
      if (subtitle) {
        result.header.subtitle = subtitle.textContent.trim();
      }
      
      // Extract all images with their alt text
      const allImages = document.querySelectorAll('img');
      allImages.forEach((img, index) => {
        if (img.src && img.src.includes('opennana')) {
          result.images.push({
            id: index + 1,
            src: img.src,
            alt: img.alt || '',
            width: img.naturalWidth,
            height: img.naturalHeight,
            title: img.title || ''
          });
        }
      });
      
      // Extract all links
      const allLinks = document.querySelectorAll('a[href]');
      allLinks.forEach((link, index) => {
        if (link.href && link.href.includes('opennana')) {
          result.links.push({
            id: index + 1,
            href: link.href,
            text: link.textContent.trim(),
            title: link.title || ''
          });
        }
      });
      
      // Extract categories/filters
      const categoryElements = document.querySelectorAll('[class*="category"], [class*="tag"], button');
      categoryElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 20 && !result.categories.includes(text)) {
          result.categories.push(text);
        }
      });
      
      // Try to find card containers - multiple strategies
      const cardStrategies = [
        // Strategy 1: Look for grid containers
        () => {
          const grids = document.querySelectorAll('.grid, [class*="grid"]');
          const cards = [];
          grids.forEach(grid => {
            const items = grid.querySelectorAll('div > div, article, [class*="card"]');
            items.forEach(item => {
              if (item.querySelector('img')) {
                cards.push(item);
              }
            });
          });
          return cards;
        },
        
        // Strategy 2: Look for image containers
        () => {
          const images = document.querySelectorAll('img');
          const cards = [];
          images.forEach(img => {
            let parent = img.parentElement;
            while (parent && parent !== document.body) {
              if (parent.querySelectorAll('img').length === 1) {
                cards.push(parent);
                break;
              }
              parent = parent.parentElement;
            }
          });
          return cards;
        },
        
        // Strategy 3: Look for any container with images and text
        () => {
          const containers = document.querySelectorAll('div');
          const cards = [];
          containers.forEach(container => {
            if (container.querySelector('img') && 
                (container.querySelector('h1, h2, h3, h4, h5, h6, p') || 
                 container.textContent.length > 10)) {
              cards.push(container);
            }
          });
          return cards;
        }
      ];
      
      let cardContainers = [];
      for (const strategy of cardStrategies) {
        cardContainers = strategy();
        if (cardContainers.length > 0) {
          console.log(`Found ${cardContainers.length} cards with strategy`);
          break;
        }
      }
      
      // Process card containers
      cardContainers.forEach((container, index) => {
        try {
          const cardData = {
            id: index + 1,
            title: '',
            description: '',
            prompt: '',
            imageUrl: '',
            imageAlt: '',
            tags: [],
            link: '',
            language: 'unknown'
          };
          
          // Extract image
          const img = container.querySelector('img');
          if (img) {
            cardData.imageUrl = img.src;
            cardData.imageAlt = img.alt || '';
          }
          
          // Extract title
          const titleEl = container.querySelector('h1, h2, h3, h4, h5, h6, [class*="title"]');
          if (titleEl) {
            cardData.title = titleEl.textContent.trim();
          }
          
          // Extract description/prompt
          const textEls = container.querySelectorAll('p, div, span');
          let fullText = '';
          textEls.forEach(el => {
            if (el.textContent.trim().length > 5) {
              fullText += el.textContent.trim() + ' ';
            }
          });
          cardData.description = fullText.trim().substring(0, 200);
          cardData.prompt = fullText.trim();
          
          // Extract tags
          const tagEls = container.querySelectorAll('[class*="tag"], [class*="category"], span, button');
          tagEls.forEach(tagEl => {
            const tagText = tagEl.textContent.trim();
            if (tagText && tagText.length < 15 && !cardData.tags.includes(tagText)) {
              cardData.tags.push(tagText);
            }
          });
          
          // Detect language
          const chineseRegex = /[\u4e00-\u9fff]/;
          const englishRegex = /[a-zA-Z]/;
          const hasChinese = chineseRegex.test(cardData.title + cardData.description);
          const hasEnglish = englishRegex.test(cardData.title + cardData.description);
          
          if (hasChinese && hasEnglish) cardData.language = 'bilingual';
          else if (hasChinese) cardData.language = 'chinese';
          else if (hasEnglish) cardData.language = 'english';
          
          // Only add if has meaningful content
          if (cardData.title || cardData.imageUrl || cardData.description) {
            result.cards.push(cardData);
          }
        } catch (error) {
          console.error(`Error processing card ${index}:`, error);
        }
      });
      
      // Extract raw text content for analysis
      const rawText = document.body.innerText;
      result.rawText = {
        length: rawText.length,
        preview: rawText.substring(0, 1000),
        chineseChars: (rawText.match(/[\u4e00-\u9fff]/g) || []).length,
        englishWords: (rawText.match(/[a-zA-Z]+/g) || []).length
      };
      
      return result;
    });
    
    console.log(`Extracted ${extractedData.cards.length} cards`);
    console.log(`Found ${extractedData.images.length} images`);
    console.log(`Found ${extractedData.categories.length} categories`);
    console.log(`Found ${extractedData.links.length} links`);
    
    return extractedData;
    
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Auto-scroll function
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
      }, 10000);
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('Starting comprehensive OpenNana data extraction...');
    const data = await extractOpenNanaData();
    
    // Save complete data
    const filename = `opennana-complete-data-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`Complete data saved to ${filename}`);
    console.log(`Cards extracted: ${data.cards.length}`);
    console.log(`Images found: ${data.images.length}`);
    console.log(`Categories found: ${data.categories.length}`);
    console.log(`Links found: ${data.links.length}`);
    
    // Create a structured summary
    const summary = {
      extractionInfo: data.pageInfo,
      statistics: {
        totalCards: data.cards.length,
        totalImages: data.images.length,
        totalCategories: data.categories.length,
        totalLinks: data.links.length,
        languageDistribution: {
          chinese: data.cards.filter(c => c.language === 'chinese').length,
          english: data.cards.filter(c => c.language === 'english').length,
          bilingual: data.cards.filter(c => c.language === 'bilingual').length,
          unknown: data.cards.filter(c => c.language === 'unknown').length
        }
      },
      sampleData: {
        firstCard: data.cards[0] || null,
        firstImage: data.images[0] || null,
        categories: data.categories.slice(0, 20),
        links: data.links.slice(0, 10)
      }
    };
    
    const summaryFilename = `opennana-summary-${Date.now()}.json`;
    fs.writeFileSync(summaryFilename, JSON.stringify(summary, null, 2));
    
    console.log(`Summary saved to ${summaryFilename}`);
    
    // Create individual files for different data types
    if (data.cards.length > 0) {
      const cardsFilename = `opennana-cards-${Date.now()}.json`;
      fs.writeFileSync(cardsFilename, JSON.stringify(data.cards, null, 2));
      console.log(`Cards data saved to ${cardsFilename}`);
    }
    
    if (data.images.length > 0) {
      const imagesFilename = `opennana-images-${Date.now()}.json`;
      fs.writeFileSync(imagesFilename, JSON.stringify(data.images, null, 2));
      console.log(`Images data saved to ${imagesFilename}`);
    }
    
    if (data.categories.length > 0) {
      const categoriesFilename = `opennana-categories-${Date.now()}.json`;
      fs.writeFileSync(categoriesFilename, JSON.stringify(data.categories, null, 2));
      console.log(`Categories data saved to ${categoriesFilename}`);
    }
    
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  main();
}

module.exports = { extractOpenNanaData };