import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Upload, 
  Users, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  Building2,
  FileJson,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GISMap, GISMarker, MARKER_ICONS } from "@/components/GISMap";

/**
 * Componente Gestione Mercati
 * 
 * Sezione completa per gestione mercati, posteggi, operatori
 * Integrazione con Slot Editor v3 per import geometria
 */

export default function GestioneMercati() {
  const [activeTab, setActiveTab] = useState("mercati");
  const [selectedMarket, setSelectedMarket] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestione Mercati</h2>
          <p className="text-muted-foreground">
            Sistema completo per gestione mercati, posteggi e operatori
          </p>
        </div>
        <ImportSlotEditorDialog />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mercati">
            <Building2 className="mr-2 h-4 w-4" />
            Mercati
          </TabsTrigger>
          <TabsTrigger value="posteggi">
            <MapPin className="mr-2 h-4 w-4" />
            Posteggi
          </TabsTrigger>
          <TabsTrigger value="operatori">
            <Users className="mr-2 h-4 w-4" />
            Operatori
          </TabsTrigger>
          <TabsTrigger value="prenotazioni">
            <Calendar className="mr-2 h-4 w-4" />
            Prenotazioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mercati" className="space-y-4">
          <MercatiList onSelectMarket={setSelectedMarket} />
        </TabsContent>

        <TabsContent value="posteggi" className="space-y-4">
          <PosteggiMapView selectedMarket={selectedMarket} onSelectMarket={setSelectedMarket} />
        </TabsContent>

        <TabsContent value="operatori" className="space-y-4">
          <OperatoriList />
        </TabsContent>

        <TabsContent value="prenotazioni" className="space-y-4">
          <PrenotazioniList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * Dialog per import JSON da Slot Editor v3
 */
function ImportSlotEditorDialog() {
  const [open, setOpen] = useState(false);
  const [jsonData, setJsonData] = useState("");
  const [marketName, setMarketName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const utils = trpc.useUtils();
  const importMutation = trpc.dmsHub.markets.importFromSlotEditor.useMutation({
    onSuccess: (data) => {
      toast.success(`Mercato importato con successo!`, {
        description: `${data.stallsCreated} posteggi, ${data.markersCreated} marker, ${data.areasCreated} aree`,
      });
      utils.dmsHub.markets.list.invalidate();
      setOpen(false);
      setJsonData("");
      setMarketName("");
      setCity("");
      setAddress("");
    },
    onError: (error) => {
      toast.error("Errore durante l'import", {
        description: error.message,
      });
    },
  });

  const handleImport = () => {
    if (!marketName || !city || !address || !jsonData) {
      toast.error("Compila tutti i campi");
      return;
    }

    try {
      const slotEditorData = JSON.parse(jsonData);
      importMutation.mutate({
        marketName,
        city,
        address,
        slotEditorData,
      });
    } catch (error) {
      toast.error("JSON non valido", {
        description: "Verifica il formato del JSON esportato da Slot Editor v3",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Importa da Slot Editor v3
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importa Mercato da Slot Editor v3</DialogTitle>
          <DialogDescription>
            Incolla il JSON esportato da Slot Editor v3 per creare un nuovo mercato con posteggi, marker e aree
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="marketName">Nome Mercato *</Label>
            <Input
              id="marketName"
              placeholder="es. Mercato Centrale Grosseto"
              value={marketName}
              onChange={(e) => setMarketName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Città *</Label>
              <Input
                id="city"
                placeholder="es. Grosseto"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo *</Label>
              <Input
                id="address"
                placeholder="es. Via Roma, 1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jsonData">JSON da Slot Editor v3 *</Label>
            <Textarea
              id="jsonData"
              placeholder='{"container": {...}, "stalls": [...], ...}'
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Copia il JSON completo esportato da Slot Editor v3 (include container, posteggi, marker, aree)
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleImport} disabled={importMutation.isPending}>
              {importMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Importa Mercato
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Lista mercati con statistiche
 */
function MercatiList({ onSelectMarket }: { onSelectMarket: (id: number) => void }) {
  const { data: markets, isLoading } = trpc.dmsHub.markets.list.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!markets || markets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nessun mercato configurato</p>
          <p className="text-sm text-muted-foreground">
            Usa il pulsante "Importa da Slot Editor v3" per iniziare
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {markets.map((market) => (
        <Card 
          key={market.id} 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelectMarket(market.id)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {market.name}
            </CardTitle>
            <CardDescription>{market.city} - {market.address}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posteggi Totali</span>
                <Badge variant="secondary">{market.totalStalls}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Occupati</span>
                <Badge variant="destructive">{market.occupiedStalls}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Liberi</span>
                <Badge variant="default" className="bg-green-500">{market.freeStalls}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Stato</span>
                <Badge variant={market.active === 1 ? "default" : "secondary"}>
                  {market.active === 1 ? "Attivo" : "Inattivo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Vista mappa posteggi con dropdown mercati
 */
function PosteggiMapView({ selectedMarket, onSelectMarket }: { selectedMarket: number | null, onSelectMarket: (id: number) => void }) {
  const { data: markets } = trpc.dmsHub.markets.list.useQuery();
  const { data: stalls, isLoading } = trpc.dmsHub.stalls.listByMarket.useQuery(
    { marketId: selectedMarket! },
    { enabled: !!selectedMarket }
  );

  // Se non c'è mercato selezionato, seleziona il primo automaticamente
  useEffect(() => {
    if (!selectedMarket && markets && markets.length > 0) {
      onSelectMarket(markets[0].id);
    }
  }, [selectedMarket, markets, onSelectMarket]);

  if (isLoading || !stalls) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const selectedMarketData = markets?.find(m => m.id === selectedMarket);

  return (
    <div className="space-y-4">
      {/* Header con titolo e dropdown */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mappa Posteggi</CardTitle>
              <CardDescription>
                {stalls.length} posteggi totali
              </CardDescription>
            </div>
            <select
              value={selectedMarket || ''}
              onChange={(e) => onSelectMarket(Number(e.target.value))}
              className="px-4 py-2 rounded-lg border border-input bg-background text-sm"
            >
              {markets?.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.name} - {market.city}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Mappa full-height */}
      <GISMap
          center={[
            selectedMarketData?.lat ? Number(selectedMarketData.lat) : 42.7638,
            selectedMarketData?.lng ? Number(selectedMarketData.lng) : 11.1139
          ]}
          zoom={18}
          markers={stalls.map(stall => ({
            id: stall.id,
            position: [Number(stall.lat) || 42.7638, Number(stall.lng) || 11.1139] as [number, number],
            type: stall.status === 'free' ? 'free' : 
                  stall.status === 'occupied' ? 'occupied' :
                  stall.status === 'booked' ? 'reserved' :
                  stall.status === 'maintenance' ? 'maintenance' : 'blocked',
            title: `Posteggio #${stall.number}`,
            description: stall.category || 'Nessuna categoria',
            data: {
              'Area': stall.areaMq ? `${stall.areaMq} m²` : 'N/D',
              'Stato': stall.status,
            },
          }))}
        height="calc(100vh - 400px)"
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
}

/**
 * Lista posteggi per mercato
 */
function PosteggiList({ marketId }: { marketId: number }) {
  const { data: stalls, isLoading } = trpc.dmsHub.stalls.listByMarket.useQuery({ marketId });
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.dmsHub.stalls.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Stato posteggio aggiornato");
      utils.dmsHub.stalls.listByMarket.invalidate({ marketId });
      utils.dmsHub.markets.list.invalidate();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stalls || stalls.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nessun posteggio trovato</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "free":
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Libero</Badge>;
      case "occupied":
        return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" />Occupato</Badge>;
      case "booked":
        return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Prenotato</Badge>;
      case "reserved":
        return <Badge variant="outline">Riservato</Badge>;
      case "maintenance":
        return <Badge variant="secondary">Manutenzione</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posteggi del Mercato</CardTitle>
        <CardDescription>
          {stalls.length} posteggi totali
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mappa GIS Posteggi */}
        <GISMap
          center={[42.7638, 11.1139]} // Centro Italia (da sostituire con centro mercato reale)
          zoom={18}
          markers={stalls.map(stall => ({
            id: stall.id,
            position: [Number(stall.lat) || 42.7638, Number(stall.lng) || 11.1139] as [number, number],
            type: stall.status === 'free' ? 'free' : 
                  stall.status === 'occupied' ? 'occupied' :
                  stall.status === 'booked' ? 'reserved' :
                  stall.status === 'maintenance' ? 'maintenance' : 'blocked',
            title: `Posteggio #${stall.number}`,
            description: stall.category || 'Nessuna categoria',
            data: {
              'Area': stall.areaMq ? `${stall.areaMq} m²` : 'N/D',
              'Stato': stall.status,
            },
          }))}
          height="400px"
        />

        {/* Griglia Posteggi */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stalls.map((stall) => (
            <Card key={stall.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">#{stall.number}</span>
                  {getStatusBadge(stall.status)}
                </div>
                {stall.category && (
                  <p className="text-xs text-muted-foreground">{stall.category}</p>
                )}
                {stall.areaMq && (
                  <p className="text-xs text-muted-foreground">{stall.areaMq} m²</p>
                )}
                <div className="flex gap-1 flex-wrap">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7"
                    onClick={() => updateStatusMutation.mutate({ stallId: stall.id, status: "free" })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Libera
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7"
                    onClick={() => updateStatusMutation.mutate({ stallId: stall.id, status: "maintenance" })}
                    disabled={updateStatusMutation.isPending}
                  >
                    Manutenzione
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Lista operatori
 */
function OperatoriList() {
  const { data: vendors, isLoading } = trpc.dmsHub.vendors.list.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Nessun operatore registrato</p>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Aggiungi Operatore
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Operatori Registrati</CardTitle>
            <CardDescription>{vendors.length} operatori totali</CardDescription>
          </div>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Nuovo Operatore
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {vendor.firstName} {vendor.lastName}
                  </p>
                  {vendor.businessName && (
                    <p className="text-sm text-muted-foreground">{vendor.businessName}</p>
                  )}
                  {vendor.businessType && (
                    <Badge variant="outline" className="mt-1">{vendor.businessType}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={vendor.status === "active" ? "default" : "secondary"}>
                    {vendor.status === "active" ? "Attivo" : vendor.status}
                  </Badge>
                  <Button size="sm" variant="outline">Dettagli</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Lista prenotazioni attive
 */
function PrenotazioniList() {
  const { data: bookings, isLoading } = trpc.dmsHub.bookings.listActive.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nessuna prenotazione attiva</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prenotazioni Attive</CardTitle>
        <CardDescription>{bookings.length} prenotazioni in attesa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Posteggio #{booking.stallId}</p>
                  <p className="text-sm text-muted-foreground">
                    Scade: {new Date(booking.expiresAt).toLocaleString("it-IT")}
                  </p>
                </div>
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  {booking.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
