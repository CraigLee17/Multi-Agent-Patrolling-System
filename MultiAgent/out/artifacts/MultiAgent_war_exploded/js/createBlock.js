/**
 * Created by Zhiyuan Li on 2017/2/5.
 */
/*function setBlockSize() {
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
 }*/
var agents = new Array();
var mapArray = new Array();

function setUpMap(tArray) {
    var container = document.getElementById('canvas_container');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    var paper = new Raphael(container, 8 * 50, 8 * 50);
    var matrix = paper.set();
    var id = 0;

    for (var i = 0; i < 8; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < 8; j++) {
            var element;
            if (tArray[i][j] == 1) {
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#32b6ce').data("flag", 1);
                element.data("flag", 1);
            } else {
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#fff').data("flag", 0);
                if ((i == 0 && j == 3) ||  (i == 0 && j == 4)||(i == 3 && j == 0) ||  (i == 4 && j == 0)||(i == 7 && j == 3) ||  (i ==7 && j == 4)||(i == 3 && j == 7) ||  (i == 4 && j == 7)) {
                    id++;
                    var agent = paper.rect(i * 50 + 20, j * 50 + 20, 10, 10)
                        .attr({
                            'stroke-width': "0",
                            "fill": "red"
                        })
                        .data({
                            "x": i,
                            "y": j,
                            "id": id
                        });
                    agents.push(agent);
                }
            }
            matrix[i].push(element);
        }
    }
    mapArray = matrix;
}

function maps() {
    var tArray = new Array();
    for (var k = 0; k < 8; k++) {
        tArray[k] = new Array();
        for (var j = 0; j < 8; j++) {
            tArray[k][j] = 0;
        }
    }
    for (var k = 0; k < 8; k++) {
        for (var j = 0; j < 8; j++) {
            if (k == j || k + j == 7) {
                tArray[k][j] = 1;
            }
        }
    }
    setUpMap(tArray);
}

function run() {
    for (var i = 0; i < agents.length; i++) {
        var direction = Math.round(Math.random() * 3 + 1);
        var agent = agents[i];
        var x = agent.data("x");
        var y = agent.data("y");

        switch (direction) {
            case 1:
                if (x + 1 < 8) {
                    if (mapArray[x + 1][y].data("flag") == 0) {
                        x++;
                        changeColor(x, y);
                    }
                }
                break;
            case 2:
                if (y + 1 < 8) {
                    if (mapArray[x][y + 1].data("flag") == 0) {
                        y++;
                        changeColor(x, y);
                    }
                }
                break;
            case 3:
                if (x - 1 >= 0) {
                    if (mapArray[x - 1][y].data("flag") == 0) {
                        x--;
                        changeColor(x, y);
                    }
                }
                break;
            case 4:
                if (y - 1 >= 0) {
                    if (mapArray[x][y - 1].data("flag") == 0) {
                        y--;
                        changeColor(x, y);
                    }
                }
                break;
        }
        agent.data({
            "x": x,
            "y": y,
        }).attr({x: x * 50 + 20, y: y * 50 + 20}).toFront();
    }
}


function changeColor(i, j) {
    mapArray[i][j].attr("fill", "#8ffc9c");
}