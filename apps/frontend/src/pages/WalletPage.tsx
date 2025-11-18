import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Leaf, TrendingUp, Award } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState(847);
  const [userId] = useState('USR-DEMO-12345');
  const [history, setHistory] = useState<Transaction[]>([
    { id: '1', amount: 45, description: 'Acquisto BIO + KM0', date: '2025-11-04T10:30:00' },
    { id: '2', amount: 20, description: 'Segnalazione risolta', date: '2025-11-03T15:20:00' },
    { id: '3', amount: 15, description: 'Shopping route completato', date: '2025-11-02T09:15:00' },
    { id: '4', amount: 30, description: 'Acquisto mercato', date: '2025-11-01T11:45:00' },
  ]);

  const co2Saved = Math.round(balance * 0.5); // 1 credito = ~0.5kg CO₂
  const treesEquivalent = Math.round(co2Saved / 22); // 1 albero = ~22kg CO₂/anno

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-3 shadow-md">
        <div className="container max-w-2xl flex items-center gap-3 justify-center">
          <Wallet className="h-6 w-6" />
          <h1 className="text-lg font-bold">Wallet Carbon Credit</h1>
        </div>
      </header>

      <div className="container max-w-2xl py-4 space-y-4 px-4">
        {/* Saldo Principale */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardHeader>
            <CardTitle className="text-primary-foreground">Saldo Eco-Crediti</CardTitle>
            <CardDescription className="text-primary-foreground/70">I tuoi crediti sostenibili</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-6xl font-bold mb-2">{balance}</div>
            <p className="text-primary-foreground/80 text-sm">crediti disponibili</p>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Il tuo QR Code</CardTitle>
            <CardDescription className="text-card-foreground/70">
              Mostra questo codice al negoziante per ricevere i crediti
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-inner">
              <QRCodeSVG value={userId} size={200} level="H" />
            </div>
          </CardContent>
        </Card>

        {/* Impatto Ambientale */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Leaf className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm text-foreground">CO₂ Evitata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{co2Saved} kg</div>
              <p className="text-xs text-card-foreground/60">
                Equivalente a {treesEquivalent} alberi piantati
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Award className="h-5 w-5 text-secondary" />
              <CardTitle className="text-sm text-foreground">Livello</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">Oro</div>
              <p className="text-xs text-card-foreground/60">
                Top 5% utenti più sostenibili
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Storico Transazioni */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5" />
              Storico Transazioni
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-card-foreground/60">
                      {new Date(tx.date).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-lg font-semibold text-primary">+{tx.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Azioni */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Riscatta Crediti
          </Button>
          <Button variant="outline" className="w-full border-border text-foreground hover:bg-card">
            Classifica
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
