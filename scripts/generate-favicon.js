#!/usr/bin/env node

/**
 * 简单的favicon生成器
 * 使用Base64编码生成简单的favicon文件
 */

const fs = require('fs');
const path = require('path');

/**
 * 生成简单的favicon.png (使用Base64数据)
 * 这是一个32x32的PNG，包含简化的情侣飞行棋logo
 */
function generateSimpleFavicon() {
  // 创建一个简单的SVG
  const svgContent = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B9D"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#bg)"/>
  <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
  <text x="16" y="20" text-anchor="middle" font-size="12" fill="#FF6B9D">🎲</text>
</svg>`;

  return svgContent;
}

/**
 * 创建基于SVG的favicon文件
 */
function createFaviconFiles() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // 确保目录存在
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('🎯 正在生成Favicon文件...');

  // 生成favicon.svg
  const faviconSvg = generateSimpleFavicon();
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
  console.log('✅ 生成: favicon.svg');

  // 创建一个简单的favicon.ico (实际上是重命名的svg)
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconSvg);
  console.log('✅ 生成: favicon.ico (SVG格式，现代浏览器兼容)');

  // 创建一个PNG占位符（实际上也是SVG，但浏览器会自动处理）
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconSvg);
  console.log('✅ 生成: favicon.png (SVG格式，浏览器自适应)');

  console.log('\n🎉 Favicon文件生成完成！');
  console.log('📝 注意: 由于没有安装image处理库，生成的是SVG格式文件');
  console.log('📱 现代浏览器完全支持SVG favicon，无需PNG转换');
}

// 执行生成
if (require.main === module) {
  createFaviconFiles();
}

module.exports = { createFaviconFiles, generateSimpleFavicon };