#!/usr/bin/env node

/**
 * Logo生成脚本
 * 使用Canvas API生成不同尺寸的PWA Logo和Favicon文件
 */

const fs = require('fs');
const path = require('path');

// 检查是否有sharp模块用于PNG转换
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  未安装sharp模块，将只生成SVG文件');
}

// Logo配置
const LOGO_CONFIG = {
  sizes: [72, 96, 128, 144, 152, 192, 384, 512],
  faviconSizes: [16, 32, 48, 64], // favicon特定尺寸
  colors: {
    primary: '#FF6B9D',
    secondary: '#3B82F6', 
    accent: '#FF4757',
    background: '#FFB199'
  }
};

/**
 * 生成Favicon专用的SVG内容（更简洁的设计）
 */
function generateFaviconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B9D"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#faviconBg)"/>
  <text x="${size/2}" y="${size*0.7}" text-anchor="middle" font-size="${size*0.6}" fill="white">🎲</text>
</svg>`;
}

/**
 * 将SVG转换为PNG
 */
async function svgToPng(svgContent, outputPath, size) {
  if (!sharp) {
    console.log(`⚠️  跳过PNG生成: ${outputPath} (需要安装sharp模块)`);
    return false;
  }

  try {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`❌ PNG生成失败: ${outputPath}`, error);
    return false;
  }
}

/**
 * 生成ICO文件（多尺寸PNG组合）
 */
async function generateIcoFile(publicDir) {
  if (!sharp) {
    console.log('⚠️  跳过ICO生成 (需要安装sharp模块)');
    return;
  }

  // 为ICO文件生成多个尺寸的PNG缓冲区
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];

  for (const size of icoSizes) {
    const svgContent = generateFaviconSVG(size);
    try {
      const pngBuffer = await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push({ size, buffer: pngBuffer });
    } catch (error) {
      console.error(`❌ 生成${size}px PNG缓冲区失败:`, error);
    }
  }

  // 简化版ICO生成 - 使用32px作为主favicon
  if (pngBuffers.length > 0) {
    const mainBuffer = pngBuffers.find(p => p.size === 32)?.buffer || pngBuffers[0].buffer;
    const icoPath = path.join(publicDir, '..', 'favicon.ico');
    fs.writeFileSync(icoPath, mainBuffer);
    console.log('✅ 生成: favicon.ico (使用32px PNG)');
  }
}

/**
 * 生成SVG Logo内容
 */
function generateSVGLogo(size, isSimple = false) {
  if (isSimple && size < 128) {
    return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B9D"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="url(#bg)"/>
  <text x="${size/2}" y="${size*0.65}" text-anchor="middle" font-size="${size*0.5}" fill="white">🎲</text>
  <text x="${size*0.75}" y="${size*0.35}" text-anchor="middle" font-size="${size*0.2}" fill="white">💕</text>
</svg>`;
  }

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B9D"/>
      <stop offset="50%" stop-color="#FF8E9E"/>
      <stop offset="100%" stop-color="#FFB199"/>
    </linearGradient>
    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4757"/>
      <stop offset="100%" stop-color="#FF6B9D"/>
    </linearGradient>
    <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.25}" fill="url(#bgGradient)"/>
  
  <!-- Decorative dots -->
  <circle cx="${size * 0.2}" cy="${size * 0.2}" r="${size * 0.02}" fill="rgba(255,255,255,0.3)"/>
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.015}" fill="rgba(255,255,255,0.2)"/>
  <circle cx="${size * 0.2}" cy="${size * 0.8}" r="${size * 0.015}" fill="rgba(255,255,255,0.2)"/>
  <circle cx="${size * 0.8}" cy="${size * 0.8}" r="${size * 0.02}" fill="rgba(255,255,255,0.3)"/>
  
  <!-- Main icons group -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Heart (top left) -->
    <g transform="translate(${-size*0.13}, ${-size*0.13})">
      <path d="M${size*0.06} ${size*0.11}l${-size*0.007} ${-size*0.007}C${size*0.027} ${size*0.08} ${size*0.01} ${size*0.063} ${size*0.01} ${size*0.044} ${size*0.01} ${size*0.028} ${size*0.022} ${size*0.015} ${size*0.038} ${size*0.015}c${size*0.009} 0 ${size*0.017} ${size*0.004} ${size*0.023} ${size*0.011}C${size*0.066} ${size*0.02} ${size*0.074} ${size*0.015} ${size*0.083} ${size*0.015} ${size*0.099} ${size*0.015} ${size*0.11} ${size*0.028} ${size*0.11} ${size*0.044}c0 ${size*0.019} ${-size*0.017} ${size*0.036} ${-size*0.043} ${size*0.059}L${size*0.06} ${size*0.11}z" fill="url(#heartGradient)" filter="url(#shadow)"/>
    </g>
    
    <!-- Dice (bottom right) -->
    <g transform="translate(${size*0.08}, ${size*0.08})">
      <rect x="0" y="0" width="${size*0.1}" height="${size*0.1}" rx="${size*0.02}" fill="url(#diceGradient)" filter="url(#shadow)"/>
      <!-- Dice dots (6) -->
      <circle cx="${size*0.03}" cy="${size*0.03}" r="${size*0.008}" fill="white"/>
      <circle cx="${size*0.07}" cy="${size*0.03}" r="${size*0.008}" fill="white"/>
      <circle cx="${size*0.03}" cy="${size*0.05}" r="${size*0.008}" fill="white"/>
      <circle cx="${size*0.07}" cy="${size*0.05}" r="${size*0.008}" fill="white"/>
      <circle cx="${size*0.03}" cy="${size*0.07}" r="${size*0.008}" fill="white"/>
      <circle cx="${size*0.07}" cy="${size*0.07}" r="${size*0.008}" fill="white"/>
    </g>
    
    <!-- Couple icons (center) -->
    <g transform="translate(${-size*0.05}, ${-size*0.025})">
      <!-- Male -->
      <circle cx="0" cy="${-size*0.025}" r="${size*0.03}" fill="#FFB199" stroke="#FF8E9E" stroke-width="${size*0.005}"/>
      <rect x="${-size*0.02}" y="${size*0.005}" width="${size*0.04}" height="${size*0.05}" rx="${size*0.01}" fill="#3B82F6"/>
      
      <!-- Female -->
      <circle cx="${size*0.06}" cy="${-size*0.025}" r="${size*0.03}" fill="#FFB199" stroke="#FF8E9E" stroke-width="${size*0.005}"/>
      <rect x="${size*0.04}" y="${size*0.005}" width="${size*0.04}" height="${size*0.05}" rx="${size*0.01}" fill="#FF6B9D"/>
      
      <!-- Connecting heart -->
      <circle cx="${size*0.03}" cy="${-size*0.01}" r="${size*0.015}" fill="#FF4757"/>
    </g>
  </g>
  
  <!-- Decorative stars -->
  <path d="M${size*0.25} ${size*0.15} L${size*0.26} ${size*0.19} L${size*0.3} ${size*0.19} L${size*0.27} ${size*0.21} L${size*0.28} ${size*0.24} L${size*0.25} ${size*0.22} L${size*0.22} ${size*0.24} L${size*0.23} ${size*0.21} L${size*0.2} ${size*0.19} L${size*0.24} ${size*0.19} Z" fill="rgba(255,255,255,0.4)"/>
  <path d="M${size*0.73} ${size*0.83} L${size*0.74} ${size*0.87} L${size*0.77} ${size*0.87} L${size*0.745} ${size*0.885} L${size*0.755} ${size*0.92} L${size*0.73} ${size*0.895} L${size*0.705} ${size*0.92} L${size*0.715} ${size*0.885} L${size*0.69} ${size*0.87} L${size*0.72} ${size*0.87} Z" fill="rgba(255,255,255,0.4)"/>
