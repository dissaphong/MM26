import Link from "next/link";
import { Nav } from "@/components/nav";
import { TournamentCard } from "@/components/tournament-card";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  const tournaments = await prisma.tournament.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { startDate: "asc" },
    take: 12,
  });

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-lg bg-surface-alt p-8 text-center">
          <h1 className="text-2xl font-medium">Tournaments for tennis & padel</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Find a tournament near you, register in seconds, follow live draws.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="#tournaments" className="rounded-md bg-ink px-4 py-2 text-sm text-white">
              Browse tournaments
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-line px-4 py-2 text-sm hover:bg-white"
            >
              Create an account
            </Link>
          </div>
        </section>

        <section id="tournaments" className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Open tournaments
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                slug={t.slug}
                name={t.name}
                sport={t.sport}
                location={t.location}
                startDate={t.startDate}
                endDate={t.endDate}
              />
            ))}
            {tournaments.length === 0 && (
              <p className="text-sm text-ink-muted">No tournaments yet.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
