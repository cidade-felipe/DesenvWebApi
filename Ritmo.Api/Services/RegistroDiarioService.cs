using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Models;

namespace Ritmo.Api.Services;

public class RegistroDiarioService
{
    private readonly AppDbContext _context;

    public RegistroDiarioService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RegistroDiarioResponse>> ListarTodos()
    {
        var registros = await _context.RegistrosDiarios
            .OrderByDescending(r => r.Data)
            .ToListAsync();

        return registros.Select(RegistroDiarioResponse.FromEntity);
    }

    public async Task<RegistroDiarioResponse?> BuscarPorId(int id)
    {
        var registro = await _context.RegistrosDiarios.FindAsync(id);
        return registro != null ? RegistroDiarioResponse.FromEntity(registro) : null;
    }

    public async Task<IEnumerable<RegistroDiarioResponse>> ListarPorUsuario(int usuarioId)
    {
        var registros = await _context.RegistrosDiarios
            .Where(r => r.UsuarioId == usuarioId)
            .OrderByDescending(r => r.Data)
            .ToListAsync();

        return registros.Select(RegistroDiarioResponse.FromEntity);
    }

    public async Task<RegistroDiarioResponse> UpsertRegistro(RegistroDiarioRequest dto)
    {
        await ValidateRegistro(dto);

        // Lógica de "Um registro por dia" (Upsert)
        var registroExistente = await _context.RegistrosDiarios
            .FirstOrDefaultAsync(r => r.UsuarioId == dto.UsuarioId && r.Data == dto.Data);

        if (registroExistente != null)
        {
            dto.UpdateEntity(registroExistente);
            _context.RegistrosDiarios.Update(registroExistente);
            await _context.SaveChangesAsync();
            return RegistroDiarioResponse.FromEntity(registroExistente);
        }

        var novoRegistro = dto.ToEntity();
        _context.RegistrosDiarios.Add(novoRegistro);
        await _context.SaveChangesAsync();

        return RegistroDiarioResponse.FromEntity(novoRegistro);
    }

    public async Task<bool> Atualizar(int id, RegistroDiarioRequest dto)
    {
        await ValidateRegistro(dto);

        var registroExistente = await _context.RegistrosDiarios.FindAsync(id);
        if (registroExistente == null) return false;

        dto.UpdateEntity(registroExistente);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> Deletar(int id)
    {
        var registro = await _context.RegistrosDiarios.FindAsync(id);
        if (registro == null) return false;

        _context.RegistrosDiarios.Remove(registro);
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task ValidateRegistro(RegistroDiarioRequest dto)
    {
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null)
        {
            throw new DomainValidationException("Usuário informado para o registro não existe.");
        }

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        if (dto.Data > hoje)
        {
            throw new DomainValidationException("Data do registro não pode estar no futuro.");
        }

        if (dto.Data < usuario.DataNascimento)
        {
            throw new DomainValidationException("Data do registro não pode ser anterior ao nascimento do usuário.");
        }
    }
}
