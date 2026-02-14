interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_infinite]',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <Skeleton variant="text" width="60%" height={32} className="mb-2" />
      <Skeleton variant="text" width="30%" height={16} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <Skeleton variant="text" width="100%" height={24} />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} variant="text" width="100%" height={20} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Skeleton variant="text" width="40%" height={24} className="mb-4" />
      <Skeleton variant="rectangular" width="100%" height={height} />
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="40%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Default export for backward compatibility
export default Skeleton;
