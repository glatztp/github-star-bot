const GitHubBot = require("../src/bot");
const logger = require("../src/utils/logger");

// Exemplo de uso programático do bot
async function exemploBasico() {
  try {
    logger.info("📚 Exemplo: Uso básico do bot");

    const bot = new GitHubBot({
      token: "seu_token_aqui",
      username: "seu_usuario",
      repositories: ["microsoft/vscode", "facebook/react", "nodejs/node"],
      interval: 2,
      mode: "check", // Apenas verificar, não dar estrela
    });

    await bot.run();
  } catch (error) {
    logger.error("Erro no exemplo:", error.message);
  }
}

// Exemplo com configuração avançada
async function exemploAvancado() {
  try {
    logger.info("🚀 Exemplo: Configuração avançada");

    const repositorios = [
      "vercel/next.js",
      "vuejs/vue",
      "angular/angular",
      "sveltejs/svelte",
      "nuxt/nuxt.js",
    ];

    const bot = new GitHubBot({
      token: process.env.GITHUB_TOKEN,
      repositories: repositorios,
      interval: 3, // 3 segundos entre operações
      mode: "star",
    });

    await bot.run();
  } catch (error) {
    logger.error("Erro no exemplo avançado:", error.message);
  }
}

// Exemplo de verificação em massa
async function exemploVerificacao() {
  try {
    logger.info("🔍 Exemplo: Verificação em massa");

    const repositoriosPopulares = [
      "microsoft/TypeScript",
      "facebook/create-react-app",
      "webpack/webpack",
      "babel/babel",
      "eslint/eslint",
      "prettier/prettier",
      "jest/jest",
      "storybook/storybook",
    ];

    const bot = new GitHubBot({
      token: process.env.GITHUB_TOKEN,
      repositories: repositoriosPopulares,
      interval: 1,
      mode: "check",
    });

    await bot.run();
  } catch (error) {
    logger.error("Erro na verificação:", error.message);
  }
}

// Executar exemplos
if (require.main === module) {
  const exemplo = process.argv[2] || "basico";

  switch (exemplo) {
    case "basico":
      exemploBasico();
      break;
    case "avancado":
      exemploAvancado();
      break;
    case "verificacao":
      exemploVerificacao();
      break;
    default:
      logger.error(
        "Exemplo não encontrado. Use: basico, avancado, ou verificacao"
      );
  }
}

module.exports = {
  exemploBasico,
  exemploAvancado,
  exemploVerificacao,
};
