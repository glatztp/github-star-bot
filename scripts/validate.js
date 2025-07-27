#!/usr/bin/env node

/**
 * Script para validar a configuração do bot
 */

require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const logger = require("../src/utils/logger");
const {
  isValidRepository,
  isValidGitHubToken,
} = require("../src/utils/helpers");

async function validate() {
  logger.info("🔍 Validando configuração do bot...\n");

  let hasErrors = false;

  // Validar token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    logger.error("❌ GITHUB_TOKEN não configurado");
    hasErrors = true;
  } else if (!isValidGitHubToken(token)) {
    logger.warn("⚠️ GITHUB_TOKEN pode não ser válido");
  } else {
    logger.success("✅ GITHUB_TOKEN configurado");
  }

  // Validar repositórios
  const repositories = process.env.REPOSITORIES;
  if (!repositories) {
    logger.error("❌ REPOSITORIES não configurado");
    hasErrors = true;
  } else {
    const repoList = repositories.split(",").map((r) => r.trim());
    const validRepos = repoList.filter(isValidRepository);

    if (validRepos.length === 0) {
      logger.error("❌ Nenhum repositório válido encontrado");
      hasErrors = true;
    } else {
      logger.success(`✅ ${validRepos.length} repositórios válidos`);

      if (validRepos.length !== repoList.length) {
        logger.warn(
          `⚠️ ${
            repoList.length - validRepos.length
          } repositórios inválidos ignorados`
        );
      }
    }
  }

  // Validar intervalo
  const interval = process.env.STAR_INTERVAL;
  if (interval && isNaN(parseInt(interval))) {
    logger.warn("⚠️ STAR_INTERVAL deve ser um número");
  } else {
    logger.success(`✅ Intervalo: ${interval || 2}s`);
  }

  // Validar modo
  const mode = process.env.MODE || "star";
  const validModes = ["star", "unstar", "check"];
  if (!validModes.includes(mode.toLowerCase())) {
    logger.warn(
      `⚠️ Modo "${mode}" pode não ser válido. Modos válidos: ${validModes.join(
        ", "
      )}`
    );
  } else {
    logger.success(`✅ Modo: ${mode}`);
  }

  // Testar autenticação GitHub
  if (token && !hasErrors) {
    try {
      logger.info("\n🔐 Testando autenticação GitHub...");

      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();

      logger.success(`✅ Autenticado como: ${user.login}`);
      logger.info(`📊 Repositórios públicos: ${user.public_repos}`);
      logger.info(`⭐ Repositórios com estrela: ${user.public_gists}`);

      // Testar rate limit
      const { data: rateLimit } = await octokit.rest.rateLimit.get();
      logger.info(
        `🔄 Rate limit: ${rateLimit.rate.remaining}/${rateLimit.rate.limit}`
      );
    } catch (error) {
      logger.error(`❌ Erro na autenticação: ${error.message}`);
      hasErrors = true;
    }
  }

  // Resultado final
  console.log("\n" + "=".repeat(50));
  if (hasErrors) {
    logger.error(
      "❌ Configuração contém erros. Corrija antes de executar o bot."
    );
    process.exit(1);
  } else {
    logger.success("✅ Configuração válida! Bot pronto para uso.");
    logger.info('🚀 Execute "npm start" para iniciar o bot.');
  }
}

if (require.main === module) {
  validate().catch((error) => {
    logger.error("❌ Erro na validação:", error.message);
    process.exit(1);
  });
}

module.exports = validate;
