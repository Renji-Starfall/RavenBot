module.exports = {
  config: {
    name: "spam",
    version: "1.0",
    author: "Renji Starfall",
    countDown: 3,
    role: 2, // Admin uniquement
    shortDescription: {
      vi: "Gửi tin nhắn lặp lại",
      en: "Send repeated message"
    },
    longDescription: {
      vi: "Gửi một tin nhắn nhiều lần",
      en: "Send a message multiple times"
    },
    category: "utility",
    guide: {
      en: "{pn} [nombre] [message]\nEx: {pn} 5 Bonjour"
    }
  },

  onStart: async function ({ api, event, args }) {
    const number = parseInt(args[0]);
    const message = args.slice(1).join(" ");

    if (isNaN(number) || number < 1 || number > 50) {
      return api.sendMessage("❌ Merci d’entrer un nombre entre 1 et 50.", event.threadID);
    }

    if (!message) {
      return api.sendMessage("❌ Tu dois spécifier un message à envoyer.", event.threadID);
    }

    for (let i = 0; i < number; i++) {
      api.sendMessage(message, event.threadID);
      await new Promise(resolve => setTimeout(resolve, 300)); // délai léger pour éviter le flood
    }
  }
};
