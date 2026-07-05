export default function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse space-y-8">
      {/* Hero skeleton */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-7 w-32 bg-orange-200 rounded-full" />
          <div className="h-7 w-64 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
              <div className="h-40 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section skeleton */}
      {[...Array(2)].map((_, s) => (
        <div key={s}>
          <div className="h-6 w-48 bg-gray-200 rounded-lg mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-3 flex gap-3">
                <div className="w-20 h-20 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
