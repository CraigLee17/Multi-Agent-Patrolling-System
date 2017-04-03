/**
 * Created by apple on 2017/3/31.
 */
var mongoose = require('mongoose');

var oldRunSchema = mongoose.Schema({
    id:String,
    description:String,
    date:String,
    steps:String,
    regions:[{
        rid:String,
        spaces:String,
    }],
    agents:[
        {
            aid:String,
            track:String,
            targets:String,
            rid:String,
        }
    ]
});


var OldRun=mongoose.model('OldRun',oldRunSchema,'oldRun')
module.exports = OldRun;