import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Loader2 } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  tier: number;
  points: number;
}

interface ParticipantWithTeams {
  id: number;
  name: string;
  teams: Team[];
  totalPoints: number;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<ParticipantWithTeams[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { data: teamsData } = await supabase.from('teams').select('*').order('tier').order('name');
      const { data: matchesData } = await supabase.from('matches').select('*');
      const { data: participantsData } = await supabase.from('participants').select('*').order('name');
      const { data: linksData } = await supabase.from('participant_teams').select('*');

      // Calcola i punti per ciascuna squadra
      const teamsWithPoints = (teamsData || []).map((t) => {
        let pts = 0;
        (matchesData || []).forEach((m) => {
          if (m.home_team_id === t.id) {
            if (m.home_goals > m.away_goals) pts += t.tier * 2;
            else if (m.home_goals === m.away_goals) pts += t.tier;
          } else if (m.away_team_id === t.id) {
            if (m.away_goals > m.home_goals) pts += t.tier * 2;
            else if (m.home_goals === m.away_goals) pts += t.tier;
          }
        });
        return { ...t, points: pts };
      });

      if (participantsData) {
        const formatted = participantsData.map((p) => {
          const pTeamIds = linksData?.filter((l) => l.participant_id === p.id).map((l) => l.team_id) || [];
          const pTeams = teamsWithPoints.filter((t) => pTeamIds.includes(t.id));
          const totalPoints = pTeams.reduce((sum, t) => sum + t.points, 0);

          return { id: p.id, name: p.name, teams: pTeams, totalPoints };
        });
        setParticipants(formatted);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Tutti i Partecipanti</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : participants.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Nessun partecipante registrato.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {participants.map((p) => (
            <div key={p.id} className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{p.name}</h2>
                <span className="text-sm font-bold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                  Totale: {p.totalPoints} pts
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Squadre Scelte ({p.teams.length}/8):</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.teams.length > 0 ? (
                    p.teams.map((t) => (
                      <span key={t.id} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <span>{t.name}</span>
                        <span className="opacity-50 text-[10px]">(F{t.tier})</span>
                        <span className="text-primary font-bold ml-1">+{t.points}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">Nessuna squadra assegnata</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
