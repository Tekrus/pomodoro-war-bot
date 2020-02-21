//

const Seq = require("sequelize");

module.exports = {
  install(db, models) {
    models.TrackedPoms = db.define("trackedpoms", {
      description: Seq.TEXT,
      trackDate: { type: Seq.DATEONLY, defaultValue: Seq.NOW }
    });
  },
  associate(db, models) {
    models.TrackedPoms.belongsTo(models.Profile);
    models.TrackedPoms.belongsTo(models.PomGoals);
  }
};
