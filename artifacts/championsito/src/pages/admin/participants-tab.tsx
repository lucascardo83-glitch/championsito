import { useState, useMemo, useEffect } from 'react';
import { 
  useListParticipants, 
  useCreateParticipant, 
  useUpdateParticipant, 
  useDeleteParticipant, 
  getListParticipantsQueryKey,
  useListTeams,
  useGetParticipant,
  getGetParticipantQueryKey,
  ParticipantSummary
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function ParticipantsTab() {
  const [search, setSearch] = useState('');
  const { data: participants, isLoading } = useListParticipants({ search });
  const { data: teams } = useListTeams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const deleteParticipant = useDeleteParticipant();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<ParticipantSummary | null>(null);
  
  const [name, setName] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);

  // Fetch details when editing
  const { data: participantDetails, isFetching: loadingDetails } = useGetParticipant(
    editingParticipant?.id as number,
    {
      query: {
        enabled: !!editingParticipant && isOpen,
        queryKey: getGetParticipantQueryKey(editingParticipant?.id as number),
      },
    }
  );

  // Prefill form when details load
  useEffect(() => {
    if (participantDetails && editingParticipant) {
      setName(participantDetails.name);
      setSelectedTeamIds(participantDetails.teams.map(t => t.teamId));
    }
  }, [participantDetails, editingParticipant]);

  const openCreate = () => {
    setEditingParticipant(null);
    setName('');
    setSelectedTeamIds([]);
    setIsOpen(true);
  };

  const openEdit = (p: ParticipantSummary) => {
    setEditingParticipant(p);
    setName(p.name);
    // teams will be populated by the useEffect once details load
    setIsOpen(true);
  };

  const toggleTeam = (teamId: number, potNumber: number) => {
    setSelectedTeamIds(prev => {
      const isSelected = prev.includes(teamId);
      if (isSelected) {
        return prev.filter(id => id !== teamId);
      } else {
        // Limit to 2 per pot
        const potTeamsCount = prev.filter(id => {
          const t = teams?.find(t => t.id === id);
          return t?.potNumber === potNumber;
        }).length;
        
        if (potTeamsCount >= 2) {
          toast({ title: 'Limite raggiunto', description: `Hai già selezionato 2 squadre per la Fascia ${potNumber}`, variant: 'destructive' });
          return prev;
        }
        return [...prev, teamId];
      }
    });
  };

  const handleSave = () => {
    if (!name.trim() || selectedTeamIds.length !== 8) return;
    
    if (editingParticipant) {
      updateParticipant.mutate({ id: editingParticipant.id, data: { name, teamIds: selectedTeamIds } }, {
        onSuccess: () => {
          toast({ title: 'Partecipante aggiornato' });
          queryClient.invalidateQueries({ queryKey: getListParticipantsQueryKey() });
          // Invalidate specific detail query
          queryClient.invalidateQueries({ queryKey: [`/api/participants/${editingParticipant.id}`] });
          setIsOpen(false);
        }
      });
    } else {
      createParticipant.mutate({ data: { name, teamIds: selectedTeamIds } }, {
        onSuccess: () => {
          toast({ title: 'Partecipante creato' });
          queryClient.invalidateQueries({ queryKey: getListParticipantsQueryKey() });
          setIsOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!editingParticipant) return;
    deleteParticipant.mutate({ id: editingParticipant.id }, {
      onSuccess: () => {
        toast({ title: 'Partecipante eliminato' });
        queryClient.invalidateQueries({ queryKey: getListParticipantsQueryKey() });
        setIsDeleteOpen(false);
      }
    });
  };

  const pot1 = useMemo(() => teams?.filter(t => t.potNumber === 1) || [], [teams]);
  const pot2 = useMemo(() => teams?.filter(t => t.potNumber === 2) || [], [teams]);
  const pot3 = useMemo(() => teams?.filter(t => t.potNumber === 3) || [], [teams]);
  const pot4 = useMemo(() => teams?.filter(t => t.potNumber === 4) || [], [teams]);

  const renderPotSelection = (potTeams: typeof teams, potNum: number) => {
    const selectedInPot = selectedTeamIds.filter(id => potTeams?.find(t => t.id === id)).length;
    
    return (
      <div className="space-y-2 border border-white/10 rounded-lg p-3 bg-white/5">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-sm">Fascia {potNum}</h4>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${selectedInPot === 2 ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
            {selectedInPot}/2
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {potTeams?.map(team => {
            const isSelected = selectedTeamIds.includes(team.id);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => toggleTeam(team.id, potNum)}
                className={`text-left px-2 py-2 rounded-md text-sm transition-all border flex items-center justify-between ${
                  isSelected 
                    ? 'border-primary bg-primary/10 text-primary font-bold' 
                    : 'border-white/5 hover:border-white/20 hover:bg-white/5 text-muted-foreground'
                }`}
              >
                <span className="truncate pr-1">{team.name}</span>
                {isSelected && <CheckCircle2 className="h-3 w-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Gestione Partecipanti</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Cerca..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full sm:w-64 bg-background/50 border-white/20"
          />
          <Button onClick={openCreate} className="gap-2 font-bold whitespace-nowrap">
            <Plus className="h-4 w-4" /> Nuovo
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : participants?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
          Nessun partecipante trovato.
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {participants?.map(p => (
            <div key={p.id} className="flex flex-col justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg truncate max-w-[200px]">{p.name}</h3>
                  <p className="text-sm text-primary font-semibold">{p.totalScore} punti</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="sm" className="h-8" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4 mr-2" /> Modifica
                </Button>
                <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingParticipant(p); setIsDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-white/10 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingParticipant ? 'Modifica Partecipante' : 'Nuovo Partecipante'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="es. Mario Rossi" 
                className="bg-background/50 border-white/20"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-medium">Seleziona 8 squadre (2 per fascia)</label>
                <span className={`text-sm font-bold ${selectedTeamIds.length === 8 ? 'text-green-500' : 'text-primary'}`}>
                  {selectedTeamIds.length} / 8
                </span>
              </div>
              
              {(loadingDetails && editingParticipant) ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {renderPotSelection(pot1, 1)}
                  {renderPotSelection(pot2, 2)}
                  {renderPotSelection(pot3, 3)}
                  {renderPotSelection(pot4, 4)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Annulla</Button>
            <Button 
              onClick={handleSave} 
              disabled={createParticipant.isPending || updateParticipant.isPending || !name.trim() || selectedTeamIds.length !== 8 || loadingDetails}
            >
              {(createParticipant.isPending || updateParticipant.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Elimina Partecipante</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare "{editingParticipant?.name}"? I suoi pronostici verranno persi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteParticipant.isPending}>
              {deleteParticipant.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
