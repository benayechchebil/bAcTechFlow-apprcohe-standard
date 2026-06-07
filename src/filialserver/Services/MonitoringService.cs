using bAcTechFlow.Shared.Protos;
using Grpc.Core;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace bAcTechFlow.FilialeServer.Services
{
    // Héritage de la classe générée par votre fichier .proto
    public class MonitoringService : MonitoringStation.MonitoringStationBase
    {
        private readonly IMongoCollection<BsonDocument> _history;
        private readonly ILogger<MonitoringService> _logger;
        private readonly IHubContext<MonitoringHub> _hubContext;

        //public MonitoringService(IHubContext<MonitoringHub> hubContext, ILogger<MonitoringService> logger)
        //{
        //    _hubContext = hubContext;
        //    _logger = logger;

        //    // Connexion à l'instance MongoDB locale de la filiale
        //    var client = new MongoClient("mongodb://database:27017");
        //    var db = client.GetDatabase("bAcTechFlow_DB");
        //    _history = db.GetCollection<BsonDocument>("MachineLogs");
        //}

        public override async Task<MesureResponse> EnvoyerMesure(MesureRequest request, ServerCallContext context)
        {
            // Reconstitution de l'identifiant unique standardisé pour bAcTechFlow
            string machineId = $"{request.Machine}";

            // 1. Archivage local dans MongoDB (Idéal pour le stockage NoSQL rapide au format document)
            var doc = new BsonDocument
            {
                { "machine_id", machineId },
                { "status", request.Etat },
                { "motor_rpm", request.ValeurR },          // On mappe le Débit (valeurR) sur les RPM
                { "temperature_celsius", request.ValeurT }, // On mappe la Température (valeurT)
                { "total_production_meters", request.ValeurP }, // On mappe la Production (valeurP)
                { "ts", DateTime.UtcNow }
            };

            await _history.InsertOneAsync(doc);

            // 2. Diffusion instantanée en temps réel via SignalR vers les IHM de la salle de contrôle
            try
            {
                await _hubContext.Clients.All.SendAsync("ReceiveData", new
                {
                    machine = machineId,
                    temperature = request.ValeurT,
                    rpm = request.ValeurR,
                    production = request.ValeurP,
                    etat = request.Etat,
                    time = DateTime.Now.ToString("HH:mm:ss")
                });

                _logger.LogInformation("[SignalR] Diffusion temps réel réussie pour {Machine}.", machineId);
            }
            catch (Exception ex)
            {
                _logger.LogError("[SignalR] ❌ ERREUR de diffusion : {Message}", ex.Message);
            }

            // ici on implemante la partie de la logique métier pour traiter les données reçues, par exemple :
            // sauvegarder dans une base de données, effectuer des calculs, etc.

            return new MesureResponse { Succes = true };
        }
    }


}