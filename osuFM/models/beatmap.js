"use strict";

module.exports = function(sequelize, DataTypes) {
  var Beatmap = sequelize.define("Beatmap", {
    bid: DataTypes.INTEGER,
    sid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    artist: DataTypes.STRING,
    mapper: DataTypes.STRING,
    num_scores: DataTypes.INTEGER,
    pop_mod: DataTypes.STRING,
    avg_pp: DataTypes.FLOAT,
    avg_rank: DataTypes.INTEGER,
    avg_acc: DataTypes.FLOAT,
    avg_pos: DataTypes.INTEGER,
    mode: DataTypes.INTEGER,
    cs: DataTypes.FLOAT,
    ar: DataTypes.FLOAT,
    length: DataTypes.INTEGER,
    bpm: DataTypes.FLOAT,
    diff: DataTypes.FLOAT,
    version: DataTypes.STRING,
    score: DataTypes.FLOAT


  });

  return Beatmap;
};