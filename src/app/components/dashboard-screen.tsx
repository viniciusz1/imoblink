import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, TrendingUp, TrendingDown, MapPin, Building2, CalendarDays, CalendarClock, DollarSign, BarChart3, ArrowUpRight, Star, Percent, Lightbulb, ExternalLink, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import propertiesData from '../../imports/sitemap_itaivan_pradi_imob.json';

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function generateMockData(tipo: string, index: number) {
  const seed = index;
  let quartos = 0;
  if (tipo.toLowerCase().includes('apartamento') || tipo.toLowerCase().includes('casa') || tipo.toLowerCase().includes('chacara')) {
    quartos = (seed % 4) + 1;
  }
  let areaPrivativa = 0;
  if (tipo.toLowerCase().includes('apartamento')) {
    areaPrivativa = 45 + (seed % 100);
  } else if (tipo.toLowerCase().includes('casa') || tipo.toLowerCase().includes('chacara')) {
    areaPrivativa = 80 + (seed % 220);
  } else if (tipo.toLowerCase().includes('sala') || tipo.toLowerCase().includes('comercial')) {
    areaPrivativa = 30 + (seed % 150);
  } else if (tipo.toLowerCase().includes('terreno')) {
    areaPrivativa = 200 + (seed % 800);
  } else {
    areaPrivativa = 50 + (seed % 150);
  }
  return { quartos, areaPrivativa };
}

const allProperties = propertiesData.map((item, index) => {
  const mock = generateMockData(item.tipo, index);
  return {
    id: index + 1,
    tipo: capitalize(item.tipo),
    preco: item.valor,
    bairro: capitalize(item.bairro),
    cidade: capitalize(item.cidade),
    imobiliaria: item.imobiliaria,
    quartos: mock.quartos,
    areaPrivativa: mock.areaPrivativa,
    descricao: item.descricao,
    imagem: item.imagem,
    linkImovel: item.link_imovel,
  };
});

// Mock: simulate dates - newer items have higher IDs
const totalItems = allProperties.length;
const thisWeekItems = allProperties.slice(Math.max(0, totalItems - Math.floor(totalItems * 0.05)));
const thisMonthItems = allProperties.slice(Math.max(0, totalItems - Math.floor(totalItems * 0.15)));

// Mock sold properties (random ~20% of older properties)
const soldProperties = allProperties.filter((_, i) => i % 5 === 0 && i < totalItems * 0.7);

const GRADIENT_COLORS = ['#0A4F6E', '#0d6e96', '#2ECC71', '#27ae60', '#E67E22', '#d35400', '#3498db', '#2980b9'];
const PIE_COLORS = ['#0A4F6E', '#2ECC71', '#E67E22', '#e74c3c', '#3498db', '#1abc9c', '#9b59b6', '#f39c12'];

