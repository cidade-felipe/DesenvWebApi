// Data/AppDbContext.cs

using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Models;

namespace Ritmo.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSet de Usuarios — tabela "Usuarios" no banco.
    public DbSet<Usuario> Usuarios { get; set; }

    // DbSet de RegistrosDiarios — tabela "RegistrosDiarios" no banco.
    public DbSet<RegistroDiario> RegistrosDiarios { get; set; }

    // OnModelCreating permite configurações extras de mapeamento.
    // Aqui garantimos que o email do usuário é único no banco,
    // evitando cadastros duplicados a nível de banco de dados.
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Índice único para o email — não pode haver dois usuários com o mesmo email.
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Configura a relação 1:N entre Usuario e RegistroDiario.
        // Um usuário tem muitos registros diários.
        // Ao deletar um usuário, seus registros são deletados em cascata.
        modelBuilder.Entity<RegistroDiario>()
            .HasOne(r => r.Usuario)
            .WithMany(u => u.RegistrosDiarios)
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
