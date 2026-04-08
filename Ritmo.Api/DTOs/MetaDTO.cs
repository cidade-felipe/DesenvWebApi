// DTOs/MetaDTO.cs
using System.ComponentModel.DataAnnotations;

namespace Ritmo.Api.DTOs;

public class MetaDTO
{
    public int Id { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "UsuarioId deve ser maior que zero.")]
    public int UsuarioId { get; set; }
    
    // Categoria monitorada (Sono, Agua, Humor, Produtividade, Energia, Treino)
    [Required(ErrorMessage = "Categoria é obrigatória.")]
    [RegularExpression("^(Sono|Agua|Humor|Produtividade|Energia|Treino)$", ErrorMessage = "Categoria inválida.")]
    public required string Categoria { get; set; }
    
    // Valor alvo (ex: 8.0 para sono, 3.0 para litros de água)
    [Range(typeof(decimal), "0.1", "100", ErrorMessage = "Valor alvo deve estar entre 0.1 e 100.")]
    public decimal ValorAlvo { get; set; }
    
    [StringLength(300, ErrorMessage = "Descrição deve ter no máximo 300 caracteres.")]
    public string? Descricao { get; set; }
    
    [Required(ErrorMessage = "Data de início é obrigatória.")]
    public DateOnly DataInicio { get; set; }
    public DateOnly? DataFim { get; set; }
    
    public bool Ativa { get; set; } = true;
}
