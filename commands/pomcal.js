//
//      !getpoms command
//

const Discord = require("discord.js");
const Sequelize = require("sequelize");
module.exports = bot => {
  const handler = async ({
    message,
    channel,
    profile,
    args,
    guild,
    member
  }) => {

    const user = await MODELS().Profile.findOne({
      where: {
        guildId: guild.id,
        userid: profile.userId
      },
      attributes: ["id", "avatarURL", "tag"]
    });

    let allPoms = await MODELS().TrackedPoms.findAll({
      where: {
        profileId: user.id
      },
      attributes: ["description", "pomgoalId"]
    });

    if (allPoms.length < 1) {
      return channel.send(
        `${member}, it seems like you haven't tracked any poms yet.`
      );
    }

    const pomCal = await MODELS()
      .TrackedPoms.findAll({
        where: {
          profileId: user.id
        },
        group: ["trackDate"],
        attributes: [
          "trackDate",
          [Sequelize.fn("COUNT", Sequelize.col("trackDate")), "poms"]
        ],
        raw: true
      });

    totalPoms = allPoms.length;
    let embedMessage =
      "**Your poms the last 7 tracked days:**\n" +
      `\n` +
      pomCal.slice(-7)
        .map(
          day =>
            `**${day.trackDate}:** ${day.poms} poms`
        ).join('\n');

    async function sendEmbeds(text, channel) {
      const arr = text.match(/[\s\S]{1,2048}/g);

      for (let chunk of arr) {
        let embed = new Discord.RichEmbed()
          .setColor(0xff0000)
          .setAuthor(user.tag, user.avatarURL)
          .setTitle(
            `\\🍅 Personal Pom Calendar (${
              CONFIG().teams[user.id % CONFIG().teams.length].name
            })\\🍅`
          )
          .setDescription(chunk);

        await channel.send({ embed });
      }
    }

    if (args[0] === "dm") {
      return await sendEmbeds(embedMessage, message.author);
    } else {
      return await sendEmbeds(embedMessage, channel);
    }
  };
  bot.addCommand("pomcal", handler);
};
