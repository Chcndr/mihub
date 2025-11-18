import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  QrCode, 
  Clock, 
  TrendingUp, 
  Users, 
  Leaf,
  LogIn,
  LogOut,
  Camera,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function HubOperatore() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  // Mock data operatore
  const operatore = {
    nome: 'Luca Bianchi',
    negozio: 'Frutta e Verdura Bio',
    ruolo: 'Operatore',
  };

  // Mock stats
  const stats = {
    venditeOggi: 450.50,
    carbonAssegnati: 320,
    clientiServiti: 15,
    co2Risparmiata: 2.8,
  };

  const handleCheckIn = () => {
    const now = new Date().toLocaleTimeString('it-IT');
    setCheckInTime(now);
    setIsCheckedIn(true);
    // TODO: Call API POST /vendor/checkin
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    // TODO: Call API POST /vendor/checkout
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#e8fbff]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#f97316] to-[#f59e0b] p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">HUB Operatore</h1>
            <p className="text-sm text-white/80">{operatore.negozio}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">{operatore.ruolo}</p>
            <p className="font-semibold text-white">{operatore.nome}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 space-y-6">
        {/* Gestione Presenze */}
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#e8fbff]">
              <Clock className="w-5 h-5" />
              Gestione Presenze
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                {isCheckedIn ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                    <span className="text-[#10b981] font-semibold">Check-in effettuato</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-[#ef4444]" />
                    <span className="text-[#94a3b8]">Non in servizio</span>
                  </div>
                )}
                {checkInTime && (
                  <p className="text-sm text-[#94a3b8] mt-1">Entrata: {checkInTime}</p>
                )}
              </div>
              {!isCheckedIn ? (
                <Button 
                  onClick={handleCheckIn}
                  className="bg-[#10b981] hover:bg-[#059669] text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Check-in
                </Button>
              ) : (
                <Button 
                  onClick={handleCheckOut}
                  variant="destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Check-out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistiche Giornaliere */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#94a3b8]">Vendite Oggi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-[#e8fbff]">€{stats.venditeOggi}</p>
                <TrendingUp className="w-5 h-5 text-[#10b981]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#94a3b8]">Carbon Credit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-[#14b8a6]">{stats.carbonAssegnati}</p>
                <Leaf className="w-5 h-5 text-[#14b8a6]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#94a3b8]">Clienti Serviti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-[#e8fbff]">{stats.clientiServiti}</p>
                <Users className="w-5 h-5 text-[#f59e0b]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#94a3b8]">CO₂ Risparmiata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-[#10b981]">{stats.co2Risparmiata} kg</p>
                <Leaf className="w-5 h-5 text-[#10b981]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Funzionalità */}
        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1e293b]">
            <TabsTrigger value="scanner" className="data-[state=active]:bg-[#f97316]">
              <QrCode className="w-4 h-4 mr-2" />
              Scanner QR
            </TabsTrigger>
            <TabsTrigger value="vendite" className="data-[state=active]:bg-[#f97316]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vendite
            </TabsTrigger>
            <TabsTrigger value="presenze" className="data-[state=active]:bg-[#f97316]">
              <Clock className="w-4 h-4 mr-2" />
              Presenze
            </TabsTrigger>
          </TabsList>

          {/* Tab Scanner QR */}
          <TabsContent value="scanner" className="space-y-4">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#e8fbff]">Scanner QR Code Cliente</CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Scansiona il QR code del cliente per assegnare carbon credit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Scanner Placeholder */}
                <div className="aspect-square bg-[#0b1220] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#334155]">
                  <Camera className="w-16 h-16 text-[#94a3b8] mb-4" />
                  <p className="text-[#94a3b8] text-center">
                    Camera QR Scanner
                    <br />
                    <span className="text-sm">(Implementazione in corso)</span>
                  </p>
                  <Button className="mt-4 bg-[#f97316] hover:bg-[#ea580c]">
                    <Camera className="w-4 h-4 mr-2" />
                    Attiva Camera
                  </Button>
                </div>

                {/* Form Assegnazione Carbon Credit */}
                <div className="space-y-4 p-4 bg-[#0b1220] rounded-lg">
                  <h3 className="font-semibold text-[#e8fbff]">Assegna Carbon Credit</h3>
                  
                  <div>
                    <label className="text-sm text-[#94a3b8]">Importo Spesa (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      className="w-full mt-1 px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-md text-[#e8fbff]"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-[#94a3b8] mb-2 block">Certificazioni Prodotto</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[#10b981] hover:bg-[#059669] cursor-pointer">BIO</Badge>
                      <Badge className="bg-[#14b8a6] hover:bg-[#0d9488] cursor-pointer">KM0</Badge>
                      <Badge className="bg-[#f59e0b] hover:bg-[#d97706] cursor-pointer">Fair Trade</Badge>
                      <Badge className="bg-[#8b5cf6] hover:bg-[#7c3aed] cursor-pointer">DOP</Badge>
                    </div>
                  </div>

                  <div className="p-3 bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-md">
                    <p className="text-sm text-[#94a3b8]">Carbon Credit Calcolati</p>
                    <p className="text-2xl font-bold text-[#14b8a6]">0 credits</p>
                    <p className="text-xs text-[#94a3b8] mt-1">CO₂ risparmiata: 0 kg</p>
                  </div>

                  <Button className="w-full bg-[#10b981] hover:bg-[#059669]">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Conferma Assegnazione
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Vendite */}
          <TabsContent value="vendite" className="space-y-4">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#e8fbff]">Ultime Transazioni</CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Storico vendite e carbon credit assegnati oggi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                      <div>
                        <p className="font-semibold text-[#e8fbff]">Cliente #{i}</p>
                        <p className="text-sm text-[#94a3b8]">10:{i * 5} AM</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#e8fbff]">€{(i * 12.50).toFixed(2)}</p>
                        <p className="text-sm text-[#14b8a6]">+{i * 15} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Presenze */}
          <TabsContent value="presenze" className="space-y-4">
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="text-[#e8fbff]">Storico Presenze Settimana</CardTitle>
                <CardDescription className="text-[#94a3b8]">
                  Registro check-in e check-out degli ultimi 7 giorni
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'].map((giorno, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                      <div>
                        <p className="font-semibold text-[#e8fbff]">{giorno}</p>
                        <p className="text-sm text-[#94a3b8]">3 Nov 2025</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#10b981]">Entrata: 08:30</p>
                        <p className="text-sm text-[#ef4444]">Uscita: 18:00</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
