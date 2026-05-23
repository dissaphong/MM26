import { prisma } from "./db";

// Generate the next P-XXXXX style ID. Cheap implementation: take the highest
// existing numeric suffix and add one. For real production traffic we'd switch
// this to a Postgres sequence; the format stays the same.
export async function nextPlayerId(): Promise<string> {
  const last = await prisma.player.findFirst({
    orderBy: { playerId: "desc" },
    select: { playerId: true },
  });
  const lastNum = last?.playerId ? Number(last.playerId.replace(/^P-/, "")) : 0;
  const next = lastNum + 1;
  return `P-${next.toString().padStart(5, "0")}`;
}
