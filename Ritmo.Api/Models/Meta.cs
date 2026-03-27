// Models/Meta.cs

namespace Ritmo.Api.Models;

// Representa uma meta que o usuário define para si mesmo.
// Exemplos:
//   - "Dormir pelo menos 7 horas por dia"
//   - "Estudar ao menos 3 horas por dia"
//   - "Manter humor acima de 3"
//
// O frontend usa as metas para comprar o desempenho real (RegistroDiario)
// contra o alvo definido pelo usuário — base do dashboard analítico.
public class Meta
{
    public int Id { get; set; }

    // Qual usuário criou esta meta.
    public int UsuarioId { get; set; }

    // Categoria da meta — indica qual campo do RegistroDiario esta meta monitora.
    // Valores esperados: "Sono", "Estudo", "Humor", "Produtividade", "Energia", "Agua"
    // Usamos string para flexibilidade (evita migrações ao adicionar categorias).
    public required string Categoria { get; set; }

    // Valor alvo da meta (ex: 7.5 para 7h30 de sono, 3 para humor ≥ 3).
    public decimal ValorAlvo { get; set; }

    // Descrição livre da meta (opcional).
    // Exemplos: "Dormir cedo para melhorar o humor", "Estudar todos os dias"
    public string? Descricao { get; set; }

    // Período da meta.
    public DateOnly DataInicio { get; set; }

    // DataFim null = meta contínua (sem prazo definido).
    public DateOnly? DataFim { get; set; }

    // Indica se a meta está ativa. O usuário pode desativar sem deletar.
    public bool Ativa { get; set; } = true;

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Propriedade de navegação.
    public Usuario? Usuario { get; set; }
}
