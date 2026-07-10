import { useGetStandings } from '@workspace/api-client-react';
import { Trophy, Medal } from 'lucide-react';

export default function Classifica() {
  const { data: standings, isLoading } = useGetStandings();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 max-w-5xl">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-2">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Classifica Generale</h1>
        <p className="text-lg text-muted-foreground">
          La graduatoria completa di tutti i partecipanti.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 uppercase text-xs tracking-wider">
                <th className="p-4 md:p-6 font-semibold text-muted-foreground w-16 md:w-24 text-center">Pos</th>
                <th className="p-4 md:p-6 font-semibold text-muted-foreground">Partecipante</th>
                <th className="p-4 md:p-6 font-semibold text-muted-foreground text-right">Punti Totali</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-4 md:p-6 text-center"><div className="h-8 w-8 bg-white/10 rounded-full animate-pulse mx-auto" /></td>
                    <td className="p-4 md:p-6"><div className="h-6 w-48 bg-white/10 rounded animate-pulse" /></td>
                    <td className="p-4 md:p-6"><div className="h-8 w-16 bg-white/10 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : standings?.map((entry) => (
                <tr 
                  key={entry.participantId} 
                  className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                    entry.position === 1 ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <td className="p-4 md:p-6 text-center">
                    {entry.position === 1 ? (
                      <div className="mx-auto flex flex-col items-center">
                        <Medal className="h-8 w-8 text-yellow-500" />
                      </div>
                    ) : entry.position === 2 ? (
                      <div className="mx-auto flex flex-col items-center">
                        <Medal className="h-7 w-7 text-slate-300" />
                      </div>
                    ) : entry.position === 3 ? (
                      <div className="mx-auto flex flex-col items-center">
                        <Medal className="h-6 w-6 text-amber-600" />
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground">{entry.position}</span>
                    )}
                  </td>
                  <td className="p-4 md:p-6">
                    <span className={`text-lg md:text-xl font-bold ${
                      entry.position === 1 ? 'text-yellow-500' : 'text-foreground'
                    }`}>
                      {entry.name}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-right">
                    <span className="inline-flex items-center justify-center px-4 py-2 bg-primary/20 text-primary font-bold rounded-lg text-lg">
                      {entry.totalScore}
                    </span>
                  </td>
                </tr>
              ))}
              
              {standings?.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-muted-foreground text-lg">
                    Classifica attualmente vuota.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
