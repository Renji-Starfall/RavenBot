const axios = require('axios');

// Your free-tier API keys
const GEMINI_KEY = "AIzaSyB734HYzdlFMp823xjHjHswAjVkInm21lg";
const DEEPSEEK_KEY = "sk-c5fa24f73c054adf80df62bf2490d412";

// Gemini v2 Flash endpoint (lightweight)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// System prompt
const SYSTEM_PROMPT = "Tu es Renji AI, une intelligence artificielle créée et développée par Renji Starfall. Tu réponds aux questions, et si quelqu'un te demande qui t’a fait, tu expliques que c’est Renji Starfall.";

// Styling function (same as Voldigo Bot)
function formatResponse(content) {
    const styledContent = content.split('').map(char => {
        const styleMap = {
            'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍',
            'G': '𝘎', 'H': '𝘏', 'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓',
            'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙',
            'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟',
            'Y': '𝘠', 'Z': '𝘡',
            'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧',
            'g': '𝘨', 'h': '𝘩', 'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭',
            'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
            's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹',
            'y': '𝘺', 'z': '𝘻'
        };
        return styleMap[char] || char;
    }).join('');

    return `
        𝗥𝗲𝗻𝗷𝗶 𝗔𝗜 🤖 \n

${styledContent}


👤 Créateur : Renji Starfall`;
}

// Main function to get AI response
async function getAIResponse(input) {
    const userInput = SYSTEM_PROMPT + "\n" + input;

    // Try Gemini
    try {
        const geminiRes = await axios.post(GEMINI_URL, {
            contents: [{ parts: [{ text: userInput }] }]
        }, {
            headers: { "Content-Type": "application/json" }
        });

        return geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err) {
        console.warn("Gemini failed:", err.message);
    }

    // Fallback to DeepSeek
    try {
        const deepseekRes = await axios.post(
            "https://api.deepseek.ai/v1/search",
            {
                model: "deepseek-chat",
                messages: [{ role: "user", content: input }],
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${DEEPSEEK_KEY}`
                }
            }
        );

        return deepseekRes.data?.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.warn("DeepSeek failed:", err.message);
        return null;
    }
}

// Bot export structure
module.exports = {
    config: {
        name: 'ai',
        author: 'Renji Starfall',
        version: '2.0',
        role: 0,
        category: 'AI',
        shortDescription: 'Ask Renji AI anything',
        longDescription: 'Renji AI is an intelligent assistant created by Renji Starfall. It can answer all kinds of questions using Gemini and DeepSeek.',
        usePrefix: false
    },

    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) {
            return api.sendMessage(formatResponse("Présent ! Je suis Renji AI. Pose-moi ta question."), event.threadID);
        }

        const result = await getAIResponse(input);
        api.sendMessage(formatResponse(result || "❌ Renji AI n'a pas pu répondre pour le moment."), event.threadID, event.messageID);
    },

    onChat: async function ({ event, message }) {
        const body = event.body;
        if (!body || !body.toLowerCase().startsWith("ai")) return;

        const input = body.slice(2).trim();
        if (!input) {
            return message.reply(formatResponse("Présent ! Je suis Renji AI, ton assistant intelligent. Comment puis-je t'aider ?"));
        }

        const result = await getAIResponse(input);
        message.reply(formatResponse(result || "❌ Renji AI est momentanément indisponible."));
    }
};
