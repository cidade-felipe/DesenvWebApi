// Models/Usuario.cs

namespace Ritmo.Api.Models;

// Representa um usuário do sistema Ritmo.
// Tabela no banco: "Usuarios"
public class Usuario
{
    public int Id { get; set; }

    // Nome completo do usuário.
    public required string Nome { get; set; }

    // Email único — usado para login.
    public required string Email { get; set; }

    // Senha armazenada como hash (nunca em texto puro).
    // Por ora usamos string simples; na etapa de autenticação
    // será substituída por hash (ex: BCrypt).
    public required string Senha { get; set; }

    // Data de criação da conta.
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Propriedade de navegação — um usuário tem muitos registros diários.
    // O EF usa isso para montar JOINs automaticamente.
    public ICollection<RegistroDiario> RegistrosDiarios { get; set; } = new List<RegistroDiario>();
}
