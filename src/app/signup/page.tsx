"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

type Child = {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
};

const blankChild = (): Child => ({
  firstName: "",
  surname: "",
  dateOfBirth: "",
  gender: "MALE",
  nationality: "",
});

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    dateOfBirth: "",
    gender: "MALE",
    nationality: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  const [children, setChildren] = useState<Child[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (form.password !== form.confirm) {
      setErr("Passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, children }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Could not create account.");
      setLoading(false);
      return;
    }
    // Auto sign-in.
    await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-xl font-medium">Create your account</h1>
      <p className="mt-1 text-sm text-ink-muted">
        You'll register for tournaments separately after signing up.
      </p>

      <form className="mt-6 space-y-3" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" value={form.firstName} onChange={(v) => update("firstName", v)} />
          <Field label="Surname" value={form.surname} onChange={(v) => update("surname", v)} />
          <Field label="Date of birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} />
          <div>
            <label className="text-xs text-ink-muted">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value as typeof form.gender)}
              className="mt-1 w-full rounded-md border-line"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Field label="Nationality" value={form.nationality} onChange={(v) => update("nationality", v)} />
          <Field label="Mobile number" value={form.mobile} onChange={(v) => update("mobile", v)} required={false} />
        </div>
        <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} />
          <Field label="Confirm password" type="password" value={form.confirm} onChange={(v) => update("confirm", v)} />
        </div>

        <div className="rounded-md border border-dashed border-line p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Add a child to your account</span>
            <button
              type="button"
              onClick={() => setChildren([...children, blankChild()])}
              className="rounded-md border border-line px-3 py-1.5 text-sm"
            >
              + Add child
            </button>
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            For parents/guardians registering on behalf of minors.
          </p>

          {children.map((c, i) => (
            <div key={i} className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3">
              <Field label="Child first name" value={c.firstName} onChange={(v) => setChildren(children.map((x, j) => j === i ? { ...x, firstName: v } : x))} />
              <Field label="Surname" value={c.surname} onChange={(v) => setChildren(children.map((x, j) => j === i ? { ...x, surname: v } : x))} />
              <Field label="Date of birth" type="date" value={c.dateOfBirth} onChange={(v) => setChildren(children.map((x, j) => j === i ? { ...x, dateOfBirth: v } : x))} />
              <div>
                <label className="text-xs text-ink-muted">Gender</label>
                <select
                  value={c.gender}
                  onChange={(e) =>
                    setChildren(children.map((x, j) => j === i ? { ...x, gender: e.target.value as Child["gender"] } : x))
                  }
                  className="mt-1 w-full rounded-md border-line"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <Field label="Nationality" value={c.nationality} onChange={(v) => setChildren(children.map((x, j) => j === i ? { ...x, nationality: v } : x))} />
              <div className="col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => setChildren(children.filter((_, j) => j !== i))}
                  className="text-xs text-red-600"
                >
                  Remove child
                </button>
              </div>
            </div>
          ))}
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Log in
        </Link>
      </p>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-ink-muted">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border-line"
      />
    </div>
  );
}
