using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.Models;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PesosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PesosController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/pesos/usuario/5
    // Retorna todo o histórico de peso de um usuário específico.
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<RegistroPeso>>> GetPesosUsuario(int usuarioId)
    {
        var pesos = await _context.RegistrosPeso
            .Where(p => p.UsuarioId == usuarioId)
            .OrderByDescending(p => p.Data)
            .ToListAsync();

        return Ok(pesos);
    }

    // POST /api/pesos
    // Registra um novo peso.
    [HttpPost]
    public async Task<ActionResult<RegistroPeso>> PostPeso(RegistroPeso registro)
    {
        // Garante que o ID do usuário existe antes de salvar
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == registro.UsuarioId);
        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {registro.UsuarioId} não encontrado." });

        if (registro.Data == default)
            registro.Data = DateTime.UtcNow;

        // Cria uma data "pura" (00:00:00 UTC) para busca e comparação, eliminando problemas de fuso horário
        var dataLimpa = new DateTime(registro.Data.Year, registro.Data.Month, registro.Data.Day, 0, 0, 0, DateTimeKind.Utc);
        
        // Atualiza a data do registro para ser salva também na base UTC 00:00 se quisermos apenas "um por dia"
        // Ou mantemos a hora original se o usuário quiser saber o exato momento.
        // Vamos usar a dataLimpa para garantir a consistência do Upsert.
        registro.Data = dataLimpa;

        var dataInicio = dataLimpa;
        var dataFim = dataLimpa.AddDays(1);

        var pesoExistente = await _context.RegistrosPeso
            .FirstOrDefaultAsync(p => p.UsuarioId == registro.UsuarioId && p.Data >= dataInicio && p.Data < dataFim);

        if (pesoExistente != null)
        {
            pesoExistente.Valor = registro.Valor;
            pesoExistente.Data = dataLimpa; // Normaliza para 00:00 na atualização tb
            _context.RegistrosPeso.Update(pesoExistente);
            await _context.SaveChangesAsync();
            return Ok(pesoExistente);
        }

        _context.RegistrosPeso.Add(registro);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPesosUsuario), new { usuarioId = registro.UsuarioId }, registro);
    }

    // DELETE /api/pesos/5
    // Remove um registro específico de peso.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePeso(int id)
    {
        var registro = await _context.RegistrosPeso.FindAsync(id);
        if (registro == null)
            return NotFound(new { mensagem = "Registro de peso não encontrado." });

        _context.RegistrosPeso.Remove(registro);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
