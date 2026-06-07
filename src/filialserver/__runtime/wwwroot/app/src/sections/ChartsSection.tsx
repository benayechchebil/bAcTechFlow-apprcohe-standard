import { useMemo } from 'react';
import { TrendingUp, BarChart3, Thermometer, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import type { MachineData } from '@/hooks/useMachineData';

interface ChartsSectionProps {
  machines: MachineData[];
}

interface ChartDataPoint {
  name: string;
  temperature: number;
  rpm: number;
  production: number;
  atelier: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card/95 backdrop-blur border border-cyan-500/20 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-medium mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-semibold" style={{ color: entry.color }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function ChartsSection({ machines }: ChartsSectionProps) {
  const activeMachines = useMemo(() => machines.filter(m => m.status !== 'offline'), [machines]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    return activeMachines.slice(0, 12).map(m => ({
      name: m.id.split('-').slice(-2).join('-'),
      temperature: parseFloat(m.temperature.toFixed(1)),
      rpm: m.rpm,
      production: m.production,
      atelier: m.atelier,
    }));
  }, [activeMachines]);

  const atelierStats = useMemo(() => {
    const stats: Record<string, { temp: number; count: number; production: number; rpm: number }> = {};
    activeMachines.forEach(m => {
      if (!stats[m.atelier]) {
        stats[m.atelier] = { temp: 0, count: 0, production: 0, rpm: 0 };
      }
      stats[m.atelier].temp += m.temperature;
      stats[m.atelier].production += m.production;
      stats[m.atelier].rpm += m.rpm;
      stats[m.atelier].count++;
    });
    return Object.entries(stats).map(([name, data]) => ({
      name: name.replace('Atelier-', 'A-'),
      temperature: parseFloat((data.temp / data.count).toFixed(1)),
      production: data.production,
      rpm: Math.round(data.rpm / data.count),
    }));
  }, [activeMachines]);

  return (
    <Card className="glass-panel border-cyan-500/10">
      <CardHeader className="pb-2">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Analyses et Tendances
        </h2>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="temperature" className="w-full">
          <TabsList className="bg-secondary/50 border border-border mb-4">
            <TabsTrigger value="temperature" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Thermometer className="w-4 h-4 mr-1" />
              Température
            </TabsTrigger>
            <TabsTrigger value="rpm" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <Gauge className="w-4 h-4 mr-1" />
              RPM
            </TabsTrigger>
            <TabsTrigger value="production" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-1" />
              Production
            </TabsTrigger>
          </TabsList>

          <TabsContent value="temperature" className="mt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(148,163,184,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(148,163,184,0.4)" fontSize={11} tickLine={false} domain={[0, 120]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Température (°C)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    dot={{ fill: '#06b6d4', r: 4 }}
                    activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="rpm" className="mt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(148,163,184,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(148,163,184,0.4)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="rpm"
                    name="RPM"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="production" className="mt-0">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atelierStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(148,163,184,0.4)" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgba(148,163,184,0.4)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="production" name="Production (unités/h)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="temperature" name="Temp. Moyenne (°C)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
