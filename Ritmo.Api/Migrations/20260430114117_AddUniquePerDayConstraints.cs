using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ritmo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUniquePerDayConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RegistrosDiarios_UsuarioId",
                table: "RegistrosDiarios");

            migrationBuilder.DropIndex(
                name: "IX_MedidasBiometricas_UsuarioId",
                table: "MedidasBiometricas");

            migrationBuilder.AddColumn<DateOnly>(
                name: "DataDia",
                table: "MedidasBiometricas",
                type: "date",
                nullable: false,
                computedColumnSql: "\"Data\"::date",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosDiarios_UsuarioId_Data",
                table: "RegistrosDiarios",
                columns: new[] { "UsuarioId", "Data" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedidasBiometricas_UsuarioId_DataDia",
                table: "MedidasBiometricas",
                columns: new[] { "UsuarioId", "DataDia" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RegistrosDiarios_UsuarioId_Data",
                table: "RegistrosDiarios");

            migrationBuilder.DropIndex(
                name: "IX_MedidasBiometricas_UsuarioId_DataDia",
                table: "MedidasBiometricas");

            migrationBuilder.DropColumn(
                name: "DataDia",
                table: "MedidasBiometricas");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosDiarios_UsuarioId",
                table: "RegistrosDiarios",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_MedidasBiometricas_UsuarioId",
                table: "MedidasBiometricas",
                column: "UsuarioId");
        }
    }
}
