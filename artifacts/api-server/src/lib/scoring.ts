/**
 * Points awarded per pot ("fascia") for each match outcome.
 *
 * Fascia 1: win=2, draw=1, loss=0
 * Fascia 2: win=4, draw=2, loss=0
 * Fascia 3: win=6, draw=3, loss=0
 * Fascia 4: win=8, draw=4, loss=0
 */
const POT_POINTS: Record<number, { win: number; draw: number; loss: number }> = {
  1: { win: 2, draw: 1, loss: 0 },
  2: { win: 4, draw: 2, loss: 0 },
  3: { win: 6, draw: 3, loss: 0 },
  4: { win: 8, draw: 4, loss: 0 },
};

export type MatchOutcome = "win" | "draw" | "loss";

export function pointsForOutcome(potNumber: number, outcome: MatchOutcome): number {
  const table = POT_POINTS[potNumber];
  if (!table) {
    throw new Error(`Unknown pot number: ${potNumber}`);
  }
  return table[outcome];
}

/**
 * Determine a team's outcome in a match given its goals and the opponent's goals.
 */
export function outcomeFor(teamGoals: number, opponentGoals: number): MatchOutcome {
  if (teamGoals > opponentGoals) return "win";
  if (teamGoals < opponentGoals) return "loss";
  return "draw";
}
