/**
 * Created by Zhiyuan Li on 2017/2/5.
 * Edited by Cameron Ario on 2017/2/10.
 */
var agents; //array of agents on the map
var agentsNumber; //array of text for squares with more than one agent on them
var plainMapArray; //2D array on 1s and 0s representing the map
var blockMapArray; //2D array of squares in the block viow
var paper //Space on screen for the block view
var textArr; //also an array of text for squares with more than one agent on them
var regionArr; // array of regions, nodes that belong to those regions, and information about those nodes

var graphicalPaper; //Space on the screen for the graph view
var graphicalMapArray; //2D array of the circles in the graph view
var graphicalAgentsArr; //array of agents for the graph view

//This code creates/colours the map on the screen and adds agents to the map
function setUpBlockView(tArray) {
    var container = document.getElementById('blockView');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    paper = Raphael(container, 8 * 50, 8 * 50);
    var matrix = paper.set();
    var id = 0;

    //colour nodes
    for (var i = 0; i < 8; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < 8; j++) {
            var element;
            if (tArray[i][j] == 0) {
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#32b6ce').data("flag", 0);
                element.data("flag", 0);
            } else {
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#fff').data("flag", 1);
            }
            matrix[i].push(element);
        }
    }

    blockMapArray = matrix;

    //insert random agents
    for (var a = 0; a < regionArr.length; a++) {
        var newAgents = Math.floor((Math.random() * Math.floor(regionArr[a].length / 2)) + 1); //get a number of new agents for the region between 1 and half of the open nodes
        for (var b = 0; b < newAgents; b++) {
            var loc = Math.floor((Math.random() * regionArr[a].length)); //get a random node from the Region array
            var i = regionArr[a][loc][0];
            var j = regionArr[a][loc][1];

            changeColor(i, j); //set node to visited
			regionArr[a][loc][2] = true;
			
            id++;

            var agent = paper.rect(i * 50 + 20, j * 50 + 20, 10, 10) //add agent to map and agents array
                .attr({
                    'stroke-width': "0",
                    "fill": "red"
                })
                .data({
                    "x": i,
                    "y": j,
                    "id": id,
                    "region": a,
                    "goal": loc,
					"goalArr": new Array(),
					"locArr": [loc]
                });

            agents.push(agent);

            regionArr[a][loc][2][0] += 1; //save number of agent on this node at step 0
        }
    }

    cleanNumber();
    moreThanOneAgent();
}

//this method creates the map to be used
function maps() {
    agents = new Array();
    graphicalAgentsArr = new Array();
    agentsNumber = new Array();
    plainMapArray = new Array();
    textArr = new Array();
    regionArr = new Array();

    //TODO: pull map from database

    //STUB: creates static map
    for (var k = 0; k < 8; k++) {
        plainMapArray[k] = new Array();
        for (var j = 0; j < 8; j++) {
            plainMapArray[k][j] = 1;
        }
    }
    for (var k = 0; k < 8; k++) {
        for (var j = 0; j < 8; j++) {
            if (k == j || k + j == 7) {
                plainMapArray[k][j] = 0;
            }
        }
    }

    //TODO: add nodes from map that belong to the different regions

    //STUB: add nodes of static map
    regionArr[0] = new Array();
    regionArr[1] = new Array();
    regionArr[2] = new Array();
    regionArr[3] = new Array();

    for (var a = 0; a < 8; a++) {
        for (var b = 0; b < 8; b++) {
            var node = new Array();
            node.push(a); //node's x position
            node.push(b); //node's y position
            node.push(false); //true or false if the node is currently / has been the goal of an agent
            node.push(false); //true or false if the node has been visited by an agent before

            if (a == b) {
            }
            else if ((a < 3 && b > 2 && b < 5) || (a < 2 && b > 1 && b < 6) || (a < 1 && b > 0 && b < 7)) {

                regionArr[0].push(node);
            }
            else if ((b < 3 && a > 2 && a < 5) || (b < 2 && a > 1 && a < 6) || (b < 1 && a > 0 && a < 7)) {

                regionArr[1].push(node);
            }
            else if ((a > 4 && b > 2 && b < 5) || (a > 5 && b > 1 && b < 6) || (a > 6 && b > 0 && b < 7)) {

                regionArr[2].push(node);
            }
            else if ((b > 4 && a > 2 && a < 5) || (b > 5 && a > 1 && a < 6) || (b > 6 && a > 0 && a < 7)) {

                regionArr[3].push(node);
            }
        }
    }

    setUpBlockView(plainMapArray);
    setUpRegion(plainMapArray);
}

