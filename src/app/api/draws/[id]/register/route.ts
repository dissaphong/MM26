import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/email";
import {
  singlesRegistrationEmail,
  doublesPendingEmail,
  doublesConfirmedEmail,
  partnerInviteEmail,
} from "@/lib/email-templates";

const schema = z.object({
  playerInternalId: z.string().min(1),
  partnerPlayerId: z.string().optional(),
  utr: z.number().optional(),
  wtn: z.number().optional(),
  tennisLevel: z.number().optional(),
  padelLevel: z.number().optional(),
});

// Best-effort email send — never throws.
async function safeSend(to: string | null | undefined, subject: string, text: string) {
  if (!to) return;
  try {
    await sendMail({ to, subject, text });
  } catch (e) {
    console.error("Failed to send mail to", to, e);
  }
}

// A player is either an account holder or a child of an account.
// The contact email is the account holder's email in both cases.
async function contactEmailForPlayerId(playerId: string): Promise<{ email: string; firstName: string } | null> {
  const p = await prisma.player.findUnique({
    where: { id: playerId },
    include: { ownedByUser: true, parentAccount: { include: { selfPlayer: true } } },
  });
  if (!p) return null;
  if (p.ownedByUser) {
    return { email: p.ownedByUser.email, firstName: p.firstName };
  }
  if (p.parentAccount) {
    return { email: p.parentAccount.email, firstName: p.parentAccount.selfPlayer.firstName };
  }
  return null;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  let body;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // The player must be the account holder or one of their children.
  const player = await prisma.player.findFirst({
    where: {
      id: body.playerInternalId,
      OR: [{ ownedByUser: { id: userId } }, { parentAccountId: userId }],
    },
  });
  if (!player) {
    return NextResponse.json({ error: "You can only register yourself or your children." }, { status: 403 });
  }

  const draw = await prisma.draw.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { registrations: true } },
      tournament: true,
    },
  });
  if (!draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });

  // Bail if already registered for this draw.
  const existing = await prisma.registration.findFirst({
    where: { drawId: draw.id, playerId: player.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Already registered for this draw." }, { status: 409 });
  }

  const isDoubles = draw.format === "DOUBLES";
  const isFull = !!draw.playerLimit && draw._count.registrations >= draw.playerLimit;

  if (isDoubles && !body.partnerPlayerId) {
    return NextResponse.json({ error: "Partner player ID is required for doubles." }, { status: 400 });
  }

  const initialStatus: "PENDING_PARTNER" | "WAITLIST" | "CONFIRMED" = isDoubles
    ? "PENDING_PARTNER"
    : isFull
      ? "WAITLIST"
      : "CONFIRMED";

  const created = await prisma.registration.create({
    data: {
      drawId: draw.id,
      playerId: player.id,
      status: initialStatus,
      utr: body.utr,
      wtn: body.wtn,
      tennisLevel: body.tennisLevel,
      padelLevel: body.padelLevel,
      assignedPartnerPlayerId: body.partnerPlayerId,
    },
  });

  const myContact = await contactEmailForPlayerId(player.id);

  if (!isDoubles) {
    // Singles → immediate registration email (CONFIRMED or WAITLIST).
    const tmpl = singlesRegistrationEmail({
      firstName: myContact?.firstName ?? player.firstName,
      tournamentName: draw.tournament.name,
      drawName: draw.categoryName,
      status: initialStatus as "CONFIRMED" | "WAITLIST",
    });
    await safeSend(myContact?.email, tmpl.subject, tmpl.text);
    return NextResponse.json({ ok: true, registrationId: created.id });
  }

  // Doubles flow.
  // 1) Always email the registrant that we're waiting on their partner.
  {
    const tmpl = doublesPendingEmail({
      firstName: myContact?.firstName ?? player.firstName,
      tournamentName: draw.tournament.name,
      drawName: draw.categoryName,
      partnerPlayerId: body.partnerPlayerId!,
    });
    await safeSend(myContact?.email, tmpl.subject, tmpl.text);
  }

  // 2) Try to auto-match: did the partner already register and name THIS player back?
  const counterpart = await prisma.registration.findFirst({
    where: {
      drawId: draw.id,
      status: "PENDING_PARTNER",
      player: { playerId: body.partnerPlayerId },
      assignedPartnerPlayerId: player.playerId,
    },
    include: { player: true },
  });

  if (counterpart) {
    await prisma.$transaction([
      prisma.registration.update({
        where: { id: created.id },
        data: { status: "CONFIRMED", partnerRegistrationId: counterpart.id },
      }),
      prisma.registration.update({
        where: { id: counterpart.id },
        data: { status: "CONFIRMED", partnerRegistrationId: created.id },
      }),
    ]);

    // Send mutual confirmation to both sides.
    const partnerContact = await contactEmailForPlayerId(counterpart.playerId);

    const meTmpl = doublesConfirmedEmail({
      firstName: myContact?.firstName ?? player.firstName,
      partnerName: `${counterpart.player.firstName} ${counterpart.player.surname}`,
      tournamentName: draw.tournament.name,
      drawName: draw.categoryName,
    });
    await safeSend(myContact?.email, meTmpl.subject, meTmpl.text);

    const partnerTmpl = doublesConfirmedEmail({
      firstName: partnerContact?.firstName ?? counterpart.player.firstName,
      partnerName: `${player.firstName} ${player.surname}`,
      tournamentName: draw.tournament.name,
      drawName: draw.categoryName,
    });
    await safeSend(partnerContact?.email, partnerTmpl.subject, partnerTmpl.text);

    return NextResponse.json({ ok: true, registrationId: created.id, matched: true });
  }

  // 3) Not matched yet — invite the partner if we can find their email.
  const invitedPartner = await prisma.player.findUnique({
    where: { playerId: body.partnerPlayerId! },
    include: { ownedByUser: true, parentAccount: { include: { selfPlayer: true } } },
  });

  if (invitedPartner) {
    const invitedContact = invitedPartner.ownedByUser
      ? { email: invitedPartner.ownedByUser.email, firstName: invitedPartner.firstName }
      : invitedPartner.parentAccount
        ? {
            email: invitedPartner.parentAccount.email,
            firstName: invitedPartner.parentAccount.selfPlayer.firstName,
          }
        : null;

    if (invitedContact) {
      const tmpl = partnerInviteEmail({
        firstName: invitedContact.firstName,
        inviterName: `${player.firstName} ${player.surname}`,
        inviterPlayerId: player.playerId,
        tournamentName: draw.tournament.name,
        drawName: draw.categoryName,
      });
      await safeSend(invitedContact.email, tmpl.subject, tmpl.text);
    }
  }

  return NextResponse.json({ ok: true, registrationId: created.id, matched: false });
}
