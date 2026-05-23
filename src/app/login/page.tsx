import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
