import Link from "next/link";
import { Nav } from "@/components/nav";
import { TournamentCard } from "@/components/tournament-card";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      selfPlayer: true,
      children: true,
    },
  });
  if (!user) redirect("/login");

  const playerIds = [user.selfPlayer.id, ...user.children.map((c) => c.id)];

  // Upcoming = registrations on draws whose tournament endDate >= today, for me or my children.
  const upcoming = await prisma.registration.findMany({
    where: {
      playerId: { in: playerIds },
      status: { in: ["CONFIRMED", "PENDING_PARTNER"] },
      draw: { tournament: { endDate: { gte: new Date() } } },
    },
    include: {
      player: true,
      draw: { include: { tournament: true } },
    },
    orderBy: { draw: { tournament: { startDate: "asc" } } },
  });

  const organized = await prisma.tournament.findMany({
    where: { organizerId: user.id },
    orderBy: { startDate: "asc" },
  });

  const joinable = await prisma.tournament.findMany({
    where: {
      visibility: "PUBLIC",
      endDate: { gte: new Date() },
      organizerId: { not: user.id },
    },
    orderBy: { startDate: "asc" },
    take: 6,
  });

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">
              Welcome, {user.selfPlayer.firstName}
            </h1>
            <p className="text-sm text-ink-muted">
              Player ID <code className="font-mono">{user.selfPlayer.playerId}</code>
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-full bg-accent-soft px-3 py-2 text-sm font-medium text-accent"
          >
            {user.selfPlayer.firstName[0]}
            {user.selfPlayer.surname[0]}
          </Link>
        </div>

        <Section title="Your upcoming tournaments">
          {upcoming.length === 0 && (
            <p className="text-sm text-ink-muted">
              You're not registered for anything yet. Browse open tournaments below.
            </p>
          )}
          <ul className="divide-y divide-line">
            {upcoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                <Link href={`/t/${r.draw.tournament.slug}`} className="flex-1">
                  <div className="font-medium">{r.draw.tournament.name}</div>
                  <div className="text-xs text-ink-muted">
                    {r.draw.categoryName} · {r.player.firstName} {r.player.surname}
                  </div>
                </Link>
                <span className="text-xs text-ink-muted">
                  {r.draw.tournament.startDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {organized.length > 0 && (
          <Section title="Tournaments you organize">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {organized.map((t) => (
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
            </div>
          </Section>
        )}

        <Section title="Tournaments you can join">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {joinable.map((t) => (
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
            {joinable.length === 0 && (
              <p className="text-sm text-ink-muted">No open tournaments right now.</p>
            )}
          </div>
        </Section>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
