import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navigation, ArrowLeft, Leaf, Clock, MapPin, TrendingUp, Car, Bike, Footprints, Bus, Loader2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { useEffect } from 'react';
import MobilityMap from '@/components/MobilityMap';
import { trpc } from '@/lib/trpc';

interface RouteStop {
  name: string;
  address: string;
  duration: number; // minuti
}

interface RoutePlan {
  stops: RouteStop[];
  totalDistance: number; // km
  totalTime: number; // minuti
  co2Saved: number; // grammi
  creditsEarned: number;
}

export default function RoutePage() {
  const [location] = useLocation();
  const [mode, setMode] = useState('walk');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [navigationActive, setNavigationActive] = useState(false);
  const [directions, setDirections] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const mobilityData = trpc.mobility.list.useQuery();

  // Auto-carica indirizzo da URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const address = params.get('address');
    const shopName = params.get('name');
    
    if (address) {
      setDestination(shopName ? `${shopName} - ${address}` : address);
      toast.success('Destinazione caricata!');
    }
  }, [location]);

  // Funzione per rilevare posizione utente
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalizzazione non supportata dal browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setOrigin(`${latitude}, ${longitude}`);
        toast.success('✅ Posizione rilevata!');
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('❌ Impossibile rilevare posizione');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePlanRoute = () => {
    if (!origin || !destination) {
      toast.error('Inserisci partenza e destinazione');
      return;
    }

    setLoading(true);

    // Calcola opzioni multi-modali
    setTimeout(() => {
      const options = [
        {
          mode: 'walk',
          label: 'A piedi',
          icon: <Footprints className="h-4 w-4" />,
          duration: 35,
          distance: 2.3,
          co2: 0,
          credits: 25,
          sustainability: 100
        },
        {
          mode: 'bike',
          label: 'Bicicletta',
          icon: <Bike className="h-4 w-4" />,
          duration: 12,
          distance: 2.3,
          co2: 0,
          credits: 20,
          sustainability: 100
        },
        {
          mode: 'transit',
          label: 'Bus/Tram',
          icon: <Bus className="h-4 w-4" />,
          duration: 18,
          distance: 2.8,
          co2: 85,
          credits: 15,
          sustainability: 75
        },
        {
          mode: 'car',
          label: 'Auto',
          icon: <Car className="h-4 w-4" />,
          duration: 8,
          distance: 2.5,
          co2: 450,
          credits: 0,
          sustainability: 20
        }
      ];

      setRouteOptions(options);

      // Calcola piano per modalità selezionata
      const selectedOption = options.find(o => o.mode === mode) || options[0];
      const mockPlan: RoutePlan = {
        stops: [
          { name: 'Mercato Esperanto', address: 'Via Roma 12, Grosseto', duration: 15 },
          { name: 'Negozio BIO', address: 'Piazza Dante 5, Grosseto', duration: 10 },
          { name: 'Libreria Indipendente', address: 'Via Mazzini 23, Grosseto', duration: 8 },
        ],
        totalDistance: selectedOption.distance,
        totalTime: selectedOption.duration,
        co2Saved: 450 - selectedOption.co2, // CO₂ risparmiata vs auto
        creditsEarned: selectedOption.credits,
      };

      setPlan(mockPlan);
      setLoading(false);
      toast.success(`Percorso ${selectedOption.label} calcolato!`);
    }, 1500);
  };

  const handleStartNavigation = () => {
    if (!directions) {
      toast.error('Calcola prima il percorso');
      return;
    }
    
    setNavigationActive(true);
    setCurrentStep(0);
    toast.success('🧭Navigazione avviata! +15 crediti al completamento');
    
    // Avvia tracking posizione real-time
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // TODO: Calcolare distanza da prossima svolta e aggiornare currentStep
        },
        (error) => console.error('Error tracking location:', error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-3 shadow-md">
        <div className="container max-w-2xl flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Navigation className="h-6 w-6" />
            <h1 className="text-lg font-bold">Shopping Route Etico</h1>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-2xl space-y-6">
        {/* Form Pianificazione */}
        <Card>
          <CardHeader>
            <CardTitle>Pianifica il tuo Percorso</CardTitle>
            <CardDescription>
              Ottimizziamo il tuo itinerario per risparmiare tempo e CO₂
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Modalità trasporto */}
            <div className="space-y-2">
              <Label htmlFor="mode">Modalità di trasporto</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">🚶 A piedi</SelectItem>
                  <SelectItem value="bike">🚲 Bicicletta</SelectItem>
                  <SelectItem value="transit">🚌 Trasporto pubblico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Partenza */}
            <div className="space-y-2">
              <Label htmlFor="origin">Partenza</Label>
              <div className="flex gap-2">
                <Input
                  id="origin"
                  placeholder="es. Via Mazzini 10, Grosseto"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={getUserLocation}
                  disabled={loadingLocation}
                  title="Usa posizione corrente"
                >
                  {loadingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Destinazione */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destinazione finale</Label>
              <Input
                id="destination"
                placeholder="es. Centro città, Via Roma..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Confronto Modalità */}
            {routeOptions.length > 0 && (
              <div className="space-y-2">
                <Label>Confronto Opzioni di Trasporto</Label>
                <div className="grid grid-cols-2 gap-2">
                  {routeOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMode(option.mode)}
                      className={`p-3 border rounded-lg text-left transition-all ${
                        mode === option.mode
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {option.icon}
                        <span className="font-semibold text-sm">{option.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.duration} min • {option.co2}g CO₂
                      </div>
                      <div className="text-xs font-semibold text-green-600 mt-1">
                        +{option.credits} crediti
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pulsante pianifica */}
            <Button onClick={handlePlanRoute} disabled={loading} className="w-full">
              {loading ? 'Calcolo in corso...' : 'Pianifica Percorso'}
            </Button>
          </CardContent>
        </Card>

        {/* Risultato Pianificazione */}
        {plan && (
          <>
            {/* Statistiche */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{plan.totalDistance}</div>
                  <div className="text-xs text-muted-foreground">km totali</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{plan.totalTime}</div>
                  <div className="text-xs text-muted-foreground">minuti</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Leaf className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{plan.co2Saved}g</div>
                  <div className="text-xs text-muted-foreground">CO₂ evitata</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold">+{plan.creditsEarned}</div>
                  <div className="text-xs text-muted-foreground">crediti</div>
                </CardContent>
              </Card>
            </div>

            {/* Punteggio Sostenibilità */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Punteggio Sostenibilità
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barra progresso sostenibilità */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-green-900">Impatto Ambientale</span>
                      <span className="text-sm font-bold text-green-600">
                        {routeOptions.find(o => o.mode === mode)?.sustainability || 0}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                        style={{ width: `${routeOptions.find(o => o.mode === mode)?.sustainability || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Badge Carbon Credits */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl mb-1">🌱</div>
                      <div className="text-xs font-semibold text-green-900">Eco-Friendly</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl mb-1">♻️</div>
                      <div className="text-xs font-semibold text-green-900">Low Carbon</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl mb-1">🌍</div>
                      <div className="text-xs font-semibold text-green-900">Sustainable</div>
                    </div>
                  </div>

                  {/* Confronto CO₂ */}
                  <div className="text-sm text-green-900 bg-white p-3 rounded-lg border border-green-200">
                    <p className="font-semibold mb-2">Risparmio CO₂ vs Auto:</p>
                    <div className="flex items-center justify-between">
                      <span>Auto (benzina)</span>
                      <span className="font-bold text-red-600">450g CO₂</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>{routeOptions.find(o => o.mode === mode)?.label || 'Tua scelta'}</span>
                      <span className="font-bold text-green-600">
                        {routeOptions.find(o => o.mode === mode)?.co2 || 0}g CO₂
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Risparmiato:</span>
                        <span className="font-bold text-green-600">
                          {plan.co2Saved}g CO₂ (≈ {(plan.co2Saved / 22).toFixed(1)} alberi/anno)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mappa Percorso */}
            {origin && destination && (
              <Card>
                <CardHeader>
                  <CardTitle>Mappa Percorso</CardTitle>
                  <CardDescription>Visualizzazione interattiva del percorso calcolato</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <MobilityMap
                      stops={mobilityData.data?.filter((m: any) => m.type === 'bus' || m.type === 'tram').slice(0, 5).map((m: any) => ({
                        id: m.id,
                        type: m.type,
                        stopName: m.stopName,
                        lineNumber: m.lineNumber,
                        lineName: m.lineName,
                        lat: m.lat,
                        lng: m.lng,
                        nextArrival: m.nextArrival,
                        occupancy: m.occupancy,
                        status: m.status
                      })) || []}
                      showDirections={true}
                      origin={origin}
                      destination={destination}
                      center={{ lat: 42.7606, lng: 11.1133 }}
                      zoom={13}
                      onDirectionsCalculated={(dirs) => setDirections(dirs)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tappe del percorso */}
            <Card>
              <CardHeader>
                <CardTitle>Tappe del Percorso</CardTitle>
                <CardDescription>Percorso ottimizzato con algoritmo TSP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{stop.name}</p>
                        <p className="text-sm text-muted-foreground">{stop.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tempo stimato: {stop.duration} min
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Istruzioni Navigazione Turn-by-Turn */}
            {navigationActive && directions && (
              <Card className="border-green-500 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Navigation className="h-5 w-5 animate-pulse" />
                    Navigazione Attiva
                  </CardTitle>
                  <CardDescription>Segui le istruzioni passo-passo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {directions.routes[0]?.legs[0]?.steps.map((step: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                          idx === currentStep
                            ? 'bg-green-200 border-2 border-green-600'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          idx === currentStep ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              idx === currentStep ? 'text-green-900 text-lg' : 'text-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: step.instructions }}
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            {step.distance.text} • {step.duration.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      setNavigationActive(false);
                      toast.success('✅ Navigazione completata! +15 crediti guadagnati');
                    }}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Termina Navigazione
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Azioni */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setPlan(null)}>
                Modifica
              </Button>
              <Button onClick={handleStartNavigation} className="bg-green-600 hover:bg-green-700">
                Avvia Navigazione
              </Button>
            </div>
          </>
        )}

        {/* Info Box */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Leaf className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">Perché usare Shopping Route?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Percorso ottimizzato per risparmiare tempo</li>
                  <li>Riduci le emissioni di CO₂</li>
                  <li>Guadagna +15 eco-crediti al completamento</li>
                  <li>Supporta il commercio locale e sostenibile</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
