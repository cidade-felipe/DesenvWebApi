using Microsoft.AspNetCore.Mvc;
using Ritmo.Api.DTOs;
using Ritmo.Api.Services;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BiometriaController : ControllerBase
{
    private readonly BiometriaService _biometriaService;

    public BiometriaController(BiometriaService biometriaService)
    {
        _biometriaService = biometriaService;
    }

    // GET: api/Biometria/usuario/1
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<MedidaBiometricaResponse>>> GetPorUsuario(int usuarioId)
    {
        var medidas = await _biometriaService.ListarPorUsuario(usuarioId);
        return Ok(medidas);
    }

    // POST: api/Biometria
    [HttpPost]
    public async Task<ActionResult<MedidaBiometricaResponse>> PostMedida(MedidaBiometricaRequest request)
    {
        var novaMedida = await _biometriaService.Registrar(request);
        return CreatedAtAction(nameof(GetPorUsuario), new { usuarioId = novaMedida.UsuarioId }, novaMedida);
    }

    // DELETE: api/Biometria/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedida(int id)
    {
        var sucesso = await _biometriaService.Deletar(id);
        if (!sucesso) return NotFound();

        return NoContent();
    }
}
