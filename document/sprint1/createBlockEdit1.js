/**
 * Created by Zhiyuan Li on 2017/2/5.
 * Modified by Ario, Cameron on 2017/2/10
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
var agents = new Array(); //array of agents on the map
var agentsNumber=new Array(); //array of text for squares with more than one agent on them
var mapArray = new Array(); //2D array of squares in the map
var paper //Space on screen for the map
var textArr=new Array(); //also an array of text for squares with more than one agent on them
var regionArr = new Array(); // array of regions, nodes that belong to those regions, and information about those nodes

//This code creates/colours the map on the screen and adds agents to the map
function setUpMap(tArray) {
    var container = document.getElementById('canvas_container');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
     paper= new Raphael(container, 8 * 50, 8 * 50);
    var matrix = paper.set();
    var id = 0;
	
	//colour nodes 
    for (var i = 0; i < 8; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < 8; j++) {
            var element;
            if (tArray[i][j] == 1) { //colour walls
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#32b6ce').data("flag", 1);
                element.data("flag", 1);
            } else { //colour empty spaces white
                element = paper.rect(i * 50, j * 50, 50, 50).attr('fill', '#fff').data("flag", 0);
            }
            matrix[i].push(element);
        }
    }
	
	//insert random agents
	for(var a = 0; a < regionArr.length; a++){
		var newAgents = Math.floor((Math.random() * Math.floor(reigonArr[a].length/2)) + 1); //get a number of new agents for the region between 1 and half of the open nodes
		for(int b = 0; b < newAgents; b++){
			var loc = Math.floor((Math.random() * reigonArr[a].length)); //get a random node from the Region array
			
			regionArr[a][loc][3] = "true"; //set node to visited
			
			var i = regionArr[a][loc][0];
			var j = regionArr[a][loc][1];
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
					"region": a
                });
            agents.push(agent);
			
		}
	}
	
	
    mapArray = matrix;
}

//this method creates the map to be used
function maps() {
	//TODO: pull map from database
	
	//STUB: creates static map
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
	
	//TODO: add nodes from map that belong to the different regions
	
	//STUB: add nodes of static map
	regionArr.push(new Array());
	regionArr.push(new Array());
	regionArr.push(new Array());
	regionArr.push(new Array());
	
	for(var a = 0; a < 8; a++){
		for(var b = 0; b < 8; b++){
			var node = new Array();
				node.push(a); //node's x position
				node.push(b); //node's y position
				node.push(new Array()); //array containing what agents on it each step of the algorithm (eg. reigonArr[region][node][2][step#])
				node.push("false"); //String true or false if the node has been visited by an agent before
			
			if(a == b){}
			else if((a < 3 && b > 2 && b < 5) || (a < 2 && b > 1 && b < 6) || (a < 1 && b > 0 && b < 7)){
				
				regionArr[0].push(node);
			}
			else if((b < 3 && a > 2 && a < 5) || (b < 2 && a > 1 && a < 6) || (b < 1 && a > 0 && a < 7)){
				
				regionArr[1].push(node);
			}
			else if((a > 4 && b > 2 && b < 5) || (a > 5 && b > 1 && b < 6) || (a > 6 && b > 0 && b < 7)){
				
				regionArr[2].push(node);
			}
			else if((b > 4 && a > 2 && a < 5) || (b > 5 && a > 1 && a < 6) || (b > 6 && a > 0 && a < 7)){
				
				regionArr[3].push(node);
			}
		}
	}
    
}

//This method moves the agents a single step when run
function run() {
	//TODO: use algorithm to move
	for(var i = 0; i < regionsArr.length; i++){ //for each region
		
	}
	
	//STUB: move in random direction
    for (var i = 0; i < agents.length; i++) {
        var direction = Math.round(Math.random() * 3 + 1); //random number 1 - 4
        var agent = agents[i];
        var x = agent.data("x");
        var y = agent.data("y");

        switch (direction) {
            case 1: //if 1: move right
                if (x + 1 < 8) {
                    if (mapArray[x + 1][y].data("flag") == 0) {//if the square in that direction is not a wall
                        x++;
                        changeColor(x, y);
                    }
                }
                break;
            case 2: //if 2 move down
                if (y + 1 < 8) {
                    if (mapArray[x][y + 1].data("flag") == 0) {
                        y++;
                        changeColor(x, y);
                    }
                }
                break;
            case 3: //if 3 move left
                if (x - 1 >= 0) {
                    if (mapArray[x - 1][y].data("flag") == 0) {
                        x--;
                        changeColor(x, y);
                    }
                }
                break;
            case 4: //if 4 move up
                if (y - 1 >= 0) {
                    if (mapArray[x][y - 1].data("flag") == 0) {
                        y--;
                        changeColor(x, y);
                    }
                }
                break;
        }
        agent.data({ //change the agent's placement on the map
            "x": x,
            "y": y,
        }).attr({x: x * 50 + 20, y: y * 50 + 20}).toFront();
    }
    cleanNumber();
    moreThanOneAgent();
}

//When multiple agents are on the same square, write the number in the square
function moreThanOneAgent() {
    var agent,agentFollow;
    for (var i = 0; i < agents.length; i++) {// compare all agents to each other,
        var count=1;
        for (var j = 0; j < agents.length; j++) {
            if ((i == j) || (agents[i].data("region") != agents[j].data("region"))){//if it is the same agent or not in the same region, skip
                continue;
            }
            agent= agents[i];
            agentFollow=agents[j];
            // console.log(agent.data("x"))
            // console.log(agentFollow.data("x"))
            if (agent.data("x")==agentFollow.data("x")&&agent.data("y")==agentFollow.data("y")){ //if agents are on the same square
                count++;
            }
        }
        agentsNumber.push(count);
    }
    console.log(agentsNumber)

    for (var k=0;k<agents.length;k++){//for all agents, write number of agents on square
        if (agentsNumber[k]>=1){
            var x=agents[k].data('x');
            var y=agents[k].data('y');
            var textEle=paper.text(x*50+5,y*50+5,agentsNumber[k]).toFront();
            textArr.push(textEle);
        }
    }
    agentsNumber.splice(0,agentsNumber.length)

}

//Remove text from squares without more than one agent
function cleanNumber() {
    for (i in textArr){
        textArr[i].remove();
    }
}

//change colour of visited square
function changeColor(i, j) {
    mapArray[i][j].attr("fill", "#8ffc9c");
}