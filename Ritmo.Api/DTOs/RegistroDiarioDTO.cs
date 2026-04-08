using System.ComponentModel.DataAnnotations;
namespace Ritmo.Api.DTOs;

using Ritmo.Api.Models;

public class RegistroDiarioRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "UsuarioId deve ser maior que zero.")]
    public int UsuarioId { get; set; }

    [Required(ErrorMessage = "Data é obrigatória.")]
    public DateOnly Data { get; set; }

    [Range(1, 5, ErrorMessage = "Humor deve estar entre 1 e 5.")]
    public int Humor { get; set; }

    [Range(typeof(decimal), "0", "24", ErrorMessage = "Sono deve estar entre 0 e 24 horas.")]
    public decimal Sono { get; set; }

    [Range(1, 5, ErrorMessage = "Produtividade deve estar entre 1 e 5.")]
    public int Produtividade { get; set; }

    [Range(1, 5, ErrorMessage = "Energia deve estar entre 1 e 5.")]
    public int Energia { get; set; }
    public bool Exercicio { get; set; }

    [Range(typeof(decimal), "0", "25", ErrorMessage = "Água deve estar entre 0 e 25 litros.")]
    public decimal Agua { get; set; }

    [StringLength(1000, ErrorMessage = "Observações devem ter no máximo 1000 caracteres.")]
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
