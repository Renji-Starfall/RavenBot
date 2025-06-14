const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Configuration avec tokens intégrés (RISQUE DE SÉCURITÉ)
const CONFIG = {
  GITHUB_TOKEN: "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", // Token GitHub
  REPO_OWNER: "Renji-Starfall",
  REPO_NAME: "RavenBot",
  BRANCH: "main",
  ADMIN_ID: "61557674704673", // Votre ID Messenger
  ALLOWED_USERS: ["61557674704673"], // IDs autorisés
  AUTO_SAVE_INTERVAL: 30 * 60 * 1000 // 30 minutes
};

// Récupération des fichiers JSON
function getAllJsonFiles(dirPath, root = dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath);

  list.forEach(file => {
    const filePath = path.join(dirPath, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(getAllJsonFiles(filePath, root));
      } else if (file.endsWith(".json")) {
        results.push({
          fullPath: filePath,
          relativePath: path.relative(root, filePath).replace(/\\/g, "/")
        });
      }
    } catch (e) {
      console.error(`Erreur lecture ${filePath}:`, e.message);
    }
  });

  return results;
}

// Sauvegarde sur GitHub
async function saveToGitHub(filePath, content, commitMessage) {
  const apiUrl = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/contents/${filePath}`;
  
  try {
    let sha;
    try {
      const { data } = await axios.get(apiUrl, {
        headers: { Authorization: `token ${CONFIG.GITHUB_TOKEN}` }
      });
      sha = data.sha;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
    }

    const encodedContent = Buffer.from(content).toString("base64");
    
    await axios.put(apiUrl, {
      message: commitMessage,
      content: encodedContent,
      branch: CONFIG.BRANCH,
      sha
    }, {
      headers: {
        Authorization: `token ${CONFIG.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

module.exports = {
  config: {
    name: "save",
    version: "1.7",
    author: "JulioRaven",
    description: "Sauvegarde GitHub avec notifications privées",
    role: 2
  },

  async handleCommand({ message, event, args, api }) {
    if (!CONFIG.ALLOWED_USERS.includes(event.senderID)) {
      return api.sendMessage("❌ Accès refusé.", event.threadID);
    }

    if (!args[0]) {
      return api.sendMessage(
        "ℹ️ Usage: save [nom_commande] ou save -g",
        event.threadID
      );
    }

    // Sauvegarde globale
    if (args[0] === "-g") {
      const cmdsPath = path.join(__dirname, "..", "cmds");
      await api.sendMessage("⏳ Sauvegarde en cours...", event.threadID);

      try {
        const files = getAllJsonFiles(cmdsPath);
        if (files.length === 0) {
          return api.sendMessage("ℹ️ Aucun fichier trouvé.", event.threadID);
        }

        const results = [];
        for (const { fullPath, relativePath } of files) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            const { success, error } = await saveToGitHub(
              `scripts/cmds/${relativePath}`,
              content,
              `Auto-save: ${relativePath}`
            );
            results.push(success ? `✅ ${relativePath}` : `❌ ${relativePath} - ${error}`);
          } catch (e) {
            results.push(`❌ ${relativePath} - ${e.message}`);
          }
        }

        await api.sendMessage(
          `📦 Résultats :\n\n${results.join("\n")}`,
          CONFIG.ADMIN_ID
        );
        return api.sendMessage("✅ Notification envoyée en privé.", event.threadID);

      } catch (e) {
        await api.sendMessage(
          `❌ Erreur globale: ${e.message}`,
          CONFIG.ADMIN_ID
        );
        return api.sendMessage("❌ Erreur - Voir privé.", event.threadID);
      }
    }

    // Sauvegarde unitaire
    const fileName = args[0].endsWith(".js") ? args[0] : `${args[0]}.js`;
    const filePath = path.join(__dirname, "..", "cmds", fileName);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ Fichier ${fileName} introuvable.`, event.threadID);
    }

    await api.sendMessage(`⏳ Sauvegarde de ${fileName}...`, event.threadID);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const { success, error } = await saveToGitHub(
        `scripts/cmds/${fileName}`,
        content,
        `Ajout de ${fileName}`
      );

      if (success) {
        await api.sendMessage(
          `✅ ${fileName} sauvegardé.`,
          CONFIG.ADMIN_ID
        );
        return api.sendMessage("✅ Succès - Notification envoyée.", event.threadID);
      } else {
        throw new Error(error);
      }
    } catch (e) {
      await api.sendMessage(
        `❌ Erreur sur ${fileName}: ${e.message}`,
        CONFIG.ADMIN_ID
      );
      return api.sendMessage("❌ Échec - Voir privé.", event.threadID);
    }
  },

  onStart(params) {
    return this.handleCommand(params);
  },

  startAutoSave(api) {
    if (this.interval) clearInterval(this.interval);
    
    this.interval = setInterval(async () => {
      try {
        const cmdsPath = path.join(__dirname, "..", "cmds");
        const files = getAllJsonFiles(cmdsPath);
        
        if (files.length === 0) return;

        console.log("⏳ Sauvegarde auto en cours...");
        
        for (const { fullPath, relativePath } of files) {
          try {
            const content = fs.readFileSync(fullPath, "utf8");
            await saveToGitHub(
              `scripts/cmds/${relativePath}`,
              content,
              `Auto-save: ${relativePath}`
            );
          } catch (e) {
            console.error(`Erreur ${relativePath}:`, e.message);
          }
        }

        await api.sendMessage(
          `✅ Sauvegarde auto terminée à ${new Date().toLocaleString()}`,
          CONFIG.ADMIN_ID
        );
        console.log("✅ Sauvegarde auto terminée");

      } catch (e) {
        console.error("Erreur sauvegarde auto:", e);
        api.sendMessage(
          `❌ Erreur sauvegarde auto: ${e.message}`,
          CONFIG.ADMIN_ID
        ).catch(console.error);
      }
    }, CONFIG.AUTO_SAVE_INTERVAL);
  },

  stopAutoSave() {
    if (this.interval) clearInterval(this.interval);
  }
};
