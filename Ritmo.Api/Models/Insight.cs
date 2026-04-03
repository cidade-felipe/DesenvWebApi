// Models/Insight.cs

namespace Ritmo.Api.Models;

// Representa um insight gerado automaticamente pelo sistema para um usuário.
// Exemplos de mensagens:
//   - "Você foi mais produtivo nas quartas e quintas"
//   - "Seu humor cai quando você dorme menos de 6h"
//   - "Você estudou mais esta semana do que na anterior"
//
// O backend calcula esses insights com base nos RegistrosDiarios e os persiste.
// O frontend apenas busca e exibe — não precisa calcular nada.
public class Insight
{
    public int Id { get; set; }

    // Qual usuário este insight pertence.
    public int UsuarioId { get; set; }

    // A mensagem do insight — texto pronto para exibir no dashboard.
    public required string Mensagem { get; set; }

    // Categoria do insight — ajuda o frontend a filtrar ou agrupar.
    // Exemplos: "Produtividade", "Sono", "Humor", "Estudo", "Geral"
    public required string Categoria { get; set; }

    // Nível de relevância do insight: "info", "positivo", "atencao"
    // "info"     → neutro/informativo
    // "positivo" → parabéns, melhora detectada
    // "atencao"  → tendência negativa detectada
    public string Nivel { get; set; } = "info";

    // Data e hora em que o insight foi gerado.
    public DateTime DataGeracao { get; set; } = DateTime.UtcNow;

    // Se false, o usuário já viu/dispensou o insight.
    public bool Lido { get; set; } = false;

    // Propriedade de navegação.
    public Usuario? Usuario { get; set; }
}
