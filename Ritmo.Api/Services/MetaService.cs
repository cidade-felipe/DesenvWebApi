using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.DTOs;
using Ritmo.Api.Exceptions;
using Ritmo.Api.Models;

namespace Ritmo.Api.Services;

public class MetaService
{
    private readonly AppDbContext _context;

    public MetaService(AppDbContext context)
    {
        _context = context;
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
            Descricao = m.Descricao,
            DataInicio = m.DataInicio,
            DataFim = m.DataFim,
            Ativa = m.Ativa
        });
    }

    public async Task<MetaDTO> Criar(MetaDTO dto)
    {
        ValidateMeta(dto);

        var novaMeta = new Meta
        {
            UsuarioId = dto.UsuarioId,
            Categoria = dto.Categoria,
            ValorAlvo = dto.ValorAlvo,
            Descricao = dto.Descricao,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            Ativa = dto.Ativa
        };

        _context.Metas.Add(novaMeta);
        await _context.SaveChangesAsync();

        dto.Id = novaMeta.Id;
        return dto;
    }

    public async Task<bool> Atualizar(int id, MetaDTO dto)
    {
        ValidateMeta(dto);

        var metaExistente = await _context.Metas.FindAsync(id);
        if (metaExistente == null) return false;

        metaExistente.Categoria = dto.Categoria;
        metaExistente.ValorAlvo = dto.ValorAlvo;
        metaExistente.Descricao = dto.Descricao;
        metaExistente.DataInicio = dto.DataInicio;
        metaExistente.DataFim = dto.DataFim;
        metaExistente.Ativa = dto.Ativa;

        await _context.SaveChangesAsync();
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
            "Humor" or "Produtividade" or "Energia" => (1m, 5m),
            _ => throw new DomainValidationException("Categoria de meta inválida.")
        };

        if (dto.ValorAlvo < min || dto.ValorAlvo > max)
        {
            throw new DomainValidationException(
                $"Valor alvo inválido para a categoria {dto.Categoria}. Faixa permitida: {min} a {max}.");
        }
    }
}