//This method moves the agents a single step when run
function run(runs) {
    for (var n = 0; n < runs; n++) { //repeat steps n times
        var copyDirection = new Array();
		
		//set the graph view movement to stay in place is there is no movement
        for (var k = 0; k < agents.length; k++) {
            copyDirection.push(new Array());
            copyDirection[copyDirection.length - 1].push(agents[k].data("x"));
            copyDirection[copyDirection.length - 1].push(agents[k].data("y"));
        }

        for (var i = 0; i < regionArr.length; i++) { //for each region
		
			//check if the current region has been explored fully and all agents are stopped
            var finished = true;
            for (var j = 0; j < regionArr[i].length; j++) {//if there is an unvisited node
                if (regionArr[i][j][3] == false) {
                    finished = false;
                }
			}
			for(var k = 0; k < agents.length; k++){//if there is an agent still going to a goal
				if(agents[k].data("region") == i){
					if(agents[k].data("x") != regionArr[i][agents[k].data("goal")][0] && agents[k].data("y") != regionArr[i][agents[k].data("goal")][1]){
						finished = false;
					}
				}
			}
			
			
            for (var k = 0; k < agents.length; k++) {//for each agent
                if (finished == false && agents[k].data("region") == i) { //run algorithm in unfinished region
					
					//if the agent has made it to its goal, find a new goal.
                    if (agents[k].data("x") == regionArr[i][agents[k].data("goal")][0] && agents[k].data("y") == regionArr[i][agents[k].data("goal")][1]) {
                        var newGoal = -1;
                        var tempNum = 0;
                        for (var a = 0; a < regionArr[i].length; a++) { //for each node in the region
                            if (regionArr[i][a][3] == false && regionArr[i][a][2] == false) { //if the node isn't visited and isn't a goal
                                var temp = Math.random();
                                if (tempNum <= temp) { //randomly pick a new goal from the unvisited nodes
                                    newGoal = a;
                                }
                            }
                        }
						if(newGoal != -1){
							agents[k].data({ //change the agent's goal
								"goal": newGoal
							});
							
							agents[k].data("goalArr").push(newGoal);
							regionArr[i][newGoal][2] = true;
						}
                    }
					
                    //use algorithm to move
					if(agents[k].data("x") != regionArr[i][agents[k].data("goal")][0] || agents[k].data("y") != regionArr[i][agents[k].data("goal")][1]){
						var graph = new Graph(plainMapArray);

						var start = graph.grid[agents[k].data("x")][agents[k].data("y")];
						var end = graph.grid[regionArr[i][agents[k].data("goal")][0]][regionArr[i][agents[k].data("goal")][1]];
						var result = astar.search(graph, start, end);

						var x = result[0].x;
						var y = result[0].y;

						copyDirection[k][0] = x; //set the graph view movement to where the agent moved to
						copyDirection[k][1] = y;

						agents[k].data({ //change the agent's placement on the map
							"x": x,
							"y": y
						}).attr({x: x * 50 + 20, y: y * 50 + 20}).toFront();
						
						//add new node to agent's visited locations array
						for (var a = 0; a < regionArr.length; a++) {
							for (var b = 0; b < regionArr[a].length; b++) {
								if (regionArr[a][b][0] == x && regionArr[a][b][1] == y) {
									agents[k].data("locArr").push(b);
								}
							}
						}
					}
					
                }
            }
        }

        runGra(copyDirection);

        for (var i = 0; i < agents.length; i++) {//colour all squares agents are in
            changeColor(agents[i].data("x"), agents[i].data("y"));
        }

    }

    cleanNumber();
    moreThanOneAgent();
}

//this method calls the run function n times
function runNsteps() {
    var steps = $("#steps").val();

    run(steps);
}

