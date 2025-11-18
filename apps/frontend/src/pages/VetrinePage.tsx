import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Store,
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Phone,
  Mail,
  Leaf,
  Award,
} from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

interface Shop {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  certifications: string[];
  address: string;
  phone: string;
  email: string;
  products: Product[];
}

const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Mercato Esperanto - Posteggio 12',
    category: 'Alimentari BIO',
    description: 'Prodotti biologici e a km0 direttamente dal produttore',
    rating: 4.8,
    certifications: ['BIO', 'KM0', 'Fair Trade'],
    address: 'Via Roma 12, Grosseto',
    phone: '+39 0564 123456',
    email: 'info@mercato-esperanto.it',
    products: [
      { id: 'p1', name: 'Pomodori BIO', price: 3.5 },
      { id: 'p2', name: 'Zucchine KM0', price: 2.8 },
      { id: 'p3', name: 'Insalata mista', price: 2.0 },
    ],
  },
  {
    id: '2',
    name: 'Bottega del Riuso',
    category: 'Usato/Riparato',
    description: 'Abbigliamento e oggetti di seconda mano, economia circolare',
    rating: 4.6,
    certifications: ['Usato/Riparato', 'Economia Circolare'],
    address: 'Piazza Dante 5, Grosseto',
    phone: '+39 0564 789012',
    email: 'contatto@bottegadelriuso.it',
    products: [
      { id: 'p4', name: 'Giacca vintage', price: 25.0 },
      { id: 'p5', name: 'Borsa in pelle', price: 18.0 },
      { id: 'p6', name: 'Scarpe ricondizionate', price: 30.0 },
    ],
  },
  {
    id: '3',
    name: 'Libreria Indipendente',
    category: 'Cultura',
    description: 'Libri nuovi e usati, eventi culturali e presentazioni',
    rating: 4.9,
    certifications: ['Artigianale', 'Locale'],
    address: 'Via Mazzini 23, Grosseto',
    phone: '+39 0564 345678',
    email: 'info@libreriaindipendente.it',
    products: [
      { id: 'p7', name: 'Romanzo italiano', price: 15.0 },
      { id: 'p8', name: 'Saggio sostenibilità', price: 18.0 },
      { id: 'p9', name: 'Libro usato', price: 8.0 },
    ],
  },
];

export default function VetrinePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simula caricamento negozi
    setShops(mockShops);
  }, []);

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookProduct = (product: Product) => {
    toast.success(`Prodotto "${product.name}" prenotato! Ritira in negozio.`);
  };

  if (selectedShop) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground p-3 shadow-md">
          <div className="container max-w-2xl flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setSelectedShop(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              <h1 className="text-lg font-bold">Dettaglio Negozio</h1>
            </div>
          </div>
        </header>

        <div className="container py-6 max-w-4xl space-y-6">
          {/* Info Negozio */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedShop.name}</CardTitle>
                  <CardDescription className="mt-1">{selectedShop.category}</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold">{selectedShop.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedShop.description}</p>

              {/* Certificazioni */}
              <div className="flex flex-wrap gap-2">
                {selectedShop.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="bg-green-100 text-green-800">
                    <Leaf className="h-3 w-3 mr-1" />
                    {cert}
                  </Badge>
                ))}
              </div>

              {/* Contatti */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedShop.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{selectedShop.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{selectedShop.email}</span>
                </div>
              </div>

              {/* Azioni */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Chiama
                </Button>
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Come Arrivare
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prodotti */}
          <Card>
            <CardHeader>
              <CardTitle>Prodotti</CardTitle>
              <CardDescription>Catalogo disponibile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedShop.products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">{product.name}</h3>
                      <span className="text-lg font-bold text-primary">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleBookProduct(product)}
                    >
                      Prenota
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            <Store className="h-6 w-6" />
            <h1 className="text-lg font-bold">Vetrine Commercianti</h1>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-4xl space-y-6">
        {/* Ricerca */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca negozio o categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista Negozi */}
        <div className="space-y-4">
          {filteredShops.map((shop) => (
            <Card
              key={shop.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedShop(shop)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{shop.name}</CardTitle>
                    <CardDescription>{shop.category}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">{shop.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{shop.description}</p>
                <div className="flex flex-wrap gap-2">
                  {shop.certifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nessun negozio trovato</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
