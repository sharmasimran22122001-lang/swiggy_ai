export default function SwiggyShimmer() {
  return (
    <div className="px-4 py-4 space-y-6 pb-24">
      {/* Banner shimmer */}
      <div className="h-44 rounded-3xl shimmer mx-0" />

      {/* Category row shimmer */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-full shimmer" />
            <div className="w-12 h-2.5 rounded shimmer" />
          </div>
        ))}
      </div>

      {/* Section shimmer */}
      <div>
        <div className="w-48 h-5 rounded shimmer mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden border border-gray-100">
              <div className="h-40 shimmer" />
              <div className="p-3 space-y-2">
                <div className="w-3/4 h-4 rounded shimmer" />
                <div className="w-1/2 h-3 rounded shimmer" />
                <div className="w-2/3 h-3 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
