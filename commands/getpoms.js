//
//      !getpoms command
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
    let totalPoms;

    let goalPoms = [];
    let nongoalPoms = [];
    let mostProductiv;
    let mostProdArr = [];
    let average = 0;
    let count = 0;

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

    const pomgoals = await MODELS().PomGoals.findAll({
      where: {
        profileId: user.id
      },
      attributes: ["id", "goalName", "pomAmount"]
    });

    if (allPoms.length < 1 && pomgoals.length < 1) {
      return channel.send(
        `${member}, it seems like you haven't tracked any poms or goals yet.`
      );
    }

    MODELS()
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
      })
      .then(res => {
        res.map(x => {
          mostProdArr.push(x);
          average += x.poms;
        });
        mostProdArr.sort((a, b) => a.poms - b.poms);
        mostProductiv = mostProdArr[mostProdArr.length - 1];
        count = res.length;
      });

    let nongoalGroups = await MODELS().TrackedPoms.findAll({
      where: {
        profileId: user.id,
        [Op.not]: [{ description: null }]
      },
      attributes: ["description"],
      group: ["description"]
    });

    allPoms.map(x => {
      if (x.pomgoalId != null) {
        goalPoms.push(x);
      } else {
        nongoalPoms.push(x);
      }
    });

    totalPoms = allPoms.length;
    let embedMessage =
      "**Most productive day:** " +
      (mostProductiv == null ? "none" : mostProductiv.trackDate) +
      " **with** " +
      (mostProductiv == null ? "0" : mostProductiv.poms) +
      " pom(s)" +
      `\n\n` +
      "**Your average poms per day:** ~" +
      Math.floor(average / count) +
      " pom(s)" +
      `\n\n` +
      "**Your total amount of Poms:** " +
      totalPoms +
      " pom(s)" +
      `\n\n` +
      "**Goals:**" +
      `\n` +
      pomgoals
        .map(
          g =>
            `${g.goalName}: ${
              goalPoms.filter(x => x.pomgoalId == g.id).length
            } of ${g.pomAmount}`
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
      return await sendEmbeds(embedMessage, message.author);
    } else {
      return await sendEmbeds(embedMessage, channel);
    }
  };
  bot.addCommand("getpoms", handler);
  bot.addCommand("mypoms", handler);
  bot.addCommand("pomlog", handler);
  bot.addCommand("seepoms", handler);
};
