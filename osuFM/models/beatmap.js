"use strict";

module.exports = function(sequelize, DataTypes) {
  var Beatmap = sequelize.define("Beatmap", {
    bid: { type: DataTypes.INTEGER, primaryKey: true },
    sid: DataTypes.INTEGER,
    name: DataTypes.STRING,
    artist: DataTypes.STRING,
    mapper: DataTypes.STRING,
    num_scores: DataTypes.INTEGER,
    pop_mod: { type: DataTypes.INTEGER, primaryKey: true },
    avg_pp: DataTypes.FLOAT,
    avg_rank: DataTypes.INTEGER,
    avg_acc: DataTypes.FLOAT,
    avg_pos: DataTypes.INTEGER,
    mode: { type: DataTypes.INTEGER, primaryKey: true },
    cs: DataTypes.FLOAT,
    ar: DataTypes.FLOAT,
    od: DataTypes.FLOAT,
    length: DataTypes.INTEGER,
    bpm: DataTypes.FLOAT,
    diff: DataTypes.FLOAT,
    version: DataTypes.STRING,
    calculated: DataTypes.BOOLEAN,
    score: DataTypes.FLOAT

  });

  return Beatmap;
};
