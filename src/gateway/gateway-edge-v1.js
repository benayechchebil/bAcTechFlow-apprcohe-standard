import mqtt from 'mqtt';

// =====================================================
// CONFIGURATION : IP du serveur Xeon
const XEON_URL = 'http://192.168.1.110:8080/api/telemetry';
// =====================================================

// 1. Connexion au Broker MQTT
const mqttClient = mqtt.connect('mqtt://localhost:1883');
const TOPIC_TELEMETRY = 'bAcTechFlow-DataCenter/telemetry';

mqttClient.on('connect', () => {
    console.log('⚡ Passerelle Edge Atelier connectée au Broker MQTT.');

    mqttClient.subscribe(TOPIC_TELEMETRY, (err) => {
        if (!err) {
            console.log(`📥 Abonnement réussi au topic : ${TOPIC_TELEMETRY}`);
        } else {
            console.error("Erreur d'abonnement :", err);
        }
    });
});

// 2. Interception des messages MQTT + envoi HTTP vers le Xeon
mqttClient.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        const machine_id             = data.machine_id;
        const status                 = data.status;
        const motor_rpm              = data.metrics.motor_rpm;
        const temperature_celsius    = data.metrics.temperature_celsius;
        const total_production_meters = data.metrics.total_production_meters;

        // Affichage console (comme avant)
        console.log(`machine: ${machine_id} rpm: ${motor_rpm} température: ${temperature_celsius} total production: ${total_production_meters} état: ${status}`);

        // AJOUT : Envoi HTTP POST vers le serveur Xeon
        const response = await fetch(XEON_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                machineId:             machine_id,
                status:                status,
                motorRpm:              motor_rpm,
                temperatureCelsius:    temperature_celsius,
                totalProductionMeters: total_production_meters
            })
        });

        if (!response.ok) {
            console.error(`❌ Erreur HTTP vers Xeon : ${response.status}`);
        }

    } catch (error) {
        console.error("❌ Erreur lors du traitement ou de l'envoi :", error);
    }
});
