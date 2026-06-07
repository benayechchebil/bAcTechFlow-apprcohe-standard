using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace bAcTechFlow.FilialeServer.Services
{
    [ApiController]
    [Route("api/[controller]")]
    public class TelemetryController : ControllerBase
    {
        private readonly IHubContext<MonitoringHub> _hubContext;
        private readonly ILogger<TelemetryController> _logger;

        public TelemetryController(IHubContext<MonitoringHub> hubContext, ILogger<TelemetryController> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        // POST api/telemetry
        // C'est ici que le collecteur Mint envoie ses données via HTTP POST
        [HttpPost]
        public async Task<IActionResult> ReceiveData([FromBody] TelemetryPayload payload)
        {
            if (payload == null || string.IsNullOrEmpty(payload.MachineId))
                return BadRequest("Payload invalide.");

            // Diffusion immédiate vers tous les clients HTML via SignalR
            await _hubContext.Clients.All.SendAsync("ReceiveData", new
            {
                machine     = payload.MachineId,
                rpm         = payload.MotorRpm,  
                temperature = payload.TemperatureCelsius,
                production  = payload.TotalProductionMeters,
                etat        = payload.Status,
                time        = DateTime.Now.ToString("HH:mm:ss")
            });

            _logger.LogInformation("[REST] Télémétrie reçue et diffusée pour {Machine}", payload.MachineId);

            return Ok(new { success = true });
        }
    }

    // Modèle de données attendu depuis le collecteur JS
    public class TelemetryPayload
    {
        public string  MachineId              { get; set; } = "";
        public string  Status                 { get; set; } = "RUNNING";
        public double  MotorRpm               { get; set; }
        public double  TemperatureCelsius     { get; set; }
        public double  TotalProductionMeters  { get; set; }
    }
}
