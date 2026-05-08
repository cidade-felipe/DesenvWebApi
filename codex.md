# Codex.md, contexto completo do projeto RitmoApi

Este arquivo foi criado para funcionar como uma memoria longa do projeto. A ideia e que uma proxima interacao com Codex consiga entender rapidamente o que este repositorio e, como ele funciona, quais decisoes ja foram tomadas, quais riscos existem e por onde continuar sem precisar redescobrir tudo do zero.

Data da criacao deste documento: 07/05/2026  
Ultima atualizacao documentada: 08/05/2026
Workspace analisado: `c:\Users\felip\OneDrive\git_work\RitmoApi`  
Fuso informado no ambiente: `America/Sao_Paulo`  
Modo de leitura usado: varredura manual do repositorio, leitura de backend, frontend, configuracoes, documentacao, migrations e validacao de build/lint.

## 1. Como usar este arquivo em uma proxima conversa

Leia este arquivo primeiro quando o contexto da conversa antiga nao estiver disponivel.

Prioridade recomendada de leitura:

1. `Resumo executivo`
2. `Mapa mental rapido`
3. `Arquitetura real`
4. `Fluxos principais`
5. `Regras de negocio`
6. `Riscos e dividas tecnicas`
7. `Comandos uteis`
8. Secoes detalhadas conforme a tarefa

Este documento mistura tres tipos de afirmacao:

- Fato: foi verificado diretamente no codigo, em arquivos do repo ou em comandos executados.
- Inferencia: deducao baseada na estrutura, documentacao e comportamento do codigo.
- Opiniao tecnica: julgamento de engenharia sobre qualidade, trade-offs e proximos passos.

Sempre que for alterar arquivos neste projeto, respeite as regras do usuario registradas no prompt:

- Conversar em portugues do Brasil, em tom casual e claro.
- Validar se o problema esta bem definido antes de propor solucao.
- Diferenciar fato, inferencia e opiniao tecnica quando fizer analise.
- Preferir solucoes simples, corretas e sustentaveis.
- Evitar gambiarras.
- Usar backup antes de alterar, substituir ou apagar arquivos existentes.
- Se for instalar dependencias Python, verificar `venv` antes, e se precisar criar usar `python -m venv venv`, nunca `.venv`.
- Preferir aspas simples em codigo quando fizer sentido.

Regra local muito importante sobre backups:

Se for alterar arquivo existente:

1. Criar `Backup/` na raiz se nao existir.
2. Criar pasta diaria dentro de `Backup/` no formato `dia_mes_ano`, exemplo `07_05_2026`.
3. Salvar a versao anterior com formato `nome_original_do_arquivo_dia_mes_ano_hora_min_seg.extensao`.
4. Se o arquivo estiver em subpasta, reproduzir uma subpasta dentro do backup conforme a regra do usuario.

Observacao: `codex.md` foi criado como arquivo novo. Como nao havia versao anterior, nao houve backup de arquivo antigo.

## 1.1. Regra operacional: ciclo completo de atualizacao do repositorio

Sempre que alguma alteracao for feita no repositorio, perguntar ao usuario antes de finalizar:

```text
Quer que eu faca o ciclo completo de atualizacao do repo agora?
```

O ciclo completo solicitado pelo usuario neste projeto significa:

1. Confirmar branch atual e estado do workspace:
   - `git branch --show-current`
   - `git status -sb`
2. Validar o que foi alterado:
   - revisar `git diff --stat`
   - rodar validacoes relevantes, por exemplo backend build, frontend build e lint quando fizer sentido
   - rodar `git diff --check`
3. Na branch `city`:
   - garantir que esta na `city`
   - fazer `git add -A`
   - criar commit com mensagem clara em portugues do Brasil
   - enviar para `origin/city`
4. Atualizar a `main`:
   - trocar para `main`
   - executar pull seguro com fast-forward: `git pull --ff-only origin main`
   - fazer merge da `city` com commit explicito, preferindo `git merge --no-ff city -m "mensagem em portugues"`
   - validar novamente quando a mudanca for relevante
   - enviar para `origin/main`
5. Voltar para `city`:
   - `git checkout city`
   - confirmar `git status -sb`
   - confirmar `git branch -vv`

Observacoes importantes:

- Se o GitHub falhar com `SSL certificate problem: unable to get local issuer certificate`, usar `git -c http.sslBackend=schannel ...` no comando de rede.
- Nao fazer esse ciclo automaticamente sem perguntar, a menos que o usuario tenha pedido explicitamente no turno atual.
- Se houver mudancas do usuario ou arquivos inesperados, pausar e explicar antes de commitar.
- Backups locais em `Backup/` nao devem entrar no Git.

## Atualizacao rapida de 08/05/2026

### Fato

Foram adicionadas duas correcoes importantes depois da criacao original deste arquivo:

- Login agora diferencia usuario inexistente de senha incorreta.
- Meta de peso agora usa historico para inferir reducao, ganho ou manutencao, sem mostrar `kg ou mais` ou `kg ou menos` no rotulo visual.
- Metas novas de peso agora salvam `direcao`, com valores `reduzir`, `ganhar` ou `manter`, para nao depender apenas de inferencia.
- Metas novas de peso tambem salvam `ValorInicial`, usando a biometria mais recente como contexto historico.
- A barra de peso mostra proximidade do peso atual com o alvo. Exemplo: `75 kg` para meta `73 kg` ou `77 kg` deve aparecer quase cheio, porque ja esta perto.
- A barra de peso usa marcador percentual acima da trilha e cor progressiva por proximidade: alerta quando longe, ciano quando perto e verde quando praticamente concluida.
- Foi adicionada a regra operacional de sempre perguntar se o usuario quer executar o ciclo completo de atualizacao do repo apos mudancas.

### Detalhe de autenticacao

`UsuarioService.Login` retorna `LoginResult`, com status semantico:

- `Sucesso`
- `UsuarioNaoEncontrado`
- `SenhaInvalida`

`UsuariosController.Login` converte isso em HTTP:

- `404 NotFound` para email inexistente
- `401 Unauthorized` para senha incorreta
- `200 OK` para sucesso

O frontend ja exibe `err.response?.data?.mensagem`, entao a mudanca de UX veio do backend.

### Detalhe de meta de peso

`Dashboard.jsx`, em `getMetaProgress`, continua sendo a fonte da regra visual de progresso das metas.

Para peso:

- metas novas usam `meta.direcao`
- metas novas podem ter `meta.valorInicial`, mas a barra usa proximidade entre peso atual e alvo
- a UI de metas de peso usa `weight-progress-marker` acima da barra para evitar que a porcentagem caia sobre os textos inferiores
- a cor da barra vem de `getProgressColor`, variando conforme o percentual de proximidade
- se existe historico anterior acima do alvo e o peso atual chegou no alvo ou abaixo dele, a meta fica `concluido`
- se existe historico anterior abaixo do alvo e o peso atual chegou no alvo ou acima dele, a meta fica `concluido`
- se o usuario ja estava perto do alvo, a meta vira manutencao
- o label visual fica simples, por exemplo `Meta: 75.0 kg`
- metas antigas sem `direcao` continuam usando inferencia pelo historico como fallback

Exemplo real validado na conversa:

- meta: `75.0 kg`
- peso atual: `74.0 kg`
- historico anterior acima de 75 kg
- resultado esperado: meta concluida, progresso 100%

### Validacoes executadas nessa atualizacao

- `dotnet build Ritmo.Api\Ritmo.Api.csproj -o Ritmo.Api\obj\codex-validate /p:UseAppHost=false`: sucesso, 0 avisos, 0 erros.
- `npm run build` em `frontend`: sucesso.

Observacao:

- O build padrao da solution pode falhar se a API estiver aberta segurando `Ritmo.Api.exe` ou `Ritmo.Api.dll`. Nesse caso, validar com output alternativo dentro de `obj` evita interferir na instancia em execucao.

## 2. Resumo executivo

### Fato

O Ritmo e um sistema web full stack de analise pessoal, com foco em rotina, bem-estar, biometria e metas. O backend usa ASP.NET Core Web API em .NET 8, Entity Framework Core 8, PostgreSQL, Npgsql, Swagger e autenticacao JWT. O frontend usa React, Vite, Axios, Recharts, lucide-react e XLSX.

### Fato

O produto ja tem fluxo real ponta a ponta:

- cadastro de usuario
- login com JWT
- mensagens especificas para usuario inexistente e senha incorreta no login
- hash de senha no backend
- carregamento de dashboard autenticada
- CRUD ou fluxo equivalente de registros diarios
- upsert de registro diario por data
- biometria historica com peso, altura e IMC calculado
- metas por categoria
- meta de peso com direcao inferida pelo historico
- insights persistidos e marcacao como lido
- configuracoes de perfil
- atualizacao de perfil
- troca de senha
- exclusao de conta com senha atual
- dashboard com graficos, cards, filtros, relatorios e exportacao CSV/Excel

### Fato

As validacoes mais importantes nao estao apenas no frontend. O backend valida dominio nos services e o banco reforca integridade com indices unicos:

- email unico em `Usuarios.Email`
- um registro diario por usuario e data em `RegistrosDiarios(UsuarioId, Data)`
- uma biometria por usuario e dia em `MedidasBiometricas(UsuarioId, DataDia)`, onde `DataDia` e coluna computada a partir de `Data`

### Inferencia

O projeto esta acima de um prototipo visual. Ele tem persistencia real, autorizacao por dono, migracoes e fluxo autenticado. Mas ainda nao esta pronto para producao porque faltam testes automatizados, refresh token, rate limiting, observabilidade, pipeline e endurecimento de seguranca.

### Opiniao tecnica

A base do backend esta melhor organizada que o frontend. O backend segue uma arquitetura simples e compreensivel: controllers, services, DTOs, models e DbContext. O frontend entrega bastante valor de produto, mas concentra muita logica em `Dashboard.jsx`, que virou o principal ponto de risco para manutencao.

## 3. Mapa mental rapido

Produto:

- Nome: Ritmo
- Dominio: analise pessoal de rotina, saude comportamental e biometria
- Publico provavel: usuario individual acompanhando sono, humor, produtividade, energia, agua, exercicio, peso, altura e metas
- Estado: MVP funcional

Backend:

- Projeto: `Ritmo.Api`
- Solucao: `RitmoApi.sln`
- Framework: `.NET 8`
- Banco: PostgreSQL
- ORM: Entity Framework Core 8
- Autenticacao: JWT Bearer
- Documentacao de API: Swagger em desenvolvimento

Frontend:

- Pasta: `frontend`
- Framework: React
- Bundler: Vite
- HTTP: Axios
- Graficos: Recharts
- Icones: lucide-react
- Exportacao Excel: xlsx

Arquivos centrais:

- `README.md`: visao geral funcional e como rodar
- `documentation.md`: documentacao tecnica mais detalhada
- `Ritmo.Api/Program.cs`: bootstrap da API
- `Ritmo.Api/Data/AppDbContext.cs`: modelo EF e constraints
- `Ritmo.Api/Services/*.cs`: regras de negocio
- `Ritmo.Api/Controllers/*.cs`: endpoints REST
- `frontend/src/App.jsx`: rotas SPA
- `frontend/src/pages/Login.jsx`: login/cadastro
- `frontend/src/pages/Dashboard.jsx`: orquestracao principal da dashboard
- `frontend/src/hooks/useDashboardData.js`: carregamento autenticado da dashboard
- `frontend/src/api/apiClient.js`: Axios base e interceptors

