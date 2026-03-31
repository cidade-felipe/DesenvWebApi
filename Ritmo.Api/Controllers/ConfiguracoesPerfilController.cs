using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.Models;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfiguracoesPerfilController : ControllerBase
{
    private readonly AppDbContext _context;

    public ConfiguracoesPerfilController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================================
    // GET /api/configuracoesperfil/usuario/5
    // Retorna a configuração estritamente 1:1 atrelada ao usuário especificado
    // =====================================================================
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<ConfiguracaoPerfil>> GetConfiguracaoPorUsuario(int usuarioId)
    {
        var config = await _context.ConfiguracoesPerfil
            .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

        if (config == null)
            return NotFound(new { mensagem = $"Configuração 1:1 para o usuário {usuarioId} não encontrada." });

        return Ok(config);
    }

    // =====================================================================
    // PUT /api/configuracoesperfil/5
    // Atualiza os dados da configuração de um perfil consolidado
    // =====================================================================
    [HttpPut("{id}")]
    public async Task<IActionResult> PutConfiguracaoPerfil(int id, ConfiguracaoPerfil configuracao)
    {
        if (id != configuracao.Id)
            return BadRequest(new { mensagem = "O ID referenciado na URL não corresponde ao Body enviado." });

        var configExistente = await _context.ConfiguracoesPerfil.FindAsync(id);
        if (configExistente == null)
            return NotFound(new { mensagem = $"O registro de ID {id} da configuração foi revogado ou não existe." });

        // Preservamos FK e PK, atualizando somente parâmetros úteis
        configExistente.TemaEscuro = configuracao.TemaEscuro;
        configExistente.Idioma = configuracao.Idioma;
        configExistente.FusoHorario = configuracao.FusoHorario;
        configExistente.ExibirMetaNoDashboard = configuracao.ExibirMetaNoDashboard;
        configExistente.ReceberNotificacoes = configuracao.ReceberNotificacoes;
        configExistente.ReceberRelatorioSemanal = configuracao.ReceberRelatorioSemanal;

        await _context.SaveChangesAsync();

        return NoContent();
    }
}
