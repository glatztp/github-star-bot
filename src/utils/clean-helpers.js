function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidRepository(repository) {
  if (!repository || typeof repository !== "string") {
    return false;
  }

  const parts = repository.trim().split("/");
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

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

function parseRepository(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  input = input.trim();

  if (input.includes("github.com")) {
    const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2].replace(/\.git$/, ""),
      };
    }
  }

  const parts = input.split("/");
  if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
    return {
      owner: parts[0],
      repo: parts[1],
    };
  }

  return null;
}

async function retry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        await sleep(delayMs);
        delayMs *= 2;
      }
    }
  }

  throw lastError;
}

module.exports = {
  sleep,
  isValidRepository,
  formatDate,
  parseRepository,
  retry,
};
