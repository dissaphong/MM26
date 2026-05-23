"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  drawId: string;
  drawName: string;
  format: "SINGLES" | "DOUBLES";
  sport: "TENNIS" | "PADEL";
  isAuthed: boolean;
};

type Me = {
  selfPlayer: { id: string; firstName: string; surname: string; playerId: string };
  children: { id: string; firstName: string; surname: string; playerId: string }[];
};

export function RegisterButton({ drawId, drawName, format, sport, isAuthed }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [partner, setPartner] = useState("");
  const [utr, setUtr] = useState("");
  const [wtn, setWtn] = useState("");
  const [level, setLevel] = useState("");
  const [padelLevel, setPadelLevel] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function openModal() {
    if (!isAuthed) {
      router.push(`/login?from=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setErr(null);
    setDone(false);
    setOpen(true);
    if (!me) {
      const r = await fetch("/api/me");
      if (r.ok) {
        const data = (await r.json()) as Me;
        setMe(data);
        setPlayerId(data.selfPlayer.id);
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch(`/api/draws/${drawId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerInternalId: playerId,
        partnerPlayerId: format === "DOUBLES" ? partner.trim() : undefined,
        utr: utr ? Number(utr) : undefined,
        wtn: wtn ? Number(wtn) : undefined,
        tennisLevel: level ? Number(level) : undefined,
        padelLevel: padelLevel ? Number(padelLevel) : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Could not register.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={openModal}
        className="w-full rounded-md bg-ink px-3 py-1.5 text-sm text-white"
      >
        Register
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Register · {drawName}</h3>
              <button onClick={() => setOpen(false)} className="text-sm text-ink-muted">
                Close
              </button>
            </div>

            {done ? (
              <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
                Registration submitted. A confirmation email will be sent.
              </div>
            ) : (
              <form onSubmit={submit} className="mt-3 space-y-3">
                <div>
                  <label className="text-xs text-ink-muted">Registering as</label>
                  <select
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="mt-1 w-full rounded-md border-line"
                  >
                    {me && (
                      <>
                        <option value={me.selfPlayer.id}>
                          {me.selfPlayer.firstName} {me.selfPlayer.surname} ({me.selfPlayer.playerId})
                          — me
                        </option>
                        {me.children.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.firstName} {c.surname} ({c.playerId}) — child
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                {format === "DOUBLES" && (
                  <div>
                    <label className="text-xs text-ink-muted">Partner's player ID</label>
                    <input
                      value={partner}
                      onChange={(e) => setPartner(e.target.value.toUpperCase())}
                      placeholder="P-00204"
                      className="mt-1 w-full rounded-md border-line font-mono"
                      required
                    />
                    <p className="mt-1 text-xs text-ink-soft">
                      Your partner must log in and assign your ID back to confirm the pair.
                    </p>
                  </div>
                )}

                {sport === "TENNIS" ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-ink-muted">UTR</label>
                      <input
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        className="mt-1 w-full rounded-md border-line"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted">WTN</label>
                      <input
                        value={wtn}
                        onChange={(e) => setWtn(e.target.value)}
                        className="mt-1 w-full rounded-md border-line"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-ink-muted">Level</label>
                      <input
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="mt-1 w-full rounded-md border-line"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs text-ink-muted">Padel level</label>
                    <input
                      value={padelLevel}
                      onChange={(e) => setPadelLevel(e.target.value)}
                      className="mt-1 w-full rounded-md border-line"
                    />
                  </div>
                )}

                {err && <p className="text-sm text-red-600">{err}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {loading ? "Submitting…" : format === "DOUBLES" ? "Submit (awaits partner)" : "Submit registration"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