Comandos que passaram na ultima varredura:

- `dotnet build RitmoApi.sln`
- `npm run build` dentro de `frontend`
- `npm run lint` dentro de `frontend`

Comandos que passaram na atualizacao de 08/05/2026:

- `dotnet build Ritmo.Api\Ritmo.Api.csproj -o Ritmo.Api\obj\codex-validate /p:UseAppHost=false`
- `npm run build` dentro de `frontend`

Testes:

- Fato: nao foram encontrados arquivos de teste automatizado.
- Fato: documentacao tambem assume ausencia de suite de testes.

## 4. Estrutura do repositorio

Raiz observada:

```text
RitmoApi/
  .git/
  .runlogs/
  backend/
  Backup/
  frontend/
  image/
  instructions/
  Ritmo.Api/
  .gitignore
  build_errors.txt
  documentation.md
  LICENSE
  README.md
  regras_avaliacao.md
  RitmoApi.sln
```

### Fato

`RitmoApi.sln` contem apenas o projeto:

```text
Ritmo.Api/Ritmo.Api.csproj
```

### Fato

As pastas `backend/` e `image/` existem, mas nao tinham arquivos na varredura. Podem ser sobras historicas ou placeholders.

### Fato

`.gitignore` ignora:

- `.vscode/`
- `instructions/`
- `Backup/`
- binarios .NET (`bin/`, `obj/`)
- `frontend/node_modules/`
- `frontend/dist/`
- logs e temporarios
- `.runlogs/`
- `Ritmo.Api/.keys/`
- `Ritmo.Api/appsettings.Local.json`

### Inferencia

`instructions/` e `Backup/` fazem parte do fluxo local de desenvolvimento, mas nao sao parte do produto versionado. Isso e coerente com a regra do usuario de manter backups locais fora do Git.

## 5. Estado do Git e validacao local

Na varredura anterior:

- `git status --short`: limpo antes da criacao deste arquivo.
- `dotnet build RitmoApi.sln`: sucesso, 0 avisos, 0 erros.
- `npm run build`: sucesso.
- `npm run lint`: sucesso.
- Busca por arquivos de teste: 0 resultados.

Observacao sobre arquivos de build antigos:

- `build_errors.txt` registra erro antigo de build causado por `Ritmo.Api.exe` bloqueado por processo em execucao.
- `Ritmo.Api/build_output.txt` mostra historico de build com warnings antigos pelo mesmo motivo.
- Na validacao mais recente, `dotnet build RitmoApi.sln` passou limpo.

Impacto pratico:

- Se build falhar com erro MSB3027/MSB3021 dizendo que `Ritmo.Api.exe` esta em uso, provavelmente existe uma API ainda rodando segurando o arquivo.
- Nao e necessariamente erro de codigo.

## 6. Stack e dependencias

### Backend

Arquivo: `Ritmo.Api/Ritmo.Api.csproj`

Target:

```xml
<TargetFramework>net8.0</TargetFramework>
```

Pacotes:

- `Microsoft.AspNetCore.Authentication.JwtBearer` `8.0.0`
- `Microsoft.EntityFrameworkCore` `8.0.0`
- `Microsoft.EntityFrameworkCore.Design` `8.0.0`
- `Npgsql.EntityFrameworkCore.PostgreSQL` `8.0.0`
- `Swashbuckle.AspNetCore` `6.9.0`

### Frontend

Arquivo: `frontend/package.json`

Scripts:

- `npm run dev`: Vite dev server
- `npm run build`: build de producao
- `npm run lint`: ESLint
- `npm run preview`: preview Vite

Dependencias:

- `axios` `^1.14.0`
- `lucide-react` `^1.7.0`
- `react` `^19.2.4`
- `react-dom` `^19.2.4`
- `react-router-dom` `^7.13.2`
- `recharts` `^3.8.1`
- `xlsx` `^0.18.5`

Dev dependencies:

- `@vitejs/plugin-react` `^6.0.1`
- `vite` `^8.0.1`
- `eslint` `^9.39.4`
- `eslint-plugin-react-hooks` `^7.0.1`
- `eslint-plugin-react-refresh` `^0.5.2`
- `globals` `^17.4.0`

### Opiniao tecnica

O uso de React 19 e Vite 8 e moderno. O projeto nao usa TypeScript. Para um MVP isso reduz atrito, mas em um dashboard com muita transformacao de dados, TypeScript poderia reduzir bugs de contrato entre API e UI.

Trade-off:

- JavaScript puro: menor custo inicial e mais velocidade.
- TypeScript: maior custo de migracao, mas reduz erro em componentes grandes e objetos complexos.

## 7. Como rodar localmente

### Backend

1. Criar banco PostgreSQL local, exemplo `ritmodb`.
2. Criar `Ritmo.Api/appsettings.Local.json` com connection string e JWT.
3. Aplicar migrations.
4. Rodar API.

Exemplo de `appsettings.Local.json`:

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

Comandos:

```powershell
dotnet ef database update --project Ritmo.Api
dotnet run --project Ritmo.Api
```

Swagger:

```text
http://localhost:5066/swagger
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

URL padrao:

```text
http://localhost:5173
```

### Observacao importante

`frontend/src/api/apiClient.js` usa base fixa:

```js
baseURL: 'http://localhost:5066/api'
```

Isso funciona localmente, mas e uma divida para deploy. Em ambiente real, o ideal seria usar variavel de ambiente Vite, por exemplo `VITE_API_BASE_URL`.

## 8. Configuracao do backend

Arquivo: `Ritmo.Api/Program.cs`

Responsabilidades principais:

- limpar providers de logging e usar console
- carregar `appsettings.Local.json`
- carregar variaveis de ambiente
- registrar controllers
- customizar resposta de `ModelState` invalido
- configurar EF Core com PostgreSQL
- validar connection string obrigatoria
- configurar JWT Bearer
- registrar autorizacao
- registrar services de negocio
- registrar Swagger
- configurar Data Protection com chaves locais em `.keys`
- configurar CORS por origens definidas em config
- configurar handler global de excecao
- ativar Swagger apenas em desenvolvimento
- ativar CORS, authentication e authorization
- mapear controllers

### Detalhe sobre `AppContext.SetSwitch`

O backend usa:

```csharp
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
```

Inferencia:

- Isso provavelmente existe para evitar problemas de compatibilidade entre `DateTime`, PostgreSQL e comportamento novo do Npgsql.
- O modelo usa `timestamp without time zone` em varias migrations.

Risco:

- Pode mascarar inconsistencias de timezone.
- Se no futuro o sistema precisar operar multi-fuso de verdade, datas e horarios devem ser revisitados.

### Configuracao local e secrets

`appsettings.json` versionado tem:

- `ConnectionStrings:DefaultConnection` vazio
- `Jwt:Key` vazio
- CORS para `localhost:5173` e `127.0.0.1:5173`

Fato:

- A API falha cedo se connection string ou JWT estiverem incompletos.

Opiniao tecnica:

- Isso e bom. Falhar cedo evita rodar backend em estado inseguro ou enganoso.

## 9. Arquitetura real do backend

Padrao observado:

```text
Controllers -> Services -> AppDbContext -> PostgreSQL
DTOs       -> entrada/saida HTTP
Models     -> entidades EF Core
Security   -> JWT, password hashing, user context
Exceptions -> excecao de dominio
```

### Controllers

Pasta: `Ritmo.Api/Controllers`

Arquivos:

- `UsuariosController.cs`
- `RegistrosDiariosController.cs`
- `BiometriaController.cs`
- `MetasController.cs`
- `InsightsController.cs`
- `ConfiguracoesPerfilController.cs`

Responsabilidade:

- expor endpoints REST
- checar autenticacao/autorizacao
- validar ownership quando necessario
- chamar services ou DbContext
- retornar status HTTP apropriado

### Services

Pasta: `Ritmo.Api/Services`

Arquivos:

- `UsuarioService.cs`
- `RegistroDiarioService.cs`
- `BiometriaService.cs`
- `MetaService.cs`

Responsabilidade:

- regras de negocio
- validacoes semanticas
- transformacoes principais
- persistencia via EF

### Models

Pasta: `Ritmo.Api/Models`

Entidades:

- `Usuario`
- `RegistroDiario`
- `MedidaBiometrica`
- `Meta`
- `Insight`
- `ConfiguracaoPerfil`

### DTOs

Pasta: `Ritmo.Api/DTOs`

Arquivos:

- `UsuarioDTO.cs`
- `RegistroDiarioDTO.cs`
- `MedidaBiometricaDTO.cs`
- `MetaDTO.cs`

### Security

Pasta: `Ritmo.Api/Security`

Arquivos:

- `PasswordHasher.cs`
- `JwtTokenService.cs`
- `UserContextExtensions.cs`

### Opiniao tecnica

A arquitetura e simples e adequada ao tamanho atual. Nao ha necessidade imediata de CQRS, repository pattern generico ou mediator. O melhor investimento agora seria testes e separacao do frontend, nao complicar o backend.

## 10. Modelo de dados

### Usuario

Arquivo: `Ritmo.Api/Models/Usuario.cs`

Campos:

- `Id`
- `Nome`
- `Email`
- `Senha`
- `DataCriacao`
- `DataNascimento`
- `Sexo`

Relacionamentos:

- 1:N com `RegistrosDiarios`
- 1:N com `Metas`
- 1:N com `Insights`
- 1:N com `MedidasBiometricas`
- 1:1 com `ConfiguracaoPerfil`

Observacoes:

- `Email` e unico no banco.
- `Senha` guarda hash, apesar de comentario antigo mencionar substituicao futura por BCrypt.
- `DataNascimento` e `DateOnly`.
- `Sexo` aceita `M` ou `F` nos DTOs.

### RegistroDiario

Arquivo: `Ritmo.Api/Models/RegistroDiario.cs`

Campos:

- `Id`
- `UsuarioId`
- `Data`
- `Humor`
- `Sono`
- `Produtividade`
- `Energia`
- `Exercicio`
- `Agua`
- `Observacoes`
- `DataCriacao`

Regras:

- `Data` e `DateOnly`.
- Um registro por usuario por data.
- `Humor`, `Produtividade`, `Energia`: escala 1 a 5.
- `Sono`: horas.
- `Agua`: litros.
- `Exercicio`: booleano.

### MedidaBiometrica

Arquivo: `Ritmo.Api/Models/MedidaBiometrica.cs`

Campos:

- `Id`
- `UsuarioId`
- `Peso`
- `Altura`
- `Data`
- `DataDia`

Observacoes:

- `Peso` em kg.
- `Altura` em centimetros.
- `Data` e `DateTime`.
- `DataDia` e privado no set e computado no banco a partir de `Data`.
- IMC nao e persistido como campo de negocio principal. E calculado no DTO de resposta.

### Meta

Arquivo: `Ritmo.Api/Models/Meta.cs`

Campos:

- `Id`
- `UsuarioId`
- `Categoria`
- `ValorAlvo`
- `Descricao`
- `DataInicio`
- `DataFim`
- `Ativa`
- `DataCriacao`

Categorias atuais:

- `Sono`
- `Agua`
- `Humor`
- `Produtividade`
- `Energia`
- `Treino`
- `Peso`

Observacao:

- Comentarios antigos no model ainda citam `Estudo` e lista antiga. A validacao atual do DTO/service nao inclui `Estudo`.

### Insight

Arquivo: `Ritmo.Api/Models/Insight.cs`

Campos:

- `Id`
- `UsuarioId`
- `Mensagem`
- `Categoria`
- `Nivel`
- `DataGeracao`
- `Lido`

Niveis esperados por comentario:

- `info`
- `positivo`
- `atencao`

Fato:

- Existe CRUD de insights.
- Nao existe motor maduro de geracao automatica.

### ConfiguracaoPerfil

Arquivo: `Ritmo.Api/Models/ConfiguracaoPerfil.cs`

Campos:

- `Id`
- `UsuarioId`
- `TemaEscuro`
- `Idioma`
- `FusoHorario`
- `ExibirMetaNoDashboard`
- `ReceberNotificacoes`
- `ReceberRelatorioSemanal`

Defaults:

- `TemaEscuro = true`
- `Idioma = "pt-BR"`
- `FusoHorario = "America/Sao_Paulo"`
- `ExibirMetaNoDashboard = true`
- `ReceberNotificacoes = true`
- `ReceberRelatorioSemanal = true`

Uso no frontend:

- Atualmente o header mostra `config.idioma`.
- O painel de configuracoes de usuario nao edita esses campos de configuracao diretamente.

## 11. DbContext e constraints

Arquivo: `Ritmo.Api/Data/AppDbContext.cs`

DbSets:

- `Usuarios`
- `RegistrosDiarios`
- `Metas`
- `Insights`
- `ConfiguracoesPerfil`
- `MedidasBiometricas`

Constraints importantes:

```csharp
modelBuilder.Entity<Usuario>()
    .HasIndex(u => u.Email)
    .IsUnique();
