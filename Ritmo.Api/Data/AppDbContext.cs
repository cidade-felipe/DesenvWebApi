// Data/AppDbContext.cs

using Microsoft.EntityFrameworkCore;
using Ritmo.Api.Models;

namespace Ritmo.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<RegistroDiario> RegistrosDiarios { get; set; }
    public DbSet<Meta> Metas { get; set; }
    public DbSet<Insight> Insights { get; set; }
    public DbSet<ConfiguracaoPerfil> ConfiguracoesPerfil { get; set; }
    public DbSet<RegistroPeso> RegistrosPeso { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Email único — não pode haver dois usuários com o mesmo email.
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Relação 1:N — Usuario → RegistrosDiarios (cascade delete)
        modelBuilder.Entity<RegistroDiario>()
            .HasOne(r => r.Usuario)
            .WithMany(u => u.RegistrosDiarios)
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relação 1:N — Usuario → Metas (cascade delete)
        modelBuilder.Entity<Meta>()
            .HasOne(m => m.Usuario)
            .WithMany(u => u.Metas)
            .HasForeignKey(m => m.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relação 1:N — Usuario → Insights (cascade delete)
        modelBuilder.Entity<Insight>()
            .HasOne(i => i.Usuario)
            .WithMany(u => u.Insights)
            .HasForeignKey(i => i.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relação 1:1 — Usuario → ConfiguracaoPerfil (cascade delete)
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.ConfiguracaoPerfil)
            .WithOne(c => c.Usuario)
            .HasForeignKey<ConfiguracaoPerfil>(c => c.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
        // Relação 1:N — Usuario → RegistrosPeso (cascade delete)
        modelBuilder.Entity<RegistroPeso>()
            .HasOne(r => r.Usuario)
            .WithMany(u => u.RegistrosPeso)
            .HasForeignKey(r => r.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
