/**
 * Pausa a execução por um determinado tempo
 * @param {number} ms - Tempo em milissegundos
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Valida se um repositório tem o formato correto (owner/repo)
 * @param {string} repository - String do repositório
 * @returns {boolean}
 */
function isValidRepository(repository) {
  if (!repository || typeof repository !== "string") {
    return false;
  }

  const parts = repository.trim().split("/");
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

/**
 * Formata uma data para string legível
 * @param {Date} date - Data para formatar
 * @returns {string}
 */
function formatDate(date = new Date()) {
  return date.toLocaleString("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Valida se uma string é um token GitHub válido
 * @param {string} token - Token para validar
 * @returns {boolean}
 */
function isValidGitHubToken(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  // Tokens GitHub começam com 'ghp_', 'gho_', 'ghu_', 'ghs_' ou 'ghr_'
  const tokenPrefixes = ["ghp_", "gho_", "ghu_", "ghs_", "ghr_"];
  return (
    tokenPrefixes.some((prefix) => token.startsWith(prefix)) &&
    token.length >= 40
  );
}

/**
 * Extrai owner e repo de uma URL ou string de repositório
 * @param {string} input - URL ou string do repositório
 * @returns {object|null} - {owner, repo} ou null se inválido
 */
function parseRepository(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  // Remove espaços em branco
  input = input.trim();

  // Se é uma URL do GitHub
  if (input.includes("github.com")) {
    const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2].replace(/\.git$/, ""),
      };
    }
  }

  // Se é no formato owner/repo
  const parts = input.split("/");
  if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
    return {
      owner: parts[0],
      repo: parts[1],
    };
  }

  return null;
}

/**
 * Cria um delay aleatório entre min e max segundos
 * @param {number} minSeconds - Mínimo em segundos
 * @param {number} maxSeconds - Máximo em segundos
 * @returns {Promise}
 */
function randomDelay(minSeconds = 1, maxSeconds = 5) {
  const randomMs =
    (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000;
  return sleep(randomMs);
}

/**
 * Tenta executar uma função com retry
 * @param {Function} fn - Função para executar
 * @param {number} maxRetries - Número máximo de tentativas
 * @param {number} delayMs - Delay entre tentativas
 * @returns {Promise}
 */
async function retry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        await sleep(delayMs);
        delayMs *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}

module.exports = {
  sleep,
  isValidRepository,
  formatDate,
  isValidGitHubToken,
  parseRepository,
  randomDelay,
  retry,
};
