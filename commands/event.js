//

const Discord = require("discord.js");

module.exports = bot => {
  const handler = async ({ message, args, channel }) => {
    if (args.length > 0) {
      if (
        args.length <= 2 &&
        (args[0].toLowerCase() === "commands" ||
          args[0].toLowerCase() === "command")
      ) {
        if (args[1] && args[1].toLowerCase() === "dm") {
          message.author.send({
            embed: embeds.CommandsEmbed()
          });
        } else {
          channel.send({
            embed: embeds.CommandsEmbed()
          });
        }
      } else {
        channel.send(
          `Invalid options. Possible options: \`commands\` or \`commands dm\`.`
        );
      }

      return;
    }

    channel.send({
      embed: embeds
        .DefaultEmbed()
        .setDescription(
          `The Pomodoro War Event is a battle between members of the participating servers during the entire month of October. The goal is to get as many Pomodoros done every day as possible.`
        )
    });
  };

  bot.addCommand("event", handler);
  bot.addCommand("pomwar", handler);
  bot.addCommand("events", handler);
};

const embeds = {
  DefaultEmbed() {
    return new Discord.RichEmbed()
      .setColor(0xe74c3c)
      .setTitle("🍅  The Pomodoro War  🍅");
  },

  CommandsEmbed() {
    return this.DefaultEmbed()
      .setDescription("Description of the different event-related commands.")
      .addField(
        "!pomwar [commands] [dm]",
        `Show information about the war or the commands for this bot, add \`dm\` to receive commands in DM.`
      )
      .addField(
        "!setgoal <Pom amount> <Goal name>",
        `Sets a goal for yourself.`
      )
      .addField(
        "!pom [amount] <Goal name>",
        ` Adds a new pom to goal. If no goal is defined, adds to or creates as a non-goal. All poms must have a name.`
      )
      .addField(
        "!pomlog [dm]",
        `Get a message with your current poms and how close you are to your pom goals, add \`dm\` to receive poms in a DM.`
      )
      .addField(
        "!todayspoms [dm]",
        `Get a message with your poms done for today, add \`dm\` to receive poms in a DM.`
        )
      .addField(
        "!pomcal [dm]",
        `Get a message with a count of your tracked poms over the last 7 days where you have been active, add \`dm\` to receive poms in a DM.`
      )
      .addField(
        "!renamegoal <current goal name>, <new goal name>",
        `Rename your goal, the current and new goal name must be seperated by \`,\`.`
      )
      .addField(
        "!updategoal <Pom amount> <Goal name>",
        `Updates the required amount of poms for a given goal.`
      )
      .addField("!removegoal <goal name>", `Moves a goal to non-goals.`)
      .addField(
        "!deletepom <pom name>",
        `Deletes the latest pom you have tracked with the given name.`
      )
      .addField(
        "!score",
        `Show your placement compared to all the other war participants.`
      )
      .addField(
        "!warboard",
        `Show the total pomodoros slain by the participating servers and the most productive pommers from each server.`
      )
      .addField(
        "!full-warboard <server slug> (admin only)",
        `Show the total pomodoros slain by users of a given server.`
      )
      .addField(
        "!removepom <@user> (admin only)",
        `Remove the latest pom from the user.`
      );
  }
};
