import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/hooks/use-auth';
import { LogOut, Database, Users, Swords, Settings2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

import { TeamsTab } from './teams-tab';
import { ParticipantsTab } from './participants-tab';
import { MatchesTab } from './matches-tab';
import { BackupTab } from './backup-tab';

export function Dashboard() {
  const { logout } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-1">Gestisci squadre, partecipanti e risultati.</p>
        </div>
        <Button variant="destructive" onClick={logout} className="gap-2 font-bold">
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>

      <Tabs defaultValue="teams" className="w-full space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-card/60 border border-white/10 h-auto p-1 gap-1">
          <TabsTrigger value="teams" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Squadre & Fasce</span>
            <span className="sm:hidden">Squadre</span>
          </TabsTrigger>
          <TabsTrigger value="participants" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
            <Users className="h-4 w-4 mr-2" />
            Partecipanti
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
            <Swords className="h-4 w-4 mr-2" />
            Risultati
          </TabsTrigger>
          <TabsTrigger value="backup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <div className="glass-card rounded-2xl p-6 min-h-[500px]">
          <TabsContent value="teams" className="mt-0 outline-none">
            <TeamsTab />
          </TabsContent>
          <TabsContent value="participants" className="mt-0 outline-none">
            <ParticipantsTab />
          </TabsContent>
          <TabsContent value="matches" className="mt-0 outline-none">
            <MatchesTab />
          </TabsContent>
          <TabsContent value="backup" className="mt-0 outline-none">
            <BackupTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
