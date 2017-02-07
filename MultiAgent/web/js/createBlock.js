/**
 * Created by Zhiyuan Li on 2017/2/5.
 */
function setBlockSize() {
    var container = document.getElementById('canvas_container');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    var width = document.getElementById("width").value;
    var height = document.getElementById("height").value;
    if (!width || !height) {
        alert("Please input the size of the environment!");
        return;
    }
    var paper = new Raphael(document.getElementById('canvas_container'), width * 50, height * 50);
    var matrix= paper.set();
    for (var i = 0; i < width; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < height; j++) {
            var  element = paper.rect(i* 50, j * 50, 50, 50).attr({'fill': "#fff"}).click(function () {
                this.attr({"fill": "#32b6ce"});
            });
            matrix[i].push(element);
        }
    }
}
