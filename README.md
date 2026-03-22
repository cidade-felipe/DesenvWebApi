# Dashboard de Vida Pessoal (Personal Analytics Dashboard) - Primeiro Checkpoint

Esse é um repositório para o trabalho da matéria Desenvolvimento Web, do curso de TIC da UFSC de Araranguá.
**Alunos**: Felipe Cidade Soares e Leonardo Boteon
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

### Backend (.NET)

API REST com:

* Autenticação de usuário
* CRUD de registros diários
* Cálculo de métricas
* Geração de insights

---

### Banco de Dados (simples e funcional)

**Usuário**

* Id
* Nome
* Email
* Senha

**Registro Diário**

* Id
* UserId
* Data
* Humor
* Sono
* Estudo
* Produtividade
* Energia
* Exercício
* Água
* Observações

---

## 🔄 Fluxo do Sistema

1. Usuário faz login
2. Registra dados do dia
3. Backend salva no banco
4. Dashboard consome os dados
5. Sistema gera gráficos + insights automaticamente