using System.ComponentModel.DataAnnotations;
namespace Ritmo.Api.DTOs;

using Ritmo.Api.Models;

public class UsuarioRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 120 caracteres.")]
    public string Nome { get; set; } = null!;

    [Required(ErrorMessage = "Email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    [StringLength(160, ErrorMessage = "Email deve ter no máximo 160 caracteres.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Senha é obrigatória.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Senha deve ter entre 8 e 128 caracteres.")]
    public string Senha { get; set; } = null!;

    [Required(ErrorMessage = "Data de nascimento é obrigatória.")]
    public DateOnly DataNascimento { get; set; }

    [Required(ErrorMessage = "Sexo é obrigatório.")]
    [RegularExpression("^(M|F)$", ErrorMessage = "Sexo deve ser 'M' ou 'F'.")]
    public string Sexo { get; set; } = null!;
}

public class UpdateUsuarioPerfilRequest
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [StringLength(120, MinimumLength = 3, ErrorMessage = "Nome deve ter entre 3 e 120 caracteres.")]
    public string Nome { get; set; } = null!;

    [Required(ErrorMessage = "Email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    [StringLength(160, ErrorMessage = "Email deve ter no máximo 160 caracteres.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Data de nascimento é obrigatória.")]
    public DateOnly DataNascimento { get; set; }

    [Required(ErrorMessage = "Sexo é obrigatório.")]
    [RegularExpression("^(M|F)$", ErrorMessage = "Sexo deve ser 'M' ou 'F'.")]
    public string Sexo { get; set; } = null!;
}

public class UpdateUsuarioSenhaRequest
{
    [Required(ErrorMessage = "Senha atual é obrigatória.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Senha atual deve ter entre 8 e 128 caracteres.")]
    public string SenhaAtual { get; set; } = null!;

    [Required(ErrorMessage = "Nova senha é obrigatória.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Nova senha deve ter entre 8 e 128 caracteres.")]
    public string NovaSenha { get; set; } = null!;
}

public class DeleteUsuarioRequest
{
    [Required(ErrorMessage = "Senha atual é obrigatória.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Senha atual deve ter entre 8 e 128 caracteres.")]
    public string SenhaAtual { get; set; } = null!;
}

public class LoginRequest
{
    [Required(ErrorMessage = "Email é obrigatório.")]
    [EmailAddress(ErrorMessage = "Email inválido.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Senha é obrigatória.")]
    [StringLength(128, MinimumLength = 8, ErrorMessage = "Senha deve ter entre 8 e 128 caracteres.")]
    public string Senha { get; set; } = null!;
}


public class UsuarioResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = null!;
    public string Email { get; set; } = null!;
    public DateTime DataCriacao { get; set; }
    public DateOnly DataNascimento { get; set; }
    public string Sexo { get; set; } = null!;

    public static UsuarioResponse FromEntity(Usuario entity)
    {
        return new UsuarioResponse
        {
            Id = entity.Id,
            Nome = entity.Nome,
            Email = entity.Email,
            DataCriacao = entity.DataCriacao,
            DataNascimento = entity.DataNascimento,
            Sexo = entity.Sexo
        };
    }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UsuarioResponse Usuario { get; set; } = null!;
}
