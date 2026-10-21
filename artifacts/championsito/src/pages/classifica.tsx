import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Loader2 } from 'lucide-react';

interface StandingRow {
  participant_id: number;
  participant_name: string;
  total_points: number;
}

export default function ClassificaPage() {
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);

      // 1. Recupera squadre, partite, partecipanti e relazioni
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

        // 4. Ordina dal punteggio più alto al più basso
        computed.sort((a, b) => b.total_points - a.total_points);
        setStandings(computed);
      }

      setLoading(false);
    }

    fetchStandings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-400" />
        <h1 className="text-3xl font-bold tracking-tight">Classifica Generale</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : standings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Nessun dato presente in classifica.
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6 w-16 text-center">Pos</th>
                <th className="py-4 px-6">Partecipante</th>
                <th className="py-4 px-6 text-right">Punti Totali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.map((row, index) => (
                <tr key={row.participant_id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 text-center font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td className="py-4 px-6 font-semibold">{row.participant_name}</td>
                  <td className="py-4 px-6 text-right font-bold text-primary text-lg">
                    {row.total_points} <span className="text-xs text-muted-foreground">pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
