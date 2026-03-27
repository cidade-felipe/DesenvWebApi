// Controllers/RegistrosDiariosController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.Models;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrosDiariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public RegistrosDiariosController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================================
    // GET /api/registrosdiarios
    // Retorna todos os registros de todos os usuários.
    // =====================================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RegistroDiario>>> GetRegistros()
    {
        var registros = await _context.RegistrosDiarios
            .OrderByDescending(r => r.Data)
            .ToListAsync();

        return Ok(registros);
    }

    // =====================================================================
    // GET /api/registrosdiarios/5
    // Retorna um registro específico pelo ID.
    // =====================================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<RegistroDiario>> GetRegistro(int id)
    {
        var registro = await _context.RegistrosDiarios.FindAsync(id);

        if (registro == null)
            return NotFound(new { mensagem = $"Registro com ID {id} não encontrado." });

        return Ok(registro);
    }

    // =====================================================================
    // GET /api/registrosdiarios/usuario/3
    // Retorna todos os registros de um usuário específico,
    // ordenados do mais recente para o mais antigo.
    //
    // Essa é a rota mais usada no frontend — o dashboard de um usuário
    // chama esta rota para carregar o histórico.
    // =====================================================================
    [HttpGet("usuario/{usuarioId}")]
    public async Task<ActionResult<IEnumerable<RegistroDiario>>> GetRegistrosPorUsuario(int usuarioId)
    {
        // Verifica se o usuário existe antes de buscar os registros.
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == usuarioId);

        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {usuarioId} não encontrado." });

        var registros = await _context.RegistrosDiarios
            .Where(r => r.UsuarioId == usuarioId)
            .OrderByDescending(r => r.Data)
            .ToListAsync();

        return Ok(registros);
    }

    // =====================================================================
    // POST /api/registrosdiarios
    // Cria um novo registro diário.
    //
    // Body esperado:
    // {
    //   "usuarioId": 1,
    //   "data": "2026-03-26",
    //   "humor": 4,
    //   "sono": 7.5,
    //   "estudo": 3.0,
    //   "produtividade": 4,
    //   "energia": 3,
    //   "exercicio": true,
    //   "agua": 2.0,
    //   "observacoes": "Dia bem produtivo."
    // }
    // =====================================================================
    [HttpPost]
    public async Task<ActionResult<RegistroDiario>> PostRegistro(RegistroDiario registro)
    {
        // Verifica se o usuário existe.
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == registro.UsuarioId);

        if (!usuarioExiste)
            return NotFound(new { mensagem = $"Usuário com ID {registro.UsuarioId} não encontrado." });

        // Define a data de criação pelo servidor.
        registro.DataCriacao = DateTime.UtcNow;

        _context.RegistrosDiarios.Add(registro);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRegistro), new { id = registro.Id }, registro);
    }

    // =====================================================================
    // PUT /api/registrosdiarios/5
    // Atualiza todos os campos de um registro existente.
    // =====================================================================
    [HttpPut("{id}")]
    public async Task<IActionResult> PutRegistro(int id, RegistroDiario registro)
    {
        if (id != registro.Id)
            return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID no body." });

        var registroExistente = await _context.RegistrosDiarios.FindAsync(id);

        if (registroExistente == null)
            return NotFound(new { mensagem = $"Registro com ID {id} não encontrado." });

        // Atualiza todos os campos editáveis.
        // UsuarioId e DataCriacao não são alterados.
        registroExistente.Data = registro.Data;
        registroExistente.Humor = registro.Humor;
        registroExistente.Sono = registro.Sono;
        registroExistente.Estudo = registro.Estudo;
        registroExistente.Produtividade = registro.Produtividade;
        registroExistente.Energia = registro.Energia;
        registroExistente.Exercicio = registro.Exercicio;
        registroExistente.Agua = registro.Agua;
        registroExistente.Observacoes = registro.Observacoes;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =====================================================================
    // DELETE /api/registrosdiarios/5
    // Remove um registro pelo ID.
    // =====================================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRegistro(int id)
    {
        var registro = await _context.RegistrosDiarios.FindAsync(id);

        if (registro == null)
            return NotFound(new { mensagem = $"Registro com ID {id} não encontrado." });

        _context.RegistrosDiarios.Remove(registro);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
