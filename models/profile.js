const Seq = require("sequelize");

module.exports = {
  install(db, models) {
    models.Profile = db.define("profiles", {
      guildId: Seq.STRING(20),
      userId: Seq.STRING(20),
      tag: Seq.STRING(64),
      avatarURL: Seq.TEXT
    });
  },

  associate(db, models) {
    models.Profile.hasMany(models.PomGoals);
    models.Profile.hasMany(models.TrackedPoms);
  }
};
