//namespace bAcTechFlow.FilialeServer.Services
//{
//    public class MoniotoringHub
//    {
//    }
//}

using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace bAcTechFlow.FilialeServer.Services
{
    public class MonitoringHub : Hub
    {
        // Cette méthode peut être appelée par les clients (ex: pour s'abonner à un atelier spécifique)
        public async Task JoinAtelierGroup(string atelierId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, atelierId);
        }
    }



}