const { Octokit } = require("@octokit/rest");
const logger = require("./utils/clean-logger");
const { sleep, isValidRepository } = require("./utils/clean-helpers");

class GitHubBot {
  constructor(config) {
    this.config = {
      token: config.token,
      username: config.username,
      repositories: config.repositories || [],
      interval: config.interval || 2,
      mode: config.mode || "star",
    };

    this.octokit = new Octokit({
      auth: this.config.token,
    });
  }

  async run() {
    logger.info(`Iniciando operação: ${this.config.mode.toUpperCase()}`);

    await this.validateAuth();
    const validRepos = this.validateRepositories();

    if (validRepos.length === 0) {
      throw new Error("Nenhum repositório válido encontrado");
    }

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
      logger.info(`Autenticado como: ${user.login}`);

      if (this.config.username && user.login !== this.config.username) {
        logger.warn(
          `Usuário configurado (${this.config.username}) diferente do autenticado (${user.login})`
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
        logger.warn(`Repositório inválido ignorado: ${repo}`);
      }
    }

    logger.info(`${validRepos.length} repositórios válidos encontrados`);
    return validRepos;
  }

  async starRepositories(repositories) {
    logger.info(`Dando estrela em ${repositories.length} repositórios...`);

    let successCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (isStarred) {
          logger.info(`${repo} - Já possui estrela`);
        } else {
          await this.octokit.rest.activity.starRepoForAuthenticatedUser({
            owner,
            repo: repoName,
          });

          logger.info(`${repo} - Estrela adicionada`);
          successCount++;
        }

        if (repositories.indexOf(repo) < repositories.length - 1) {
          await sleep(this.config.interval * 1000);
        }
      } catch (error) {
        logger.error(`${repo} - Erro: ${error.message}`);
        errorCount++;
      }
    }

    logger.info(`Resumo - Sucessos: ${successCount}, Erros: ${errorCount}`);
  }

  async unstarRepositories(repositories) {
    logger.info(`Removendo estrela de ${repositories.length} repositórios...`);

    let successCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (!isStarred) {
          logger.info(`${repo} - Não possui estrela`);
        } else {
          await this.octokit.rest.activity.unstarRepoForAuthenticatedUser({
            owner,
            repo: repoName,
          });

          logger.info(`${repo} - Estrela removida`);
          successCount++;
        }

        if (repositories.indexOf(repo) < repositories.length - 1) {
          await sleep(this.config.interval * 1000);
        }
      } catch (error) {
        logger.error(`${repo} - Erro: ${error.message}`);
        errorCount++;
      }
    }

    logger.info(`Resumo - Sucessos: ${successCount}, Erros: ${errorCount}`);
  }

  async checkStarStatus(repositories) {
    logger.info(`Verificando status de ${repositories.length} repositórios...`);

    let starredCount = 0;
    let notStarredCount = 0;
    let errorCount = 0;

    for (const repo of repositories) {
      try {
        const [owner, repoName] = repo.split("/");
        const isStarred = await this.isRepositoryStarred(owner, repoName);

        if (isStarred) {
          logger.info(`${repo} - COM estrela`);
          starredCount++;
        } else {
          logger.info(`${repo} - SEM estrela`);
          notStarredCount++;
        }

        if (repositories.indexOf(repo) < repositories.length - 1) {
          await sleep(this.config.interval * 1000);
        }
      } catch (error) {
        logger.error(`${repo} - Erro: ${error.message}`);
        errorCount++;
      }
    }

    logger.info(
      `Status - Com estrela: ${starredCount}, Sem estrela: ${notStarredCount}, Erros: ${errorCount}`
    );
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
}

module.exports = GitHubBot;
