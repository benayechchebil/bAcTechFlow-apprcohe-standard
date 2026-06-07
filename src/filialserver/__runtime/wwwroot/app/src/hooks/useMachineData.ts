import { useState, useEffect, useCallback } from 'react';

export interface MachineData {
  id: string;
  atelier: string;
  machine: string;
  temperature: number;
  rpm: number;
  production: number;
  status: 'online' | 'warning' | 'offline';
  lastUpdate: Date;
}

export interface SiteData {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  machines: number;
  online: number;
  ateliers: string[];
}

const SITES: SiteData[] = [
  { id: 'site-fr', name: 'Usine France', location: 'Lyon, France', lat: 45.76, lng: 4.83, machines: 12, online: 11, ateliers: ['Atelier-A1', 'Atelier-A2'] },
  { id: 'site-de', name: 'Usine Allemagne', location: 'Stuttgart, Allemagne', lat: 48.78, lng: 9.18, machines: 8, online: 8, ateliers: ['Atelier-B1'] },
  { id: 'site-cn', name: 'Usine Chine', location: 'Shanghai, Chine', lat: 31.23, lng: 121.47, machines: 15, online: 14, ateliers: ['Atelier-C1', 'Atelier-C2'] },
  { id: 'site-br', name: 'Usine Brésil', location: 'Sao Paulo, Brésil', lat: -23.55, lng: -46.63, machines: 6, online: 5, ateliers: ['Atelier-A1'] },
  { id: 'site-us', name: 'Usine USA', location: 'Detroit, USA', lat: 42.33, lng: -83.05, machines: 10, online: 9, ateliers: ['Atelier-B1', 'Atelier-C1'] },
];

const MACHINE_TYPES = ['Tour CNC', 'Fraiseuse', 'Presse', 'Robot', 'Laser', 'Injecteur'];

function generateMachineId(atelier: string, index: number): string {
  return `${atelier}-Machine-${String(index + 1).padStart(2, '0')}`;
}

function generateInitialMachines(): MachineData[] {
  const machines: MachineData[] = [];
  SITES.forEach(site => {
    site.ateliers.forEach(atelier => {
      const machineCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < machineCount; i++) {
        const status = Math.random() > 0.9 ? 'warning' : Math.random() > 0.95 ? 'offline' : 'online';
        machines.push({
          id: generateMachineId(atelier, i),
          atelier,
          machine: MACHINE_TYPES[Math.floor(Math.random() * MACHINE_TYPES.length)],
          temperature: status === 'offline' ? 0 : 45 + Math.random() * 55,
          rpm: status === 'offline' ? 0 : 500 + Math.random() * 2500,
          production: status === 'offline' ? 0 : Math.floor(Math.random() * 500) + 100,
          status,
          lastUpdate: new Date(),
        });
      }
    });
  });
  return machines;
}

export function useMachineData() {
  const [machines, setMachines] = useState<MachineData[]>(generateInitialMachines);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'degraded' | 'offline'>('connected');
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState(true);

  const updateMachines = useCallback(() => {
    if (!isSimulating) return;

    setMachines(prev => prev.map(machine => {
      if (machine.status === 'offline') {
        // Randomly bring back online
        if (Math.random() > 0.97) {
          return {
            ...machine,
            status: 'online' as const,
            temperature: 45 + Math.random() * 55,
            rpm: 500 + Math.random() * 2500,
            production: Math.floor(Math.random() * 500) + 100,
            lastUpdate: new Date(),
          };
        }
        return { ...machine, lastUpdate: new Date() };
      }

      // Small chance to go offline
      if (Math.random() > 0.995) {
        return { ...machine, status: 'offline' as const, temperature: 0, rpm: 0, production: 0, lastUpdate: new Date() };
      }

      // Small chance to go warning
      if (machine.status === 'online' && Math.random() > 0.99) {
        return { ...machine, status: 'warning' as const, lastUpdate: new Date() };
      }

      // Normal fluctuations
      const tempChange = (Math.random() - 0.5) * 3;
      const rpmChange = (Math.random() - 0.5) * 100;
      const prodChange = Math.floor((Math.random() - 0.3) * 10);

      const newTemp = Math.max(20, Math.min(120, machine.temperature + tempChange));
      const newRpm = Math.max(0, Math.min(3500, machine.rpm + rpmChange));

      // Auto-resolve warning if temp drops
      const newStatus = newTemp > 95 ? 'warning' as const : 'online' as const;

      return {
        ...machine,
        temperature: parseFloat(newTemp.toFixed(1)),
        rpm: Math.round(newRpm),
        production: Math.max(0, machine.production + prodChange),
        status: newStatus,
        lastUpdate: new Date(),
      };
    }));

    // Update connection status simulation
    const rand = Math.random();
    if (rand > 0.995) setConnectionStatus('offline');
    else if (rand > 0.98) setConnectionStatus('degraded');
    else setConnectionStatus('connected');

    setLastSync(new Date());
  }, [isSimulating]);

  useEffect(() => {
    const interval = setInterval(updateMachines, 2000);
    return () => clearInterval(interval);
  }, [updateMachines]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
  }, []);

  const stats = {
    totalMachines: machines.length,
    onlineMachines: machines.filter(m => m.status === 'online').length,
    warningMachines: machines.filter(m => m.status === 'warning').length,
    offlineMachines: machines.filter(m => m.status === 'offline').length,
    avgTemperature: machines.filter(m => m.status !== 'offline').reduce((acc, m) => acc + m.temperature, 0) / (machines.filter(m => m.status !== 'offline').length || 1),
    totalProduction: machines.reduce((acc, m) => acc + m.production, 0),
  };

  return {
    machines,
    sites: SITES,
    stats,
    connectionStatus,
    lastSync,
    isSimulating,
    toggleSimulation,
  };
}
