// Plain-text email templates. Kept deliberately simple — they convert easily
// to HTML later when we add a real email design.

export function welcomeEmail(args: { firstName: string; playerId: string }) {
  return {
    subject: "Welcome to MM26",
    text: [
      `Hi ${args.firstName},`,
      ``,
      `Your MM26 account is ready. Your player ID is ${args.playerId}.`,
      ``,
      `You can now register for tournaments at any time.`,
      ``,
      `— MM26`,
    ].join("\n"),
  };
}

export function singlesRegistrationEmail(args: {
  firstName: string;
  tournamentName: string;
  drawName: string;
  status: "CONFIRMED" | "WAITLIST";
}) {
  const head =
    args.status === "CONFIRMED"
      ? `You're registered for ${args.drawName} at ${args.tournamentName}.`
      : `You've been added to the waitlist for ${args.drawName} at ${args.tournamentName}.`;
  return {
    subject:
      args.status === "CONFIRMED"
        ? `Registration confirmed — ${args.tournamentName}`
        : `You're on the waitlist — ${args.tournamentName}`,
    text: [
      `Hi ${args.firstName},`,
      ``,
      head,
      ``,
      `We'll email you again when the draw is published.`,
      ``,
      `— MM26`,
    ].join("\n"),
  };
}

export function doublesPendingEmail(args: {
  firstName: string;
  tournamentName: string;
  drawName: string;
  partnerPlayerId: string;
}) {
  return {
    subject: `Doubles registration pending — ${args.tournamentName}`,
    text: [
      `Hi ${args.firstName},`,
      ``,
      `Your registration for ${args.drawName} at ${args.tournamentName} is recorded.`,
      `It will be confirmed once your partner (${args.partnerPlayerId}) logs in and assigns your player ID back.`,
      ``,
      `— MM26`,
    ].join("\n"),
  };
}

export function partnerInviteEmail(args: {
  firstName: string;
  inviterName: string;
  inviterPlayerId: string;
  tournamentName: string;
  drawName: string;
}) {
  return {
    subject: `${args.inviterName} listed you as their doubles partner`,
    text: [
      `Hi ${args.firstName},`,
      ``,
      `${args.inviterName} (${args.inviterPlayerId}) listed you as their doubles partner for ${args.drawName} at ${args.tournamentName}.`,
      ``,
      `To complete the registration, log in to MM26, open the tournament, and register for the same draw — naming ${args.inviterPlayerId} as your partner.`,
      ``,
      `— MM26`,
    ].join("\n"),
  };
}

export function doublesConfirmedEmail(args: {
  firstName: string;
  partnerName: string;
  tournamentName: string;
  drawName: string;
}) {
  return {
    subject: `Doubles registration confirmed — ${args.tournamentName}`,
    text: [
      `Hi ${args.firstName},`,
      ``,
      `You're entered with ${args.partnerName} in ${args.drawName} at ${args.tournamentName}.`,
      ``,
      `We'll email you again when the draw is published.`,
      ``,
      `— MM26`,
    ].join("\n"),
  };
}
