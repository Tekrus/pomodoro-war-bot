//
//      !renamegoal command
//

const Discord = require("discord.js");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const hasEmoji = require('has-emoji');

module.exports = bot => {
  const handler = async ({
    message,
    channel,
    member,
    command,
    guild,
    profile
  }) => {
    let text = message.content.slice(command.length + 2).split(",");
    let goalname;
    let newGoalname;

    if(text[0] == null ||
        text[1] == null ||
        text[0].trim() === "" ||
        text[1].trim() === ""){
      return channel.send(
          `${member}, I think you forgot to specify the new name, friend.`
      )
    } else {
      goalname = text[0].trimStart();
      newGoalname = text[1].replace(/(\r\n|\n|\r)/gm, "").trimStart();
    }

    const user = await MODELS().Profile.findOne({
      where: {
        guildId: guild.id,
        userid: profile.userId
      },
      attributes: ["id"]
    });

    if (text.length > 2) {
      return channel.send(
        `${member}, your goal name cannot contain the character \`,\`, could you try again?`
      );
    }

    if (
      newGoalname.includes("`") ||
      newGoalname.includes(",") ||
      newGoalname.includes("<:") ||
      hasEmoji(newGoalname) ||
      newGoalname.length > 32
    ) {
      return channel.send(
        `${member}, your goal name cannot be longer than 32 characters or contain emojis, commas or backticks.`
      );
    }

    if (newGoalname.includes("http://") || newGoalname.includes("https://")) {
      return channel.send(`${member}, please don't put link in your goals.`);
    }

    let existingPom = await MODELS().TrackedPoms.findOne({
      where: {
        profileId: user.id,
        description: newGoalname
      }
    });

    let existingGoal = await MODELS().PomGoals.findOne({
      where: {
        profileId: user.id,
        goalName: newGoalname
      }
    });

    const pomgoal = await MODELS().PomGoals.findOne({
      where: {
        profileId: user.id,
        goalName: goalname
      },
      attributes: ["goalName"]
    });

    if (pomgoal == null) {
      return channel.send(
        `${member}, I can't seem to find any goals with that name, did you check for typo?`
      );
    } else {
      if(existingGoal != null || existingPom != null){
        return channel.send(`${member}, you already have a goal with this name, please try another name!`)
      } else {
        if (pomgoal != null) {
          await MODELS().PomGoals.update(
              {
                goalName: newGoalname
              },
              {
                where: {
                  profileId: user.id,
                  goalName: pomgoal.goalName
                }
              }
          );
        } else {
          await MODELS().TrackedPoms.update(
              {
                description: newGoalname
              },
              {
                where: {
                  description: goalname,
                  profileId: user.id,
                  pomgoalId: null
                }
              }
          );
        }
        return channel.send(
            `${member}, the name of your goal was changed from ${goalname} to ${newGoalname}`
        );
      }
    }
  };

  bot.addCommand("renamegoal", handler);
};