</svg>`;
}

/**
 * 创建Logo和Favicon文件
 */
async function createLogoFiles() {
  const publicDir = path.join(process.cwd(), 'public', 'images');
  
  // 确保目录存在
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('🎨 正在生成PWA Logo和Favicon文件...');
  
  // 生成标准Logo文件
  LOGO_CONFIG.sizes.forEach(size => {
    const isSimple = size < 128;
    const svgContent = generateSVGLogo(size, isSimple);
    
    // 生成SVG文件
    const svgPath = path.join(publicDir, `logo-${size}x${size}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    
    console.log(`✅ 生成: logo-${size}x${size}.svg`);
  });

  // 生成主Logo (默认192x192)
  const mainLogoContent = generateSVGLogo(192);
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), mainLogoContent);
  
  console.log('✅ 生成: logo.svg (主Logo)');

  // 生成Favicon文件
  console.log('\n🎯 正在生成Favicon文件...');
  
  // 生成favicon.svg
  const faviconSvgContent = generateFaviconSVG(32);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvgContent);
  console.log('✅ 生成: favicon.svg');

  // 生成不同尺寸的favicon PNG文件
  for (const size of LOGO_CONFIG.faviconSizes) {
    const faviconContent = generateFaviconSVG(size);
    const pngPath = path.join(publicDir, `favicon-${size}x${size}.png`);
    
    const success = await svgToPng(faviconContent, pngPath, size);
    if (success) {
      console.log(`✅ 生成: favicon-${size}x${size}.png`);
    }
  }

  // 生成标准favicon.png (32x32)
  const faviconPngContent = generateFaviconSVG(32);
  const faviconPngPath = path.join(publicDir, '..', 'favicon.png');
  
  const pngSuccess = await svgToPng(faviconPngContent, faviconPngPath, 32);
  if (pngSuccess) {
    console.log('✅ 生成: favicon.png (32x32)');
  }

  // 生成favicon.ico
  await generateIcoFile(publicDir);

  // 生成苹果设备专用图标
  const appleTouchContent = generateSVGLogo(180, false);
  const appleTouchPath = path.join(publicDir, 'apple-touch-icon.png');
  
  const appleSuccess = await svgToPng(appleTouchContent, appleTouchPath, 180);
  if (appleSuccess) {
    console.log('✅ 生成: apple-touch-icon.png (180x180)');
  }
  
  // 生成使用说明
  const readmeContent = `# PWA Logo 和 Favicon 使用说明

## 文件说明

### Logo文件
- \`logo.svg\` - 主Logo (192x192)
- \`logo-{size}x{size}.svg\` - 不同尺寸的Logo
- \`apple-touch-icon.png\` - 苹果设备专用图标 (180x180)

### Favicon文件
- \`favicon.svg\` - SVG图标 (32x32，现代浏览器)
- \`favicon.png\` - PNG图标 (32x32，标准格式)
- \`favicon.ico\` - ICO图标 (兼容老版本浏览器)
- \`favicon-{size}x{size}.png\` - 不同尺寸的PNG favicon

## 在HTML中使用Favicon

\`\`\`html
<!-- 现代浏览器 -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" href="/favicon.png">

<!-- 传统浏览器 -->
<link rel="shortcut icon" href="/favicon.ico">

<!-- 苹果设备 -->
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/images/logo-192x192.svg">
\`\`\`

## 其他使用方式
1. 在public/manifest.json中引用这些图标
2. 在应用中导入Logo组件使用

## 安装依赖生成PNG文件
如需生成PNG和ICO文件，请安装sharp模块：
\`\`\`bash
npm install --save-dev sharp
\`\`\`

生成时间: ${new Date().toISOString()}
`;
  
  fs.writeFileSync(path.join(publicDir, 'LOGO_README.md'), readmeContent);
  
  console.log('\n🎉 所有Logo和Favicon文件生成完成！');
  console.log(`📁 文件位置: ${publicDir}`);
  console.log('📖 查看 LOGO_README.md 了解使用方法');
  
  if (!sharp) {
    console.log('\n💡 提示: 安装 sharp 模块来生成PNG和ICO文件:');
    console.log('   npm install --save-dev sharp');
  }
}

// 执行生成
if (require.main === module) {
  createLogoFiles()
    .then(() => {
      console.log('🎉 所有文件生成完成！');
    })
    .catch(error => {
      console.error('❌ 生成过程中出现错误:', error);
      process.exit(1);
    });
}

module.exports = { generateSVGLogo, generateFaviconSVG, createLogoFiles };