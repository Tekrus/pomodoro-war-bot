"use strict";
const Seq = require("sequelize");

module.exports = {
  install(db, models) {
    models.PomGoals = db.define("pomgoals", {
      pomAmount: Seq.INTEGER,
      goalName: Seq.TEXT
    });
  },
  associate(db, models) {
    models.PomGoals.belongsTo(models.Profile);
    models.PomGoals.hasMany(models.TrackedPoms);
  }
};
