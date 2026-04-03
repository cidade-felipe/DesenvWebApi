using Microsoft.AspNetCore.Mvc;
using Ritmo.Api.DTOs;
using Ritmo.Api.Services;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrosDiariosController : ControllerBase
{
    private readonly RegistroDiarioService _service;

    public RegistrosDiariosController(RegistroDiarioService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegistroDiarioResponse>>> GetRegistros()
    {
        return Ok(await _service.ListarTodos());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RegistroDiarioResponse>> GetRegistro(int id)
    {
        var registro = await _service.BuscarPorId(id);
        if (registro == null)
            return NotFound(new { mensagem = $"Registro com ID {id} não encontrado." });

        return Ok(registro);
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<RegistroDiarioResponse>>> GetRegistrosPorUsuario(int usuarioId)
    {
        return Ok(await _service.ListarPorUsuario(usuarioId));
    }

    [HttpPost]
    public async Task<ActionResult<RegistroDiarioResponse>> PostRegistro(RegistroDiarioRequest registro)
    {
        var result = await _service.UpsertRegistro(registro);
        return CreatedAtAction(nameof(GetRegistro), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutRegistro(int id, RegistroDiarioRequest registro)
    {
        var sucesso = await _service.Atualizar(id, registro);
        if (!sucesso)
            return NotFound(new { mensagem = $"Registro com ID {id} não encontrado." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRegistro(int id)
    {
        var sucesso = await _service.Deletar(id);
        if (!sucesso)
            return NotFound(new { mensagem = $"Registro com ID {id} não encontrado." });

        return NoContent();
    }
}
