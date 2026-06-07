import mqtt from 'mqtt';
import readline from 'readline';

// =====================================================
// CONFIGURATION (via variables d'environnement ou défauts)
// =====================================================
const BROKER_URL = process.env.MQTT_BROKER || 'mqtt://192.168.1.121:1883';
const NB_MACHINES = process.env.NB_MACHINES ? parseInt(process.env.NB_MACHINES) : 10;
const ATELIER = process.env.ATELIER || 'ATELIER01';
const USINE = process.env.USINE || 'USINE01';
const TOPIC = process.env.MQTT_TOPIC || 'bAcTechFlow-DataCenter/telemetry';

// =====================================================
// ÉTAT GLOBAL
// =====================================================
const machines = new Map();     // Map<machineId, {intervalId, stats}>
let client = null;
let isShuttingDown = false;
let globalStats = {
    totalMessagesSent: 0,
    startTime: null,
    lastStatusTime: 0
};

// =====================================================
// 1. CONNEXION MQTT
// =====================================================
function connectMqtt() {
    client = mqtt.connect(BROKER_URL, {
        reconnectPeriod: 5000,      // Reconnexion auto toutes les 5s
        connectTimeout: 10000,       // Timeout connexion 10s
        clean: true,
        clientId: `simulator-${ATELIER}-${Date.now()}`
    });

    client.on('connect', () => {
        console.log(`✅ Connecté au broker MQTT : ${BROKER_URL}`);
        console.log(`   Client ID : ${client.options.clientId}`);
        startAllMachines();
    });

    client.on('reconnect', () => {
        console.log('🔄 Reconnexion au broker MQTT...');
    });

    client.on('offline', () => {
        console.log('🔌 Déconnecté du broker MQTT');
    });

    client.on('error', (err) => {
        console.error('❌ Erreur MQTT:', err.message);
    });

    client.on('close', () => {
        if (!isShuttingDown) {
            console.log('⚠️  Connexion MQTT fermée inopinément');
        }
    });
}

// =====================================================
// 2. SIMULATION D'UNE MACHINE
// =====================================================
function createMachine(machineNumber) {
    const machineId = `${USINE}-${ATELIER}-MACHINE${String(machineNumber).padStart(2, '0')}`;

    // État initial de la machine
    let totalMetersProduced = 12450.0 + (Math.random() * 1000); // Variation initiale
    let currentRpm = 750;
    let currentTemp = 42.5;
    let status = 'RUNNING';
    let anomalyCounter = 0;

    // Statistiques par machine
    const stats = {
        machineId,
        messagesSent: 0,
        startTime: Date.now(),
        lastRpm: currentRpm,
        lastTemp: currentTemp,
        lastProduction: totalMetersProduced
    };
    machines.set(machineId, stats);

    // Intervalle d'émission (1 seconde)
    const intervalId = setInterval(() => {
        if (isShuttingDown) return;

        // Simulation réaliste avec légères variations
        const rpmVariation = (Math.random() - 0.5) * 10; // ±5 RPM
        currentRpm = Math.max(700, Math.min(800, currentRpm + rpmVariation));

        const tempVariation = (Math.random() - 0.5) * 0.5; // ±0.25°C
        currentTemp = Math.max(40, Math.min(48, currentTemp + tempVariation));

        // Production : 0.15 à 0.35 mètres par seconde
        const productionIncrement = 0.15 + Math.random() * 0.2;
        totalMetersProduced += productionIncrement;

        // Simulation occasionnelle d'anomalies (1% de chance)
        if (Math.random() < 0.01) {
            status = Math.random() < 0.5 ? 'WARNING' : 'ERROR';
            anomalyCounter++;
            // Retour à RUNNING après 3 messages
            setTimeout(() => { status = 'RUNNING'; }, 3000);
        }

        const telemetryData = {
            machine_id: machineId,
            timestamp: new Date().toISOString(),
            status: status,
            metrics: {
                motor_rpm: Math.round(currentRpm),
                temperature_celsius: parseFloat(currentTemp.toFixed(1)),
                total_production_meters: parseFloat(totalMetersProduced.toFixed(2))
            },
            // Métadonnées pour le Gateway Edge
            _simulator: {
                atelier: ATELIER,
                usine: USINE,
                machineNumber: machineNumber,
                anomalyCount: anomalyCounter
            }
        };

        // Envoi MQTT
        client.publish(TOPIC, JSON.stringify(telemetryData), { qos: 1 }, (err) => {
            if (err) {
                console.error(`❌ [${machineId}] Échec envoi:`, err.message);
            } else {
                stats.messagesSent++;
                globalStats.totalMessagesSent++;
                stats.lastRpm = currentRpm;
                stats.lastTemp = currentTemp;
                stats.lastProduction = totalMetersProduced;
            }
        });

        // Affichage console (toutes les 10 messages pour éviter le flood)
        if (stats.messagesSent % 10 === 1) {
            console.log(`[${machineId}] rpm:${Math.round(currentRpm)} temp:${currentTemp.toFixed(1)}°C prod:${totalMetersProduced.toFixed(2)}m status:${status}`);
        }

    }, 1000);

    stats.intervalId = intervalId;
    console.log(`🤖 Machine [${machineId}] initialisée | Production initiale: ${totalMetersProduced.toFixed(2)}m`);

    return { machineId, intervalId, stats };
}

