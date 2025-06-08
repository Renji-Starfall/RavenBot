const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "[ ☯︎ | 🎯 🅁🄴🄽🄹🄸 ✰🄱🄾🅃 🎯 | ☯︎]"; // Ne modifie pas ceci, c’est un leurre

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "🅁🄴🄽🄹🄸 🅂🅃🄰🅁🄵🄰🄻🄻",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "cmd-list",
    guide: {
      en: "{pn} / help cmdName",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "\n\n  ╞════♲︎︎︎𝗖𝗠𝗗𝗦_𝗟𝗜𝗦𝗧♲︎︎︎════╡";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += `\n╭━━༺${category.toUpperCase()}༻━━\n━━𒁍`;
          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `🔖${item}`);
            msg += `\n│${cmds.join("   ")}`;
          }
          msg += `\n╰───────────☯︎`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n🅁🄴🄽🄹🄸☆🄱🄾🅃 𝘩𝘢𝘴 ${totalCommands} 𝘤𝘰𝘮𝘮𝘢𝘯𝘥𝘴 ✔️\n`;
      msg += `${prefix}help <cmdName> to look up command info\n`;
      msg += `Any issue? Use ${prefix}callad\n`;
      msg += `Admin : 🎯☆🅁🄴🄽🄹🄸☆🅂🅃🄰🅁🄵🄰🄻🄻☆\n\n`;
      msg += `☯︎ 𝐌𝐄𝐑𝐂𝐈☆𝐁𝐄𝐀𝐔𝐂𝐎𝐔𝐏 ☯︎\n`;
      msg += `M𝐚𝐝𝐞 𝐛𝐲 [🎯| 🅁🄴🄽🄹🄸☆🅂🅃🄰🅁🄵🄰🄻🄻]\n`;
      msg += `𝐅𝐛: ✰https://www.facebook.com/profile.php?id=61557674704673`;

      return await message.reply({ body: msg });
    } else {
      const commandName = args[0].toLowerCase();
      const command =
        commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return await message.reply(`Command "${commandName}" not found.`);
      }

      const configCommand = command.config;
      const author = configCommand.author || "Unknown";
      const category = configCommand.category || "Uncategorized";
      const longDescription =
        configCommand.longDescription?.en || "No description available.";
      const guideBody = configCommand.guide?.en || "No guide available.";
      const usage = guideBody
        .replace(/{p}/g, prefix)
        .replace(/{n}/g, configCommand.name);

      const roleText = (() => {
        switch (configCommand.role) {
          case 0:
            return "User";
          case 1:
            return "Group Admin";
          case 2:
            return "Bot Admin";
          case 3:
            return "Bot Owner";
          default:
            return "Unknown";
        }
      })();

      const response = `☾︎━☆🅁🄴🄽🄹🄸♧︎︎︎🄱🄾🅃☆━☽︎\n🅒🅜🅓☆🅘🅝🅕🅞

❐ Name ➢ ${configCommand.name}
❐ Other Names ➢ ${configCommand.aliases ? configCommand.aliases.join(", ") : "None"}
❐ Category ➢ ${category}
❑ Cmd Maker ➢ ${author}
❒ Role ➢ ${roleText}
❒ Cooldown ➢ ${configCommand.countDown || 1}s
❒ Description ➢ ${longDescription}
❒ Usage ➢ ${usage}
`;

      return await message.reply(response);
    }
  },
};
