// DTOs/MetaDTO.cs

namespace Ritmo.Api.DTOs;

public class MetaDTO
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    
    // Categoria monitorada (Sono, Agua, Humor, Produtividade, Energia, Treino)
    public required string Categoria { get; set; }
    
    // Valor alvo (ex: 8.0 para sono, 3.0 para litros de água)
    public decimal ValorAlvo { get; set; }
    
    public string? Descricao { get; set; }
    
    public DateOnly DataInicio { get; set; }
    public DateOnly? DataFim { get; set; }
    
    public bool Ativa { get; set; } = true;
}
