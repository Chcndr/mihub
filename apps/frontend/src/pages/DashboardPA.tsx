import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Users, TrendingUp, Store, ShoppingCart, Leaf, MapPin, 
  Activity, BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
  Bike, Car, Bus, Footprints, Zap, Package, Globe, Award,
  Calendar, Clock, AlertCircle, CheckCircle, Download, FileText, Bot, Send,
  Shield, Lock, UserCheck, Terminal, Bug, Code, Wrench, RefreshCw,
  Coins, DollarSign, Wallet, Settings, Sliders, TrendingDown,
  Building2, GraduationCap, Target, TrendingUpDown, Briefcase,
  Radio, CloudRain, Wind, UserCog, ClipboardCheck, Scale, Bell, BellRing,
  Navigation, Train, ParkingCircle, TrafficCone, FileBarChart, Plug, SettingsIcon, Euro, Newspaper, Rocket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import MobilityMap from '@/components/MobilityMap';
import GestioneMercati from '@/components/GestioneMercati';
import Integrazioni from '@/components/Integrazioni';
import { GISMap } from '@/components/GISMap';
import MIOAgent from '@/components/MIOAgent';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Hook per dati reali da backend
function useDashboardData() {
  const overviewQuery = trpc.analytics.overview.useQuery();
  const marketsQuery = trpc.analytics.markets.useQuery();
  const shopsQuery = trpc.analytics.shops.useQuery();
  const transactionsQuery = trpc.analytics.transactions.useQuery();
  const systemLogsQuery = trpc.logs.system.useQuery();
  const userAnalyticsQuery = trpc.users.analytics.useQuery();
  const sustainabilityQuery = trpc.sustainability.metrics.useQuery();
  const businessesQuery = trpc.businesses.list.useQuery();
  const inspectionsQuery = trpc.inspections.list.useQuery();
  const notificationsQuery = trpc.notifications.list.useQuery();
  const civicReportsQuery = trpc.civicReports.list.useQuery();
  const mobilityQuery = trpc.mobility.list.useQuery();

  return {
    overview: overviewQuery.data,
    markets: marketsQuery.data || [],
    shops: shopsQuery.data || [],
    transactions: transactionsQuery.data || [],
    systemLogs: systemLogsQuery.data || [],
    userAnalytics: userAnalyticsQuery.data || [],
    sustainabilityMetrics: sustainabilityQuery.data || [],
    businesses: businessesQuery.data || [],
    inspections: inspectionsQuery.data || [],
    notifications: notificationsQuery.data || [],
    civicReports: civicReportsQuery.data || [],
    mobilityData: mobilityQuery.data || [],
    isLoading: overviewQuery.isLoading,
  };
}

// Mock data fallback per UI development
const mockData = {
  overview: {
    totalUsers: 15847,
    userGrowth: 8.5,
    activeMarkets: 12,
    totalShops: 156,
    totalTransactions: 24150,
    transactionGrowth: 12.3,
    sustainabilityRating: 7.8,
    co2Saved: 4654
  },
  usersGrowth: [
    { date: '01 Gen', users: 14500, new: 120 },
    { date: '08 Gen', users: 14850, new: 135 },
    { date: '15 Gen', users: 15200, new: 148 },
    { date: '22 Gen', users: 15550, new: 152 },
    { date: '29 Gen', users: 15847, new: 165 }
  ],
  transport: [
    { mode: 'A piedi', count: 6500, percentage: 41.0, co2: 0, color: '#10b981' },
    { mode: 'Bicicletta', count: 3200, percentage: 20.2, co2: 1280, color: '#14b8a6' },
    { mode: 'Bus', count: 2800, percentage: 17.7, co2: 1680, color: '#06b6d4' },
    { mode: 'Auto', count: 2500, percentage: 15.8, co2: 0, color: '#ef4444' },
    { mode: 'Elettrico', count: 847, percentage: 5.3, co2: 1694, color: '#8b5cf6' }
  ],
  topMarkets: [
    { name: 'Mercato Centrale Grosseto', visits: 12500, users: 4200, duration: 35, rank: 1 },
    { name: 'Mercato Follonica Mare', visits: 8900, users: 3100, duration: 28, rank: 2 },
    { name: 'Mercato Orbetello Centro', visits: 5200, users: 2100, duration: 32, rank: 3 },
    { name: 'Mercato Castiglione', visits: 3800, users: 1500, duration: 25, rank: 4 },
    { name: 'Mercato Marina di Grosseto', visits: 2900, users: 1200, duration: 22, rank: 5 }
  ],
  categories: [
    { name: 'Frutta e Verdura', purchases: 8500, percentage: 35.2, bio: 68.5, color: '#10b981' },
    { name: 'Formaggi e Latticini', purchases: 4200, percentage: 17.4, bio: 52.1, color: '#f59e0b' },
    { name: 'Pane e Dolci', purchases: 3800, percentage: 15.7, bio: 41.2, color: '#ef4444' },
    { name: 'Carne e Pesce', purchases: 2980, percentage: 12.3, bio: 38.5, color: '#ec4899' },
    { name: 'Altro', purchases: 4670, percentage: 19.4, bio: 25.8, color: '#8b5cf6' }
  ],
  certifications: [
    { type: 'BIO', count: 12500, percentage: 51.8, color: '#10b981' },
    { type: 'KM0', count: 9800, percentage: 40.6, color: '#14b8a6' },
    { type: 'DOP/IGP', count: 4500, percentage: 18.6, color: '#f59e0b' },
    { type: 'Fair Trade', count: 2100, percentage: 8.7, color: '#8b5cf6' }
  ],
  ecommerceVsPhysical: {
    ecommerce: { purchases: 18000, percentage: 40.0, co2: 54000, avgCo2: 3.0 },
    physical: { purchases: 27000, percentage: 60.0, co2: 8100, avgCo2: 0.3 },
    co2Savings: 45900
  },
  productOrigin: {
    local: { count: 75000, percentage: 60.0, avgDistance: 15, avgCo2: 0.2 },
    national: { count: 35000, percentage: 28.0, avgDistance: 450, avgCo2: 1.5 },
    eu: { count: 10000, percentage: 8.0, avgDistance: 1200, avgCo2: 3.5 },
    extraEu: { count: 5000, percentage: 4.0, avgDistance: 8500, avgCo2: 12.0 }
  },
  realtime: {
    activeUsers: 342,
    activeVendors: 87,
    todayCheckins: 124,
    todayTransactions: 456,
    systemStatus: {
      api: 'operational',
      database: 'operational',
      redis: 'operational',
      tpas: 'standby'
    }
  },
  logs: [
    { id: 1, timestamp: '2025-11-07 11:25:43', app: 'APP Clienti', type: 'check-in', level: 'info', user: 'mario.rossi@email.com', message: 'Check-in Mercato Centrale Grosseto', ip: '192.168.1.45' },
    { id: 2, timestamp: '2025-11-07 11:24:12', app: 'APP Operatori', type: 'vendita', level: 'info', user: 'operatore.bio@dms.it', message: 'Vendita prodotto BIO - 50 carbon credits assegnati', ip: '192.168.1.102' },
    { id: 3, timestamp: '2025-11-07 11:23:05', app: 'DMS Backend', type: 'error', level: 'error', user: 'system', message: 'Database connection timeout - retry 3/3', ip: '10.0.0.5' },
    { id: 4, timestamp: '2025-11-07 11:22:18', app: 'WebApp PM', type: 'route', level: 'info', user: 'giulia.bianchi@email.com', message: 'Percorso ottimizzato calcolato: 3 stop, 2.5km', ip: '192.168.1.78' },
    { id: 5, timestamp: '2025-11-07 11:21:30', app: 'APP Clienti', type: 'segnalazione', level: 'warning', user: 'luca.verdi@email.com', message: 'Segnalazione civica: Rifiuti non raccolti', ip: '192.168.1.92' }
  ],
  security: {
    totalAccesses: 15847,
    failedLogins: 23,
    activeUsers: 342,
    suspiciousActivity: 2,
    lastAudit: '2025-11-06 23:00:00',
    vulnerabilities: { critical: 0, high: 1, medium: 3, low: 5 }
  },
  debug: {
    errors: { total: 12, resolved: 8, pending: 4 },
    performance: { avgResponseTime: 145, p95: 320, p99: 580 },
    healthChecks: { api: 'healthy', database: 'healthy', redis: 'healthy', storage: 'healthy' },
    deployments: { lastDeploy: '2025-11-06 18:30:00', version: 'v2.1.3', status: 'stable' }
  },
  carbonCredits: {
    fund: {
      balance: 125000,
      currency: 'EUR',
      sources: [
        { name: 'Regione Toscana', amount: 80000, date: '2025-10-01' },
        { name: 'Comune Grosseto', amount: 30000, date: '2025-10-15' },
        { name: 'Sponsor Privati', amount: 15000, date: '2025-11-01' }
      ],
      expenses: { reimbursements: 45000, incentives: 12000, operations: 3000 },
      burnRate: 8500,
      monthsRemaining: 7.8
    },
    value: {
      current: 1.50,
      history: [
        { date: '2025-09-01', value: 1.20 },
        { date: '2025-10-01', value: 1.35 },
        { date: '2025-11-01', value: 1.50 }
      ],
      byArea: [
        { area: 'Grosseto', value: 1.50, boost: 0 },
        { area: 'Follonica', value: 1.35, boost: -10 },
        { area: 'Orbetello', value: 1.65, boost: +10 }
      ],
      byCategory: [
        { category: 'BIO', boost: 20, finalValue: 1.80 },
        { category: 'KM0', boost: 15, finalValue: 1.73 },
        { category: 'DOP/IGP', boost: 10, finalValue: 1.65 },
        { category: 'Standard', boost: 0, finalValue: 1.50 }
      ]
    },
    reimbursements: {
      pending: { count: 23, amount: 8450 },
      processed: { count: 156, amount: 45000 },
      topShops: [
        { name: 'Bio Market Centrale', credits: 12500, euros: 18750 },
        { name: 'Ortofrutta KM0', credits: 8900, euros: 13350 },
        { name: 'Formaggi Toscani', credits: 6200, euros: 9300 }
      ]
    },
    analytics: {
      issued: 125000,
      spent: 78000,
      velocity: 62.4,
      roi: { invested: 125000, co2Saved: 4654, costPerKg: 26.85 }
    }
  },
  businesses: {
    total: 450,
    fullyCompliant: 320,
    partiallyCompliant: 95,
    nonCompliant: 35,
    avgScore: 78.5,
    atRiskSuspension: 12,
    demographics: {
      openings: 45,
      closures: 12,
      netGrowth: 33,
      growthRate: 7.9,
      byGender: { male: 280, female: 150, company: 20 },
      byAge: { '18-30': 45, '31-45': 180, '46-60': 180, '60+': 45 },
      byOrigin: { native: 380, italian: 50, foreign: 20 }
    },
    indices: {
      requalification: 72.5,
      digitalization: 68.3,
      sustainability: 75.8
    },
    expiringDocs: [
      { business: 'Bio Market Centrale', doc: 'DURC', days: 5, critical: true },
      { business: 'Ortofrutta KM0', doc: 'HACCP', days: 12, critical: false },
      { business: 'Formaggi Toscani', doc: 'Antincendio', days: 18, critical: false },
      { business: 'Macelleria Grosseto', doc: 'Primo Soccorso', days: 25, critical: false }
    ],
    training: {
      completed: 285,
      scheduled: 45,
      avgCost: 350,
      topTrainers: [
        { name: 'Safety Training Toscana', courses: 85, rating: 4.8 },
        { name: 'Formazione Sicurezza SRL', courses: 62, rating: 4.6 },
        { name: 'Academy HACCP', courses: 48, rating: 4.7 }
      ]
    },
    grants: {
      active: 8,
      applications: 45,
      approved: 28,
      successRate: 62.2,
      avgAmount: 12500,
      topGrants: [
        { title: 'Digitalizzazione PMI 2025', applicants: 15, approved: 10, amount: 150000 },
        { title: 'Formazione Sicurezza', applicants: 12, approved: 9, amount: 45000 },
        { title: 'Sostenibilità Imprese', applicants: 10, approved: 6, amount: 85000 }
      ]
    },
    topScoring: [
      { name: 'Bio Market Centrale', score: 98, sector: 'Alimentare', digitalization: 95 },
      { name: 'Ortofrutta KM0', score: 96, sector: 'Alimentare', digitalization: 92 },
      { name: 'Formaggi Toscani', score: 94, sector: 'Alimentare', digitalization: 88 },
      { name: 'Artigianato Locale', score: 91, sector: 'Artigianato', digitalization: 85 },
      { name: 'Macelleria Grosseto', score: 89, sector: 'Alimentare', digitalization: 82 }
    ]
  },
  // Nuove sezioni
  civicReports: {
    total: 127,
    pending: 45,
    inProgress: 38,
    resolved: 44,
    byType: [
      { type: 'Rifiuti', count: 35, percentage: 27.6 },
      { type: 'Illuminazione', count: 28, percentage: 22.0 },
      { type: 'Strade', count: 24, percentage: 18.9 },
      { type: 'Verde pubblico', count: 22, percentage: 17.3 },
      { type: 'Altro', count: 18, percentage: 14.2 }
    ],
    recent: [
      { id: 1, type: 'Rifiuti', description: 'Cassonetti pieni', status: 'pending', date: '2025-11-07', user: 'Cliente', location: 'Via Roma' },
      { id: 2, type: 'Illuminazione', description: 'Lampione rotto', status: 'in_progress', date: '2025-11-06', user: 'Commerciante', location: 'Piazza Dante' },
      { id: 3, type: 'Strade', description: 'Buca pericolosa', status: 'pending', date: '2025-11-06', user: 'Cliente', location: 'Corso Italia' }
    ]
  },
  iotSensors: {
    airQuality: {
      pm10: 28.5,
      pm25: 15.2,
      no2: 35.8,
      status: 'good',
      lastUpdate: '2025-11-07 13:00'
    },
    weather: {
      temp: 18.5,
      humidity: 65,
      pressure: 1015,
      wind: 12.5
    },
    sensors: [
      { id: 1, name: 'Centro Storico', type: 'Aria', status: 'online', pm10: 28.5 },
      { id: 2, name: 'Mercato Centrale', type: 'Aria', status: 'online', pm10: 32.1 },
      { id: 3, name: 'Marina', type: 'Aria', status: 'offline', pm10: null }
    ]
  },
  businessUsers: {
    total: 156,
    active: 142,
    inactive: 14,
    byCategory: [
      { category: 'Alimentari', count: 65, revenue: 125000 },
      { category: 'Artigianato', count: 38, revenue: 85000 },
      { category: 'Servizi', count: 28, revenue: 62000 },
      { category: 'Altro', count: 25, revenue: 45000 }
    ],
    topUsers: [
      { name: 'Bio Market Centrale', sales: 2850, credits: 1250, rating: 4.9 },
      { name: 'Ortofrutta KM0', sales: 2340, credits: 980, rating: 4.8 },
      { name: 'Formaggi Toscani', sales: 1920, credits: 850, rating: 4.7 }
    ]
  },
  inspections: {
    scheduled: 28,
    completed: 156,
    violations: 12,
    fines: 8,
    totalFines: 15000,
    upcoming: [
      { id: 1, business: 'Macelleria Rossi', type: 'HACCP', date: '2025-11-10', inspector: 'M. Bianchi' },
      { id: 2, business: 'Panificio Centro', type: 'Sicurezza', date: '2025-11-12', inspector: 'L. Verdi' },
      { id: 3, business: 'Bar Piazza', type: 'DURC', date: '2025-11-15', inspector: 'A. Rossi' }
    ],
    violationsList: [
      { id: 1, business: 'Ristorante Mare', type: 'HACCP', fine: 2000, status: 'paid', date: '2025-10-28' },
      { id: 2, business: 'Negozio Abbigliamento', type: 'Sicurezza', fine: 1500, status: 'pending', date: '2025-11-02' }
    ]
  },
  notifications: {
    sent: 2450,
    delivered: 2380,
    opened: 1850,
    clicked: 920,
    openRate: 77.7,
    clickRate: 38.7,
    recent: [
      { id: 1, title: 'Nuovo mercato aperto', type: 'push', sent: 1250, opened: 980, date: '2025-11-06' },
      { id: 2, title: 'Scadenza DURC', type: 'email', sent: 45, opened: 38, date: '2025-11-05' },
      { id: 3, title: 'Promozione carbon credits', type: 'sms', sent: 850, opened: 720, date: '2025-11-04' }
    ]
  },
  mobility: {
    busLines: 12,
    totalBusStops: 85,
    activeBuses: 28,
    passengers: 3450,
    parkingSpots: 1200,
    parkingOccupied: 850,
    parkingAvailable: 350,
    stops: [
      { id: 1, name: 'Stazione FS', line: '1, 3, 5', nextBus: '3 min', passengers: 15 },
      { id: 2, name: 'Piazza Dante', line: '2, 4', nextBus: '8 min', passengers: 8 },
      { id: 3, name: 'Mercato Centrale', line: '1, 2, 6', nextBus: '12 min', passengers: 22 }
    ],
    traffic: [
      { road: 'Via Aurelia', status: 'heavy', incidents: 1 },
      { road: 'Corso Carducci', status: 'moderate', incidents: 0 },
      { road: 'Via Senese', status: 'light', incidents: 0 }
    ]
  }
};

