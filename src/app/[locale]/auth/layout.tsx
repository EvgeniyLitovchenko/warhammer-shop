export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-grain px-6 py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-ash via-steel/30 to-ash" />
      <div className="relative w-full max-w-md rounded-sm border border-bone/10 bg-ash/60 p-8 shadow-2xl backdrop-blur">
        {children}
      </div>
    </main>
  );
}
