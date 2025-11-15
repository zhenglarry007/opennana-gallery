const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeOpenNanaGallery() {
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
    await page.waitForSelector('.grid', { timeout: 10000 }).catch(() => {
      console.log('Grid not found, trying alternative selectors...');
    });
    
    // Scroll to load all content
    await autoScroll(page);
    
    console.log('Extracting data...');
    
    const extractedData = await page.evaluate(() => {
      const data = [];
      
      // Try multiple selectors to find cards
      const cardSelectors = [
        '.grid > div',
        '.grid > article',
        '.card',
        '.prompt-card',
        '[class*="card"]',
        '[class*="prompt"]'
      ];
      
      let cards = [];
      for (const selector of cardSelectors) {
        cards = document.querySelectorAll(selector);
        if (cards.length > 0) {
          console.log(`Found ${cards.length} cards with selector: ${selector}`);
          break;
        }
      }
      
      if (cards.length === 0) {
        console.log('No cards found, trying to find any content containers...');
        // Fallback: try to find any content containers
        cards = document.querySelectorAll('div > div');
      }
      
      cards.forEach((card, index) => {
        try {
          // Extract image
          const imgElement = card.querySelector('img') || card.querySelector('[class*="image"]');
          const imageUrl = imgElement ? imgElement.src : '';
          const imageAlt = imgElement ? imgElement.alt : '';
          
          // Extract title/prompt
          const titleElement = card.querySelector('h3') || 
                               card.querySelector('h2') || 
                               card.querySelector('[class*="title"]') ||
                               card.querySelector('[class*="prompt"]');
          const title = titleElement ? titleElement.textContent.trim() : '';
          
          // Extract description
          const descElement = card.querySelector('p') || 
                              card.querySelector('[class*="description"]') ||
                              card.querySelector('[class*="desc"]');
          const description = descElement ? descElement.textContent.trim() : '';
          
          // Extract tags/categories
          const tags = [];
          const tagElements = card.querySelectorAll('[class*="tag"], [class*="category"], .tag, .category');
          tagElements.forEach(tag => {
            if (tag.textContent.trim()) {
              tags.push(tag.textContent.trim());
            }
          });
          
          // Extract links
          const linkElement = card.querySelector('a') || card.closest('a');
          const link = linkElement ? linkElement.href : '';
          
          // Extract prompt content (both Chinese and English)
          const promptElement = card.querySelector('[class*="prompt"]') ||
                               card.querySelector('[class*="content"]') ||
                               card.querySelector('p');
          const prompt = promptElement ? promptElement.textContent.trim() : '';
          
          if (title || imageUrl || description || tags.length > 0) {
            data.push({
              id: index + 1,
              title: title,
              description: description,
              prompt: prompt,
              imageUrl: imageUrl,
              imageAlt: imageAlt,
              link: link,
              tags: tags,
              categories: tags, // Using tags as categories for now
              language: detectLanguage(title + ' ' + description + ' ' + prompt),
              sourceUrl: window.location.href
            });
          }
        } catch (error) {
          console.error(`Error processing card ${index}:`, error);
        }
      });
      
      // Also try to extract categories from the page
      const categories = [];
      const categorySelectors = [
        '[class*="category"]',
        '[class*="tag"]',
        '.category',
        '.tag',
        'button[class*="filter"]',
        'button[class*="category"]'
      ];
      
      for (const selector of categorySelectors) {
        const categoryElements = document.querySelectorAll(selector);
        categoryElements.forEach(el => {
          const text = el.textContent.trim();
          if (text && text.length < 20 && !categories.includes(text)) {
            categories.push(text);
          }
        });
        if (categories.length > 0) break;
      }
      
      return {
        cards: data,
        categories: categories,
        totalCount: data.length,
        scrapedAt: new Date().toISOString(),
        url: window.location.href
      };
    });
    
    console.log(`Extracted ${extractedData.cards.length} items`);
    console.log(`Found ${extractedData.categories.length} categories`);
    
    // If no data found, try alternative approach
    if (extractedData.cards.length === 0) {
      console.log('Trying alternative extraction method...');
      const alternativeData = await page.evaluate(() => {
        const allText = document.body.innerText;
        const images = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt
        }));
        
        return {
          pageText: allText.substring(0, 5000), // First 5000 characters
          images: images,
          url: window.location.href
        };
      });
      
      console.log('Alternative data:', alternativeData);
      extractedData.alternative = alternativeData;
    }
    
    return extractedData;
    
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Auto-scroll function to load all content
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
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(timer);
        resolve();
      }, 10000);
    });
  });
}

// Language detection function
function detectLanguage(text) {
  if (!text) return 'unknown';
  
  // Chinese character detection
  const chineseRegex = /[\u4e00-\u9fff]/;
  const englishRegex = /[a-zA-Z]/;
  
  const hasChinese = chineseRegex.test(text);
  const hasEnglish = englishRegex.test(text);
  
  if (hasChinese && hasEnglish) return 'bilingual';
  if (hasChinese) return 'chinese';
  if (hasEnglish) return 'english';
  return 'unknown';
}

// Main execution
async function main() {
  try {
    console.log('Starting OpenNana gallery scraping...');
    const data = await scrapeOpenNanaGallery();
    
    // Save data to JSON file
    const filename = `opennana-gallery-data-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    
    console.log(`Data saved to ${filename}`);
    console.log(`Total items extracted: ${data.cards.length}`);
    console.log(`Categories found: ${data.categories.length}`);
    
    // Also create a sample file with first 5 items
    const sampleData = {
      ...data,
      cards: data.cards.slice(0, 5),
      sampleNote: 'This is a sample with first 5 items. Check the full file for complete data.'
    };
    
    const sampleFilename = `opennana-gallery-sample-${Date.now()}.json`;
    fs.writeFileSync(sampleFilename, JSON.stringify(sampleData, null, 2));
    
    console.log(`Sample data saved to ${sampleFilename}`);
    
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  main();
}

module.exports = { scrapeOpenNanaGallery };