module.exports = {
  config: {
    name: "list",
    version: "1.0",
    author: "Renji",
    role: 2, 
    shortDescription: {
      fr: "Affiche la liste des groupes du bot"
    },
    longDescription: {
      fr: "Affiche tous les groupes dans lesquels le bot est actuellement avec leur ID et le nombre de membres"
    },
    category: "admin",
    guide: {
      fr: "{pn} [page]"
    }
  },

  onStart: async function ({ api, message, args }) {
    try {
      const threads = await api.getThreadList(1000, null, ["INBOX"]);
      const groupThreads = threads.filter(thread => thread.isGroup);

      const page = parseInt(args[0]) || 1;
      const maxPerPage = 30;
      const start = (page - 1) * maxPerPage;
      const end = start + maxPerPage;
      const totalPages = Math.ceil(groupThreads.length / maxPerPage);

      if (page < 1 || page > totalPages)
        return message.reply(`❌ La page ${page} n'existe pas. Il y a ${totalPages} pages.`);

      const pageThreads = groupThreads.slice(start, end);

      let msg = `📋 Liste des groupes où le bot est présent (Page ${page}/${totalPages}) :\n`;
      msg += "━━━━━━━━━━━━━━━━━\n";

      for (const thread of pageThreads) {
        msg += `• 🧵 ${thread.name}\n`;
        msg += `   🆔 ID : ${thread.threadID}\n`;
        msg += `   👥 Membres : ${thread.participantIDs.length}\n`;
        msg += `   👑 Admins : ${thread.adminIDs?.length || 0}\n`;
        msg += "─────────────────\n";
      }

      msg += `\nTotal : ${groupThreads.length} groupes.`;

      return message.reply(msg);
    } catch (err) {
      console.error(err);
      return message.reply("❌ Une erreur est survenue en récupérant les groupes.");
    }
  }
};
