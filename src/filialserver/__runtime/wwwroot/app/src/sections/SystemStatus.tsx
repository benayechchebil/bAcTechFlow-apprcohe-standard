import { useState, useEffect } from 'react';
import { Server, Wifi, Database, HardDrive, Activity, ArrowRight, Globe, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SystemStatusProps {
  connectionStatus: 'connected' | 'degraded' | 'offline';
  lastSync: Date;
}

interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export default function SystemStatus({ connectionStatus, lastSync }: SystemStatusProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serverUptime] = useState(99.97);
  const [dbStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [edgeStorage, setEdgeStorage] = useState({ used: 234, total: 1024 });

  useEffect(() => {
    const newLog: LogEntry = {
      id: Date.now(),
      timestamp: new Date(),
      level: connectionStatus === 'offline' ? 'error' : connectionStatus === 'degraded' ? 'warning' : 'info',
      message: connectionStatus === 'offline'
        ? 'Connexion perdue avec le serveur Xeon - Mode buffer local activé'
        : connectionStatus === 'degraded'
        ? 'Latence élevée détectée - Synchronisation différée'
        : `Données synchronisées vers MySQL | ${lastSync.toLocaleTimeString('fr-FR')}`,
      source: connectionStatus === 'offline' ? 'Gateway Edge' : 'Serveur Contrôle',
    };

    setLogs(prev => [newLog, ...prev].slice(0, 6));
  }, [connectionStatus, lastSync]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEdgeStorage(prev => ({
        used: Math.min(prev.total, prev.used + (Math.random() > 0.8 ? 1 : 0)),
        total: prev.total,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const connectionFlow = [
    { id: 'machines', name: 'Machines (Surface/Lenovo)', icon: Activity, status: 'active', details: '2 simulateurs actifs' },
    { id: 'edge', name: 'Gateway Edge', icon: Wifi, status: connectionStatus === 'offline' ? 'error' : connectionStatus === 'degraded' ? 'warning' : 'active', details: 'Raspberry Pi / Gateway' },
    { id: 'server', name: 'Serveur Xeon', icon: Server, status: connectionStatus === 'offline' ? 'inactive' : 'active', details: 'Salle de Contrôle' },
    { id: 'database', name: 'MySQL Database', icon: Database, status: dbStatus, details: 'Stockage centralisé' },
    { id: 'dashboard', name: 'Tableau de Bord Web', icon: Globe, status: 'active', details: 'Interface monitoring' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'inactive': return 'text-muted-foreground bg-secondary border-border';
      default: return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500 glow-green';
      case 'warning': return 'bg-amber-500 glow-amber';
      case 'error': return 'bg-red-500 glow-red';
      case 'inactive': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'warning': return 'text-amber-400 bg-amber-500/10';
      default: return 'text-cyan-400 bg-cyan-500/10';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Architecture Flow */}
      <Card className="glass-panel border-cyan-500/10">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Architecture Edge-to-Cloud
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {connectionFlow.map((node, index) => {
              const Icon = node.icon;
              return (
                <div key={node.id}>
                  <div className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(node.status)} transition-all duration-300`}>
                    <div className="relative">
                      <div className={`p-2 rounded-lg ${getStatusColor(node.status).split(' ').slice(1).join(' ')}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${getStatusDot(node.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{node.name}</p>
                      <p className="text-xs text-muted-foreground">{node.details}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${getStatusColor(node.status)}`}>
                      {node.status}
                    </div>
                  </div>
                  {index < connectionFlow.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ArrowRight className="w-4 h-4 text-cyan-500/40 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Logs & Storage */}
      <div className="space-y-4">
        {/* Edge Storage */}
        <Card className="glass-panel border-cyan-500/10">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              Stockage Gateway Edge
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Espace utilisé</span>
                <span className="font-mono text-cyan-400">{edgeStorage.used} MB / {edgeStorage.total} MB</span>
              </div>
              <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${(edgeStorage.used / edgeStorage.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {connectionStatus === 'offline'
                  ? 'Mode buffer actif - Données stockées localement en attente de reconnexion'
                  : 'Synchronisation temps réel avec le serveur MySQL'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Disponibilité Serveur</p>
                <p className="text-2xl font-bold text-emerald-400">{serverUptime}%</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Buffer Local</p>
                <p className="text-2xl font-bold text-cyan-400">{connectionStatus === 'offline' ? 'Actif' : 'Inactif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="glass-panel border-cyan-500/10">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Journal des Événements
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun événement</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 border border-border/30">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${getLogColor(log.level)}`}>
                      {log.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground truncate">{log.message}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{log.source}</span>
                        <span className="text-[10px] text-muted-foreground">|</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {log.timestamp.toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
