using Ritmo.Api.Models;

namespace Ritmo.Api.DTOs;

public class MedidaBiometricaRequest
{
    public int UsuarioId { get; set; }
    public decimal Peso { get; set; }
    public int Altura { get; set; }
    public DateTime Data { get; set; } = DateTime.UtcNow;

    public MedidaBiometrica ToEntity()
    {
        return new MedidaBiometrica
        {
            UsuarioId = this.UsuarioId,
            Peso = this.Peso,
            Altura = this.Altura,
            Data = this.Data
        };
    }
}

public class MedidaBiometricaResponse
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public decimal Peso { get; set; }
    public int Altura { get; set; }
    public decimal IMC { get; set; }
    public DateTime Data { get; set; }

    public static MedidaBiometricaResponse FromEntity(MedidaBiometrica entity)
    {
        // Cálculo do IMC: Peso / (Altura em metros ^ 2)
        decimal alturaMetros = (decimal)entity.Altura / 100;
        decimal imc = alturaMetros > 0 ? entity.Peso / (alturaMetros * alturaMetros) : 0;

        return new MedidaBiometricaResponse
        {
            Id = entity.Id,
            UsuarioId = entity.UsuarioId,
            Peso = entity.Peso,
            Altura = entity.Altura,
            IMC = Math.Round(imc, 1),
            Data = entity.Data
        };
    }
}
