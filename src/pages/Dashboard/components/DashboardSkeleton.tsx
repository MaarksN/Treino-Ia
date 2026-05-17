import { Dumbbell } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <main className="min-h-screen bg-brand-dark px-4 py-8 text-brand-light md:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center gap-4">
          <div className="rounded-[28px] border-2 border-brand-neon bg-brand-neon p-3 text-brand-dark shadow-brutal-neon">
            <Dumbbell className="h-9 w-9" />
          </div>
          <div className="w-full max-w-xl">
            <Skeleton lines={2} />
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-brutal-light md:p-10">
            <Skeleton lines={6} />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Skeleton lines={3} className="rounded-[22px] border border-brand-light/10 p-4" />
              <Skeleton lines={3} className="rounded-[22px] border border-brand-light/10 p-4" />
              <Skeleton lines={3} className="rounded-[22px] border border-brand-light/10 p-4" />
            </div>
          </div>
          <aside className="rounded-[28px] border-4 border-brand-neon bg-brand-dark p-6 shadow-brutal-neon">
            <Skeleton lines={7} />
          </aside>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <Skeleton lines={4} className="rounded-[28px] border-2 border-brand-light/15 bg-brand-gray p-6" />
          <Skeleton lines={4} className="rounded-[28px] border-2 border-brand-light/15 bg-brand-gray p-6" />
          <Skeleton lines={4} className="rounded-[28px] border-2 border-brand-light/15 bg-brand-gray p-6" />
        </section>

        <section className="rounded-[28px] border-4 border-brand-light bg-brand-gray p-6 shadow-brutal-light md:p-8">
          <Skeleton lines={8} />
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Skeleton lines={5} className="rounded-[24px] border-2 border-brand-light/15 bg-brand-dark p-5" />
            <Skeleton lines={5} className="rounded-[24px] border-2 border-brand-light/15 bg-brand-dark p-5" />
          </div>
        </section>
      </div>
    </main>
  );
}
