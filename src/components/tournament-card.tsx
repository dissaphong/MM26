import Link from "next/link";

type Props = {
  slug: string;
  name: string;
  sport: "TENNIS" | "PADEL";
  location: string;
  startDate: Date;
  endDate: Date;
};

const fmt = (d: Date) =>
  d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

export function TournamentCard({ slug, name, sport, location, startDate, endDate }: Props) {
  return (
    <Link
      href={`/t/${slug}`}
      className="block rounded-md border border-line p-4 transition hover:border-ink-soft"
    >
      <div className="text-xs font-medium uppercase tracking-wide text-accent">
        {sport === "TENNIS" ? "Tennis" : "Padel"}
      </div>
      <div className="mt-1 text-base font-medium">{name}</div>
      <div className="mt-1 text-sm text-ink-muted">
        {location} · {fmt(startDate)}–{fmt(endDate)}
      </div>
    </Link>
  );
}
