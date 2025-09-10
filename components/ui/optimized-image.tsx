'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.png',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 懒加载逻辑
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // 提前100px开始加载
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [priority, isInView]);

  // 处理图片加载成功
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  // 处理图片加载失败
  const handleError = () => {
    setIsError(true);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  // 生成WebP格式的URL（如果支持）
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.includes('data:') || originalSrc.includes('blob:')) {
      return originalSrc;
    }
    
    // 检查浏览器是否支持WebP (仅在客户端)
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      
      if (supportsWebP && !originalSrc.includes('.webp')) {
        // 可以在这里添加转换为WebP的逻辑
        // 例如：通过图片CDN服务或者Next.js Image优化
        return originalSrc;
      }
    }
    
    return originalSrc;
  };

  // 如果不在视窗内且不是优先加载，显示占位符
  if (!isInView && !priority) {
    return (
      <div
        ref={imgRef}
        className={cn('relative overflow-hidden', className)}
        style={{ width, height }}
      >
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* 模糊占位符 */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110 filter blur-md"
        />
      )}

      {/* 骨架屏占位符 */}
      {!isLoaded && placeholder === 'empty' && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={getOptimizedSrc(currentSrc)}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          imageRendering: (quality > 90 ? 'high-quality' : 'auto') as React.CSSProperties['imageRendering'],
        }}
      />

      {/* 加载失败的提示 */}
      {isError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">图片加载失败</span>
          </div>
        </div>
      )}

      {/* 加载指示器 */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

// Hook for preloading images
export const useImagePreloader = () => {
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = async (srcs: string[]): Promise<void[]> => {
    return Promise.all(srcs.map(preloadImage));
  };

  return { preloadImage, preloadImages };
};

export default OptimizedImage;