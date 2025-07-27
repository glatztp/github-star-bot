#!/usr/bin/env node

/**
 * Script para configuração inicial do bot
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log("🚀 Configuração inicial do GitHub Star Bot\n");

  try {
    // Verificar se .env já existe
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const overwrite = await question(
        "Arquivo .env já existe. Deseja sobrescrever? (s/N): "
      );
      if (
        overwrite.toLowerCase() !== "s" &&
        overwrite.toLowerCase() !== "sim"
      ) {
        console.log("❌ Configuração cancelada.");
        rl.close();
        return;
      }
    }

    // Coletar informações
    console.log("📝 Vamos configurar seu bot...\n");

    const token = await question("🔑 GitHub Token (ghp_...): ");
    if (!token.startsWith("ghp_") && !token.startsWith("gho_")) {
      console.log("⚠️ Aviso: Token parece não ser válido");
    }

    const username = await question("👤 Seu usuário GitHub (opcional): ");

    const repoInput = await question(
      "📂 Repositórios (formato: owner/repo, separados por vírgula): "
    );
    const repositories = repoInput
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (repositories.length === 0) {
      console.log("❌ Pelo menos um repositório é necessário.");
      rl.close();
      return;
    }

    const interval =
      (await question(
        "⏱️ Intervalo entre operações em segundos (padrão: 2): "
      )) || "2";

    const mode =
      (await question(
        "🎯 Modo de operação (star/unstar/check, padrão: star): "
      )) || "star";

    // Criar arquivo .env
    const envContent = `# Configuração do GitHub Star Bot
GITHUB_TOKEN=${token}
GITHUB_USERNAME=${username}
REPOSITORIES=${repositories.join(",")}
STAR_INTERVAL=${interval}
MODE=${mode}
`;

    fs.writeFileSync(envPath, envContent);

    console.log("\n✅ Configuração salva em .env");
    console.log(`📊 ${repositories.length} repositórios configurados`);
    console.log(`⏱️ Intervalo: ${interval}s`);
    console.log(`🎯 Modo: ${mode}`);
    console.log('\n🚀 Execute "npm start" para iniciar o bot!');
  } catch (error) {
    console.error("❌ Erro na configuração:", error.message);
  }

  rl.close();
}

if (require.main === module) {
  setup();
}

module.exports = setup;
