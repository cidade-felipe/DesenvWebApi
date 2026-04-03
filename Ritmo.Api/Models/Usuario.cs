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

    // Altura em centímetros (ex: 175)
    public int? Altura { get; set; }

    // Propriedades de navegação — relações 1:N.
    public ICollection<RegistroDiario> RegistrosDiarios { get; set; } = new List<RegistroDiario>();
    public ICollection<Meta> Metas { get; set; } = new List<Meta>();
    public ICollection<Insight> Insights { get; set; } = new List<Insight>();
    public ICollection<RegistroPeso> RegistrosPeso { get; set; } = new List<RegistroPeso>();

    // Relação 1:1 com as configurações de perfil
    public ConfiguracaoPerfil? ConfiguracaoPerfil { get; set; }
}
