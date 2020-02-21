//

const Discord = require("discord.js");
const Sequelize = require("sequelize");
module.exports = async bot => {
  const handler = async ({ guild, channel, member, args }) => {
    const g = CONFIG().guilds.find(g => g.id === guild.id);

    if (
      !member.hasPermission(
        Discord.Permissions.FLAGS.ADMINISTRATOR,
        false,
        true,
        true
      ) &&
      !g.managerRoleIds.some(rId => member.roles.has(rId))
    ) {
      return;
    }

    if (args.length === 0) {
      return channel.send(`Usage: \`!full-warboard <server> [page]\``);
    }

    const targetGuild = CONFIG().guilds.find(
      g => g.slug.toLowerCase() === args[0].toLowerCase()
    );

    if (!targetGuild) {
      return channel.send(`Sorry, I couldn't find the server \`${args[0]}\`.`);
    }

    const profiles = await MODELS().Profile.findAll({
      where: {
        guildId: targetGuild.id
      },
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
    const result = userPoms.sort((a, b) =>
      a.pomAmount < b.pomAmount ? 1 : -1
    );

    const pageNumber = args.length > 1 ? parseInt(args[1]) : 1;
    const pageCount = Math.ceil(profiles.length / 10);

    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
      return channel.send(
        `That page number couldn't be found. It currently needs to be between **1** and **${pageCount}**`
      );
    }

    const startIndex = (pageNumber - 1) * 10;

    return channel.send({
      embed: new Discord.RichEmbed()
        .setColor(0xff0000)
        .setTitle("\\🍅  The Pomodoro War Leaderboard  \\🍅")
        .setDescription(
          `Leaderboard for all pomodoros in ${targetGuild.name}, page ${pageNumber}.\n\n` +
            result
              .slice(startIndex, startIndex + 10)
              .map(
                (p, i) =>
                  "`" +
                  (i + 1) +
                  ".`" +
                  UTILS().formatTag(
                    profiles[getIndexByProperty(profiles, "id", p.profileID)]
                      .tag
                  ) +
                  " (" +
                  p.pomAmount +
                  ")"
              )
              .join("\n")
        )
        .setFooter(`Page ${pageNumber}/${pageCount}`)
    });
  };

  bot.addCommand("full-warboard", handler);
};

function getIndexByProperty(data, key, value) {
  for (var i = 0; i < data.length; i++) {
    if (data[i][key] == value) {
      return i;
    }
  }
  return -1;
}
