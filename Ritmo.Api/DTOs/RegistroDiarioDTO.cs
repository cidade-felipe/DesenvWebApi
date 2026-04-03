namespace Ritmo.Api.DTOs;

using Ritmo.Api.Models;

public class RegistroDiarioRequest
{
    public int UsuarioId { get; set; }
    public DateOnly Data { get; set; }
    public int Humor { get; set; }
    public decimal Sono { get; set; }
    public int Produtividade { get; set; }
    public int Energia { get; set; }
    public bool Exercicio { get; set; }
    public decimal Agua { get; set; }
    public string? Observacoes { get; set; }

    public RegistroDiario ToEntity()
    {
        return new RegistroDiario
        {
            UsuarioId = this.UsuarioId,
            Data = this.Data,
            Humor = this.Humor,
            Sono = this.Sono,
            Produtividade = this.Produtividade,
            Energia = this.Energia,
            Exercicio = this.Exercicio,
            Agua = this.Agua,
            Observacoes = this.Observacoes,
            DataCriacao = DateTime.UtcNow
        };
    }

    public void UpdateEntity(RegistroDiario entity)
    {
        entity.Humor = this.Humor;
        entity.Sono = this.Sono;
        entity.Produtividade = this.Produtividade;
        entity.Energia = this.Energia;
        entity.Exercicio = this.Exercicio;
        entity.Agua = this.Agua;
        entity.Observacoes = this.Observacoes;
    }
}

public class RegistroDiarioResponse
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public DateOnly Data { get; set; }
    public int Humor { get; set; }
    public decimal Sono { get; set; }
    public int Produtividade { get; set; }
    public int Energia { get; set; }
    public bool Exercicio { get; set; }
    public decimal Agua { get; set; }
    public string? Observacoes { get; set; }

    public static RegistroDiarioResponse FromEntity(RegistroDiario entity)
    {
        return new RegistroDiarioResponse
        {
            Id = entity.Id,
            UsuarioId = entity.UsuarioId,
            Data = entity.Data,
            Humor = entity.Humor,
            Sono = entity.Sono,
            Produtividade = entity.Produtividade,
            Energia = entity.Energia,
            Exercicio = entity.Exercicio,
            Agua = entity.Agua,
            Observacoes = entity.Observacoes
        };
    }
}
