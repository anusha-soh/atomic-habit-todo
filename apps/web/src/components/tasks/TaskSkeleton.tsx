/**
 * TaskSkeleton Component
 * Phase 2 Chunk 2 - Polish (T146)
 *
 * Provides a loading state for TaskCard
 */
export function TaskSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            
            {/* Badges skeleton */}
            <div className="flex gap-2">
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-12"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-1">
          <div className="h-5 bg-gray-200 rounded-full w-12"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
          <div className="h-5 bg-gray-200 rounded-full w-14"></div>
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>
    </div>
  );
}
