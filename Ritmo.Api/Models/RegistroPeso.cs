using System.Text.Json.Serialization;

namespace Ritmo.Api.Models;

// Representa um registro de peso do usuário para histórico e cálculo de IMC.
public class RegistroPeso
{
    public int Id { get; set; }

    // Chave estrangeira para o Usuário
    public int UsuarioId { get; set; }

    // O peso registrado em kg (ex: 85.5)
    public decimal Valor { get; set; }

    // Data do registro do peso
    public DateTime Data { get; set; } = DateTime.UtcNow;

    // Propriedade de navegação
    [JsonIgnore]
    public Usuario? Usuario { get; set; }
}
