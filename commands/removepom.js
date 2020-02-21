//
//      !removegoal <description / goal name>
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
    member,
    command
  }) => {

    let g = CONFIG().guilds.find(g => g.id === guild.id);
    // Admin feature: Remove users latest pom
    if (
      args.length == 1 &&
      message.mentions.members.size === 1 &&
      member.hasPermission(
        Discord.Permissions.FLAGS.ADMINISTRATOR,
        false,
        true,
        true
      ) &&
      g.managerRoleIds.filter(rId => member.roles.has(rId)).length > 0
    ) {
      const username = message.mentions.members.random().user.username;
      const usertag = message.mentions.members.random().user.discriminator;

      const mentionedProfile = await MODELS().Profile.findOne({
        where: { tag: username + "#" + usertag },
        attributes: ["id"]
      });

      if (mentionedProfile == null) {
        return channel.send(`No pom profile by ${username} was found.`);
      }

      const mentionedLatestPom = await MODELS().TrackedPoms.findOne({
        where: { profileId: mentionedProfile.id },
        order: [["createdAt", "DESC"]]
      });

      if (mentionedLatestPom == null) {
        return channel.send(`No poms by ${username} were found.`);
      }

      MODELS().TrackedPoms.destroy({
        where: { id: mentionedLatestPom.id, profileId: mentionedProfile.id }
      });
      return channel.send(`Latest pom by ${username} was removed.`);
    }

    // NORMAL ADD POM
    let pomname = message.content.slice(command.length + 2).trimStart();
    let pomToDelete;

    if (pomname.length < 1) {
      let pomToDelete = await MODELS().TrackedPoms.findOne({
        where: {
          profileId: profile.id
        },
        attributes: ["id"],
        order: [["createdAt", "DESC"]],
      });

      await MODELS().TrackedPoms.destroy({
        where: {
          id: pomToDelete.id,
          profileId: profile.id
        }
      });

      return channel.send(
        `${member}, your latest pom has been removed.`
      );
    }

    // Check if the pom is a pom goal for the user
    let goalpom = await MODELS().PomGoals.findOne({
      where: {
        goalName: pomname,
        profileId: profile.id
      },
      attributes: ["id"]
    });

    if (goalpom == null) {
      pomToDelete = await MODELS().TrackedPoms.findOne({
        where: {
          description: pomname,
          profileId: profile.id
        },
        order: [["createdAt", "DESC"]],
        attributes: ["id"]
      });
    } else {
      pomToDelete = await MODELS().TrackedPoms.findOne({
        where: {
          pomgoalId: goalpom.id,
          profileId: profile.id
        },
        order: [["createdAt", "DESC"]],
        attriutes: ["id"]
      });
    }

    if (pomToDelete == null) {
      return channel.send(
        `${member}, I couldn't find any poms with the name \`${pomname}\`, have you checked for typos?`
      );
    }

    await MODELS().TrackedPoms.destroy({
      where: {
        id: pomToDelete.id,
        profileId: profile.id
      }
    });

    return channel.send(
      `${member}, your pom "${pomname}" was removed successfully!`
    );
  };


  bot.addCommand("removepom", handler);
  bot.addCommand("removepoms", handler);
  bot.addCommand("deletepom", handler);
  bot.addCommand("removenongoal", handler);
};
