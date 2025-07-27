const { Octokit } = require("@octokit/rest");
const logger = require("./utils/logger");
const { sleep, isValidRepository } = require("./utils/helpers");

class GitHubBot {
  constructor(config) {
    this.config = {
      token: config.token,
      username: config.username,
      repositories: config.repositories || [],
      interval: config.interval || 2,
      mode: config.mode || "star",
    };

    // Inicializar cliente GitHub
    this.octokit = new Octokit({
      auth: this.config.token,
    });

    logger.info(
      `🤖 Bot configurado para ${this.config.repositories.length} repositórios`
    );
    logger.info(`⏱️ Intervalo entre operações: ${this.config.interval}s`);
    logger.info(`🎯 Modo: ${this.config.mode}`);
  }

  async run() {
    logger.info(`\n🎬 Iniciando operação: ${this.config.mode.toUpperCase()}`);

    // Validar autenticação
    await this.validateAuth();

    // Validar repositórios
    const validRepos = this.validateRepositories();

    if (validRepos.length === 0) {
      throw new Error("Nenhum repositório válido encontrado");
    }

    // Executar operação baseada no modo
    switch (this.config.mode.toLowerCase()) {
      case "star":
        await this.starRepositories(validRepos);
        break;
      case "unstar":
        await this.unstarRepositories(validRepos);
        break;
      case "check":
        await this.checkStarStatus(validRepos);
        break;
      default:
        throw new Error(`Modo inválido: ${this.config.mode}`);
    }
  }

  async validateAuth() {
    try {
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      logger.info(`✅ Autenticado como: ${user.login}`);

      if (this.config.username && user.login !== this.config.username) {
        logger.warn(
          `⚠️ Usuário configurado (${this.config.username}) diferente do autenticado (${user.login})`
        );
      }
    } catch (error) {
      throw new Error(`Falha na autenticação: ${error.message}`);
    }
  }

  validateRepositories() {
    const validRepos = [];

    for (const repo of this.config.repositories) {
      if (isValidRepository(repo)) {
        validRepos.push(repo);
      } else {
        logger.warn(`⚠️ Repositório inválido ignorado: ${repo}`);
      }
    }

    logger.info(`✅ ${validRepos.length} repositórios válidos encontrados`);
    return validRepos;
  }

  async starRepositories(repositories) {
    logger.info(
      `\n⭐ Dando estrela em ${repositories.length} repositórios...\n`
    );

    let successCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");

        // Verificar se já tem estrela
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (isStarred) {
          logger.info(`⭐ ${repo} - Já possui estrela`);
        } else {
          // Dar estrela
          await this.octokit.rest.activity.starRepoForAuthenticatedUser({
            owner,
            repo: repoName,
          });

          logger.info(`🌟 ${repo} - Estrela adicionada!`);
          successCount++;
        }

        // Aguardar intervalo
        if (repositories.indexOf(repo) < repositories.length - 1) {
          await sleep(this.config.interval * 1000);
        }
      } catch (error) {
        logger.error(`❌ ${repo} - Erro: ${error.message}`);
        errorCount++;
      }
    }

    logger.info(`\n📊 Resumo da operação:`);
    logger.info(`✅ Sucessos: ${successCount}`);
    logger.info(`❌ Erros: ${errorCount}`);
  }

  async unstarRepositories(repositories) {
    logger.info(
      `\n🔄 Removendo estrela de ${repositories.length} repositórios...\n`
    );

    let successCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");

        // Verificar se tem estrela
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (!isStarred) {
          logger.info(`⚪ ${repo} - Não possui estrela`);
        } else {
          // Remover estrela
          await this.octokit.rest.activity.unstarRepoForAuthenticatedUser({
            owner,
            repo: repoName,
          });

          logger.info(`🔄 ${repo} - Estrela removida!`);
          successCount++;
        }

        // Aguardar intervalo
        if (repositories.indexOf(repo) < repositories.length - 1) {
          await sleep(this.config.interval * 1000);
        }
      } catch (error) {
        logger.error(`❌ ${repo} - Erro: ${error.message}`);
        errorCount++;
      }
    }

    logger.info(`\n📊 Resumo da operação:`);
    logger.info(`✅ Sucessos: ${successCount}`);
    logger.info(`❌ Erros: ${errorCount}`);
  }

  async checkStarStatus(repositories) {
    logger.info(
      `\n🔍 Verificando status de ${repositories.length} repositórios...\n`
    );

    let starredCount = 0;
    let notStarredCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (isStarred) {
          logger.info(`⭐ ${repo} - COM estrela`);
          starredCount++;
        } else {
          logger.info(`⚪ ${repo} - SEM estrela`);
          notStarredCount++;
        }

        // Aguardar intervalo
        if (repositories.indexOf(repo) < repositories.length - 1) {
          await sleep(this.config.interval * 1000);
        }
      } catch (error) {
        logger.error(`❌ ${repo} - Erro: ${error.message}`);
        errorCount++;
      }
    }

    logger.info(`\n📊 Status das estrelas:`);
    logger.info(`⭐ Com estrela: ${starredCount}`);
    logger.info(`⚪ Sem estrela: ${notStarredCount}`);
    logger.info(`❌ Erros: ${errorCount}`);
  }

  async isRepositoryStarred(owner, repo) {
    try {
      await this.octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
        owner,
        repo,
      });
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  async getRepositoryInfo(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      return {
        name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        language: data.language,
        url: data.html_url,
      };
    } catch (error) {
      throw new Error(`Repositório não encontrado: ${owner}/${repo}`);
    }
  }
}

module.exports = GitHubBot;
