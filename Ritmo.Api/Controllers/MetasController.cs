// Controllers/MetasController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.Models;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetasController : ControllerBase
{
    private readonly AppDbContext _context;

    public MetasController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================================
    // GET /api/metas/usuario/{usuarioId}
    // Retorna todas as metas de um usuário, com opção de filtrar por ativas.
    // Exemplo: GET /api/metas/usuario/1?apenasAtivas=true
    // =====================================================================
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<Meta>>> GetMetasPorUsuario(
        int usuarioId,
        [FromQuery] bool? apenasAtivas = null)
    {
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == usuarioId);
        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {usuarioId} não encontrado." });

        var query = _context.Metas.Where(m => m.UsuarioId == usuarioId);

        // Filtra por status ativo se o parâmetro foi enviado.
        if (apenasAtivas.HasValue)
            query = query.Where(m => m.Ativa == apenasAtivas.Value);

        var metas = await query
            .OrderByDescending(m => m.DataCriacao)
            .ToListAsync();

        return Ok(metas);
    }

    // =====================================================================
    // GET /api/metas/5
    // =====================================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<Meta>> GetMeta(int id)
    {
        var meta = await _context.Metas.FindAsync(id);

        if (meta == null)
            return NotFound(new { mensagem = $"Meta com ID {id} não encontrada." });

        return Ok(meta);
    }

    // =====================================================================
    // POST /api/metas
    // Cria uma nova meta para o usuário.
    //
    // Body esperado:
    // {
    //   "usuarioId": 1,
    //   "categoria": "Sono",
    //   "valorAlvo": 7.5,
    //   "descricao": "Dormir pelo menos 7h30 por dia",
    //   "dataInicio": "2026-03-26",
    //   "dataFim": null
    // }
    // =====================================================================
    [HttpPost]
    public async Task<ActionResult<Meta>> PostMeta(Meta meta)
    {
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == meta.UsuarioId);
        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {meta.UsuarioId} não encontrado." });

        meta.DataCriacao = DateTime.UtcNow;
        meta.Ativa = true;

        _context.Metas.Add(meta);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetMeta), new { id = meta.Id }, meta);
    }

    // =====================================================================
    // PUT /api/metas/5
    // Atualiza uma meta existente.
    // =====================================================================
    [HttpPut("{id}")]
    public async Task<IActionResult> PutMeta(int id, Meta meta)
    {
        if (id != meta.Id)
            return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID no body." });

        var metaExistente = await _context.Metas.FindAsync(id);
        if (metaExistente == null)
            return NotFound(new { mensagem = $"Meta com ID {id} não encontrada." });

        metaExistente.Categoria = meta.Categoria;
        metaExistente.ValorAlvo = meta.ValorAlvo;
        metaExistente.Descricao = meta.Descricao;
        metaExistente.DataInicio = meta.DataInicio;
        metaExistente.DataFim = meta.DataFim;
        metaExistente.Ativa = meta.Ativa;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =====================================================================
    // PATCH /api/metas/5/desativar
    // Desativa uma meta sem deletá-la — mantém o histórico.
    // =====================================================================
    [HttpPatch("{id}/desativar")]
    public async Task<IActionResult> DesativarMeta(int id)
    {
        var meta = await _context.Metas.FindAsync(id);
        if (meta == null)
            return NotFound(new { mensagem = $"Meta com ID {id} não encontrada." });

        meta.Ativa = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =====================================================================
    // DELETE /api/metas/5
    // =====================================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeta(int id)
    {
        var meta = await _context.Metas.FindAsync(id);
        if (meta == null)
            return NotFound(new { mensagem = $"Meta com ID {id} não encontrada." });

        _context.Metas.Remove(meta);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
