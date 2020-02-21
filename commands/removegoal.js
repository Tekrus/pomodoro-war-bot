//
//      !removegoal command
//

const Discord = require('discord.js');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = (bot) => {
    const handler = async ({
        message,
        channel,
        profile,
        args,
        guild,
        member,
        command
    }) => {

        let goalname = message.content.slice(command.length + 2).trimStart();

        if(!goalname) {
            return channel.send(`${member}, you forgot to specify a goal name.`)
        }

        const pomgoal = await MODELS().PomGoals.findOne({
            where: {
                goalName: goalname,
                profileId: profile.id
            },
            attributes: ["id"]
        })

        if(pomgoal == null){
            return channel.send(`${member}, I can't find a goal with that name.`)
        }

        await MODELS().TrackedPoms.update({pomgoalId: null, description: goalname}, {where: {pomgoalId: pomgoal.id}});

        await MODELS().PomGoals.destroy({
            where: {
                goalName: goalname,
                profileId: profile.id
            },
        });



        return channel.send(`${member}, your goal ${goalname} was removed successfully!`);
    };

    bot.addCommand("removegoal", handler);
};
