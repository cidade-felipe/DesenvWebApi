# IMC – Classificação, Cálculo e Interpretação por Faixa Etária

## O que é o IMC

O **Índice de Massa Corporal (IMC)** é um indicador adotado pela Organização Mundial da Saúde (OMS) para avaliar o estado nutricional de indivíduos com base na relação entre peso e altura. É amplamente utilizado em triagens clínicas e estudos epidemiológicos por ser simples de calcular e de aplicar em larga escala. Contudo, é uma ferramenta de rastreamento — não de diagnóstico definitivo — e deve ser interpretado em conjunto com outros indicadores clínicos.[1][2]

A fórmula do IMC é:

$$\[ \text{IMC} = \frac{\text{Peso (kg)}}{\text{Altura (m)}^2} \]$$

Por exemplo, uma pessoa com 70 kg e 1,60 m de altura tem IMC = 70 ÷ (1,60)² = **27,3**, classificado como sobrepeso.[3]

***

## Classificação para Adultos (20 a 65 anos)

Para adultos, o IMC é interpretado diretamente pelo valor absoluto, conforme a tabela padrão da OMS:[4][5]

| IMC (kg/m²) | Classificação                |
| ----------- | ---------------------------- |
| < 18,5      | Abaixo do peso               |
| 18,5 – 24,9 | Peso normal (eutrofia)       |
| 25,0 – 29,9 | Sobrepeso                    |
| 30,0 – 34,9 | Obesidade grau I             |
| 35,0 – 39,9 | Obesidade grau II            |
| ≥ 40,0      | Obesidade grau III (mórbida) |

***

## Classificação para Idosos (acima de 65 anos)

Em idosos, os pontos de corte são diferentes, pois a composição corporal muda com o envelhecimento:[6][7]

| IMC (kg/m²)     | Classificação             |
| --------------- | ------------------------- |
| ≤ 22,0          | Baixo peso                |
| > 22,0 e < 27,0 | Peso adequado (eutrófico) |
| ≥ 27,0          | Sobrepeso                 |

***

## Classificação para Crianças e Adolescentes (0 a 19 anos)

Para indivíduos menores de 20 anos, o IMC **não é interpretado por valor absoluto**. Em vez disso, utiliza-se o **IMC-para-idade**, avaliado pelo **Escore-Z** ou **percentil**, comparado às curvas de crescimento de referência da OMS.[8][9]

### Crianças de 0 a 5 anos (Referência OMS 2006)

| Escore-Z | Percentil aproximado | Classificação      |
| -------- | -------------------- | ------------------ |
| < -3     | < p 0,1              | Magreza acentuada  |
| -3 a -2  | p 0,1 a p 3          | Magreza            |
| -2 a +1  | p 3 a p 85           | Eutrofia (normal)  |
| +1 a +2  | p 85 a p 97          | Risco de sobrepeso |
| +2 a +3  | p 97 a p 99          | Sobrepeso          |
| > +3     | > p 99,9             | Obesidade          |

[10][11]

### Crianças de 5 a 10 anos e Adolescentes de 10 a 19 anos (Referência OMS 2007)

| Escore-Z | Percentil aproximado | Classificação     |
| -------- | -------------------- | ----------------- |
| < -3     | < p 0,1              | Magreza acentuada |
| -3 a -2  | p 0,1 a p 3          | Magreza           |
| -2 a +1  | p 3 a p 85           | Eutrofia (normal) |
| +1 a +2  | p 85 a p 97          | Sobrepeso         |
| > +2     | > p 97               | Obesidade         |

[12][8]

> **Nota importante:** em crianças menores de 5 anos, a obesidade só é classificada a partir de Escore-Z > +3; nas de 5 anos ou mais, o ponto de corte cai para > +2. Isso reflete a maior proporção natural de gordura corporal nos primeiros anos de vida.[8]

O SISVAN e o Ministério da Saúde adotam oficialmente as curvas OMS 2006 (menores de 5 anos) e OMS 2007 (5 a 19 anos) como referência no Brasil.[9][13]

***

## Como Calcular o Escore-Z e o Percentil

### Escore-Z

O Escore-Z indica quantos desvios-padrão o IMC da criança está acima ou abaixo da mediana de referência para sua idade e sexo. A forma simplificada é:[8]

\[ Z = \frac{X - \mu}{\sigma} \]

Onde \(X\) é o IMC observado, \(\mu\) é a mediana de referência da OMS e \(\sigma\) é o desvio-padrão da distribuição de referência para aquela idade e sexo.

Na prática, a OMS utiliza o método **LMS** (Box-Cox), que corrige assimetrias na distribuição com três parâmetros tabelados por idade: **L** (potência de Box-Cox), **M** (mediana) e **S** (coeficiente de variação). A fórmula completa fica:[10]

\[ Z = \frac{(X/M)^L - 1}{L \times S} \]

Os valores de L, M e S são extraídos diretamente das tabelas de referência disponibilizadas pela OMS.[11]

### Percentil

O percentil representa a posição do IMC da criança dentro da distribuição de referência — ou seja, a porcentagem de crianças da mesma idade e sexo com IMC igual ou menor. A conversão do Escore-Z para percentil usa a função de distribuição acumulada da distribuição normal padrão:[8]

\[ \text{Percentil} = \Phi(Z) \times 100 \]

Alguns valores de referência rápida:
- Z = 0 → percentil 50 (mediana)
- Z = +1 → aproximadamente percentil 84
- Z = -2 → aproximadamente percentil 2,3

### Ferramentas Práticas

O cálculo manual é raro na prática clínica. As ferramentas oficiais utilizadas são:[9][8]

- **WHO Anthro** (para 0–5 anos) e **WHO AnthroPlus** (para 5–19 anos): softwares gratuitos da OMS que calculam automaticamente Escore-Z e percentil a partir de peso, altura, idade e sexo
- **SISVAN Web**: sistema do Ministério da Saúde com cálculo integrado ao prontuário eletrônico
- **Tabelas de referência da OMS**: permitem consulta direta dos valores de IMC correspondentes a cada Escore-Z por faixa de idade e sexo

***

## Limitações do IMC

O IMC é uma ferramenta de triagem eficaz para análises populacionais, mas apresenta limitações individuais importantes:[14][2]

- **Não diferencia massa muscular de gordura corporal**: atletas musculosos podem ser classificados incorretamente como obesos
- **Não considera a distribuição de gordura**: a gordura abdominal (visceral) é mais nociva à saúde do que a periférica, mas o IMC não a distingue
- **Variações étnicas**: populações asiáticas, por exemplo, apresentam maior risco metabólico em IMC menor do que o ponto de corte padrão da OMS

Por isso, o IMC deve sempre ser interpretado em conjunto com outros indicadores, como **circunferência da cintura**, **percentual de gordura corporal** e avaliação clínica individualizada.[2][3]