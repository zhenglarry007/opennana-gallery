const puppeteer = require('puppeteer');

async function analyzeWebsiteStyles() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://opennana.com/awesome-prompt-gallery/', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        // Wait for page to load completely
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Extract comprehensive styling information
        const styles = await page.evaluate(() => {
            const results = {
                colors: {},
                backgrounds: {},
                typography: {},
                layout: {},
                cards: {},
                spacing: {},
                effects: {}
            };

            // Extract body background
            const body = document.body;
            const computedBody = window.getComputedStyle(body);
            results.backgrounds.body = {
                backgroundColor: computedBody.backgroundColor,
                backgroundImage: computedBody.backgroundImage,
                background: computedBody.background
            };

            // Extract main containers
            const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], main, .main');
            containers.forEach((container, index) => {
                const computed = window.getComputedStyle(container);
                results.layout[`container_${index}`] = {
                    backgroundColor: computed.backgroundColor,
                    backgroundImage: computed.backgroundImage,
                    maxWidth: computed.maxWidth,
                    padding: computed.padding,
                    margin: computed.margin
                };
            });

            // Extract card styles
            const cards = document.querySelectorAll('[class*="card"], [class*="item"], article, .gallery-item');
            cards.forEach((card, index) => {
                if (index < 3) { // Limit to first 3 cards for analysis
                    const computed = window.getComputedStyle(card);
                    results.cards[`card_${index}`] = {
                        backgroundColor: computed.backgroundColor,
                        backgroundImage: computed.backgroundImage,
                        borderRadius: computed.borderRadius,
                        boxShadow: computed.boxShadow,
                        border: computed.border,
                        backdropFilter: computed.backdropFilter,
                        padding: computed.padding,
                        margin: computed.margin
                    };
                }
            });

            // Extract header styles
            const headers = document.querySelectorAll('header, [class*="header"], [class*="nav"]');
            headers.forEach((header, index) => {
                const computed = window.getComputedStyle(header);
                results.layout[`header_${index}`] = {
                    backgroundColor: computed.backgroundColor,
                    backgroundImage: computed.backgroundImage,
                    backdropFilter: computed.backdropFilter,
                    boxShadow: computed.boxShadow,
                    position: computed.position
                };
            });

            // Extract text colors
            const textElements = document.querySelectorAll('h1, h2, h3, p, span, .title, .text');
            textElements.forEach((element, index) => {
                if (index < 10) { // Limit to first 10 text elements
                    const computed = window.getComputedStyle(element);
                    results.typography[`text_${index}`] = {
                        color: computed.color,
                        fontSize: computed.fontSize,
                        fontWeight: computed.fontWeight,
                        fontFamily: computed.fontFamily,
                        tagName: element.tagName,
                        className: element.className
                    };
                }
            });

            // Extract button styles
            const buttons = document.querySelectorAll('button, [class*="btn"], [class*="button"]');
            buttons.forEach((button, index) => {
                if (index < 5) { // Limit to first 5 buttons
                    const computed = window.getComputedStyle(button);
                    results.colors[`button_${index}`] = {
                        backgroundColor: computed.backgroundColor,
                        color: computed.color,
                        border: computed.border,
                        borderRadius: computed.borderRadius,
                        boxShadow: computed.boxShadow
                    };
                }
            });

            // Extract specific color values from inline styles and CSS variables
            const allElements = document.querySelectorAll('*');
            const uniqueColors = new Set();
            const uniqueBgColors = new Set();
            
            allElements.forEach(element => {
                const computed = window.getComputedStyle(element);
                const color = computed.color;
                const bgColor = computed.backgroundColor;
                const bgImage = computed.backgroundImage;
                
                if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
                    uniqueColors.add(color);
                }
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    uniqueBgColors.add(bgColor);
                }
                if (bgImage && bgImage !== 'none') {
                    results.effects.backgroundImages = results.effects.backgroundImages || [];
                    results.effects.backgroundImages.push(bgImage);
                }
            });

            results.colors.uniqueTextColors = Array.from(uniqueColors).slice(0, 20);
            results.backgrounds.uniqueBgColors = Array.from(uniqueBgColors).slice(0, 20);

            // Extract CSS custom properties (CSS variables)
            const root = document.documentElement;
            const rootComputed = window.getComputedStyle(root);
            results.colors.cssVariables = {};
            
            // Try to extract common CSS variables
            const commonVars = ['--primary-color', '--secondary-color', '--background-color', '--text-color', '--card-bg', '--header-bg'];
            commonVars.forEach(varName => {
                const value = rootComputed.getPropertyValue(varName);
                if (value) {
                    results.colors.cssVariables[varName] = value;
                }
            });

            return results;
        });

        console.log('=== WEBSITE STYLE ANALYSIS ===');
        console.log(JSON.stringify(styles, null, 2));

        // Take a screenshot for visual reference
        await page.screenshot({ path: 'opennana-website-screenshot.png', fullPage: true });
        console.log('Screenshot saved as opennana-website-screenshot.png');

        return styles;

    } catch (error) {
        console.error('Error analyzing website:', error);
        return null;
    } finally {
        await browser.close();
    }
}

// Run the analysis
analyzeWebsiteStyles().then(styles => {
    if (styles) {
        console.log('\n=== KEY INSIGHTS ===');
        console.log('Body Background:', styles.backgrounds.body);
        console.log('Unique Text Colors:', styles.colors.uniqueTextColors?.slice(0, 5));
        console.log('Unique Background Colors:', styles.backgrounds.uniqueBgColors?.slice(0, 5));
        console.log('CSS Variables:', styles.colors.cssVariables);
    }
}).catch(console.error);