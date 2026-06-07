import { useState } from 'react';
import { Thermometer, Gauge, Package, Power, AlertTriangle, Clock, ChevronDown, ChevronUp, MapPin, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MachineData, SiteData } from '@/hooks/useMachineData';

interface MachineGridProps {
  machines: MachineData[];
  sites: SiteData[];
}

export default function MachineGrid({ machines, sites }: MachineGridProps) {
  const [expandedAteliers, setExpandedAteliers] = useState<Set<string>>(new Set());
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  const toggleAtelier = (atelier: string) => {
    setExpandedAteliers(prev => {
      const next = new Set(prev);
      if (next.has(atelier)) next.delete(atelier);
      else next.add(atelier);
      return next;
    });
  };

  const filteredSites = selectedSite ? sites.filter(s => s.id === selectedSite) : sites;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">
          <Power className="w-3 h-3 mr-1" /> En ligne
        </Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" /> Alerte
        </Badge>;
      case 'offline':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
          <Power className="w-3 h-3 mr-1" /> Hors ligne
        </Badge>;
      default:
        return null;
    }
  };

  const getTempColor = (temp: number, status: string) => {
    if (status === 'offline') return 'text-muted-foreground';
    if (temp > 90) return 'text-red-400';
    if (temp > 70) return 'text-amber-400';
    return 'text-cyan-400';
  };

  const getRpmColor = (rpm: number, status: string) => {
    if (status === 'offline') return 'text-muted-foreground';
    if (rpm > 2800) return 'text-amber-400';
    return 'text-blue-400';
  };

  return (
    <Card className="glass-panel border-cyan-500/10">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Machines par Atelier
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {machines.filter(m => m.status === 'online').length} / {machines.length} machines actives
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSite === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSite(null)}
              className={selectedSite === null ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-cyan-500/30'}
            >
              Tous
            </Button>
            {sites.map(site => (
              <Button
                key={site.id}
                variant={selectedSite === site.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSite(site.id === selectedSite ? null : site.id)}
                className={selectedSite === site.id ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-cyan-500/30'}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {site.name.replace('Usine ', '')}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredSites.map(site => {
          const siteMachines = machines.filter(m => site.ateliers.includes(m.atelier));
          const ateliersInSite = [...new Set(siteMachines.map(m => m.atelier))];

          return ateliersInSite.map(atelier => {
            const atelierMachines = siteMachines.filter(m => m.atelier === atelier);
            const isExpanded = expandedAteliers.has(atelier);
            const onlineCount = atelierMachines.filter(m => m.status === 'online').length;

            return (
              <div key={`${site.id}-${atelier}`} className="border border-border/50 rounded-lg overflow-hidden">
                {/* Atelier Header */}
                <button
                  onClick={() => toggleAtelier(atelier)}
                  className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
                    <div className="text-left">
                      <span className="font-semibold text-sm">{atelier}</span>
                      <span className="text-xs text-muted-foreground ml-2">({site.name})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="status-dot status-online" />
                      <span className="text-xs text-emerald-400">{onlineCount}/{atelierMachines.length}</span>
                    </div>
                  </div>
                </button>

                {/* Machines Grid */}
                {isExpanded && (
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {atelierMachines.map(machine => (
                      <div
                        key={machine.id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          machine.status === 'online' ? 'border-emerald-500/20 bg-emerald-500/5' :
                          machine.status === 'warning' ? 'border-amber-500/20 bg-amber-500/5' :
                          'border-red-500/20 bg-red-500/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-mono text-xs text-muted-foreground">{machine.id}</p>
                            <p className="text-sm font-medium">{machine.machine}</p>
                          </div>
                          {getStatusBadge(machine.status)}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div className="flex flex-col items-center p-2 rounded bg-background/50">
                            <Thermometer className={`w-4 h-4 mb-1 ${getTempColor(machine.temperature, machine.status)}`} />
                            <span className={`text-sm font-mono font-semibold ${getTempColor(machine.temperature, machine.status)}`}>
                              {machine.status === 'offline' ? '--' : `${machine.temperature.toFixed(1)}°C`}
                            </span>
                            <span className="text-[10px] text-muted-foreground">Temp.</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded bg-background/50">
                            <Gauge className={`w-4 h-4 mb-1 ${getRpmColor(machine.rpm, machine.status)}`} />
                            <span className={`text-sm font-mono font-semibold ${getRpmColor(machine.rpm, machine.status)}`}>
                              {machine.status === 'offline' ? '--' : machine.rpm}
                            </span>
                            <span className="text-[10px] text-muted-foreground">RPM</span>
                          </div>
                          <div className="flex flex-col items-center p-2 rounded bg-background/50">
                            <Package className={`w-4 h-4 mb-1 ${machine.status === 'offline' ? 'text-muted-foreground' : 'text-blue-400'}`} />
                            <span className={`text-sm font-mono font-semibold ${machine.status === 'offline' ? 'text-muted-foreground' : 'text-blue-400'}`}>
                              {machine.status === 'offline' ? '--' : machine.production}
                            </span>
                            <span className="text-[10px] text-muted-foreground">Prod.</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{machine.lastUpdate.toLocaleTimeString('fr-FR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          });
        })}
      </CardContent>
    </Card>
  );
}

