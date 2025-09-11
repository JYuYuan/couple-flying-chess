import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
        className,
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      {...props}
    />
  );
}

// 游戏板骨架屏
function GameBoardSkeleton() {
  return (
    <div className="w-full aspect-square">
      <div className="relative w-full h-full p-3 rounded-3xl shadow-2xl border bg-white/90 dark:bg-gray-900/90">
        <div className="grid grid-cols-7 grid-rows-7 gap-2 w-full h-full p-4">
          {Array.from({ length: 49 }).map((_, index) => (
            <Skeleton
              key={index}
              className="aspect-square rounded-2xl"
              style={{
                animationDelay: `${index * 0.02}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 游戏模式选择骨架屏
function GameModeSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="backdrop-blur-xl rounded-2xl p-6 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" style={{ animationDelay: `${index * 0.1}s` }} />
              <Skeleton className="h-4 w-48" style={{ animationDelay: `${index * 0.1 + 0.05}s` }} />
            </div>
            <Skeleton
              className="w-16 h-10 rounded-lg"
              style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// 自定义模式卡片骨架屏
function CustomModeCardSkeleton() {
  return (
    <div className="backdrop-blur-xl rounded-2xl p-4 bg-white/70 dark:bg-gray-900/70 border border-white/30 dark:border-gray-700/30">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-3" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-12 rounded-lg" />
      </div>
    </div>
  );
}

// 任务模态框骨架屏
function TaskModalSkeleton() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="flex-1 h-12 rounded-2xl" />
            <Skeleton className="flex-1 h-12 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 页面级骨架屏
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      {/* 头部区域 */}
      <div className="backdrop-blur-xl border-b bg-white/80 dark:bg-gray-900/80 p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="w-32 h-10 rounded-2xl" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6 space-y-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 w-full rounded-3xl mb-6" />
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-20 w-full rounded-2xl"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  GameBoardSkeleton,
  GameModeSkeleton,
  CustomModeCardSkeleton,
  TaskModalSkeleton,
  PageSkeleton,
};
