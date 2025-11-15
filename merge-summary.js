const fs = require('fs');

// Read the merged JSON file
const mergedData = JSON.parse(fs.readFileSync('/Users/larryzheng/Downloads/code/solo_build-/opennana-gallery/opennana-gallery-data-merged.json', 'utf8'));

console.log('=== JSON数据合并完成报告 ===\n');

// Count statistics
const imagesWithPrompts = mergedData.alternative.images.filter(img => img.prompt1).length;
const totalImages = mergedData.alternative.images.length;
const successRate = ((imagesWithPrompts / totalImages) * 100).toFixed(1);

console.log(`📊 数据统计:`);
console.log(`   总图片数量: ${totalImages}`);
console.log(`   成功匹配提示词: ${imagesWithPrompts}`);
console.log(`   匹配成功率: ${successRate}%`);

// Show examples of merged data
console.log('\n🎯 示例数据 (前5个):');
const examples = mergedData.alternative.images.filter(img => img.prompt1).slice(0, 5);

examples.forEach((img, index) => {
    console.log(`\n${index + 1}. 案例 ${img.caseNumber}:`);
    console.log(`   标题: ${img.alt}`);
    console.log(`   图片URL: ${img.src}`);
    console.log(`   提示词1 (前100字): ${img.prompt1.substring(0, 100)}...`);
    console.log(`   提示词2 (前100字): ${img.prompt2.substring(0, 100)}...`);
    console.log(`   标签: ${img.tags.join(', ')}`);
    console.log(`   语言: ${img.language}`);
});

// Show data structure
console.log('\n📋 数据字段结构:');
const sampleImage = mergedData.alternative.images.find(img => img.prompt1);
if (sampleImage) {
    console.log('每个图片对象现在包含以下字段:');
    Object.keys(sampleImage).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleImage[key]}`);
    });
}

console.log('\n✅ 合并后的JSON文件已保存为: opennana-gallery-data-merged.json');
console.log('文件包含完整的图片信息、提示词数据、标签和语言信息。');