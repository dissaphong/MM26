import { PrismaClient, Sport, DrawFormat, DrawGender, AgeGroup, Gender, TournamentVisibility } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Format an integer as P-XXXXX.
function pid(n: number) {
  return `P-${n.toString().padStart(5, "0")}`;
}

async function main() {
  console.log("Seeding...");

  // Clear in dependency order.
  await prisma.match.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.newsPost.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany();
  await prisma.player.deleteMany();

  // --- Organizer account ---
  const organizerPlayer = await prisma.player.create({
    data: {
      playerId: pid(1),
      firstName: "Olivia",
      surname: "Reyes",
      dateOfBirth: new Date("1985-03-12"),
      gender: Gender.FEMALE,
      nationality: "Spain",
    },
  });
  const organizer = await prisma.user.create({
    data: {
      email: "organizer@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      selfPlayerId: organizerPlayer.id,
      emailVerified: new Date(),
    },
  });

  // --- Demo user (Alex) with a child (Mia) ---
  const alexPlayer = await prisma.player.create({
    data: {
      playerId: pid(102),
      firstName: "Alex",
      surname: "García",
      dateOfBirth: new Date("1992-04-18"),
      gender: Gender.MALE,
      nationality: "Spain",
      mobile: "+34 600 000 000",
    },
  });
  const alex = await prisma.user.create({
    data: {
      email: "alex@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      selfPlayerId: alexPlayer.id,
      emailVerified: new Date(),
    },
  });
  await prisma.player.create({
    data: {
      playerId: pid(482),
      firstName: "Mia",
      surname: "García",
      dateOfBirth: new Date("2012-09-03"),
      gender: Gender.FEMALE,
      nationality: "Spain",
      parentAccountId: alex.id,
    },
  });

  // --- A few other players ---
  const others = await Promise.all(
    [
      ["Sara", "Ahmed", "1990-06-21", Gender.FEMALE, "UK", 204],
      ["Kenji", "Tanaka", "1988-11-02", Gender.MALE, "Japan", 311],
      ["Júlia", "Silva", "1991-02-15", Gender.FEMALE, "Brazil", 789],
      ["Rafael", "Ortiz", "1993-08-30", Gender.MALE, "Mexico", 516],
      ["Maria", "Costa", "1989-12-05", Gender.FEMALE, "Portugal", 622],
    ].map(([fn, sn, dob, g, nat, n]) =>
      prisma.player.create({
        data: {
          playerId: pid(n as number),
          firstName: fn as string,
          surname: sn as string,
          dateOfBirth: new Date(dob as string),
          gender: g as Gender,
          nationality: nat as string,
        },
      }),
    ),
  );

  // --- Tournament: Spring Open 2026 ---
  const spring = await prisma.tournament.create({
    data: {
      slug: "spring-open-2026",
      name: "Spring Open 2026",
      sport: Sport.TENNIS,
      location: "Madrid, Spain",
      startDate: new Date("2026-05-22"),
      endDate: new Date("2026-05-26"),
      visibility: TournamentVisibility.PUBLIC,
      organizerId: organizer.id,
      overallLimit: 192,
    },
  });

  const mensOpen = await prisma.draw.create({
    data: {
      tournamentId: spring.id,
      categoryName: "Men's Open Singles",
      format: DrawFormat.SINGLES,
      ageGroup: AgeGroup.OPEN,
      gender: DrawGender.MENS,
      startDate: new Date("2026-05-22"),
      endDate: new Date("2026-05-26"),
      playerLimit: 64,
      isPublished: true,
    },
  });

  await prisma.draw.create({
    data: {
      tournamentId: spring.id,
      categoryName: "Women's Open Singles",
      format: DrawFormat.SINGLES,
      ageGroup: AgeGroup.OPEN,
      gender: DrawGender.WOMENS,
      startDate: new Date("2026-05-22"),
      endDate: new Date("2026-05-26"),
      playerLimit: 32,
      isPublished: true,
    },
  });

  // Register a few players in Men's Open Singles.
  for (const p of [alexPlayer, ...others.slice(1, 5)]) {
    await prisma.registration.create({
      data: {
        drawId: mensOpen.id,
        playerId: p.id,
        utr: 9 + Math.random() * 2,
        tennisLevel: 4.5,
      },
    });
  }

  // News posts.
  await prisma.newsPost.createMany({
    data: [
      {
        tournamentId: spring.id,
        shortText: "Welcome from the organizers",
        body: "Welcome to the Spring Open. Here's everything you need to know before the first ball is hit.",
      },
      {
        tournamentId: spring.id,
        shortText: "Order of play released",
        body: "Today's draw is now live. Matches start at 10:00 on Court 1.",
      },
    ],
  });

  // --- A second tournament so the list isn't lonely ---
  await prisma.tournament.create({
    data: {
      slug: "coast-cup-2026",
      name: "Coast Cup",
      sport: Sport.PADEL,
      location: "Barcelona, Spain",
      startDate: new Date("2026-06-04"),
      endDate: new Date("2026-06-07"),
      visibility: TournamentVisibility.PUBLIC,
      organizerId: organizer.id,
      draws: {
        create: [
          {
            categoryName: "Mixed Doubles Open",
            format: DrawFormat.DOUBLES,
            ageGroup: AgeGroup.OPEN,
            gender: DrawGender.MIXED,
            startDate: new Date("2026-06-04"),
            endDate: new Date("2026-06-07"),
            playerLimit: 32,
            isPublished: true,
          },
        ],
      },
    },
  });

  console.log("Done. Try logging in as alex@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
