import { useState } from 'react';
import { useListTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, getListTeamsQueryKey, Team } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function TeamsTab() {
  const { data: teams, isLoading } = useListTeams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  const [name, setName] = useState('');
  const [potNumber, setPotNumber] = useState('1');

  const openCreate = () => {
    setEditingTeam(null);
    setName('');
    setPotNumber('1');
    setIsOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setName(team.name);
    setPotNumber(team.potNumber.toString());
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (editingTeam) {
      updateTeam.mutate({ id: editingTeam.id, data: { name, potNumber: Number(potNumber) } }, {
        onSuccess: () => {
          toast({ title: 'Squadra aggiornata' });
          queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey() });
          setIsOpen(false);
        }
      });
    } else {
      createTeam.mutate({ data: { name, potNumber: Number(potNumber) } }, {
        onSuccess: () => {
          toast({ title: 'Squadra creata' });
          queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey() });
          setIsOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!editingTeam) return;
    deleteTeam.mutate({ id: editingTeam.id }, {
      onSuccess: () => {
        toast({ title: 'Squadra eliminata' });
        queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey() });
        setIsDeleteOpen(false);
      }
    });
  };

  const pot1 = teams?.filter(t => t.potNumber === 1) || [];
  const pot2 = teams?.filter(t => t.potNumber === 2) || [];
  const pot3 = teams?.filter(t => t.potNumber === 3) || [];
  const pot4 = teams?.filter(t => t.potNumber === 4) || [];

  const renderPot = (potTeams: Team[], potNum: number) => (
    <div className="space-y-3">
      <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-3">Fascia {potNum}</h3>
      {potTeams.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Nessuna squadra</p>
      ) : (
        <div className="grid gap-2">
          {potTeams.map(team => (
            <div key={team.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
              <span className="font-medium">{team.name}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openEdit(team)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setEditingTeam(team); setIsDeleteOpen(true); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestione Squadre</h2>
        <Button onClick={openCreate} className="gap-2 font-bold">
          <Plus className="h-4 w-4" /> Nuova Squadra
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderPot(pot1, 1)}
          {renderPot(pot2, 2)}
          {renderPot(pot3, 3)}
          {renderPot(pot4, 4)}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>{editingTeam ? 'Modifica Squadra' : 'Nuova Squadra'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="es. Real Madrid" 
                className="bg-background/50 border-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fascia</label>
              <Select value={potNumber} onValueChange={setPotNumber}>
                <SelectTrigger className="bg-background/50 border-white/20">
                  <SelectValue placeholder="Seleziona fascia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Fascia 1</SelectItem>
                  <SelectItem value="2">Fascia 2</SelectItem>
                  <SelectItem value="3">Fascia 3</SelectItem>
                  <SelectItem value="4">Fascia 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Annulla</Button>
            <Button onClick={handleSave} disabled={createTeam.isPending || updateTeam.isPending || !name.trim()}>
              {(createTeam.isPending || updateTeam.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Elimina Squadra</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare la squadra "{editingTeam?.name}"? Questa operazione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTeam.isPending}>
              {deleteTeam.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Elimina'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
