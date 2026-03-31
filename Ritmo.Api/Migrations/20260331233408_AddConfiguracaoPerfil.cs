using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Ritmo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddConfiguracaoPerfil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfiguracoesPerfil",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    TemaEscuro = table.Column<bool>(type: "boolean", nullable: false),
                    Idioma = table.Column<string>(type: "text", nullable: false),
                    FusoHorario = table.Column<string>(type: "text", nullable: false),
                    ExibirMetaNoDashboard = table.Column<bool>(type: "boolean", nullable: false),
                    ReceberNotificacoes = table.Column<bool>(type: "boolean", nullable: false),
                    ReceberRelatorioSemanal = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfiguracoesPerfil", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ConfiguracoesPerfil_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConfiguracoesPerfil_UsuarioId",
                table: "ConfiguracoesPerfil",
                column: "UsuarioId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfiguracoesPerfil");
        }
    }
}
