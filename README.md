# Ritmo (Personal Analytics Dashboard)

Esse é um repositório para o trabalho da matéria Desenvolvimento Web, do curso de TIC da UFSC de Araranguá.
**Aluno**: Felipe Cidade Soares
**Professor**: Matheus Cataneo

---

## 💡 Ideia do Projeto

**Dashboard de Vida Pessoal (Personal Analytics Dashboard)**

Um sistema web que permite ao usuário registrar dados do dia a dia (sono, humor, produtividade, etc.) e transformar isso em **visualizações e insights inteligentes** sobre sua rotina.

O foco não é só armazenar dados, mas **analisar comportamento e gerar valor a partir deles**.

---

## 🎯 Objetivo

Ajudar o usuário a entender padrões da própria vida, respondendo coisas como:

* Quando sou mais produtivo?
* Dormir melhor realmente melhora meu humor?
* Em quais dias da semana eu rendo mais?

---

## 🧠 Diferencial do Projeto

* Não é só um “habit tracker”
* Gera **insights automáticos**
* Tem cara de produto real, não só trabalho acadêmico
* Conecta bem com dados, BI e análise

---

## 🧩 Funcionalidades Principais

### 1. Registro Diário

Usuário preenche dados do dia, por exemplo:

* Humor (escala 1-5)
* Horas de sono (decimal)
* Produtividade (1 a 5)
* Energia
* Exercício físico (sim/não)
* Água consumida
* Observações (texto livre)

---

### 2. Dashboard Geral

Visão rápida da rotina com:

* Média de sono
* Média de humor
* Total de horas estudadas
* Dias produtivos
* Comparação com semana anterior

---

### 3. Visualizações (Gráficos)

* Evolução do humor ao longo do tempo
* Horas de estudo por dia
* Sono vs produtividade
* Produtividade por dia da semana

---

### 4. Insights Automáticos

Mensagens geradas pelo sistema, por exemplo:

* “Você foi mais produtivo nas quartas e quintas”
* “Seu humor cai quando você dorme menos de 6h”
* “Você estudou mais esta semana do que na anterior”

Baseado em regras simples e análise de dados (não precisa IA pesada)

---

## 🖥️ Estrutura do Sistema

### Frontend (React)

Páginas principais:

* Login / cadastro
* Dashboard
* Registro diário
* Histórico
* Perfil

Tecnologias sugeridas:

* React + hooks
* Recharts ou Chart.js
* UI clean com cards e gráficos

---

### Backend (.NET 8)

API REST com:

* CRUD de usuários
* CRUD de registros diários
* CRUD de metas
* Geração e consulta de insights
* Swagger em `http://localhost:5066/swagger`

---

### Banco de Dados (PostgreSQL)

**Usuario**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| Nome | string | |
| Email | string | único |
| Senha | string | |
| DataCriacao | DateTime | |
| (Removido) | - | Altura movida para Biometria |

**RegistroDiario**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| UsuarioId | int FK | cascade delete |
| Data | DateOnly | |
| Humor | int | 1–5 |
| Sono | decimal | horas |
| (Removido) | - | Campo Estudo desativado |
| Produtividade | int | 1–5 |
| Energia | int | 1–5 |
| Exercicio | bool | |
| Agua | decimal | litros |
| Observacoes | string? | |

**MedidaBiometrica (Unificada)**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| UsuarioId | int FK | cascade delete |
| Peso | decimal | peso em kg |
| Altura | int | altura em cm |
| IMC | (Cálculo) | Calculado via DTO (API) |
| Data | DateTime | snapshot do momento |

**Meta**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| UsuarioId | int FK | cascade delete |
| Categoria | string | ex: "Sono", "Estudo" |
| ValorAlvo | decimal | ex: 7.5 horas |
| Descricao | string? | |
| DataInicio | DateOnly | |
| DataFim | DateOnly? | null = sem prazo |
| Ativa | bool | pode desativar sem deletar |

**Insight**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| UsuarioId | int FK | cascade delete |
| Mensagem | string | texto para o frontend |
| Categoria | string | ex: "Produtividade" |
| Nivel | string | "info", "positivo", "atencao" |
| DataGeracao | DateTime | |
| Lido | bool | controla badge de não lidos |

---

## 🔄 Fluxo do Sistema

1. Usuário se cadastra/loga
2. Registra dados do dia (`RegistroDiario`)
3. Define metas (`Meta`) para acompanhar seu desempenho
4. Backend gera e salva `Insights` com base nos registros
5. Dashboard exibe gráficos, compara metas vs real e mostra insights

---

---

## 🆕 Unificação Biométrica & Refinamento Analítico

O Ritmo atingiu um novo patamar de coesão técnica com a última atualização de arquitetura:

*   **Biometria Centralizada**: Peso e Altura agora viajam juntos na entidade `MedidaBiometrica`. Isso permite que o sistema mantenha um histórico real da evolução física do usuário, ideal para quem está em processos de mudança corporal.
*   **Inteligência no Backend**: O cálculo de **IMC** foi movido para a camada de serviço da API. O frontend apenas exibe o valor pronto, garantindo que a regra de negócio seja única e imune a erros de arredondamento no cliente.
*   **UI Resiliente**: O Dashboard agora é "à prova de falhas", com proteções (optional chaining e guards) que garantem carregamentos fluidos mesmo em conexões instáveis.
*   **Limpeza de Escopo**: Removemos métricas que dispersavam o foco (como o campo Estudo), consolidando o Ritmo como uma ferramenta de **Bem-estar e Saúde Comportamental**.
*   **Base de Dados Única**: Migração oficial concluída para o schema `ritmodb`, com suporte total a `DeleteBehavior.Cascade` para garantir a higienização dos dados do usuário.
