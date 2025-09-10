# PWA Logo 和 Favicon 使用说明

## 文件说明

### Logo文件
- `logo.svg` - 主Logo (192x192)
- `logo-{size}x{size}.svg` - 不同尺寸的Logo
- `apple-touch-icon.png` - 苹果设备专用图标 (180x180)

### Favicon文件
- `favicon.svg` - SVG图标 (32x32，现代浏览器)
- `favicon.png` - PNG图标 (32x32，标准格式)
- `favicon.ico` - ICO图标 (兼容老版本浏览器)
- `favicon-{size}x{size}.png` - 不同尺寸的PNG favicon

## 在HTML中使用Favicon

```html
<!-- 现代浏览器 -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" href="/favicon.png">

<!-- 传统浏览器 -->
<link rel="shortcut icon" href="/favicon.ico">

<!-- 苹果设备 -->
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">

<!-- Android Chrome -->
<link rel="icon" type="image/png" sizes="192x192" href="/images/logo-192x192.svg">
```

## 其他使用方式
1. 在public/manifest.json中引用这些图标
2. 在应用中导入Logo组件使用

## 安装依赖生成PNG文件
如需生成PNG和ICO文件，请安装sharp模块：
```bash
npm install --save-dev sharp
```

生成时间: 2025-09-10T04:35:57.970Z
