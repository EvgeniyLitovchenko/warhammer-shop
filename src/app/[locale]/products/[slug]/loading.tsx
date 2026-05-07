export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="h-4 w-40 animate-pulse rounded-sm bg-ash/60" />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-sm bg-ash/40" />
        <div className="flex flex-col gap-4">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-ash/60" />
          <div className="h-10 w-3/4 animate-pulse rounded-sm bg-ash/60" />
          <div className="h-12 w-40 animate-pulse rounded-sm bg-ash/60" />
          <div className="h-4 w-full animate-pulse rounded-sm bg-ash/40" />
          <div className="h-4 w-5/6 animate-pulse rounded-sm bg-ash/40" />
        </div>
      </div>
    </main>
  );
}
