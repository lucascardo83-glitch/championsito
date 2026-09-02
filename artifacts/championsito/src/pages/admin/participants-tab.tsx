import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  tier: number;
}

interface Participant {
  id: number;
  name: string;
  teams: Team[];
}

export function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    // 1. Carica squadre
    const { data: teamsData } = await supabase.from('teams').select('*').order('tier').order('name');
    setTeams(teamsData || []);

    // 2. Carica partecipanti e le relative squadre collegate
    const { data: participantsData } = await supabase.from('participants').select('*').order('id', { ascending: false });
    const { data: linksData } = await supabase.from('participant_teams').select('*');

    if (participantsData) {
      const formatted = participantsData.map((p) => {
        const pTeamIds = linksData?.filter((l) => l.participant_id === p.id).map((l) => l.team_id) || [];
        const pTeams = (teamsData || []).filter((t) => pTeamIds.includes(t.id));
        return { ...p, teams: pTeams };
      });
      setParticipants(formatted);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTeamSelection = (teamId: number) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      if (selectedTeamIds.length >= 8) {
        toast({ title: 'Limite raggiunto', description: 'Puoi selezionare massimo 8 squadre per partecipante.', variant: 'destructive' });
        return;
      }
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    // Salva il partecipante
    const { data: pData, error: pError } = await supabase
      .from('participants')
      .insert([{ name: name.trim() }])
      .select();

    if (pError || !pData) {
      toast({ title: 'Errore', description: 'Impossibile salvare il partecipante.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const newParticipantId = pData[0].id;

    // Salva le associazioni con le squadre
    if (selectedTeamIds.length > 0) {
      const links = selectedTeamIds.map((teamId) => ({
        participant_id: newParticipantId,
        team_id: teamId,
      }));
      await supabase.from('participant_teams').insert(links);
    }

    setLoading(false);
    toast({ title: 'Successo', description: 'Partecipante e squadre salvati!' });
    setName('');
    setSelectedTeamIds([]);
    fetchData();
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
      <form onSubmit={handleAddParticipant} className="space-y-4 border p-4 rounded-xl bg-card/30">
        <div className="flex gap-4">
          <Input
            placeholder="Nome partecipante..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background/50"
          />
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Salva Partecipante</>}
          </Button>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">
            Seleziona fino a 8 Squadre (Selezionate: {selectedTeamIds.length}/8):
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-background/50">
            {teams.map((t) => {
              const isChecked = selectedTeamIds.includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => toggleTeamSelection(t.id)}
                  className={`p-2 text-xs rounded border text-left flex justify-between items-center transition-all ${
                    isChecked ? 'bg-primary text-primary-foreground border-primary font-bold' : 'bg-card border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <span className="opacity-70 text-[10px]">F{t.tier}</span>
                </button>
              );
            })}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {participants.map((p) => (
          <div key={p.id} className="p-4 border rounded-lg bg-card/40 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">{p.name}</span>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {p.teams.length > 0 ? (
                p.teams.map((t) => (
                  <span key={t.id} className="text-xs bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full">
                    {t.name} (F{t.tier})
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Nessuna squadra assegnata</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
