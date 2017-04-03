/**
 * Created by apple on 2017/3/31.
 */

var express = require('express');
var router = express.Router();
var oldRuns = require('./oldRuns');

router.get('/index', function (req,res,next) {
    res.sendfile('index.html', {root:__dirname+"/../public"});
});

router.post('/oldrun', function (req, res, next) {
    var oldrun = req.body;
    oldRuns.saveOldRun(oldrun, function (err, oldRunOfDB) {
        if (err) {
            res.status(404).json(err)
            return;
        }
        res.json(oldRunOfDB);
    });
});



router.get('/oldruns', function (req, res, next) {
    oldRuns.findAll(function (err, oldRunsOfAll) {
        if (err) {
            res.status(404).json(err);
            return
        }
        res.json(oldRunsOfAll);

    })
});

router.get('/oldrun/condition', function (req, res, next) {//Search
    var filter=req.query.filter;
    oldRuns.search(filter,function (err, oldRun) {
        if (err) {
            res.status(404).json(err);
            return
        }
        res.json(oldRun);
    });
});

module.exports = router;













