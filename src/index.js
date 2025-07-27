require("dotenv").config();
const GitHubBot = require("./bot");
const logger = require("./utils/logger");

async function main() {
  try {
    logger.info("Iniciando GitHub Star Bot...");

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN não configurado no arquivo .env");
    }

    if (!process.env.REPOSITORIES) {
      throw new Error("REPOSITORIES não configurado no arquivo .env");
    }

    const bot = new GitHubBot({
      token: process.env.GITHUB_TOKEN,
      username: process.env.GITHUB_USERNAME,
      repositories: process.env.REPOSITORIES.split(",").map((repo) =>
        repo.trim()
      ),
      interval: parseInt(process.env.STAR_INTERVAL) || 2,
      mode: process.env.MODE || "star",
    });

    await bot.run();
    logger.info("Bot finalizado com sucesso!");
  } catch (error) {
    logger.error("Erro ao executar o bot:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = main;
