# Ritmo

Sistema web de análise pessoal, desenvolvido como projeto da disciplina de Desenvolvimento Web do curso de TIC da UFSC Araranguá.

**Aluno**: Felipe Cidade Soares  
**Professor**: Matheus Cataneo

## Visão geral

O Ritmo permite registrar dados do dia a dia, como sono, humor, produtividade, energia, água, exercício e biometria, para transformar isso em uma visão analítica da rotina.

Hoje o projeto já funciona como um MVP full stack com:

- backend em .NET 8
- frontend em React + Vite
- banco PostgreSQL
- autenticação JWT
- biometria histórica com peso, altura e IMC
- metas comportamentais e biométricas
- gráficos, cards e relatórios

## Stack

### Backend

- ASP.NET Core Web API
- Entity Framework Core 8
- Npgsql
- Swagger
- JWT Bearer Authentication

### Frontend

- React
- Vite
- Axios
- Recharts
- XLSX

## Funcionalidades implementadas

### Autenticação e usuário

- cadastro de usuário com nome, email, data de nascimento e sexo biológico
- login com JWT
- senhas armazenadas com hash
- proteção de rotas por usuário autenticado

### Registro diário

- humor
- sono
- produtividade
- energia
- exercício
- água
- observações

O registro diário usa lógica de upsert por data. Se o usuário salvar novamente o mesmo dia, o backend atualiza o registro existente.

### Biometria

- peso
- altura
- IMC calculado no backend
- classificação e cor da faixa de IMC
- histórico consolidado por dia

Se o usuário registrar biometria mais de uma vez no mesmo dia, a API atualiza o valor do dia em vez de criar duplicidade lógica.

### Metas

Categorias suportadas atualmente:

- Sono
- Agua
- Humor
- Produtividade
- Energia
- Treino
- Peso

O progresso das metas funciona assim:

- hábitos diários, como sono e água, usam média recente
- treino usa contagem de dias com exercício
- peso usa aproximação do alvo, funcionando tanto para perda quanto para ganho de peso

### Dashboard

- cabeçalho com saudação contextual usando o primeiro nome do usuário
- cards de resumo com leitura agregada de bem-estar, treino, recuperação e corpo
- gráficos de panorama
- aba de análise com filtros por período, intervalo customizado e agrupamento diário, semanal, quinzenal e mensal
- gráfico de peso por período com reaproveitamento do último peso conhecido
- gráfico de bem-estar com humor, energia, produtividade e linha composta de bem-estar
- gráfico separado para sono
- aba de relatórios com filtros por período, intervalo customizado e foco do histórico, como treino, biometria e anotações
- exportação CSV e Excel respeitando os filtros ativos e usando o mesmo formato de data da interface

## Segurança e robustez já adicionadas

- hash de senha no backend
- autenticação JWT
- autorização por dono do recurso
- CORS configurável por origem
- validações com DataAnnotations
- validações semânticas de domínio
- `appsettings.Local.json` para configuração local fora do Git
- `AppDbContextFactory` para `dotnet ef`

## Estrutura do projeto

```text
RitmoApi/
  Ritmo.Api/     -> backend .NET 8
  frontend/      -> frontend React + Vite
  Backup/        -> cópias de segurança criadas durante alterações
```

## Como rodar localmente

### 1. Banco

O projeto usa PostgreSQL. Configure uma base local, por exemplo `ritmodb`.

### 2. Configuração local do backend

Crie ou ajuste o arquivo `Ritmo.Api/appsettings.Local.json` com:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ritmodb;Username=postgres;Password=SUA_SENHA"
  },
  "Jwt": {
    "Issuer": "Ritmo.Api",
    "Audience": "Ritmo.Frontend",
    "Key": "uma-chave-longa-com-pelo-menos-32-caracteres",
    "ExpirationMinutes": 120
  },
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ]
  }
}
```

Esse arquivo é ignorado pelo Git.

### 3. Aplicar migrations

```powershell
dotnet ef database update --project Ritmo.Api
```

### 4. Rodar o backend

```powershell
dotnet run --project Ritmo.Api
```

Swagger:

```text
http://localhost:5066/swagger
```

### 5. Rodar o frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Modelo de dados

### Usuario

- Id
- Nome
- Email
- Senha
- DataCriacao
- DataNascimento
- Sexo

### RegistroDiario

- Id
- UsuarioId
- Data
- Humor
- Sono
- Produtividade
- Energia
- Exercicio
- Agua
- Observacoes
- DataCriacao

### MedidaBiometrica

- Id
- UsuarioId
- Peso
- Altura
- Data

### Meta

- Id
- UsuarioId
- Categoria
- ValorAlvo
- Descricao
- DataInicio
- DataFim
- Ativa
- DataCriacao

### Insight

- Id
- UsuarioId
- Mensagem
- Categoria
- Nivel
- DataGeracao
- Lido

### ConfiguracaoPerfil

- Id
- UsuarioId
- TemaEscuro
- Idioma
- FusoHorario
- ReceberNotificacoes
- ReceberRelatorioSemanal
- ExibirMetaNoDashboard

## Estado atual do produto

**Fato**

O projeto já tem fluxo real ponta a ponta, autenticação, persistência, histórico biométrico e dashboard funcional.

**Inferência**

Ele está acima de um protótipo vazio, mas ainda abaixo de um sistema pronto para produção.

**Principais pontos ainda pendentes**

- refresh token
- rate limiting no login
- testes automatizados
- pipeline CI/CD
- observabilidade e métricas operacionais
- tratamento de erro mais amigável no frontend

## Observação sobre insights

O sistema possui entidade, endpoints e interface para insights, mas a geração automática ainda não está consolidada como motor analítico completo no backend. A documentação anterior dava essa funcionalidade como pronta, o que hoje seria impreciso.
