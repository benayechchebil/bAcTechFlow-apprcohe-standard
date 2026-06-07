using bAcTechFlow.FilialeServer.Services;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// Configuration des ports de Kestrel
builder.WebHost.ConfigureKestrel(options =>
{
    // Port 8080 pour SignalR, l'IHM Web et l'API REST classique
    options.ListenAnyIP(8080, o => o.Protocols = HttpProtocols.Http1);

    // Port 8081 pour la réception des flux gRPC rapides du collecteur
    options.ListenAnyIP(8081, o => o.Protocols = HttpProtocols.Http2);
});

// 1. Enregistrement des Services
builder.Services.AddSignalR();
builder.Services.AddGrpc();
builder.Services.AddCors();
builder.Services.AddControllers(); // AJOUT : pour le endpoint REST

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDashboard", policy =>
    {
        policy.AllowAnyOrigin()           // Ou .WithOrigins("http://localhost:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});






var app = builder.Build();

// 2. Configuration du Pipeline HTTP (L'ordre reste CRITIQUE)

// Configuration CORS indispensable pour que les scripts JS extérieurs puissent se connecter
app.UseCors(policy => policy
    .SetIsOriginAllowed(_ => true)
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials());
app.UseRouting();

// 3. Cartographie des Endpoints et Hubs
app.UseStaticFiles();

// Utilisez CORS avant les hubs
app.UseCors("AllowDashboard");


// Route SignalR
app.MapHub<MonitoringHub>("/monitoringHub");

// Route gRPC (on la garde, on ne touche pas)
app.MapGrpcService<MonitoringService>();

// AJOUT : Route REST pour recevoir les données du collecteur Mint
app.MapControllers();

app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html; charset=utf-8";
    await context.Response.SendFileAsync("wwwroot/dashboard-v3.html");
});

app.Run();