#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de permissão do token
 */

require("dotenv").config();
const { Octokit } = require("@octokit/rest");
const logger = require("../src/utils/logger");

async function diagnosticarToken() {
  logger.info("🔍 Diagnosticando permissões do token GitHub...\n");

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    logger.error("❌ Token não configurado");
    return;
  }

  const octokit = new Octokit({ auth: token });

  try {
    // Testar autenticação básica
    const { data: user } = await octokit.rest.users.getAuthenticated();
    logger.success(`✅ Autenticado como: ${user.login}`);

    // Verificar permissões do token
    logger.info("🔍 Testando permissões...");

    // Testar listar repositórios próprios
    try {
      const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser(
        {
          per_page: 1,
        }
      );
      logger.success("✅ Pode listar repositórios próprios");
    } catch (error) {
      logger.error("❌ Não pode listar repositórios próprios:", error.message);
    }

    // Testar verificar estrela em repositório próprio
    const testRepo = "glatztp/gltz";
    try {
      await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
        owner: "glatztp",
        repo: "gltz",
      });
      logger.success(`✅ Pode verificar estrela em ${testRepo}`);
    } catch (error) {
      if (error.status === 404) {
        logger.info(`ℹ️ ${testRepo} não tem estrela (isso é normal)`);
      } else {
        logger.error(
          `❌ Não pode verificar estrela em ${testRepo}:`,
          error.message
        );
        logger.info("💡 Isso indica que o token não tem permissões corretas");
      }
    }

    // Testar dar estrela em repositório próprio
    try {
      // Primeiro verificar se já tem estrela
      let jaTemEstrela = false;
      try {
        await octokit.rest.activity.checkRepoIsStarredByAuthenticatedUser({
          owner: "glatztp",
          repo: "gltz",
        });
        jaTemEstrela = true;
      } catch (e) {
        // 404 significa que não tem estrela
      }

      if (!jaTemEstrela) {
        await octokit.rest.activity.starRepoForAuthenticatedUser({
          owner: "glatztp",
          repo: "gltz",
        });
        logger.success(`✅ Conseguiu dar estrela em ${testRepo}!`);

        // Remover a estrela para deixar como estava
        await octokit.rest.activity.unstarRepoForAuthenticatedUser({
          owner: "glatztp",
          repo: "gltz",
        });
        logger.info(`ℹ️ Estrela removida para deixar como estava`);
      } else {
        logger.info(`ℹ️ ${testRepo} já possui estrela`);
      }
    } catch (error) {
      logger.error(`❌ Não pode dar estrela em ${testRepo}:`, error.message);

      if (
        error.message.includes(
          "Resource not accessible by personal access token"
        )
      ) {
        logger.error("\n🚨 PROBLEMA IDENTIFICADO:");
        logger.error("Seu token não tem as permissões necessárias!");
        logger.info("\n💡 SOLUÇÃO:");
        logger.info("1. Vá para: https://github.com/settings/tokens");
        logger.info('2. Clique em "Generate new token (classic)"');
        logger.info("3. Selecione os escopos:");
        logger.info("   ✓ public_repo (para repositórios públicos)");
        logger.info("   ✓ user (para informações do usuário)");
        logger.info("4. Copie o novo token e atualize o arquivo .env");
        logger.info("\nOu use este comando para gerar um novo token:");
        logger.info("gh auth refresh -s public_repo,user");
      }
    }

    // Verificar escopos do token (se disponível)
    try {
      const response = await octokit.request("GET /user");
      const scopes = response.headers["x-oauth-scopes"];
      if (scopes) {
        logger.info(`\n🔐 Escopos do token: ${scopes}`);

        const requiredScopes = ["public_repo", "repo"];
        const hasRequiredScope = requiredScopes.some((scope) =>
          scopes.includes(scope)
        );

        if (hasRequiredScope) {
          logger.success("✅ Token tem escopos adequados");
        } else {
          logger.warn("⚠️ Token pode não ter escopos adequados");
          logger.info("Escopos necessários: public_repo ou repo");
        }
      }
    } catch (error) {
      logger.debug("Não foi possível verificar escopos do token");
    }
  } catch (error) {
    logger.error("❌ Erro na autenticação:", error.message);
  }
}

if (require.main === module) {
  diagnosticarToken().catch((error) => {
    logger.error("❌ Erro no diagnóstico:", error.message);
    process.exit(1);
  });
}

module.exports = diagnosticarToken;
