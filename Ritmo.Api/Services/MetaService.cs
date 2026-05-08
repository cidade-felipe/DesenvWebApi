using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Models;

namespace Ritmo.Api.Services;

public class MetaService
{
    private readonly AppDbContext _context;
    private readonly InsightNotificationService _insightNotificationService;

    public MetaService(AppDbContext context, InsightNotificationService insightNotificationService)
    {
        _context = context;
        _insightNotificationService = insightNotificationService;
    }

    public async Task<IEnumerable<MetaDTO>> ListarPorUsuario(int usuarioId)
    {
        var metas = await _context.Metas
            .Where(m => m.UsuarioId == usuarioId)
            .OrderBy(m => m.Categoria)
            .ToListAsync();

        return metas.Select(m => new MetaDTO
        {
            Id = m.Id,
            UsuarioId = m.UsuarioId,
            Categoria = m.Categoria,
            ValorAlvo = m.ValorAlvo,
            Direcao = m.Direcao,
            ValorInicial = m.ValorInicial,
            Descricao = m.Descricao,
            DataInicio = m.DataInicio,
            DataFim = m.DataFim,
            Ativa = m.Ativa
        });
    }

    public async Task<MetaDTO> Criar(MetaDTO dto)
    {
        ValidateMeta(dto);
        var valorInicial = await ObterValorInicial(dto);

        var novaMeta = new Meta
        {
            UsuarioId = dto.UsuarioId,
            Categoria = dto.Categoria,
            ValorAlvo = dto.ValorAlvo,
            Direcao = NormalizarDirecao(dto),
            ValorInicial = valorInicial,
            Descricao = dto.Descricao,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            Ativa = dto.Ativa
        };

        _context.Metas.Add(novaMeta);
        await _context.SaveChangesAsync();
        await _insightNotificationService.GerarAvisosDeProgressoAsync(dto.UsuarioId);

        dto.Id = novaMeta.Id;
        dto.Direcao = novaMeta.Direcao;
        dto.ValorInicial = novaMeta.ValorInicial;
        return dto;
    }

    public async Task<bool> Atualizar(int id, MetaDTO dto)
    {
        ValidateMeta(dto);

        var metaExistente = await _context.Metas.FindAsync(id);
        if (metaExistente == null) return false;

        var categoriaAnterior = metaExistente.Categoria;
        metaExistente.Categoria = dto.Categoria;
        metaExistente.ValorAlvo = dto.ValorAlvo;
        metaExistente.Direcao = NormalizarDirecao(dto);
        metaExistente.ValorInicial = await ResolverValorInicialAtualizado(dto, metaExistente, categoriaAnterior);
        metaExistente.Descricao = dto.Descricao;
        metaExistente.DataInicio = dto.DataInicio;
        metaExistente.DataFim = dto.DataFim;
        metaExistente.Ativa = dto.Ativa;

        await _context.SaveChangesAsync();
        await _insightNotificationService.GerarAvisosDeProgressoAsync(dto.UsuarioId);
        return true;
    }

    public async Task<bool> Deletar(int id)
    {
        var meta = await _context.Metas.FindAsync(id);
        if (meta == null) return false;

        _context.Metas.Remove(meta);
        await _context.SaveChangesAsync();
        return true;
    }

    private static void ValidateMeta(MetaDTO dto)
    {
        if (dto.DataFim.HasValue && dto.DataFim.Value < dto.DataInicio)
        {
            throw new DomainValidationException("Data fim não pode ser anterior à data de início.");
        }

        var (min, max) = dto.Categoria switch
        {
            "Sono" => (0.5m, 24m),
            "Agua" => (0.1m, 25m),
            "Treino" => (1m, 7m),
            "Peso" => (10m, 600m),
            "Humor" or "Produtividade" or "Energia" => (1m, 5m),
            _ => throw new DomainValidationException("Categoria de meta inválida.")
        };

        if (dto.ValorAlvo < min || dto.ValorAlvo > max)
        {
            throw new DomainValidationException(
                $"Valor alvo inválido para a categoria {dto.Categoria}. Faixa permitida: {min} a {max}.");
        }

        var direcaoNormalizada = dto.Direcao?.Trim().ToLowerInvariant();
        var direcoesValidas = new[] { "reduzir", "ganhar", "manter" };

        if (dto.Categoria == "Peso" && string.IsNullOrWhiteSpace(direcaoNormalizada))
        {
            throw new DomainValidationException("Informe se a meta de peso é para reduzir, ganhar ou manter.");
        }

        if (!string.IsNullOrWhiteSpace(direcaoNormalizada) && !direcoesValidas.Contains(direcaoNormalizada))
        {
            throw new DomainValidationException("Direção inválida. Use reduzir, ganhar ou manter.");
        }

        if (dto.ValorInicial.HasValue && (dto.ValorInicial.Value < min || dto.ValorInicial.Value > max))
        {
            throw new DomainValidationException(
                $"Valor inicial inválido para a categoria {dto.Categoria}. Faixa permitida: {min} a {max}.");
        }
    }

    private static string? NormalizarDirecao(MetaDTO dto)
    {
        if (dto.Categoria != "Peso")
        {
            return null;
        }

        return dto.Direcao?.Trim().ToLowerInvariant();
    }

    private async Task<decimal?> ResolverValorInicialAtualizado(MetaDTO dto, Meta metaExistente, string categoriaAnterior)
    {
        if (dto.Categoria != "Peso")
        {
            return null;
        }

        if (categoriaAnterior == "Peso" && metaExistente.ValorInicial.HasValue)
        {
            return metaExistente.ValorInicial;
        }

        return await ObterValorInicial(dto);
    }

    private async Task<decimal?> ObterValorInicial(MetaDTO dto)
    {
        if (dto.Categoria != "Peso")
        {
            return null;
        }

        return await _context.MedidasBiometricas
            .Where(m => m.UsuarioId == dto.UsuarioId)
            .OrderByDescending(m => m.Data)
            .ThenByDescending(m => m.Id)
            .Select(m => (decimal?)m.Peso)
            .FirstOrDefaultAsync();
    }
}
