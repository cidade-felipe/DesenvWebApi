using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ritmo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMetaValorInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ValorInicial",
                table: "Metas",
                type: "numeric",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValorInicial",
                table: "Metas");
        }
    }
}
