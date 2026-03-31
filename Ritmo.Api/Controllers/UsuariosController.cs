// Controllers/UsuariosController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Data;
using Ritmo.Api.Models;

namespace Ritmo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================================
    // GET /api/usuarios
    // Retorna todos os usuários (sem a senha por segurança).
    // =====================================================================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios
            .Select(u => new { u.Id, u.Nome, u.Email, u.DataCriacao })
            .ToListAsync();

        return Ok(usuarios);
    }

    // =====================================================================
    // GET /api/usuarios/5
    // Retorna um usuário pelo ID (sem a senha).
    // =====================================================================
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .Where(u => u.Id == id)
            .Select(u => new { u.Id, u.Nome, u.Email, u.DataCriacao })
            .FirstOrDefaultAsync();

        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        return Ok(usuario);
    }

    // =====================================================================
    // POST /api/usuarios
    // Cria um novo usuário.
    //
    // Body esperado:
    // {
    //   "nome": "Felipe",
    //   "email": "felipe@email.com",
    //   "senha": "minhasenha123"
    // }
    // =====================================================================
    [HttpPost]
    public async Task<ActionResult<object>> PostUsuario(Usuario usuario)
    {
        // Verifica se já existe um usuário com o mesmo email.
        var emailExistente = await _context.Usuarios
            .AnyAsync(u => u.Email == usuario.Email);

        if (emailExistente)
            return Conflict(new { mensagem = "Já existe um usuário cadastrado com esse email." });

        // Define a data de criação pelo servidor.
        usuario.DataCriacao = DateTime.UtcNow;

        // Cria automaticamente as configurações padrão de perfil (relação 1:1)
        usuario.ConfiguracaoPerfil = new ConfiguracaoPerfil();

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        // Retorna 201 sem expor a senha na resposta.
        var resposta = new { usuario.Id, usuario.Nome, usuario.Email, usuario.DataCriacao };
        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, resposta);
    }

    // =====================================================================
    // PUT /api/usuarios/5
    // Atualiza nome e/ou senha do usuário.
    // =====================================================================
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
    {
        if (id != usuario.Id)
            return BadRequest(new { mensagem = "O ID da URL não corresponde ao ID no body." });

        var usuarioExistente = await _context.Usuarios.FindAsync(id);

        if (usuarioExistente == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        // Atualiza apenas campos permitidos. Email e DataCriacao permanecem inalterados.
        usuarioExistente.Nome = usuario.Nome;
        usuarioExistente.Senha = usuario.Senha;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =====================================================================
    // DELETE /api/usuarios/5
    // Remove o usuário e seus registros diários (cascade).
    // =====================================================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
            return NotFound(new { mensagem = $"Usuário com ID {id} não encontrado." });

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