//When multiple agents are on the same square, write the number in the square
function moreThanOneAgent() {
    var agent, agentFollow;
    for (var i = 0; i < agents.length; i++) {// compare all agents to each other,
        var count = 1;
        for (var j = 0; j < agents.length; j++) {
            if ((i == j) || (agents[i].data("region") != agents[j].data("region"))) {//if it is the same agent or not in the same region, skip
                continue;
            }
            agent = agents[i];
            agentFollow = agents[j];
            if (agent.data("x") == agentFollow.data("x") && agent.data("y") == agentFollow.data("y")) { //if agents are on the same square
                count++;
            }
        }
        agentsNumber.push(count);
    }
    //console.log(agentsNumber)

    for (var k = 0; k < agents.length; k++) { //for all agents, write number of agents on square
        if (agentsNumber[k] >= 1) {
            var x = agents[k].data('x');
            var y = agents[k].data('y');
            var textEle = paper.text(x * 50 + 5, y * 50 + 5, agentsNumber[k]).toFront();
            textArr.push(textEle);
        }
    }
    agentsNumber.splice(0, agentsNumber.length)

}

//Remove text from squares without more than one agent
function cleanNumber() {
    for (i in textArr) {
        textArr[i].remove();
    }
}

//change colour of visited square and mark square as visited.
function changeColor(i, j) {
    blockMapArray[i][j].attr("fill", "#8ffc9c"); //colour the visited square on the block view

    for (var k = 0; k < regionArr.length; k++) { //set the node in the region array to visited
        for (var l = 0; l < regionArr[k].length; l++) {
            if (regionArr[k][l][0] == i && regionArr[k][l][1] == j) {
                regionArr[k][l][2] = true;
				regionArr[k][l][3] = true;
            }
        }
    }
	
	//document.getElementById("steps").value = "test"; //for testing purposes
}


//--------------------------------------graphical view------------------------------------------------------------------------------

var regions = {region1: ["0,1", "0,2", "0,3", "0,4", "0,5", "0,6", "1,2", "1,3", "1,4", "1,5", "2,3", "2,4"]};// test data for one region(open spaces)

function setUpRegion(tArray) {
    var container = document.getElementById('graphicalView');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    graphicalPaper = Raphael(container, 8 * 50, 8 * 50);
    var matrix = new Array();

    //colour nodes
    for (var i = 0; i < 8; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < 8; j++) {
            var element;
            if (tArray[i][j] == 0) {
                element = graphicalPaper.rect(i * 50, j * 50, 50, 50).data("flag", 0).hide();//hide closed spaces
                element.data("flag", 0);
            } else {
                element = graphicalPaper.circle(i * 50 + 25, j * 50 + 25, 25).data("flag", 1).hide();//hide all open spaces
                element.data({x: i, y: j});
            }
            element.click(function () {
// here is pop up window for open spaces;
                alert(element.data("x"));
            });
            matrix[i].push(element);// push circle
        }
    }


// show selected open spaces（region1 refer line285）
    for (var i in regions.region1) {
        var coordinate = regions.region1[i].split(",");
        for (var j = 0; j < matrix.length; j++) {
            for (var k = 0; k < matrix[j].length; k++) {
                console.log(matrix[j][k].data("x"));
                if (coordinate[0] == matrix[j][k].data("x") && coordinate[1] == matrix[j][k].data("y")) {
                    matrix[j][k].show();
                    graphicalPaper.text(j * 50 + 25, k * 50 + 25,"("+j+","+k+")").toFront();
                }
            }


        }
    }

    graphicalMapArray = matrix;
    //insert agents into graph view at positions identical to block view's agents
    for (var i = 0; i < agents.length; i++) {
        var x = agents[i].data("x");
        var y = agents[i].data("y");

        var graphAgent = graphicalPaper.rect(x * 50 + 20, y * 50 + 20, 10, 10)
            .attr({
                'stroke-width': "0",
                "fill": "red"
            })
            .data({
                "x": x,
                "y": y,
            });

        changeGraphicalColor(x, y);
        graphicalAgentsArr.push(graphAgent);
    }
}

//move agents in graph view based on thier movements from the block view
function runGra(copyDirection) {
    for (var i = 0; i < graphicalAgentsArr.length; i++) {
        var x = copyDirection[i][0];
        var y = copyDirection[i][1];

        changeGraphicalColor(x, y);

        graphicalAgentsArr[i].data({
            "x": x,
            "y": y
        }).attr({x: x * 50 + 20, y: y * 50 + 20}).toFront();
    }
}

//change colour of visited circle on graph view
function changeGraphicalColor(i, j) {
    graphicalMapArray[i][j].attr("fill", "#8ffc9c"); //colour the visited circle on the graph view
}
