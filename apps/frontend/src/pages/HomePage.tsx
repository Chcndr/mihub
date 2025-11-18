import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Store, Building2, Leaf, TrendingUp, BarChart3 } from 'lucide-react';
import { geoAPI } from '@/utils/api';

interface SearchResult {
  id: string;
  name: string;
  type: 'mercato' | 'hub' | 'negozio' | 'servizio';
  city: string;
  distance: number;
  isOpen: boolean;
  lat: number;
  lng: number;
}

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Dati demo per la ricerca
  const allResults: SearchResult[] = [
    { id: '1', name: 'Mercato Esperanto', type: 'mercato', city: 'Grosseto', distance: 0.5, isOpen: true, lat: 42.7634, lng: 11.1136 },
    { id: '2', name: 'Hub Sostenibile Roma', type: 'hub', city: 'Roma', distance: 150, isOpen: true, lat: 41.9028, lng: 12.4964 },
    { id: '3', name: 'Mercato Centrale', type: 'mercato', city: 'Firenze', distance: 120, isOpen: false, lat: 43.7696, lng: 11.2558 },
    { id: '4', name: 'Bio Market Milano', type: 'mercato', city: 'Milano', distance: 300, isOpen: true, lat: 45.4642, lng: 9.1900 },
    { id: '5', name: 'Negozio KM0 Toscana', type: 'negozio', city: 'Siena', distance: 45, isOpen: true, lat: 43.3188, lng: 11.3308 },
    { id: '6', name: 'Servizio Riparazione', type: 'servizio', city: 'Grosseto', distance: 1.2, isOpen: true, lat: 42.7634, lng: 11.1136 },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Chiamata API backend
    const { data, error } = await geoAPI.search(searchQuery, 42.7634, 11.1136);
    
    if (error || !data) {
      console.error('Search error:', error);
      // Fallback a dati mock in caso di errore
      const filtered = allResults
        .filter(r => 
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.distance - b.distance);
      setSearchResults(filtered);
      setShowResults(true);
      return;
    }

    // Mappa risultati API al formato locale
    const mapped = data.results.map(r => ({
      id: r.id,
      name: r.name,
      type: r.type as 'mercato' | 'hub' | 'negozio' | 'servizio',
      city: r.address?.split(',')[1]?.trim() || 'N/A',
      distance: r.distance / 1000, // metri -> km
      isOpen: r.isOpen,
      lat: r.lat,
      lng: r.lng,
    }));
    
    const filtered = mapped;

    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleResultClick = (result: SearchResult) => {
    // Naviga alla MapPage con parametri
    setLocation(`/mappa?lat=${result.lat}&lng=${result.lng}&zoom=15&id=${result.id}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mercato': return <Store className="w-4 h-4" />;
      case 'hub': return <Building2 className="w-4 h-4" />;
      case 'negozio': return <MapPin className="w-4 h-4" />;
      case 'servizio': return <TrendingUp className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Sfondo Italia con rete digitale */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: 'url(/italia-network.png)' }}
      />
      
      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* Contenuto */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-primary/95 backdrop-blur-sm text-primary-foreground p-4 shadow-lg border-b border-primary/20">
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">DMS Hub</h1>
                <p className="text-xs opacity-90">Gemello Digitale del Commercio</p>
              </div>
            </div>
            <Leaf className="w-6 h-6 opacity-80" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
          {/* Titolo */}
          <div className="text-center space-y-3 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Rete Mercati <span className="text-primary">Made in Italy</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Scopri mercati, hub e negozi sostenibili in tutta Italia
            </p>
          </div>

          {/* Barra di ricerca */}
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Cerca mercato, hub, città, azienda, servizio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 h-14 text-lg bg-card/90 backdrop-blur-sm border-primary/30 focus:border-primary"
              />
              <Button 
                size="lg" 
                onClick={handleSearch}
                className="h-14 px-6"
              >
                <Search className="w-5 h-5 mr-2" />
                Cerca
              </Button>
            </div>

            {/* Risultati ricerca */}
            {showResults && (
              <Card className="bg-card/95 backdrop-blur-sm border-primary/20 max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Nessun risultato trovato
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full p-4 hover:bg-accent/50 transition-colors text-left flex items-start gap-3"
                      >
                        <div className="mt-1 text-primary">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{result.name}</h3>
                            {result.isOpen && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                Aperto
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {result.type.charAt(0).toUpperCase() + result.type.slice(1)} • {result.city} • {result.distance} km
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Pulsanti sezioni app */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-5xl mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/mappa')}
              className="h-24 flex-col gap-2 bg-card/80 backdrop-blur-sm hover:bg-primary/20 border-primary/30"
            >
              <MapPin className="w-6 h-6" />
              <span>Mappa</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/route')}
              className="h-24 flex-col gap-2 bg-card/80 backdrop-blur-sm hover:bg-primary/20 border-primary/30"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Route</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/wallet')}
              className="h-24 flex-col gap-2 bg-card/80 backdrop-blur-sm hover:bg-primary/20 border-primary/30"
            >
              <Leaf className="w-6 h-6" />
              <span>Wallet</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/civic')}
              className="h-24 flex-col gap-2 bg-card/80 backdrop-blur-sm hover:bg-primary/20 border-primary/30"
            >
              <Search className="w-6 h-6" />
              <span>Segnala</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/vetrine')}
              className="h-24 flex-col gap-2 bg-card/80 backdrop-blur-sm hover:bg-primary/20 border-primary/30"
            >
              <Store className="w-6 h-6" />
              <span>Vetrine</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation('/dashboard-pa')}
              className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-sm hover:bg-purple-500/30 border-purple-500/50"
            >
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <span className="text-purple-300">Dashboard PA</span>
            </Button>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-sm text-muted-foreground">
          <p>PA Digitale 2026 • Cloud First • Rete Mercati Made in Italy</p>
        </footer>
      </div>
    </div>
  );
}
