// One-off seed script for Championsito ST 26.
// Run with: pnpm --filter @workspace/scripts run seed:championsito
import { db, matchesTable, participantsTable, participantTeamsTable, teamsTable } from "@workspace/db";

// Squadre ufficialmente qualificate alla Champions League 2025/26, raggruppate per fascia.
const TEAMS_BY_POT: Record<number, string[]> = {
  1: ["Paris Saint-Germain", "Real Madrid", "Manchester City", "Bayern Monaco", "Liverpool", "Inter", "Chelsea", "Borussia Dortmund"],
  2: ["Barcellona", "Bayer Leverkusen", "Arsenal", "Club Brugge", "Atletico Madrid", "Atalanta", "Juventus", "Benfica"],
  3: ["Newcastle United", "Villarreal", "PSV Eindhoven", "Napoli", "Olympiacos", "Sporting CP", "Eintracht Francoforte", "Union Saint-Gilloise"],
  4: ["Ajax", "Bodo/Glimt", "Slavia Praga", "Kairat Almaty", "Copenaghen", "Marsiglia", "Monaco", "Galatasaray"],
};

async function seed() {
  const existing = await db.select().from(teamsTable);
  if (existing.length > 0) {
    console.log(`Skip: ${existing.length} teams already present.`);
    return;
  }

  const insertedTeams: (typeof teamsTable.$inferSelect)[] = [];
  for (const [potNumberStr, names] of Object.entries(TEAMS_BY_POT)) {
    const potNumber = Number(potNumberStr);
    const rows = await db
      .insert(teamsTable)
      .values(names.map((name) => ({ name, potNumber })))
      .returning();
    insertedTeams.push(...rows);
  }
  console.log(`Inserted ${insertedTeams.length} teams.`);

  const byPot = (pot: number) => insertedTeams.filter((team) => team.potNumber === pot);

  const participantsSeed = [
    { name: "Marco Rossi", picks: [byPot(1)[0], byPot(1)[1], byPot(2)[0], byPot(2)[1], byPot(3)[0], byPot(3)[1], byPot(4)[0], byPot(4)[1]] },
    { name: "Giulia Bianchi", picks: [byPot(1)[2], byPot(1)[3], byPot(2)[2], byPot(2)[3], byPot(3)[2], byPot(3)[3], byPot(4)[2], byPot(4)[3]] },
    { name: "Luca Ferrari", picks: [byPot(1)[4], byPot(1)[5], byPot(2)[4], byPot(2)[5], byPot(3)[4], byPot(3)[5], byPot(4)[4], byPot(4)[5]] },
  ];

  for (const participantSeed of participantsSeed) {
    const [participant] = await db
      .insert(participantsTable)
      .values({ name: participantSeed.name })
      .returning();

    await db.insert(participantTeamsTable).values(
      participantSeed.picks.map((team) => ({ participantId: participant.id, teamId: team.id })),
    );
  }
  console.log(`Inserted ${participantsSeed.length} participants.`);

  const findTeam = (name: string) => insertedTeams.find((team) => team.name === name)!;

  const matchesSeed = [
    { home: "Real Madrid", away: "Juventus", homeGoals: 2, awayGoals: 1 },
    { home: "Manchester City", away: "Napoli", homeGoals: 3, awayGoals: 0 },
    { home: "Inter", away: "Ajax", homeGoals: 1, awayGoals: 1 },
    { home: "Barcellona", away: "Olympiacos", homeGoals: 2, awayGoals: 0 },
  ];

  for (const match of matchesSeed) {
    await db.insert(matchesTable).values({
      homeTeamId: findTeam(match.home).id,
      awayTeamId: findTeam(match.away).id,
      homeGoals: match.homeGoals,
      awayGoals: match.awayGoals,
    });
  }
  console.log(`Inserted ${matchesSeed.length} matches.`);
}

seed()
  .then(() => {
    console.log("Seed completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
