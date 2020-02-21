//
//      !updategoal command
//

const Discord = require("discord.js");

module.exports = bot => {
  const handler = async ({ channel, profile, args, guild, member }) => {
    let goalarr;
    let goalname;
    if (args[1] === "poms" || args[1] === "pom") {
      goalarr = args.slice(2, args.length);
    } else {
      goalarr = args.slice(1, args.length);
    }
    let pomamount = args[0];
    goalname = goalarr.join(" ").replace(/(\r\n|\n|\r)/gm," ");

    if (isNaN(pomamount)) {
      return channel.send(
        `${member}, I didn't understand that syntax, please use \`!updategoal <amount> <description>\`!`
      );
    }

    if(pomamount < 1 || pomamount > 2500 || !Number.isInteger(Number(pomamount))){
      return channel.send(`${member}, pom amount must be a positive integer between 1 and 2500.`)
    }

    if (
      goalname === "" ||
      goalname === undefined ||
      pomamount === undefined ||
      args.length === 0
    ) {
      return channel.send(
        `${member}, please define a both a goal name and the pom amount, so I can update that goal for you.`
      );
    } else {
      let profileId = await MODELS().Profile.findOne({
        where: {
          guildId: guild.id,
          userid: profile.userId
        },
        attributes: ["id"]
      });

      let existingGoal = await MODELS().PomGoals.findOne({
        where: {
          profileId: profileId.id,
          goalName: goalname
        }
      });
      if (existingGoal == null) {
        return channel.send(
          `${member}, I can't seem to find a goal with the name ${goalname}, did you check for typos?`
        );
      }

      existingGoal.update({
          pomAmount: pomamount
      });

      return channel.send(
        `Your goal "${goalname}" was updated to be ${pomamount} poms. You can do it! `
      );
    }
  };

  bot.addCommand("updategoal", handler);
};
