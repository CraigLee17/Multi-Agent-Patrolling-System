/**
 * Created by Zhiyuan Li on 2017/2/21.
 */
function toGraphicalView() {
    $("#blockView").hide();
    $("#graphicalView").show();
    $("#toBlockViewBtn").show();
    $("#nodeInfoInGraphical").dialog("open");
}

function toBlockView() {
    $("#blockView").show();
    $("#graphicalView").hide();
    $("#toBlockViewBtn").hide();
    $('#nodeInfoInGraphical').hide();
    $("#nodeInfoInGraphical").dialog("close");
}
