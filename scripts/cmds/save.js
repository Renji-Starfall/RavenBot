const fs = require("fs");
const path = require("path");
const axios = require("axios");

const GITHUB_TOKEN = "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";
const REPO_OWNER = "RavenBot";
const REPO_NAME = "Renji-Starfall";
const BRANCH = "main";
const AUTO_SAVE_GROUP_ID = "9821500107945311";

function getAllJsonFiles(dirPath, root = dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);

  list.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsonFiles(filePath, root));
    } else if (file.endsWith(".json")) {
      results.push({
        fullPath: filePath,
        relativePath: path.relative(root, filePath).replace(/\\/g, "/")
      });
    }
  });

  return results;
}

module.exports = {
  config: {
    name: "save",
    version: "1.4",
    author: "JulioRaven",
    description: "Enregistre une commande locale ou toutes les données JSON sur GitHub",
  },

  async handleCommand({ message, event, args }) {
    const permission = ["61557674704673"];
    if (!permission.includes(event.senderID)) {
      return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
    }

    if (!args[0]) {
      return message.reply("Spécifie le nom de la commande à enregistrer (sans extension) ou '-g' pour sauvegarder les données JSON.");
    }

    if (args[0] === "-g") {
      const cmdsPath = path.join(__dirname, "..", "cmds");

      let files;
      try {
        files = getAllJsonFiles(cmdsPath);
      } catch (e) {
        return message.reply("Erreur lors de la lecture des fichiers JSON : " + e.message);
      }

      if (files.length === 0) {
        return message.reply("Aucun fichier JSON trouvé.");
      }

      await message.reply("⏳ Sauvegarde automatique des données JSON en cours...");

      const results = [];

      for (const { fullPath, relativePath } of files) {
        try {
          const fileContent = fs.readFileSync(fullPath, "utf8");
          const GITHUB_PATH = `scripts/cmds/${relativePath}`;
          const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_PATH}`;

          let sha;
          try {
            const { data } = await axios.get(apiUrl, {
              headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            sha = data.sha;
          } catch {
            sha = undefined;
          }

          const encodedContent = Buffer.from(fileContent).toString("base64");

          await axios.put(apiUrl, {
            message: `Mise à jour automatique de ${relativePath}`,
            content: encodedContent,
            branch: BRANCH,
            sha
          }, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json"
            }
          });

          results.push(`✅ ${relativePath}`);
        } catch (err) {
          results.push(`❌ ${relativePath} - ${err.response?.data?.message || err.message}`);
        }
      }

      await message.reply(`🔄|𝗦𝗔𝗨𝗩𝗘𝗚𝗔𝗥𝗗𝗘 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗜𝗤𝗨𝗘 𝗔𝗖𝗛𝗘𝗩É𝗘 ✅\n\n${results.join("\n")}`);

      try {
        message.client.sendMessage(AUTO_SAVE_GROUP_ID, "🔄|𝗦𝗔𝗨𝗩𝗘𝗚𝗔𝗥𝗗𝗘 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗜𝗤𝗨𝗘 𝗔𝗖𝗛𝗘𝗩É𝗘 ✅");
      } catch {}

      return;
    }

    // Sauvegarde d'une commande JS spécifique
    const fileName = args[0].endsWith(".js") ? args[0] : `${args[0]}.js`;
    const filePath = path.join(__dirname, "..", "cmds", fileName);

    if (!fs.existsSync(filePath)) {
      return message.reply("❌ Fichier introuvable dans le dossier cmds.");
    }

    await message.reply("⏳ Enregistrement de la commande en cours...");

    const fileContent = fs.readFileSync(filePath, "utf8");
    const GITHUB_PATH = `scripts/cmds/${fileName}`;
    const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_PATH}`;

    try {
      let sha;
      try {
        const { data } = await axios.get(apiUrl, {
          headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
        sha = data.sha;
      } catch {
        sha = undefined;
      }

      const encodedContent = Buffer.from(fileContent).toString("base64");

      await axios.put(apiUrl, {
        message: `Ajout automatique de ${fileName}`,
        content: encodedContent,
        branch: BRANCH,
        sha
      }, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      return message.reply(`✅ Commande \`${fileName}\` enregistrée sur GitHub dans \`scripts/cmds/\`.`);
    } catch (error) {
      return message.reply(`❌ Erreur GitHub : ${error.response?.data?.message || error.message}`);
    }
  },

  onStart(params) {
    return this.handleCommand(params);
  }
};

// === SAUVEGARDE AUTO TOUTES LES 30 MINUTES ===

function autoSaveJsonFiles(client) {
  const cmdsPath = path.join(__dirname, "..", "cmds");

  setInterval(async () => {
    try {
      const files = getAllJsonFiles(cmdsPath);

      if (files.length === 0) return;

      const results = [];

      for (const { fullPath, relativePath } of files) {
        try {
          const fileContent = fs.readFileSync(fullPath, "utf8");
          const GITHUB_PATH = `scripts/cmds/${relativePath}`;
          const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_PATH}`;

          let sha;
          try {
            const { data } = await axios.get(apiUrl, {
              headers: { Authorization: `token ${GITHUB_TOKEN}` }
            });
            sha = data.sha;
          } catch {
            sha = undefined;
          }

          const encodedContent = Buffer.from(fileContent).toString("base64");

          await axios.put(apiUrl, {
            message: `Mise à jour automatique de ${relativePath}`,
            content: encodedContent,
            branch: BRANCH,
            sha
          }, {
            headers: {
              Authorization: `token ${GITHUB_TOKEN}`,
              "Content-Type": "application/json"
            }
          });

          results.push(`✅ ${relativePath}`);
        } catch (err) {
          results.push(`❌ ${relativePath} - ${err.response?.data?.message || err.message}`);
        }
      }

      console.log("🔄|SAUVEGARDE AUTOMATIQUE TERMINÉE ✅");

      if (client && typeof client.sendMessage === "function") {
        client.sendMessage(AUTO_SAVE_GROUP_ID, "🔄|𝗦𝗔𝗨𝗩𝗘𝗚𝗔𝗥𝗗𝗘 𝗔𝗨𝗧𝗢𝗠𝗔𝗧𝗜𝗤𝗨𝗘 𝗔𝗖𝗛𝗘𝗩E𝗘 ✅");
      }
    } catch (error) {
      console.error("Erreur de sauvegarde automatique :", error);
    }
  }, 30 * 60 * 1000);
}

module.exports.autoSaveJsonFiles = autoSaveJsonFiles;
