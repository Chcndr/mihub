import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plug,
  Key,
  Webhook,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Trash2,
  Plus,
  ExternalLink,
  Activity,
  Clock,
  Database,
  Code,
  Play,
  FileJson,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function Integrazioni() {
  const [activeTab, setActiveTab] = useState('api-dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#e8fbff]">Integrazioni e API</h2>
          <p className="text-[#e8fbff]/60 mt-1">
            Gestisci connessioni esterne, API keys, webhook e sincronizzazioni
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#0a1628]">
          <TabsTrigger value="api-dashboard">
            <Code className="h-4 w-4 mr-2" />
            API Dashboard
          </TabsTrigger>
          <TabsTrigger value="connections">
            <Plug className="h-4 w-4 mr-2" />
            Connessioni
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="sync-status">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Status
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: API DASHBOARD */}
        <TabsContent value="api-dashboard" className="space-y-6">
          <APIDashboard />
        </TabsContent>

        {/* TAB 2: CONNESSIONI ESTERNE */}
        <TabsContent value="connections" className="space-y-6">
          <ConnessioniEsterne />
        </TabsContent>

        {/* TAB 3: API KEYS */}
        <TabsContent value="api-keys" className="space-y-6">
          <APIKeysManager />
        </TabsContent>

        {/* TAB 4: WEBHOOK */}
        <TabsContent value="webhooks" className="space-y-6">
          <WebhookManager />
        </TabsContent>

        {/* TAB 5: SYNC STATUS */}
        <TabsContent value="sync-status" className="space-y-6">
          <SyncStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// TAB 1: API DASHBOARD
// ============================================================================
function APIDashboard() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [requestBody, setRequestBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const utils = trpc.useUtils();
  const { data: apiStats } = trpc.integrations.apiStats.today.useQuery();

  const apiEndpoints = [
    {
      category: 'Mercati',
      endpoints: [
        { method: 'POST', path: '/api/dmsHub/markets/importFromSlotEditor', description: 'Import JSON da Slot Editor v3 (manuale)' },
        { method: 'POST', path: '/api/dmsHub/markets/importAuto', description: 'Import automatico da Slot Editor v3' },
        { method: 'GET', path: '/api/dmsHub/markets/list', description: 'Lista mercati con statistiche' },
        { method: 'GET', path: '/api/dmsHub/markets/getById', description: 'Dettagli mercato completo' },
      ]
    },
    {
      category: 'Posteggi',
      endpoints: [
        { method: 'GET', path: '/api/dmsHub/stalls/listByMarket', description: 'Lista posteggi per mercato' },
        { method: 'POST', path: '/api/dmsHub/stalls/updateStatus', description: 'Aggiorna stato posteggio' },
        { method: 'GET', path: '/api/dmsHub/stalls/getStatuses', description: 'Stati real-time' },
      ]
    },
    {
      category: 'Operatori',
      endpoints: [
        { method: 'GET', path: '/api/dmsHub/vendors/list', description: 'Lista operatori' },
        { method: 'POST', path: '/api/dmsHub/vendors/create', description: 'Crea operatore' },
        { method: 'PUT', path: '/api/dmsHub/vendors/update', description: 'Aggiorna operatore' },
        { method: 'GET', path: '/api/dmsHub/vendors/getFullDetails', description: 'Dettagli completi (Polizia)' },
      ]
    },
    {
      category: 'Prenotazioni',
      endpoints: [
        { method: 'POST', path: '/api/dmsHub/bookings/create', description: 'Prenota posteggio' },
        { method: 'GET', path: '/api/dmsHub/bookings/listActive', description: 'Prenotazioni attive' },
        { method: 'POST', path: '/api/dmsHub/bookings/confirmCheckin', description: 'Conferma check-in' },
        { method: 'DELETE', path: '/api/dmsHub/bookings/cancel', description: 'Cancella prenotazione' },
      ]
    },
    {
      category: 'Presenze',
      endpoints: [
        { method: 'POST', path: '/api/dmsHub/presences/checkout', description: 'Check-out operatore' },
        { method: 'GET', path: '/api/dmsHub/presences/getTodayByMarket', description: 'Presenze oggi' },
      ]
    },
    {
      category: 'Controlli',
      endpoints: [
        { method: 'POST', path: '/api/dmsHub/inspections/create', description: 'Crea controllo Polizia' },
        { method: 'GET', path: '/api/dmsHub/inspections/list', description: 'Lista controlli' },
      ]
    },
    {
      category: 'Verbali',
      endpoints: [
        { method: 'POST', path: '/api/dmsHub/violations/create', description: 'Emetti verbale' },
        { method: 'GET', path: '/api/dmsHub/violations/list', description: 'Lista verbali' },
      ]
    },
    {
      category: 'MIO Agent',
      endpoints: [
        { method: 'POST', path: '/api/logs/initSchema', description: 'Inizializza tabella mio_agent_logs' },
        { method: 'POST', path: '/api/logs/createLog', description: 'Crea nuovo log agente' },
        { method: 'GET', path: '/api/logs/getLogs', description: 'Recupera log agenti' },
      ]
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'POST': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleTestEndpoint = async (endpoint: string, customBody?: string) => {
    setSelectedEndpoint(endpoint);
    setTestResult(null);
    setIsLoading(true);
    
    const startTime = Date.now();
    
    try {
      let data: any = null;
      
      // Parse request body se presente
      let parsedBody: any = {};
      const bodyToUse = customBody || requestBody;
      if (bodyToUse && bodyToUse.trim()) {
        try {
          parsedBody = JSON.parse(bodyToUse);
        } catch (e) {
          throw new Error('JSON non valido nel Request Body');
        }
      }
      
      // Mappa endpoint → chiamata TRPC
      switch (endpoint) {
        // MERCATI
        case '/api/dmsHub/markets/importAuto':
          data = await utils.client.dmsHub.markets.importAuto.mutate(parsedBody);
          break;
        case '/api/dmsHub/markets/list':
          data = await utils.client.dmsHub.markets.list.query();
          break;
        case '/api/dmsHub/markets/getById':
          data = await utils.client.dmsHub.markets.getById.query(parsedBody);
          break;
          
        // POSTEGGI
        case '/api/dmsHub/stalls/listByMarket':
          data = await utils.client.dmsHub.stalls.listByMarket.query(parsedBody);
          break;
        case '/api/dmsHub/stalls/updateStatus':
          data = await utils.client.dmsHub.stalls.updateStatus.mutate(parsedBody);
          break;
        case '/api/dmsHub/stalls/getStatuses':
          data = await utils.client.dmsHub.stalls.getStatuses.query(parsedBody);
          break;
          
        // OPERATORI
        case '/api/dmsHub/vendors/list':
          data = await utils.client.dmsHub.vendors.list.query();
          break;
        case '/api/dmsHub/vendors/create':
          data = await utils.client.dmsHub.vendors.create.mutate(parsedBody);
          break;
        case '/api/dmsHub/vendors/update':
          data = await utils.client.dmsHub.vendors.update.mutate(parsedBody);
          break;
        case '/api/dmsHub/vendors/getFullDetails':
          data = await utils.client.dmsHub.vendors.getFullDetails.query(parsedBody);
          break;
          
        // PRENOTAZIONI
        case '/api/dmsHub/bookings/create':
          data = await utils.client.dmsHub.bookings.create.mutate(parsedBody);
          break;
        case '/api/dmsHub/bookings/listActive':
          data = await utils.client.dmsHub.bookings.listActive.query(parsedBody);
          break;
        case '/api/dmsHub/bookings/confirmCheckin':
          data = await utils.client.dmsHub.bookings.confirmCheckin.mutate(parsedBody);
          break;
        case '/api/dmsHub/bookings/cancel':
          data = await utils.client.dmsHub.bookings.cancel.mutate(parsedBody);
          break;
          
        // PRESENZE
        case '/api/dmsHub/presences/checkout':
          data = await utils.client.dmsHub.presences.checkout.mutate(parsedBody);
          break;
        case '/api/dmsHub/presences/getTodayByMarket':
          data = await utils.client.dmsHub.presences.getTodayByMarket.query(parsedBody);
          break;
          
        // CONTROLLI
        case '/api/dmsHub/inspections/create':
          data = await utils.client.dmsHub.inspections.create.mutate(parsedBody);
          break;
        case '/api/dmsHub/inspections/list':
          data = await utils.client.dmsHub.inspections.list.query();
          break;
          
        // VERBALI
        case '/api/dmsHub/violations/create':
          data = await utils.client.dmsHub.violations.create.mutate(parsedBody);
          break;
        case '/api/dmsHub/violations/list':
          data = await utils.client.dmsHub.violations.list.query();
          break;
          
        // MIO AGENT - chiamate REST dirette
        case '/api/logs/initSchema':
          const initResponse = await fetch('/api/logs/initSchema', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          data = await initResponse.json();
          break;
        case '/api/logs/createLog':
          const createResponse = await fetch('/api/logs/createLog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedBody),
          });
          data = await createResponse.json();
          break;
        case '/api/logs/getLogs':
          const getResponse = await fetch('/api/logs/getLogs', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          data = await getResponse.json();
          break;
          
        default:
          throw new Error(`Endpoint non implementato: ${endpoint}`);
      }
      
      const endTime = Date.now();
      const time = `${endTime - startTime}ms`;
      
      setTestResult({
        status: 200,
        time,
        data
      });
      toast.success('✅ Test API completato con successo!');
    } catch (error: any) {
      const endTime = Date.now();
      const time = `${endTime - startTime}ms`;
      
      setTestResult({
        status: 500,
        time,
        data: { success: false, error: error.message || 'Errore sconosciuto' }
      });
      toast.error('❌ Test API fallito: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadExampleJSON = () => {
    const exampleJSON = {
      "stalls_geojson": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "id": "stall_1",
              "type": "stall",
              "dimensions": "4m × 8m",
              "rotation": 0,
              "scale": 1,
              "color": "#14b8a6",
              "label": "Posteggio 1"
            },
            "geometry": {
              "type": "Point",
              "coordinates": [11.1093, 42.7635]
            }
          }
        ]
      },
      "markers_geojson": { "type": "FeatureCollection", "features": [] },
      "areas_geojson": { "type": "FeatureCollection", "features": [] },
      "marketName": "Mercato Test API",
      "city": "Grosseto",
      "address": "Via Test 123"
    };
    
    setRequestBody(JSON.stringify(exampleJSON, null, 2));
    toast.success('JSON esempio caricato!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lista Endpoint */}
      <div className="space-y-4">
        <Card className="bg-[#1a2332] border-[#14b8a6]/30">
          <CardHeader>
            <CardTitle className="text-[#e8fbff] flex items-center gap-2">
              <Code className="h-5 w-5 text-[#14b8a6]" />
              Endpoint Disponibili (28+)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiEndpoints.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-sm font-semibold text-[#14b8a6]">{category.category}</h3>
                {category.endpoints.map((endpoint, eidx) => (
                  <div
                    key={eidx}
                    className="flex items-center gap-2 p-3 bg-[#0a1628] rounded-lg border border-[#14b8a6]/20 hover:border-[#14b8a6]/40 transition-colors cursor-pointer"
                    onClick={() => handleTestEndpoint(endpoint.path)}
                  >
                    <Badge className={`${getMethodColor(endpoint.method)} border`}>
                      {endpoint.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-[#e8fbff]/80 truncate">{endpoint.path}</p>
                      <p className="text-xs text-[#e8fbff]/50">{endpoint.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#14b8a6] hover:bg-[#14b8a6]/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestEndpoint(endpoint.path);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* API Playground */}
      <div className="space-y-4">
        <Card className="bg-[#1a2332] border-[#14b8a6]/30">
          <CardHeader>
            <CardTitle className="text-[#e8fbff] flex items-center gap-2">
              <Play className="h-5 w-5 text-[#14b8a6]" />
              API Playground
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEndpoint ? (
              <>
                <div>
                  <Label className="text-[#e8fbff]/70">Endpoint</Label>
                  <Input
                    value={selectedEndpoint}
                    readOnly
                    className="bg-[#0a1628] border-[#14b8a6]/30 text-[#e8fbff] font-mono text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[#e8fbff]/70">Request Body (JSON)</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={loadExampleJSON}
                      className="text-xs text-[#14b8a6] border-[#14b8a6]/30 hover:bg-[#14b8a6]/10"
                    >
                      <FileJson className="h-3 w-3 mr-1" />
                      Carica Esempio
                    </Button>
                  </div>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full h-40 bg-[#0a1628] border border-[#14b8a6]/30 rounded-md p-3 text-[#e8fbff] font-mono text-xs overflow-auto"
                    placeholder='{\n  "marketId": 1,\n  "param2": "value2"\n}'
                  />
                </div>

                <Button 
                  onClick={() => handleTestEndpoint(selectedEndpoint)}
                  disabled={isLoading}
                  className="w-full bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Esecuzione...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Esegui Test
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Status: {testResult.status}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Time: {testResult.time}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-[#e8fbff]/70">Response</Label>
                      <pre className="bg-[#0a1628] border border-[#14b8a6]/30 rounded-md p-3 text-[#e8fbff] font-mono text-xs overflow-auto">
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Code className="h-16 w-16 text-[#14b8a6]/50 mx-auto mb-4" />
                <p className="text-[#e8fbff]/70">Seleziona un endpoint per testarlo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiche API */}
        <Card className="bg-[#1a2332] border-[#14b8a6]/30">
          <CardHeader>
            <CardTitle className="text-[#e8fbff] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#14b8a6]" />
              Statistiche Utilizzo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a1628] p-4 rounded-lg border border-[#14b8a6]/20">
                <p className="text-[#e8fbff]/60 text-sm">Richieste Oggi</p>
                <p className="text-2xl font-bold text-[#14b8a6]">{apiStats?.requestsToday?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-[#0a1628] p-4 rounded-lg border border-[#14b8a6]/20">
                <p className="text-[#e8fbff]/60 text-sm">Tempo Medio</p>
                <p className="text-2xl font-bold text-[#14b8a6]">{apiStats?.avgResponseTime || 0}ms</p>
              </div>
              <div className="bg-[#0a1628] p-4 rounded-lg border border-green-500/20">
                <p className="text-[#e8fbff]/60 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">{apiStats?.successRate || 0}%</p>
              </div>
              <div className="bg-[#0a1628] p-4 rounded-lg border border-red-500/20">
                <p className="text-[#e8fbff]/60 text-sm">Errori</p>
                <p className="text-2xl font-bold text-red-400">{apiStats?.errors || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: CONNESSIONI ESTERNE
// ============================================================================
function ConnessioniEsterne() {
  const { data: connections = [], refetch } = trpc.integrations.connections.list.useQuery();
  const healthCheckMutation = trpc.integrations.connections.healthCheck.useMutation();
  const healthCheckAllMutation = trpc.integrations.connections.healthCheckAll.useMutation();
  
  const handleHealthCheck = async (id: number) => {
    try {
      const result = await healthCheckMutation.mutateAsync({ id });
      await refetch();
      toast.success(`Health check completato: ${result.status}`);
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };
  
  const handleHealthCheckAll = async () => {
    try {
      await healthCheckAllMutation.mutateAsync();
      await refetch();
      toast.success('Health check completato per tutte le connessioni');
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };
  


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Connesso</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Disconnesso</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><AlertCircle className="h-3 w-3 mr-1" />In Configurazione</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {connections.map((conn, idx) => (
        <Card key={idx} className="bg-[#1a2332] border-[#14b8a6]/30">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-[#e8fbff]">{conn.name}</CardTitle>
                  <p className="text-sm text-[#e8fbff]/60 mt-1">{conn.type}</p>
                </div>
              </div>
              {getStatusBadge(conn.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[#14b8a6]" />
                <span className="text-[#e8fbff]/70">Ultimo sync:</span>
                <span className="text-[#e8fbff]">{conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString('it-IT') : 'Mai'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-[#14b8a6]" />
                <span className="text-[#e8fbff]/70 font-mono text-xs truncate">{conn.endpoint}</span>
              </div>
            </div>

            {conn.features && (
              <div>
                <p className="text-sm text-[#e8fbff]/70 mb-2">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(conn.features).map((feature: string, fidx: number) => (
                    <Badge key={fidx} variant="outline" className="bg-[#0a1628] border-[#14b8a6]/30 text-[#14b8a6]">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {conn.status === 'connected' ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-[#14b8a6]/30 text-[#14b8a6] hover:bg-[#14b8a6]/10"
                    onClick={() => handleHealthCheck(conn.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Health Check
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <XCircle className="h-4 w-4 mr-2" />
                    Disconnetti
                  </Button>
                </>
              ) : (
                <Button className="w-full bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white">
                  <Plug className="h-4 w-4 mr-2" />
                  Connetti
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// TAB 3: API KEYS MANAGER
// ============================================================================
function APIKeysManager() {
  const { data: apiKeys = [], refetch } = trpc.integrations.apiKeys.list.useQuery();
  const createMutation = trpc.integrations.apiKeys.create.useMutation();
  const deleteMutation = trpc.integrations.apiKeys.delete.useMutation();
  const regenerateMutation = trpc.integrations.apiKeys.regenerate.useMutation();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API Key copiata negli appunti');
  };

  const handleDeleteKey = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await refetch();
      toast.success('API Key eliminata');
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };
  
  const handleRegenerateKey = async (id: number) => {
    try {
      const result = await regenerateMutation.mutateAsync({ id });
      await refetch();
      toast.success('API Key rigenerata: ' + result.key);
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };
  
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Inserisci un nome per la API Key');
      return;
    }
    
    try {
      const result = await createMutation.mutateAsync({
        name: newKeyName,
        environment: 'production',
      });
      await refetch();
      setShowCreateDialog(false);
      setNewKeyName('');
      toast.success('API Key creata: ' + result.key);
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con pulsante nuovo */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#e8fbff]">API Keys Attive</h3>
          <p className="text-sm text-[#e8fbff]/60">Gestisci le chiavi API per autenticare le applicazioni</p>
        </div>
        <Button 
          className="bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova API Key
        </Button>
      </div>

      {/* Lista API Keys */}
      <div className="grid grid-cols-1 gap-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className="bg-[#1a2332] border-[#14b8a6]/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-[#e8fbff] font-semibold">{apiKey.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="bg-[#0a1628] px-3 py-1 rounded text-sm text-[#14b8a6] font-mono">
                      {apiKey.key}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[#14b8a6] hover:bg-[#14b8a6]/10"
                      onClick={() => handleCopyKey(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge className={apiKey.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                  {apiKey.status === 'active' ? 'Attiva' : 'Inattiva'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-[#e8fbff]/60">Creata</p>
                  <p className="text-sm text-[#e8fbff]">{new Date(apiKey.createdAt).toLocaleDateString('it-IT')}</p>
                </div>
                <div>
                  <p className="text-xs text-[#e8fbff]/60">Ultimo Utilizzo</p>
                  <p className="text-sm text-[#e8fbff]">{apiKey.lastUsedAt ? new Date(apiKey.lastUsedAt).toLocaleDateString('it-IT') : 'Mai'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#e8fbff]/60">Rate Limit</p>
                  <p className="text-sm text-[#e8fbff]">{apiKey.rateLimit} req/min</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#14b8a6]/30 text-[#14b8a6] hover:bg-[#14b8a6]/10"
                  onClick={() => handleRegenerateKey(apiKey.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rigenera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDeleteKey(apiKey.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Dialog Nuova API Key */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-[#1a2332] border-[#14b8a6]/30 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-[#e8fbff]">Nuova API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#e8fbff]/70">Nome</Label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Es: App Cittadini - Production"
                  className="bg-[#0a1628] border-[#14b8a6]/30 text-[#e8fbff]"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="border-[#14b8a6]/30 text-[#e8fbff]"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleCreateKey}
                  className="bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white"
                >
                  Crea
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAB 4: WEBHOOK MANAGER
// ============================================================================
function WebhookManager() {
  const { data: webhooks = [], refetch } = trpc.integrations.webhooks.list.useQuery();
  const testMutation = trpc.integrations.webhooks.test.useMutation();
  const deleteMutation = trpc.integrations.webhooks.delete.useMutation();
  
  const handleTestWebhook = async (id: number) => {
    try {
      const result = await testMutation.mutateAsync({ id });
      toast.success(`Test completato: ${result.statusCode} (${result.responseTime}ms)`);
    } catch (error: any) {
      toast.error('Test fallito: ' + error.message);
    }
  };
  
  const handleDeleteWebhook = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      await refetch();
      toast.success('Webhook eliminato');
    } catch (error: any) {
      toast.error('Errore: ' + error.message);
    }
  };
  


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#e8fbff]">Webhook Configurati</h3>
          <p className="text-sm text-[#e8fbff]/60">Ricevi notifiche real-time su eventi del sistema</p>
        </div>
        <Button className="bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Webhook
        </Button>
      </div>

      {/* Lista Webhook */}
      <div className="grid grid-cols-1 gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="bg-[#1a2332] border-[#14b8a6]/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-[#e8fbff] font-semibold">{webhook.name}</h4>
                    <Badge className={webhook.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}>
                      {webhook.status === 'active' ? 'Attivo' : 'In Configurazione'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#e8fbff]/70">
                    <ExternalLink className="h-4 w-4 text-[#14b8a6]" />
                    <code className="font-mono text-xs">{webhook.url}</code>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-[#e8fbff]/60 mb-2">Eventi:</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(webhook.events).map((event: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-[#0a1628] border-[#14b8a6]/30 text-[#14b8a6] font-mono text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#e8fbff]/60">Ultimo Trigger</p>
                    <p className="text-sm text-[#e8fbff]">{webhook.lastTriggeredAt ? new Date(webhook.lastTriggeredAt).toLocaleString('it-IT') : 'Mai'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#e8fbff]/60">Success Rate</p>
                    <p className="text-sm text-[#e8fbff]">{webhook.successCount + webhook.failureCount > 0 ? ((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#14b8a6]/30 text-[#14b8a6] hover:bg-[#14b8a6]/10"
                  onClick={() => handleTestWebhook(webhook.id)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#14b8a6]/30 text-[#14b8a6] hover:bg-[#14b8a6]/10"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Log
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TAB 5: SYNC STATUS (Gestionale Heroku)
// ============================================================================
function SyncStatus() {
  const syncStats = {
    lastSync: '5 minuti fa',
    nextSync: 'Tra 10 minuti',
    status: 'active',
    totalSynced: 1247,
    errors: 3,
    pending: 12
  };

  const syncLog = [
    { time: '14:25', entity: 'Operatori', action: 'Sync anagrafica', status: 'success', records: 45 },
    { time: '14:20', entity: 'Presenze', action: 'Check-in real-time', status: 'success', records: 8 },
    { time: '14:15', entity: 'Concessioni', action: 'Aggiornamento scadenze', status: 'success', records: 23 },
    { time: '14:10', entity: 'Pagamenti', action: 'Sync pagamenti', status: 'error', records: 0 },
    { time: '14:05', entity: 'Documenti', action: 'Verifica scadenze', status: 'success', records: 156 },
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="bg-[#1a2332] border-[#14b8a6]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#e8fbff] flex items-center gap-2">
              <Database className="h-5 w-5 text-[#14b8a6]" />
              Sincronizzazione Gestionale Heroku
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Attiva
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistiche */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0a1628] p-4 rounded-lg border border-[#14b8a6]/20">
              <p className="text-[#e8fbff]/60 text-sm">Ultimo Sync</p>
              <p className="text-lg font-bold text-[#14b8a6]">{syncStats.lastSync}</p>
            </div>
            <div className="bg-[#0a1628] p-4 rounded-lg border border-[#14b8a6]/20">
              <p className="text-[#e8fbff]/60 text-sm">Prossimo Sync</p>
              <p className="text-lg font-bold text-[#14b8a6]">{syncStats.nextSync}</p>
            </div>
            <div className="bg-[#0a1628] p-4 rounded-lg border border-green-500/20">
              <p className="text-[#e8fbff]/60 text-sm">Totale Sincronizzati</p>
              <p className="text-lg font-bold text-green-400">{syncStats.totalSynced}</p>
            </div>
            <div className="bg-[#0a1628] p-4 rounded-lg border border-red-500/20">
              <p className="text-[#e8fbff]/60 text-sm">Errori</p>
              <p className="text-lg font-bold text-red-400">{syncStats.errors}</p>
            </div>
          </div>

          {/* Azioni */}
          <div className="flex gap-2">
            <Button className="bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizza Ora
            </Button>
            <Button variant="outline" className="border-[#14b8a6]/30 text-[#14b8a6] hover:bg-[#14b8a6]/10">
              <ExternalLink className="h-4 w-4 mr-2" />
              Apri Gestionale
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Sincronizzazione */}
      <Card className="bg-[#1a2332] border-[#14b8a6]/30">
        <CardHeader>
          <CardTitle className="text-[#e8fbff] flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#14b8a6]" />
            Log Sincronizzazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {syncLog.map((log, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 bg-[#0a1628] rounded-lg border border-[#14b8a6]/20"
              >
                <span className="text-sm text-[#e8fbff]/60 font-mono">{log.time}</span>
                <Badge variant="outline" className="bg-[#0a1628] border-[#14b8a6]/30 text-[#14b8a6]">
                  {log.entity}
                </Badge>
                <span className="text-sm text-[#e8fbff]/80 flex-1">{log.action}</span>
                {log.status === 'success' ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <XCircle className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}
                <span className="text-sm text-[#e8fbff]/60">{log.records} record</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurazione Sync */}
      <Card className="bg-[#1a2332] border-[#14b8a6]/30">
        <CardHeader>
          <CardTitle className="text-[#e8fbff] flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-[#14b8a6]" />
            Configurazione Sincronizzazione
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#e8fbff]/70">Frequenza Sync</Label>
              <select className="w-full mt-2 bg-[#0a1628] border border-[#14b8a6]/30 rounded-md p-2 text-[#e8fbff]">
                <option>Ogni 5 minuti</option>
                <option>Ogni 15 minuti</option>
                <option>Ogni 30 minuti</option>
                <option>Ogni ora</option>
              </select>
            </div>
            <div>
              <Label className="text-[#e8fbff]/70">Modalità</Label>
              <select className="w-full mt-2 bg-[#0a1628] border border-[#14b8a6]/30 rounded-md p-2 text-[#e8fbff]">
                <option>Bidirezionale</option>
                <option>Solo Ricezione</option>
                <option>Solo Invio</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-[#e8fbff]/70">Entità da Sincronizzare</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {['Operatori', 'Concessioni', 'Presenze', 'Pagamenti', 'Documenti', 'Verbali'].map((entity) => (
                <label key={entity} className="flex items-center gap-2 p-2 bg-[#0a1628] rounded border border-[#14b8a6]/20 cursor-pointer hover:border-[#14b8a6]/40">
                  <input type="checkbox" defaultChecked className="text-[#14b8a6]" />
                  <span className="text-sm text-[#e8fbff]">{entity}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full bg-[#14b8a6] hover:bg-[#14b8a6]/80 text-white">
            Salva Configurazione
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
