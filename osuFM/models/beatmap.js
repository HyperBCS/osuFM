"use strict";

module.exports = function(sequelize, DataTypes) {
  var Beatmap = sequelize.define("Beatmap", {
    bid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    artist: DataTypes.STRING,
    mapper: DataTypes.STRING,
    num_scores: DataTypes.INTEGER,
    pop_mod: DataTypes.INTEGER,
    avg_pp: DataTypes.FLOAT,
    avg_rank: DataTypes.INTEGER,
    mode: DataTypes.INTEGER,
    date_ranked: DataTypes.DATE,
    cs: DataTypes.FLOAT,
    ar: DataTypes.FLOAT,
    length: DataTypes.INTEGER,
    bpm: DataTypes.FLOAT,
    diff: DataTypes.FLOAT,
    version: DataTypes.STRING


  });

  return Beatmap;
};