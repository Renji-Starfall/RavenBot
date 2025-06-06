const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = null;

module.exports = {
  config: {
    name: "help",
    version: "1.0",
    author: "NTKhang | Rehat86 | MarianCross",
    countDown: 5,
    role: 0,
    category: "info",
    guide: {
      en: "{pn} [empty or <command name>]"
    },
    priority: 1
  },

  langs: {
    en: {
      help: `━ (remplace par le nom de ton Bot )𝗕𝗢𝗧 ━
Flux (( img generation ))

✨𝗚𝗥𝗢𝗨𝗣 
antichangeinfobox, filteruser, kick, adduser, uid, adminonly, warn, tid, busy, count, unsend, setrole, setname, prefix, setalias

✨𝗙𝗨𝗡 
aov, balance, Avatar, guessnumber

✨𝗧𝗢𝗢𝗟𝗦
prompt, pinterest, uptime, translate, rmbg, 4k, callad

✨𝗠𝗘𝗗𝗜𝗔 
ytb, spotify, twixtor, video, dl

✨𝗥𝗔𝗡𝗞 
rank, rankup

✨𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗕𝗢𝗫 
❈ 𝙍𝙚𝙟𝙤𝙞𝙜𝙣𝙚𝙯 𝙡𝙖 𝙗𝙤𝙞𝙩𝙚 𝙙'𝙖𝙨𝙨𝙞𝙨𝙩𝙖𝙣𝙘𝙚 #𝙘𝙖𝙡𝙡𝙖𝙙 𝙥𝙤𝙪𝙧 𝙘𝙤𝙣𝙩𝙖𝙘𝙩𝙚𝙧 𝙡𝙚𝙨 𝙖𝙙𝙢𝙞𝙣𝙞𝙨𝙩𝙧𝙖𝙩𝙚𝙪𝙧𝙨.⇒ Total: 25 commands
⇒ Utilise {pn} <cmd> pour obtenir plus d'informations sur une commande`,
      commandNotFound: "La commande \"%1\" n'existe pas.",
      getInfoCommand: "» Description : %2\n» Autres noms : %3\n» Autres noms dans votre groupe : %4\n» Version : %5\n» Rôle : %6\n» Temps par commande : %7s\n» Auteur : %8\n━━━  ❖  ━━━\n» Guide d'utilisation :\n%9\n━━━  ❖  ━━━\n» Remarques :\n• Le contenu à l'intérieur de <XXXXX> peut être modifié\n• Le contenu à l'intérieur de [a|b|c] est a ou b ou c",
onlyInfo: "━━━  ❖  ━━━\n│ Nom de la commande : %1\n│ Description : %2\n│ Autres noms : %3\n│ Autres noms dans votre groupe : %4\n│ Version : %5\n│ Rôle : %6\n│ Temps par commande : %7s\n│ Auteur : %8\n❖─────────────❖",
onlyUsage: "❖── UTILISATION ────❖\n│%1\n❖─────────────❖",
onlyAlias: "❖── ALIAS ────❖\n│ Autres noms : %1\n│ Autres noms dans votre groupe : %2\n❖─────────────❖",
onlyRole: "❖── RÔLE ────❖\n│%1\n❖─────────────❖",
doNotHave: "N'existe pas",
roleText0: "0 (Tous les utilisateurs)",
roleText1: "1 (Administrateurs de groupe)",
roleText2: "2 (Admin bot)",
roleText0setRole: "0 (définir le rôle, tous les utilisateurs)",
roleText1setRole: "1 (définir le rôle, administrateurs de groupe)",
pageNotFound: "La page %1 n'existe pas"
}
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role, api, usersData}) {


    const langCode = await threadsData.get(event.threadID, "data.lang") || global.GoatBot.config.language;
    let customLang = {};
    const pathCustomLang = path.join(__dirname, "..", "..", "languages", "cmds", `${langCode}.js`);
    if (fs.existsSync(pathCustomLang))
      customLang = require(pathCustomLang);
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);
    let sortHelp = threadData.settings.sortHelp || "name";
    if (!["category", "name"].includes(sortHelp))
      sortHelp = "name";
    const commandName = (args[0] || "").toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));
    // ———————————————— LISTE DES COMMANDES ——————————————— //
    if (!command && !args[0] || !isNaN(args[0])) {
      const arrayInfo = [];
      let msg = "";
      if (sortHelp == "name") {
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 30;
        for (const [name, value] of commands) {
          if (value.config.role > 1 && role < value.config.role)
            continue;
          let describe = name;
          let shortDescription;
          const shortDescriptionCustomLang = customLang[name]?.shortDescription;
          if (shortDescriptionCustomLang != undefined)
            shortDescription = checkLangObject(shortDescriptionCustomLang, langCode);
          else if (value.config.shortDescription)
            shortDescription = checkLangObject(value.config.shortDescription, langCode);
          if (shortDescription)
            describe += `: ${cropContent(shortDescription.charAt(0).toUpperCase() + shortDescription.slice(1))}`;
          arrayInfo.push({
            data: describe,
            priority: value.priority || 0
          });
        }
        arrayInfo.sort((a, b) => a.data - b.data);
        arrayInfo.sort((a, b) => a.priority > b.priority ? -1 : 1);
        const { allPage, totalPage } = global.utils.splitPage(arrayInfo, numberOfOnePage);
        if (page < 1 || page > totalPage)
          return message.reply(getLang("pageNotFound", page));
        const returnArray = allPage[page - 1] || [];
        const startNumber = (page - 1) * numberOfOnePage + 1;
        msg += (returnArray || []).reduce((text, item, index) => text += `│ ${index + startNumber}${index + startNumber < 10 ? " " : ""}. ${item.data}\n`, '').slice(0, -1);
        await message.reply(getLang("help", msg, page, totalPage, commands.size, prefix, doNotDelete));
      };
    }
    // ———————————— LA COMMANDE N'EXISTE PAS ———————————— //
    else if (!command && args[0]) {
      return message.reply(getLang("commandNotFound", args[0]));
    }
    // ————————————————— INFO COMMANDE ————————————————— //
    else {
      const formSendMessage = {};
      const configCommand = command.config;

      let guide = configCommand.guide?.[langCode] || configCommand.guide?.["en"];
      if (guide == undefined)
        guide = customLang[configCommand.name]?.guide?.[langCode] || customLang[configCommand.name]?.guide?.["en"];

      guide = guide || {
        body: ""
      };
      if (typeof guide == "string")
        guide = { body: guide };
      const guideBody = guide.body
        .replace(/\{prefix\}|\{p\}/g, prefix)
        .replace(/\{name\}|\{n\}/g, configCommand.name)
        .replace(/\{pn\}/g, prefix + configCommand.name);

      const aliasesString = configCommand.aliases ? configCommand.aliases.join(", ") : getLang("doNotHave");
      const aliasesThisGroup = threadData.data.aliases ? (threadData.data.aliases[configCommand.name] || []).join(", ") : getLang("doNotHave");

      let roleOfCommand = configCommand.role;
      let roleIsSet = false;
      if (threadData.data.setRole?.[configCommand.name]) {
        roleOfCommand = threadData.data.setRole[configCommand.name];
        roleIsSet = true;
      }

      const roleText = roleOfCommand == 0 ?
        (roleIsSet ? getLang("roleText0setRole") : getLang("roleText0")) :
        roleOfCommand == 1 ?
          (roleIsSet ? getLang("roleText1setRole") : getLang("roleText1")) :
          getLang("roleText2");

      const author = configCommand.author;
      const descriptionCustomLang = customLang[configCommand.name]?.longDescription;
      let description = checkLangObject(configCommand.longDescription, langCode);
      if (description == undefined)
        if (descriptionCustomLang != undefined)
          description = checkLangObject(descriptionCustomLang, langCode);
        else
          description = getLang("doNotHave");

      let sendWithAttachment = false;

      if (args[1]?.match(/^-g|guide|-u|usage$/)) {
        formSendMessage.body = getLang("onlyUsage", guideBody.split("\n").join("\n"));
        sendWithAttachment = true;
      }
      else if (args[1]?.match(/^-a|alias|aliase|aliases$/))
        formSendMessage.body = getLang("onlyAlias", aliasesString, aliasesThisGroup);
      else if (args[1]?.match(/^-r|role$/))
        formSendMessage.body = getLang("onlyRole", roleText);
      else if (args[1]?.match(/^-i|info$/))
        formSendMessage.body = getLang("onlyInfo", configCommand.name, description, aliasesString, aliasesThisGroup, configCommand.version, roleText, configCommand.countDown || 1, author || "");
      else {
        formSendMessage.body = getLang("getInfoCommand", configCommand.name, description, aliasesString, aliasesThisGroup, configCommand.version, roleText, configCommand.countDown || 1, author || "", `${guideBody.split("\n").join("\n")}`);
        sendWithAttachment = true;
      }

      if (sendWithAttachment && guide.attachment) {
        if (typeof guide.attachment == "object") {
          formSendMessage.attachment = [];
          for (const pathFile in guide.attachment) {
            if (!fs.existsSync(pathFile)) {
              const cutFullPath = pathFile.split("/").filter(item => item != "");
              cutFullPath.pop();
              for (let i = 0; i < cutFullPath.length; i++) {
                const path = cutFullPath.slice(0, i + 1).join('/');
                if (!fs.existsSync(path))
                  fs.mkdirSync(path);
              }
              const getFile = await axios.get(guide.attachment[pathFile], { responseType: 'arraybuffer' });
              fs.writeFileSync(pathFile, Buffer.from(getFile.data));
            }
            formSendMessage.attachment.push(fs.createReadStream(pathFile));
          }
        }
      }
      return message.reply(formSendMessage);
    }
  }
};

function checkLangObject(data, langCode) {
  if (typeof data == "string")
    return data;
  if (typeof data == "object" && !Array.isArray(data))
    return data[langCode] || data.en || undefined;
  return undefined;
}

function cropContent(content, max) {
  if (content.length > max) {
    content = content.slice(0, max - 3);
    content = content + "...";
  }
  return content;
      }