// =====================================================
// 3. DÉMARRAGE DE TOUTES LES MACHINES
// =====================================================
function startAllMachines() {
    console.log(`
🚀 Lancement de la simulation : ${NB_MACHINES} machine(s) pour l'${ATELIER}`);
    console.log(`   Usine: ${USINE} | Topic: ${TOPIC}`);
    console.log(`   Appuyez sur 's' pour les statistiques, 'q' pour quitter
`);

    globalStats.startTime = Date.now();

    for (let i = 1; i <= NB_MACHINES; i++) {
        createMachine(i);
    }

    // Statistiques globales toutes les 30 secondes
    setInterval(printGlobalStats, 30000);
}

// =====================================================
// 4. STATISTIQUES
// =====================================================
function printGlobalStats() {
    const elapsed = (Date.now() - globalStats.startTime) / 1000;
    const msgRate = globalStats.totalMessagesSent / elapsed;

    console.log(`
📊 STATISTIQUES GLOBALES (${elapsed.toFixed(0)}s)`);
    console.log(`   Messages totaux envoyés : ${globalStats.totalMessagesSent}`);
    console.log(`   Débit moyen : ${msgRate.toFixed(1)} msg/s`);
    console.log(`   Machines actives : ${machines.size}`);
    console.log(`   ---`);

    machines.forEach((stats, machineId) => {
        const machineElapsed = (Date.now() - stats.startTime) / 1000;
        const machineRate = stats.messagesSent / machineElapsed;
        console.log(`   ${machineId}: ${stats.messagesSent} msg | ${machineRate.toFixed(1)} msg/s | ${stats.lastRpm.toFixed(0)} RPM | ${stats.lastTemp.toFixed(1)}°C | ${stats.lastProduction.toFixed(2)}m`);
    });
    console.log('');
}

function printMachineStatus() {
    console.log(`
📋 ÉTAT DES MACHINES (${ATELIER})`);
    machines.forEach((stats, machineId) => {
        const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(0);
        console.log(`   ${machineId} | ${stats.messagesSent} msg | ${elapsed}s | ${stats.lastRpm.toFixed(0)} RPM | ${stats.lastTemp.toFixed(1)}°C | ${stats.lastProduction.toFixed(2)}m`);
    });
    console.log('');
}

// =====================================================
// 5. ARRÊT PROPRE (GRACEFUL SHUTDOWN)
// =====================================================
function gracefulShutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('🛑 Arrêt de la simulation en cours...');

    // Arrête tous les intervalles
    machines.forEach((stats, machineId) => {
        clearInterval(stats.intervalId);
        console.log(`   ⏹️  Machine ${machineId} arrêtée (${stats.messagesSent} messages envoyés)`);
    });

    // Déconnexion MQTT propre
    if (client && client.connected) {
        client.end(false, {}, () => {
            console.log('   🔌 Déconnecté du broker MQTT');
            console.log(`
✅ Simulation terminée. Total: ${globalStats.totalMessagesSent} messages`);
            process.exit(0);
        });
    } else {
        console.log(`
✅ Simulation terminée. Total: ${globalStats.totalMessagesSent} messages`);
        process.exit(0);
    }

    // Timeout de sécurité (5s)
    setTimeout(() => {
        console.log(`⚠️  Forçage de l'arrêt (timeout)`);
        process.exit(1);
    }, 5000);
}

// =====================================================
// 6. INTERFACE UTILISATEUR (CLI)
// =====================================================
function setupCLI() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Écoute des touches (sans besoin d'appuyer sur Entrée)
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
        // Ctrl+C ou 'q' → Quitter
        if (key === '\u0003' || key === 'q' || key === '\u001b') { // Ctrl+C, q, ou ESC
            gracefulShutdown();
        }
        // 's' → Statistiques
        if (key === 's') {
            printMachineStatus();
        }
        // 'g' → Statistiques globales
        if (key === 'g') {
            printGlobalStats();
        }
        // 'h' → Aide
        if (key === 'h') {
            printHelp();
        }
    });

    rl.close();
}

function printHelp() {
    console.log(`
⌨️  COMMANDES DISPONIBLES :
   s → Statistiques par machine
   g → Statistiques globales
   h → Aide (ce message)
   q / ESC / Ctrl+C → Quitter proprement
`);
}

// =====================================================
// 7. GESTION DES SIGNAUX SYSTÈME
// =====================================================
process.on('SIGINT', gracefulShutdown);   // Ctrl+C
process.on('SIGTERM', gracefulShutdown);  // Kill
process.on('SIGUSR2', gracefulShutdown);  // Nodemon restart

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
    console.error('💥 Erreur non capturée:', err);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 Promise rejetée non gérée:', reason);
});

// =====================================================
// 8. AFFICHAGE DE DÉMARRAGE
// =====================================================
console.log(`
╔══════════════════════════════════════════════════════╗
║     🏭 bAcTechFlow - SIMULATEUR DE MACHINES         ║
╠══════════════════════════════════════════════════════╣
║  Broker MQTT : ${BROKER_URL.padEnd(37)}║
║  Topic       : ${TOPIC.padEnd(37)}║
║  Usine       : ${USINE.padEnd(37)}║
║  Atelier     : ${ATELIER.padEnd(37)}║
║  Machines    : ${String(NB_MACHINES).padEnd(37)}║
╚══════════════════════════════════════════════════════╝
`);

// =====================================================
// 9. DÉMARRAGE
// =====================================================
connectMqtt();
setupCLI();
printHelp();