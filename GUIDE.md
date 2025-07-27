# 🤖 GitHub Star Bot - Guia Completo

## 📋 Índice

1. [Instalação](#instalação)
2. [Configuração](#configuração)
3. [Uso](#uso)
4. [Exemplos](#exemplos)
5. [Troubleshooting](#troubleshooting)
6. [API](#api)

## 🚀 Instalação

### Pré-requisitos

- Node.js 14+ instalado
- Conta no GitHub
- Token de acesso pessoal do GitHub

### Passos

```bash
# 1. Clone ou baixe o projeto
git clone <url-do-projeto>
cd github-star-bot

# 2. Instale as dependências
npm install

# 3. Configure o bot
npm run setup
```

## ⚙️ Configuração

### Configuração Automática

```bash
npm run setup
```

### Configuração Manual

1. Copie o arquivo `.env.example` para `.env`
2. Edite o arquivo `.env` com suas configurações

### Obter Token do GitHub

1. Acesse: GitHub → Settings → Developer settings → Personal access tokens
2. Clique em "Generate new token (classic)"
3. Selecione escopo: `public_repo` (ou `repo` para repos privados)
4. Copie o token gerado

### Validar Configuração

```bash
npm run validate
```

## 🎯 Uso

### Comandos Básicos

```bash
# Dar estrelas (modo padrão)
npm start

# Verificar status das estrelas
npm run check

# Remover estrelas
npm run unstar

# Modo desenvolvimento (auto-reload)
npm run dev
```

### Modos de Operação

#### 1. Star (Dar Estrelas)

```bash
MODE=star npm start
```

- Adiciona estrela nos repositórios configurados
- Pula repositórios que já possuem estrela

#### 2. Unstar (Remover Estrelas)

```bash
MODE=unstar npm start
```

- Remove estrela dos repositórios configurados
- Pula repositórios que não possuem estrela

#### 3. Check (Verificar Status)

```bash
MODE=check npm start
```

- Apenas verifica o status das estrelas
- Não modifica nada

### Configuração via Variáveis de Ambiente

```bash
# Temporariamente sobrescrever configurações
REPOSITORIES="facebook/react,microsoft/vscode" STAR_INTERVAL=5 npm start

# Modo silencioso (sem cores)
NO_COLOR=1 npm start

# Modo debug (logs detalhados)
DEBUG=1 npm start
```

## 📚 Exemplos

### Exemplo 1: Dar Estrela em Frameworks Frontend

```bash
# Configurar no .env
REPOSITORIES=facebook/react,vuejs/vue,angular/angular,sveltejs/svelte
MODE=star
STAR_INTERVAL=3

npm start
```

### Exemplo 2: Verificar Estrelas em Ferramentas de Desenvolvimento

```bash
# Configurar no .env
REPOSITORIES=microsoft/vscode,prettier/prettier,eslint/eslint,webpack/webpack
MODE=check
STAR_INTERVAL=1

npm run check
```

### Exemplo 3: Uso Programático

```javascript
const GitHubBot = require("./src/bot");

const bot = new GitHubBot({
  token: "your_token_here",
  repositories: ["microsoft/vscode", "facebook/react"],
  interval: 2,
  mode: "star",
});

await bot.run();
```

### Exemplo 4: Executar Exemplos Prontos

```bash
# Exemplo básico
npm run example

# Exemplo avançado
npm run example avancado

# Exemplo de verificação
npm run example verificacao
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Autenticação

```
❌ Falha na autenticação: Bad credentials
```

**Solução:**

- Verifique se o token está correto
- Confirme que o token tem as permissões necessárias
- Regenere o token se necessário

#### 2. Rate Limiting

```
❌ API rate limit exceeded
```

**Solução:**

- Aumente o `STAR_INTERVAL` no .env
- Aguarde 1 hora para reset do rate limit
- Verifique quantas requests já foram feitas

#### 3. Repositório Não Encontrado

```
❌ Repository not found: owner/repo
```

**Solução:**

- Verifique se o nome do repositório está correto
- Confirme que o repositório é público ou você tem acesso
- Use o formato exato: `owner/repository-name`

#### 4. Token Inválido

```
⚠️ GITHUB_TOKEN pode não ser válido
```

**Solução:**

- Use token que comece com `ghp_`, `gho_`, `ghu_`, `ghs_` ou `ghr_`
- Regenere o token no GitHub
- Verifique se não há espaços extras

### Códigos de Status HTTP

- `200`: Sucesso
- `401`: Token inválido
- `403`: Rate limit ou sem permissão
- `404`: Repositório não encontrado
- `422`: Já tem estrela (ao dar estrela) ou não tem estrela (ao remover)

### Debug

```bash
# Ativar logs detalhados
DEBUG=1 npm start

# Ver rate limit atual
npm run validate
```

## 📖 API

### Classe GitHubBot

#### Construtor

```javascript
new GitHubBot(config);
```

**Parâmetros:**

- `token` (string): Token do GitHub
- `username` (string, opcional): Nome de usuário
- `repositories` (array): Lista de repositórios (formato: "owner/repo")
- `interval` (number): Intervalo entre operações em segundos
- `mode` (string): Modo de operação ("star", "unstar", "check")

#### Métodos

##### `run()`

Executa o bot de acordo com a configuração.

##### `starRepositories(repositories)`

Dá estrela nos repositórios especificados.

##### `unstarRepositories(repositories)`

Remove estrela dos repositórios especificados.

##### `checkStarStatus(repositories)`

Verifica o status das estrelas nos repositórios.

##### `isRepositoryStarred(owner, repo)`

Verifica se um repositório específico tem estrela.

##### `getRepositoryInfo(owner, repo)`

Obtém informações detalhadas de um repositório.

### Utilitários

#### helpers.js

- `sleep(ms)`: Pausa execução
- `isValidRepository(repo)`: Valida formato do repositório
- `parseRepository(input)`: Extrai owner/repo de URL ou string
- `retry(fn, maxRetries, delayMs)`: Executa função com retry

#### logger.js

- `info(message)`: Log informativo
- `success(message)`: Log de sucesso
- `warn(message)`: Log de aviso
- `error(message)`: Log de erro
- `debug(message)`: Log de debug (apenas se DEBUG=1)

## ⚡ Performance

### Rate Limits GitHub

- **Autenticado**: 5.000 requests/hora
- **Não autenticado**: 60 requests/hora

### Recomendações

- Use `STAR_INTERVAL` >= 2 segundos
- Para muitos repositórios, use `STAR_INTERVAL` >= 5 segundos
- Execute em horários de menor uso (madrugada)

### Monitoramento

```bash
# Verificar rate limit
npm run validate

# Ver logs em tempo real
tail -f github-star-bot.log
```

## 🛡️ Segurança

### Boas Práticas

- **Nunca** commite o arquivo `.env`
- Use tokens com permissões mínimas necessárias
- Regenere tokens periodicamente
- Use o bot responsavelmente

### Permissões Necessárias

- `public_repo`: Para repositórios públicos
- `repo`: Para repositórios privados (se necessário)

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
