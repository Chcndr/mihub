import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Camera, MapPin, CheckCircle2 } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { Link } from 'wouter';
import { toast } from 'sonner';

const categories = [
  'Degrado',
  'Rifiuti',
  'Illuminazione',
  'Sicurezza',
  'Buche',
  'Microcriminalità',
  'Altro',
];

export default function CivicPage() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGetLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
        toast.success('Posizione acquisita!');
      },
      (error) => {
        setLoading(false);
        toast.error('Impossibile ottenere la posizione');
        console.error(error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !description) {
      toast.error('Compila tutti i campi obbligatori');
      return;
    }

    if (!location) {
      toast.error('Acquisisci la posizione prima di inviare');
      return;
    }

    setLoading(true);

    // Simula invio API
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Segnalazione inviata con successo! +20 crediti alla risoluzione');
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Segnalazione Inviata!</h2>
            <p className="text-muted-foreground">
              Grazie per il tuo contributo. Riceverai aggiornamenti sullo stato della segnalazione e
              <strong className="text-green-600"> +20 eco-crediti</strong> quando sarà risolta.
            </p>
            <Link href="/">
              <Button className="w-full mt-4">Torna alla Mappa</Button>
            </Link>
          </CardContent>
        </Card>
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
            <AlertCircle className="h-6 w-6" />
            <h1 className="text-lg font-bold">Sensore Civico</h1>
          </div>
        </div>
      </header>

      <div className="container py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Segnala un Problema Urbano</CardTitle>
            <CardDescription>
              Aiutaci a migliorare la città. Riceverai +20 eco-crediti quando il problema sarà risolto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrizione */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione *</Label>
                <Textarea
                  id="description"
                  placeholder="Descrivi il problema in dettaglio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Posizione */}
              <div className="space-y-2">
                <Label>Posizione *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleGetLocation}
                    disabled={loading}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {location ? 'Posizione Acquisita' : 'Acquisisci Posizione'}
                  </Button>
                </div>
                {location && (
                  <p className="text-sm text-muted-foreground">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                )}
              </div>

              {/* Foto (placeholder) */}
              <div className="space-y-2">
                <Label>Foto (max 3)</Label>
                <Button type="button" variant="outline" className="w-full" disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Aggiungi Foto (Coming Soon)
                </Button>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annulla
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Invio...' : 'Invia Segnalazione'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Come funziona?</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Seleziona la categoria del problema</li>
                  <li>Descrivi la situazione in dettaglio</li>
                  <li>Acquisisci la posizione GPS</li>
                  <li>Ricevi notifiche sullo stato della segnalazione</li>
                  <li>Ottieni +20 crediti quando il problema è risolto</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
