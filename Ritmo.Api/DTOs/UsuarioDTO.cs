namespace Ritmo.Api.DTOs;

using Ritmo.Api.Models;

public class UsuarioRequest
{
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Senha { get; set; } = null!;
    public int? Altura { get; set; }
}

public class UsuarioResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
    public int? Altura { get; set; }
    public DateTime DataCriacao { get; set; }

    public static UsuarioResponse FromEntity(Usuario entity)
    {
        return new UsuarioResponse
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Email = entity.Email,
            Altura = entity.Altura,
            DataCriacao = entity.DataCriacao
        };
    }
}
