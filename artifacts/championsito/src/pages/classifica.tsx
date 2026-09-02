import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Loader2 } from 'lucide-react';

interface StandingEntry {
  participant_id: number;
  participant_name: string;
  total_points: number;
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStandings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('standings')
        .select('*');

      if (!error && data) {
        setStandings(data);
      }
      setLoading(false);
    }

    fetchStandings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Classifica Generale</h1>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden p-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nessun partecipante ancora in classifica.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-semibold text-muted-foreground w-16 text-center">Pos</th>
                <th className="p-4 font-semibold text-muted-foreground">Nome Partecipante</th>
                <th className="p-4 font-semibold text-muted-foreground text-right">Punti Totali</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((entry, index) => (
                <tr key={entry.participant_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center font-bold">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                      index === 1 ? 'bg-slate-300/20 text-slate-300' :
                      index === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-white/5 text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{entry.participant_name}</td>
                  <td className="p-4 text-right font-bold text-primary text-lg">{entry.total_points || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
