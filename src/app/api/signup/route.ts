import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { nextPlayerId } from "@/lib/player-id";
import { sendMail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

const childSchema = z.object({
  firstName: z.string().min(1),
  surname: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationality: z.string().min(1),
});

const signupSchema = z.object({
  firstName: z.string().min(1),
  surname: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  nationality: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().optional(),
  password: z.string().min(8),
  children: z.array(childSchema).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const selfPlayerId = await nextPlayerId();
    const selfPlayer = await prisma.player.create({
      data: {
        playerId: selfPlayerId,
        firstName: data.firstName,
        surname: data.surname,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        nationality: data.nationality,
        mobile: data.mobile,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await bcrypt.hash(data.password, 10),
        selfPlayerId: selfPlayer.id,
      },
    });

    if (data.children?.length) {
      for (const c of data.children) {
        const cid = await nextPlayerId();
        await prisma.player.create({
          data: {
            playerId: cid,
            firstName: c.firstName,
            surname: c.surname,
            dateOfBirth: new Date(c.dateOfBirth),
            gender: c.gender,
            nationality: c.nationality,
            parentAccountId: user.id,
          },
        });
      }
    }

    // Welcome email. We don't await failures hard — sign up should still succeed.
    try {
      const tmpl = welcomeEmail({ firstName: data.firstName, playerId: selfPlayerId });
      await sendMail({ to: data.email, subject: tmpl.subject, text: tmpl.text });
    } catch (e) {
      console.error("Failed to send welcome email", e);
    }

    return NextResponse.json({ ok: true, playerId: selfPlayerId });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: err.flatten() }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
