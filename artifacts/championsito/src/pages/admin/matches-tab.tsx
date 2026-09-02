import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: number;
  name: string;
  tier: number;
}

interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_goals: number;
  away_goals: number;
  homeTeamName?: string;
  awayTeamName?: string;
}

export function MatchesTab() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [homeTeamId, setHomeTeamId] = useState<string>('');
  const [awayTeamId, setAwayTeamId] = useState<string>('');
  const [homeGoals, setHomeGoals] = useState<string>('0');
  const [awayGoals, setAwayGoals] = useState<string>('0');

  // Carica squadre e partite da Supabase
  const fetchData = async () => {
    setIsLoading(true);
    
    // 1. Fetch Teams
    const { data: teamsData } = await supabase.from('teams').select('*').order('name');
    const loadedTeams = teamsData || [];
    setTeams(loadedTeams);

    // 2. Fetch Matches
    const { data: matchesData } = await supabase.from('matches').select('*').order('id', { ascending: false });
    
    if (matchesData) {
      // Mappa i nomi delle squadre direttamente nelle partite
      const formattedMatches = matchesData.map((m: Match) => ({
        ...m,
        homeTeamName: loadedTeams.find((t) => t.id === m.home_team_id)?.name || 'Squadra sconosciuta',
        awayTeamName: loadedTeams.find((t) => t.id === m.away_team_id)?.name || 'Squadra sconosciuta',
      }));
      setMatches(formattedMatches);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingMatch(null);
    setHomeTeamId('');
    setAwayTeamId('');
    setHomeGoals('0');
    setAwayGoals('0');
    setIsOpen(true);
  };

  const openEdit = (match: Match) => {
    setEditingMatch(match);
    setHomeTeamId(match.home_team_id.toString());
    setAwayTeamId(match.away_team_id.toString());
    setHomeGoals(match.home_goals.toString());
    setAwayGoals(match.away_goals.toString());
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      toast({ title: 'Errore', description: 'Seleziona due squadre diverse', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      home_team_id: Number(homeTeamId),
      away_team_id: Number(awayTeamId),
      home_goals: Number(homeGoals),
      away_goals: Number(awayGoals),
    };

    if (editingMatch) {
      const { error } = await supabase.from('matches').update(payload).eq('id', editingMatch.id);
      if (error) {
        toast({ title: 'Errore', description: 'Aggiornamento non riuscito', variant: 'destructive' });
      } else {
        toast({ title: 'Risultato aggiornato' });
        fetchData();
        setIsOpen(false);
      }
    } else {
      const { error } = await supabase.from('matches').insert([payload]);
      if (error) {
        toast({ title: 'Errore', description: 'Inserimento non riuscito', variant: 'destructive' });
      } else {
        toast({ title: 'Risultato inserito' });
        fetchData();
        setIsOpen(false);
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!editingMatch) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('matches').delete().eq('id', editingMatch.id);

    if (error) {
      toast({ title: 'Errore', description: 'Eliminazione non riuscita', variant: 'destructive' });
    } else {
      toast({ title: 'Risultato eliminato' });
      fetchData();
      setIsDeleteOpen(false);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Risultati Partite</h2>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nuovo Risultato
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Nessuna partita registrata.
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
              <div className="flex-1 flex items-center justify-center gap-4">
                <span className="font-bold flex-1 text-right truncate">{match.homeTeamName}</span>
                <div className="bg-primary/20 px-3 py-1.5 rounded-lg font-bold text-xl min-w-[70px] text-center border border-primary/30">
                  {match.home_goals} - {match.away_goals}
                </div>
                <span className="font-bold flex-1 text-left truncate">{match.awayTeamName}</span>
              </div>
              <div className="flex gap-2 ml-6">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openEdit(match)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setEditingMatch(match); setIsDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMatch ? 'Modifica Risultato' : 'Inserisci Risultato'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-center block">Squadra Casa</label>
                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger className="bg-background/50 border-white/20">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  value={homeGoals}
                  onChange={(e) => setHomeGoals(e.target.value)}
                  className="text-center text-2xl font-bold h-14 bg-background/50 border-white/20"
                />
              </div>

              <div className="font-bold text-xl text-muted-foreground pt-8">-</div>

              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-center block">Squadra Ospite</label>
                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger className="bg-background/50 border-white/20">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="0"
                  value={awayGoals}
                  onChange={(e) => setAwayGoals(e.target.value)}
                  className="text-center text-2xl font-bold h-14 bg-background/50 border-white/20"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Annulla</Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva Risultato'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Elimina Risultato</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare questa partita?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
