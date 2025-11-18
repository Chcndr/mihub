import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, MapPin, Clock, Award, Phone, Mail, Navigation, Store } from 'lucide-react';

interface ShopModalProps {
  shop: {
    id: string;
    name: string;
    category?: string;
    lat: number;
    lng: number;
  };
  onClose: () => void;
}

export default function ShopModal({ shop, onClose }: ShopModalProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'home' | 'prodotti' | 'info' | 'contatti'>('home');

  // Dati demo negozio
  const shopDetails = {
    description: 'Negozio di prodotti biologici e a km0. Offriamo frutta e verdura di stagione, prodotti artigianali locali e specialità toscane.',
    orari: {
      lunVen: '8:00 - 19:00',
      sabato: '8:00 - 20:00',
      domenica: '9:00 - 13:00'
    },
    certificazioni: ['BIO', 'KM0', 'Fair Trade'],
    telefono: '+39 0564 123456',
    email: 'info@negozio.it',
    indirizzo: 'Via Roma 123, Grosseto',
    prodotti: [
      { id: 1, nome: 'Pomodori Bio', prezzo: '3.50 €/kg', immagine: '🍅', certificazioni: ['BIO', 'KM0'] },
      { id: 2, nome: 'Olio Extra Vergine', prezzo: '12.00 €/l', immagine: '🫒', certificazioni: ['BIO', 'DOP'] },
      { id: 3, nome: 'Formaggio Pecorino', prezzo: '18.00 €/kg', immagine: '🧀', certificazioni: ['KM0', 'DOP'] },
      { id: 4, nome: 'Miele Toscano', prezzo: '8.50 €/500g', immagine: '🍯', certificazioni: ['BIO', 'KM0'] },
      { id: 5, nome: 'Pasta Artigianale', prezzo: '4.50 €/500g', immagine: '🍝', certificazioni: ['KM0'] },
      { id: 6, nome: 'Vino Rosso DOC', prezzo: '15.00 €/bottiglia', immagine: '🍷', certificazioni: ['DOC', 'KM0'] },
    ]
  };

  const handleShopRoute = () => {
    // Naviga alla RoutePage con dati negozio
    const address = encodeURIComponent(shopDetails.indirizzo);
    const name = encodeURIComponent(shop.name);
    setLocation(`/route?shopId=${shop.id}&lat=${shop.lat}&lng=${shop.lng}&address=${address}&name=${name}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{shop.name}</h2>
          <p className="text-sm opacity-90">{shop.category || 'Negozio'}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border flex">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'home'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('prodotti')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'prodotti'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Prodotti
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('contatti')}
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            activeTab === 'contatti'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Contatti
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Tab Home */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Immagine Vetrina/Logo */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4">🏪</div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{shop.name}</h3>
                  <p className="text-lg text-muted-foreground">{shop.category || 'Negozio'}</p>
                </div>
              </div>
            </div>

            {/* Descrizione Breve */}
            <Card className="p-4 bg-card border-border">
              <h4 className="font-semibold text-foreground mb-2">Benvenuto!</h4>
              <p className="text-muted-foreground">
                Scopri i nostri prodotti di qualità, consulta gli orari di apertura e contattaci per maggiori informazioni.
              </p>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setActiveTab('prodotti')}
              >
                <Store className="w-6 h-6" />
                <span>Prodotti</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setActiveTab('info')}
              >
                <Clock className="w-6 h-6" />
                <span>Orari</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => setActiveTab('contatti')}
              >
                <Phone className="w-6 h-6" />
                <span>Contatti</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleShopRoute}
              >
                <Navigation className="w-6 h-6" />
                <span>Percorso</span>
              </Button>
            </div>

            {/* Certificazioni in evidenza */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Certificazioni</h4>
              <div className="flex flex-wrap gap-2">
                {shopDetails.certificazioni.map((cert) => (
                  <span
                    key={cert}
                    className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Prodotti */}
        {activeTab === 'prodotti' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Vetrina Prodotti</h3>
            <div className="grid grid-cols-2 gap-4">
              {shopDetails.prodotti.map((prodotto) => (
                <Card key={prodotto.id} className="p-4 bg-card border-border">
                  <div className="text-5xl mb-2 text-center">{prodotto.immagine}</div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">{prodotto.nome}</h4>
                  <p className="text-primary font-bold text-sm mb-2">{prodotto.prezzo}</p>
                  <div className="flex flex-wrap gap-1">
                    {prodotto.certificazioni.map((cert) => (
                      <span
                        key={cert}
                        className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" className="w-full mt-3">
                    Prenota
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab Info */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Descrizione</h3>
              <p className="text-muted-foreground">{shopDetails.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Orari di Apertura
              </h3>
              <Card className="p-4 bg-card border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lun - Ven</span>
                  <span className="font-semibold text-foreground">{shopDetails.orari.lunVen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sabato</span>
                  <span className="font-semibold text-foreground">{shopDetails.orari.sabato}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domenica</span>
                  <span className="font-semibold text-foreground">{shopDetails.orari.domenica}</span>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Certificazioni
              </h3>
              <div className="flex flex-wrap gap-2">
                {shopDetails.certificazioni.map((cert) => (
                  <span
                    key={cert}
                    className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-semibold"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Contatti */}
        {activeTab === 'contatti' && (
          <div className="space-y-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Indirizzo</h4>
                  <p className="text-muted-foreground">{shopDetails.indirizzo}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <Phone className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Telefono</h4>
                  <a href={`tel:${shopDetails.telefono}`} className="text-primary hover:underline">
                    {shopDetails.telefono}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <a href={`mailto:${shopDetails.email}`} className="text-primary hover:underline">
                    {shopDetails.email}
                  </a>
                </div>
              </div>
            </Card>

            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Coordinate GPS</p>
              <p className="font-mono text-sm text-foreground">
                {shop.lat.toFixed(4)}, {shop.lng.toFixed(4)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer con pulsante Shop Route */}
      <div className="bg-card border-t border-border p-4">
        <Button
          size="lg"
          className="w-full"
          onClick={handleShopRoute}
        >
          <Navigation className="w-5 h-5 mr-2" />
          Shop Route Etico
        </Button>
      </div>
    </div>
  );
}
