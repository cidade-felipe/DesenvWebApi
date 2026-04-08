using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Models;
using Ritmo.Api.Security;

namespace Ritmo.Api.Services;

public class UsuarioService
{
    private readonly AppDbContext _context;

    public UsuarioService(AppDbContext context)
    {
        _context = context;
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

    public async Task<UsuarioResponse?> Login(LoginRequest request)
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

        return UsuarioResponse.FromEntity(usuario);
    }

    public async Task<UsuarioResponse?> Criar(UsuarioRequest request)
    {
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

    public async Task<bool> Atualizar(int id, UsuarioRequest request)
    {
        var usuarioExistente = await _context.Usuarios.FindAsync(id);

        if (usuarioExistente == null) return false;

        usuarioExistente.Nome = request.Nome.Trim();
        usuarioExistente.Senha = PasswordHasher.Hash(request.Senha);
        usuarioExistente.DataNascimento = request.DataNascimento;
        usuarioExistente.Sexo = request.Sexo.Trim().ToUpperInvariant();

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
}
