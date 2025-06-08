const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "1.8",
    author: " Renji Starfall",
    countDown: 5,
    role: 2,
    description: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Send notification from admin to all box"
    },
    category: "owner",
    guide: {
      en: "{pn} <message> (reply with image/video/audio if needed)"
    },
    envConfig: {
      delayPerGroup: 500
    }
  },

  langs: {
    en: {
      missingMessage: "Please enter the message you want to send to all groups",
      notification: "📌 Notification from Admin",
      sendingNotification: "Sending notifications to %1 groups...",
      sentNotification: "✅ Sent to %1 groups successfully.",
      errorSendingNotification: "❌ Failed to send to %1 groups:\n%2",
      fullSummary: "📄 Summary:\n✅ Success (%1):\n%2\n\n❌ Failed (%3):\n%4"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0]) return message.reply(getLang("missingMessage"));

    // Créer le message final
    const content = `${getLang("notification")}\n❂ ════ •⊰❂⊱• ════ ❂\n${args.join(" ")}\n❂ ════ •⊰❂⊱• ════ ❂`;
    const attachments = await getStreamsFromAttachment(
      [
        ...event.attachments,
        ...(event.messageReply?.attachments || [])
      ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
    );
    const formSend = { body: content, attachment: attachments };

    // Liste réelle des groupes avec nom
    const allThreads = (await threadsData.getAll()).filter(t =>
      t.isGroup && t.members.some(m => m.userID == api.getCurrentUserID() && m.inGroup)
    );

    message.reply(getLang("sendingNotification", allThreads.length));

    const successList = [];
    const failedList = [];

    // Envoi avec gestion des erreurs
    for (const thread of allThreads) {
      try {
        await api.sendMessage(formSend, thread.threadID);
        successList.push({ id: thread.threadID, name: thread.threadName || thread.threadID });
      } catch {
        failedList.push({ id: thread.threadID, name: thread.threadName || thread.threadID });
      }
      await new Promise(res => setTimeout(res, delayPerGroup));
    }

    // Deuxième tentative pour les échecs
    const retryFailed = [];
    for (const group of failedList) {
      try {
        await api.sendMessage(formSend, group.id);
        successList.push(group); // Ajouter seulement maintenant si succès
      } catch {
        retryFailed.push(group);
      }
      await new Promise(res => setTimeout(res, delayPerGroup));
    }

    // Résumé
    const successNames = successList.map(g => `• ${g.name}`).join("\n") || "Aucun";
    const failNames = retryFailed.map(g => `• ${g.name}`).join("\n") || "Aucun";

    return message.reply(getLang("fullSummary",
      successList.length,
      successNames,
      retryFailed.length,
      failNames
    ));
  }
};
