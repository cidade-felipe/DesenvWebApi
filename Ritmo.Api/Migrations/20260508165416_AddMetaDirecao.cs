using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ritmo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMetaDirecao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Direcao",
                table: "Metas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Direcao",
                table: "Metas");
        }
    }
}
