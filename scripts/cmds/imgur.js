const axios = require('axios');

module.exports.config = {
  name: "imgur",
  aliases: ["i"],
  version: "3.0",
  author: "Lawkey Marvellous",
  countDown: 5,
  role: 0,
  category: "utility",
  description: "Upload media to get GoatBin link.",
  usages: "Reply to a media file (image, video, etc.)",
};

module.exports.onStart = async function ({ api, event }) {
  const baseApiUrl = "https://goatbiin.onrender.com/v1";
  const attachments = event.messageReply?.attachments;

  if (attachments && attachments.length > 0) {
    try {
      const mediaLinks = [];

      for (const attachment of attachments) {
        if (attachment.url) {
          const { data } = await axios.post(`${baseApiUrl}/upload`, { url: attachment.url });
          if (data.link) mediaLinks.push(data.link);
        }
      }

      if (mediaLinks.length > 0) {
        return api.sendMessage(`${mediaLinks.join("\n")}`, event.threadID, event.messageID);
      } else {
        return api.sendMessage("Failed to upload media.", event.threadID, event.messageID);
      }
    } catch (err) {
      return api.sendMessage(`Media Upload Error: ${err.message}`, event.threadID, event.messageID);
    }
  }

  return api.sendMessage("Please reply to a media file (image, video, etc.) to upload it to GoatBin.", event.threadID, event.messageID);
};