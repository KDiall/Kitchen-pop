export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[1fr_340px] gap-10">
      <section>
        <div className="mb-10 pb-6 border-b border-stone-200/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2.5 w-32 bg-stone-200 rounded-full animate-pulse" />
            <div className="h-px flex-1 bg-stone-200" />
            <div className="h-2.5 w-24 bg-stone-200 rounded-full animate-pulse" />
          </div>
          <div className="h-14 w-72 bg-stone-200 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-80 bg-stone-100 rounded animate-pulse mb-1.5" />
          <div className="h-4 w-56 bg-stone-100 rounded animate-pulse" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200/80 p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <div className="h-5 w-2/3 bg-stone-200 rounded animate-pulse" />
                <div className="h-4 w-12 bg-stone-200 rounded animate-pulse shrink-0" />
              </div>
              <div className="h-3 w-1/3 bg-stone-100 rounded animate-pulse mb-5" />
              <div className="flex items-center justify-between">
                <div className="h-3 w-6 bg-stone-100 rounded animate-pulse" />
                <div className="h-8 w-14 bg-stone-200 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="bg-white rounded-xl border border-stone-200/80 p-6 sticky top-24 h-fit">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 bg-stone-200 rounded animate-pulse" />
          <div className="h-3 w-10 bg-stone-100 rounded animate-pulse" />
        </div>
        <div className="h-3.5 w-full bg-stone-100 rounded animate-pulse mb-2" />
        <div className="h-3.5 w-3/4 bg-stone-100 rounded animate-pulse" />
      </aside>
    </div>
  );
}
