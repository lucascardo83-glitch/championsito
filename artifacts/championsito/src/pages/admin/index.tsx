import { useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth';
import { useAdminLogin } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dashboard } from './dashboard';

export default function Admin() {
  const { token, login } = useAuthStore();
  const [password, setPassword] = useState('');
  const { mutate: doLogin, isPending } = useAdminLogin();
  const { toast } = useToast();

  if (token) {
    return <Dashboard />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    if (password === 'Vero1989') {
      login('fake-admin-token');
      toast({ title: 'Accesso effettuato' });
    } else {
      toast({ title: 'Errore', description: 'Password non valida', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="glass-card p-8 rounded-2xl w-full max-w-md shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-red-500/20 rounded-full mb-2">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Area Amministratore</h1>
          <p className="text-muted-foreground text-sm">Inserisci la password per gestire il gioco.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background/50 border-white/20 text-center text-lg"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full font-bold text-md h-12" 
            disabled={isPending || !password}
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Accedi'}
          </Button>
        </form>
      </div>
    </div>
  );
}