export function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'overview' | 'regions' | 'market' | 'trends' | 'opportunities'>('overview');

  const stats = useMemo(() => {
    const totalActive = allProperties.length;
    const avgPrice = allProperties.reduce((s, p) => s + p.preco, 0) / totalActive;
    const avgPriceM2 = allProperties.filter(p => p.areaPrivativa > 0).reduce((s, p) => s + (p.preco / p.areaPrivativa), 0) / allProperties.filter(p => p.areaPrivativa > 0).length;

    // Properties under 500k (most sought-after range)
    const under500k = allProperties.filter(p => p.preco <= 500000).length;

    // Neighborhood with most new listings
    const newByNeighborhood: Record<string, number> = {};
    thisWeekItems.forEach(p => { newByNeighborhood[p.bairro] = (newByNeighborhood[p.bairro] || 0) + 1; });
    const hotNeighborhood = Object.entries(newByNeighborhood).sort((a, b) => b[1] - a[1])[0];

    // Average R$/m² for this month's items vs all
    const monthM2 = thisMonthItems.filter(p => p.areaPrivativa > 0);
    const avgM2Month = monthM2.length > 0
      ? monthM2.reduce((s, p) => s + (p.preco / p.areaPrivativa), 0) / monthM2.length
      : 0;

    // By city - sales count
    const salesByCity: Record<string, number> = {};
    soldProperties.forEach(p => { salesByCity[p.cidade] = (salesByCity[p.cidade] || 0) + 1; });
    const topSalesCities = Object.entries(salesByCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, vendas: value }));

    // Price per m2 by city
    const m2ByCity: Record<string, { total: number; count: number }> = {};
    allProperties.filter(p => p.areaPrivativa > 0).forEach(p => {
      if (!m2ByCity[p.cidade]) m2ByCity[p.cidade] = { total: 0, count: 0 };
      m2ByCity[p.cidade].total += p.preco / p.areaPrivativa;
      m2ByCity[p.cidade].count += 1;
    });
    const priceM2ByCityData = Object.entries(m2ByCity)
      .map(([name, d]) => ({ name, valorM2: Math.round(d.total / d.count) }))
      .sort((a, b) => b.valorM2 - a.valorM2)
      .slice(0, 8);

    // By neighborhood - sales
    const salesByNeighborhood: Record<string, number> = {};
    soldProperties.forEach(p => { salesByNeighborhood[p.bairro] = (salesByNeighborhood[p.bairro] || 0) + 1; });
    const topSalesNeighborhoods = Object.entries(salesByNeighborhood)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, vendas: value }));

    // By type distribution
    const byType: Record<string, number> = {};
    allProperties.forEach(p => { byType[p.tipo] = (byType[p.tipo] || 0) + 1; });
    const typeData = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Price range distribution
    const priceRanges = [
      { name: 'Até 200k', min: 0, max: 200000 },
      { name: '200k-500k', min: 200000, max: 500000 },
      { name: '500k-1M', min: 500000, max: 1000000 },
      { name: '1M-2M', min: 1000000, max: 2000000 },
      { name: '2M-5M', min: 2000000, max: 5000000 },
      { name: '5M+', min: 5000000, max: Infinity },
    ];
    const priceDistribution = priceRanges.map(r => ({
      name: r.name,
      quantidade: allProperties.filter(p => p.preco >= r.min && p.preco < r.max).length
    }));

    // By agency
    const byAgency: Record<string, number> = {};
    allProperties.forEach(p => { byAgency[p.imobiliaria] = (byAgency[p.imobiliaria] || 0) + 1; });
    const topAgencies = Object.entries(byAgency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '…' : name, imoveis: value }));

    // Price per m2 by neighborhood
    const m2ByNeighborhood: Record<string, { total: number; count: number }> = {};
    allProperties.filter(p => p.areaPrivativa > 0).forEach(p => {
      if (!m2ByNeighborhood[p.bairro]) m2ByNeighborhood[p.bairro] = { total: 0, count: 0 };
      m2ByNeighborhood[p.bairro].total += p.preco / p.areaPrivativa;
      m2ByNeighborhood[p.bairro].count += 1;
    });
    const priceM2ByNeighborhood = Object.entries(m2ByNeighborhood)
      .map(([name, d]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, valorM2: Math.round(d.total / d.count) }))
      .sort((a, b) => b.valorM2 - a.valorM2)
      .slice(0, 10);

    // Mock trend data (simulated months)
    const trendData = [
      { mes: 'Set/25', novos: Math.floor(totalActive * 0.08), vendidos: Math.floor(soldProperties.length * 0.12) },
      { mes: 'Out/25', novos: Math.floor(totalActive * 0.09), vendidos: Math.floor(soldProperties.length * 0.14) },
      { mes: 'Nov/25', novos: Math.floor(totalActive * 0.11), vendidos: Math.floor(soldProperties.length * 0.11) },
      { mes: 'Dez/25', novos: Math.floor(totalActive * 0.07), vendidos: Math.floor(soldProperties.length * 0.09) },
      { mes: 'Jan/26', novos: Math.floor(totalActive * 0.10), vendidos: Math.floor(soldProperties.length * 0.13) },
      { mes: 'Fev/26', novos: Math.floor(totalActive * 0.12), vendidos: Math.floor(soldProperties.length * 0.15) },
      { mes: 'Mar/26', novos: Math.floor(totalActive * 0.15), vendidos: Math.floor(soldProperties.length * 0.10) },
    ];

    // Avg price by type
    const avgByType: Record<string, { total: number; count: number }> = {};
    allProperties.forEach(p => {
      if (!avgByType[p.tipo]) avgByType[p.tipo] = { total: 0, count: 0 };
      avgByType[p.tipo].total += p.preco;
      avgByType[p.tipo].count += 1;
    });
    const avgPriceByType = Object.entries(avgByType)
      .map(([name, d]) => ({ name, precoMedio: Math.round(d.total / d.count) }))
      .sort((a, b) => b.precoMedio - a.precoMedio)
      .slice(0, 6);

    // Opportunities: properties with R$/m² below neighborhood average
    const neighborhoodAvgM2: Record<string, number> = {};
    Object.entries(m2ByNeighborhood).forEach(([name, d]) => {
      neighborhoodAvgM2[name] = d.total / d.count;
    });

    const opportunities = allProperties
      .filter(p => {
        if (p.preco < 100000) return false;
        if (p.areaPrivativa <= 0) return false;
        const priceM2 = p.preco / p.areaPrivativa;
        const avgM2 = neighborhoodAvgM2[p.bairro];
        if (!avgM2) return false;
        return priceM2 < avgM2 * 0.85; // 15%+ below neighborhood average
      })
      .map(p => {
        const priceM2 = p.preco / p.areaPrivativa;
        const avgM2 = neighborhoodAvgM2[p.bairro];
        const discount = ((1 - priceM2 / avgM2) * 100);
        return { ...p, priceM2, avgM2Bairro: avgM2, discount };
      })
      .sort((a, b) => b.discount - a.discount);

    return {
      totalActive,
      newThisWeek: thisWeekItems.length,
      newThisMonth: thisMonthItems.length,
      totalSold: soldProperties.length,
      avgPrice,
      avgPriceM2,
      under500k,
      hotNeighborhood: hotNeighborhood ? { name: hotNeighborhood[0], count: hotNeighborhood[1] } : null,
      avgM2Month,
      topSalesCities,
      topSalesNeighborhoods,
      priceM2ByCityData,
      priceM2ByNeighborhood,
      typeData,
      priceDistribution,
      topAgencies,
      trendData,
      avgPriceByType,
      opportunities,
    };
  }, []);

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'regions' as const, label: 'Regiões', icon: MapPin },
    { id: 'market' as const, label: 'Mercado', icon: DollarSign },
    { id: 'trends' as const, label: 'Tendências', icon: TrendingUp },
    { id: 'opportunities' as const, label: 'Oportunidades', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#0d1b2a]">
      {/* Header */}
      <header className="bg-[#0A4F6E] dark:bg-[#072a3d] text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">ImobLink</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
              <Link to="/imoveis">
                <Home className="w-5 h-5" />
                Imóveis
              </Link>
            </Button>
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
              <Link to="/">
                <LogOut className="w-5 h-5" />
                Sair
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard — Inteligência de Mercado</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Dados atualizados em 22/03/2026</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Imóveis Ativos', value: stats.totalActive.toLocaleString(), icon: Building2, color: '#0A4F6E' },
            { label: 'Novos esta Semana', value: stats.newThisWeek.toString(), icon: CalendarClock, color: '#3498db' },
            { label: 'Novos este Mês', value: stats.newThisMonth.toString(), icon: CalendarDays, color: '#2ECC71' },
            { label: 'Até R$500k', value: stats.under500k.toString(), icon: DollarSign, color: '#E67E22' },
            { label: 'Preço Médio', value: formatCurrency(stats.avgPrice), icon: DollarSign, color: '#9b59b6' },
            { label: 'R$/m² Médio', value: formatCurrency(stats.avgPriceM2), icon: Percent, color: '#1abc9c' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: kpi.color }} />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</span>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.hotNeighborhood && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#E67E22] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Bairro mais ativo da semana</p>
                <p className="font-bold text-gray-800 dark:text-gray-100">{stats.hotNeighborhood.name}</p>
                <p className="text-xs text-gray-500">{stats.hotNeighborhood.count} novos imóveis</p>
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#0A4F6E] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">R$/m² novos do mês</p>
              <p className="font-bold text-gray-800 dark:text-gray-100">{formatCurrency(stats.avgM2Month)}</p>
              <p className="text-xs text-gray-500">
                {stats.avgM2Month > stats.avgPriceM2
                  ? `${((stats.avgM2Month / stats.avgPriceM2 - 1) * 100).toFixed(1)}% acima da média geral`
                  : `${((1 - stats.avgM2Month / stats.avgPriceM2) * 100).toFixed(1)}% abaixo da média geral`
                }
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#2ECC71] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Oportunidades detectadas</p>
              <p className="font-bold text-gray-800 dark:text-gray-100">{stats.opportunities.length} imóveis</p>
              <p className="text-xs text-gray-500">com R$/m² abaixo do bairro</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0A4F6E] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Type Distribution Pie */}
            <ChartCard title="Distribuição por Tipo" icon={Building2}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.typeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Price Distribution */}
            <ChartCard title="Distribuição por Faixa de Preço" icon={DollarSign}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="url(#blueGreen)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A4F6E" />
                      <stop offset="100%" stopColor="#2ECC71" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Top Agencies */}
            <ChartCard title="Top Imobiliárias por Volume" icon={Star}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topAgencies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="imoveis" fill="url(#purpleBlue)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="purpleBlue" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3498db" />
                      <stop offset="100%" stopColor="#0A4F6E" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Avg Price by Type */}
            <ChartCard title="Preço Médio por Tipo" icon={DollarSign}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.avgPriceByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="precoMedio" fill="url(#greenTeal)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="greenTeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2ECC71" />
                      <stop offset="100%" stopColor="#1abc9c" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'regions' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by City */}
            <ChartCard title="Vendas por Cidade" icon={MapPin}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topSalesCities}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="url(#blueGreen2)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGreen2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A4F6E" />
                      <stop offset="100%" stopColor="#2ECC71" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Sales by Neighborhood */}
            <ChartCard title="Vendas por Bairro (Top 8)" icon={MapPin}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topSalesNeighborhoods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="vendas" fill="url(#orangeRed)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="orangeRed" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#E67E22" />
                      <stop offset="100%" stopColor="#e74c3c" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Price/m² by City */}
            <ChartCard title="Valor do m² por Cidade" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.priceM2ByCityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="valorM2" fill="url(#tealCyan)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="tealCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0A4F6E" />
                      <stop offset="100%" stopColor="#1abc9c" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Price/m² by Neighborhood */}
            <ChartCard title="Valor do m² por Bairro (Top 10)" icon={ArrowUpRight}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.priceM2ByNeighborhood} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="valorM2" fill="url(#violetPink)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="violetPink" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3498db" />
                      <stop offset="100%" stopColor="#9b59b6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top properties table */}
            <div className="lg:col-span-2">
              <ChartCard title="Imóveis Mais Caros do Portfólio" icon={Star}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Foto</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Tipo</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Bairro</th>
                        <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400">Cidade</th>
                        <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400">Área (m²)</th>
                        <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400">Valor</th>
                        <th className="text-right py-3 px-4 text-gray-500 dark:text-gray-400">R$/m²</th>
                        <th className="text-center py-3 px-4 text-gray-500 dark:text-gray-400">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...allProperties]
                        .sort((a, b) => b.preco - a.preco)
                        .slice(0, 10)
                        .map((p, i) => (
                          <tr key={p.id} className={`border-b border-gray-100 dark:border-gray-800 ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''}`}>
                            <td className="py-2 px-4">
                              <ImageWithFallback src={p.imagem} alt={p.tipo} className="w-16 h-12 object-cover rounded-md" />
                            </td>
                            <td className="py-2.5 px-4 text-gray-800 dark:text-gray-200">{p.tipo}</td>
                            <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">{p.bairro}</td>
                            <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300">{p.cidade}</td>
                            <td className="py-2.5 px-4 text-right text-gray-700 dark:text-gray-300">{p.areaPrivativa}</td>
                            <td className="py-2.5 px-4 text-right font-medium text-[#2ECC71] dark:text-[#2ECC71]">{formatCurrency(p.preco)}</td>
                            <td className="py-2.5 px-4 text-right text-gray-600 dark:text-gray-400">{p.areaPrivativa > 0 ? formatCurrency(p.preco / p.areaPrivativa) : '-'}</td>
                            <td className="py-2.5 px-4 text-center">
                              <a href={p.linkImovel} target="_blank" rel="noopener noreferrer" className="text-[#0A4F6E] dark:text-[#3bb8e8] hover:text-[#0A4F6E]/70 transition-colors">
                                <ExternalLink className="w-4 h-4 inline" />
                              </a>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </ChartCard>
            </div>

            {/* Market share by agency pie */}
            <ChartCard title="Market Share — Imobiliárias" icon={Building2}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={stats.topAgencies} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="imoveis" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.topAgencies.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Radar chart - property type competitiveness */}
            <ChartCard title="Competitividade por Tipo (Qtd. Imóveis)" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={stats.typeData.slice(0, 6)}>
                  <PolarGrid stroke="#d1d5db" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                  <Radar dataKey="value" stroke="#0A4F6E" fill="#0A4F6E" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Trend - new vs sold */}
            <ChartCard title="Novos vs Vendidos — Últimos 7 Meses" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={stats.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <defs>
                    <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A4F6E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0A4F6E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVendidos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="novos" name="Novos" stroke="#0A4F6E" fill="url(#colorNovos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="vendidos" name="Vendidos" stroke="#2ECC71" fill="url(#colorVendidos)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Photo showcase: New this week */}
            <ChartCard title={`Vitrine — Novos da Semana (${stats.newThisWeek})`} icon={Camera}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {thisWeekItems.slice(0, 20).map(p => (
                  <a
                    key={p.id}
                    href={p.linkImovel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="relative h-36 overflow-hidden">
                      <ImageWithFallback
                        src={p.imagem}
                        alt={`${p.tipo} - ${p.bairro}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#0A4F6E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {p.tipo}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-[#2ECC71] dark:text-[#2ECC71] text-sm">{formatCurrency(p.preco)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.bairro} — {p.cidade}</p>
                      {p.areaPrivativa > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{p.areaPrivativa} m² · {p.quartos > 0 ? `${p.quartos} quartos` : 'Comercial'}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-[#0A4F6E] dark:text-[#3bb8e8] text-[10px] font-medium">
                        <ExternalLink className="w-3 h-3" />
                        Ver anúncio
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </ChartCard>

            {/* Photo showcase: New this month */}
            <ChartCard title={`Vitrine — Novos do Mês (${stats.newThisMonth})`} icon={CalendarDays}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[700px] overflow-y-auto pr-1">
                {thisMonthItems.slice(0, 40).map(p => (
                  <a
                    key={p.id}
                    href={p.linkImovel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <ImageWithFallback
                        src={p.imagem}
                        alt={`${p.tipo} - ${p.bairro}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#2ECC71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {p.tipo}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="font-bold text-[#2ECC71] dark:text-[#2ECC71] text-sm">{formatCurrency(p.preco)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{p.bairro} — {p.cidade}</p>
                      {p.areaPrivativa > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{p.areaPrivativa} m² · {formatCurrency(p.preco / p.areaPrivativa)}/m²</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-[#0A4F6E] dark:text-[#3bb8e8] text-[10px] font-medium">
                        <ExternalLink className="w-3 h-3" />
                        Ver anúncio
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Explanation */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-[#E67E22]/30 dark:border-[#E67E22]/40 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#E67E22] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#34495E] dark:text-orange-200">Como funciona?</p>
                  <p className="text-sm text-[#34495E]/80 dark:text-orange-300 mt-1">
                    Imóveis com preço por m² pelo menos 15% abaixo da média do bairro. Quanto maior o desconto, maior o potencial de negociação ou valorização.
                  </p>
                </div>
              </div>
            </div>

            {/* Opportunities as cards with photos */}
            <ChartCard title={`Oportunidades Detectadas (${stats.opportunities.length})`} icon={Lightbulb}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[800px] overflow-y-auto pr-1">
                {stats.opportunities.slice(0, 30).map(p => (
                  <a
                    key={p.id}
                    href={p.linkImovel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-700 hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-600"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={p.imagem}
                        alt={`${p.tipo} - ${p.bairro}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 bg-[#0A4F6E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {p.tipo}
                      </span>
                      <span className="absolute top-2 right-2 bg-[#2ECC71] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{p.discount.toFixed(0)}% R$/m²
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-[#2ECC71] dark:text-[#2ECC71]">{formatCurrency(p.preco)}</p>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-600 rounded px-1.5 py-0.5 text-gray-600 dark:text-gray-300">
                          {p.imobiliaria}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{p.bairro} — {p.cidade}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-green-50 dark:bg-green-900/30 rounded p-1.5 text-center">
                          <p className="text-gray-500 dark:text-gray-400">R$/m² imóvel</p>
                          <p className="font-bold text-[#2ECC71] dark:text-[#2ECC71]">{formatCurrency(p.priceM2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-600/30 rounded p-1.5 text-center">
                          <p className="text-gray-500 dark:text-gray-400">Média bairro</p>
                          <p className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(p.avgM2Bairro)}</p>
                        </div>
                      </div>
                      {p.areaPrivativa > 0 && (
                        <p className="text-[10px] text-gray-400 mt-2">{p.areaPrivativa} m² · {p.quartos > 0 ? `${p.quartos} quartos` : 'Comercial'}</p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-[#0A4F6E] dark:text-[#3bb8e8] text-xs font-medium">
                        <ExternalLink className="w-3 h-3" />
                        Ver anúncio completo
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </ChartCard>

            {/* Opportunities distribution by neighborhood */}
            <ChartCard title="Oportunidades por Bairro" icon={MapPin}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={(() => {
                    const byNeighborhood: Record<string, number> = {};
                    stats.opportunities.forEach(p => {
                      byNeighborhood[p.bairro] = (byNeighborhood[p.bairro] || 0) + 1;
                    });
                    return Object.entries(byNeighborhood)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, oportunidades: value }));
                  })()}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="oportunidades" fill="url(#greenGold)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="greenGold" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2ECC71" />
                      <stop offset="100%" stopColor="#E67E22" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-[#0A4F6E] dark:text-[#3bb8e8]" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      {children}
    </div>
  );
}
