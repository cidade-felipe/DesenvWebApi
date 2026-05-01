# Documentação Técnica: Ritmo

## 1. Visão geral

O Ritmo é um sistema web de análise pessoal que combina registro diário, biometria e metas para ajudar o usuário a acompanhar padrões de comportamento e saúde.

O projeto é dividido em:

- **backend** em ASP.NET Core Web API
- **frontend** em React + Vite
- **banco relacional** PostgreSQL

O foco atual do produto está em:

- registro de hábitos
- acompanhamento biométrico
- metas de rotina e peso
- visualização analítica no dashboard

## 2. Estado real do projeto

### 2.1. O que está implementado

- cadastro e login
- autenticação JWT
- hash de senha no backend
- CRUD de registros diários
- CRUD de metas
- CRUD de biometria
- leitura de insights
- dashboard com gráficos, cards, filtros e exportação
- aba `Configurações` (perfil, senha e exclusão segura de conta)
- navegação desktop da dashboard com dock lateral animado e alinhado ao conteúdo
- avisos inline e confirmações visuais no frontend

### 2.2. O que ainda não está completo

- motor maduro de geração automática de insights
- refresh token
- testes automatizados
- observabilidade e métricas operacionais
- pipeline de deploy

### 2.3. Por que isso importa

**Fato**

A documentação antiga tratava alguns pontos como se já estivessem totalmente consolidados, principalmente insights automáticos.

**Inferência**

O código atual mostra um MVP funcional com boas bases, mas ainda em evolução.

**Opinião técnica**

Documentar o estado real é importante para evitar expectativa errada, reduzir retrabalho e apoiar decisões técnicas mais honestas.

## 3. Arquitetura

## 3.1. Backend

O backend segue uma arquitetura simples e direta:

- `Controllers` expõem a API REST
- `Services` concentram parte da regra de negócio
- `AppDbContext` faz o acesso ao PostgreSQL via EF Core

### Principais arquivos

- [Program.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Program.cs)
- [AppDbContext.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Data/AppDbContext.cs)
- [UsuarioService.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Services/UsuarioService.cs)
- [RegistroDiarioService.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Services/RegistroDiarioService.cs)
- [BiometriaService.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Services/BiometriaService.cs)
- [MetaService.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Services/MetaService.cs)

## 3.2. Frontend

O frontend é uma SPA React com duas áreas centrais:

- autenticação
- dashboard

### Principais arquivos

- [App.jsx](/c:/Users/felip/OneDrive/git_work/RitmoApi/frontend/src/App.jsx)
- [Login.jsx](/c:/Users/felip/OneDrive/git_work/RitmoApi/frontend/src/pages/Login.jsx)
- [Dashboard.jsx](/c:/Users/felip/OneDrive/git_work/RitmoApi/frontend/src/pages/Dashboard.jsx)
- [useDashboardData.js](/c:/Users/felip/OneDrive/git_work/RitmoApi/frontend/src/hooks/useDashboardData.js)
- [apiClient.js](/c:/Users/felip/OneDrive/git_work/RitmoApi/frontend/src/api/apiClient.js)

## 4. Fluxo principal do sistema

### 4.1. Autenticação

1. Usuário faz cadastro ou login.
2. O backend retorna `token`, `expiresAt` e `usuario`.
3. O frontend salva a sessão localmente.
4. O Axios envia automaticamente `Authorization: Bearer ...`.

No estado atual da interface de autenticação:

- o cadastro mostra erros por campo, em vez de depender apenas de mensagens genéricas
- a data de nascimento aceita digitação manual no formato da interface e também uso do calendário
- o layout do formulário de cadastro foi refinado para acomodar melhor campos como sexo biológico

### 4.2. Dashboard

Depois do login, o frontend carrega em paralelo:

- usuário
- registros diários
- configuração de perfil
- insights
- metas
- biometria

Esse carregamento é feito em [useDashboardData.js](/c:/Users/felip/OneDrive/git_work/RitmoApi/frontend/src/hooks/useDashboardData.js).

No estado atual da interface:

- o cabeçalho saúda o usuário pelo primeiro nome, conforme o horário do dia
- a dashboard usa avisos inline no lugar de interrupções bruscas do navegador
- as abas de análise e relatórios compartilham uma linguagem visual mais consistente para filtros
- no desktop, a navegação pode sair da barra superior e virar uma rail lateral alinhada ao conteúdo
- a animação dessa transição responde à velocidade do scroll para dar leitura mais premium sem quebrar usabilidade
- mutações como criar meta, excluir meta e salvar registro passaram a atualizar estado local em vez de recarregar toda a dashboard
- a aba `Configurações` permite atualizar dados do perfil, trocar senha e excluir a conta com confirmação

