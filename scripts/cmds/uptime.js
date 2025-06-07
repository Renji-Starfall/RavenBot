module.exports = {
  config: {
    name: "uptime",
    version: "1.0",
    author: "Renji Starfall",
    role: 0, // tous les utilisateurs peuvent l'utiliser
    shortDescription: { fr: "Affiche le temps de fonctionnement du bot" },
    longDescription: { fr: "Affiche depuis combien de temps le bot est en ligne sans redémarrage." },
    category: "utilitaires",
    guide: { fr: "{pn}" }
  },

  onLoad: function ({ globalData }) {
    // Enregistre l'heure de démarrage du bot
    if (!globalData.botStartTime) {
      globalData.botStartTime = Date.now();
    }
  },

  onStart: async function ({ message, globalData }) {
    const uptimeMs = Date.now() - globalData.botStartTime;
    const seconds = Math.floor((uptimeMs / 1000) % 60);
    const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
    const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));

    let uptimeStr = "";
    if (days > 0) uptimeStr += `${days} jour${days > 1 ? "s" : ""}, `;
    uptimeStr += `${hours} heure${hours > 1 ? "s" : ""}, `;
    uptimeStr += `${minutes} minute${minutes > 1 ? "s" : ""} et `;
    uptimeStr += `${seconds} seconde${seconds > 1 ? "s" : ""}`;

    return message.reply(`🤖 Le bot est en ligne depuis : ${uptimeStr}.`);
  }
};
