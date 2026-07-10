import { useState } from 'react';
import { useExportBackup, getExportBackupQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Download, DatabaseBackup, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function BackupTab() {
  const { refetch, isFetching } = useExportBackup({
    query: { enabled: false, queryKey: getExportBackupQueryKey() },
  });
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const { data } = await refetch();
      
      if (!data) {
        throw new Error('Nessun dato restituito');
      }

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `championsito_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Backup esportato con successo' });
    } catch (error) {
      toast({ 
        title: 'Errore durante l\'esportazione', 
        description: 'Impossibile scaricare il backup.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-primary/10 rounded-full mb-2">
          <DatabaseBackup className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Esporta Dati</h2>
        <p className="text-muted-foreground text-lg">
          Scarica un file JSON contenente tutte le squadre, i partecipanti e i risultati attuali.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6 mt-8">
        <div className="flex items-start gap-3 text-sm text-muted-foreground bg-black/20 p-4 rounded-lg">
          <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <p>
            Il backup è utile per salvare lo stato del gioco in locale. Il file conterrà l'intera struttura del database al momento del download.
          </p>
        </div>

        <Button 
          onClick={handleExport} 
          disabled={isFetching} 
          className="w-full h-14 text-lg font-bold gap-3"
        >
          {isFetching ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
          {isFetching ? 'Generazione in corso...' : 'Scarica Backup JSON'}
        </Button>
      </div>
    </div>
  );
}
