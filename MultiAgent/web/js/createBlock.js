/**
 * Created by Zhiyuan Li on 2017/2/5.
 */
var agents = new Array();
var agentsNumber = new Array();
var BlockMapArray = new Array();
var paper
var textArr = new Array();

function setUpBlockView(tArray) {
    var container = document.getElementById('blockView');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    paper = Raphael(container, 8 * 50, 8 * 50);
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
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#fff').data("flag", 0);//element=square
                if ((i == 0 && j == 5) || (i == 6 && j == 3) || (i == 6 && j == 4) || (i == 5 && j == 3) || (i == 0 && j == 3) || (i == 0 && j == 4) || (i == 3 && j == 0) || (i == 4 && j == 0) || (i == 7 && j == 3) || (i == 7 && j == 4) || (i == 3 && j == 7) || (i == 4 && j == 7)) {
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
                    element.attr('fill', "#8ffc9c");
                    agents.push(agent);
                }
            }
            matrix[i].push(element);
        }
    }
    BlockMapArray = matrix;
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
    setUpBlockView(tArray);
    setUpRegion(tArray);
}

var copyDirection = new Array();
function run() {
    copyDirection.splice(0,copyDirection.length);
    for (var i = 0; i < agents.length; i++) {
        var direction = Math.round(Math.random() * 3 + 1);
        copyDirection.push(direction);
        var agent = agents[i];
        var x = agent.data("x");
        var y = agent.data("y");

        switch (direction) {
            case 1:
                if (x + 1 < 8) {
                    if (BlockMapArray[x + 1][y].data("flag") == 0) {
                        x++;
                        changeColor(x, y);
                    }
                }
                break;
            case 2:
                if (y + 1 < 8) {
                    if (BlockMapArray[x][y + 1].data("flag") == 0) {
                        y++;
                        changeColor(x, y);
                    }
                }
                break;
            case 3:
                if (x - 1 >= 0) {
                    if (BlockMapArray[x - 1][y].data("flag") == 0) {
                        x--;
                        changeColor(x, y);
                    }
                }
                break;
            case 4:
                if (y - 1 >= 0) {
                    if (BlockMapArray[x][y - 1].data("flag") == 0) {
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
    runGra();
    cleanNumber();
    moreThanOneAgent();
}

function moreThanOneAgent() {
    var agent, agentFollow;
    for (var i = 0; i < agents.length; i++) {
        var count = 1;
        for (var j = 0; j < agents.length; j++) {
            if (i == j) {
                continue;
            }
            agent = agents[i];
            agentFollow = agents[j];
            if (agent.data("x") == agentFollow.data("x") && agent.data("y") == agentFollow.data("y")) {
                count++;
            }
        }
        agentsNumber.push(count);
    }
    console.log(agentsNumber)

    for (var k = 0; k < agents.length; k++) {
        if (agentsNumber[k] >= 1) {
            var x = agents[k].data('x');
            var y = agents[k].data('y');
            var textEle = paper.text(x * 50 + 5, y * 50 + 5, agentsNumber[k]).toFront();
            textArr.push(textEle);
        }
    }
    agentsNumber.splice(0, agentsNumber.length)
}

function cleanNumber() {
    for (var i in textArr) {
        textArr[i].remove();
    }
}

function changeColor(i, j) {
    BlockMapArray[i][j].attr("fill", "#8ffc9c");
}





//-----------------------------------------------------------------------------------------------------------------------------------------
function changeGraphicalColor(i, j) {
    graphicalMapArray[i][j].attr("fill", "#8ffc9c");
}

var graphicalPaper;
var graphicalMapArray;//circle;
var graphicalAgentsArr=new Array();
function setUpRegion(tArray) {//
    var container = document.getElementById('graphicalView');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    graphicalPaper = Raphael(container, 8 * 50, 8 * 50);
    var matrix = graphicalPaper.set();
    for (var i = 0; i < 8; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < 8; j++) {
            var element;
            if (tArray[i][j] == 1) {
                element = graphicalPaper.rect(i * 50, j * 50, 50, 50).data("flag", 1).hide();
                element.data("flag", 1);
            } else {
                element = graphicalPaper.circle(i * 50 + 25, j * 50 + 25, 25).data("flag", 0);
                graphicalPaper.text(i * 50 + 25, j * 50 + 25,"("+i+","+j+")").toFront();
                if ((i == 0 && j == 5) || (i == 6 && j == 3) || (i == 6 && j == 4) || (i == 5 && j == 3) || (i == 0 && j == 3) || (i == 0 && j == 4) || (i == 3 && j == 0) || (i == 4 && j == 0) || (i == 7 && j == 3) || (i == 7 && j == 4) || (i == 3 && j == 7) || (i == 4 && j == 7)) {
                    var graphicalAgent=graphicalPaper.rect(i * 50 + 20, j * 50 + 20, 10, 10)
                        .attr({
                            'stroke-width': "0",
                            "fill": "red"
                        })
                        .data({
                            "x": i,
                            "y": j,
                        });

                    element.attr('fill', "#8ffc9c");
                    graphicalAgentsArr.push(graphicalAgent);
                }
            }
            matrix[i].push(element);// push circle
        }
    }
    graphicalMapArray = matrix;
}

function runGra() {
    for (var i = 0; i < graphicalAgentsArr.length; i++) {
        var direction = copyDirection[i];
        var agent = graphicalAgentsArr[i];
        var x = agent.data("x");
        var y = agent.data("y");

        switch (direction) {
            case 1:
                if (x + 1 < 8) {
                    if (graphicalMapArray[x + 1][y].data("flag") == 0) {
                        x++;
                        changeGraphicalColor(x,y);
                    }
                }
                break;
            case 2:
                if (y + 1 < 8) {
                    if (graphicalMapArray[x][y + 1].data("flag") == 0) {
                        y++;
                        changeGraphicalColor(x,y);

                    }
                }
                break;
            case 3:
                if (x - 1 >= 0) {
                    if (graphicalMapArray[x - 1][y].data("flag") == 0) {
                        x--;
                        changeGraphicalColor(x,y);

                    }
                }
                break;
            case 4:
                if (y - 1 >= 0) {
                    if (graphicalMapArray[x][y - 1].data("flag") == 0) {
                        y--;
                        changeGraphicalColor(x,y);

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

//-----------------------------------------------------run N steps------------------------------------------------------------------------------------------

function runNsteps() {
    var steps = $("#steps").val();
    for (var i = 0; i<steps;i++){
        run();
    }
}












