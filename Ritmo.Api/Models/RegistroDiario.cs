// Models/RegistroDiario.cs

namespace Ritmo.Api.Models;

// Representa um registro diário de dados de vida do usuário.
// Tabela no banco: "RegistrosDiarios"
//
// Cada linha da tabela corresponde a UM dia de UM usuário.
// A chave composta natural seria (UsuarioId + Data), mas usamos
// um Id inteiro para simplicidade de rotas REST.
public class RegistroDiario
{
    public int Id { get; set; }

    // Chave estrangeira — qual usuário fez este registro.
    // No banco: coluna "UsuarioId" INTEGER NOT NULL REFERENCES "Usuarios"("Id")
    public int UsuarioId { get; set; }

    // Data do registro (apenas a data, sem hora).
    // DateOnly mapeia para DATE no PostgreSQL.
    public DateOnly Data { get; set; }

    // Humor do dia: escala de 1 (muito ruim) a 5 (ótimo).
    public int Humor { get; set; }

    // Horas de sono na noite anterior (ex: 7.5).
    public decimal Sono { get; set; }

    // Horas de estudo no dia (ex: 3.0).
    public decimal Estudo { get; set; }

    // Nível de produtividade: escala de 1 a 5.
    public int Produtividade { get; set; }

    // Nível de energia: escala de 1 a 5.
    public int Energia { get; set; }

    // Praticou exercício físico no dia?
    public bool Exercicio { get; set; }

    // Litros de água consumidos no dia.
    public decimal Agua { get; set; }

    // Campo livre para anotações do dia.
    public string? Observacoes { get; set; }

    // Data/hora em que o registro foi criado no sistema.
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

    // Propriedade de navegação — para acessar os dados do usuário dono deste registro.
    // Nullable porque não é sempre carregada (depende do Include no EF).
    public Usuario? Usuario { get; set; }
}
