using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ritmo.Api.DTOs;
using Ritmo.Api.Security;
using Ritmo.Api.Services;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
        var userId = User.GetAuthenticatedUserId();
        if (userId == null)
            return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

        var usuario = await _service.BuscarPorId(userId.Value);
        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário com ID {userId.Value} não encontrado." });

        return Ok(new[] { usuario });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioResponse>> GetUsuario(int id)
    {
        var userId = User.GetAuthenticatedUserId();
        if (userId != id)
            return Forbid();

        var usuario = await _service.BuscarPorId(id);
        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return Ok(usuario);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> PostUsuario(UsuarioRequest usuario)
    {
        var result = await _service.RegistrarComToken(usuario);
        if (result == null)
            return Conflict(new { mensagem = "Já existe um usuário cadastrado com esse email." });

        return CreatedAtAction(nameof(GetUsuario), new { id = result.Usuario.Id }, result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _service.Login(request);
        if (result == null)
            return Unauthorized(new { mensagem = "Email ou senha incorretos." });

        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, UsuarioRequest usuario)
    {
        var userId = User.GetAuthenticatedUserId();
        if (userId != id)
            return Forbid();

        var sucesso = await _service.Atualizar(id, usuario);
        if (!sucesso)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return NoContent();
    }

    [HttpPut("{id}/perfil")]
    public async Task<ActionResult<AuthResponse>> PutPerfil(int id, UpdateUsuarioPerfilRequest request)
    {
        var userId = User.GetAuthenticatedUserId();
        if (userId != id)
            return Forbid();

        var result = await _service.AtualizarPerfilComToken(id, request);
        if (result == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return Ok(result);
    }

    [HttpPut("{id}/senha")]
    public async Task<IActionResult> PutSenha(int id, UpdateUsuarioSenhaRequest request)
    {
        var userId = User.GetAuthenticatedUserId();
        if (userId != id)
            return Forbid();

        var sucesso = await _service.AlterarSenha(id, request);
        if (!sucesso)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id, [FromBody] DeleteUsuarioRequest request)
    {
        var userId = User.GetAuthenticatedUserId();
        if (userId != id)
            return Forbid();

        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var sucesso = await _service.DeletarConta(id, request);
        if (!sucesso)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return NoContent();
    }
}
