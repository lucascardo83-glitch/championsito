import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Team {
  id?: number;
  name: string;
  tier: number;
}

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carica le squadre da Supabase all'avvio
  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('tier', { ascending: true });

    if (error) {
      toast({ title: 'Errore', description: 'Impossibile caricare le squadre.', variant: 'destructive' });
    } else {
      setTeams(data || []);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Salva una nuova squadra su Supabase
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .insert([{ name: newTeamName.trim(), tier: selectedTier }])
      .select();

    setLoading(false);

    if (error) {
      toast({ title: 'Errore', description: 'Salvataggio non riuscito.', variant: 'destructive' });
    } else {
      toast({ title: 'Successo', description: 'Squadra salvata correttamente!' });
      setNewTeamName('');
      if (data) setTeams([...teams, ...data]);
    }
  };

  // Elimina una squadra da Supabase
  const handleDeleteTeam = async (id: number) => {
    const { error } = await supabase.from('teams').delete().eq('id', id);

    if (error) {
      toast({ title: 'Errore', description: 'Impossibile eliminare la squadra.', variant: 'destructive' });
    } else {
      setTeams(teams.filter((t) => t.id !== id));
      toast({ title: 'Eliminata', description: 'Squadra rimossa.' });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddTeam} className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Nome squadra..."
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="bg-background/50"
        />
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(Number(e.target.value))}
          className="p-2 rounded-md bg-background border border-input text-sm"
        >
          <option value={1}>Fascia 1</option>
          <option value={2}>Fascia 2</option>
          <option value={3}>Fascia 3</option>
          <option value={4}>Fascia 4</option>
        </select>
        <Button type="submit" disabled={loading || !newTeamName.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Salva</>}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="flex justify-between items-center p-3 border rounded-lg bg-card/40">
            <div>
              <span className="font-bold">{team.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">(Fascia {team.tier})</span>
            </div>
            {team.id && (
              <Button variant="ghost" size="icon" onClick={() => handleDeleteTeam(team.id!)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}