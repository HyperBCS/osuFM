"use strict";

module.exports = function(sequelize, DataTypes) {
  var Score = sequelize.define("Score", {
    bid: DataTypes.INTEGER,
    acc: DataTypes.FLOAT,
    mods: DataTypes.INTEGER,
    uid: DataTypes.INTEGER,
    rank: DataTypes.INTEGER,
    mode: DataTypes.INTEGER,
    user_pp: DataTypes.FLOAT,
    map_pp: DataTypes.FLOAT
  });

  return Score;
};