### 4.3. Registro diário

O registro diário representa hábitos do dia. O backend aplica lógica de atualização por data, evitando duplicidade quando o mesmo usuário salva novamente o mesmo dia.

No frontend, esse fluxo também pode incluir:

- observações livres sobre o dia
- biometria opcional, quando o usuário realmente se pesou

No estado atual da interface, existe uma exceção importante:

- se o usuário ainda não tem nenhum histórico biométrico nem registro anterior, o primeiro registro passa a exigir peso e altura
- essa regra existe para iniciar IMC, faixa de peso e indicadores corporais com uma base minimamente confiável

### 4.4. Biometria

A biometria é tratada separadamente do registro diário.

Cada entrada contém:

- peso
- altura
- data

Regras importantes:

- o backend consolida biometria por dia
- se o usuário registrar novamente no mesmo dia, o valor do dia é atualizado
- o histórico do dashboard usa um registro consolidado por data

No frontend, o fluxo mais recente também passou a considerar:

- a altura já salva pode ser reaproveitada nos registros seguintes
- o usuário só precisa atualizar a altura manualmente quando quiser corrigir esse valor
- no primeiro registro, a interface trava o fluxo até peso e altura serem informados

### 4.5. Metas

As metas são ligadas ao usuário e usadas no dashboard para comparar alvo versus situação atual.

Categorias suportadas:

- `Sono`
- `Agua` (exibida como `Água` na interface)
- `Humor`
- `Produtividade`
- `Energia`
- `Treino`
- `Peso`

No estado atual do modal de metas:

- o campo de valor alvo abre vazio, sem sugestão numérica automática
- a orientação de preenchimento fica no placeholder com faixa mínima e máxima da categoria
- a interface exibe rótulos humanos, como `Água`, sem alterar o valor técnico persistido

## 5. Modelo de dados

```mermaid
classDiagram
    class USUARIOS {
        +int Id
        +string Nome
        +string Email
        +string Senha
        +datetime DataCriacao
        +date DataNascimento
        +string Sexo
    }

    class REGISTROS_DIARIOS {
        +int Id
        +int UsuarioId
        +date Data
        +int Humor
        +decimal Sono
        +int Produtividade
        +int Energia
        +bool Exercicio
        +decimal Agua
        +string Observacoes
        +datetime DataCriacao
    }

    class METAS {
        +int Id
        +int UsuarioId
        +string Categoria
        +decimal ValorAlvo
        +string Descricao
        +date DataInicio
        +date DataFim
        +bool Ativa
        +datetime DataCriacao
    }

    class INSIGHTS {
        +int Id
        +int UsuarioId
        +string Mensagem
        +string Categoria
        +string Nivel
        +datetime DataGeracao
        +bool Lido
    }

    class CONFIGURACOES_PERFIL {
        +int Id
        +int UsuarioId
        +bool TemaEscuro
        +string Idioma
        +string FusoHorario
        +bool ReceberNotificacoes
        +bool ReceberRelatorioSemanal
        +bool ExibirMetaNoDashboard
    }

    class MEDIDAS_BIOMETRICAS {
        +int Id
        +int UsuarioId
        +decimal Peso
        +decimal Altura
        +date Data
    }

    USUARIOS "1" --> "0..*" REGISTROS_DIARIOS : possui
    USUARIOS "1" --> "0..*" METAS : possui
    USUARIOS "1" --> "0..*" INSIGHTS : possui
    USUARIOS "1" --> "1" CONFIGURACOES_PERFIL : possui
    USUARIOS "1" --> "0..*" MEDIDAS_BIOMETRICAS : possui
```

### Observação sobre o diagrama

**Fato**

O bloco acima agora usa `classDiagram`, que costuma ser mais compatível com alguns editores Mermaid do que `erDiagram`.

**Importante**

Se você colar esse trecho em editores Mermaid que esperam apenas a sintaxe pura do diagrama, como alguns plugins ou playgrounds, precisa remover as linhas de cerca de código:

- a linha inicial com ` ```mermaid `
- a linha final com ` ``` `

Ou seja, nesses casos o conteúdo deve começar direto em `classDiagram`.

## 5.1. Usuario

- `Id`
- `Nome`
- `Email`
- `Senha`
- `DataCriacao`
- `DataNascimento`
- `Sexo`

## 5.2. RegistroDiario

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

## 5.3. MedidaBiometrica

- `Id`
- `UsuarioId`
- `Peso`
- `Altura`
- `Data`

### Observação

