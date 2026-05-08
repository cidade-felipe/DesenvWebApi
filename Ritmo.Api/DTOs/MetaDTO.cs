// DTOs/MetaDTO.cs
using System.ComponentModel.DataAnnotations;

namespace Ritmo.Api.DTOs;

public class MetaDTO : IValidatableObject
{
    public int Id { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "UsuarioId deve ser maior que zero.")]
    public int UsuarioId { get; set; }
    
    // Categoria monitorada (Sono, Agua, Humor, Produtividade, Energia, Treino, Peso)
    [Required(ErrorMessage = "Categoria é obrigatória.")]
    [RegularExpression("^(Sono|Agua|Humor|Produtividade|Energia|Treino|Peso)$", ErrorMessage = "Categoria inválida.")]
    public required string Categoria { get; set; }
    
    // Valor alvo (ex: 8.0 para sono, 3.0 para litros de água)
    public decimal ValorAlvo { get; set; }
    
    // Direção usada principalmente em meta de peso: reduzir, ganhar ou manter.
    [StringLength(20, ErrorMessage = "Direção deve ter no máximo 20 caracteres.")]
    public string? Direcao { get; set; }

    // Valor de partida da meta. Para Peso, é o peso conhecido no momento da criação.
    public decimal? ValorInicial { get; set; }

    [StringLength(300, ErrorMessage = "Descrição deve ter no máximo 300 caracteres.")]
    public string? Descricao { get; set; }
    
    [Required(ErrorMessage = "Data de início é obrigatória.")]
    public DateOnly DataInicio { get; set; }
    public DateOnly? DataFim { get; set; }
    
    public bool Ativa { get; set; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DataFim.HasValue && DataFim.Value < DataInicio)
        {
            yield return new ValidationResult(
                "Data fim não pode ser anterior à data de início.",
                [nameof(DataFim)]);
        }

        var (min, max) = Categoria switch
        {
            "Sono" => (0.5m, 24m),
            "Agua" => (0.1m, 25m),
            "Treino" => (1m, 7m),
            "Peso" => (10m, 600m),
            "Humor" or "Produtividade" or "Energia" => (1m, 5m),
            _ => (0.1m, 100m)
        };

        if (ValorAlvo < min || ValorAlvo > max)
        {
            yield return new ValidationResult(
                $"Valor alvo inválido para a categoria {Categoria}. Faixa permitida: {min} a {max}.",
                [nameof(ValorAlvo)]);
        }

        var direcaoNormalizada = Direcao?.Trim().ToLowerInvariant();
        var direcoesValidas = new[] { "reduzir", "ganhar", "manter" };

        if (Categoria == "Peso" && string.IsNullOrWhiteSpace(direcaoNormalizada))
        {
            yield return new ValidationResult(
                "Informe se a meta de peso é para reduzir, ganhar ou manter.",
                [nameof(Direcao)]);
        }

        if (!string.IsNullOrWhiteSpace(direcaoNormalizada) && !direcoesValidas.Contains(direcaoNormalizada))
        {
            yield return new ValidationResult(
                "Direção inválida. Use reduzir, ganhar ou manter.",
                [nameof(Direcao)]);
        }

        if (ValorInicial.HasValue && (ValorInicial.Value < min || ValorInicial.Value > max))
        {
            yield return new ValidationResult(
                $"Valor inicial inválido para a categoria {Categoria}. Faixa permitida: {min} a {max}.",
                [nameof(ValorInicial)]);
        }
    }
}
