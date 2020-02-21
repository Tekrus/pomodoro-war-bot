const Discord = require("discord.js");
const Sequelize = require("sequelize");
module.exports = async bot => {
  const handler = async ({ guild, channel, member, args }) => {
    const profiles = await MODELS().Profile.findAll({
      attributes: ["id", "tag"]
    });

    let profileIds = profiles.map(x => x.id);

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

    // Add every pom from the user, but only count up to daily pom limit.
    var userPoms = [];
    poms.forEach(x => {
      var userIndex = getIndexByProperty(userPoms, "profileID", x.profileId);
      var dateCount = x.datecount > dailyPomLimit ? dailyPomLimit : x.datecount;
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
      .sort((a, b) => (a.pomAmount < b.pomAmount ? 1 : -1))
      .filter(x => x.pomAmount >= CONFIG().lowerPomLimit);

    let userId =
      profiles[
        getIndexByProperty(
          profiles,
          "tag",
          member.user.username + "#" + member.user.discriminator
        )
      ].id;
    let placement = getIndexByProperty(result, "profileID", userId) + 1;
    let participantsCount = result.length;
    let userTag = member.user.username;

    if (placement > 0) {
      return channel.send({
        embed: new Discord.RichEmbed()
          .setColor(0xff0000)
          .setTitle("\\🍅  The Pomodoro War Leaderboard  \\🍅")
          .setDescription(
            `${userTag}, you are currently \`#${placement}\` of ${participantsCount} qualifying participants across all servers.`
          )
      });
    }
    return channel.send({
      embed: new Discord.RichEmbed()
        .setColor(0xff0000)
        .setTitle("\\🍅  The Pomodoro War Leaderboard  \\🍅")
        .setDescription(
          `${userTag}, you are not currently qualified for the leaderboard, you need at least ${
            CONFIG().lowerPomLimit
          } poms.`
        )
    });
  };

  bot.addCommand("placement", handler);
  bot.addCommand("score", handler);
};

function getIndexByProperty(data, key, value) {
  for (var i = 0; i < data.length; i++) {
    if (data[i][key] == value) {
      return i;
    }
  }
  return -1;
}