O IMC não é persistido como coluna principal de negócio. Ele é calculado na API e entregue ao frontend via DTO de resposta.

## 5.4. Meta

- `Id`
- `UsuarioId`
- `Categoria`
- `ValorAlvo`
- `Descricao`
- `DataInicio`
- `DataFim`
- `Ativa`
- `DataCriacao`

## 5.5. Insight

- `Id`
- `UsuarioId`
- `Mensagem`
- `Categoria`
- `Nivel`
- `DataGeracao`
- `Lido`

## 5.6. ConfiguracaoPerfil

- `Id`
- `UsuarioId`
- `TemaEscuro`
- `Idioma`
- `FusoHorario`
- `ReceberNotificacoes`
- `ReceberRelatorioSemanal`
- `ExibirMetaNoDashboard`

## 6. Segurança implementada

## 6.1. Senhas

**Fato**

O projeto deixou de salvar senha em texto puro e passou a usar hash no backend.

**Impacto**

- reduz risco de vazamento direto
- melhora o padrão mínimo de segurança
- prepara o sistema para autenticação real

## 6.2. JWT

O backend usa JWT Bearer para autenticação.

Isso significa que:

- o login gera token assinado
- endpoints protegidos exigem autenticação
- controllers validam o dono do recurso

## 6.3. CORS

O CORS foi deixado configurável por origem, usando `Cors:AllowedOrigins`.

Isso é importante porque:

- evita abertura total da API
- permite diferenciar `localhost` e `127.0.0.1`

## 6.4. Configuração local

O projeto suporta `appsettings.Local.json`, ignorado no Git, para guardar:

- connection string local
- configurações JWT
- origens de CORS

Também existe uma factory para `dotnet ef`, em [AppDbContextFactory.cs](/c:/Users/felip/OneDrive/git_work/RitmoApi/Ritmo.Api/Data/AppDbContextFactory.cs), permitindo migrations e comandos de banco fora da inicialização completa da API.

## 7. Validação e regras de domínio

## 7.1. Validação estrutural

O backend usa `DataAnnotations` para validar:

- obrigatoriedade
- formatos
- faixas básicas
- limites de tamanho

Quando o payload é inválido, a API responde com:

- `mensagem`
- `erros` por campo

## 7.2. Validação semântica

Além do formato, existem regras de negócio aplicadas nos serviços.

Exemplos:

- data de nascimento não pode ser futura
- biometria não pode ser anterior ao nascimento
- registro diário não pode ser futuro
- `DataFim` da meta não pode ser anterior a `DataInicio`
- cada categoria de meta possui sua própria faixa válida

## 7.3. Ajuste importante em metas decimais

Foi corrigido um bug sutil no cadastro de metas.

**Fato**

O uso de `Range(typeof(decimal), "0.1", "100")` causava erro dependendo da cultura do ambiente, especialmente em contexto `pt-BR`.

**Correção**

A validação de `ValorAlvo` passou a ser feita com `IValidatableObject`, usando `decimal` real no código.

**Impacto prático**

- elimina erro interno ao salvar meta
- reduz dependência da cultura do servidor
- deixa a validação mais previsível

## 7.4. Validação de metas por categoria

**Fato**

O backend valida `ValorAlvo` por categoria, garantindo coerência com os limites reais de negócio e com o que o dashboard calcula.

Faixas atuais:

- `Sono`: 0.5 a 24
- `Agua`: 0.1 a 25
- `Humor`, `Produtividade`, `Energia`: 1 a 5
- `Treino`: 1 a 7
- `Peso`: 10 a 600

**Impacto prático**

- reduz erro 400 no cadastro de metas (principalmente `Peso`)
- evita inconsistência entre frontend e backend

## 7.5. Integridade de dados no banco (unicidade por dia)

**Fato**

Além do upsert na camada de serviço, o banco garante unicidade para mitigar duplicidade em concorrência:

- `RegistrosDiarios`: índice único em (`UsuarioId`, `Data`)
- `MedidasBiometricas`: índice único em (`UsuarioId`, `DataDia`), onde `DataDia` é uma coluna computada a partir de `Data`

Essa garantia foi adicionada na migration `20260430114117_AddUniquePerDayConstraints`.

**Impacto prático**

- reduz risco de inconsistência no dashboard (ex: dois registros no mesmo dia)
- mitiga bugs difíceis de reproduzir ligados a requisições simultâneas

## 8. Regras específicas de metas

## 8.1. Metas de hábito

Para `Sono`, `Agua`, `Humor`, `Produtividade` e `Energia`, o dashboard calcula uma média recente e compara com o alvo.

## 8.2. Meta de treino

Para `Treino`, o sistema conta dias da semana com exercício marcado.

