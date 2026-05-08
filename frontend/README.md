# Frontend do Ritmo

Frontend React + Vite do Ritmo, responsável pela experiência de autenticação, dashboard, análise, metas, relatórios, configurações e exportações.

## Stack

- React 19
- Vite 8
- React Router
- Axios
- Recharts
- lucide-react
- xlsx
- ESLint

## Como rodar

Instale as dependências e suba o servidor de desenvolvimento:

```powershell
npm install
npm run dev
```

URL padrão:

```text
http://localhost:5173
```

O frontend espera a API do Ritmo rodando localmente. A URL base fica centralizada em `src/api/apiClient.js`.

## Scripts úteis

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

## Estrutura principal

```text
frontend/
  src/
    api/          -> cliente Axios e interceptors
    components/   -> componentes reutilizáveis
    hooks/        -> carregamento e estado compartilhado do dashboard
    pages/        -> Login e Dashboard
    utils/        -> helpers de autenticação e domínio
```

## Fluxo de autenticação

O login e o cadastro ficam em `src/pages/Login.jsx`.

Comportamento atual:

- cadastro com validação inline por campo
- login com mensagens vindas da API
- usuário inexistente recebe mensagem específica para orientar registro
- senha incorreta recebe mensagem própria
- token JWT é salvo no storage pelo helper de autenticação
- chamadas autenticadas passam pelo interceptor do Axios

## Dashboard

O arquivo central é `src/pages/Dashboard.jsx`.

Ele coordena:

- carregamento de registros, metas, biometria, insights e perfil
- registro diário
- biometria opcional por dia
- gráficos de panorama e análise
- metas por categoria
- relatórios com filtros e exportação
- configurações de perfil, troca de senha e exclusão de conta

Fato: esse arquivo concentra bastante regra de produto. Para evoluções maiores, o melhor caminho é extrair lógica pura para módulos menores antes de adicionar novas responsabilidades.

## Metas de peso

Peso não é tratado como “quanto maior, melhor”.

No cadastro de uma meta de peso, a interface pede o objetivo:

- reduzir até o peso alvo
- ganhar até o peso alvo
- manter perto do peso alvo

A regra atual usa essa direção salva para calcular o progresso. Para metas antigas sem direção, o dashboard ainda usa o histórico como fallback:

- se o usuário estava acima do alvo, a meta é redução
- se o usuário estava abaixo do alvo, a meta é ganho
- se já estava perto do alvo, a meta é manutenção

Metas novas de peso também recebem um valor inicial salvo pelo backend, baseado na biometria mais recente do usuário. A barra, porém, mostra proximidade do peso atual em relação ao alvo. Assim, se o usuário está em `75 kg` e cria meta para `73 kg` ou `77 kg`, a barra já aparece quase cheia porque ele já está perto da meta.

Visualmente, a porcentagem aparece em um marcador acima da barra, com uma haste indicando a posição. A cor também acompanha a proximidade: vermelho/laranja para longe, amarelo para intermediário, ciano para perto e verde quando está praticamente no alvo ou concluído.

Exemplo:

- histórico anterior acima de `75 kg`
- meta em `75 kg`
- peso atual em `74 kg`
- status esperado: `concluido`

Na interface, o rótulo continua limpo, como `Meta: 75.0 kg`, sem `ou mais` ou `ou menos`.

## Validação recomendada

Antes de fechar uma alteração no frontend, rode:

```powershell
npm run build
```

Se a alteração envolver padrões de hooks, componentes novos ou regras de lint, rode também:

```powershell
npm run lint
```

## Pontos de atenção

- `Dashboard.jsx` é o principal ponto de acoplamento do frontend.
- Datas precisam respeitar o formato local usado na interface.
- Exportações CSV e Excel devem refletir os filtros ativos.
- Metas precisam ficar coerentes com as faixas validadas no backend.
- Mudanças no shape de resposta da API exigem revisar `useDashboardData.js` e os componentes consumidores.
