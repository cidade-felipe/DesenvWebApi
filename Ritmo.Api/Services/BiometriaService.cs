using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Models;

namespace Ritmo.Api.Services;

public class BiometriaService
{
    private readonly AppDbContext _context;

    public BiometriaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MedidaBiometricaResponse>> ListarPorUsuario(int usuarioId)
    {
        var medidas = await _context.MedidasBiometricas
            .Include(m => m.Usuario)
            .Where(m => m.UsuarioId == usuarioId)
            .OrderByDescending(m => m.Data)
            .ToListAsync();

        return medidas.Select(m => MedidaBiometricaResponse.FromEntity(m, m.Usuario!.DataNascimento));
    }

    public async Task<MedidaBiometricaResponse> Registrar(MedidaBiometricaRequest dto)
    {
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null)
        {
            throw new DomainValidationException("Usuário informado para biometria não existe.");
        }

        ValidateBiometria(dto, usuario);

        var novaMedida = dto.ToEntity();
        _context.MedidasBiometricas.Add(novaMedida);
        await _context.SaveChangesAsync();

        return MedidaBiometricaResponse.FromEntity(novaMedida, usuario!.DataNascimento);
    }

    public async Task<bool> Deletar(int id)
    {
        var medida = await _context.MedidasBiometricas.FindAsync(id);
        if (medida == null) return false;

        _context.MedidasBiometricas.Remove(medida);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void ValidateBiometria(MedidaBiometricaRequest dto, Usuario usuario)
    {
        var agora = DateTime.UtcNow;
        if (dto.Data > agora.AddMinutes(1))
        {
            throw new DomainValidationException("Data da biometria não pode estar no futuro.");
        }

        var dataNascimento = usuario.DataNascimento.ToDateTime(TimeOnly.MinValue);
        if (dto.Data < dataNascimento)
        {
            throw new DomainValidationException("Data da biometria não pode ser anterior ao nascimento do usuário.");
        }
    }
}