## 8.3. Meta de peso

Meta de peso não pode usar a lógica simples de “quanto maior, melhor”.

Por isso, a regra implementada é:

- calcula o peso inicial de referência desde o início da meta
- calcula a distância entre o peso atual e o alvo
- mede o quanto essa distância diminuiu

Essa abordagem é melhor porque funciona para:

- emagrecimento
- ganho de peso
- manutenção próxima ao alvo

No dashboard:

- o card mostra `Peso atual`
- o percentual mede aproximação do alvo
- a situação visual muda conforme a proximidade

## 9. Gráficos e dashboard

## 9.1. Panorama

O panorama mostra cards e gráficos de visão geral.

No estado atual, essa aba também passou a ter cabeçalho próprio, mantendo consistência visual com as abas de metas e relatórios.

## 9.2. Análise

A aba de análise mostra gráficos mais detalhados, com foco em leitura temporal e menos ruído visual.

Melhorias recentes:

- datas do eixo com ano
- tooltip com data completa
- correções para evitar falha visual ao passar o mouse
- filtros por período rápido e intervalo customizado
- modo `Personalizado` para mostrar os campos `De` e `Até` apenas quando o usuário realmente precisa desse nível de controle
- agrupamento por `Diário`, `Semanal`, `Quinzenal` e `Mensal`
- ocultação automática do agrupamento `Mensal` quando o recorte ativo geraria apenas um período útil
- agregação por período para reduzir ruído de leitura em uso real
- eixo X com densidade adaptativa conforme largura e zoom
- gráfico próprio para sono
- gráfico próprio para humor, energia, produtividade e bem-estar
- reaproveitamento do último peso conhecido quando existe registro no período sem nova pesagem
- título próprio da aba para reforçar contexto visual dentro do dashboard

### Observação técnica

**Fato**

Os gráficos da aba de análise não trabalham mais apenas com registros diários crus.

**Impacto**

- hábitos usam médias por período
- peso usa o último valor conhecido em cada período
- isso melhora leitura histórica quando o volume de dados cresce

## 9.3. Relatórios

A aba de relatórios agora combina visualização tabular, resumo agregado e filtros mais ricos.

Filtros implementados:

- período rápido
- intervalo customizado
- foco do histórico em `Todos`, `Treino`, `Biometria` e `Anotações`

No estado atual, o intervalo manual também fica escondido até o usuário escolher `Personalizado`, reduzindo ruído visual e evitando a impressão de que todo filtro exige datas explícitas.

Além disso:

- a exportação respeita os filtros ativos
- a ordenação da tabela também influencia o que é exportado
- os cards de resumo usam o mesmo recorte temporal aplicado ao histórico
- a data exportada segue o mesmo formato visual da interface
- a tabela de relatórios continua permitindo edição do histórico, mas deixou de expor exclusão direta nessa superfície

O dashboard permite exportar:

- CSV
- Excel

## 9.4. Navegação desktop da dashboard

No desktop, a dashboard usa dois modos visuais para navegação entre abas:

- barra horizontal no topo, enquanto o usuário está no início da leitura
- rail lateral, quando a página avança o suficiente para justificar navegação persistente ao lado do conteúdo

Aspectos importantes dessa implementação:

- a transição entre topo e lateral usa histerese no scroll para evitar troca nervosa em poucos pixels
- a rail lateral ficou estruturalmente alinhada ao grid do conteúdo, em vez de solta na viewport
- o movimento foi refinado com rotação controlada, overshoot curto e resposta à velocidade do scroll

Impacto prático:

- melhora percepção de acabamento do produto
- reduz ruído visual durante leitura longa
- deixa a navegação mais acessível sem roubar atenção dos gráficos

## 10. Ambiente local

## 10.1. Backend

```powershell
dotnet run --project Ritmo.Api
```

Swagger:

```text
http://localhost:5066/swagger
```

## 10.2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 10.3. Banco

```powershell
dotnet ef database update --project Ritmo.Api
```

## 11. Limitações atuais

### Técnicas

- não há suíte de testes automatizados
- não há CI/CD
- ainda faltam logs e métricas operacionais

### Produto

- o módulo de insights ainda não representa um motor analítico completo
- não há gestão avançada de sessão, como refresh token e revogação

## 12. Próximos passos recomendados

### Curto prazo

- adicionar testes para services
- reduzir acoplamento do `Dashboard.jsx`

### Médio prazo

- criar geração automática real de insights
- adicionar refresh token
- preparar pipeline de validação e deploy

### Longo prazo

- observabilidade
- auditoria de segurança mais profunda
- endurecimento para produção
