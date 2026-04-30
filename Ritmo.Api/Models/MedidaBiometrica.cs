using System.Text.Json.Serialization;

namespace Ritmo.Api.Models;

// Representa uma medida do corpo do usuário em um dado momento.
// Unifica Peso e Altura para facilitar histórico e cálculo de IMC.
public class MedidaBiometrica
{
    public int Id { get; set; }

    // Chave estrangeira para o Usuário
    public int UsuarioId { get; set; }

    // O peso registrado em kg (ex: 85.5)
    public decimal Peso { get; set; }

    // A altura registrada em centímetros (ex: 175)
    public int Altura { get; set; }

    // Data do registro da medida
    public DateTime Data { get; set; } = DateTime.UtcNow;

    // Dia da medição (computado no banco a partir de Data) para garantir unicidade por usuário/dia.
    public DateOnly DataDia { get; private set; }

    // Propriedade de navegação
    [JsonIgnore]
    public Usuario? Usuario { get; set; }
}
