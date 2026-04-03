using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
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
            .Where(m => m.UsuarioId == usuarioId)
            .OrderByDescending(m => m.Data)
            .ToListAsync();

        return medidas.Select(MedidaBiometricaResponse.FromEntity);
    }

    public async Task<MedidaBiometricaResponse> Registrar(MedidaBiometricaRequest dto)
    {
        var novaMedida = dto.ToEntity();
        _context.MedidasBiometricas.Add(novaMedida);
        await _context.SaveChangesAsync();

        return MedidaBiometricaResponse.FromEntity(novaMedida);
    }

    public async Task<bool> Deletar(int id)
    {
        var medida = await _context.MedidasBiometricas.FindAsync(id);
        if (medida == null) return false;

        _context.MedidasBiometricas.Remove(medida);
        await _context.SaveChangesAsync();
        return true;
    }
}
