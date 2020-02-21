//
//      !getpom command
//

const Discord = require("discord.js");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = bot => {
  const handler = async ({
    message,
    channel,
    profile,
    args,
    guild,
    member
  }) => {
    let today = new Date().toISOString().slice(0, 10);
    let pomGoals = [];
    let nongoalPoms = [];
    let totalPoms;

    const user = await MODELS().Profile.findOne({
      where: {
        guildId: guild.id,
        userid: profile.userId
      },
      attributes: ["id", "avatarURL", "tag"]
    });

    const allPoms = await MODELS().TrackedPoms.findAll({
      where: {
        profileId: user.id,
        trackDate: today
      },
      attributes: ["description", "pomgoalId"]
    });

    const pomgoals = await MODELS().PomGoals.findAll({
      where: {
        profileId: user.id
      },
      attributes: ["id", "goalName", "pomAmount"]
    });

    let nongoalGroups = await MODELS().TrackedPoms.findAll({
      where: {
        profileId: user.id,
        trackDate: today,
        [Op.not]: [{ description: null }]
      },
      attributes: ["description"],
      group: ["description"]
    });

    if (allPoms.length < 1 && pomgoals.length < 1) {
      return channel.send(
        `${member}, it seems like you haven't tracked any poms or goals yet.`
      );
    }

    allPoms.map(x => {
      if (x.pomgoalId != null) {
        pomGoals.push(x);
      } else {
        nongoalPoms.push(x);
      }
    });

    totalPoms = allPoms.length;
    let embedMessage =
      `**Your total amount of Poms today:**  ` +
      totalPoms +
      " pom(s)" +
      `\n\n` +
      "**Today's poms**" +
      `\n\n` +
      "**Goals:**" +
      `\n` +
      pomgoals
        .map(
          g =>
            `${g.goalName}: ${pomGoals.filter(x => x.pomgoalId == g.id).length}`
        )
        .join(`\n`) +
      `\n\n` +
      "**Non-Goals:**" +
      `\n` +
      nongoalGroups
        .map(
          ng =>
            `${ng.description}: ` +
            `${
              nongoalPoms
                .filter(x => !!x)
                .filter(
                  x =>
                    ng.description.toLowerCase() == x.description.toLowerCase()
                ).length
            }`
        )
        .join(`\n`);

    async function sendEmbeds(text, channel) {
      const arr = text.match(/[\s\S]{1,2048}/g);

      for (let chunk of arr) {
        let embed = new Discord.RichEmbed()
          .setColor(0xff0000)
          .setAuthor(user.tag, user.avatarURL)
          .setTitle(
            `\\🍅 Personal Pom Leaderboard (${
              CONFIG().teams[user.id % CONFIG().teams.length].name
            })\\🍅`
          )
          .setDescription(chunk);

        await channel.send({ embed });
      }
    }

    if (args[0] === "dm") {
      await sendEmbeds(embedMessage, message.author);
    } else {
      await sendEmbeds(embedMessage, channel);
    }
  };

  bot.addCommand("todayspoms", handler);
  bot.addCommand("todayspom", handler);
  bot.addCommand("getpom", handler);
};
