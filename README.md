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

* Humor (escala ou emojis)
* Horas de sono
* Horas de estudo
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
| Altura | int? | centímetros |

**RegistroDiario**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| UsuarioId | int FK | cascade delete |
| Data | DateOnly | |
| Humor | int | 1–5 |
| Sono | decimal | horas |
| Estudo | decimal | horas |
| Produtividade | int | 1–5 |
| Energia | int | 1–5 |
| Exercicio | bool | |
| Agua | decimal | litros |
| Observacoes | string? | |

**RegistroPeso (Novo)**

| Campo | Tipo | Obs |
|---|---|---|
| Id | int PK | |
| UsuarioId | int FK | cascade delete |
| Valor | decimal | peso em kg |
| Data | DateTime | gerado automaticamente |

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

## 🆕 Atualizações Recentes (Módulo Biometria & UI)

Nesta última atualização, o projeto recebeu um intenso aprimoramento focado no monitoramento corporal e na melhoria espacial do Dashboard:

* **Monitoramento Biométrico Fixado:** Inclusão de um novo modelo `RegistroPeso` no PostgreSQL suportado por um novo `PesosController`. O sistema agora coleta a *Altura* (perfil permanente) do usuário e seu *Peso Hoje* através do formulário diário unificado.
* **Métricas em Tempo Real:** O painel processa matematicamente a biometria para exibir o IMC exato e estabelecer a Faixa de Peso Saudável em cartões no topo da tela.
* **Layout "Cockpit" (1600px):** 
    * Expansão lateral das bordas do container.
    * A interface agora foi cravada em uma *Grid* rígida e previsível: 6 cartões no formato `3x2` e logo abaixo, 3 grandes gráficos no formato `3x1`.
* **Escalas Híbridas (ComposedChart):** Para contornar a distorção do Polígono de Habilidades, o gráfico de Curva Físico-Recuperativa foi transformado em um gráfico Misto. Ele sobrepõe o Consumo de Água (Barras) com Horas de Sono (Área), respeitando os eixos numéricos originais de ambos sem distorcê-los.
* **Novo Repositório de Dados:** Toda a cadeia de conexão foi transferida oficialmente do `produtosdb` antigo, para a nova raiz conceitual `ritmodb`.
