import { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, Play, Pause, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  connectionStatus: 'connected' | 'degraded' | 'offline';
  lastSync: Date;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export default function Header({ connectionStatus, lastSync, isSimulating, onToggleSimulation }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusConfig = {
    connected: { icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Connecté', dot: 'status-online' },
    degraded: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Dégradé', dot: 'status-warning' },
    offline: { icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Hors ligne', dot: 'status-offline' },
  };

  const status = statusConfig[connectionStatus];
  const StatusIcon = status.icon;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-cyan-500/20 blur-sm -z-10" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient tracking-tight">bAcTechFlow</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Système de Monitoring Industriel</p>
          </div>
        </div>

        {/* Center - Connection Status */}
        <div className="hidden md:flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${status.bg} border border-${connectionStatus === 'connected' ? 'emerald' : connectionStatus === 'degraded' ? 'amber' : 'red'}-500/20`}>
            <span className={`status-dot ${status.dot}`} />
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
            <span className="text-xs text-muted-foreground ml-2">|</span>
            <span className="text-xs text-muted-foreground">Gateway Edge: {connectionStatus === 'connected' ? 'OK' : connectionStatus === 'degraded' ? 'Latence élevée' : 'Déconnecté'}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-mono text-cyan-400">{currentTime.toLocaleTimeString('fr-FR')}</span>
          </div>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Dernière synchro:</span>
            <span className="font-mono text-cyan-400">{lastSync.toLocaleTimeString('fr-FR')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSimulation}
            className={`border-cyan-500/30 ${isSimulating ? 'bg-cyan-500/10 text-cyan-400' : 'text-muted-foreground'}`}
          >
            {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isSimulating ? 'Pause' : 'Play'}
          </Button>
        </div>
      </div>
    </header>
  );
}
