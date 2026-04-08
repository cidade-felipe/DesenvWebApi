// Program.cs
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Ritmo.Api.Data;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Security;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// =====================================================================
// BUILDER — fase de configuração
// Aqui registramos todos os serviços que a aplicação vai usar.
// =====================================================================
var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Registra os Controllers no sistema de Injeção de Dependência.
// Sem isso, o .NET não sabe que existem Controllers na aplicação.
builder.Services.AddControllers();
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(entry => entry.Value?.Errors.Count > 0)
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value!.Errors.Select(error =>
                    string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "Valor inválido."
                        : error.ErrorMessage).ToArray());

        return new BadRequestObjectResult(new
        {
            mensagem = "Os dados enviados são inválidos.",
            erros = errors
        });
    };
});

// Registra o AppDbContext no sistema de Injeção de Dependência.
// Isso permite que os Controllers recebam o AppDbContext automaticamente
// no construtor (isso é chamado de Injeção de Dependência).
//
// options.UseNpgsql(...) diz ao EF para usar o PostgreSQL como banco.
// builder.Configuration.GetConnectionString("DefaultConnection") lê
// a connection string do appsettings.json.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection não foi configurada. " +
        "Defina esse valor via appsettings local ou variável de ambiente.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtIssuer) ||
    string.IsNullOrWhiteSpace(jwtAudience) ||
    string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "As configurações JWT estão incompletas. Defina Jwt:Issuer, Jwt:Audience e Jwt:Key.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Serviços de Negócio (Desacoplados)
builder.Services.AddScoped<Ritmo.Api.Services.RegistroDiarioService>();
builder.Services.AddScoped<Ritmo.Api.Services.UsuarioService>();
builder.Services.AddScoped<Ritmo.Api.Services.MetaService>();
builder.Services.AddScoped<Ritmo.Api.Services.BiometriaService>();
builder.Services.AddScoped<JwtTokenService>();

// Adiciona o Swagger/OpenAPI — interface web para testar a API.
// AddEndpointsApiExplorer() descobre os endpoints disponíveis.
// AddSwaggerGen() gera a documentação interativa da API.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configura CORS (Cross-Origin Resource Sharing).
// Isso permite que o frontend React (que roda em outra porta)
// faça requisições para a API sem ser bloqueado pelo navegador.
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
    {
        var allowedOrigins = builder.Configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        if (allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException(
                "Nenhuma origem foi configurada em Cors:AllowedOrigins.");
        }

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// =====================================================================
// APP — fase de execução
// Aqui configuramos o pipeline de middlewares (o que acontece com cada
// requisição HTTP antes de chegar no Controller).
// =====================================================================
var app = builder.Build();

app.UseExceptionHandler(exceptionHandler =>
{
    exceptionHandler.Run(async context =>
    {
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;

        if (exception is DomainValidationException domainException)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                mensagem = domainException.Message
            });
            return;
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            mensagem = "Ocorreu um erro interno inesperado."
        });
    });
});

// Ativa o Swagger apenas no ambiente de desenvolvimento.
// Em produção, a documentação seria protegida ou desativada.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Ativa o CORS com a política que definimos acima.
// IMPORTANTE: deve vir ANTES do MapControllers().
app.UseCors("PermitirTudo");
app.UseAuthentication();
app.UseAuthorization();

// Ativa o roteamento de requisições para os Controllers.
// É aqui que o .NET olha para a URL da requisição e decide
// qual Controller e qual método deve ser chamado.
app.MapControllers();

// Inicia a aplicação e fica escutando requisições HTTP.
app.Run();
