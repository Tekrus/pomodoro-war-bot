//
const Sequelize = require("sequelize");
const Discord = require("discord.js");

module.exports = bot => {
  bot.addCommand("warboard", async ({ channel }) => {
    return channel.send({
      embed: await embeds.StatsEmbed()
    });
  });
};

const embeds = {
  DefaultEmbed() {
    return new Discord.RichEmbed()
      .setColor(0xff0000)
      .setTitle("🍅 The Pomodoro War 🍅");
  },

  async StatsEmbed() {
    let teams = CONFIG().teams;

    let embed = this.DefaultEmbed().setDescription(
      `Statistics for the current Pomodoro Event between ${teams
        .slice(0, -1)
        .map(g => g.name)
        .join(", ")} and ${teams[teams.length - 1].name}:`
    );

    for (let team of teams) {
      let profiles = await MODELS().Profile.findAll({
        attributes: ["id", "tag"]
      });

      let profileIds = profiles
        .filter(x => x.id % CONFIG().teams.length == team.id)
        .map(x => x.id);

      let poms = await MODELS().TrackedPoms.findAll({
        where: {
          profileId: {
            [Sequelize.Op.in]: profileIds
          }
        },
        group: ["profileId", "trackDate"],
        raw: true,
        attributes: [
          "profileId",
          "trackDate",
          "description",
          [Sequelize.fn("COUNT", "*"), "datecount"]
        ]
      });

      let dailyPomLimit = CONFIG().dailyPomLimit;
      let lowerPomLimit = CONFIG().lowerPomLimit;

      // Add every pom from the user, but only count up to daily pom limit.
      var userPoms = [];
      poms.forEach(x => {
        var userIndex = getIndexByProperty(userPoms, "profileID", x.profileId);
        var dateCount =
          x.datecount > dailyPomLimit ? dailyPomLimit : x.datecount;
        if (userIndex > -1) {
          userPoms[userIndex].pomAmount =
            userPoms[userIndex].pomAmount + dateCount;
        } else {
          userPoms.push({
            profileID: x.profileId,
            pomAmount: dateCount
          });
        }
      });

      // Filter users with less than lower pom limit.
      const result = userPoms
        .filter(user => user.pomAmount >= lowerPomLimit)
        .sort((a, b) => (a.pomAmount < b.pomAmount ? 1 : -1));

      let guildPomCount =
        result.length > 0
          ? result.reduce(function(a, b) {
              return a + b.pomAmount;
            }, 0)
          : 0;
      let profileCount = result.length;

      if (profiles[0] != undefined) {
        embed.addField(
          `${team.name} Pomodoros`,
          `**${guildPomCount}** pomodoros by ${profileCount} members.\nAverage of ~${Math.round(
            guildPomCount / profileCount
          )} poms/member.\n\nTop five pommers:\n${result
            .slice(0, 5)
            .map(
              (p, i) =>
                "`" +
                (i + 1) +
                ".`" +
                UTILS().formatTag(
                  profiles[getIndexByProperty(profiles, "id", p.profileID)].tag
                ) +
                " (" +
                p.pomAmount +
                ")"
            )
            .join("\n")}`,
          true
        );
      }
    }

    return embed;
  }
};

function getIndexByProperty(data, key, value) {
  for (var i = 0; i < data.length; i++) {
    if (data[i][key] == value) {
      return i;
    }
  }
  return -1;
}
