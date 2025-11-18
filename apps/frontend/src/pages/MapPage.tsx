import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Store, Filter, Search, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ShopModal from '@/components/ShopModal';

// Fix per icone marker Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Shop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
}

export default function MapPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Imposta posizione predefinita: centro Grosseto
    setPosition([42.7635, 11.1128]);
    
    // Prova geolocalizzazione utente (opzionale)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // Mantieni fallback Grosseto
        console.log('Geolocalizzazione non disponibile, uso posizione Grosseto');
      },
      { timeout: 5000 }
    );

    // Carica dati mercato Grosseto
    fetch('/data/grosseto_complete.json')
      .then((r) => r.json())
      .then((data) => {
        setMarketData(data);
        // Genera shop demo diversificati per categoria
        const categories = [
          { cat: 'Alimentari', shops: ['Frutta e Verdura Bio', 'Salumeria Artigianale', 'Panificio Tradizionale'] },
          { cat: 'Abbigliamento', shops: ['Boutique Vintage', 'Abbigliamento Sostenibile', 'Calzature Artigianali'] },
          { cat: 'Artigianato', shops: ['Ceramiche Toscane', 'Gioielli Fatti a Mano', 'Oggetti in Legno'] },
          { cat: 'Libri', shops: ['Libreria Indipendente', 'Libri Usati e Rari'] },
          { cat: 'Elettronica', shops: ['Riparazioni Tech', 'Accessori Ricondizionati'] },
        ];
        
        const demoShops: Shop[] = [];
        let idx = 0;
        categories.forEach(({ cat, shops: shopNames }) => {
          shopNames.forEach((name) => {
            demoShops.push({
              id: `shop-${idx}`,
              name,
              lat: 42.7635 + (Math.random() - 0.5) * 0.015,
              lng: 11.1128 + (Math.random() - 0.5) * 0.015,
              category: cat,
            });
            idx++;
          });
        });
        setShops(demoShops);
      })
      .catch((err) => console.error('Errore caricamento dati:', err));
  }, []);

  if (!position) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento mappa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-3 shadow-md">
        <div className="container max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6" />
            <h1 className="text-lg font-bold">DMS Hub</h1>
          </div>
          <p className="text-xs opacity-90">Commercio Sostenibile</p>
        </div>
      </header>

      {/* Mappa */}
      <div className="relative" style={{ height: 'calc(100vh - 110px)' }}>
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Marker posizione utente */}
          <Marker position={position}>
            <Popup>La tua posizione</Popup>
          </Marker>

          {/* Marker negozi/mercati */}
          {shops.map((shop) => (
            <Marker key={shop.id} position={[shop.lat, shop.lng]}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground">{shop.category}</p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => setSelectedShop(shop)}
                  >
                    Vedi dettagli
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Pulsante toggle filtri laterale */}
        <div className="absolute top-32 right-4 z-20 flex flex-col gap-2">
          <Button
            size="icon"
            variant="default"
            className="bg-primary hover:bg-primary/90 shadow-lg"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          </Button>
        </div>

        {/* Pannello filtri slide-in */}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-card shadow-2xl z-30 transform transition-transform duration-300 ${
            showFilters ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Header pannello */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="font-semibold text-lg text-foreground">Filtri e Ricerca</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Ricerca */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                <Search className="w-4 h-4 inline mr-2" />
                Cerca
              </label>
              <input
                type="text"
                placeholder="Cerca negozio, categoria..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            {/* Filtri categoria */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                <Filter className="w-4 h-4 inline mr-2" />
                Categoria
              </label>
              <div className="space-y-2">
                {['Tutti', 'Alimentari', 'Abbigliamento', 'Artigianato', 'Libri', 'Elettronica'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-foreground">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="mt-auto bg-primary/10 p-3 rounded-lg">
              <h4 className="font-semibold text-sm text-foreground mb-1">Mercati e Hub Sostenibili</h4>
              <p className="text-xs text-muted-foreground">
                {shops.length} punti vendita nelle vicinanze
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Shop Modal */}
      {selectedShop && (
        <ShopModal 
          shop={selectedShop} 
          onClose={() => setSelectedShop(null)} 
        />
      )}
    </div>
  );
}
