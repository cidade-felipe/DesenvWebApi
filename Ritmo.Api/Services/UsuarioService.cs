using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Models;

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

    public async Task<UsuarioResponse?> Criar(UsuarioRequest request)
    {
        var emailExistente = await _context.Usuarios
            .AnyAsync(u => u.Email == request.Email);

        if (emailExistente) return null;

        var usuario = new Usuario
        {
            Nome = request.Nome,
            Email = request.Email,
            Senha = request.Senha,
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

        usuarioExistente.Nome = request.Nome;
        usuarioExistente.Senha = request.Senha;

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
