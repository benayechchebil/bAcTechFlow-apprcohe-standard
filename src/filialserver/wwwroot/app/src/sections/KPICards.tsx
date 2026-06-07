import { Thermometer, Package, AlertTriangle, Power } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KPICardsProps {
  stats: {
    totalMachines: number;
    onlineMachines: number;
    warningMachines: number;
    offlineMachines: number;
    avgTemperature: number;
    totalProduction: number;
  };
}

export default function KPICards({ stats }: KPICardsProps) {
  const onlinePercent = stats.totalMachines > 0 ? Math.round((stats.onlineMachines / stats.totalMachines) * 100) : 0;
  const warningPercent = stats.totalMachines > 0 ? Math.round((stats.warningMachines / stats.totalMachines) * 100) : 0;
  const offlinePercent = stats.totalMachines > 0 ? Math.round((stats.offlineMachines / stats.totalMachines) * 100) : 0;

  const kpis = [
    {
      title: 'Machines Actives',
      value: stats.onlineMachines,
      total: stats.totalMachines,
      percent: onlinePercent,
      icon: Power,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      glowClass: 'glow-green',
    },
    {
      title: 'Température Moyenne',
      value: `${stats.avgTemperature.toFixed(1)}°C`,
      total: null,
      percent: null,
      icon: Thermometer,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      glowClass: 'glow-cyan',
    },
    {
      title: 'Production Totale',
      value: stats.totalProduction.toLocaleString('fr-FR'),
      total: 'unités/h',
      percent: null,
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      glowClass: '',
    },
    {
      title: 'Alertes',
      value: stats.warningMachines + stats.offlineMachines,
      total: null,
      percent: warningPercent + offlinePercent,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      glowClass: stats.warningMachines + stats.offlineMachines > 0 ? 'glow-amber' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.title}
            className={`${kpi.bgColor} ${kpi.borderColor} ${kpi.glowClass} border backdrop-blur-sm animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${kpi.color}`}>
                      {kpi.value}
                    </span>
                    {kpi.total && typeof kpi.total === 'string' && kpi.total !== 'unités/h' && (
                      <span className="text-sm text-muted-foreground">/ {kpi.total}</span>
                    )}
                    {kpi.total === 'unités/h' && (
                      <span className="text-sm text-muted-foreground">{kpi.total}</span>
                    )}
                  </div>
                  {kpi.percent !== null && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            kpi.color === 'text-emerald-400' ? 'bg-emerald-500' :
                            kpi.color === 'text-amber-400' ? 'bg-amber-500' :
                            kpi.color === 'text-cyan-400' ? 'bg-cyan-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${kpi.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{kpi.percent}%</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
