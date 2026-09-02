import { useState, useEffect } from 'react';
import { Trophy, Star, Users, Activity, Crown } from 'lucide-react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';

interface StandingEntry {
  participantId: number;
  name: string;
  totalScore: number;
  position: number;
}

interface SummaryData {
  appName: string;
  participantsCount: number;
  matchesPlayed: number;
  leaderName: string;
  leaderScore: number;
}

export default function Home() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoadingSummary(true);
      setLoadingStandings(true);

      // 1. Carica la classifica dalla VISTA 'standings' creata su Supabase
      const { data: standingsData, error: standingsError } = await supabase
        .from('standings')
        .select('*');

      // 2. Carica il conteggio delle partite giocate
      const { count: matchesCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      let formattedStandings: StandingEntry[] = [];

      if (!standingsError && standingsData) {
        formattedStandings = standingsData.map((row: any, index: number) => ({
          participantId: row.participant_id,
          name: row.participant_name,
          totalScore: row.total_points || 0,
          position: index + 1,
        }));
      }

      setStandings(formattedStandings);
      setLoadingStandings(false);

      // 3. Calcola il riepilogo
      const leader = formattedStandings.length > 0 ? formattedStandings[0] : null;

      setSummary({
        appName: 'Championsito ST 26',
        participantsCount: formattedStandings.length,
        matchesPlayed: matchesCount || 0,
        leaderName: leader ? leader.name : 'Nessuno',
        leaderScore: leader ? leader.totalScore : 0,
      });

      setLoadingSummary(false);
    }

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-12">
      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-20 rounded-3xl overflow-hidden glass-card">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            {summary?.appName || 'Championsito ST 26'}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Il fantagioco definitivo sulla UEFA Champions League. Scegli le tue 8 squadre e scala la classifica globale!
          </p>
          
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link href="/classifica" className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Star className="h-5 w-5" fill="currentColor" />
              Vedi Classifica
            </Link>
            <Link href="/partecipanti" className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tutti i Partecipanti
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-xl">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Partecipanti</p>
            <h3 className="text-3xl font-bold">
              {loadingSummary ? <span className="animate-pulse bg-white/10 h-8 w-16 rounded inline-block" /> : summary?.participantsCount || 0}
            </h3>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 rounded-xl">
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Partite Giocate</p>
            <h3 className="text-3xl font-bold">
              {loadingSummary ? <span className="animate-pulse bg-white/10 h-8 w-16 rounded inline-block" /> : summary?.matchesPlayed || 0}
            </h3>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-yellow-500/10">
            <Crown className="h-32 w-32" />
          </div>
          <div className="p-4 bg-yellow-500/20 rounded-xl relative z-10">
            <Crown className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground font-medium">Capolista Attuale</p>
            <h3 className="text-xl md:text-2xl font-bold truncate max-w-[150px]">
              {loadingSummary ? (
                <span className="animate-pulse bg-white/10 h-8 w-24 rounded inline-block" />
              ) : (
                summary?.leaderName || 'Nessuno'
              )}
            </h3>
            <p className="text-sm text-yellow-400 font-semibold">{summary?.leaderScore || 0} pts</p>
          </div>
        </div>
      </section>

      {/* Top Standings Preview */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-6 w-6 text-primary" />
            Top 5 Classifica
          </h2>
          <Link href="/classifica" className="text-sm text-primary hover:text-primary/80 font-medium">
            Vedi completa &rarr;
          </Link>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 font-semibold text-muted-foreground w-16 text-center">Pos</th>
                  <th className="p-4 font-semibold text-muted-foreground">Nome</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Punti</th>
                </tr>
              </thead>
              <tbody>
                {loadingStandings ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4 text-center"><div className="h-6 w-6 bg-white/10 rounded animate-pulse mx-auto" /></td>
                      <td className="p-4"><div className="h-6 w-32 bg-white/10 rounded animate-pulse" /></td>
                      <td className="p-4"><div className="h-6 w-12 bg-white/10 rounded animate-pulse ml-auto" /></td>
                    </tr>
                  ))
                ) : standings.slice(0, 5).map((entry) => (
                  <tr key={entry.participantId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-center font-bold">
                      {entry.position === 1 ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500">1</div>
                      ) : entry.position === 2 ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-300/20 text-slate-300">2</div>
                      ) : entry.position === 3 ? (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600">3</div>
                      ) : (
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-muted-foreground">{entry.position}</div>
                      )}
                    </td>
                    <td className="p-4 font-medium">{entry.name}</td>
                    <td className="p-4 text-right font-bold text-primary">{entry.totalScore}</td>
                  </tr>
                ))}
                
                {!loadingStandings && standings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-muted-foreground">
                      Nessun partecipante ancora in classifica.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
