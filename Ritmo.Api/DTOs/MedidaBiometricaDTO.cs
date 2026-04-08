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
    public string ImcClassificacao { get; set; } = string.Empty;
    public string ImcCor { get; set; } = string.Empty;

    public static MedidaBiometricaResponse FromEntity(MedidaBiometrica entity, DateOnly dataNascimento)
    {
        // Cálculo do IMC: Peso / (Altura em metros ^ 2)
        decimal alturaMetros = (decimal)entity.Altura / 100;
        decimal imc = alturaMetros > 0 ? entity.Peso / (alturaMetros * alturaMetros) : 0;
        decimal imcRounded = Math.Round(imc, 1);

        // Cálculo exato de idade
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        int idade = hoje.Year - dataNascimento.Year;
        if (hoje.Month < dataNascimento.Month || (hoje.Month == dataNascimento.Month && hoje.Day < dataNascimento.Day))
        {
            idade--;
        }

        var (classificacao, cor) = GetImcCategory(imcRounded, idade);

        return new MedidaBiometricaResponse
        {
            Id = entity.Id,
            UsuarioId = entity.UsuarioId,
            Peso = entity.Peso,
            Altura = entity.Altura,
            IMC = imcRounded,
            Data = entity.Data,
            ImcClassificacao = classificacao,
            ImcCor = cor
        };
    }

    private static (string classificacao, string cor) GetImcCategory(decimal imc, int idade)
    {
        if (imc <= 0) return ("Aguardando Dados", "gray");

        if (idade >= 65)
        {
            // Regras para Idosos OMS
            if (imc <= 22m) return ("Baixo peso", "#f1c40f");
            if (imc < 27m) return ("Peso adequado", "#2ecc71");
            return ("Sobrepeso", "#e67e22");
        }
        else
        {
            // Regras Padrão (Adultos)
            if (imc < 18.5m) return ("Abaixo do peso", "#f1c40f");
            if (imc < 25m) return ("Peso normal", "#2ecc71");
            if (imc < 30m) return ("Sobrepeso", "#e67e22");
            if (imc < 35m) return ("Obesidade grau I", "#e74c3c");
            if (imc < 40m) return ("Obesidade grau II", "#c0392b");
            return ("Obesidade grau III", "#900C3F");
        }
    }
}