export default function DashboardPA() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [realtimeData, setRealtimeData] = useState(mockData.realtime);
   const [activeTab, setActiveTab] = useState('overview');
  const [tccValue, setTccValue] = useState(0.20);
  
  // Carbon Credits - Simulatore completo
  const [editableParams, setEditableParams] = useState({
    fundBalance: 125000,
    burnRate: 8500,
    tccIssued: 125000,
    tccSpent: 78000,
    areaBoosts: [
      { area: 'Grosseto', boost: 0 },
      { area: 'Follonica', boost: -10 },
      { area: 'Orbetello', boost: +10 }
    ],
    categoryBoosts: [
      { category: 'BIO', boost: 20 },
      { category: 'KM0', boost: 15 },
      { category: 'DOP/IGP', boost: 10 },
      { category: 'Standard', boost: 0 }
    ]
  });

  // Calcola valori dinamici basati su slider e boost
  const calculateAreaValues = () => {
    return editableParams.areaBoosts.map(item => ({
      ...item,
      value: tccValue * (1 + item.boost / 100)
    }));
  };

  const calculateCategoryValues = () => {
    return editableParams.categoryBoosts.map(item => ({
      ...item,
      finalValue: tccValue * (1 + item.boost / 100)
    }));
  };

  const calculateMonthsRemaining = () => {
    if (editableParams.burnRate === 0) return 999;
    return (editableParams.fundBalance / editableParams.burnRate).toFixed(1);
  };

  const calculateVelocity = () => {
    if (editableParams.tccIssued === 0) return 0;
    return ((editableParams.tccSpent / editableParams.tccIssued) * 100).toFixed(1);
  };

  const calculateReimbursementNeeded = () => {
    return (editableParams.tccSpent * tccValue).toFixed(0);
  };

  // Fattore conversione: 1 TCC speso = 0.06 kg CO₂ risparmiati (media shopping locale vs e-commerce)
  const CO2_PER_TCC = 0.06;
  // 1 albero assorbe circa 22 kg CO₂ all'anno
  const CO2_PER_TREE = 22;

  const calculateCO2Saved = () => {
    return (editableParams.tccSpent * CO2_PER_TCC).toFixed(0);
  };

  const calculateTreesEquivalent = () => {
    const co2Saved = parseFloat(calculateCO2Saved());
    return Math.round(co2Saved / CO2_PER_TREE);
  };

  // Chat AI
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [appliedTccValue, setAppliedTccValue] = useState(1.50);
  
  // Fetch real data from backend
  const realData = useDashboardData();

  // Simula aggiornamento real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        todayTransactions: prev.todayTransactions + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const [, setLocation] = useLocation();

  const QuickAccessButton = ({ href, icon, label, color = 'teal' }: any) => (
    <button
      onClick={() => setLocation(href)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
        color === 'orange'
          ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b]'
          : 'bg-[#14b8a6]/10 border-[#14b8a6]/30 hover:bg-[#14b8a6]/20 text-[#14b8a6]'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const KPICard = ({ title, value, growth, icon: Icon, suffix = '' }: any) => (
    <Card className="bg-gradient-to-br from-[#1a2332] to-[#0b1220] border-[#14b8a6]/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#e8fbff]/70">{title}</CardTitle>
        <Icon className="h-5 w-5 text-[#14b8a6]" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-[#e8fbff]">
          {value.toLocaleString()}{suffix}
        </div>
        {growth !== undefined && (
          <div className="flex items-center mt-2 text-sm">
            {growth >= 0 ? (
              <>
                <ArrowUpRight className="h-4 w-4 text-[#10b981] mr-1" />
                <span className="text-[#10b981]">+{growth}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-[#ef4444] mr-1" />
                <span className="text-[#ef4444]">{growth}%</span>
              </>
            )}
            <span className="text-[#e8fbff]/50 ml-2">vs mese scorso</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white py-6 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Dashboard PA - DMS HUB</h1>
              <p className="text-sm opacity-90">Analytics e Monitoraggio Ecosistema</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="day">Oggi</option>
              <option value="week">Settimana</option>
              <option value="month">Mese</option>
              <option value="year">Anno</option>
            </select>
            <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              <Download className="h-4 w-4 mr-2" />
              Esporta Report
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Access Navigation */}
      <div className="bg-[#1a2332] border-b border-[#14b8a6]/30 py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-sm font-semibold text-[#e8fbff]/70 mb-3">Accesso Rapido Applicativi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3">
            <QuickAccessButton href="/" icon={<Store className="h-5 w-5" />} label="Home" />
            <QuickAccessButton href="/mappa" icon={<MapPin className="h-5 w-5" />} label="Mappa" />
            <QuickAccessButton href="/wallet" icon={<Leaf className="h-5 w-5" />} label="Wallet" />
            <QuickAccessButton href="/route" icon={<TrendingUp className="h-5 w-5" />} label="Route" />
            <QuickAccessButton href="/civic" icon={<AlertCircle className="h-5 w-5" />} label="Segnala" />
            <QuickAccessButton href="/vetrine" icon={<Store className="h-5 w-5" />} label="Vetrine" />
            <QuickAccessButton href="/hub-operatore" icon={<Activity className="h-5 w-5" />} label="Hub Operatore" color="orange" />
            <button
              onClick={() => window.open('https://chcndr.github.io/dms-gemello-core/tools/bus_hub.html', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-[#8b5cf6]/10 border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 text-[#8b5cf6]"
            >
              <Wrench className="h-5 w-5" />
              <span className="text-sm font-medium">BUS HUB</span>
            </button>
            <button
              onClick={() => window.open('https://chcndr.github.io/dms-gemello-core/index-grosseto.html', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b]"
            >
              <MapPin className="h-5 w-5" />
              <span className="text-sm font-medium">Core Map</span>
            </button>
            <button
              onClick={() => window.open('https://chcndr.github.io/dms-gemello-core/', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-[#10b981]/10 border-[#10b981]/30 hover:bg-[#10b981]/20 text-[#10b981]"
            >
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">Sito Pubblico</span>
            </button>
            <button
              onClick={() => window.open('https://chcndr.github.io/dms-gemello-news/landing/home.html', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-[#3b82f6]/10 border-[#3b82f6]/30 hover:bg-[#3b82f6]/20 text-[#3b82f6]"
            >
              <Newspaper className="h-5 w-5" />
              <span className="text-sm font-medium">DMS News</span>
            </button>
            <button
              onClick={() => window.open('https://lapsy-dms.herokuapp.com/index.html', '_blank')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all bg-[#ef4444]/10 border-[#ef4444]/30 hover:bg-[#ef4444]/20 text-[#ef4444]"
            >
              <Rocket className="h-5 w-5" />
              <span className="text-sm font-medium">Gestionale DMS</span>
            </button>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Utenti Totali"
            value={mockData.overview.totalUsers}
            growth={mockData.overview.userGrowth}
            icon={Users}
          />
          <KPICard
            title="Mercati Attivi"
            value={mockData.overview.activeMarkets}
            icon={Store}
          />
          <KPICard
            title="Transazioni"
            value={mockData.overview.totalTransactions}
            growth={mockData.overview.transactionGrowth}
            icon={ShoppingCart}
          />
          <KPICard
            title="Rating Sostenibilità"
            value={mockData.overview.sustainabilityRating}
            icon={Leaf}
            suffix="/10"
          />
        </div>

        {/* Tabs Navigation - Stile Card */}
        <div className="bg-[#1a2332] border border-[#14b8a6]/30 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-[#e8fbff]/70 mb-3">Sezioni Dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg'
                  : 'bg-[#14b8a6]/10 border-[#14b8a6]/30 hover:bg-[#14b8a6]/20 text-[#14b8a6]'
              }`}
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs font-medium">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'users'
                  ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg'
                  : 'bg-[#14b8a6]/10 border-[#14b8a6]/30 hover:bg-[#14b8a6]/20 text-[#14b8a6]'
              }`}
            >
              <Users className="h-6 w-6" />
              <span className="text-xs font-medium">Clienti</span>
            </button>
            <button
              onClick={() => setActiveTab('markets')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'markets'
                  ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg'
                  : 'bg-[#14b8a6]/10 border-[#14b8a6]/30 hover:bg-[#14b8a6]/20 text-[#14b8a6]'
              }`}
            >
              <Store className="h-6 w-6" />
              <span className="text-xs font-medium">Mercati</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'products'
                  ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg'
                  : 'bg-[#14b8a6]/10 border-[#14b8a6]/30 hover:bg-[#14b8a6]/20 text-[#14b8a6]'
              }`}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs font-medium">Prodotti</span>
            </button>
            <button
              onClick={() => setActiveTab('sustainability')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'sustainability'
                  ? 'bg-[#10b981] border-[#10b981] text-white shadow-lg'
                  : 'bg-[#10b981]/10 border-[#10b981]/30 hover:bg-[#10b981]/20 text-[#10b981]'
              }`}
            >
              <Leaf className="h-6 w-6" />
              <span className="text-xs font-medium">Sostenibilità</span>
            </button>
            <button
              onClick={() => setActiveTab('tpas')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'tpas'
                  ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg'
                  : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 text-[#8b5cf6]'
              }`}
            >
              <Package className="h-6 w-6" />
              <span className="text-xs font-medium">TPAS</span>
            </button>
            <button
              onClick={() => setActiveTab('carboncredits')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'carboncredits'
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-lg'
                  : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}
            >
              <Coins className="h-6 w-6" />
              <span className="text-xs font-medium">Carbon Credits</span>
            </button>
            <button
              onClick={() => setActiveTab('realtime')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'realtime'
                  ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-lg'
                  : 'bg-[#ef4444]/10 border-[#ef4444]/30 hover:bg-[#ef4444]/20 text-[#ef4444]'
              }`}
            >
              <Activity className="h-6 w-6" />
              <span className="text-xs font-medium">Real-time</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'logs'
                  ? 'bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg'
                  : 'bg-[#06b6d4]/10 border-[#06b6d4]/30 hover:bg-[#06b6d4]/20 text-[#06b6d4]'
              }`}
            >
              <FileText className="h-6 w-6" />
              <span className="text-xs font-medium">Logs</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'ai'
                  ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg'
                  : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 text-[#8b5cf6]'
              }`}
            >
              <Bot className="h-6 w-6" />
              <span className="text-xs font-medium">Agente AI</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'security'
                  ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-lg'
                  : 'bg-[#ef4444]/10 border-[#ef4444]/30 hover:bg-[#ef4444]/20 text-[#ef4444]'
              }`}
            >
              <Shield className="h-6 w-6" />
              <span className="text-xs font-medium">Sicurezza</span>
            </button>
            <button
              onClick={() => setActiveTab('debug')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'debug'
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-lg'
                  : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}
            >
              <Terminal className="h-6 w-6" />
              <span className="text-xs font-medium">Debug</span>
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'businesses'
                  ? 'bg-[#10b981] border-[#10b981] text-white shadow-lg'
                  : 'bg-[#10b981]/10 border-[#10b981]/30 hover:bg-[#10b981]/20 text-[#10b981]'
              }`}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-xs font-medium">Qualificazione</span>
            </button>
            <button
              onClick={() => setActiveTab('civic')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'civic'
                  ? 'bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg'
                  : 'bg-[#06b6d4]/10 border-[#06b6d4]/30 hover:bg-[#06b6d4]/20 text-[#06b6d4]'
              }`}
            >
              <Radio className="h-6 w-6" />
              <span className="text-xs font-medium">Segnalazioni & IoT</span>
            </button>
            <button
              onClick={() => setActiveTab('business-users')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'business-users'
                  ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg'
                  : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 text-[#8b5cf6]'
              }`}
            >
              <UserCog className="h-6 w-6" />
              <span className="text-xs font-medium">Utenti Imprese</span>
            </button>
            <button
              onClick={() => setActiveTab('inspections')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'inspections'
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-lg'
                  : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}
            >
              <Scale className="h-6 w-6" />
              <span className="text-xs font-medium">Controlli/Sanzioni</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'notifications'
                  ? 'bg-[#ec4899] border-[#ec4899] text-white shadow-lg'
                  : 'bg-[#ec4899]/10 border-[#ec4899]/30 hover:bg-[#ec4899]/20 text-[#ec4899]'
              }`}
            >
              <Bell className="h-6 w-6" />
              <span className="text-xs font-medium">Notifiche</span>
            </button>
            <button
              onClick={() => setActiveTab('mobility')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'mobility'
                  ? 'bg-[#3b82f6] border-[#3b82f6] text-white shadow-lg'
                  : 'bg-[#3b82f6]/10 border-[#3b82f6]/30 hover:bg-[#3b82f6]/20 text-[#3b82f6]'
              }`}
            >
              <Train className="h-6 w-6" />
              <span className="text-xs font-medium">Centro Mobilità</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'reports'
                  ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-lg'
                  : 'bg-[#a855f7]/10 border-[#a855f7]/30 hover:bg-[#a855f7]/20 text-[#a855f7]'
              }`}
            >
              <FileBarChart className="h-6 w-6" />
              <span className="text-xs font-medium">Report</span>
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'integrations'
                  ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-lg'
                  : 'bg-[#14b8a6]/10 border-[#14b8a6]/30 hover:bg-[#14b8a6]/20 text-[#14b8a6]'
              }`}
            >
              <Plug className="h-6 w-6" />
              <span className="text-xs font-medium">Integrazioni</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#64748b] border-[#64748b] text-white shadow-lg'
                  : 'bg-[#64748b]/10 border-[#64748b]/30 hover:bg-[#64748b]/20 text-[#64748b]'
              }`}
            >
              <SettingsIcon className="h-6 w-6" />
              <span className="text-xs font-medium">Impostazioni</span>
            </button>
            <button
              onClick={() => setActiveTab('mercati')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'mercati'
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-lg'
                  : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}
            >
              <Building2 className="h-6 w-6" />
              <span className="text-xs font-medium">Gestione Mercati</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'docs'
                  ? 'bg-[#06b6d4] border-[#06b6d4] text-white shadow-lg'
                  : 'bg-[#06b6d4]/10 border-[#06b6d4]/30 hover:bg-[#06b6d4]/20 text-[#06b6d4]'
              }`}
            >
              <FileText className="h-6 w-6" />
              <span className="text-xs font-medium">Documentazione</span>
            </button>
            <button
              onClick={() => setActiveTab('mio')}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                activeTab === 'mio'
                  ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white shadow-lg'
                  : 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 text-[#8b5cf6]'
              }`}
            >
              <Bot className="h-6 w-6" />
              <span className="text-xs font-medium">MIO Agent</span>
            </button>
          </div>
        </div>

        <Tabs value={activeTab} className="w-full">

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* Crescita Utenti */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#14b8a6]" />
                  Crescita Utenti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {mockData.usersGrowth.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[#14b8a6]/20 rounded-t-lg relative" style={{ height: `${(item.users / 16000) * 100}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14b8a6] to-[#14b8a6]/50 rounded-t-lg"></div>
                      </div>
                      <span className="text-xs text-[#e8fbff]/70">{item.date}</span>
                      <span className="text-sm font-semibold text-[#14b8a6]">{item.users.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mappa Mercati */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#14b8a6]" />
                  Mappa Mercati Attivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GISMap
                  center={[42.5, 12.5]}
                  zoom={6}
                  height="400px"
                  markers={mockData.topMarkets.map((m, i) => ({
                    id: i,
                    position: [42.5 + (Math.random() - 0.5) * 10, 12.5 + (Math.random() - 0.5) * 10],
                    type: 'market' as const,
                    title: m.name,
                    description: `Visite: ${m.visits.toLocaleString()} | Utenti: ${m.users.toLocaleString()}`,
                  }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CLIENTI */}
          <TabsContent value="users" className="space-y-6">
            {/* Mezzi di Trasporto */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Bike className="h-5 w-5 text-[#14b8a6]" />
                  Mezzi di Trasporto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.transport.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {item.mode === 'A piedi' && <Footprints className="h-4 w-4" style={{ color: item.color }} />}
                        {item.mode === 'Bicicletta' && <Bike className="h-4 w-4" style={{ color: item.color }} />}
                        {item.mode === 'Bus' && <Bus className="h-4 w-4" style={{ color: item.color }} />}
                        {item.mode === 'Auto' && <Car className="h-4 w-4" style={{ color: item.color }} />}
                        {item.mode === 'Elettrico' && <Zap className="h-4 w-4" style={{ color: item.color }} />}
                        <span className="text-[#e8fbff]">{item.mode}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[#e8fbff]/70">{item.count.toLocaleString()}</span>
                        <span className="font-semibold text-[#14b8a6]">{item.percentage}%</span>
                        {item.co2 > 0 && (
                          <span className="text-xs text-[#10b981]">💚 {item.co2} kg CO₂</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-[#0b1220] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <Leaf className="h-5 w-5" />
                    <span className="font-semibold">CO₂ Risparmiata: {mockData.overview.co2Saved} kg questo mese</span>
                  </div>
                  <p className="text-sm text-[#e8fbff]/70 mt-2">Equivalente a 200 alberi piantati</p>
                </div>
              </CardContent>
            </Card>

            {/* Provenienza Geografica */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#14b8a6]" />
                  Provenienza Geografica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Grosseto</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#e8fbff]/70">8,500 utenti</span>
                      <span className="font-semibold text-[#14b8a6]">53.6%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Follonica</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#e8fbff]/70">2,300 utenti</span>
                      <span className="font-semibold text-[#14b8a6]">14.5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Orbetello</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#e8fbff]/70">1,800 utenti</span>
                      <span className="font-semibold text-[#14b8a6]">11.4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: MERCATI */}
          <TabsContent value="markets" className="space-y-6">
            {/* Mappa Italia Mercati */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#14b8a6]" />
                  Mappa Italia - Tutti i Mercati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GISMap
                  center={[42.5, 12.5]}
                  zoom={6}
                  height="calc(100vh - 400px)"
                  markers={mockData.topMarkets.map((m, i) => ({
                    id: i,
                    position: [42.5 + (Math.random() - 0.5) * 10, 12.5 + (Math.random() - 0.5) * 10],
                    type: 'market' as const,
                    title: m.name,
                    description: `Visite: ${m.visits.toLocaleString()} | Utenti: ${m.users.toLocaleString()}`,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Store className="h-5 w-5 text-[#14b8a6]" />
                  Ranking Mercati Più Frequentati
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockData.topMarkets.map((market, i) => (
                  <div key={i} className="p-4 bg-[#0b1220] rounded-lg border border-[#14b8a6]/20 hover:border-[#14b8a6]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-[#14b8a6]">#{market.rank}</span>
                        <span className="text-[#e8fbff] font-semibold">{market.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <span key={j} className={j < market.rank ? 'text-[#f59e0b]' : 'text-[#e8fbff]/20'}>⭐</span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[#e8fbff]/70">Visite</span>
                        <p className="text-[#14b8a6] font-semibold">{market.visits.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[#e8fbff]/70">Utenti Unici</span>
                        <p className="text-[#14b8a6] font-semibold">{market.users.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-[#e8fbff]/70">Durata Media</span>
                        <p className="text-[#14b8a6] font-semibold">{market.duration} min</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: PRODOTTI */}
          <TabsContent value="products" className="space-y-6">
            {/* Categorie */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#14b8a6]" />
                  Categorie Più Acquistate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockData.categories.map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#e8fbff]">{cat.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[#e8fbff]/70">{cat.purchases.toLocaleString()}</span>
                        <span className="font-semibold text-[#14b8a6]">{cat.percentage}%</span>
                        <span className="text-xs text-[#10b981]">🌱 BIO {cat.bio}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#0b1220] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certificazioni */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#14b8a6]" />
                  Certificazioni Prodotti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {mockData.certifications.map((cert, i) => (
                    <div key={i} className="p-4 bg-[#0b1220] rounded-lg border border-[#14b8a6]/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#e8fbff] font-semibold">{cert.type}</span>
                        <Award className="h-5 w-5" style={{ color: cert.color }} />
                      </div>
                      <div className="text-2xl font-bold text-[#14b8a6] mb-1">{cert.percentage}%</div>
                      <div className="text-sm text-[#e8fbff]/70">{cert.count.toLocaleString()} prodotti</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">78.5% prodotti certificati</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: SOSTENIBILITÀ */}
          <TabsContent value="sustainability" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-[#14b8a6]" />
                  Rating Sostenibilità Popolazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-[#14b8a6] mb-2">
                    {mockData.overview.sustainabilityRating}/10
                  </div>
                  <p className="text-[#e8fbff]/70">Media popolazione</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Carbon Credits</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#14b8a6]/20 rounded-full h-2">
                        <div className="bg-[#14b8a6] h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-[#14b8a6] font-semibold">8.2/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Acquisti BIO</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#14b8a6]/20 rounded-full h-2">
                        <div className="bg-[#14b8a6] h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <span className="text-[#14b8a6] font-semibold">7.8/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Trasporto Sostenibile</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#14b8a6]/20 rounded-full h-2">
                        <div className="bg-[#14b8a6] h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-[#14b8a6] font-semibold">7.5/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Engagement Civico</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#14b8a6]/20 rounded-full h-2">
                        <div className="bg-[#14b8a6] h-2 rounded-full" style={{ width: '69%' }}></div>
                      </div>
                      <span className="text-[#14b8a6] font-semibold">6.9/10</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Shopping Locale</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-[#14b8a6]/20 rounded-full h-2">
                        <div className="bg-[#14b8a6] h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-[#14b8a6] font-semibold">8.5/10</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: TPAS */}
          <TabsContent value="tpas" className="space-y-6">
            {/* E-commerce vs Fisico */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#14b8a6]" />
                  E-commerce vs Negozi Fisici
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-[#ef4444]" />
                      <span className="text-[#e8fbff] font-semibold">E-commerce</span>
                    </div>
                    <div className="text-3xl font-bold text-[#ef4444] mb-1">
                      {mockData.ecommerceVsPhysical.ecommerce.percentage}%
                    </div>
                    <div className="text-sm text-[#e8fbff]/70">
                      {mockData.ecommerceVsPhysical.ecommerce.purchases.toLocaleString()} acquisti
                    </div>
                    <div className="text-sm text-[#ef4444] mt-2">
                      CO₂: {mockData.ecommerceVsPhysical.ecommerce.avgCo2} kg/acquisto
                    </div>
                  </div>
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="h-5 w-5 text-[#10b981]" />
                      <span className="text-[#e8fbff] font-semibold">Negozi Fisici</span>
                    </div>
                    <div className="text-3xl font-bold text-[#10b981] mb-1">
                      {mockData.ecommerceVsPhysical.physical.percentage}%
                    </div>
                    <div className="text-sm text-[#e8fbff]/70">
                      {mockData.ecommerceVsPhysical.physical.purchases.toLocaleString()} acquisti
                    </div>
                    <div className="text-sm text-[#10b981] mt-2">
                      CO₂: {mockData.ecommerceVsPhysical.physical.avgCo2} kg/acquisto
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <Leaf className="h-5 w-5" />
                    <span className="font-semibold">
                      Risparmio CO₂ acquisti fisici: {mockData.ecommerceVsPhysical.co2Savings.toLocaleString()} kg/mese
                    </span>
                  </div>
                  <p className="text-sm text-[#e8fbff]/70 mt-2">Equivalente a 200 alberi piantati</p>
                </div>
              </CardContent>
            </Card>

            {/* Origine Prodotti */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#14b8a6]" />
                  Origine Prodotti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇮🇹</span>
                    <span className="text-[#e8fbff]">Locale (0-50km)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#e8fbff]/70">{mockData.productOrigin.local.count.toLocaleString()}</span>
                    <span className="font-semibold text-[#10b981]">{mockData.productOrigin.local.percentage}%</span>
                    <span className="text-xs text-[#10b981]">CO₂: {mockData.productOrigin.local.avgCo2} kg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇮🇹</span>
                    <span className="text-[#e8fbff]">Nazionale</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#e8fbff]/70">{mockData.productOrigin.national.count.toLocaleString()}</span>
                    <span className="font-semibold text-[#14b8a6]">{mockData.productOrigin.national.percentage}%</span>
                    <span className="text-xs text-[#f59e0b]">CO₂: {mockData.productOrigin.national.avgCo2} kg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇺</span>
                    <span className="text-[#e8fbff]">UE</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#e8fbff]/70">{mockData.productOrigin.eu.count.toLocaleString()}</span>
                    <span className="font-semibold text-[#f59e0b]">{mockData.productOrigin.eu.percentage}%</span>
                    <span className="text-xs text-[#ef4444]">CO₂: {mockData.productOrigin.eu.avgCo2} kg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌍</span>
                    <span className="text-[#e8fbff]">Extra-UE</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#e8fbff]/70">{mockData.productOrigin.extraEu.count.toLocaleString()}</span>
                    <span className="font-semibold text-[#ef4444]">{mockData.productOrigin.extraEu.percentage}%</span>
                    <span className="text-xs text-[#ef4444]">CO₂: {mockData.productOrigin.extraEu.avgCo2} kg</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg">
                  <div className="flex items-center gap-2 text-[#8b5cf6]">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Sustainability Score: 8.5/10</span>
                  </div>
                  <p className="text-sm text-[#e8fbff]/70 mt-2">88% prodotti italiani, 60% locali</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 7: CARBON CREDITS */}
          <TabsContent value="carboncredits" className="space-y-6">
            {/* Fondo Liquidità */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#14b8a6]" />
                  Fondo Liquidità
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border border-[#10b981]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Saldo Attuale (click to edit)</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#10b981]">€</span>
                      <input
                        type="number"
                        value={editableParams.fundBalance}
                        onChange={(e) => setEditableParams({ ...editableParams, fundBalance: parseFloat(e.target.value) || 0 })}
                        className="text-3xl font-bold text-[#10b981] bg-transparent border-b-2 border-[#10b981]/50 focus:border-[#10b981] outline-none w-full"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-[#0b1220] border border-[#14b8a6]/20 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Burn Rate (click to edit)</div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#f59e0b]">€</span>
                      <input
                        type="number"
                        value={editableParams.burnRate}
                        onChange={(e) => setEditableParams({ ...editableParams, burnRate: parseFloat(e.target.value) || 0 })}
                        className="text-2xl font-bold text-[#f59e0b] bg-transparent border-b-2 border-[#f59e0b]/50 focus:border-[#f59e0b] outline-none w-full"
                      />
                      <span className="text-sm text-[#e8fbff]/70">/mese</span>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0b1220] border border-[#14b8a6]/20 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Mesi Rimanenti</div>
                    <div className="text-2xl font-bold text-[#14b8a6]">
                      {calculateMonthsRemaining()}
                    </div>
                  </div>
                  <div className="p-4 bg-[#0b1220] border border-[#14b8a6]/20 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Valuta</div>
                    <div className="text-2xl font-bold text-[#e8fbff]">
                      {mockData.carbonCredits.fund.currency}
                    </div>
                  </div>
                </div>

                {/* Entrate */}
                <div className="mb-4">
                  <h4 className="text-[#e8fbff] font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#10b981]" />
                    Entrate Fondo
                  </h4>
                  <div className="space-y-2">
                    {mockData.carbonCredits.fund.sources.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                        <div className="flex items-center gap-3">
                          <Coins className="h-5 w-5 text-[#10b981]" />
                          <div>
                            <div className="text-[#e8fbff] font-medium">{source.name}</div>
                            <div className="text-xs text-[#e8fbff]/50">{source.date}</div>
                          </div>
                        </div>
                        <div className="text-[#10b981] font-semibold">+€{source.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uscite */}
                <div>
                  <h4 className="text-[#e8fbff] font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-[#ef4444]" />
                    Uscite Fondo
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Rimborsi</div>
                      <div className="text-xl font-bold text-[#ef4444]">
                        €{mockData.carbonCredits.fund.expenses.reimbursements.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Incentivi</div>
                      <div className="text-xl font-bold text-[#f59e0b]">
                        €{mockData.carbonCredits.fund.expenses.incentives.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg">
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Operativi</div>
                      <div className="text-xl font-bold text-[#8b5cf6]">
                        €{mockData.carbonCredits.fund.expenses.operations.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Valore TCC e Manopola Politica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Valore TCC */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Coins className="h-5 w-5 text-[#14b8a6]" />
                    Valore Token Carbon Credit (TCC)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="text-sm text-[#e8fbff]/70 mb-2">Valore Corrente</div>
                    <div className="text-5xl font-bold text-[#14b8a6] mb-1">
                      €{appliedTccValue.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-[#e8fbff]/50">per 1 TCC</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-[#e8fbff]/70 mb-3">Storico Variazioni</div>
                    <div className="space-y-2">
                      {mockData.carbonCredits.value.history.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-[#0b1220] rounded">
                          <span className="text-xs text-[#e8fbff]/70">{item.date}</span>
                          <span className="text-sm font-semibold text-[#14b8a6]">€{item.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Manopola Politica */}
              <Card className="bg-[#1a2332] border-[#8b5cf6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-[#8b5cf6]" />
                    Manopola Politica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <label className="text-sm text-[#e8fbff]/70 mb-2 block">Regola Valore Base TCC</label>
                    <input
                      type="range"
                      min="0"
                      max="5.00"
                      step="0.10"
                      value={tccValue}
                      onChange={(e) => setTccValue(parseFloat(e.target.value))}
                      className="w-full h-2 bg-[#0b1220] rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-[#e8fbff]/50 mt-1">
                      <span>€0,00</span>
                      <span>€2,50</span>
                      <span>€5,00</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg mb-4">
                    <div className="text-sm text-[#e8fbff] font-semibold mb-2">Simulatore Impatto</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#e8fbff]/70">Nuovo valore:</span>
                        <span className="text-[#8b5cf6] font-semibold">€{tccValue.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#e8fbff]/70">Incremento spesa:</span>
                        <span className="text-[#f59e0b] font-semibold">+€{((tccValue - appliedTccValue) * 1000).toFixed(0)}/mese</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#e8fbff]/70">Mesi rimanenti:</span>
                        <span className="text-[#14b8a6] font-semibold">{tccValue > 0 ? (125000 / (tccValue * 1000)).toFixed(1) : '∞'}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setAppliedTccValue(tccValue);
                      alert(`Valore TCC aggiornato a €${tccValue.toFixed(2).replace('.', ',')}!\n\nLa modifica è stata applicata con successo.`);
                    }}
                    className="w-full bg-[#8b5cf6] hover:bg-[#8b5cf6]/80"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Applica Modifica
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Regolazione per Area e Categoria */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Per Area */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#14b8a6]" />
                    Regolazione per Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculateAreaValues().map((area, idx) => (
                      <div key={idx} className="p-3 bg-[#0b1220] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#e8fbff] font-medium">{area.area}</span>
                          <input
                            type="number"
                            value={area.boost}
                            onChange={(e) => {
                              const newBoosts = [...editableParams.areaBoosts];
                              newBoosts[idx].boost = parseFloat(e.target.value) || 0;
                              setEditableParams({ ...editableParams, areaBoosts: newBoosts });
                            }}
                            className={`text-sm font-semibold px-2 py-1 rounded w-20 text-center ${
                              area.boost > 0 ? 'bg-[#10b981]/20 text-[#10b981]' :
                              area.boost < 0 ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                              'bg-[#14b8a6]/20 text-[#14b8a6]'
                            } border-none focus:ring-2 focus:ring-[#14b8a6]`}
                          />
                          <span className="text-xs text-[#e8fbff]/50 ml-1">%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#e8fbff]/50">Valore finale:</span>
                          <span className="text-lg font-bold text-[#14b8a6]">€{area.value.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Per Categoria */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#14b8a6]" />
                    Regolazione per Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calculateCategoryValues().map((cat, idx) => (
                      <div key={idx} className="p-3 bg-[#0b1220] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[#e8fbff] font-medium">{cat.category}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-[#e8fbff]/50">+</span>
                            <input
                              type="number"
                              value={cat.boost}
                              onChange={(e) => {
                                const newBoosts = [...editableParams.categoryBoosts];
                                newBoosts[idx].boost = parseFloat(e.target.value) || 0;
                                setEditableParams({ ...editableParams, categoryBoosts: newBoosts });
                              }}
                              className={`text-sm font-semibold px-2 py-1 rounded w-16 text-center ${
                                cat.boost > 0 ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#14b8a6]/20 text-[#14b8a6]'
                              } border-none focus:ring-2 focus:ring-[#14b8a6]`}
                            />
                            <span className="text-xs text-[#e8fbff]/50">%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#e8fbff]/50">Valore finale:</span>
                          <span className="text-lg font-bold text-[#14b8a6]">€{cat.finalValue.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sistema Rimborsi */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-[#14b8a6]" />
                  Sistema Rimborsi Negozi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-[#f59e0b]" />
                      <span className="text-[#e8fbff] font-semibold">Pending</span>
                    </div>
                    <div className="text-3xl font-bold text-[#f59e0b] mb-1">
                      {mockData.carbonCredits.reimbursements.pending.count}
                    </div>
                    <div className="text-sm text-[#e8fbff]/70">
                      €{mockData.carbonCredits.reimbursements.pending.amount.toLocaleString()} da processare
                    </div>
                  </div>
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-[#10b981]" />
                      <span className="text-[#e8fbff] font-semibold">Processati</span>
                    </div>
                    <div className="text-3xl font-bold text-[#10b981] mb-1">
                      {mockData.carbonCredits.reimbursements.processed.count}
                    </div>
                    <div className="text-sm text-[#e8fbff]/70">
                      €{mockData.carbonCredits.reimbursements.processed.amount.toLocaleString()} totali
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-[#e8fbff] font-semibold mb-3">Top Negozi per Crediti Incassati</h4>
                  <div className="space-y-2">
                    {mockData.carbonCredits.reimbursements.topShops.map((shop, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#14b8a6]/20 flex items-center justify-center">
                            <span className="text-[#14b8a6] font-bold">#{idx + 1}</span>
                          </div>
                          <span className="text-[#e8fbff]">{shop.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-[#14b8a6] font-semibold">{shop.credits.toLocaleString()} TCC</div>
                          <div className="text-xs text-[#e8fbff]/50">€{shop.euros.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-[#14b8a6] hover:bg-[#14b8a6]/80">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button className="flex-1 bg-[#8b5cf6] hover:bg-[#8b5cf6]/80">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Processa Batch
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Economici */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#14b8a6]" />
                  Analytics Economici
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-[#0b1220] rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">TCC Emessi (click to edit)</div>
                    <input
                      type="number"
                      value={editableParams.tccIssued}
                      onChange={(e) => setEditableParams({ ...editableParams, tccIssued: parseFloat(e.target.value) || 0 })}
                      className="text-3xl font-bold text-[#14b8a6] bg-transparent border-b-2 border-[#14b8a6]/50 focus:border-[#14b8a6] outline-none w-full"
                    />
                  </div>
                  <div className="p-4 bg-[#0b1220] rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">TCC Spesi (click to edit)</div>
                    <input
                      type="number"
                      value={editableParams.tccSpent}
                      onChange={(e) => setEditableParams({ ...editableParams, tccSpent: parseFloat(e.target.value) || 0 })}
                      className="text-3xl font-bold text-[#10b981] bg-transparent border-b-2 border-[#10b981]/50 focus:border-[#10b981] outline-none w-full"
                    />
                  </div>
                  <div className="p-4 bg-[#0b1220] rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Velocity (Utilizzo)</div>
                    <div className="text-3xl font-bold text-[#f59e0b]">
                      {calculateVelocity()}%
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg mb-4">
                  <h4 className="text-[#e8fbff] font-semibold mb-3 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-[#10b981]" />
                    ROI Sostenibilità
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Investito (Fondo)</div>
                      <div className="text-xl font-bold text-[#e8fbff]">
                        €{editableParams.fundBalance.toLocaleString('it-IT')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#e8fbff]/70 mb-1">CO₂ Risparmiata</div>
                      <div className="text-xl font-bold text-[#10b981]">
                        {parseFloat(calculateCO2Saved()).toLocaleString('it-IT')} kg
                      </div>
                      <div className="text-xs text-[#e8fbff]/50 mt-1">
                        (TCC Spesi × 0.06 kg)
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Alberi Equivalenti</div>
                      <div className="text-xl font-bold text-[#14b8a6]">
                        {calculateTreesEquivalent()} alberi
                      </div>
                      <div className="text-xs text-[#e8fbff]/50 mt-1">
                        (CO₂ / 22 kg/albero)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impatto Fondo */}
                <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                  <h4 className="text-[#e8fbff] font-semibold mb-3 flex items-center gap-2">
                    <Euro className="h-5 w-5 text-[#f59e0b]" />
                    Impatto Fondo Liquidità
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Rimborsi Necessari (TCC Spesi × Valore)</div>
                      <div className="text-xl font-bold text-[#f59e0b]">
                        €{parseFloat(calculateReimbursementNeeded()).toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#e8fbff]/70 mb-1">Fondo Disponibile</div>
                      <div className="text-xl font-bold text-[#14b8a6]">
                        €{editableParams.fundBalance.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-[#0b1220] rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#e8fbff]/70">Copertura Fondo</span>
                      <span className="text-lg font-bold text-[#10b981]">
                        {((editableParams.fundBalance / parseFloat(calculateReimbursementNeeded())) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-[#0b1220] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#10b981] to-[#14b8a6] transition-all duration-300"
                        style={{ width: `${Math.min(100, (editableParams.fundBalance / parseFloat(calculateReimbursementNeeded())) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrazione TPAS */}
            <Card className="bg-gradient-to-br from-[#8b5cf6]/10 to-[#8b5cf6]/5 border-[#8b5cf6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#8b5cf6]" />
                  Integrazione TPAS (Ready 2027)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Stub API TPAS</span>
                    <span className="px-3 py-1 bg-[#f59e0b]/20 text-[#f59e0b] rounded-full text-sm font-semibold">Standby</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Mapping Ecocrediti</span>
                    <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-sm font-semibold">Ready</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Conversione Automatica</span>
                    <span className="px-3 py-1 bg-[#10b981]/20 text-[#10b981] rounded-full text-sm font-semibold">Ready</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                    <span className="text-[#e8fbff]">Fondo TPAS → Fondo DMS</span>
                    <span className="px-3 py-1 bg-[#8b5cf6]/20 text-[#8b5cf6] rounded-full text-sm font-semibold">2027+</span>
                  </div>
                  <div className="p-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg">
                    <p className="text-sm text-[#e8fbff]/70">
                      Il sistema è predisposto per l'integrazione con TPAS. Quando attivo (2027+), i TCC saranno automaticamente convertiti in Ecocrediti ufficiali e il fondo sarà alimentato dal Fondo TPAS nazionale.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 8: REAL-TIME */}
          <TabsContent value="realtime" className="space-y-6">
            {/* Attività Real-time */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#14b8a6] animate-pulse" />
                  Attività Real-time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0b1220] rounded-lg border border-[#14b8a6]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-[#14b8a6]" />
                      <span className="text-[#e8fbff]/70 text-sm">Utenti Online</span>
                    </div>
                    <div className="text-3xl font-bold text-[#14b8a6]">{realtimeData.activeUsers}</div>
                  </div>
                  <div className="p-4 bg-[#0b1220] rounded-lg border border-[#14b8a6]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Store className="h-5 w-5 text-[#14b8a6]" />
                      <span className="text-[#e8fbff]/70 text-sm">Operatori Attivi</span>
                    </div>
                    <div className="text-3xl font-bold text-[#14b8a6]">{realtimeData.activeVendors}</div>
                  </div>
                  <div className="p-4 bg-[#0b1220] rounded-lg border border-[#14b8a6]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-[#10b981]" />
                      <span className="text-[#e8fbff]/70 text-sm">Check-in Oggi</span>
                    </div>
                    <div className="text-3xl font-bold text-[#10b981]">{realtimeData.todayCheckins}</div>
                  </div>
                  <div className="p-4 bg-[#0b1220] rounded-lg border border-[#14b8a6]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-5 w-5 text-[#14b8a6]" />
                      <span className="text-[#e8fbff]/70 text-sm">Transazioni Oggi</span>
                    </div>
                    <div className="text-3xl font-bold text-[#14b8a6]">{realtimeData.todayTransactions}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Sistemi */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[#14b8a6]" />
                  Status Sistemi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <span className="text-[#e8fbff]">API Backend</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#10b981]" />
                    <span className="text-[#10b981] font-semibold">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <span className="text-[#e8fbff]">Database PostgreSQL</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#10b981]" />
                    <span className="text-[#10b981] font-semibold">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <span className="text-[#e8fbff]">Redis Event Bus</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[#10b981]" />
                    <span className="text-[#10b981] font-semibold">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0b1220] rounded-lg">
                  <span className="text-[#e8fbff]">TPAS Integration</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#f59e0b]" />
                    <span className="text-[#f59e0b] font-semibold">Standby (2027)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 8: LOGS */}
          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#14b8a6]" />
                  Logs Real-time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockData.logs.map((log) => (
                    <div key={log.id} className={`p-3 rounded-lg border ${
                      log.level === 'error' ? 'bg-[#ef4444]/10 border-[#ef4444]/30' :
                      log.level === 'warning' ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30' :
                      'bg-[#0b1220] border-[#14b8a6]/20'
                    }`}>
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            log.level === 'error' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                            log.level === 'warning' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                            'bg-[#14b8a6]/20 text-[#14b8a6]'
                          }`}>{log.level.toUpperCase()}</span>
                          <span className="text-xs text-[#e8fbff]/70">{log.app}</span>
                          <span className="text-xs text-[#e8fbff]/50">•</span>
                          <span className="text-xs text-[#e8fbff]/50">{log.type}</span>
                        </div>
                        <span className="text-xs text-[#e8fbff]/50">{log.timestamp}</span>
                      </div>
                      <p className="text-sm text-[#e8fbff] mb-1">{log.message}</p>
                      <div className="flex items-center gap-3 text-xs text-[#e8fbff]/50">
                        <span>👤 {log.user}</span>
                        <span>📍 {log.ip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 9: AGENTE AI */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#14b8a6]/30 h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#14b8a6]" />
                  Agente AI - Assistente PA
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-[#0b1220] rounded-lg p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#14b8a6]/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-[#14b8a6]" />
                      </div>
                      <div className="bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-[#e8fbff]">Ciao! Sono l'Agente AI della Dashboard PA. Posso aiutarti con:</p>
                        <ul className="text-sm text-[#e8fbff]/70 mt-2 space-y-1 list-disc list-inside">
                          <li>Analytics e statistiche</li>
                          <li>Generazione report</li>
                          <li>Query dati in linguaggio naturale</li>
                          <li>Alert e notifiche</li>
                        </ul>
                      </div>
                    </div>
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-[#14b8a6]/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-[#14b8a6]" />
                          </div>
                        )}
                        <div className={`rounded-lg p-3 max-w-[80%] ${
                          msg.role === 'user' 
                            ? 'bg-[#8b5cf6]/20 border border-[#8b5cf6]/30' 
                            : 'bg-[#14b8a6]/10 border border-[#14b8a6]/30'
                        }`}>
                          <p className="text-sm text-[#e8fbff]">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        const userMsg = chatInput.trim();
                        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
                        setChatInput('');
                        setTimeout(() => {
                          setChatMessages(prev => [...prev, { 
                            role: 'ai', 
                            content: `Ho ricevuto la tua richiesta: "${userMsg}". Questa è una risposta simulata. In produzione, qui ci sarà l'integrazione con un vero modello AI per analizzare i dati della Dashboard PA.`
                          }]);
                        }, 500);
                      }
                    }}
                    placeholder="Chiedi qualcosa... (es: Quanti utenti oggi?)"
                    className="flex-1 bg-[#0b1220] border border-[#14b8a6]/30 rounded-lg px-4 py-2 text-[#e8fbff] placeholder:text-[#e8fbff]/50 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50"
                  />
                  <Button 
                    onClick={() => {
                      if (chatInput.trim()) {
                        const userMsg = chatInput.trim();
                        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
                        setChatInput('');
                        setTimeout(() => {
                          setChatMessages(prev => [...prev, { 
                            role: 'ai', 
                            content: `Ho ricevuto la tua richiesta: "${userMsg}". Questa è una risposta simulata. In produzione, qui ci sarà l'integrazione con un vero modello AI per analizzare i dati della Dashboard PA.`
                          }]);
                        }, 500);
                      }
                    }}
                    className="bg-[#14b8a6] hover:bg-[#14b8a6]/80"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 10: SICUREZZA */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#1a2332] to-[#0b1220] border-[#14b8a6]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#e8fbff]/70">Accessi Totali</CardTitle>
                  <UserCheck className="h-5 w-5 text-[#14b8a6]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#e8fbff]">{mockData.security.totalAccesses.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#1a2332] to-[#0b1220] border-[#ef4444]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#e8fbff]/70">Login Falliti</CardTitle>
                  <AlertCircle className="h-5 w-5 text-[#ef4444]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#ef4444]">{mockData.security.failedLogins}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#1a2332] to-[#0b1220] border-[#f59e0b]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#e8fbff]/70">Attività Sospette</CardTitle>
                  <Shield className="h-5 w-5 text-[#f59e0b]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#f59e0b]">{mockData.security.suspiciousActivity}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#1a2332] to-[#0b1220] border-[#14b8a6]/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-[#e8fbff]/70">Utenti Attivi</CardTitle>
                  <Users className="h-5 w-5 text-[#14b8a6]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#14b8a6]">{mockData.security.activeUsers}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#14b8a6]" />
                  Vulnerabilità Rilevate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                    <div className="text-2xl font-bold text-[#ef4444] mb-1">{mockData.security.vulnerabilities.critical}</div>
                    <div className="text-sm text-[#e8fbff]/70">Critical</div>
                  </div>
                  <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                    <div className="text-2xl font-bold text-[#f59e0b] mb-1">{mockData.security.vulnerabilities.high}</div>
                    <div className="text-sm text-[#e8fbff]/70">High</div>
                  </div>
                  <div className="p-4 bg-[#eab308]/10 border border-[#eab308]/30 rounded-lg">
                    <div className="text-2xl font-bold text-[#eab308] mb-1">{mockData.security.vulnerabilities.medium}</div>
                    <div className="text-sm text-[#e8fbff]/70">Medium</div>
                  </div>
                  <div className="p-4 bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-lg">
                    <div className="text-2xl font-bold text-[#14b8a6] mb-1">{mockData.security.vulnerabilities.low}</div>
                    <div className="text-sm text-[#e8fbff]/70">Low</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 11: DEBUG & DEV */}
          <TabsContent value="debug" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Bug className="h-5 w-5 text-[#ef4444]" />
                    Errori
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">Totali</span>
                      <span className="font-semibold text-[#e8fbff]">{mockData.debug.errors.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">Risolti</span>
                      <span className="font-semibold text-[#10b981]">{mockData.debug.errors.resolved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">Pending</span>
                      <span className="font-semibold text-[#ef4444]">{mockData.debug.errors.pending}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#14b8a6]" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">Avg Response</span>
                      <span className="font-semibold text-[#14b8a6]">{mockData.debug.performance.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">P95</span>
                      <span className="font-semibold text-[#f59e0b]">{mockData.debug.performance.p95}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">P99</span>
                      <span className="font-semibold text-[#ef4444]">{mockData.debug.performance.p99}ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Code className="h-5 w-5 text-[#8b5cf6]" />
                    Deployment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">Version</span>
                      <span className="font-semibold text-[#8b5cf6]">{mockData.debug.deployments.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70">Status</span>
                      <span className="font-semibold text-[#10b981]">{mockData.debug.deployments.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#e8fbff]/70 text-xs">Last Deploy</span>
                      <span className="font-semibold text-[#e8fbff] text-xs">{mockData.debug.deployments.lastDeploy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[#14b8a6]" />
                  Console Logs Live
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0b1220] rounded-lg p-4 font-mono text-sm h-64 overflow-y-auto">
                  <div className="text-[#10b981]">$ System health check...</div>
                  <div className="text-[#14b8a6]">✓ API: {mockData.debug.healthChecks.api}</div>
                  <div className="text-[#14b8a6]">✓ Database: {mockData.debug.healthChecks.database}</div>
                  <div className="text-[#14b8a6]">✓ Redis: {mockData.debug.healthChecks.redis}</div>
                  <div className="text-[#14b8a6]">✓ Storage: {mockData.debug.healthChecks.storage}</div>
                  <div className="text-[#e8fbff]/50 mt-4">$ Monitoring active...</div>
                  <div className="text-[#8b5cf6] mt-4">$ MIO Agent API Status...</div>
                  <div className="text-[#14b8a6]">✓ POST /api/logs/initSchema - Ready</div>
                  <div className="text-[#14b8a6]">✓ POST /api/logs/createLog - Ready</div>
                  <div className="text-[#14b8a6]">✓ GET /api/logs/getLogs - Ready</div>
                  <div className="text-[#e8fbff]/50 mt-2">→ Test via tab Integrazioni</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 13: QUALIFICAZIONE IMPRESE */}
          <TabsContent value="businesses" className="space-y-6">
            {/* KPI Conformità */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border-[#10b981]/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#e8fbff]/70">Pienamente Conformi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#10b981] mb-1">{mockData.businesses.fullyCompliant}</div>
                  <div className="text-sm text-[#e8fbff]/50">{((mockData.businesses.fullyCompliant / mockData.businesses.total) * 100).toFixed(1)}% del totale</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border-[#f59e0b]/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#e8fbff]/70">Con Riserva</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#f59e0b] mb-1">{mockData.businesses.partiallyCompliant}</div>
                  <div className="text-sm text-[#e8fbff]/50">{((mockData.businesses.partiallyCompliant / mockData.businesses.total) * 100).toFixed(1)}% del totale</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/5 border-[#ef4444]/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#e8fbff]/70">Non Conformi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#ef4444] mb-1">{mockData.businesses.nonCompliant}</div>
                  <div className="text-sm text-[#e8fbff]/50">{((mockData.businesses.nonCompliant / mockData.businesses.total) * 100).toFixed(1)}% del totale</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#14b8a6]/20 to-[#14b8a6]/5 border-[#14b8a6]/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-[#e8fbff]/70">Score Medio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#14b8a6] mb-1">{mockData.businesses.avgScore}</div>
                  <div className="text-sm text-[#e8fbff]/50">su 100</div>
                </CardContent>
              </Card>
            </div>

            {/* Scadenze Imminenti */}
            <Card className="bg-[#1a2332] border-[#ef4444]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-[#ef4444]" />
                  Scadenze Imminenti ({mockData.businesses.atRiskSuspension})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.businesses.expiringDocs.map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                      item.critical ? 'bg-[#ef4444]/10 border border-[#ef4444]/30' : 'bg-[#0b1220]'
                    }`}>
                      <div className="flex items-center gap-3">
                        {item.critical && <AlertCircle className="h-5 w-5 text-[#ef4444]" />}
                        <div>
                          <div className="text-[#e8fbff] font-medium">{item.business}</div>
                          <div className="text-sm text-[#e8fbff]/70">{item.doc}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          item.critical ? 'text-[#ef4444]' : 'text-[#f59e0b]'
                        }`}>
                          {item.days} giorni
                        </div>
                        <Button size="sm" variant="outline" className="mt-1">
                          Invia Reminder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demografia e Indici */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demografia */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#14b8a6]" />
                    Demografia Imprese
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0b1220] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#e8fbff]/70">Aperture 2025</span>
                        <span className="text-2xl font-bold text-[#10b981]">+{mockData.businesses.demographics.openings}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#e8fbff]/70">Cessazioni 2025</span>
                        <span className="text-2xl font-bold text-[#ef4444]">-{mockData.businesses.demographics.closures}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#14b8a6]/30">
                        <span className="text-[#e8fbff] font-semibold">Crescita Netta</span>
                        <span className="text-2xl font-bold text-[#14b8a6]">+{mockData.businesses.demographics.netGrowth}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#0b1220] rounded-lg">
                        <div className="text-xs text-[#e8fbff]/70 mb-1">Per Sesso</div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[#e8fbff]/70">Uomini</span>
                            <span className="text-[#14b8a6] font-semibold">{mockData.businesses.demographics.byGender.male}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#e8fbff]/70">Donne</span>
                            <span className="text-[#14b8a6] font-semibold">{mockData.businesses.demographics.byGender.female}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-[#0b1220] rounded-lg">
                        <div className="text-xs text-[#e8fbff]/70 mb-1">Per Origine</div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[#e8fbff]/70">Locali</span>
                            <span className="text-[#14b8a6] font-semibold">{mockData.businesses.demographics.byOrigin.native}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#e8fbff]/70">Stranieri</span>
                            <span className="text-[#14b8a6] font-semibold">{mockData.businesses.demographics.byOrigin.foreign}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Indici Strategici */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Target className="h-5 w-5 text-[#14b8a6]" />
                    Indici Strategici
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#e8fbff]">Riqualificazione</span>
                        <span className="text-2xl font-bold text-[#14b8a6]">{mockData.businesses.indices.requalification}</span>
                      </div>
                      <div className="w-full bg-[#0b1220] rounded-full h-3">
                        <div className="bg-gradient-to-r from-[#14b8a6] to-[#10b981] h-3 rounded-full" style={{width: `${mockData.businesses.indices.requalification}%`}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#e8fbff]">Digitalizzazione</span>
                        <span className="text-2xl font-bold text-[#8b5cf6]">{mockData.businesses.indices.digitalization}</span>
                      </div>
                      <div className="w-full bg-[#0b1220] rounded-full h-3">
                        <div className="bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] h-3 rounded-full" style={{width: `${mockData.businesses.indices.digitalization}%`}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#e8fbff]">Sostenibilità</span>
                        <span className="text-2xl font-bold text-[#10b981]">{mockData.businesses.indices.sustainability}</span>
                      </div>
                      <div className="w-full bg-[#0b1220] rounded-full h-3">
                        <div className="bg-gradient-to-r from-[#10b981] to-[#34d399] h-3 rounded-full" style={{width: `${mockData.businesses.indices.sustainability}%`}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formazione e Bandi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formazione */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[#14b8a6]" />
                    Formazione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                      <div className="text-sm text-[#e8fbff]/70 mb-1">Completati</div>
                      <div className="text-3xl font-bold text-[#10b981]">{mockData.businesses.training.completed}</div>
                    </div>
                    <div className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                      <div className="text-sm text-[#e8fbff]/70 mb-1">Programmati</div>
                      <div className="text-3xl font-bold text-[#f59e0b]">{mockData.businesses.training.scheduled}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-[#e8fbff]/70 mb-2">Top Formatori</div>
                    <div className="space-y-2">
                      {mockData.businesses.training.topTrainers.map((trainer, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-[#0b1220] rounded">
                          <div>
                            <div className="text-[#e8fbff] text-sm">{trainer.name}</div>
                            <div className="text-xs text-[#e8fbff]/50">{trainer.courses} corsi</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-[#f59e0b]" />
                            <span className="text-[#f59e0b] font-semibold">{trainer.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Costo Medio Corso</div>
                    <div className="text-2xl font-bold text-[#14b8a6]">€{mockData.businesses.training.avgCost}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Bandi */}
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#14b8a6]" />
                    Bandi Attivi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-lg">
                      <div className="text-sm text-[#e8fbff]/70 mb-1">Bandi Aperti</div>
                      <div className="text-3xl font-bold text-[#8b5cf6]">{mockData.businesses.grants.active}</div>
                    </div>
                    <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                      <div className="text-sm text-[#e8fbff]/70 mb-1">Success Rate</div>
                      <div className="text-3xl font-bold text-[#10b981]">{mockData.businesses.grants.successRate}%</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-[#e8fbff]/70 mb-2">Top Bandi</div>
                    <div className="space-y-2">
                      {mockData.businesses.grants.topGrants.map((grant, idx) => (
                        <div key={idx} className="p-3 bg-[#0b1220] rounded-lg">
                          <div className="text-[#e8fbff] font-medium mb-1">{grant.title}</div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#e8fbff]/70">{grant.applicants} domande</span>
                            <span className="text-[#10b981] font-semibold">{grant.approved} approvate</span>
                          </div>
                          <div className="text-xs text-[#14b8a6] mt-1">€{grant.amount.toLocaleString()} totali</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Imprese */}
            <Card className="bg-[#1a2332] border-[#14b8a6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#f59e0b]" />
                  Top 5 Imprese per Score Qualificazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.businesses.topScoring.map((business, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#0b1220] rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#f97316] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">#{idx + 1}</span>
                        </div>
                        <div>
                          <div className="text-[#e8fbff] font-semibold">{business.name}</div>
                          <div className="text-sm text-[#e8fbff]/50">{business.sector}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#10b981] mb-1">{business.score}</div>
                        <div className="text-xs text-[#e8fbff]/70">Digitalizzazione: {business.digitalization}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 14: SEGNALAZIONI & IOT */}
          <TabsContent value="civic" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#06b6d4]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Radio className="h-5 w-5 text-[#06b6d4]" />
                  Segnalazioni Civiche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Pending</div>
                    <div className="text-3xl font-bold text-[#f59e0b]">{mockData.civicReports.pending}</div>
                  </div>
                  <div className="p-4 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">In Progress</div>
                    <div className="text-3xl font-bold text-[#06b6d4]">{mockData.civicReports.inProgress}</div>
                  </div>
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Resolved</div>
                    <div className="text-3xl font-bold text-[#10b981]">{mockData.civicReports.resolved}</div>
                  </div>
                  <div className="p-4 bg-[#0b1220] border border-[#14b8a6]/20 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Totali</div>
                    <div className="text-3xl font-bold text-[#e8fbff]">{mockData.civicReports.total}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {mockData.civicReports.recent.map((report) => (
                    <div key={report.id} className="p-4 bg-[#0b1220] rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-[#e8fbff] font-semibold">{report.type}</div>
                        <div className="text-sm text-[#e8fbff]/70">{report.description} - {report.location}</div>
                        <div className="text-xs text-[#e8fbff]/50 mt-1">{report.user} • {report.date}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        report.status === 'in_progress' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                        'bg-[#10b981]/20 text-[#10b981]'
                      }`}>
                        {report.status === 'pending' ? 'Da assegnare' : report.status === 'in_progress' ? 'In corso' : 'Risolto'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mappa Segnalazioni Cluster */}
            <Card className="bg-[#1a2332] border-[#06b6d4]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#06b6d4]" />
                  Mappa Segnalazioni Civiche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GISMap
                  center={[44.4949, 11.3426]}
                  zoom={12}
                  height="calc(100vh - 400px)"
                  markers={mockData.civicReports.recent.map((report) => ({
                    id: report.id,
                    position: [44.4949 + (Math.random() - 0.5) * 0.1, 11.3426 + (Math.random() - 0.5) * 0.1],
                    type: 'civic' as const,
                    title: report.type,
                    description: `${report.description} | ${report.location} | ${report.status}`,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#06b6d4]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <CloudRain className="h-5 w-5 text-[#06b6d4]" />
                  Sensori IoT Ambientali (ARPAE Emilia-Romagna)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">PM10</div>
                    <div className="text-3xl font-bold text-[#10b981]">{mockData.iotSensors.airQuality.pm10}</div>
                    <div className="text-xs text-[#e8fbff]/50 mt-1">µg/m³</div>
                  </div>
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">PM2.5</div>
                    <div className="text-3xl font-bold text-[#10b981]">{mockData.iotSensors.airQuality.pm25}</div>
                    <div className="text-xs text-[#e8fbff]/50 mt-1">µg/m³</div>
                  </div>
                  <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">NO₂</div>
                    <div className="text-3xl font-bold text-[#f59e0b]">{mockData.iotSensors.airQuality.no2}</div>
                    <div className="text-xs text-[#e8fbff]/50 mt-1">µg/m³</div>
                  </div>
                  <div className="p-4 bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Temperatura</div>
                    <div className="text-3xl font-bold text-[#06b6d4]">{mockData.iotSensors.weather.temp}°C</div>
                    <div className="text-xs text-[#e8fbff]/50 mt-1">Umidità: {mockData.iotSensors.weather.humidity}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 15: UTENTI IMPRESE */}
          <TabsContent value="business-users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/5 border-[#8b5cf6]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Totali</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#8b5cf6]">{mockData.businessUsers.total}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border-[#10b981]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Attive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#10b981]">{mockData.businessUsers.active}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/5 border-[#ef4444]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Inattive</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#ef4444]">{mockData.businessUsers.inactive}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Revenue Totale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#14b8a6]">€{mockData.businessUsers.byCategory.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2332] border-[#8b5cf6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff]">Top Imprese per Vendite</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.businessUsers.topUsers.map((user, idx) => (
                    <div key={idx} className="p-4 bg-[#0b1220] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-[#e8fbff] font-semibold">{user.name}</div>
                        <div className="text-sm text-[#e8fbff]/70">Rating: {user.rating} ⭐</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#10b981]">{user.sales}</div>
                        <div className="text-xs text-[#e8fbff]/50">{user.credits} TCC</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 16: CONTROLLI/SANZIONI */}
          <TabsContent value="inspections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#f59e0b]/20 to-[#f59e0b]/5 border-[#f59e0b]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Programmati</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#f59e0b]">{mockData.inspections.scheduled}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border-[#10b981]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Completati</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#10b981]">{mockData.inspections.completed}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#ef4444]/20 to-[#ef4444]/5 border-[#ef4444]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Violazioni</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#ef4444]">{mockData.inspections.violations}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Multe Totali</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#ef4444]">€{mockData.inspections.totalFines.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2332] border-[#f59e0b]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff]">Prossimi Controlli</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockData.inspections.upcoming.map((inspection) => (
                    <div key={inspection.id} className="p-4 bg-[#0b1220] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-[#e8fbff] font-semibold">{inspection.business}</div>
                        <div className="text-sm text-[#e8fbff]/70">{inspection.type} • Ispettore: {inspection.inspector}</div>
                      </div>
                      <div className="text-[#f59e0b] font-semibold">{inspection.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mappa Controlli Polizia */}
            <Card className="bg-[#1a2332] border-[#f59e0b]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#f59e0b]" />
                  Mappa Posizioni Controlli
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GISMap
                  center={[43.7696, 11.2558]}
                  zoom={12}
                  height="calc(100vh - 400px)"
                  markers={mockData.inspections.upcoming.map((insp, i) => ({
                    id: insp.id,
                    position: [43.7696 + (Math.random() - 0.5) * 0.1, 11.2558 + (Math.random() - 0.5) * 0.1],
                    type: 'civic' as const,
                    title: insp.business,
                    description: `${insp.type} | Ispettore: ${insp.inspector} | Data: ${insp.date}`,
                  }))}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 17: NOTIFICHE */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-[#ec4899]/20 to-[#ec4899]/5 border-[#ec4899]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Inviate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#ec4899]">{mockData.notifications.sent}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border-[#10b981]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Consegnate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#10b981]">{mockData.notifications.delivered}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#06b6d4]/20 to-[#06b6d4]/5 border-[#06b6d4]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Open Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-[#06b6d4]">{mockData.notifications.openRate}%</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1a2332] border-[#14b8a6]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#e8fbff] text-sm">Click Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#f59e0b]">{mockData.notifications.clickRate}%</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1a2332] border-[#ec4899]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff]">Notifiche Recenti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockData.notifications.recent.map((notif) => (
                    <div key={notif.id} className="p-4 bg-[#0b1220] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[#e8fbff] font-semibold">{notif.title}</div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          notif.type === 'push' ? 'bg-[#ec4899]/20 text-[#ec4899]' :
                          notif.type === 'email' ? 'bg-[#06b6d4]/20 text-[#06b6d4]' :
                          'bg-[#10b981]/20 text-[#10b981]'
                        }`}>
                          {notif.type.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-[#e8fbff]/70">Inviate: {notif.sent} • Aperte: {notif.opened}</div>
                        <div className="text-[#e8fbff]/50">{notif.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 18: CENTRO MOBILITÀ */}
          <TabsContent value="mobility" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#3b82f6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Train className="h-5 w-5 text-[#3b82f6]" />
                  Trasporti Pubblici TPER (Bologna)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Linee Attive</div>
                    <div className="text-3xl font-bold text-[#3b82f6]">
                      {realData.mobilityData.length > 0 
                        ? new Set(realData.mobilityData.filter((m: any) => m.type === 'bus' || m.type === 'tram').map((m: any) => m.lineNumber)).size
                        : mockData.mobility.busLines}
                    </div>
                  </div>
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Bus in Servizio</div>
                    <div className="text-3xl font-bold text-[#10b981]">
                      {realData.mobilityData.length > 0
                        ? realData.mobilityData.filter((m: any) => m.type === 'bus' && m.status === 'active').length
                        : mockData.mobility.activeBuses}
                    </div>
                  </div>
                  <div className="p-4 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Passeggeri Oggi</div>
                    <div className="text-3xl font-bold text-[#f59e0b]">
                      {realData.mobilityData.length > 0
                        ? realData.mobilityData.reduce((sum: number, m: any) => sum + (m.occupancy || 0), 0).toLocaleString()
                        : mockData.mobility.passengers.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-[#0b1220] border border-[#14b8a6]/20 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Fermate</div>
                    <div className="text-3xl font-bold text-[#e8fbff]">
                      {realData.mobilityData.length > 0
                        ? realData.mobilityData.filter((m: any) => m.type === 'bus' || m.type === 'tram').length
                        : mockData.mobility.totalBusStops}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[#e8fbff] font-semibold mb-3">Prossime Corse</h4>
                  {(realData.mobilityData.length > 0 
                    ? realData.mobilityData.filter((m: any) => m.type === 'bus' || m.type === 'tram').slice(0, 3)
                    : mockData.mobility.stops
                  ).map((stop: any) => (
                    <div key={stop.id} className="p-4 bg-[#0b1220] rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-[#e8fbff] font-semibold">{stop.stopName || stop.name}</div>
                        <div className="text-sm text-[#e8fbff]/70">Linee: {stop.lineNumber || stop.line}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#10b981]">
                          {stop.nextArrival ? `${stop.nextArrival} min` : stop.nextBus}
                        </div>
                        <div className="text-xs text-[#e8fbff]/50">
                          {stop.occupancy ? `${stop.occupancy}% occupazione` : `${stop.passengers} passeggeri`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#3b82f6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <ParkingCircle className="h-5 w-5 text-[#3b82f6]" />
                  Parcheggi Bologna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0b1220] rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Posti Totali</div>
                    <div className="text-3xl font-bold text-[#e8fbff]">{mockData.mobility.parkingSpots}</div>
                  </div>
                  <div className="p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Occupati</div>
                    <div className="text-3xl font-bold text-[#ef4444]">{mockData.mobility.parkingOccupied}</div>
                  </div>
                  <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                    <div className="text-sm text-[#e8fbff]/70 mb-1">Disponibili</div>
                    <div className="text-3xl font-bold text-[#10b981]">{mockData.mobility.parkingAvailable}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grafici Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a2332] border-[#3b82f6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#3b82f6]" />
                    Trend Passeggeri Settimanale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { day: 'Lun', passeggeri: 3200 },
                      { day: 'Mar', passeggeri: 3450 },
                      { day: 'Mer', passeggeri: 3100 },
                      { day: 'Gio', passeggeri: 3600 },
                      { day: 'Ven', passeggeri: 3800 },
                      { day: 'Sab', passeggeri: 2900 },
                      { day: 'Dom', passeggeri: 2400 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#3b82f6" opacity={0.1} />
                      <XAxis dataKey="day" stroke="#e8fbff" />
                      <YAxis stroke="#e8fbff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #3b82f6' }} />
                      <Line type="monotone" dataKey="passeggeri" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[#1a2332] border-[#10b981]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-[#10b981]" />
                    Utilizzo Linee per Fascia Oraria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { fascia: '6-9', bus: 850, tram: 420 },
                      { fascia: '9-12', bus: 620, tram: 380 },
                      { fascia: '12-15', bus: 480, tram: 290 },
                      { fascia: '15-18', bus: 720, tram: 450 },
                      { fascia: '18-21', bus: 890, tram: 520 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#10b981" opacity={0.1} />
                      <XAxis dataKey="fascia" stroke="#e8fbff" />
                      <YAxis stroke="#e8fbff" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #10b981' }} />
                      <Legend />
                      <Bar dataKey="bus" fill="#3b82f6" />
                      <Bar dataKey="tram" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Mappa Interattiva Fermate */}
            {realData.mobilityData.length > 0 && (
              <Card className="bg-[#1a2332] border-[#3b82f6]/30">
                <CardHeader>
                  <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#3b82f6]" />
                    Mappa Trasporti Pubblici
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px] rounded-lg overflow-hidden">
                    <MobilityMap
                      stops={realData.mobilityData.map((m: any) => ({
                        id: m.id,
                        type: m.type,
                        stopName: m.stopName,
                        lineNumber: m.lineNumber,
                        lineName: m.lineName,
                        lat: m.lat,
                        lng: m.lng,
                        nextArrival: m.nextArrival,
                        occupancy: m.occupancy,
                        status: m.status,
                        totalSpots: m.totalSpots,
                        availableSpots: m.availableSpots
                      }))}
                      center={{ lat: 42.7606, lng: 11.1133 }}
                      zoom={12}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 19: REPORT */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#a855f7]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <FileBarChart className="h-5 w-5 text-[#a855f7]" />
                  Report & Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileBarChart className="h-16 w-16 text-[#a855f7] mx-auto mb-4" />
                  <p className="text-[#e8fbff]/70 text-lg">Sezione Report in sviluppo</p>
                  <p className="text-[#e8fbff]/50 text-sm mt-2">Generazione report PDF/CSV, export dati, analytics avanzati</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 20: INTEGRAZIONI */}
          <TabsContent value="integrations" className="space-y-6">
            <Integrazioni />
          </TabsContent>

          {/* TAB 21: IMPOSTAZIONI */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#64748b]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-[#64748b]" />
                  Impostazioni Dashboard PA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <SettingsIcon className="h-16 w-16 text-[#64748b] mx-auto mb-4" />
                  <p className="text-[#e8fbff]/70 text-lg">Sezione Impostazioni in sviluppo</p>
                  <p className="text-[#e8fbff]/50 text-sm mt-2">Configurazione dashboard, permessi utenti, preferenze visualizzazione</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 22: GESTIONE MERCATI */}
          <TabsContent value="mercati" className="space-y-6">
            <GestioneMercati />
          </TabsContent>

          {/* TAB 23: DOCUMENTAZIONE */}
          <TabsContent value="docs" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#06b6d4]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#06b6d4]" />
                  Documentazione Progetto DMS Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Indice Documenti */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-[#0b1220] border-[#06b6d4]/30">
                      <CardHeader>
                        <CardTitle className="text-[#e8fbff] text-lg">📋 Stato Progetto Aggiornato</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[#e8fbff]/70 text-sm mb-4">
                          Documento completo con stato attuale, architettura, funzionalità operative, TODO prioritizzati e guide.
                        </p>
                        <div className="text-xs text-[#e8fbff]/50 mb-4">
                          📅 Ultimo aggiornamento: 10 Novembre 2025, ore 21:30
                        </div>
                        <Button 
                          className="w-full bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-white"
                          onClick={() => window.open('/STATO_PROGETTO_AGGIORNATO.md', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Visualizza Documento
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0b1220] border-[#06b6d4]/30">
                      <CardHeader>
                        <CardTitle className="text-[#e8fbff] text-lg">📊 Resoconto Completo Ecosistema</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-[#e8fbff]/70 text-sm mb-4">
                          Resoconto originale completo dell'ecosistema DMS Hub con tutte le 8 applicazioni web integrate.
                        </p>
                        <div className="text-xs text-[#e8fbff]/50 mb-4">
                          📅 Data: 9 Novembre 2025
                        </div>
                        <Button 
                          className="w-full bg-[#06b6d4] hover:bg-[#06b6d4]/80 text-white"
                          onClick={() => window.open('/RESOCONTO_COMPLETO_DMS_HUB.md', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Visualizza Documento
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sezioni Principali */}
                  <Card className="bg-[#0b1220] border-[#06b6d4]/30">
                    <CardHeader>
                      <CardTitle className="text-[#e8fbff] text-lg">📚 Sezioni Principali</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">🎯 Executive Summary</div>
                          <p className="text-[#e8fbff]/60 text-sm">Panoramica generale ecosistema DMS Hub</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">🏭 Architettura Tecnica</div>
                          <p className="text-[#e8fbff]/60 text-sm">Stack, Database 39 tabelle, API tRPC</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">📱 8 Applicazioni Web</div>
                          <p className="text-[#e8fbff]/60 text-sm">Stato e features di ogni app</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">⭐ Sistema Integrazioni</div>
                          <p className="text-[#e8fbff]/60 text-sm">Implementazione completa (NUOVO!)</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">✅ Funzionalità Operative</div>
                          <p className="text-[#e8fbff]/60 text-sm">Cosa funziona e cosa manca</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">📅 TODO Prioritizzati</div>
                          <p className="text-[#e8fbff]/60 text-sm">Roadmap Alta/Media/Bassa priorità</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">🔗 6 Integrazioni Esterne</div>
                          <p className="text-[#e8fbff]/60 text-sm">TPER, Centro Mobilità, ARPAE, etc.</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">📚 Guide Operative</div>
                          <p className="text-[#e8fbff]/60 text-sm">Come usare API Keys, Webhook, Health Check</p>
                        </div>
                        <div className="p-4 bg-[#1a2332] rounded-lg border border-[#06b6d4]/20">
                          <div className="text-[#06b6d4] font-semibold mb-2">🎯 Metriche Successo</div>
                          <p className="text-[#e8fbff]/60 text-sm">KPI e obiettivi scala nazionale</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Info Scala Nazionale */}
                  <Card className="bg-[#0b1220] border-[#10b981]/30">
                    <CardHeader>
                      <CardTitle className="text-[#e8fbff] text-lg">🌍 Scala Nazionale</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                          <div className="text-sm text-[#e8fbff]/70 mb-1">Mercati Target</div>
                          <div className="text-3xl font-bold text-[#10b981]">8.000</div>
                        </div>
                        <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                          <div className="text-sm text-[#e8fbff]/70 mb-1">Posteggi Gestiti</div>
                          <div className="text-3xl font-bold text-[#10b981]">400.000</div>
                        </div>
                        <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg">
                          <div className="text-sm text-[#e8fbff]/70 mb-1">Imprese Registrate</div>
                          <div className="text-3xl font-bold text-[#10b981]">160.000</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 24: MIO AGENT */}
          <TabsContent value="mio" className="space-y-6">
            <Card className="bg-[#1a2332] border-[#8b5cf6]/30">
              <CardHeader>
                <CardTitle className="text-[#e8fbff] flex items-center gap-2">
                  <Bot className="h-5 w-5 text-[#8b5cf6]" />
                  MIO Agent - Monitoraggio e Orchestrazione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MIOAgent />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
