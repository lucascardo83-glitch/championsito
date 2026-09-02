import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Team {
  id: number;
  name: string;
}

interface Participant {
  id: number;
  name: string;
  team_id: number | null;
  teamName?: string;
}

export function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('none');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    // Carica squadre
    const { data: teamsData } = await supabase.from('teams').select('*').order('name');
    const loadedTeams = teamsData || [];
    setTeams(loadedTeams);

    // Carica partecipanti
    const { data: participantsData } = await supabase.from('participants').select('*').order('id', { ascending: false });
    
    if (participantsData) {
      const formatted = participantsData.map((p: Participant) => ({
        ...p,
        teamName: loadedTeams.find((t) => t.id === p.team_id)?.name || 'Senza Squadra',
      }));
      setParticipants(formatted);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const teamIdValue = selectedTeamId === 'none' ? null : Number(selectedTeamId);

    const { error } = await supabase.from('participants').insert([
      { name: name.trim(), team_id: teamIdValue }
    ]);

    setLoading(false);

    if (error) {
      toast({ title: 'Errore', description: 'Impossibile salvare il partecipante.', variant: 'destructive' });
    } else {
      toast({ title: 'Successo', description: 'Partecipante aggiunto!' });
      setName('');
      setSelectedTeamId('none');
      fetchData();
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('participants').delete().eq('id', id);

    if (error) {
      toast({ title: 'Errore', description: 'Impossibile eliminare il partecipante.', variant: 'destructive' });
    } else {
      toast({ title: 'Eliminato', description: 'Partecipante rimosso.' });
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddParticipant} className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Nome partecipante..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background/50"
        />
        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background/50">
            <SelectValue placeholder="Assegna Squadra" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Senza Squadra</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Salva</>}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((p) => (
          <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg bg-card/40">
            <div>
              <span className="font-bold">{p.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">({p.teamName})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
