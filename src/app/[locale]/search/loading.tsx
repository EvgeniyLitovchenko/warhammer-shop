export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="h-8 w-40 animate-pulse rounded-sm bg-ash/60" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-sm border border-bone/10 bg-ash/40"
          />
        ))}
      </div>
    </main>
  );
}
