import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Loader2 } from 'lucide-react';

interface StandingRow {
  participant_id: number;
  participant_name: string;
  total_points: number;
}

export default function HomePage() {
  const [topFive, setTopFive] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopFive() {
      setLoading(true);

      // 1. Recupera squadre, partite, partecipanti e relazioni da Supabase
      const { data: teamsData } = await supabase.from('teams').select('*');
      const { data: matchesData } = await supabase.from('matches').select('*');
      const { data: participantsData } = await supabase.from('participants').select('*');
      const { data: linksData } = await supabase.from('participant_teams').select('*');

      if (participantsData) {
        // 2. Calcola i punti esatti per ogni squadra (+5 bonus vincitore)
        const teamsWithPoints = (teamsData || []).map((t) => {
          let pts = t.is_winner ? 5 : 0;
          (matchesData || []).forEach((m) => {
            if (m.home_team_id === t.id) {
              if (m.home_goals > m.away_goals) pts += t.tier * 2;
              else if (m.home_goals === m.away_goals) pts += t.tier;
            } else if (m.away_team_id === t.id) {
              if (m.away_goals > m.home_goals) pts += t.tier * 2;
              else if (m.home_goals === m.away_goals) pts += t.tier;
            }
          });
          return { id: t.id, points: pts };
        });

        // 3. Calcola il totale per ogni partecipante
        const computed = participantsData.map((p) => {
          const pTeamIds = linksData?.filter((l) => l.participant_id === p.id).map((l) => l.team_id) || [];
          const total = teamsWithPoints
            .filter((t) => pTeamIds.includes(t.id))
            .reduce((sum, t) => sum + t.points, 0);

          return {
            participant_id: p.id,
            participant_name: p.name,
            total_points: total,
          };
        });

        // 4. Ordina decrescente e prendi solo i primi 5
        computed.sort((a, b) => b.total_points - a.total_points);
        setTopFive(computed.slice(0, 5));
      }

      setLoading(false);
    }

    fetchTopFive();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Sezione Top 5 */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h2 className="text-xl font-bold">Top 5 Classifica</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : topFive.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessun partecipante in classifica.</p>
        ) : (
          <div className="space-y-2">
            {topFive.map((row, index) => (
              <div
                key={row.participant_id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold w-6 text-center">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span className="font-semibold">{row.participant_name}</span>
                </div>
                <span className="font-bold text-primary">
                  {row.total_points} <span className="text-xs text-muted-foreground">pts</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
