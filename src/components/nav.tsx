import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Nav() {
  const session = await auth();
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-medium">
          <span className="text-accent">●</span>&nbsp;MM26
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="rounded-md px-3 py-1.5 hover:bg-surface-alt">
                Dashboard
              </Link>
              <Link href="/profile" className="rounded-md px-3 py-1.5 hover:bg-surface-alt">
                Profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-md border border-line px-3 py-1.5 hover:bg-surface-alt">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-1.5 hover:bg-surface-alt">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-ink px-3 py-1.5 text-white hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
