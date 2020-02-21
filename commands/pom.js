//
//     !pom command
//

const Discord = require("discord.js");
const hasEmoji = require('has-emoji');

module.exports = bot => {
  const handler = async ({
    message,
    channel,
    profile,
    args,
    guild,
    member
  }) => {
    if (args.length === 0) {
      return channel.send(
        `Hey ${member}, you forgot to specify what you've been doing this pom with \`!pom <description>\`.`
      );
    }

    if (args.length === 1 && Number.isInteger(Number(args[0]))){
      return channel.send(
        `Hey ${member}, you forgot to specify what you've been doing this pom with \`!pom <description>\`, if your goal name is numeric, use \`!pom 1 <goal name>\`.`
      );
    }

    var addPomCount = 1;
    var description;



    // Check if user is adding multiple poms
    if (!isNaN(args[0]) && args.length >= 2) {
      addPomCount = Number(args[0]);

      if (
        !Number.isInteger(Number(addPomCount)) ||
        addPomCount > 10 ||
        addPomCount < 1
      ) {
        return channel.send(
          `${member}, pom amount must be an integer between 1 and 10.`
        );
      }
      description = args
        .slice(1)
        .join(" ")
        .replace(/(\r\n|\n|\r)/gm, "");
    } else {
      description = args.join(" ").replace(/(\r\n|\n|\r)/gm, "");
    }

    if (
      description.includes(",") ||
      description.includes("`") ||
      description.includes("<:") ||
      description.length > 32 ||
      hasEmoji(description)
    ) {
      return channel.send(
        `${member}, your pom description cannot be above 32 characters or contain emojis, commas or backticks.`
      );
    }

    if (description.includes("http://") || description.includes("https://")) {
      return channel.send(`${member}, please don't put link in your goals.`);
    }

      if (args.length > 0) {
        if (message.mentions.members.size > 0) {
          return channel.send(
            `${member}, please don't mention people by tag, pom was not added.`
          );
        }

        let profileId = await MODELS().Profile.findOne({
          where: {
            guildId: guild.id,
            userId: profile.userId
          },
          attributes: ["id"]
        });

        if (profileId == null) {
          return channel.send(
            "Uh, something went wrong, warchief - this recruits ID badge is confusing me."
          );
        }

        // Link if the description is a goal for the user.
        let goal = await MODELS().PomGoals.findOne({
          where: {
            profileID: profileId.id,
            goalName: description
          },
          attributes: ["id", "pomAmount", "goalName"]
        });

        let goalId;
        let nonGoalDescription;
        if (goal == null) {
          goalId = null;
          nonGoalDescription = description;
        } else {
          goalId = goal.id;
          nonGoalDescription = null;
        }

        for (let i = 0; i < addPomCount; i++) {
          await MODELS().TrackedPoms.create({
            profileId: profileId.id,
            pomgoalId: goalId,
            description: nonGoalDescription
          });
        }

        let totalPoms;
        await MODELS()
          .TrackedPoms.count({ where: { profileId: profileId.id } })
          .then(p => {
            totalPoms = p;
          });

        let goalPomCount = 0;
        await MODELS()
          .TrackedPoms.count({ where: { pomgoalId: goalId } })
          .then(p => {
            goalPomCount = p;
          });

        // Check if not a goal
        if (goal == null) {
          return channel.send(`${member} \n` +
            `> Pom count updated with description \`${description}\`.\n> Your total pom count is now \`${totalPoms}\`.`
          );
        } else {
          if (goal.pomAmount <= goalPomCount) {
            return channel.send(
              `> \🎆 ** You completed your goal "${goal.goalName}" with \`${goal.pomAmount}\` poms. Good job, ${member}!** \🎆\n` +
                `> Pom count updated for your goal \`${description}\` (\`${goalPomCount}\` of \`${goal.pomAmount}\` poms completed).\n> Your total pom count is now \`${totalPoms}\`.\n`
            );
          } else {
            return channel.send(`${member} \n` +
              `> Pom count updated for your goal \`${description}\` (\`${goalPomCount}\` of \`${goal.pomAmount}\` poms completed).\n> Your total pom count is now \`${totalPoms}\`.\n`
            );
          }
        }
      }
    }

  bot.addCommand("pom", handler);
  bot.addCommand("addpom", handler);
  bot.addCommand("addpoms", handler);
};
