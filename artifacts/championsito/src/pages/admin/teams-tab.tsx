import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Loader2 } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  tier: number;
  is_winner?: boolean;
}

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    setLoading(true);
    const { data } = await supabase.from('teams').select('*').order('tier').order('name');
    if (data) setTeams(data);
    setLoading(false);
  }

  async function toggleWinner(teamId: number, currentStatus: boolean | undefined) {
    const newStatus = !currentStatus;

    // Se stiamo segnando una nuova vincitrice, azzeriamo prima tutte le altre
    if (newStatus) {
      await supabase.from('teams').update({ is_winner: false }).neq('id', 0);
    }

    // Aggiorna la squadra selezionata
    await supabase.from('teams').update({ is_winner: newStatus }).eq('id', teamId);
    
    fetchTeams();
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Gestione Squadre e Vincitore</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              t.is_winner
                ? 'bg-yellow-500/10 border-yellow-500/50'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div>
              <p className="font-bold">{t.name}</p>
              <p className="text-xs text-muted-foreground">Fascia {t.tier}</p>
            </div>

            <button
              onClick={() => toggleWinner(t.id, t.is_winner)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                t.is_winner
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              {t.is_winner ? 'Vincitrice (+5 pts)' : 'Segna come Vincitrice'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
