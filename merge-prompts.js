const fs = require('fs');

// Read both JSON files
const firstJson = JSON.parse(fs.readFileSync('/Users/larryzheng/Downloads/code/solo_build-/opennana-gallery/opennana-gallery-data-1763198693475.json', 'utf8'));
const secondJson = JSON.parse(fs.readFileSync('/Users/larryzheng/Downloads/code/solo_build-/opennana-gallery/opennana-prompts-1763203510095.json', 'utf8'));

console.log('=== 开始处理JSON数据 ===');

// Extract case numbers from alt text in first JSON
function extractCaseNumberFromAlt(altText) {
    if (!altText) return null;
    const match = altText.match(/案例\s*(\d+)/);
    return match ? parseInt(match[1]) : null;
}

// Create a mapping of case numbers to prompt data from second JSON
const promptMapping = {};
if (secondJson.prompts && Array.isArray(secondJson.prompts)) {
    secondJson.prompts.forEach(prompt => {
        if (prompt.caseNumber) {
            promptMapping[prompt.caseNumber] = {
                prompt1: prompt.prompt1 || '',
                prompt2: prompt.prompt2 || '',
                allPrompts: prompt.allPrompts || [],
                tags: prompt.tags || [],
                language: prompt.language || 'bilingual'
            };
        }
    });
}

console.log(`从第二个JSON中找到 ${Object.keys(promptMapping).length} 个案例的提示词数据`);

// Process images in first JSON
let updatedCount = 0;
if (firstJson.alternative && firstJson.alternative.images && Array.isArray(firstJson.alternative.images)) {
    firstJson.alternative.images.forEach(image => {
        const caseNumber = extractCaseNumberFromAlt(image.alt);
        if (caseNumber && promptMapping[caseNumber]) {
            // Add prompt data to the image object
            image.prompt1 = promptMapping[caseNumber].prompt1;
            image.prompt2 = promptMapping[caseNumber].prompt2;
            image.allPrompts = promptMapping[caseNumber].allPrompts;
            image.tags = promptMapping[caseNumber].tags;
            image.language = promptMapping[caseNumber].language;
            image.caseNumber = caseNumber;
            updatedCount++;
            console.log(`✅ 案例 ${caseNumber} 已更新提示词数据`);
        } else if (caseNumber) {
            console.log(`⚠️  案例 ${caseNumber} 在第二个JSON中未找到提示词数据`);
        }
    });
}

// Also check if there's a cards array that might need updating
if (firstJson.cards && Array.isArray(firstJson.cards)) {
    firstJson.cards.forEach(card => {
        if (card.alt) {
            const caseNumber = extractCaseNumberFromAlt(card.alt);
            if (caseNumber && promptMapping[caseNumber]) {
                card.prompt1 = promptMapping[caseNumber].prompt1;
                card.prompt2 = promptMapping[caseNumber].prompt2;
                card.allPrompts = promptMapping[caseNumber].allPrompts;
                card.tags = promptMapping[caseNumber].tags;
                card.language = promptMapping[caseNumber].language;
                card.caseNumber = caseNumber;
                updatedCount++;
            }
        }
    });
}

console.log(`\n=== 处理完成 ===`);
console.log(`总共更新了 ${updatedCount} 个案例的提示词数据`);

// Save the updated JSON
const outputPath = '/Users/larryzheng/Downloads/code/solo_build-/opennana-gallery/opennana-gallery-data-merged.json';
fs.writeFileSync(outputPath, JSON.stringify(firstJson, null, 2), 'utf8');

console.log(`\n✅ 更新后的JSON已保存到: ${outputPath}`);

// Show some examples of the updated data
console.log('\n=== 示例数据 ===');
const examples = firstJson.alternative.images.filter(img => img.prompt1).slice(0, 3);
examples.forEach(img => {
    console.log(`\n案例 ${img.caseNumber}:`);
    console.log(`标题: ${img.alt}`);
    console.log(`提示词1: ${img.prompt1?.substring(0, 100)}...`);
    console.log(`提示词2: ${img.prompt2?.substring(0, 100)}...`);
    console.log(`标签: ${img.tags?.join(', ')}`);
});