const GitHubBot = require("../src/bot");
const logger = require("../src/utils/logger");

/**
 * Bot otimizado para dar muitas estrelas respeitando rate limits
 */
class StarBotOtimizado extends GitHubBot {
  constructor(config) {
    super(config);
    this.maxStarsPerHour = 4500; // Margem de segurança do limite de 5000
    this.batchSize = 50; // Processar em lotes
  }

  async runOptimized() {
    logger.info("🚀 Executando bot otimizado para muitas estrelas...");

    // Verificar rate limit atual
    const rateLimit = await this.checkRateLimit();
    logger.info(
      `🔄 Rate limit disponível: ${rateLimit.remaining}/${rateLimit.limit}`
    );

    if (rateLimit.remaining < 100) {
      const resetTime = new Date(rateLimit.reset * 1000);
      logger.warn(
        `⚠️ Rate limit baixo. Reset em: ${resetTime.toLocaleString()}`
      );
      return;
    }

    // Processar repositórios em lotes
    const repos = this.validateRepositories();
    const batches = this.createBatches(repos, this.batchSize);

    logger.info(
      `📦 Processando ${repos.length} repositórios em ${batches.length} lotes`
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.info(
        `\n📦 Lote ${i + 1}/${batches.length} (${batch.length} repos)`
      );

      // Verificar rate limit antes de cada lote
      const currentLimit = await this.checkRateLimit();
      if (currentLimit.remaining < 50) {
        logger.warn("⚠️ Rate limit baixo, pausando...");
        break;
      }

      // Processar lote
      await this.processBatch(batch);

      // Pausa entre lotes
      if (i < batches.length - 1) {
        logger.info("⏸️ Pausando entre lotes...");
        await this.sleep(5000); // 5 segundos
      }
    }

    const finalLimit = await this.checkRateLimit();
    logger.info(
      `\n📊 Rate limit final: ${finalLimit.remaining}/${finalLimit.limit}`
    );
  }

  async checkRateLimit() {
    try {
      const { data } = await this.octokit.rest.rateLimit.get();
      return data.rate;
    } catch (error) {
      logger.warn("⚠️ Não foi possível verificar rate limit");
      return { remaining: 0, limit: 5000, reset: Date.now() / 1000 + 3600 };
    }
  }

  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  async processBatch(repositories) {
    let successCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");

        // Verificar se já tem estrela (mais eficiente)
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (isStarred) {
          logger.info(`⭐ ${repo} - Já possui estrela`);
        } else {
          // Dar estrela
          await this.octokit.rest.activity.starRepoForAuthenticatedUser({
            owner,
            repo: repoName,
          });

          logger.success(`🌟 ${repo} - Estrela adicionada!`);
          successCount++;
        }

        // Micro pausa para não sobrecarregar
        await this.sleep(this.config.interval * 1000);
      } catch (error) {
        if (error.status === 404) {
          logger.warn(`⚠️ ${repo} - Repositório não encontrado`);
        } else if (error.status === 403) {
          logger.warn(`⚠️ ${repo} - Sem permissão ou rate limit`);
        } else {
          logger.error(`❌ ${repo} - Erro: ${error.message}`);
        }
        errorCount++;
      }
    }

    logger.info(
      `\n📊 Lote concluído - Sucessos: ${successCount}, Erros: ${errorCount}`
    );
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = StarBotOtimizado;
