using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Models;
using Ritmo.Api.Security;

namespace Ritmo.Api.Services;

public class UsuarioService
{
    private readonly AppDbContext _context;
    private readonly JwtTokenService _jwtTokenService;

    public UsuarioService(AppDbContext context, JwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<IEnumerable<UsuarioResponse>> ListarTodos()
    {
        var usuarios = await _context.Usuarios
            .ToListAsync();

        return usuarios.Select(UsuarioResponse.FromEntity);
    }

    public async Task<UsuarioResponse?> BuscarPorId(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        return usuario != null ? UsuarioResponse.FromEntity(usuario) : null;
    }

    public async Task<AuthResponse?> Login(LoginRequest request)
    {
        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == emailNormalizado);

        if (usuario == null || !PasswordHasher.Verify(request.Senha, usuario.Senha))
        {
            return null;
        }

        if (PasswordHasher.NeedsRehash(usuario.Senha))
        {
            usuario.Senha = PasswordHasher.Hash(request.Senha);
            await _context.SaveChangesAsync();
        }

        return CriarAuthResponse(usuario);
    }

    public async Task<UsuarioResponse?> Criar(UsuarioRequest request)
    {
        ValidateUsuarioRequest(request);

        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var emailExistente = await _context.Usuarios
            .AnyAsync(u => u.Email == emailNormalizado);

        if (emailExistente) return null;

        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = emailNormalizado,
            Senha = PasswordHasher.Hash(request.Senha),
            DataNascimento = request.DataNascimento,
            Sexo = request.Sexo.Trim().ToUpperInvariant(),
            DataCriacao = DateTime.UtcNow,
            ConfiguracaoPerfil = new ConfiguracaoPerfil()
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return UsuarioResponse.FromEntity(usuario);
    }

    public async Task<AuthResponse?> RegistrarComToken(UsuarioRequest request)
    {
        var usuario = await Criar(request);
        if (usuario == null)
        {
            return null;
        }

        var entity = await _context.Usuarios.FindAsync(usuario.Id);
        return entity == null ? null : CriarAuthResponse(entity);
    }

    public async Task<AuthResponse?> AtualizarPerfilComToken(int id, UpdateUsuarioPerfilRequest request)
    {
        ValidateUsuarioPerfilRequest(request);

        var usuarioExistente = await _context.Usuarios.FindAsync(id);
        if (usuarioExistente == null) return null;

        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var emailEmUso = await _context.Usuarios
            .AnyAsync(u => u.Email == emailNormalizado && u.Id != id);

        if (emailEmUso)
        {
            throw new DomainValidationException("Já existe um usuário cadastrado com esse email.");
        }

        usuarioExistente.Nome = request.Nome.Trim();
        usuarioExistente.Email = emailNormalizado;
        usuarioExistente.DataNascimento = request.DataNascimento;
        usuarioExistente.Sexo = request.Sexo.Trim().ToUpperInvariant();

        await _context.SaveChangesAsync();

        return CriarAuthResponse(usuarioExistente);
    }

    public async Task<bool> Atualizar(int id, UsuarioRequest request)
    {
        ValidateUsuarioRequest(request);

        var usuarioExistente = await _context.Usuarios.FindAsync(id);

        if (usuarioExistente == null) return false;

        var emailNormalizado = request.Email.Trim().ToLowerInvariant();
        var emailEmUso = await _context.Usuarios
            .AnyAsync(u => u.Email == emailNormalizado && u.Id != id);

        if (emailEmUso)
        {
            throw new DomainValidationException("Já existe um usuário cadastrado com esse email.");
        }

        usuarioExistente.Nome = request.Nome.Trim();
        usuarioExistente.Email = emailNormalizado;
        usuarioExistente.Senha = PasswordHasher.Hash(request.Senha);
        usuarioExistente.DataNascimento = request.DataNascimento;
        usuarioExistente.Sexo = request.Sexo.Trim().ToUpperInvariant();

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> AlterarSenha(int id, UpdateUsuarioSenhaRequest request)
    {
        var usuarioExistente = await _context.Usuarios.FindAsync(id);
        if (usuarioExistente == null) return false;

        if (!PasswordHasher.Verify(request.SenhaAtual, usuarioExistente.Senha))
        {
            throw new DomainValidationException("Senha atual incorreta.");
        }

        if (request.SenhaAtual == request.NovaSenha)
        {
            throw new DomainValidationException("A nova senha deve ser diferente da senha atual.");
        }

        usuarioExistente.Senha = PasswordHasher.Hash(request.NovaSenha);
        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<bool> Deletar(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null) return false;

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeletarConta(int id, DeleteUsuarioRequest request)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return false;

        if (!PasswordHasher.Verify(request.SenhaAtual, usuario.Senha))
        {
            throw new DomainValidationException("Senha atual incorreta.");
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return true;
    }

    private AuthResponse CriarAuthResponse(Usuario usuario)
    {
        var tokenData = _jwtTokenService.CreateToken(usuario);
        return new AuthResponse
        {
            Token = tokenData.Token,
            ExpiresAt = tokenData.ExpiresAt,
            Usuario = UsuarioResponse.FromEntity(usuario)
        };
    }

    private static void ValidateUsuarioRequest(UsuarioRequest request)
    {
        ValidateDataNascimento(request.DataNascimento);
    }

    private static void ValidateUsuarioPerfilRequest(UpdateUsuarioPerfilRequest request)
    {
        ValidateDataNascimento(request.DataNascimento);
    }

    private static void ValidateDataNascimento(DateOnly dataNascimento)
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);

        if (dataNascimento > hoje)
        {
            throw new DomainValidationException("Data de nascimento não pode estar no futuro.");
        }

        var idade = hoje.Year - dataNascimento.Year;
        if (hoje.Month < dataNascimento.Month ||
            (hoje.Month == dataNascimento.Month && hoje.Day < dataNascimento.Day))
        {
            idade--;
        }

        if (idade < 0 || idade > 120)
        {
            throw new DomainValidationException("Data de nascimento deve resultar em idade entre 0 e 120 anos.");
        }
    }
}
