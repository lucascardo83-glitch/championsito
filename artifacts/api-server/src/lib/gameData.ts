import { db, matchesTable, participantsTable, participantTeamsTable, teamsTable } from "@workspace/db";
import { outcomeFor, pointsForOutcome } from "./scoring";

export interface TeamWithPoints {
  id: number;
  name: string;
  potNumber: number;
  points: number;
}

export interface ParticipantWithTeams {
  id: number;
  name: string;
  totalScore: number;
  teams: TeamWithPoints[];
}

/** Extra points awarded to participants who picked the champion team. */
export const CHAMPION_BONUS = 5;

/**
 * Computes each team's total points earned so far from recorded matches,
 * based on the pot ("fascia") the team belongs to.
 * If a team is flagged as champion, it also receives a one-time
 * CHAMPION_BONUS point bonus on top of its match points.
 */
export async function computeTeamPoints(): Promise<Map<number, number>> {
  const [teams, matches] = await Promise.all([
    db.select().from(teamsTable),
    db.select().from(matchesTable),
  ]);

  const teamMetaById = new Map(teams.map((team) => [team.id, team]));
  const pointsByTeamId = new Map<number, number>(
    teams.map((team) => [team.id, team.isChampion ? CHAMPION_BONUS : 0]),
  );

  for (const match of matches) {
    const homeMeta = teamMetaById.get(match.homeTeamId);
    const awayMeta = teamMetaById.get(match.awayTeamId);

    if (homeMeta !== undefined) {
      const outcome = outcomeFor(match.homeGoals, match.awayGoals);
      pointsByTeamId.set(
        match.homeTeamId,
        (pointsByTeamId.get(match.homeTeamId) ?? 0) + pointsForOutcome(homeMeta.potNumber, outcome),
      );
    }

    if (awayMeta !== undefined) {
      const outcome = outcomeFor(match.awayGoals, match.homeGoals);
      pointsByTeamId.set(
        match.awayTeamId,
        (pointsByTeamId.get(match.awayTeamId) ?? 0) + pointsForOutcome(awayMeta.potNumber, outcome),
      );
    }
  }

  return pointsByTeamId;
}

/**
 * Builds the full picture for every participant: their 8 chosen teams,
 * each team's pot and points, and the participant's total score.
 */
export async function computeParticipants(): Promise<ParticipantWithTeams[]> {
  const [participants, picks, teams, teamPoints] = await Promise.all([
    db.select().from(participantsTable),
    db.select().from(participantTeamsTable),
    db.select().from(teamsTable),
    computeTeamPoints(),
  ]);

  const teamById = new Map(teams.map((team) => [team.id, team]));
  const picksByParticipant = new Map<number, number[]>();

  for (const pick of picks) {
    const list = picksByParticipant.get(pick.participantId) ?? [];
    list.push(pick.teamId);
    picksByParticipant.set(pick.participantId, list);
  }

  return participants.map((participant) => {
    const teamIds = picksByParticipant.get(participant.id) ?? [];
    const teamsWithPoints: TeamWithPoints[] = teamIds
      .map((teamId) => teamById.get(teamId))
      .filter((team): team is NonNullable<typeof team> => team !== undefined)
      .map((team) => ({
        id: team.id,
        name: team.name,
        potNumber: team.potNumber,
        points: teamPoints.get(team.id) ?? 0,
      }));

    const totalScore = teamsWithPoints.reduce((sum, team) => sum + team.points, 0);

    return {
      id: participant.id,
      name: participant.name,
      totalScore,
      teams: teamsWithPoints,
    };
  });
}
