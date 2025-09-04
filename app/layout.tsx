import type React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import './seo-styles.css';
import Analytics from './analytics';
import { SoundProvider } from '@/contexts/SoundContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: {
    default:
      '情侣飞行棋游戏全集免费在线玩 | 情侣互动游戏手机版 | 真心话大冒险情趣桌游 - 爱情飞行棋',
    template: '%s | 爱情飞行棋 - 情侣游戏专家',
  },
  description:
    '【2025最新】情侣飞行棋游戏全集免费在线玩！融合经典飞行棋+真心话大冒险+情趣挑战任务，超多互动环节让感情迅速升温。支持手机版、电脑版在线游戏，情侣破冰神器，异地恋也能甜蜜互动！立即开玩，体验最火爆的情侣互动游戏！',
  keywords:
    '情侣飞行棋,情侣飞行棋游戏全集,情侣飞行棋手机游戏,情侣飞行棋在线游戏,情侣互动游戏,情侣桌游,情趣情侣礼物,真心话大冒险,情侣破冰游戏,情侣升温游戏,恋爱游戏,增进感情的游戏,异地恋情侣游戏,情侣约会游戏,情侣小游戏,情侣游戏app,情侣游戏手机版,情侣游戏在线玩,双人游戏情侣,情侣互动小游戏,情侣挑战游戏,情侣任务游戏,情人节礼物,情侣礼物推荐,情侣娱乐游戏,couple flight chess,couple board game,couple interactive game,romantic couple gift,valentine gift,love game,relationship building game,long distance relationship game,couple date game,truth or dare,couple icebreaker game,couple bonding game',
  authors: [{ name: '爱情飞行棋' }],
  creator: '爱情飞行棋',
  publisher: '爱情飞行棋',
  robots: 'index, follow',
  icons: {
    icon: [
      {
        url: '/images/logo.png',
        type: 'image/png',
      },
      {
        url: '/favicon.png',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.png',
    apple: [
      {
        url: '/images/logo.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: '情侣飞行棋游戏全集免费在线玩 - 最火爆的情侣互动游戏 | 手机版真心话大冒险',
    description:
      '【2025最新】情侣飞行棋游戏全集免费在线玩！融合经典飞行棋+真心话大冒险+情趣挑战，支持手机版、电脑版，情侣破冰神器，异地恋也能甜蜜互动！立即开玩最火爆的情侣游戏！',
    url: 'https://cpflying.vercel.app',
    siteName: '爱情飞行棋 - 情侣游戏专家',
    images: [
      {
        url: 'https://cpflying.vercel.app/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '情侣飞行棋游戏全集 - 免费在线情侣互动游戏',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '情侣飞行棋游戏全集免费在线玩 - 最火爆的情侣互动游戏',
    description:
      '【2025最新】情侣飞行棋游戏全集免费在线玩！融合经典飞行棋+真心话大冒险+情趣挑战，支持手机版、电脑版，立即开玩！',
    images: ['https://cpflying.vercel.app/images/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://cpflying.vercel.app',
    languages: {
      'zh-CN': 'https://cpflying.vercel.app',
      en: 'https://cpflying.vercel.app/en',
      ja: 'https://cpflying.vercel.app/ja',
    },
  },
  other: {
    'baidu-site-verification': 'your-baidu-verification-code',
    '360-site-verification': 'your-360-verification-code',
    sogou_site_verification: 'your-sogou-verification-code',
    'shenma-site-verification': 'your-shenma-verification-code',
  },
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://cpflying.vercel.app" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
     
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />

        {/* PWA 相关设置 */}
        <meta name="theme-color" content="#d1d1d1ff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1a1a2e" />

        <meta httpEquiv="Permissions-Policy" content="interest-cohort=()" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="爱情飞行棋" />
        <link rel="apple-touch-icon" href="/images/logo-192x192.png" />
        <link rel="apple-touch-startup-image" href="/images/splash-screen.png" />
        {/* 针对移动端搜索优化 */}
        <meta name="mobile-web-compatible" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* 百度移动适配 */}
        <meta name="applicable-device" content="pc,mobile" />
        <meta name="MobileOptimized" content="width" />
        <meta name="HandheldFriendly" content="true" />

        <Analytics />
      </head>
      <body>
        <SoundProvider>
          <ThemeProvider>
           {children}
          </ThemeProvider>
        </SoundProvider>
        {/* PWA 安装提示 */}
        <div id="pwa-prompt" className="pwa-prompt">
          <div className="pwa-prompt-inner">
            <div className="pwa-prompt-icon">📱</div>
            <div className="pwa-prompt-content">
              <h3>添加到主屏幕</h3>
              <p>获得更好的游戏体验</p>
              <div className="pwa-prompt-instructions">
                <span className="ios-instruction">
                  点击分享按钮 <span className="share-icon">⬆️</span> 然后选择"添加到主屏幕"
                </span>
                <span className="android-instruction">点击菜单，选择"添加到主屏幕"</span>
              </div>
            </div>
            <button id="close-pwa-prompt" className="close-pwa-prompt">
              ×
            </button>
          </div>
        </div>

        {/* PWA 小图标 */}
        <div id="pwa-mini-icon" className="pwa-mini-icon" title="添加到主屏幕">
          <span>📱</span>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `

          function updateThemeColor(color) {
              const themeColorMeta = document.querySelector('meta[name="theme-color"]');
              if (themeColorMeta) {
                themeColorMeta.setAttribute('content', color);
              }
          }

            // 监听主题变化
          function initThemeColorSync() {
              // 检测系统主题偏好
              const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

              function updateThemeBasedOnPreference(e) {
                if (e.matches) {
                  updateThemeColor('#1a1a2e'); // 暗色主题
                } else {
                  updateThemeColor('#d1d1d1ff'); // 亮色主题
                }
              }

              darkModeMediaQuery.addListener(updateThemeBasedOnPreference);
              updateThemeBasedOnPreference(darkModeMediaQuery);

              // 如果你有自定义主题切换逻辑，也可以在这里处理
              window.addEventListener('themeChange', function(e) {
                updateThemeColor(e.detail.color);
              });
          }

          initThemeColorSync();

          // 检测移动设备
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
          const isAndroid = /Android/i.test(navigator.userAgent);
          const isInStandaloneMode = ('standalone' in window.navigator && window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches;
          
          // 只在移动端且未添加到主屏幕时处理
          if (isMobile && !isInStandaloneMode) {
            const prompt = document.getElementById('pwa-prompt');
            const miniIcon = document.getElementById('pwa-mini-icon');
            const closeBtn = document.getElementById('close-pwa-prompt');
            const promptShownKey = 'pwaPromptShown';
            
            // 显示对应平台的说明文字
            if (isIos) {
              document.querySelector('.ios-instruction').style.display = 'block';
              document.querySelector('.android-instruction').style.display = 'none';
            } else if (isAndroid) {
              document.querySelector('.ios-instruction').style.display = 'none';
              document.querySelector('.android-instruction').style.display = 'block';
            }
            
            // 检查是否第一次访问
            const hasShownPrompt = localStorage.getItem(promptShownKey);
            
            if (!hasShownPrompt) {
              // 第一次访问，显示完整提示
              setTimeout(() => {
                prompt.style.display = 'flex';
              }, 1500); // 延迟1.5秒显示，避免打断游戏
            } else {
              // 非第一次访问，显示小图标
              miniIcon.style.display = 'flex';
            }
            
            // 关闭提示事件
            closeBtn.addEventListener('click', () => {
              prompt.style.display = 'none';
              miniIcon.style.display = 'flex';
              localStorage.setItem(promptShownKey, 'true');
            });
            
            // 点击小图标重新显示提示
            miniIcon.addEventListener('click', () => {
              miniIcon.style.display = 'none';
              prompt.style.display = 'flex';
            });
            
            // 自动隐藏提示（10秒后）
            if (!hasShownPrompt) {
              setTimeout(() => {
                if (prompt.style.display === 'flex') {
                  prompt.style.display = 'none';
                  miniIcon.style.display = 'flex';
                  localStorage.setItem(promptShownKey, 'true');
                }
              }, 10000);
            }
          }
        `,
          }}
        />
      </body>
    </html>
  );
}
