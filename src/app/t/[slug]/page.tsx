import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { RegisterButton } from "@/components/register-button";

export default async function TournamentPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const tournament = await prisma.tournament.findUnique({
    where: { slug: params.slug },
    include: {
      draws: {
        orderBy: { startDate: "asc" },
        include: {
          _count: { select: { registrations: true } },
        },
      },
      news: { orderBy: { createdAt: "desc" } },
      organizer: { include: { selfPlayer: true } },
    },
  });
  if (!tournament) return notFound();

  const isOrganizer =
    session?.user && (session.user as { id: string }).id === tournament.organizerId;

  const fmtRange = (a: Date, b: Date) =>
    `${a.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${b.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
              {tournament.sport === "TENNIS" ? "Tennis" : "Padel"} · {tournament.draws.length} draw
              {tournament.draws.length === 1 ? "" : "s"}
            </p>
            <h1 className="mt-1 text-2xl font-medium">{tournament.name}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {tournament.location} · {fmtRange(tournament.startDate, tournament.endDate)}
            </p>
          </div>
          <div className="flex gap-2">
            {isOrganizer && (
              <Link
                href={`/t/${tournament.slug}/manage`}
                className="rounded-md border border-line px-3 py-1.5 text-sm"
              >
                Manage
              </Link>
            )}
          </div>
        </div>

        {/* Tabs (overview only is rendered; others are placeholders for now) */}
        <div className="mt-6 flex gap-6 border-b border-line text-sm">
          <span className="border-b-2 border-ink py-2 font-medium">Overview</span>
          <span className="py-2 text-ink-muted">Draws</span>
          <span className="py-2 text-ink-muted">Players</span>
          <span className="py-2 text-ink-muted">Schedule</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          <section>
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              News & announcements
            </h2>
            <ul className="mt-3 space-y-2">
              {tournament.news.length === 0 && (
                <li className="text-sm text-ink-muted">No announcements yet.</li>
              )}
              {tournament.news.map((n) => (
                <li key={n.id} className="rounded-md bg-surface-alt p-3 text-sm">
                  <div className="font-medium">{n.shortText}</div>
                  <div className="mt-1 text-xs text-ink-soft">
                    {n.createdAt.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside>
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
              Draws in this tournament
            </h2>
            <ul className="mt-3 space-y-2">
              {tournament.draws.map((d) => (
                <li key={d.id} className="rounded-md border border-line p-3">
                  <div className="text-sm font-medium">{d.categoryName}</div>
                  <div className="text-xs text-ink-soft">
                    {d.format} · {d.gender} · {d.ageGroup.replace("PLUS", "").replace(/^U/, "U")}{" "}
                    · {d._count.registrations}
                    {d.playerLimit ? ` / ${d.playerLimit}` : ""} registered
                  </div>
                  <div className="mt-2">
                    <RegisterButton
                      drawId={d.id}
                      drawName={d.categoryName}
                      format={d.format}
                      sport={tournament.sport}
                      isAuthed={!!session?.user}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs text-ink-soft">
              Organized by {tournament.organizer.selfPlayer.firstName}{" "}
              {tournament.organizer.selfPlayer.surname}
            </p>
          </aside>
        </div>
      </main>
    </>
  );
}
