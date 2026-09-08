import { Nav } from "@/components/Nav";

export default function Loading() {
  return (
    <>
      <Nav />
      <main className="flex-1" aria-busy="true" aria-live="polite">
        <div className="mx-auto max-w-3xl animate-pulse px-4 py-14 sm:px-6">
          <div className="h-9 w-40 rounded-full bg-[var(--surface-2)]" />
          <div className="mt-3 h-4 w-64 rounded-full bg-[var(--surface-2)]" />
          <div className="mt-10 h-44 rounded-[var(--radius-card)] bg-[var(--surface-2)]" />
          <div className="mt-6 h-72 rounded-[var(--radius-card)] bg-[var(--surface-2)]" />
          <p className="sr-only">불러오는 중</p>
        </div>
      </main>
    </>
  );
}
