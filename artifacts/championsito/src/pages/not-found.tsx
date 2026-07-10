import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md glass-card border-white/10">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-full bg-primary/20">
            <ShieldAlert className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold">Pagina non trovata</h1>
          <p className="text-muted-foreground">
            La pagina che cerchi non esiste o è stata spostata.
          </p>
          <Button asChild className="mt-2">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Torna alla Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
