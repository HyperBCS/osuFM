"use strict";

module.exports = function(sequelize, DataTypes) {
  var Score = sequelize.define("Score", {
    bid: DataTypes.INTEGER,
    acc: DataTypes.FLOAT,
    mods: DataTypes.INTEGER,
    uid: DataTypes.INTEGER,
    pp: DataTypes.FLOAT
  });

  return Score;
};