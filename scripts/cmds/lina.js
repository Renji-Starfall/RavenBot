
const axios = require("axios");

module.exports = {
  config: {
    name: 'lina',
    aliases: ['loft'],
    version: '1.2',
    author: 'Luxion/fixed by Riley/improved by Renji Starfall',
    countDown: 0,
    role: 0,
    shortDescription: 'AI CHAT',
    longDescription: {
      en: 'Chat with Lina (Simsimi)'
    },
    category: 'Ai chat',
    guide: {
      en: '{pn} <message>: chat with Lina\nExemple: {pn} salut'
    }
  },

  langs: {
    en: {
      turnedOn: "C'est l'heure de déconnecter 🤪🥃",
      turnedOff: "Je suis fatiguée de parler à des crétins, surtout toi 😒",
      chatting: 'Déjà en train de parler avec 𝗟𝗢𝗙𝗧...',
      disabled: "Le chat IA est désactivé ici. Fais {pn} on pour l’activer.",
      error: 'Une erreur est survenue 😐'
    }
  },

  onStart: async function ({ args, threadsData, message, event, getLang }) {
    if (args[0] == 'on' || args[0] == 'off') {
      await threadsData.set(event.threadID, args[0] == "on", "settings.simsimi");
      return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
    }

    if (args.length > 0) {
      const yourMessage = args.join(" ");
      try {const langCode = await threadsData.get(event.threadID, "settings.lang") || global.GoatBot.config.language || "fr";
        const responseMessage = await getMessage(yourMessage, langCode);
        return message.reply(responseMessage);
      } catch (err) {
        console.error(err);
        return message.reply(getLang("error"));
      }
    }
  },

  onChat: async function ({ args, message, threadsData, event, isUserCallCommand, getLang }) {
    const isEnabled = await threadsData.get(event.threadID, "settings.simsimi");
    if (args.length > 1 && !isUserCallCommand && isEnabled) {
      try {
        const langCode = await threadsData.get(event.threadID, "settings.lang") || global.GoatBot.config.language || "fr";
        const responseMessage = await getMessage(args.join(" "), langCode);
        return message.reply(responseMessage);
      } catch (err) {
        console.error(err);
        return message.reply(getLang("error"));
      }
    }
  }
};

async function getMessage(text, langCode = 'fr') {
  const res = await axios.post(
    'https://api.simsimi.vn/v1/simtalk',
    new URLSearchParams({
      text,
      lc: langCode
    })
  );

  if (res.status !== 200 || !res.data.message)
    throw new Error("Erreur API Simsimi");

  return res.data.message;
}
