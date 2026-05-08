using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Models;

namespace Ritmo.Api.Services;

public class BiometriaService
{
    private readonly AppDbContext _context;
    private readonly InsightNotificationService _insightNotificationService;

    public BiometriaService(AppDbContext context, InsightNotificationService insightNotificationService)
    {
        _context = context;
        _insightNotificationService = insightNotificationService;
    }

    public async Task<IEnumerable<MedidaBiometricaResponse>> ListarPorUsuario(int usuarioId)
    {
        var medidas = await _context.MedidasBiometricas
            .Include(m => m.Usuario)
            .Where(m => m.UsuarioId == usuarioId)
            .OrderByDescending(m => m.Data)
            .ThenByDescending(m => m.Id)
            .ToListAsync();

        var medidasConsolidadas = medidas
            .GroupBy(m => DateOnly.FromDateTime(m.Data))
            .Select(group => group
                .OrderByDescending(m => m.Data)
                .ThenByDescending(m => m.Id)
                .First())
            .OrderByDescending(m => m.Data)
            .ThenByDescending(m => m.Id)
            .ToList();

        return medidasConsolidadas.Select(m => MedidaBiometricaResponse.FromEntity(m, m.Usuario!.DataNascimento));
    }

    public async Task<MedidaBiometricaResponse> Registrar(MedidaBiometricaRequest dto)
    {
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null)
        {
            throw new DomainValidationException("Usuário informado para biometria não existe.");
        }

        ValidateBiometria(dto, usuario);

        var dataReferencia = dto.Data.Date;
        var proximoDia = dataReferencia.AddDays(1);

        var medidasDoDia = await _context.MedidasBiometricas
            .Where(m =>
                m.UsuarioId == dto.UsuarioId &&
                m.Data >= dataReferencia &&
                m.Data < proximoDia)
            .OrderByDescending(m => m.Data)
            .ThenByDescending(m => m.Id)
            .ToListAsync();

        var medidaExistente = medidasDoDia.FirstOrDefault();

        if (medidaExistente != null)
        {
            medidaExistente.Peso = dto.Peso;
            medidaExistente.Altura = dto.Altura;
            medidaExistente.Data = dto.Data;

            if (medidasDoDia.Count > 1)
            {
                _context.MedidasBiometricas.RemoveRange(medidasDoDia.Skip(1));
            }

            await _context.SaveChangesAsync();
            await _insightNotificationService.GerarAvisosDeProgressoAsync(dto.UsuarioId);

            return MedidaBiometricaResponse.FromEntity(medidaExistente, usuario.DataNascimento);
        }

        var novaMedida = dto.ToEntity();
        _context.MedidasBiometricas.Add(novaMedida);
        await _context.SaveChangesAsync();
        await _insightNotificationService.GerarAvisosDeProgressoAsync(dto.UsuarioId);

        return MedidaBiometricaResponse.FromEntity(novaMedida, usuario.DataNascimento);
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
