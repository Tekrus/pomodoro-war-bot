//
//      !addgoal command
//

const Discord = require("discord.js");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const hasEmoji = require('has-emoji');

module.exports = bot => {
  const handler = async ({
    channel,
    profile,
    args,
    guild,
    member,
    message
  }) => {
    let goalarr;
    let goalname;
    if (args[1] === "poms" || args[1] === "pom") {
      goalarr = args.slice(2, args.length);
    } else {
      goalarr = args.slice(1, args.length);
    }
    let pomamount = Number(args[0]);
    goalname = goalarr.join(" ").replace(/(\r\n|\n|\r)/gm, "");

    if (
      goalname.includes(",") ||
      goalname.includes("`") ||
      goalname.includes("<:") ||
      goalname.length > 32 ||
      hasEmoji(goalname)
    ) {
      return channel.send(
        `${member}, your goal name cannot be longer than 32 characters or contain emojis, commas or backticks.`
      );
    }

    if(goalname.includes("http://") || goalname.includes("https://")) {
      return channel.send(
        `${member}, please don't put link in your goals.`
      );
    }

    if (isNaN(pomamount)) {
      return channel.send(
        `Uh.. ${member}, I didn't understand that syntax, please use \`!setgoal <amount> <description>\`!`
      );
    }

    if (
      pomamount < 1 ||
      pomamount > 2500 ||
      !Number.isInteger(Number(pomamount))
    ) {
      return channel.send(
        `${member}, please choose a valid pom amount between 1 and 2500.`
      );
    }

    if (message.mentions.members.size > 0) {
      return channel.send(
        `${member}, please don't mention people in your goals.`
      );
    }

    if (
      goalname === "" ||
      goalname === undefined ||
      pomamount === undefined ||
      args.length === 0
    ) {
      return channel.send(
        `${member}, please add both a goal name and the pom amount.`
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
      if (existingGoal != null) {
        return channel.send(
          `${member}, you have already defined a goal with this name.`
        );
      }

      const addedPom = await MODELS().PomGoals.create({
        pomAmount: pomamount,
        goalName: goalname,
        profileId: profileId.id
      });

      MODELS().TrackedPoms.update(
        {
          profileId: profile.id,
          pomgoalId: addedPom.id,
          description: null
        },
        {
          where: {
            profileId: profileId.id,
            description: goalname
          }
        }
      );

      const encouragements = [
        "You can do it!",
        "You got this!",
        "Let's go!",
        "Go get those tomatoes!",
        "It's time to say I will, and get that goal done!",
        "Reach that dream!"
      ];

      let randomEncouragement =
        encouragements[Math.floor(Math.random() * encouragements.length)];

      return channel.send(
        `Hey ${member}! Your goal to achieve ${pomamount} poms for "${goalname}" was added. ${randomEncouragement}`
      );
    }
  };

  bot.addCommand("addgoal", handler);
  bot.addCommand("setgoal", handler);
};
