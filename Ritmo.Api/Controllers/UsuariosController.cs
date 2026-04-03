using Microsoft.AspNetCore.Mvc;
using Ritmo.Api.DTOs;
using Ritmo.Api.Services;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _service;

    public UsuariosController(UsuarioService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponse>>> GetUsuarios()
    {
        return Ok(await _service.ListarTodos());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioResponse>> GetUsuario(int id)
    {
        var usuario = await _service.BuscarPorId(id);
        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return Ok(usuario);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponse>> PostUsuario(UsuarioRequest usuario)
    {
        var result = await _service.Criar(usuario);
        if (result == null)
            return Conflict(new { mensagem = "Já existe um usuário cadastrado com esse email." });

        return CreatedAtAction(nameof(GetUsuario), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, UsuarioRequest usuario)
    {
        var sucesso = await _service.Atualizar(id, usuario);
        if (!sucesso)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return NoContent();
    }

    [HttpPatch("{id}/altura")]
    public async Task<IActionResult> UpdateAltura(int id, [FromBody] int altura)
    {
        var sucesso = await _service.AtualizarAltura(id, altura);
        if (!sucesso)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var sucesso = await _service.Deletar(id);
        if (!sucesso)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return NoContent();
    }
}
