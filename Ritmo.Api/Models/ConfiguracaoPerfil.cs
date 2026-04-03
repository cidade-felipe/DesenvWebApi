using System.Text.Json.Serialization;

namespace Ritmo.Api.Models;

public class ConfiguracaoPerfil
{
    public int Id { get; set; }

    // Chave estrangeira única que garante o 1:1
    public int UsuarioId { get; set; }

    // Opções de Interface
    public bool TemaEscuro { get; set; } = true;
    public string Idioma { get; set; } = "pt-BR";
    public string FusoHorario { get; set; } = "America/Sao_Paulo";

    // Opções de Visibilidade no Dashboard
    public bool ExibirMetaNoDashboard { get; set; } = true;

    // Opções de Comunicação
    public bool ReceberNotificacoes { get; set; } = true;
    public bool ReceberRelatorioSemanal { get; set; } = true;

    // Navegação (Ignorada na serialização JSON para evitar loops)
    [JsonIgnore]
    public Usuario? Usuario { get; set; }
}