```

```csharp
modelBuilder.Entity<RegistroDiario>()
    .HasIndex(r => new { r.UsuarioId, r.Data })
    .IsUnique();
```

```csharp
modelBuilder.Entity<MedidaBiometrica>()
    .Property(m => m.DataDia)
    .HasComputedColumnSql("\"Data\"::date", stored: true);
```

```csharp
modelBuilder.Entity<MedidaBiometrica>()
    .HasIndex(m => new { m.UsuarioId, m.DataDia })
    .IsUnique();
```

Delete behavior:

- Usuario remove em cascata registros, metas, insights, configuracao e biometricas.

Impacto pratico:

- Excluir conta remove dados associados.
- Dashboard nao deve ver recursos de outro usuario.
- Indices unicos reduzem duplicidade mesmo em concorrencia.

## 12. Migrations

Migrations observadas:

- `20260327003332_CriacaoInicial`
- `20260331233408_AddConfiguracaoPerfil`
- `20260402130012_AddBiometria`
- `20260403135112_UnificacaoBiometrica`
- `20260408134928_AddDemographics`
- `20260430114117_AddUniquePerDayConstraints`

### Destaques

`UnificacaoBiometrica`:

- removeu `RegistrosPeso`
- removeu `Altura` de `Usuarios`
- removeu `Estudo` de `RegistrosDiarios`
- criou `MedidasBiometricas`
- ajustou timestamps para `timestamp without time zone`

`AddDemographics`:

- adicionou `DataNascimento` a `Usuarios`
- adicionou `Sexo` a `Usuarios`
- usou default `1996-01-01` e `M`

`AddUniquePerDayConstraints`:

- removeu indices antigos por `UsuarioId`
- criou unique em `RegistrosDiarios(UsuarioId, Data)`
- adicionou `DataDia` computado em `MedidasBiometricas`
- criou unique em `MedidasBiometricas(UsuarioId, DataDia)`

### Opiniao tecnica

A migration de unicidade por dia foi uma melhoria importante. Ela transforma uma regra de aplicacao em garantia de banco, que e mais confiavel.

Risco:

- Se existirem dados duplicados antigos no banco real, aplicar `AddUniquePerDayConstraints` pode falhar.
- O service de biometria ja tenta consolidar duplicados ao registrar, mas migration nao limpa dados antigos antes de criar indice.

## 13. Autenticacao e seguranca

### Hash de senha

Arquivo: `Ritmo.Api/Security/PasswordHasher.cs`

Algoritmo:

- PBKDF2
- SHA256
- salt de 16 bytes
- key de 32 bytes
- 100.000 iteracoes
- formato salvo: `PBKDF2$iterations$saltBase64$keyBase64`

Comportamento legado:

- Se `storedValue` nao comeca com `PBKDF2$`, o verify compara senha em texto puro.
- Se login for bem-sucedido e `NeedsRehash` retornar true, senha e regravada com hash.

### Opiniao tecnica

Esse comportamento e pragmatico para migrar usuarios antigos sem reset de senha. Risco: enquanto houver senha legada no banco, uma exposicao de banco ainda e grave. O ideal e ter tarefa de migracao/forcar troca depois.

### JWT

Arquivo: `Ritmo.Api/Security/JwtTokenService.cs`

Claims:

- `sub`: id do usuario
- `ClaimTypes.NameIdentifier`: id do usuario
- `ClaimTypes.Name`: nome
- `ClaimTypes.Email`: email
- `JwtRegisteredClaimNames.Email`: email
- `jti`: Guid

Expiracao:

- Configuravel por `Jwt:ExpirationMinutes`
- Default interno se parse falhar: 120 minutos

Validacao:

- issuer
- audience
- signing key
- lifetime
- clock skew zero

### User context

Arquivo: `Ritmo.Api/Security/UserContextExtensions.cs`

Metodo:

```csharp
GetAuthenticatedUserId()
```

Busca `ClaimTypes.NameIdentifier` e converte para int.

### Sessao no frontend

Arquivo: `frontend/src/auth/authStorage.js`

Storage:

- `localStorage`
- chave: `ritmoAuth`

Guarda:

- token
- expiresAt
- usuario

Axios:

Arquivo: `frontend/src/api/apiClient.js`

- Injeta `Authorization: Bearer <token>` em cada request.
- Em 401, limpa sessao e redireciona para `/login`.

### Respostas de login

Arquivos:

- `Ritmo.Api/Services/UsuarioService.cs`
- `Ritmo.Api/Controllers/UsuariosController.cs`
- `frontend/src/pages/Login.jsx`

Fato:

- `UsuarioService.Login` retorna `LoginResult`.
- `LoginResult.Status` pode ser `Sucesso`, `UsuarioNaoEncontrado` ou `SenhaInvalida`.
- `UsuariosController.Login` retorna `404` para usuario inexistente e `401` para senha incorreta.
- `Login.jsx` consome a mensagem do backend por `err.response?.data?.mensagem`.

Impacto:

- Usuário que nao existe recebe orientacao para conferir o email ou se registrar.
- Usuario existente com senha errada recebe feedback de senha incorreta.

Trade-off:

- A UX melhora, mas a API passa a revelar se determinado email existe.
- Para producao publica, combinar com rate limiting, auditoria de tentativas e monitoramento de abuso.

### Riscos de seguranca atuais

Fato:

- Nao ha refresh token.
- Nao ha rate limiting no login.
- Nao ha revogacao de token.
- Token fica em `localStorage`.

Opiniao tecnica:

- Para MVP local, esta ok.
- Para producao, o minimo recomendado seria:
  - rate limiting no login
  - refresh token com rotacao
  - expiracao curta do access token
  - protecao contra brute force
  - logs de autenticacao
  - revisao sobre `localStorage` versus cookie HttpOnly conforme arquitetura

Impacto de negocio:

- Reduz risco de conta invadida.
- Aumenta confianca do usuario.
- Evita incidentes que poderiam destruir credibilidade do produto.

## 14. Autorizacao e ownership

Padrao nos controllers:

- Todos os controllers principais usam `[Authorize]`.
- Cadastro e login usam `[AllowAnonymous]`.
- Rotas que recebem `usuarioId` conferem se `usuarioId == User.GetAuthenticatedUserId()`.
- Rotas por recurso buscam owner no banco e retornam `Forbid()` se usuario autenticado nao for dono.

Exemplos:

- `RegistrosDiariosController.PutRegistro` busca `ownerId` antes de atualizar.
- `RegistrosDiariosController.DeleteRegistro` busca `ownerId`.
- `BiometriaController.DeleteMedida` busca `ownerId`.
- `MetasController.PutMeta` e `DeleteMeta` buscam `ownerId`.
- `InsightsController` compara `insight.UsuarioId`.
- `UsuariosController` so permite acessar/alterar/excluir o proprio usuario.

Opiniao tecnica:

Esse padrao e bom para MVP. Um refinamento futuro seria criar helpers reutilizaveis para reduzir repeticao de ownership nos controllers.

## 15. DTOs e validacoes

### UsuarioRequest

Arquivo: `Ritmo.Api/DTOs/UsuarioDTO.cs`

Campos:

- `Nome`: obrigatorio, 3 a 120 chars
- `Email`: obrigatorio, email valido, max 160
- `Senha`: obrigatoria, 8 a 128 chars
- `DataNascimento`: obrigatoria
- `Sexo`: obrigatorio, regex `M|F`

Validacao semantica no service:

- data de nascimento nao pode ser futura
- idade precisa ficar entre 0 e 120 anos

### UpdateUsuarioPerfilRequest

Mesmo perfil basico sem senha:

- nome
- email
- dataNascimento
- sexo

### UpdateUsuarioSenhaRequest

- `SenhaAtual`: obrigatoria, 8 a 128
- `NovaSenha`: obrigatoria, 8 a 128

Service:

- valida senha atual
- rejeita nova senha igual a atual
- salva hash novo

### DeleteUsuarioRequest

- `SenhaAtual`: obrigatoria, 8 a 128

Service:

- valida senha atual antes de excluir conta

### LoginRequest

- `Email`: obrigatorio e valido
- `Senha`: obrigatoria, 8 a 128

### RegistroDiarioRequest

Arquivo: `Ritmo.Api/DTOs/RegistroDiarioDTO.cs`

Campos e validacoes:

- `UsuarioId`: maior que zero
- `Data`: obrigatoria
- `Humor`: 1 a 5
- `Sono`: 0 a 24
- `Produtividade`: 1 a 5
- `Energia`: 1 a 5
- `Exercicio`: bool
- `Agua`: 0 a 25
- `Observacoes`: max 1000

Service:

- usuario precisa existir
- data nao pode estar no futuro
- data nao pode ser anterior ao nascimento

### MedidaBiometricaRequest

Arquivo: `Ritmo.Api/DTOs/MedidaBiometricaDTO.cs`

Campos:

- `UsuarioId`: maior que zero
- `Peso`: 10 a 600 kg
- `Altura`: 50 a 280 cm
- `Data`: obrigatoria, default `DateTime.UtcNow`

Service:

- usuario precisa existir
- data da biometria nao pode estar no futuro, com tolerancia de 1 minuto
- data nao pode ser anterior ao nascimento

### MetaDTO

Arquivo: `Ritmo.Api/DTOs/MetaDTO.cs`

Implementa `IValidatableObject`.

Campos:

- `UsuarioId`: maior que zero
- `Categoria`: obrigatoria, regex de categorias atuais
- `ValorAlvo`
- `Direcao`: opcional no DTO geral, obrigatoria para `Peso` em novas criacoes, valores `reduzir`, `ganhar` ou `manter`
- `ValorInicial`: opcional, usado principalmente para persistir o peso inicial de uma meta de peso
- `Descricao`: max 300
- `DataInicio`: obrigatoria
- `DataFim`: opcional
- `Ativa`: default true

Categorias validas:

- `Sono`
- `Agua`
- `Humor`
- `Produtividade`
- `Energia`
- `Treino`
- `Peso`

Faixas:

- `Sono`: 0.5 a 24
- `Agua`: 0.1 a 25
- `Humor`: 1 a 5
- `Produtividade`: 1 a 5
- `Energia`: 1 a 5
- `Treino`: 1 a 7
- `Peso`: 10 a 600

Observacao:

- A validacao por `IValidatableObject` evita problema de cultura com `Range(typeof(decimal), "0.1", "...")`.

## 16. Handler global de erros

Arquivo: `Ritmo.Api/Program.cs`

Comportamento:

- `DomainValidationException`: HTTP 400 com `{ mensagem = ... }`
- outras excecoes: HTTP 500 com mensagem generica

ModelState invalido:

- HTTP 400 com:

```json
{
  "mensagem": "Os dados enviados são inválidos.",
  "erros": {
    "Campo": ["Mensagem"]
  }
}
```

Frontend:

- `Login.jsx` e `SettingsPanel.jsx` possuem mapeamento de erros por campo.
- `apiClient.js` loga erros no console.

Opiniao tecnica:

Bom padrao para UX, porque permite mensagens especificas por campo. Futuro refinamento seria padronizar mais responses de erro em todos os controllers.

## 17. Endpoints da API

Base local:

```text
http://localhost:5066/api
```

### Usuarios

Controller: `Ritmo.Api/Controllers/UsuariosController.cs`  
Rota base: `/api/usuarios`

Endpoints:

- `GET /api/usuarios`
  - Retorna apenas o usuario autenticado em array.
  - Apesar do nome `GetUsuarios`, nao lista todos para o usuario final.

- `GET /api/usuarios/{id}`
  - Retorna usuario se `id` for o usuario autenticado.
  - Caso contrario, `Forbid()`.

- `POST /api/usuarios`
  - Anonymous.
  - Cria usuario e retorna token.
  - Retorna `409 Conflict` se email ja existe.

- `POST /api/usuarios/login`
  - Anonymous.
  - Retorna token se credenciais corretas.
  - Retorna `404 NotFound` se o email nao existir.
  - Retorna `401 Unauthorized` se a senha estiver incorreta.

- `PUT /api/usuarios/{id}`
  - Atualiza usuario completo incluindo senha.
  - Parece mais legado, porque o fluxo moderno usa `/perfil` e `/senha`.

- `PUT /api/usuarios/{id}/perfil`
  - Atualiza perfil e retorna novo token.
  - Usado pelo frontend.

- `PUT /api/usuarios/{id}/senha`
  - Troca senha com senha atual.
  - Usado pelo frontend.

- `DELETE /api/usuarios/{id}`
  - Exclui conta com senha atual.
  - Usado pelo frontend.

### Registros diarios

Controller: `RegistrosDiariosController.cs`  
Rota base: `/api/registrosdiarios`

Endpoints:

- `GET /api/registrosdiarios`
  - Retorna registros do usuario autenticado.

- `GET /api/registrosdiarios/{id}`
  - Retorna registro se dono for usuario autenticado.

- `GET /api/registrosdiarios/usuario/{usuarioId}`
  - Retorna registros do usuario informado se for o autenticado.
  - Usado pelo frontend.

- `POST /api/registrosdiarios`
  - Cria ou atualiza registro por data, via upsert no service.
  - Retorna `CreatedAtAction`, mesmo quando atualiza um existente.

- `PUT /api/registrosdiarios/{id}`
  - Atualiza registro por id.
  - Verifica owner e `registro.UsuarioId`.

- `DELETE /api/registrosdiarios/{id}`
  - Remove registro por id.
  - Verifica owner.
  - Atualmente a tabela de relatorios no frontend nao expoe exclusao direta.

### Biometria

Controller: `BiometriaController.cs`  
Rota base: `/api/biometria`

Endpoints:

- `GET /api/biometria/usuario/{usuarioId}`
  - Retorna biometricas consolidadas por dia.
  - Usado pelo frontend.

- `POST /api/biometria`
  - Registra biometria.
  - Se ja existe medicao no dia, atualiza.
  - Se houver mais de uma medicao antiga no dia, remove duplicadas extras.

- `DELETE /api/biometria/{id}`
  - Remove biometria por id se usuario for dono.

### Metas

Controller: `MetasController.cs`  
Rota base: `/api/metas`

Endpoints:

- `GET /api/metas/usuario/{usuarioId}`
  - Lista metas do usuario.
  - Usado pelo frontend.

- `POST /api/metas`
  - Cria meta.
  - Usado pelo frontend.

- `PUT /api/metas/{id}`
  - Atualiza meta.
  - Verifica `id == dto.Id`, owner e `dto.UsuarioId`.

- `DELETE /api/metas/{id}`
  - Remove meta.
  - Usado pelo frontend.

### Insights

Controller: `InsightsController.cs`  
Rota base: `/api/insights`

Endpoints:

- `GET /api/insights/usuario/{usuarioId}?apenasNaoLidos=true`
  - Lista insights do usuario.
  - Pode filtrar apenas nao lidos.
  - Usado pelo frontend.

- `GET /api/insights/{id}`
  - Busca insight por id se for do usuario autenticado.

- `POST /api/insights`
  - Cria insight manualmente.
  - Nao e um motor automatico.

- `PATCH /api/insights/{id}/marcar-lido`
  - Marca insight como lido.
  - Usado pelo frontend.

- `DELETE /api/insights/{id}`
  - Remove insight.

### Configuracoes de perfil

Controller: `ConfiguracoesPerfilController.cs`  
Rota base: `/api/configuracoesperfil`

Endpoints:

- `GET /api/configuracoesperfil/usuario/{usuarioId}`
  - Retorna configuracao 1:1 do usuario.
  - Usado no carregamento da dashboard.

- `PUT /api/configuracoesperfil/{id}`
  - Atualiza tema, idioma, fuso, exibicao de meta e notificacoes.
  - Nao parece usado pela UI atual.

## 18. Fluxo de cadastro e login

Frontend:

- Arquivo: `frontend/src/pages/Login.jsx`
- Usa `DateField`
- Valida campos antes de enviar
- Normaliza erros do backend por campo
- Alterna entre modo login e cadastro no mesmo componente

Cadastro:

1. Usuario preenche nome, data nascimento, sexo, email e senha.
2. Front valida minimo basico.
3. POST `/api/usuarios`.
4. Backend cria usuario com:
   - nome trimado
   - email normalizado para lowercase
   - senha com hash
   - configuracao de perfil default
5. Backend retorna token.
6. Front salva sessao em `localStorage`.
7. Navega para `/dashboard`.

Login:

1. Usuario envia email e senha.
2. Backend normaliza email.
3. Busca usuario por email.
4. Se nao encontrar usuario, retorna `404` com mensagem de conta nao encontrada.
5. Verifica senha.
6. Se senha estiver incorreta, retorna `401` com mensagem de senha incorreta.
7. Se senha antiga em texto puro, regrava com hash.
8. Retorna JWT e usuario.
9. Front salva sessao e navega.

Impacto:

- Cadastro ja entra logado.
- UX e simples.
- Rehash legado reduz friccao de migracao.
- Usuario recebe feedback mais especifico quando email nao existe ou senha esta errada.

## 19. Fluxo de carregamento da dashboard

Hook: `frontend/src/hooks/useDashboardData.js`

Ao montar:

1. Busca usuario logado no `localStorage`.
2. Se nao existir, navega para `/login`.
3. Define `user` inicial.
4. Carrega em paralelo:
   - registros diarios
   - configuracao de perfil
   - insights nao lidos
   - metas
   - biometria
   - usuario atualizado
5. Salva tudo em estados locais.

Requests:

```js
apiClient.get(`/registrosdiarios/usuario/${usuarioLogado.id}`)
apiClient.get(`/configuracoesperfil/usuario/${usuarioLogado.id}`)
apiClient.get(`/insights/usuario/${usuarioLogado.id}?apenasNaoLidos=true`)
apiClient.get(`/metas/usuario/${usuarioLogado.id}`)
apiClient.get(`/biometria/usuario/${usuarioLogado.id}`)
apiClient.get(`/usuarios/${usuarioLogado.id}`)
```

Se 401/403:

- limpa sessao
- navega para login

Opiniao tecnica:

Carregar em paralelo e bom para performance percebida. Risco: qualquer falha derruba o conjunto inteiro porque usa `Promise.all`. Futuro refinamento seria tolerar falhas parciais para insights/configuracoes, dependendo da criticidade.

## 20. Fluxo de registro diario

Frontend:

- Modal: `frontend/src/components/DataFormModal.jsx`
- Orquestracao: `frontend/src/pages/Dashboard.jsx`, funcao `handleSalvar`

Campos:

- data
- humor
- agua
- sono
- produtividade
- energia
- exercicio
- observacoes
- biometria opcional ou obrigatoria no primeiro registro

Regra do primeiro registro:

- Se usuario nao tem registros nem biometria e nao esta editando, a biometria inicial e obrigatoria.
- Isso aparece em `shouldRequireInitialBiometria`.
- Modal trava o toggle em modo obrigatorio.

Ao salvar:

1. Front bloqueia data futura.
2. Calcula se precisa biometria inicial.
3. Monta payload de registro.
4. Se editando:
   - `PUT /registrosdiarios/{id}`
   - normaliza payload localmente
5. Se novo:
   - `POST /registrosdiarios`
   - backend faz upsert por data
6. Atualiza estado local sem recarregar dashboard inteira.
7. Se `registrouPesoHoje`, posta biometria.
8. Se editando e havia biometria no dia mas usuario desmarcou pesagem, deleta biometria do dia.
9. Fecha modal e mostra notice.

Backend:

- `RegistroDiarioService.UpsertRegistro`
- valida usuario/data
- procura registro existente por `UsuarioId` e `Data`
- atualiza se existir
- cria se nao existir

Banco:

- unique `UsuarioId + Data`

Impacto:

- Usuario pode salvar o mesmo dia mais de uma vez sem duplicar.
- Dashboard fica consistente.

Risco:

- Em concorrencia, dois POSTs simultaneos podem passar pelo `FirstOrDefaultAsync` antes de salvar. O indice unico protege o banco, mas o service nao trata explicitamente violacao de unique para transformar em update/retry amigavel.

## 21. Fluxo de biometria

Frontend:

- Pode ser enviada junto com registro diario.
- Historico de biometria vem separado da API.
- A altura mais recente pode ser reaproveitada.
- Usuario so altera altura se quiser corrigir.

Backend:

- `BiometriaService.ListarPorUsuario`:
  - busca biometricas do usuario
  - inclui usuario
  - ordena por data desc e id desc
  - agrupa por dia
  - pega a medicao mais recente de cada dia
  - calcula IMC/classificacao no DTO

- `BiometriaService.Registrar`:
  - valida usuario
  - valida data
  - busca medidas do dia
  - se existe, atualiza a mais recente
  - remove duplicadas antigas do mesmo dia
  - se nao existe, cria

DTO:

- `MedidaBiometricaResponse.FromEntity`
- calcula IMC:

```text
IMC = peso / (alturaEmMetros ^ 2)
```

Classificacao:

- Se idade >= 65:
  - <= 22: baixo peso
  - < 27: peso adequado
  - >= 27: sobrepeso
- Adulto:
  - < 18.5: abaixo do peso
  - < 25: peso normal
  - < 30: sobrepeso
  - < 35: obesidade grau I
  - < 40: obesidade grau II
  - >= 40: obesidade grau III

### Opiniao tecnica

Calcular IMC no backend e decisao boa, porque evita divergencia entre telas e clientes. O frontend consome IMC ja pronto.

Risco:

- `MedidaBiometrica.Data` e `DateTime`, enquanto `RegistroDiario.Data` e `DateOnly`. Isso exige cuidado em filtros e timezone.
- O service usa `dto.Data.Date` para consolidar dia. Em ambiente multi-fuso, pode haver surpresa se o cliente enviar horario com offset.

## 22. Fluxo de metas

Frontend:

- Modal: `frontend/src/components/MetaFormModal.jsx`
- Renderizacao e progresso: `Dashboard.jsx`, funcao `getMetaProgress`

Criacao:

1. Usuario abre modal de meta.
2. Categoria default: `Sono`.
3. Campo de valor alvo inicia vazio.
4. Front valida faixa por categoria.
5. POST `/metas`.
6. Atualiza estado local com nova meta.
7. Mostra notice.

Backend:

- `MetaService.Criar`
- `MetaService.Atualizar`
- `MetaService.ValidateMeta`

Categorias e progresso no frontend:

- `Sono`: media dos ultimos 7 dias
- `Agua`: media dos ultimos 7 dias
- `Humor`: media dos ultimos 7 dias
- `Produtividade`: media dos ultimos 7 dias
- `Energia`: media dos ultimos 7 dias
- `Treino`: contagem de dias com exercicio nos ultimos 7 dias
- `Peso`: logica especial por direcao historica, alvo e cruzamento da meta

Meta de peso:

- Ordena biometricas por data.
- Usa `Direcao` salva quando existir.
- Mantem `ValorInicial` salvo quando existir, mas o percentual visual usa proximidade atual com o alvo.
- Pega baseline proximo ao inicio da meta quando possivel.
- Tambem consulta pesos anteriores ao atual para nao depender apenas do baseline.
- Compara peso inicial, maior/menor peso anterior, peso atual e peso alvo.
- Funciona para:
  - perda de peso
  - ganho de peso
  - manutencao proxima do alvo
- Se havia peso anterior acima do alvo e o peso atual chegou no alvo ou abaixo, status vira `concluido`.
- Se havia peso anterior abaixo do alvo e o peso atual chegou no alvo ou acima, status vira `concluido`.
- O label visual da meta fica simples, por exemplo `75.0 kg`, sem `ou mais` ou `ou menos`.
- Para metas antigas sem `Direcao`, o dashboard infere a direcao pelo historico.

Opiniao tecnica:

A logica de peso e mais madura que uma comparacao simples `atual / alvo`, porque entende direcao. Isso evita mostrar progresso errado para quem quer emagrecer.

Risco:

- Calculo de progresso de metas esta no frontend. Se houver outro cliente no futuro, a regra pode duplicar.
- Melhor evolucao futura: endpoint backend de progresso de metas.

## 23. Fluxo de insights

Frontend:

- `DashboardHeader.jsx` mostra sino de notificacoes.
- Lista insights nao lidos.
- Usuario pode marcar como lido.
- Hook `handleMarcarInsightLido` chama PATCH e remove do estado local.

Backend:

- Lista insights por usuario.
- Cria insight via POST.
- Marca lido via PATCH.
- Deleta via DELETE.

Fato:

- Nao ha motor automatico consolidado de insights no backend.

Inferencia:

- O modelo e controller foram preparados para insights automaticos, mas a inteligencia analitica ainda esta pendente.

Opiniao tecnica:

Esse e um bom ponto para evoluir o produto. Insights automaticos podem aumentar valor percebido porque transformam dados crus em recomendacao. Mas precisam ser feitos com cuidado para nao parecerem aleatorios ou clinicamente irresponsaveis.

## 24. Fluxo de configuracoes e conta

Frontend:

- Componente: `frontend/src/components/SettingsPanel.jsx`
- Aba: `configuracoes` em `Dashboard.jsx`

Funcoes:

- Atualizar perfil
- Trocar senha
- Excluir conta

Atualizar perfil:

1. Valida nome, email, data nascimento e sexo.
2. PUT `/usuarios/{id}/perfil`.
3. Backend atualiza dados.
4. Backend retorna novo token.
5. Front salva nova sessao.
6. Atualiza `user` local.

Trocar senha:

1. Valida senha atual, nova senha e confirmacao.
2. PUT `/usuarios/{id}/senha`.
3. Backend verifica senha atual.
4. Backend rejeita nova senha igual.
5. Salva hash.

Excluir conta:

1. Usuario informa senha atual.
2. UI pede confirmacao.
3. DELETE `/usuarios/{id}` com body contendo `senhaAtual`.
4. Backend valida senha.
5. Remove usuario.
6. Cascata remove dados associados.
7. Front limpa sessao e navega para login.

Risco:

- Nao ha etapa extra de digitacao de frase como `EXCLUIR`, mas exige senha atual.
- Para MVP, esta ok.

## 25. Arquitetura real do frontend

Entrada:

- `frontend/src/main.jsx`
- renderiza `<App />` dentro de `StrictMode`

Rotas:

- `/login`: `Login`
- `/dashboard`: `Dashboard`
- `*`: redirect para `/login`

Nao existe guard de rota separado.

Protecao real:

- `Dashboard` chama `useDashboardData`.
- Se nao houver usuario no storage, navega para `/login`.
- Se API retornar 401/403, limpa sessao e navega.

### Principais componentes

- `Login.jsx`: login/cadastro
- `Dashboard.jsx`: pagina principal e orquestracao
- `DashboardHeader.jsx`: topo, saudacao, idioma, insights, logout
- `StatsCards.jsx`: cards de resumo
- `ChartsContainer.jsx`: graficos de panorama e analise
- `DataFormModal.jsx`: modal de registro diario + biometria
- `MetaFormModal.jsx`: modal de criacao de meta
- `SettingsPanel.jsx`: perfil, senha e exclusao
- `DateField.jsx`: input de data com calendario e digitacao opcional
- `NoticeBanner.jsx`: avisos inline
- `ConfirmDialog.jsx`: confirmacao generica

### CSS

Principal:

- `frontend/src/index.css`

Sobra provavel:

- `frontend/src/App.css`, com estilos de template ou nao usados.
- `App.jsx` nao importa `App.css`.

Tema visual:

- dark glassmorphism
- cyan e roxo
- cards com blur
- gradientes
- animações de entrada

Observacao:

- As instrucoes atuais do sistema para frontend recomendam evitar excesso de roxo/dark por padrao, mas este projeto ja tem visual estabelecido nessa direcao. Em alteracoes futuras, preservar consistencia do design existente provavelmente e melhor que trocar tudo.

## 26. Dashboard.jsx em detalhe

Arquivo: `frontend/src/pages/Dashboard.jsx`

Tamanho observado:

- Muito grande, mais de 1.600 linhas.

Responsabilidades concentradas:

- estado de aba ativa
- estado de modais
- filtros de relatorio
- filtros de analise
- agrupamento de dados
- ordenacao de tabela
- exportacao CSV
- exportacao Excel
- notices
- confirm dialog
- dock/rail de abas no scroll
- normalizacao de registros
- normalizacao de biometria
- merge de historico
- calculo de metricas
- calculo de tendencias
- calculo de progresso de metas
- renderizacao das abas

Principais funcoes internas:

- `getLocalDateInputValue`
- `getTabsDockMotionProfile`
- `getDateKey`
- `toLocalDate`
- `formatDisplayDate`
- `getInitialFormData`
- `normalizeRegistroState`
- `normalizeBiometriaState`
- `upsertRegistroState`
- `upsertBiometriaState`
- `resolveDateRange`
- `filterItemsByDateRange`
- `aggregateAnalysisRecords`
- `aggregateAnalysisWeight`
- `handleSalvar`
- `handleEditar`
- `handleNovoRegistro`
- `handleExportCSV`
- `handleExportXLSX`
- `calculaIMC`
- `calcPesoIdeal`
- `handleExcluirMeta`
- `getMetaCategoryLabel`
- `getMetaProgress`
- `renderTabs`

Abas:

- `panorama`
- `analise`
- `metas`
- `relatorios`
- `configuracoes`

Panorama:

- Usa `panoramaRegistros`, uma janela movel de 7 dias encerrada no dia atual.
- Cards de humor, sono e hidratacao usam essa janela recente, nao o historico completo.
- Radar de habilidades usa a mesma base de 7 dias.
- Tendencia de curto prazo recebe a mesma base, ordenada por data crescente.
- IMC, peso registrado e faixa de peso ideal continuam sendo leitura de estado atual, nao media de 7 dias.
- Se nao houver registro nos ultimos 7 dias, a interface mostra empty state nos graficos e zera as medias recentes.

### Opiniao tecnica

Esse arquivo entrega muito valor, mas virou o maior risco de manutencao. Um bug em transformacao de datas pode afetar graficos, relatorios, exportacao e metas ao mesmo tempo.

Melhor proximo passo de refatoracao:

1. Extrair funcoes puras de data/metricas para `frontend/src/utils/dashboardMetrics.js`.
2. Extrair logica de relatorio para hook ou modulo proprio.
3. Extrair logica de analise temporal para modulo proprio.
4. Extrair progresso de metas.
5. Manter `Dashboard.jsx` como composicao de abas.

Trade-offs:

- Custo: medio, porque o arquivo e grande e tem muitos estados conectados.
- Beneficio: alto, reduz risco de regressao e viabiliza testes unitarios.
- Performance: tende a melhorar se calculos forem isolados e eventualmente memoizados com criterio.
- Manutencao: melhora bastante.

## 27. Analise temporal e relatorios

### Periodos rapidos

Opcoes:

- `7d`
- `30d`
- `90d`
- `all`
- `custom`

Campos de data `De` e `Ate` aparecem apenas quando periodo e `custom`.

### Agrupamentos de analise

Opcoes:

- diario
- semanal
- quinzenal
- mensal

O codigo filtra agrupamentos disponiveis conforme recorte ativo e quantidade de periodos uteis.

### Peso em analise

`aggregateAnalysisWeight`:

- cria buckets com base em registros e biometricas filtradas
- ordena todas as medidas
- carrega ultimo peso conhecido ate o fim de cada bucket
- retorna pontos para grafico de peso

Impacto:

- Mesmo se usuario nao se pesar todo dia, grafico consegue carregar ultimo peso conhecido por periodo.

### Relatorios

Historico combina:

- registros diarios
- biometria do mesmo dia quando existe

Filtros:

- periodo
- intervalo customizado
- foco:
  - todos
  - treino
  - biometria
  - anotacoes

Ordenacao:

- data
- humor
- energia
- produtividade
- agua
- sono
- treino
- peso
- IMC
- observacoes

Exportacao:

- CSV
- Excel

### Risco especifico

`historicoCompleto` nasce de `registros.map(...)`. Isso significa que uma biometria sem registro diario pode aparecer nos graficos de analise de peso, mas nao necessariamente na tabela de historico.

Opinioes:

- Se a intencao de produto e que relatorio seja historico completo de tudo, isso precisa mudar.
- Se a intencao e que relatorio seja diario de habitos enriquecido com biometria, esta coerente.

Recomendacao:

- Definir explicitamente a semantica do relatorio antes de alterar.

## 28. ChartsContainer

Arquivo: `frontend/src/components/ChartsContainer.jsx`

Responsabilidades:

- formatar datas do eixo
- formatar datas do tooltip
- formatar valores por serie
- medir largura dos graficos com `ResizeObserver`
- renderizar graficos de panorama
- renderizar graficos de analise

Graficos:

- Radar de habilidades no panorama, usando somente `panoramaRegistros`
- Linha de tendencia de curto prazo, usando somente `panoramaRegistros`
- Area de peso por periodo
- ComposedChart de humor/energia/produtividade/bem-estar
- Area de sono por periodo

Detalhes bons:

- X axis ajusta densidade de ticks conforme largura e quantidade de pontos.
- Tooltip tem labels humanizados.
- Ha empty states para graficos sem dados.

Opiniao tecnica:

Esse componente ja esta mais especializado e saudavel que `Dashboard.jsx`. Ainda poderia receber dados mais prontos e menos responsabilidade de formatacao, mas nao e o maior problema.

## 29. DateField

Arquivo: `frontend/src/components/DateField.jsx`

Funcionalidades:

- input `date` nativo
- modo com digitacao manual no formato `dd/mm/aaaa`
- conversao ISO para display
- parse display para ISO
- botao de calendario com lucide
- suporte a `min`, `max`, `disabled`, helper text e classes customizadas

Uso:

- cadastro
- configuracoes de perfil
- modal de registro
- filtros de analise
- filtros de relatorio

Opiniao tecnica:

Boa abstracao local. Reduz duplicidade e melhora UX de data.

Risco:

- Datas sao manipuladas no frontend em varios pontos. Testes unitarios para datas seriam valiosos.

## 30. UX e design atual

Visual:

- tema escuro
- glass panels
- cyan como cor primaria
- roxo como acento
- cards e graficos com blur/transparencia
- nav superior que vira rail lateral no desktop com scroll

Pontos fortes:

- Produto parece mais acabado que MVP basico.
- Dashboard tem abas claras.
- Feedbacks inline substituem alerts bruscos.
- Modais tem comportamento coerente.
- Exportacao respeita filtros.
- Mutacoes atualizam estado local sem recarregar tudo.

Pontos de atencao:

- `Dashboard.jsx` concentra muito.
- Muito estilo inline em JSX.
- CSS global grande.
- Tema/configuracoes visuais ainda nao parecem realmente aplicados alem do idioma.
- Sem testes visuais ou e2e.

Impacto de negocio:

- Boa UX aumenta chance de uso recorrente.
- Mas regressao visual em dashboard pode quebrar confianca rapidamente, porque o produto depende de leitura de dados.

## 31. Documentacao existente

### README.md

Contem:

- visao geral
- stack
- funcionalidades
- como rodar
- modelo de dados
- estado atual
- pendencias

Pontos bons:

- Documenta explicitamente integridade por dia.
- Reconhece que insights automaticos nao estao completos.

### documentation.md

Mais tecnico.

Contem:

- arquitetura
- fluxo principal
- modelo de dados com Mermaid
- seguranca
- validacao
- regras de metas
- graficos
- limitacoes
- proximos passos

### frontend/README.md

Ainda e README padrao do template React + Vite.

Opiniao tecnica:

Seria bom substituir por README especifico do frontend com:

- env vars
- scripts
- arquitetura de componentes
- como buildar
- como lintar
- convencoes de UI

### Ritmo.Api/Ritmo.Api.http

Ainda aponta para:

```http
GET {{Ritmo.Api_HostAddress}}/weatherforecast/
```

Isso parece sobra de template, porque nao ha endpoint weather forecast atual.

Opiniao tecnica:

Atualizar esse arquivo ajudaria testes manuais da API no VS Code/Rider.

## 32. Arquivos principais e leitura recomendada

Para entender backend:

1. `Ritmo.Api/Program.cs`
2. `Ritmo.Api/Data/AppDbContext.cs`
3. `Ritmo.Api/Models/*.cs`
4. `Ritmo.Api/DTOs/*.cs`
5. `Ritmo.Api/Services/*.cs`
6. `Ritmo.Api/Controllers/*.cs`
7. `Ritmo.Api/Migrations/20260430114117_AddUniquePerDayConstraints.cs`

Para entender frontend:

1. `frontend/src/App.jsx`
2. `frontend/src/api/apiClient.js`
3. `frontend/src/auth/authStorage.js`
4. `frontend/src/hooks/useDashboardData.js`
5. `frontend/src/pages/Login.jsx`
6. `frontend/src/pages/Dashboard.jsx`
7. `frontend/src/components/DataFormModal.jsx`
8. `frontend/src/components/ChartsContainer.jsx`
9. `frontend/src/components/MetaFormModal.jsx`
10. `frontend/src/components/SettingsPanel.jsx`
11. `frontend/src/index.css`

Para entender produto:

1. `README.md`
2. `documentation.md`
3. `regras_avaliacao.md`

## 33. Riscos e dividas tecnicas

### 1. Ausencia de testes automatizados

Fato:

- Busca por arquivos de teste retornou 0.
- Documentacao reconhece isso.

Impacto:

- Refatorar dashboard fica arriscado.
- Regras de data, progresso de meta e biometria podem quebrar sem alerta.

Melhor primeiro pacote de testes:

- backend services:
  - `UsuarioService.ValidateDataNascimento`
  - `RegistroDiarioService.UpsertRegistro`
  - `BiometriaService.Registrar`
  - `MetaService.ValidateMeta`
- frontend funcoes puras depois de extrair:
  - range de datas
  - agrupamento semanal/quinzenal/mensal
  - progresso de meta de peso
  - merge de historico

### 2. Dashboard.jsx grande demais

Fato:

- Arquivo tem mais de 1.600 linhas.

Impacto:

- Maior chance de regressao.
- Dificulta onboarding.
- Dificulta teste unitario.

Melhor acao:

- Extrair logica pura antes de mexer visualmente.

### 3. API base hardcoded

Fato:

- `apiClient.js` aponta para `http://localhost:5066/api`.

Impacto:

- Deploy exige alterar codigo ou build especifico.

Melhor acao:

- Usar `import.meta.env.VITE_API_BASE_URL`.

### 4. Sem refresh token

Fato:

- Documentado como pendente.

Impacto:

- Sessao depende apenas de access token.
- Usuario precisa relogar apos expiracao.
- Sem revogacao real.

### 5. Sem rate limiting

Fato:

- Login nao tem throttling.

Impacto:

- Risco de brute force.

### 6. Insights ainda nao sao motor analitico

Fato:

- Existe CRUD, nao motor maduro.

Impacto:

- Produto promete analise, mas insight automatico ainda nao entrega todo potencial.

### 7. ConfiguracaoPerfil subutilizada

Fato:

- Backend permite editar preferencias.
- Front basicamente mostra idioma.

Impacto:

- Dados existem, mas nao viram experiencia real.

### 8. Datas e timezone

Fato:

- Mistura `DateOnly` e `DateTime`.
- Npgsql legacy timestamp habilitado.

Impacto:

- Em ambiente multi-fuso, filtros por dia podem dar surpresa.

### 9. Historico pode ignorar biometria sem registro diario

Fato:

- Historico completo usa `registros.map`.

Impacto:

- Relatorio pode nao mostrar uma pesagem se nao houver diario naquele dia.

### 10. Documentos/template sobras

Fato:

- `frontend/README.md` e template.
- `Ritmo.Api.http` aponta para weatherforecast.
- `App.css` parece nao usado.

Impacto:

- Onboarding fica menos limpo.

## 34. Pontos fortes do projeto

### Backend simples e coerente

Fato:

- Controllers e services sao diretos.
- Sem excesso de padroes.

Impacto:

- Mais facil evoluir.
- Menor curva de entrada.

### Integridade no banco

Fato:

- Unique indexes protegem regras centrais.

Impacto:

- Reduz dados duplicados.
- Protege dashboard.

### Autorizacao por dono

Fato:

- Controllers conferem usuario autenticado contra owner.

Impacto:

- Mitiga vazamento entre usuarios.

### UX mais caprichada que o comum

Fato:

- Dashboard tem filtros, exportacao, modal, notices, rail lateral, graficos e cards.

Impacto:

- Produto passa sensacao de utilidade real.

### Documentacao honesta

Fato:

- README e documentation reconhecem pendencias.

Impacto:

- Ajuda tomada de decisao e evita prometer o que nao existe.

## 35. Proximos passos recomendados

### Prioridade 1: testes de backend services

Motivo:

- Backend tem regras de dominio importantes e relativamente isoladas.

Impacto:

- Reduz risco de quebrar regra de cadastro, upsert, biometria e metas.

Trade-offs:

- Custo baixo/medio.
- Beneficio alto.
- Nao exige mexer na UI.

### Prioridade 2: extrair logica pura do Dashboard.jsx

Motivo:

- Maior gargalo de manutencao.

Impacto:

- Facilita testes de datas, filtros, agrupamentos, exportacao e metas.
- Reduz tempo para implementar novas features.

Trade-offs:

- Custo medio.
- Risco medio se feito grande demais.
- Melhor fazer em fatias pequenas.

### Prioridade 3: configurar `VITE_API_BASE_URL`

Motivo:

- Remove hardcode local.

Impacto:

- Facilita deploy, homologacao e ambientes diferentes.

Trade-offs:

- Custo baixo.
- Beneficio medio/alto.

### Prioridade 4: refresh token e rate limiting

Motivo:

- Autenticacao atual e boa para MVP, mas limitada para producao.

Impacto:

- Aumenta seguranca e experiencia de sessao.

Trade-offs:

- Custo medio/alto.
- Exige modelagem de tokens, storage e revogacao.

### Prioridade 5: motor de insights

Motivo:

- Produto e analitico. Insights automaticos aumentam valor.

Impacto:

- Pode aumentar retencao.
- Transforma dados em acao.

Trade-offs:

- Custo medio.
- Precisa cuidado com mensagens e inferencias.
- Evitar afirmacoes medicas fortes.

## 36. Possivel plano de refatoracao do frontend

Objetivo:

Reduzir risco sem reescrever a UI.

Passo 1:

- Criar `frontend/src/utils/dateUtils.js`
- Mover:
  - `getDateKey`
  - `toLocalDate`
  - `formatDisplayDate`
  - `toDateInputValue`
  - `addDays`
  - `getWeekStart`
  - `getMonthStart`
  - `getMonthEnd`
  - `getBiweeklyRange`

Passo 2:

- Criar `frontend/src/utils/dashboardMetrics.js`
- Mover:
  - `formatMetric`
  - `getAverageForMetric`
  - `getMetricTrend`
  - `aggregateAnalysisRecords`
  - `aggregateAnalysisWeight`
  - `getMetaProgress`

Passo 3:

- Criar componentes de aba:
  - `PanoramaTab.jsx`
  - `AnalysisTab.jsx`
  - `ReportsTab.jsx`
  - `GoalsTab.jsx`

Passo 4:

- Criar testes unitarios para utils.

Passo 5:

- Deixar `Dashboard.jsx` com:
  - estado
  - handlers
  - composicao

Opiniao tecnica:

Nao comecar refatorando CSS. Primeiro separar logica. Visual fica mais seguro depois.

## 37. Possivel plano de testes

### Backend

Criar projeto:

```text
Ritmo.Api.Tests/
```

Possiveis pacotes:

- xUnit
- FluentAssertions
- EF Core InMemory ou SQLite

Observacao:

- Como o banco real e PostgreSQL e usa coluna computada, alguns testes de integridade talvez precisem Testcontainers/PostgreSQL para fidelidade.

Testes prioritarios:

1. Usuario:
   - nao permite nascimento futuro
   - nao permite idade > 120
   - normaliza email
   - hasheia senha
   - login rehasheia senha legada

2. Registro diario:
   - cria novo registro
   - atualiza registro existente na mesma data
   - rejeita data futura
   - rejeita data anterior ao nascimento

3. Biometria:
   - cria medicao
   - atualiza medicao do mesmo dia
   - rejeita data futura
   - rejeita data anterior ao nascimento
   - calcula IMC corretamente
   - classifica adulto e idoso corretamente

4. Meta:
   - valida categorias
   - valida faixas por categoria
   - rejeita `DataFim < DataInicio`

### Frontend

Depois de extrair funcoes puras:

- Vitest
- React Testing Library para componentes principais

Testes prioritarios:

- parse/formatacao de `DateField`
- range customizado com datas invertidas
- agrupamento semanal/quinzenal/mensal
- progresso de meta de peso para perda
- progresso de meta de peso para ganho
- exportacao respeitando filtros

### E2E futuro

Ferramenta possivel:

- Playwright

Fluxos:

- cadastro -> dashboard
- criar primeiro registro com biometria obrigatoria
- criar meta
- exportar relatorio
- atualizar perfil
- trocar senha
- excluir conta

## 38. Observabilidade e producao

Faltam:

- logs estruturados
- correlation id
- metricas
- health checks
- pipeline CI/CD
- tratamento de excecoes com tracking
- auditoria de login/senha/exclusao

Recomendacoes:

- Adicionar `UseHealthChecks`.
- Adicionar logs estruturados em operacoes criticas.
- Registrar falhas de login sem expor detalhes.
- Criar pipeline com:
  - restore
  - build
  - test
  - lint frontend
  - build frontend

Impacto:

- Reduz custo de suporte.
- Facilita investigar problemas reais.
- Aumenta confianca para deploy.

## 39. Consideracoes de dominio e produto

O Ritmo trabalha com dados sensiveis:

- peso
- altura
- IMC
- humor
- sono
- energia
- produtividade
- habitos

Cuidados:

- Evitar linguagem medica definitiva.
- Nao confundir correlacao com causalidade em insights.
- Dar contexto e incerteza quando sugerir padroes.
- Proteger dados pessoais.

Exemplos de linguagem segura:

- Melhor: "Nos seus registros recentes, dias com menos sono parecem coincidir com energia menor."
- Pior: "Dormir pouco causou sua queda de energia."

Impacto de negocio:

- Linguagem responsavel reduz risco legal e aumenta confianca.

## 40. Regras de negocio consolidadas

Usuarios:

- email unico
- email normalizado para lowercase
- senha com 8 a 128 caracteres
- data de nascimento nao futura
- idade entre 0 e 120
- sexo `M` ou `F`
- configuracao de perfil criada junto com usuario

Registros diarios:

- um por usuario por data
- data nao futura
- data nao anterior ao nascimento
- humor 1 a 5
- produtividade 1 a 5
- energia 1 a 5
- sono 0 a 24
- agua 0 a 25
- observacoes ate 1000 no backend
- frontend usa maxLength 400 no textarea atual

Biometria:

- peso 10 a 600
- altura 50 a 280
- data nao futura com tolerancia de 1 minuto
- data nao anterior ao nascimento
- uma medicao por usuario por dia
- IMC calculado no backend
- classificacao muda para idade >= 65

Metas:

- categorias fixas
- valor alvo por faixa da categoria
- data fim nao pode ser anterior a data inicio
- progresso de peso considera direcao

Insights:

- pertencem a usuario
- podem ser lidos/nao lidos
- nao ha geracao automatica madura

Conta:

- trocar senha exige senha atual
- excluir conta exige senha atual
- exclusao cascata remove dados associados

## 41. Comandos uteis

### Backend

Restaurar/buildar:

```powershell
dotnet restore RitmoApi.sln
dotnet build RitmoApi.sln
```

Rodar API:

```powershell
dotnet run --project Ritmo.Api
```

Aplicar migrations:

```powershell
dotnet ef database update --project Ritmo.Api
```

Criar migration:

```powershell
dotnet ef migrations add NomeDaMigration --project Ritmo.Api
```

Listar projetos da solution:

```powershell
dotnet sln RitmoApi.sln list
```

### Frontend

Instalar:

```powershell
cd frontend
npm install
```

Dev:

```powershell
npm run dev
```

Build:

```powershell
npm run build
```

Lint:

```powershell
npm run lint
```

### Busca rapida

Listar arquivos:

```powershell
rg --files
```

Buscar texto:

```powershell
rg -n "texto" -S
```

Buscar endpoints:

```powershell
rg -n "\[Http(Get|Post|Put|Delete|Patch)" Ritmo.Api/Controllers -S
```

Buscar chamadas de API no frontend:

```powershell
rg -n "apiClient\.(get|post|put|delete|patch)" frontend/src -S
```

## 42. Checklist antes de mexer no projeto

1. Rodar `git status --short`.
2. Entender se ha mudancas do usuario.
3. Se for alterar arquivo existente, criar backup conforme regra do usuario.
4. Ler arquivo relacionado antes de editar.
5. Preferir mudanca pequena e verificavel.
6. Rodar validacao proporcional:
   - backend: `dotnet build RitmoApi.sln`
   - frontend: `npm run lint` e `npm run build`
7. Nao alterar arquivos ignorados ou backups sem necessidade.
8. Nao reverter mudancas do usuario.

## 43. Como fazer backup corretamente neste repo

Exemplo para alterar `frontend/src/pages/Dashboard.jsx` em 07/05/2026 19:30:12:

Destino recomendado pela regra do usuario:

```text
Backup/07_05_2026/pages_2026_07_05/Dashboard_07_05_2026_19_30_12.jsx
```

Observacao:

- A regra do usuario menciona que, se o arquivo estiver em subpasta, criar essa subpasta no backup com `nome_original_da_pasta_ano_dia_mes`.
- O padrao exato em backups antigos varia. Em caso de duvida, manter algo claro e rastreavel e explicar.

Nao usar comandos destrutivos.

## 44. Coisas para nao assumir

Nao assumir:

- que insights automaticos estao prontos
- que biometria sem registro diario aparece no relatorio
- que configuracao de perfil e totalmente editavel na UI
- que existe teste automatizado
- que o backend roda sem `appsettings.Local.json`
- que a API base do frontend muda por ambiente
- que o projeto esta pronto para producao
- que dados reais estao limpos ou sem duplicidade antiga

Assumir com cuidado:

- MVP funcional local
- backend mais estavel que frontend em termos de manutencao
- dados sensiveis exigem linguagem responsavel
- dashboard e a area mais propensa a regressao

## 45. Diferencas entre documentacao e codigo

### Insights

Documentacao atual ja corrige a expectativa:

- Existe estrutura de insights.
- Motor automatico maduro nao esta completo.

### Frontend README

`frontend/README.md` ainda e template e nao representa o produto.

### Ritmo.Api.http

Ainda aponta para `weatherforecast`, que nao representa endpoints atuais.

### Comentarios antigos

Alguns comentarios nos models mencionam coisas antigas:

- `Usuario.Senha` fala em substituir por hash/BCrypt, mas hash PBKDF2 ja existe.
- `Meta.Categoria` comenta `Estudo`, mas categoria atual nao aceita `Estudo`.
- `Insight` comenta que backend calcula e persiste automaticamente, mas isso ainda nao esta consolidado.

Opiniao tecnica:

Comentarios desatualizados sao pequenos riscos de manutencao. Vale limpar quando mexer nesses arquivos.

## 46. Possiveis melhorias pequenas e seguras

Baixo risco:

- Atualizar `frontend/README.md`.
- Atualizar `Ritmo.Api.http` com requests reais.
- Criar `.env.example` para frontend com `VITE_API_BASE_URL`.
- Criar `appsettings.Local.example.json`.
- Remover ou confirmar `App.css` nao usado.
- Adicionar health check simples.
- Melhorar mensagens de erro em controllers que retornam `NotFound()` sem body.

Medio risco:

- Extrair utils do Dashboard.
- Adicionar testes de services.
- Unificar tratamento de erros.
- Criar endpoint de progresso de metas.

Alto risco:

- Alterar modelo de datas/timezone.
- Mudar autenticacao para refresh token.
- Reestruturar dashboard visualmente.
- Migrar frontend para TypeScript.

## 47. Backlog sugerido por impacto

### Impacto em confianca tecnica

1. Testes de services.
2. Refatoracao parcial do Dashboard.
3. CI com build/lint/test.
4. Config por ambiente.

### Impacto em seguranca

1. Rate limiting no login.
2. Refresh token.
3. Revogacao de sessao.
4. Auditoria de login e exclusao.

### Impacto em produto

1. Insights automaticos responsaveis.
2. Evolucao real das configuracoes.
3. Relatorio que inclua biometricas isoladas, se essa for a decisao.
4. Melhor empty state inicial com orientacao de primeiro registro.

### Impacto em operacao

1. Health checks.
2. Logs estruturados.
3. Observabilidade.
4. Pipeline de deploy.

## 48. Notas sobre performance

Backend:

- Consultas atuais parecem simples.
- Indices principais existem para usuario/data.
- Sem paginacao nos endpoints de registros, metas, insights e biometria.

Risco futuro:

- Se usuario tiver anos de registros diarios, carregar tudo em toda dashboard pode ficar pesado.

Frontend:

- Dashboard faz muitos calculos em render.
- Nao usa `useMemo`.
- Com volume pequeno/medio, ok.

Opiniao tecnica:

Antes de otimizar com memoizacao, separar funcoes puras e medir. Memoizacao cedo em arquivo gigante pode aumentar complexidade sem resolver raiz.

Possivel evolucao:

- endpoint de dashboard agregado
- paginacao para historico
- filtros server-side para relatorios
- cache local ou React Query/TanStack Query se o app crescer

## 49. Notas sobre acessibilidade

Pontos positivos:

- Alguns botoes possuem `aria-label`.
- `NoticeBanner` usa `role="status"` e `aria-live="polite"`.
- DateField tem labels.
- Tabela usa `aria-sort`.

Pontos a revisar:

- Muitos estilos inline e botoes icon-only precisam garantir labels/titles.
- Contraste do tema escuro com opacidades deve ser testado.
- Modais podem precisar foco gerenciado e trap de foco.
- Rail lateral com labels escondidos depende de title/aria-label.

## 50. Notas sobre dados e analise

O produto usa dados de habitos e biometria.

Cuidados:

- Validar nulos antes de calcular medias.
- Nao assumir que todo registro tem biometria.
- Nao assumir que toda biometria tem registro diario.
- Evitar causalidade indevida.
- Em insights, trabalhar com linguagem de tendencia, coincidencia ou associacao.

Visualizacoes atuais:

- Radar para medias de habilidades/comportamentos.
- Linha para tendencia curta.
- Area para peso.
- Linha/composto para bem-estar.
- Area para sono.
- Tabela para historico.

Opiniao tecnica:

As escolhas fazem sentido para MVP. Para produto mais serio, seria util exibir tamanho da amostra e periodo de calculo em cada insight/metrica.

## 51. Possivel schema conceitual

```text
Usuario
  1 -> N RegistroDiario
  1 -> N MedidaBiometrica
  1 -> N Meta
  1 -> N Insight
  1 -> 1 ConfiguracaoPerfil
```

Chaves naturais importantes:

```text
Usuario.Email
RegistroDiario.UsuarioId + RegistroDiario.Data
MedidaBiometrica.UsuarioId + MedidaBiometrica.DataDia
```

## 52. Contratos importantes frontend/backend

### AuthResponse

Backend retorna:

```json
{
  "token": "...",
  "expiresAt": "...",
  "usuario": {
    "id": 1,
    "nome": "...",
    "email": "...",
    "dataCriacao": "...",
    "dataNascimento": "YYYY-MM-DD",
    "sexo": "M"
  }
}
```

Frontend espera esses nomes em camelCase.

### RegistroDiarioResponse

Campos:

- `id`
- `usuarioId`
- `data`
- `humor`
- `sono`
- `produtividade`
- `energia`
- `exercicio`
- `agua`
- `observacoes`

### MedidaBiometricaResponse

Campos:

- `id`
- `usuarioId`
- `peso`
- `altura`
- `imc`
- `data`
- `imcClassificacao`
- `imcCor`

Observacao:

- C# usa propriedade `IMC`, serializada como `imc` por default do ASP.NET Core.

### MetaDTO

Campos:

- `id`
- `usuarioId`
- `categoria`
- `valorAlvo`
- `descricao`
- `dataInicio`
- `dataFim`
- `ativa`

### ConfiguracaoPerfil

Campos esperados:

- `id`
- `usuarioId`
- `temaEscuro`
- `idioma`
- `fusoHorario`
- `exibirMetaNoDashboard`
- `receberNotificacoes`
- `receberRelatorioSemanal`

## 53. Pontos de atencao ao mexer em datas

Funcoes relevantes:

- `getLocalDateInputValue`
- `getDateKey`
- `toLocalDate`
- `formatDisplayDate`
- `resolveDateRange`
- `getPeriodStartDate`
- `getAnalysisBucketMeta`
- `aggregateAnalysisRecords`
- `aggregateAnalysisWeight`
- `DateField`

Regras:

- Inputs HTML usam `YYYY-MM-DD`.
- Display pt-BR usa `dd/mm/yyyy`.
- Registros diarios usam `DateOnly` no backend.
- Biometria usa `DateTime`.
- Front normaliza muitos valores com `split('T')[0]`.

Riscos:

- Fuso horario.
- Datas invertidas em filtro customizado.
- Meses e quinzenas.
- Fim de semana.
- `new Date('YYYY-MM-DD')` pode ter comportamento UTC dependendo do uso; o codigo costuma usar `new Date(`${date}T00:00:00`)` para forcar local.

## 54. Pontos de atencao ao mexer em metas

Arquivos:

- `Ritmo.Api/DTOs/MetaDTO.cs`
- `Ritmo.Api/Services/MetaService.cs`
- `frontend/src/components/MetaFormModal.jsx`
- `frontend/src/pages/Dashboard.jsx`

Se adicionar categoria nova:

1. Atualizar regex no `MetaDTO`.
2. Atualizar faixas no `MetaDTO.Validate`.
3. Atualizar `MetaService.ValidateMeta`.
4. Atualizar select no `MetaFormModal`.
5. Atualizar `getValidationConfig`.
6. Atualizar `getMetaCategoryLabel`.
7. Atualizar `getMetaProgress`.
8. Atualizar documentacao.

Risco:

- Front e backend duplicam validacao de faixas. Se mudar em um e esquecer outro, UX quebra.
- A regra de progresso de `Peso` esta no frontend e depende de historico. Ao alterar, testar pelo menos estes cenarios:
  - usuario estava acima do alvo e ficou abaixo dele
  - usuario estava abaixo do alvo e ficou acima dele
  - usuario iniciou perto do alvo e precisa manter
  - nao ha biometria suficiente
- Evitar voltar com rotulos `kg ou mais` ou `kg ou menos` para peso, porque isso confundiu a leitura de meta como limite minimo/maximo.

## 55. Pontos de atencao ao mexer em biometria

Arquivos:

- `MedidaBiometrica.cs`
- `MedidaBiometricaDTO.cs`
- `BiometriaService.cs`
- `BiometriaController.cs`
- `DataFormModal.jsx`
- `Dashboard.jsx`

Se mudar regra de altura/peso:

1. Atualizar DTO backend.
2. Atualizar valida frontend.
3. Atualizar modal.
4. Atualizar IMC se necessario.
5. Revisar migrations se campo mudou.

Riscos:

- `DataDia` computado depende de PostgreSQL.
- Testes com EF InMemory nao cobrem essa constraint.

## 56. Pontos de atencao ao mexer em autenticacao

Arquivos:

- `Program.cs`
- `JwtTokenService.cs`
- `PasswordHasher.cs`
- `UserContextExtensions.cs`
- `UsuarioService.cs`
- `UsuariosController.cs`
- `authStorage.js`
- `apiClient.js`
- `Login.jsx`
- `SettingsPanel.jsx`

Se adicionar refresh token:

1. Criar entidade/tabela de refresh tokens.
2. Definir expiracao e rotacao.
3. Criar endpoint refresh.
4. Ajustar login para retornar refresh token.
5. Ajustar frontend para renovar.
6. Decidir storage seguro.
7. Implementar revogacao ao trocar senha/excluir conta/logout.

Risco:

- Mudar autenticacao afeta todo app.
- O login agora diferencia usuario inexistente de senha incorreta. Se a decisao de produto mudar para esconder existencia de emails, alterar `LoginResult`/`UsuariosController.Login` e revisar mensagens em `Login.jsx`.
- Para producao, adicionar rate limiting antes de manter mensagens especificas em ambiente publico.

## 57. Principais decisoes tecnicas ja tomadas

### Usar service layer simples

Fato:

- Regras estao em services.

Opiniao:

- Boa escolha para tamanho atual.

### Calcular IMC no backend

Fato:

- DTO calcula IMC e classificacao.

Opiniao:

- Boa escolha para consistencia.

### Upsert por data

Fato:

- Registro diario e biometria atualizam o dia existente.

Opiniao:

- Boa UX e boa integridade.

### Atualizar estado local apos mutacoes

Fato:

- Dashboard evita recarregar tudo apos salvar registro/criar meta/excluir meta.

Opiniao:

- Bom para performance percebida.
- Exige cuidado para manter estado consistente.

### Frontend concentrado no Dashboard

Fato:

- Dashboard contem muita regra.

Opiniao:

- Foi aceitavel para evoluir rapido, mas agora e gargalo.

## 58. Perguntas em aberto para produto

1. Biometria sem registro diario deve aparecer na tabela de relatorios?
2. Insights devem ser apenas informativos ou tambem recomendacoes?
3. O produto quer linguagem de saude geral ou acompanhamento mais clinico?
4. Configuracoes de perfil devem realmente afetar tema, notificacoes e relatorios?
5. Metas devem ter historico de conclusao ou so estado atual?
6. Usuario pode querer exportar biometricas isoladas?
7. Haverá multiplos dispositivos/ambientes?
8. Haverá deploy publico ou apenas entrega academica?

## 59. Sinais de projeto academico

Fato:

- README menciona disciplina de Desenvolvimento Web da UFSC Ararangua.
- `regras_avaliacao.md` existe.
- Documentacao e instrucoes sao fortes.

Inferencia:

- O projeto precisa equilibrar entrega academica, clareza pedagogica e qualidade real.

Opiniao:

- Para avaliacao, documentacao honesta e fluxo funcional contam muito.
- Para evoluir como produto, testes e hardening passam a ser prioridade.

## 60. Resumo final para uma proxima IA

Este repositorio e um MVP full stack chamado Ritmo. Ele registra habitos diarios e biometria, calcula IMC, acompanha metas e exibe dashboard analitica. O backend .NET 8 e relativamente bem estruturado, com services, DTOs, controllers, JWT e EF Core/PostgreSQL. O frontend React/Vite entrega a experiencia principal, mas centraliza muita coisa em `Dashboard.jsx`.

O que esta solido:

- autenticacao JWT
- hash de senha PBKDF2
- login com resultado semantico para usuario inexistente e senha incorreta
- autorizacao por dono
- validacoes de dominio
- upsert de registro diario
- upsert/consolidacao de biometria por dia
- constraints unicas no banco
- dashboard funcional com graficos, filtros e exportacao
- metas de peso com conclusao por direcao historica

O que esta pendente:

- testes automatizados
- refresh token
- rate limiting
- observabilidade
- CI/CD
- motor automatico maduro de insights
- reduzir acoplamento do dashboard
- configuracao por ambiente no frontend

Se o usuario pedir manutencao, comece lendo os arquivos diretamente envolvidos e faca backup antes de alterar qualquer arquivo existente. Se o usuario pedir evolucao grande, recomende ou execute em fatias pequenas, especialmente no frontend. O caminho mais seguro e fortalecer testes e extrair logica pura do dashboard antes de grandes mudancas visuais ou de produto.

