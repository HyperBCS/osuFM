var express = require('express');
var models = require('../models');
var router = express.Router();
const { Op } = require("sequelize");
var Sequelize = require('sequelize');
var util = require('../util/helper')
const fs = require('fs')
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'osuFM' });
// });

var defaults = {
    mods: '0',
    page: '1',
    ml: '0',
    xl: '9007199254740991',
    n1: '',
    n2: '',
    mpp: '',
    xpp: '',
    mb: '',
    xb: '',
    md: '0',
    xd: '15',
    mar: '0',
    xar: '11',
    mcs: '0',
    xcs: '10',
    modsMaybe: '0'
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('footer', {
        title: 'osu!FM - Find the best osu! farm maps',
        date: req.app.locals.dbUpdateDate
    });
});

/* GET filter page. */
router.get('/filter', function (req, res, next) {
    if (Object.keys(req.query).length == 0) {
        var err = new Error('Bad request');
        err.status = 400;
        return next(err);
    }
    mods = req.query.mods
    mods_m = req.query.modsMaybe
    if (mods == null || mods == '') {
        mods = 0
    }
    if (mods_m == null || mods_m == '') {
        mods_m = 0
    }
    mods = parseInt(mods)
    mods_m = parseInt(mods_m)
    try {
        pp_range = util.format_min_max(req.query.mpp, req.query.xpp)
        time_range = util.format_min_max(req.query.ml, req.query.xl)
        bpm_range = util.format_min_max(req.query.mb, req.query.xb)
        diff_range = util.format_min_max(req.query.md, req.query.xd)
        ar_range = util.format_min_max(req.query.mar, req.query.xar)
        cs_range = util.format_min_max(req.query.mcs, req.query.xcs)
    } catch (err) {
        var err = new Error('Bad request');
        err.status = 400;
        return next(err);
    }
    mode = req.query.m
    if (mode == null || mode == '') {
        mode = 0
    }
    mode = util.get_mode(mode)
    default_params = true
    for (query in req.query) {
        if (query == 'm') {
            continue
        }
        if (req.query[query] != defaults[query]) {
            default_params = false
        }
    }
    if (default_params) {
        res.json({
            maps: req.app.locals.mapCache[req.query.m],
        });
        return
    } else if (mods == null || mods == 0) {
        query = { attributes: ['bid', 'sid', 'name', 'artist', 'mapper', 'pop_mod', 'avg_pp', 'avg_acc', 'mode', 'cs', 'ar', 'od', 'length', 'bpm', 'diff', 'version', 'score'], order: [['score', 'DESC']], where: { diff: { [Op.gte]: diff_range[0], [Op.lte]: diff_range[1] }, bpm: { [Op.gte]: bpm_range[0], [Op.lte]: bpm_range[1] }, length: { [Op.gte]: time_range[0], [Op.lte]: time_range[1] }, avg_pp: { [Op.gte]: pp_range[0], [Op.lte]: pp_range[1] }, cs: { [Op.gte]: cs_range[0], [Op.lte]: cs_range[1] }, ar: { [Op.gte]: ar_range[0], [Op.lte]: ar_range[1] }, [Op.and]: [{ [Op.or]: mode }] } }

    } else {
        query_mod = mods
        if (query_mod == -1) {
            query_mod = 0;
        } else if (query_mod % 2 != 0) {
            query_mod += 1
        }
        query_mod_m = mods_m
        if (query_mod_m == -1) {
            query_mod_m = 0;
        } else if (query_mod_m % 2 != 0) {
            query_mod_m += 1
        }
        query = { attributes: ['bid', 'sid', 'name', 'artist', 'mapper', 'pop_mod', 'avg_pp', 'avg_acc', 'mode', 'cs', 'ar', 'od', 'length', 'bpm', 'diff', 'version', 'score'], order: [['score', 'DESC']], where: { mods: { [Op.or]: [{ [Op.and]: [Sequelize.literal("pop_mod & " + query_mod + " == " + query_mod), Sequelize.literal("pop_mod & " + query_mod_m)] }, Sequelize.literal("pop_mod == " + query_mod)] }, diff: { [Op.gte]: diff_range[0], [Op.lte]: diff_range[1] }, bpm: { [Op.gte]: bpm_range[0], [Op.lte]: bpm_range[1] }, length: { [Op.gte]: time_range[0], [Op.lte]: time_range[1] }, avg_pp: { [Op.gte]: pp_range[0], [Op.lte]: pp_range[1] }, cs: { [Op.gte]: cs_range[0], [Op.lte]: cs_range[1] }, ar: { [Op.gte]: ar_range[0], [Op.lte]: ar_range[1] }, [Op.and]: [{ [Op.or]: mode }] } }
    }
    map_ret = []
    models.Beatmap.findAll(query).then(result => {
        result.forEach((m) => {
            m = m.toJSON()
            m.length = util.str_time(m.length)
            m.pop_mod = util.intToMods(m.pop_mod)
            if (m.pop_mod == '') {
                m.pop_mod = 'None'
            }
            map_ret.push(m)
        })
        res.json({
            maps: map_ret,
        });
    }).catch(function (err) {
        console.error(err.stack)
        var err = new Error('Internal Server Error');
        err.status = 500;
        return next(err);
    });
});

module.exports = router;
