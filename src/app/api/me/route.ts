import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { selfPlayer: true, children: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    selfPlayer: {
      id: user.selfPlayer.id,
      firstName: user.selfPlayer.firstName,
      surname: user.selfPlayer.surname,
      playerId: user.selfPlayer.playerId,
    },
    children: user.children.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      surname: c.surname,
      playerId: c.playerId,
    })),
  });
}
