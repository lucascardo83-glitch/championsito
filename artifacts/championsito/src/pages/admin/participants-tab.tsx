import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Trash2, Loader2 } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  tier: number;
}

interface Participant {
  id: number;
  name: string;
}

export function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<Record<number, number[]>>({});
  const [newParticipantName, setNewParticipantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: pData } = await supabase.from('participants').select('*').order('name');
    const { data: tData } = await supabase.from('teams').select('*').order('tier').order('name');
    const { data: ptData } = await supabase.from('participant_teams').select('*');

    if (pData) setParticipants(pData);
    if (tData) setTeams(tData);

    if (ptData && pData) {
      const mapping: Record<number, number[]> = {};
      pData.forEach((p) => {
        mapping[p.id] = ptData.filter((pt) => pt.participant_id === p.id).map((pt) => pt.team_id);
      });
      setSelectedTeams(mapping);
    }
    setLoading(false);
  }

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!newParticipantName.trim()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from('participants')
      .insert([{ name: newParticipantName.trim() }])
      .select();

    if (!error && data) {
      setParticipants([...participants, data[0]]);
      setSelectedTeams({ ...selectedTeams, [data[0].id]: [] });
      setNewParticipantName('');
    }
    setSaving(false);
  }

  async function handleDeleteParticipant(id: number) {
    if (!confirm('Sei sicuro di voler eliminare questo partecipante?')) return;
    await supabase.from('participants').delete().eq('id', id);
    setParticipants(participants.filter((p) => p.id !== id));
  }

  async function handleToggleTeam(participantId: number, teamId: number) {
    const current = selectedTeams[participantId] || [];
    let updated: number[];

    if (current.includes(teamId)) {
      updated = current.filter((id) => id !== teamId);
      await supabase
        .from('participant_teams')
        .delete()
        .eq('participant_id', participantId)
        .eq('team_id', teamId);
    } else {
      if (current.length >= 8) {
        alert('Un partecipante può selezionare massimo 8 squadre!');
        return;
      }
      updated = [...current, teamId];
      await supabase
        .from('participant_teams')
        .insert([{ participant_id: participantId, team_id: teamId }]);
    }

    setSelectedTeams({ ...selectedTeams, [participantId]: updated });
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Form Aggiunta */}
      <form onSubmit={handleAddParticipant} className="glass-card p-6 rounded-2xl flex gap-4">
        <input
          type="text"
          placeholder="Nome nuovo partecipante..."
          value={newParticipantName}
          onChange={(e) => setNewParticipantName(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold flex items-center gap-2 transition-all"
        >
          <Plus className="h-4 w-4" />
          Aggiungi
        </button>
      </form>

      {/* Lista Partecipanti */}
      <div className="space-y-6">
        {participants.map((p) => {
          const pTeams = selectedTeams[p.id] || [];
          return (
            <div key={p.id} className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">{p.name}</h3>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full">
                    {pTeams.length}/8 squadre
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteParticipant(p.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Sezione Selezione Squadre */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                {teams.map((t) => {
                  const isSelected = pTeams.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToggleTeam(p.id, t.id)}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-white'
                          : 'bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold truncate">{t.name}</div>
                      <div className="opacity-60 text-[10px]">Fascia {t.tier}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}