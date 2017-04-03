/**
 * Created by apple on 2017/3/31.
 */
var OldRun = require("../models/oldRunModel");

function saveOldRun(oldRun, cb) {
    new OldRun(oldRun).save(cb);
}
module.exports.saveOldRun = saveOldRun;

function search(filter, cb) {
    var containsRegEx = ".*" + filter + ".*";
    var query = {};
    query.$or = [
        {"id": filter},
        {'description': {$regex: containsRegEx}},
        {'date': {$regex: containsRegEx}}
    ];
    console.log(query);
    OldRun.find(query, cb);
}
module.exports.search = search;

function findAll(cb) {
    OldRun.find({}, cb);
}
module.exports.findAll = findAll;
