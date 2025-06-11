const fs = require("fs");
const path = __dirname + "/emojireact.json";

if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ enabled: true }, null, 2));

module.exports = {
  config: {
    name: "emojireact",
    version: "1.0",
    author: "Renji Starfall",
    role: 0,
    shortDescription: "Réagir automatiquement avec les émojis d'un message",
    longDescription: "Le bot réagit à tout message contenant un émoji avec ce même émoji",
    category: "fun",
    guide: "{pn} on | off"
  },

  onStart: async function ({ message, args }) {
    const data = JSON.parse(fs.readFileSync(path));
    const cmd = args[0];

    if (cmd === "on") {
      data.enabled = true;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply("✅ Réaction automatique aux émojis activée.");
    } else if (cmd === "off") {
      data.enabled = false;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply("❌ Réaction automatique aux émojis désactivée.");
    } else {
      return message.reply("⚙️ Utilise : .emojireact on | off");
    }
  },

  onChat: async function ({ event, api }) {
    const data = JSON.parse(fs.readFileSync(path));
    if (!data.enabled || event.senderID == api.getCurrentUserID()) return;

    const emojiRegex = /[\p{Emoji}]/gu;
    const found = event.body?.match(emojiRegex);
    if (found && found.length > 0) {
      try {
        await api.setMessageReaction(found[0], event.messageID, true);
      } catch (e) {
        console.log("Erreur emoji reaction:", e.message);
      }
    }
  }
};
