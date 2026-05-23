import { Nav } from "@/components/nav";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { selfPlayer: true, children: true },
  });
  if (!user) redirect("/login");

  const me = user.selfPlayer;

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-lg font-medium text-accent">
            {me.firstName[0]}
            {me.surname[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-medium">
              {me.firstName} {me.surname}
            </h1>
            <p className="text-sm text-ink-muted">
              {user.email} · Player ID <code className="font-mono">{me.playerId}</code>
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="rounded-md border border-line px-3 py-1.5 text-sm">Log out</button>
          </form>
        </div>

        <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-ink-muted">
          Account details
        </h2>
        <dl className="mt-3 grid grid-cols-[140px_1fr] gap-y-1 text-sm">
          <dt className="text-ink-muted">First name</dt>
          <dd>{me.firstName}</dd>
          <dt className="text-ink-muted">Surname</dt>
          <dd>{me.surname}</dd>
          <dt className="text-ink-muted">Date of birth</dt>
          <dd>{fmt(me.dateOfBirth)}</dd>
          <dt className="text-ink-muted">Gender</dt>
          <dd>{me.gender}</dd>
          <dt className="text-ink-muted">Nationality</dt>
          <dd>{me.nationality}</dd>
          <dt className="text-ink-muted">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-ink-muted">Mobile</dt>
          <dd>{me.mobile ?? "—"}</dd>
        </dl>

        {user.children.length > 0 && (
          <>
            <h2 className="mt-8 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Children on this account
            </h2>
            <ul className="mt-3 divide-y divide-line">
              {user.children.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-800">
                    {c.firstName[0]}
                    {c.surname[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {c.firstName} {c.surname}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {fmt(c.dateOfBirth)} · {c.nationality} · Player ID{" "}
                      <code className="font-mono">{c.playerId}</code>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="mt-8 text-xs text-ink-soft">
          Profile editing is read-only for now. Editable fields will come later.
        </p>
      </main>
    </>
  );
}
