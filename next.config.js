/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  // GitHub Pages 配置
  basePath: process.env.NODE_ENV === 'production' ? '/opennana-gallery' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/opennana-gallery/' : '',
  // 确保静态导出正确工作
  trailingSlash: true
}

module.exports = nextConfig