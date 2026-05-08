export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="h-10 w-48 animate-pulse rounded-sm bg-ash/60" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-sm border border-bone/10 bg-ash/40"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-sm border border-bone/10 bg-ash/40" />
      </div>
    </main>
  );
}
