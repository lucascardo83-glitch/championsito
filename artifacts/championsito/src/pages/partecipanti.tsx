import { useState, useEffect } from 'react';
import { useListParticipants, useGetParticipant, getGetParticipantQueryKey } from '@workspace/api-client-react';
import { Search, Users, Trophy, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function ParticipantModal({ 
  participantId, 
  isOpen, 
  onClose 
}: { 
  participantId: number | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { data: participant, isLoading } = useGetParticipant(participantId as number, { 
    query: {
      enabled: !!participantId && isOpen,
      queryKey: getGetParticipantQueryKey(participantId as number),
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-white/10 text-foreground">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            {isLoading || !participant ? (
              <span className="h-8 w-48 bg-white/10 rounded animate-pulse inline-block" />
            ) : (
              <>
                <Users className="text-primary h-6 w-6" />
                {participant.name}
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading || !participant ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-primary/10 p-4 rounded-xl border border-primary/20">
                <span className="text-muted-foreground font-medium">Punteggio Totale</span>
                <span className="text-3xl font-extrabold text-primary">{participant.totalScore}</span>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-muted-foreground" />
                  Squadre Selezionate
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {participant.teams.sort((a, b) => a.potNumber - b.potNumber).map((team) => (
                    <div 
                      key={team.teamId} 
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{team.teamName}</span>
                        <span className="text-xs text-muted-foreground">Fascia {team.potNumber}</span>
                      </div>
                      <div className="bg-primary/20 text-primary px-3 py-1 rounded-md font-bold text-sm">
                        {team.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Partecipanti() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: participants, isLoading } = useListParticipants({ search: debouncedSearch });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 max-w-5xl">
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-2">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Partecipanti</h1>
        <p className="text-lg text-muted-foreground">
          Cerca i giocatori e scopri le loro squadre.
        </p>
      </div>

      <div className="relative max-w-xl mx-auto mb-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <input
          type="search"
          className="w-full pl-12 pr-4 py-4 bg-card/60 backdrop-blur-md border border-white/20 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
          placeholder="Cerca per nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl animate-pulse">
              <div className="h-6 w-3/4 bg-white/10 rounded mb-4" />
              <div className="h-4 w-1/4 bg-white/10 rounded" />
            </div>
          ))
        ) : participants?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground text-lg glass-card rounded-2xl">
            Nessun partecipante trovato.
          </div>
        ) : (
          participants?.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="glass-card p-6 rounded-xl flex items-center justify-between text-left hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <div>
                <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                <span className="text-muted-foreground text-sm font-medium">{p.totalScore} punti</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))
        )}
      </div>

      <ParticipantModal 
        participantId={selectedId} 
        isOpen={selectedId !== null} 
        onClose={() => setSelectedId(null)} 
      />
    </div>
  );
}
