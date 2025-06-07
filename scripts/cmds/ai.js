const axios = require('axios');

module.exports = {
  config: {
    name: "ai",
    version: "2.0",
    author: "Renji Starfall",
    role: 0,
    shortDescription: {
      fr: "Pose une question à Renji AI (Gemini ou DeepSeek)"
    },
    longDescription: {
      fr: "Interroge Renji AI, une intelligence artificielle basée sur Gemini et DeepSeek. Utilisation automatique de l'API disponible."
    },
    category: "IA",
    guide: {
      fr: "{pn} [ta question]\nExemple : {pn} Quel est le plus grand océan ?"
    }
  },

  onStart: async function ({ message, args }) {
    const GEMINI_API_KEY = "AIzaSyB734HYzdlFMp823xjHjHswAjVkInm21lg";
    const DEEPSEEK_API_KEY = "sk-c5fa24f73c054adf80df62bf2490d412";

    if (!args[0]) return message.reply("😁Salut ! Comment puis-je t'aider aujourd'hui ?.\nPose moi une question\n Exemple : `.ai Comment fonctionne une étoile ?`");

    const prompt = args.join(" ");
    message.reply("⏳ Renji AI réfléchit...");

    // Fonction Gemini
    async function askGemini(prompt) {
      try {
        const res = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: prompt }],
                role: "user"
              }
            ]
          },
          { headers: { "Content-Type": "application/json" } }
        );

        const reply = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) throw new Error("Réponse vide de Gemini");
        return `🤖 Renji AI \n\n${reply.trim()}\n`;
      } catch (err) {
        console.error("❌ Erreur Gemini:", err.message);
        throw err;
      }
    }

    // Fonction DeepSeek
    async function askDeepSeek(prompt) {
      try {
        const res = await axios.post(
          "https://api.deepseek.com/v1/chat/completions",
          {
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`
            }
          }
        );

        const reply = res.data.choices?.[0]?.message?.content;
        if (!reply) throw new Error("Réponse vide ");
        return `🤖  Renji AI \n\n${reply.trim()}\n.`;
      } catch (err) {
        console.error("❌ Erreur DeepSeek:", err.message);
        throw err;
      }
    }

    // Lancement avec fallback automatique
    try {
      const responseGemini = await askGemini(prompt);
      return message.reply(responseGemini.slice(0, 2000));
    } catch {
      try {
        const responseDeepSeek = await askDeepSeek(prompt);
        return message.reply(responseDeepSeek.slice(0, 2000));
      } catch {
        return message.reply("❌ Renji AI n'a pas pu répondre. Aucune IA n'est disponible pour le moment.");
      }
    }
  }
};
