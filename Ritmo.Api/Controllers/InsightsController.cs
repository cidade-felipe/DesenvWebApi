// Controllers/InsightsController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.Models;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsightsController : ControllerBase
{
    private readonly AppDbContext _context;

    public InsightsController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================================
    // GET /api/insights/usuario/{usuarioId}
    // Retorna os insights de um usuário, do mais recente para o mais antigo.
    // Opção de filtrar só os não lidos: GET /api/insights/usuario/1?apenasNaoLidos=true
    // =====================================================================
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<Insight>>> GetInsightsPorUsuario(
        int usuarioId,
        [FromQuery] bool? apenasNaoLidos = null)
    {
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == usuarioId);
        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {usuarioId} não encontrado." });

        var query = _context.Insights.Where(i => i.UsuarioId == usuarioId);

        if (apenasNaoLidos.HasValue && apenasNaoLidos.Value)
            query = query.Where(i => !i.Lido);

        var insights = await query
            .OrderByDescending(i => i.DataGeracao)
            .ToListAsync();

        return Ok(insights);
    }

    // =====================================================================
    // GET /api/insights/5
    // =====================================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<Insight>> GetInsight(int id)
    {
        var insight = await _context.Insights.FindAsync(id);

        if (insight == null)
            return NotFound(new { mensagem = $"Insight com ID {id} não encontrado." });

        return Ok(insight);
    }

    // =====================================================================
    // POST /api/insights
    // Cria/persiste um insight gerado pelo sistema.
    //
    // Body esperado:
    // {
    //   "usuarioId": 1,
    //   "mensagem": "Você foi mais produtivo nas quartas e quintas",
    //   "categoria": "Produtividade",
    //   "nivel": "positivo"
    // }
    // =====================================================================
    [HttpPost]
    public async Task<ActionResult<Insight>> PostInsight(Insight insight)
    {
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == insight.UsuarioId);
        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {insight.UsuarioId} não encontrado." });

        insight.DataGeracao = DateTime.UtcNow;
        insight.Lido = false;

        _context.Insights.Add(insight);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetInsight), new { id = insight.Id }, insight);
    }

    // =====================================================================
    // PATCH /api/insights/5/marcar-lido
    // Marca um insight como lido — ação do usuário ao ver o insight.
    // Permite ao frontend controlar o badge de "não lidos" no dashboard.
    // =====================================================================
    [HttpPatch("{id}/marcar-lido")]
    public async Task<IActionResult> MarcarComoLido(int id)
    {
        var insight = await _context.Insights.FindAsync(id);
        if (insight == null)
            return NotFound(new { mensagem = $"Insight com ID {id} não encontrado." });

        insight.Lido = true;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =====================================================================
    // DELETE /api/insights/5
    // =====================================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInsight(int id)
    {
        var insight = await _context.Insights.FindAsync(id);
        if (insight == null)
            return NotFound(new { mensagem = $"Insight com ID {id} não encontrado." });

        _context.Insights.Remove(insight);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
