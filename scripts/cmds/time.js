module.exports = {
  config: {
    name: "time",
    version: "1.0",
    author: "Renji Starfall",
    role: 0,
    shortDescription: {
      fr: "Affiche l'heure actuelle"
    },
    longDescription: {
      fr: "Affiche l'heure, la date et le jour actuel"
    },
    category: "utils",
    guide: {
      fr: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const now = new Date();

    const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

    const jourSemaine = jours[now.getDay()];
    const jour = now.getDate();
    const moisNom = mois[now.getMonth()];
    const annee = now.getFullYear();

    const heures = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const secondes = now.getSeconds().toString().padStart(2, '0');

    const messageFinal = `🕒 Il est actuellement ${heures}h${minutes}min${secondes}s\n📅 Nous sommes le ${jourSemaine} ${jour} ${moisNom} ${annee}`;

    message.reply(messageFinal);
  }
};
