using Microsoft.AspNetCore.Mvc;
using Ritmo.Api.DTOs;
using Ritmo.Api.Services;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetasController : ControllerBase
{
    private readonly MetaService _metaService;

    public MetasController(MetaService metaService)
    {
        _metaService = metaService;
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<MetaDTO>>> GetMetasPorUsuario(int usuarioId)
    {
        var metas = await _metaService.ListarPorUsuario(usuarioId);
        return Ok(metas);
    }

    [HttpPost]
    public async Task<ActionResult<MetaDTO>> PostMeta(MetaDTO dto)
    {
        var novaMeta = await _metaService.Criar(dto);
        return CreatedAtAction(nameof(GetMetasPorUsuario), new { usuarioId = novaMeta.UsuarioId }, novaMeta);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutMeta(int id, MetaDTO dto)
    {
        if (id != dto.Id) return BadRequest();
        
        var sucesso = await _metaService.Atualizar(id, dto);
        if (!sucesso) return NotFound();
        
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeta(int id)
    {
        var sucesso = await _metaService.Deletar(id);
        if (!sucesso) return NotFound();
        
        return NoContent();
    }
}
