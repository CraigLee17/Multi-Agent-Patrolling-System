/**
 * Created by apple on 2/1/17.
 */
window.onload = function createRegion() {
    $(function () {
        $('#collapseTwo').collapse('hide')
    });
    $(function () {
        $('#collapseOne').collapse('hide');
    });
    var i = 7//height
    var p = 8//width
    var tArray = new Array();
    var pNode = document.getElementById("block")
    for (var c = 0; c < i; c++) {
        var node = document.createElement("div")
        node.setAttribute("style", "height:40px")
        node.setAttribute("id", c)
        pNode.appendChild(node)
    }
    for (var k = 0; k < i; k++) {
        tArray[k] = new Array();
        for (var j = 0; j < p; j++) {
            var nod = document.getElementById(k)
            btn = document.createElement("button")
            tArray[k][j] = Math.round(Math.random());
            if (tArray[k][j] == 1) {
                btn.type = "button"
                btn.setAttribute("class", "button button-inverse button-square")
            } else {
                btn.type = "button"
                btn.setAttribute("class", "button button-action button-square")
            }
            nod.appendChild(btn)
        }
    }
}
