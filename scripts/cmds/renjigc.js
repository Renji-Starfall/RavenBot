module.exports = {
  config: {
    name: "renjigc",
    aliases: ["gc"],
    version: "1.0",
    author: "Renji Starfall",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "",
      en: "Add user to bot owner group chat"
    },
    longDescription: {
      vi: "",
      en: "Add any user to the group chat of the bot owner"
    },
    category: "box chat",
    guide: {
      en: "{pn}renjigc"
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = "7921679221198145"; // ID du groupe cible

    try {
      // Récupère les infos du groupe
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs;

      if (participants.includes(event.senderID)) {
        // Déjà dans le groupe
        await api.sendMessage(
          "🃏𝘛'𝘦𝘴 𝘥𝘦𝘫𝘢 𝘥𝘢𝘯𝘴 𝘭𝘦 𝘨𝘳𝘰𝘶𝘱𝘦 𝘴𝘪 𝘵𝘶 𝘵𝘳𝘰𝘶𝘷𝘦𝘴 𝘱𝘢𝘴 𝘷𝘦𝘳𝘪𝘧𝘪𝘦 𝘵𝘦𝘴 𝘪𝘯𝘷𝘪𝘵𝘢𝘵𝘪𝘰𝘯𝘴 𝘱𝘢𝘳 𝘮𝘦𝘴𝘴𝘢𝘨𝘦𝘴🃏",
          event.threadID
        );
        await api.setMessageReaction("⚠", event.messageID, true);
      } else {
        // Ajoute l'utilisateur
        await api.addUserToGroup(event.senderID, threadID);
        await api.sendMessage(
          "📶| 𝐓𝐮 𝐚𝐬 é𝐭é 𝐚𝐣𝐨𝐮𝐭é 𝐚𝐮 𝐠𝐫𝐨𝐮𝐩𝐞 🅁🄴🄽🄹🄸 🄱🄾🅃 🄶🄲 🎯 𝐬𝐢 𝐭𝐮 𝐧𝐞 𝐥𝐞 𝐭𝐫𝐨𝐮𝐯𝐞𝐬 𝐩𝐚𝐬, 𝐯𝐞𝐫𝐢𝐟𝐢𝐞𝐬 𝐥𝐞𝐬 𝐢𝐧𝐯𝐢𝐭𝐚𝐭𝐢𝐨𝐧𝐬 𝐩𝐚𝐫 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 !🎶",
          event.threadID
        );
        await api.setMessageReaction("✅", event.messageID, true);
      }
    } catch (error) {
      await api.sendMessage(
        "🤔 | 𝐔𝐧𝐞 𝐞𝐫𝐫𝐞𝐮𝐫 𝐞𝐬𝐭 𝐬𝐮𝐫𝐯𝐞𝐧𝐮𝐞.. 𝐯𝐞𝐮𝐢𝐥𝐥𝐞𝐳 𝐫𝐞𝐞𝐬𝐬𝐚𝐲𝐞𝐫 𝐩𝐥𝐮𝐬 𝐭𝐚𝐫𝐝 𝐨𝐮 𝐜𝐨𝐧𝐭𝐚𝐜𝐭𝐞𝐫 𝐦𝐨𝐧 𝐜𝐫𝐞𝐚𝐭𝐞𝐮𝐫!🎶",
        event.threadID
      );
      await api.setMessageReaction("❌", event.messageID, true);
    }
  }
};
