import { useMachineData } from '@/hooks/useMachineData';
import Header from '@/sections/Header';
import KPICards from '@/sections/KPICards';
import MachineGrid from '@/sections/MachineGrid';
import ChartsSection from '@/sections/ChartsSection';
import SystemStatus from '@/sections/SystemStatus';
import { Factory, Globe } from 'lucide-react';

export default function App() {
  const { machines, sites, stats, connectionStatus, lastSync, isSimulating, toggleSimulation } = useMachineData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header
        connectionStatus={connectionStatus}
        lastSync={lastSync}
        isSimulating={isSimulating}
        onToggleSimulation={toggleSimulation}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-factory.jpg"
            alt="Industrial Factory"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="relative z-10 px-6 py-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Factory className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Tableau de Bord Industriel</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Monitoring Multi-Sites <span className="text-gradient">bAcTechFlow</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Surveillance temps réel de l'ensemble du parc machine. Données collectées via Gateway Edge,
                synchronisées vers le serveur Xeon de la salle de contrôle et stockées en base MySQL.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card/60 backdrop-blur border border-cyan-500/20">
                <Globe className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Sites Monde</p>
                  <p className="text-xl font-bold text-cyan-400">{sites.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card/60 backdrop-blur border border-emerald-500/20">
                <Factory className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Usines</p>
                  <p className="text-xl font-bold text-emerald-400">{sites.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <main className="px-6 pb-10 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <KPICards stats={stats} />

        {/* World Map */}
        <section className="animate-fade-in">
          <div className="glass-panel border-cyan-500/10 rounded-xl overflow-hidden">
            <div className="relative">
              <img
                src="/world-map.jpg"
                alt="Carte des sites industriels"
                className="w-full h-64 md:h-80 object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Sites de Production dans le Monde
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sites.map(site => (
                    <div
                      key={site.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 backdrop-blur border border-cyan-500/20 text-sm"
                    >
                      <span className={`w-2 h-2 rounded-full ${site.online === site.machines ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="font-medium">{site.name}</span>
                      <span className="text-muted-foreground text-xs">{site.location}</span>
                      <span className="font-mono text-xs text-cyan-400">{site.online}/{site.machines} machines</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Machine Grid */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <MachineGrid machines={machines} sites={sites} />
        </section>

        {/* Charts Section */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <ChartsSection machines={machines} />
        </section>

        {/* System Status */}
        <section className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <SystemStatus connectionStatus={connectionStatus} lastSync={lastSync} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Factory className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium">bAcTechFlow</span>
            <span className="text-xs text-muted-foreground">| Système de Monitoring Industriel v1.0</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Gateway Edge: {connectionStatus === 'connected' ? 'OK' : connectionStatus === 'degraded' ? 'Dégradé' : 'Hors ligne'}</span>
            <span>|</span>
            <span>Serveur Xeon: {connectionStatus !== 'offline' ? 'Actif' : 'Inaccessible'}</span>
            <span>|</span>
            <span>MySQL: {connectionStatus === 'connected' ? 'Connecté' : 'Buffer local'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
