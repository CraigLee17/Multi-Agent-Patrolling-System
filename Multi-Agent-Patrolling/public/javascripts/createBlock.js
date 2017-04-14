/**
 * Created by Zhiyuan Li on 2017/2/5.
 * Edited by Cameron Ario on 2017/2/10.
 */
var agents;//array of agents on the map
var agentsNumber; //array of text for squares with more than one agent on them
var plainMapArray; //2D array on 1s and 0s representing the map
var blockMapArray; //2D array of squares in the block view
var paper//Space on screen for the block view
var textArr; //also an array of text for squares with more than one agent on them
var regionArr; // array of regions, nodes that belong to those regions, and information about those nodes

var graphicalPaper; //Space on the screen for the graph view
var graphicalMapArray; //2D array of the circles in the graph view
var graphicalAgentsArr; //array of agents for the graph view

var fileLines; //boolean to make sure file was sucessfully validated

var maxSteps; //int of the maximum number of steps
var currentSteps; //int of the current step the algorithm is on
var finish;
var algorithm; //the algorithm that is currently being used

var currentRegionNum;

//This code creates/colours the map on the screen and adds agents to the map
function setUpBlockView(tArray, newAgents) {
    var container = document.getElementById('blockView');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    paper = Raphael(container, plainMapArray.length * 50, plainMapArray[0].length * 50);
    var matrix = paper.set();
    var id = 0;

    //colour nodes
    for (var i = 0; i < plainMapArray.length; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < plainMapArray[0].length; j++) {
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

    for (var i = 0; i < newAgents.length; i++) {
        for (var j = 0; j < newAgents[i].length; j++) {
            changeColor(newAgents[i][j][1], newAgents[i][j][2]); //set all nodes agents start at to visited
        }
    }

    //insert agents
    for (var i = 0; i < newAgents.length; i++) {
        for (var j = 0; j < newAgents[i].length; j++) {

            var start;
            for (var a = 0; a < regionArr[i].length; a++) {
                if (regionArr[i][a][0] == newAgents[i][j][1] && regionArr[i][a][1] == newAgents[i][j][2]) {
                    start = a;
                }
            }

            //find a goal for the agent
            var loc = -1;
            if (algorithm == "Free Form") {//free form random goal & unique
                var tempNum = 0;
                for (var a = 0; a < regionArr[i].length; a++) { //for each node in the region
                    if (regionArr[i][a][3] == false && regionArr[i][a][2] == false) { //if the node isn't visited and isn't a goal
                        var temp = Math.random();
                        if (tempNum <= temp) { //randomly pick a new goal from the unvisited nodes
                            loc = a;
                            tempNum = temp;
                        }
                    }
                }
            }
            else if (algorithm == "Constrained 3") {//Constrained 3 farthest goal & NOT unique
                var tempNum = 0;
                var graph = new Graph(plainMapArray);
                var begin = graph.grid[newAgents[i][j][1]][newAgents[i][j][2]];
                for (var a = 0; a < regionArr[i].length; a++) { //for each node in the region
                    if (regionArr[i][a][3] == false) { //if the node isn't visited
                        var end = graph.grid[regionArr[i][a][0]][regionArr[i][a][1]];
                        var result = astar.search(graph, begin, end);
                        var temp = result.length;
                        if (tempNum <= temp) { //pick a goal with the longest path
                            loc = a;
                            tempNum = temp;
                        }
                    }
                }
            }
            else if (algorithm == "Constrained 4") {//Constrained 4 order goal & NOT unique
                for (var a = regionArr[i].length - 1; a >= 0; a--) {//for each node in the region
                    if (regionArr[i][a][3] == false) { //if the node isn't visited
                        loc = a;
                    }
                }
            }
            if (loc != -1) {
                regionArr[i][loc][2] = true;
            }
            else {
                loc = 0;
            }


            var agent = paper.rect(newAgents[i][j][1] * 50 + 20, newAgents[i][j][2] * 50 + 20, 10, 10) //add agent to map and agents array
                .attr({
                    'stroke-width': "0",
                    "fill": "red"
                })
                .data({
                    "x": newAgents[i][j][1],
                    "y": newAgents[i][j][2],
                    "id": newAgents[i][j][0],
                    "region": i,
                    "goal": loc,
                    "goalArr": [loc],
                    "locArr": [start]
                });

            agents.push(agent);
        }
    }

    cleanNumber();
    moreThanOneAgent();
    addClickEvent();
}

function addClickEvent() {
    for (var i in regionArr) {
        for (var j in regionArr[i]) {
            var x = regionArr[i][j][0];
            var y = regionArr[i][j][1];
            blockMapArray[x][y].data({region: i}).dblclick(function () {
                toGraphicalView();
                showRegion(this.data("region"));
                currentRegionNum = this.data("region");
                displayTargets(this.data("region"));
            });
        }
    }
}

//this method creates the map to be used
function maps() {
    agents = new Array();
    graphicalAgentsArr = new Array();
    agentsNumber = new Array();
    plainMapArray = new Array();
    textArr = new Array();
    regionArr = new Array();
    var newAgents = new Array();
    currentSteps = 0;
    algorithm = $("#Algorithm").val();
    finish = false;

    //set the maximum number of steps to user inputted, or 0 if nothing was inputted
    if (isNaN($("#maxSteps").val()) || $("#maxSteps").val() < 1) {
        maxSteps = 0;
    }
    else {
        maxSteps = $("#maxSteps").val();
    }

    //pull map from upload, check that it is a text file
    var fileToLoad = document.getElementById("fileInput").files[0];
    if (fileToLoad != null) {
        var sFileName = fileToLoad.name;
        if (sFileName.length > 0) {
            if (sFileName.split('.')[sFileName.split('.').length - 1].toLowerCase() != "txt") {
                alert("Sorry, " + sFileName + " is invalid, please upload a .txt file");
                return;
            }
        }
    }
    else {
        alert("Please Upload a File!");
        return;
    }

    //read file
    if (!window.FileReader) {
        alert('Your browser is not supported');
        return;
    }
    var fr = new FileReader();
    fr.onload = function (e) {
        // Read contents line-by-line
        var contents = e.target.result;
        fileLines = contents.split(/\n/g);
    };
    fr.readAsText(fileToLoad);

    alert("Loading Map...");

    //validate file line-by-line
    if (fileLines[0].substring(0, 3) != "Map") { //check that this is a map file
        alert("Invalid input on line 1");
        return;
    }

    if (isNaN(fileLines[1]) || fileLines[1] < 8 || fileLines[1] > 15) {//check that line 1 is a number in the range 8 - 15
        alert("Invalid input on line 2");
        return;
    }
    var width = fileLines[1];

    if (isNaN(fileLines[2]) || fileLines[2] < 8 || fileLines[2] > 15) {//check that line 2 is a number in the range 8 - 15
        alert("Invalid input on line 3");
        return;
    }
    var height = fileLines[2];

    if (isNaN(fileLines[3]) || fileLines[3] < 1 || fileLines[3] > ((width * height) / 2)) {//check that line 3 is a number in the range 1 - half the number of nodes on the map
        alert("Invalid input on line 4");
        return;
    }
    var areas = fileLines[3];

    //set up plainMapArray
    for (var i = 0; i < width; i++) {
        plainMapArray[i] = new Array();
        for (var j = 0; j < height; j++) {
            plainMapArray[i][j] = 0;
        }
    }

    var line = 4;

    for (var i = 0; i < areas; i++) {
        if (fileLines[line].substring(0, 6) != "Region") { //check that this the start of a region

            alert("Invalid input on line " + line);
            return;
        }

        line++;
        regionArr[i] = new Array();
        newAgents[i] = new Array();

        //read and add the nodes of the region
        var bigNodes = fileLines[line].split("|");
        var tempArray = new Array();
        for (var j = 0; j < bigNodes.length; j++) {
            var node = new Array();
            var nodeLoc = bigNodes[j].split(",");
            //TODO: make sure nodeLoc doesn't go to large. But it didn't work when I used nodeLoc[i] > width or height...
            if (isNaN(nodeLoc[0]) || nodeLoc[0] < 1 || isNaN(nodeLoc[1]) || nodeLoc[1] < 1) {//make sure there is a valid x and y
                alert("Invalid input on line " + line + ". Invalid node location: (" + nodeLoc[0] + "," + nodeLoc[1] + ")\n" + "X must be 1 - " + width + "\nY must be 1 - " + height);
                return;
            }
            node.push(nodeLoc[0] - 1); //node's x position
            node.push(nodeLoc[1] - 1); //node's y position
            node.push(false); //true or false if the node is currently / has been the goal of an agent
            node.push(false); //true or false if the node has been visited by an agent before
            regionArr[i].push(node);
            tempArray.push(node);
            plainMapArray[nodeLoc[0] - 1][nodeLoc[1] - 1] = 1;
        }

        //TODO: check that no node is duplicated

        //check that the region is valid with at least 1 node
        if (regionArr[i].length < 1) {
            alert("Invalid input on line " + line + ". Improper number of nodes");
            return;
        }
        var regionSuccess = validateRegion(tempArray);
        if (!regionSuccess) {
            alert("Invalid input on line " + line + ". Regions must be connected to themselves");
            return;
        }

        //make sure region is not connected to other regions
        for (var a = 0; a < regionArr.length - 1; a++) {
            for (var b = 0; b < regionArr[a].length; b++) {
                for (var c = 0; c < regionArr[i].length; c++) {
                    if (regionArr[a][b][0] == regionArr[i][c][0] && regionArr[a][b][1] == regionArr[i][c][1]) {
                        alert("Invalid input on line " + line + ". Multiple regions must not be connected to wach other");
                        return;
                    }
                    else if (regionArr[a][b][0] == regionArr[i][c][0] + 1 && regionArr[a][b][1] == regionArr[i][c][1]) {
                        alert("Invalid input on line " + line + ". Multiple regions must not be connected to wach other");
                        return;
                    }
                    else if (regionArr[a][b][0] == regionArr[i][c][0] - 1 && regionArr[a][b][1] == regionArr[i][c][1]) {
                        alert("Invalid input on line " + line + ". Multiple regions must not be connected to wach other");
                        return;
                    }
                    else if (regionArr[a][b][0] == regionArr[i][c][0] && regionArr[a][b][1] == regionArr[i][c][1] + 1) {
                        alert("Invalid input on line " + line + ". Multiple regions must not be connected to wach other");
                        return;
                    }
                    else if (regionArr[a][b][0] == regionArr[i][c][0] && regionArr[a][b][1] == regionArr[i][c][1] - 1) {
                        alert("Invalid input on line " + line + ". Multiple regions must not be connected to wach other");
                        return;
                    }
                }
            }
        }


        //add each agent for the region
        line++;
        var agentNum = 0;
        while (fileLines[line].substring(0, 5) == "Agent") {

            //check that agent id is unique
            line++;
            if (isNaN(fileLines[line]) || fileLines[line] == "") {
                alert("Invalid input on line " + line);
                return;
            }
            for (var j = 0; j < newAgents.length; j++) {
                for (var k = 0; k < newAgents[j].length; k++) {
                    if (newAgents[j][k][0] == fileLines[line]) {
                        alert("Invalid input on line " + line);
                        return;
                    }
                }
            }
            newAgents[i][agentNum] = new Array();
            newAgents[i][agentNum][0] = fileLines[line];

            //check that agent's position is in the region
            line++;
            var agentLoc = fileLines[line].split(",");
            if (isNaN(agentLoc[0]) || agentLoc[0] < 1 || isNaN(agentLoc[1]) || agentLoc[1] < 1) {//make sure there is a valid x and y
                alert("Invalid input on line " + line + ". Invalid position");
                return;
            }
            var exists = false;
            for (var j = 0; j < regionArr[i].length; j++) {
                if (regionArr[i][j][0] == agentLoc[0] - 1 && regionArr[i][j][1] == agentLoc[1] - 1) {
                    exists = true;
                }
            }
            if (!exists) {
                alert("Invalid input on line " + line + ". Position not in Region");
                return;
            }
            newAgents[i][agentNum][1] = agentLoc[0] - 1;
            newAgents[i][agentNum][2] = agentLoc[1] - 1;

            agentNum++;
            line++;
        }

        //Number of agents in a region in Free Form Algorithm is 1 - ceil(n/2)
        //Number of agents in a region in Constrained 2 Algorithm is 1 - ceil(n/3)
        //Number of agents in a region in Constrained 3 Algorithm is 1 - ceil(n/4)
        if (algorithm == "Free Form" && (newAgents[i].length < 1 || newAgents[i].length > Math.ceil(regionArr[i].length / 2))) {
            alert("Invalid number of agents in region " + i);
            return;
        }
        else if (algorithm == "Constrained 4") {
            if (newAgents[i].length < 1 || newAgents[i].length > Math.ceil(regionArr[i].length / 4)) {
                alert("Invalid number of agents in region " + i);
                return;
            }
            else if (newAgents[i].length != 1) {//make sure all agents are at end points on the map
                var adjacentCounter = 0;
                for (var agentSearch = 0; agentSearch < newAgents.length; agentSearch++) {
                    for (var nodeSearch = 0; nodeSearch < regionArr[i].length; nodeSearch++) {
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] + 1 && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2]) {
                            adjacentCounter++;
                        }
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] - 1 && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2]) {
                            adjacentCounter++;
                        }
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2] + 1) {
                            adjacentCounter++;
                        }
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2] - 1) {
                            adjacentCounter++;
                        }
                    }
                }
                if (adjacentCounter > 1) {
                    alert("Agent in region " + i + " must be placed at endpoints");
                    return;
                }
            }
            else if (newAgents[i].length == 1) {
                var adjacentCounter = 0;
                for (var agentSearch = 0; agentSearch < newAgents.length; agentSearch++) {
                    for (var nodeSearch = 0; nodeSearch < regionArr[i].length; nodeSearch++) {
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] + 1 && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2]) {
                            adjacentCounter++;
                        }
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] - 1 && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2]) {
                            adjacentCounter++;
                        }
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2] + 1) {
                            adjacentCounter++;
                        }
                        if (regionArr[i][nodeSearch][0] == newAgents[i][agentSearch][1] && regionArr[i][nodeSearch][1] == newAgents[i][agentSearch][2] - 1) {
                            adjacentCounter++;
                        }
                    }
                }
                if (adjacentCounter > 1) {

                    var endPointCounter = 0;
                    for (var nodeSearch1 = 0; nodeSearch1 < regionArr[i].length; nodeSearch1++) {
                        endPointCounter = 0;
                        for (var nodeSearch2 = 0; nodeSearch2 < regionArr[i].length; nodeSearch2++) {
                            if (regionArr[i][nodeSearch2][0] == regionArr[i][nodeSearch1][0] + 1 && regionArr[i][nodeSearch2][1] == regionArr[i][nodeSearch1][1]) {
                                endPointCounter++;
                            }
                            if (regionArr[i][nodeSearch2][0] == regionArr[i][nodeSearch1][0] - 1 && regionArr[i][nodeSearch2][1] == regionArr[i][nodeSearch1][1]) {
                                endPointCounter++;
                            }
                            if (regionArr[i][nodeSearch2][0] == regionArr[i][nodeSearch1][0] && regionArr[i][nodeSearch2][1] == regionArr[i][nodeSearch1][1] + 1) {
                                endPointCounter++;
                            }
                            if (regionArr[i][nodeSearch2][0] == regionArr[i][nodeSearch1][0] && regionArr[i][nodeSearch2][1] == regionArr[i][nodeSearch1][1] - 1) {
                                endPointCounter++;
                            }
                        }
                        if (endPointCounter < 2) {
                            alert("Agent in region " + i + " must be placed at endpoints");
                            return;
                        }
                    }
                }
            }
        }
        else if (algorithm == "Constrained 3" && (newAgents[i].length < 1 || newAgents[i].length > Math.ceil(regionArr[i].length / 3))) {
            alert("Invalid number of agents in region " + i);
            return;
        }

    }

    if (maxSteps == 0) {
        document.getElementById("maxSteps").value = "Step " + currentSteps;
    }
    else {
        document.getElementById("maxSteps").value = "Step " + currentSteps + "/" + maxSteps;
    }

    setUpBlockView(plainMapArray, newAgents);
    setUpRegion(plainMapArray);
    toBlockView();
    showRunButtons();
}

//display buttons to run algorithm and hide buttons to upload a new file
function showRunButtons() {
    $("#fileInput").hide();
    $("#fileButton").hide();

    $("#runStepBtn").show();
    $("#stepsInput").show();
    $("#runStepsBtn").show();
    $("#newFileButton").show();
}

//clear max steps box on page reload
function clearBox() {
    document.getElementById("maxSteps").value = "";
}

//recursive function to check that all nodes in a region are connected
function validateRegion(tempArray) {
    var node1 = tempArray[0];
    tempArray.splice(0, 1);
    var nodes1 = new Array();
    var nodes2 = new Array();

    for (var i = 0; i < tempArray.length; i++) {
        if (tempArray[i][0] == node1[0] + 1 && tempArray[i][1] == node1[1]) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
        else if (tempArray[i][0] == node1[0] - 1 && tempArray[i][1] == node1[1]) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
        else if (tempArray[i][0] == node1[0] && tempArray[i][1] == node1[1] + 1) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
        else if (tempArray[i][0] == node1[0] && tempArray[i][1] == node1[1] - 1) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
    }

    for (var i = 0; i < nodes1.length; i++) {
        tempArray.splice(nodes1[i] - i, 1);
    }

    for (var i = 0; i < nodes2.length; i++) {
        tempArray = validateRegionRec(tempArray, nodes2[i]);
    }

    if (tempArray.length == 0) {
        return true;
    }
    else {
        //alert("Unconnected nodes: " + tempArray);
        return false;
    }
}
function validateRegionRec(tempArray, node1) {
    var nodes1 = new Array();
    var nodes2 = new Array();

    for (var i = 0; i < tempArray.length; i++) {
        if (tempArray[i][0] == node1[0] + 1 && tempArray[i][1] == node1[1]) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
        else if (tempArray[i][0] == node1[0] - 1 && tempArray[i][1] == node1[1]) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
        else if (tempArray[i][0] == node1[0] && tempArray[i][1] == node1[1] + 1) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
        else if (tempArray[i][0] == node1[0] && tempArray[i][1] == node1[1] - 1) {
            nodes1.push(i);
            nodes2.push(tempArray[i]);
        }
    }

    for (var i = 0; i < nodes1.length; i++) {
        tempArray.splice(nodes1[i] - i, 1);
    }

    for (var i = 0; i < nodes2.length; i++) {
        tempArray = validateRegionRec(tempArray, nodes2[i]);
    }

    return tempArray;
}

//This method moves the agents a single step when run
function run(runs) {

    //don't run if algorithm is complete
    if (finish) {
        return;
    }

    for (var n = 0; n < runs; n++) { //repeat steps n times

        //Display step counter
        currentSteps++;
        if (maxSteps == 0) {
            document.getElementById("maxSteps").value = "Step " + currentSteps;
        }
        else {
            document.getElementById("maxSteps").value = "Step " + currentSteps + "/" + maxSteps;
        }

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
            for (var k = 0; k < agents.length; k++) {//if there is an agent still going to a goal
                if (agents[k].data("region") == i) {
                    if (agents[k].data("x") != regionArr[i][agents[k].data("goal")][0] || agents[k].data("y") != regionArr[i][agents[k].data("goal")][1]) {
                        finished = false;
                    }
                }
            }

            //use astar algorithm to move
            for (var k = 0; k < agents.length; k++) {//for each agent
                if (finished == false && agents[k].data("region") == i) { //run algorithm in unfinished region


                    if (agents[k].data("x") != regionArr[i][agents[k].data("goal")][0] || agents[k].data("y") != regionArr[i][agents[k].data("goal")][1]) {
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

                        //colour square in
                        changeColor(x, y);
                    }
                }
            }

            //if the agent has made it to its goal, find a new goal.
            for (var k = 0; k < agents.length; k++) {//for each agent
                if (finished == false && agents[k].data("region") == i) { //find a goal in unfinished region
                    if (agents[k].data("x") == regionArr[i][agents[k].data("goal")][0] && agents[k].data("y") == regionArr[i][agents[k].data("goal")][1]) {

                        var newGoal = -1;

                        if (algorithm == "Free Form") {//Free Form random goal
                            var tempNum = 0;
                            for (var a = 0; a < regionArr[i].length; a++) { //for each node in the region
                                if (regionArr[i][a][3] == false && regionArr[i][a][2] == false) { //if the node isn't visited and isn't a goal
                                    var temp = Math.random();
                                    if (tempNum <= temp) { //randomly pick a new goal from the unvisited nodes
                                        newGoal = a;
                                        tempNum = temp;
                                    }
                                }
                            }
                        }
                        else if (algorithm == "Constrained 3") {//Constrained 3 Farthest Goal
                            var tempNum = 0;
                            var graph = new Graph(plainMapArray);
                            var start = graph.grid[agents[k].data("x")][agents[k].data("y")];
                            for (var a = 0; a < regionArr[i].length; a++) { //for each node in the region
                                if (regionArr[i][a][3] == false) { //if the node isn't visited
                                    var end = graph.grid[regionArr[i][a][0]][regionArr[i][a][1]];
                                    var result = astar.search(graph, start, end);
                                    var temp = result.length;
                                    if (tempNum <= temp) { //pick a goal with the longest path
                                        newGoal = a;
                                        tempNum = temp;
                                    }
                                }
                            }
                        }
                        else if (algorithm == "Constrained 4") {//Constrained 4 Next Goal
                            for (var a = regionArr[i].length - 1; a >= 0; a--) {//for each node in the region back to front
                                if (regionArr[i][a][3] == false) { //if the node isn't visited
                                    newGoal = a;
                                }
                            }
                        }

                        if (newGoal != -1) {
                            agents[k].data({ //change the agent's goal
                                "goal": newGoal
                            });

                            agents[k].data("goalArr").push(newGoal);
                            regionArr[i][newGoal][2] = true;
                        }
                    }
                }
            }


        }

        runGra(copyDirection);
        cleanNumber();
        moreThanOneAgent();

        if (maxSteps != 0 && currentSteps >= maxSteps) {
            n = runs;
            finish = true;
        }

        //if all regions are finished, end algorithm
        var finished = true;
        for (var i = 0; i < regionArr.length; i++) {
            //check if the current region has been explored fully and all agents are stopped
            for (var j = 0; j < regionArr[i].length; j++) {//if there is an unvisited node
                if (regionArr[i][j][3] == false) {
                    finished = false;
                }
            }
            for (var k = 0; k < agents.length; k++) {//if there is an agent still going to a goal
                if (agents[k].data("region") == i) {
                    if (agents[k].data("x") != regionArr[i][agents[k].data("goal")][0] || agents[k].data("y") != regionArr[i][agents[k].data("goal")][1]) {
                        finished = false;
                    }
                }
            }
        }
        if (finished || finish) {
            finish = true;
            alert("Algorithm is finished! Feel free to save your results");
        }

    }


}

//this method calls the run function n times
function runNsteps() {
    var steps = $("#steps").val();

    run(steps);
}

function generateID() {
    var chars = "123456789";
    var ID = "";
    for (x = 0; x < 6; x++) {
        var i = Math.floor(Math.random() * chars.length);
        ID += chars.charAt(i);
    }
    return ID;
}


function getCurrentDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    var hh = today.getHours();
    var mins = today.getMinutes();
    var ampm = hh >= 12 ? 'pm' : 'am';
    hh = hh % 12;
    hh = hh ? hh : 12; // the hour '0' should be '12'
    mins = mins < 10 ? '0' + mins : mins;

    if (hh < 10) {
        hh = '0' + hh
    }

    if (mins < 10) {
        mins = '0' + mins
    }

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy + " " + hh + ':' + mins + ' ' + ampm;
    return today;
}
//this method is run after the algorithm finishes by either reaching the maximum number of steps, or by having all node be visited and all agents have reached their goals
function saveRun() {
    if (!finish) {
        alert("Sorry, you must finish your run of the algorithm before saving");
        return;
    }

    var description = "Map size: " + plainMapArray.length + "x" + plainMapArray[0].length + "; ";
    description += "Max Steps: " + maxSteps + "; ";
    description += "Algorithm name: " + algorithm + "; ";
    description += $("#descriptionOfRun").val();
    var regions = [];
    for (var i in regionArr) {
        var region = {};
        var spaces = "";
        for (var j in regionArr[i]) {
            var x = regionArr[i][j][0];
            var y = regionArr[i][j][1];
            spaces += "(" + x + "," + y + ') '
        }
        region.rid = i;
        region.spaces = spaces;
        regions.push(region);
    }

    // "x": newAgents[i][j][1],
    //     "y": newAgents[i][j][2],
    //     "id": newAgents[i][j][0],
    //     "region": i,
    //     "goal": loc,
    //     "goalArr": [loc],
    //     "locArr": [start]
    var agentss = [];
    for (var m in agents) {
        var agent = {};
        agent.aid = agents[m].data("id");
        agent.rid = agents[m].data("region");
        var trackLoc = agents[m].data("locArr");
        var goalArr = agents[m].data("goalArr");
        var goal = agents[m].data("goal");
        agent.track = "";
        agent.targets = "";
        goalArr.forEach(function (goalLoc) {
            agent.targets += "(" + (regionArr[agents[i].data('region')][goalLoc][0] + 1) + "," + (regionArr[agents[i].data('region')][goalLoc][1] + 1) + ")";
        });
        trackLoc.forEach(function (trackLoc) {
            agent.track += "(" + (regionArr[agents[i].data('region')][trackLoc][0] + 1) + "," + (regionArr[agents[i].data('region')][trackLoc][1] + 1) + ")";
        });
        agentss.push(agent);
    }

    var runObj = {
        id: generateID(),
        description: description,
        date: getCurrentDate(),
        steps: currentSteps,
        regions: regions,
        agents: agentss
    }


    //Gather run information
    /*
     agents - the array of agents
     regionArr - the array of regions and nodes for those regions
     algorithm - string of the algorithm used for the run
     maxSteps - int of the maximum allowed steps, ignore if 0
     currentSteps - int of the number of steps it took to complete the algorithm
     */
    $.ajax({
        url: '/oldrun',
        method: "POST",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(runObj),////

        success: function () {
            $('#saveRun').modal('hide');
            $("#descriptionOfRun").val("");
            alert("Save successfully!")
        },
    });

    //Save information to database
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
}


//--------------------------------------graphical view------------------------------------------------------------------------------


function displayTargets(region) {
    $('#nodeInfoInGraphical').show();
    $("#targetList").text("");
    var coordinates = "";
    for (var i = 0; i < regionArr[region].length; i++) {
        if (algorithm == "free form" && regionArr[region][i][2] == false) {
            var x = regionArr[region][i][0];
            var y = regionArr[region][i][1];
            coordinates += "(" + x + "," + y + ") ";
        }
        else if (regionArr[region][i][3] == false) {
            var x = regionArr[region][i][0] + 1;
            var y = regionArr[region][i][1] + 1;
            coordinates += "(" + x + "," + y + ") ";
        }

    }
    $("#targetList").text(coordinates);

    var agentTable = $("#agentTarget");
    agentTable.empty();
    for (var j in agents) {
        if (agents[j].data("region") == currentRegionNum + "") {
            var goal = agents[j].data("goal");
            var id = agents[j].data("id");
            var goalx = regionArr[agents[j].data("region")][goal][0] + 1;
            var goaly = regionArr[agents[j].data("region")][goal][1] + 1;
            var goalString = "(" + goalx + "," + goaly + ") ";
            agentTable.append("<tr><td> Agent " + id + "</td><td>" + goalString + "</td></tr>");
        }
    }
}


//__________________________to load information of node
function queryData(x, y) {
    var numberOfAgents;
    for (var i in regionArr) {
        for (var j in regionArr[i]) {
            if (regionArr[i][j][0] == x && regionArr[i][j][1] == y) {
                numberOfAgents = regionArr[i][j][2];
            }
        }
    }
}


var coordinateArr = new Array();
function setUpRegion(tArray) {
    var container = document.getElementById('graphicalView');
    if (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    graphicalPaper = Raphael(container, tArray.length * 60, tArray[0].length * 60);
    var matrix = new Array();


    //colour nodes
    for (var i = 0; i < tArray.length; i++) {
        matrix[i] = new Array()
        for (var j = 0; j < tArray[i].length; j++) {
            var element;
            if (tArray[i][j] == 0) {
                element = graphicalPaper.rect(i * 60, j * 60, 60, 60).data("flag", 0).hide();//hide closed spaces
                element.data("flag", 0);
            } else {
                element = graphicalPaper.circle(i * 60 + 30, j * 60 + 30, 30).data("flag", 1).hide();//hide all open spaces
                element.data({x: i, y: j}).attr({"fill": "white"});
                element.dblclick(function () {
                    var x = this.data("x");
                    var y = this.data("y");
                    var flag = false;
                    var validateAgentArr = new Array();
                    for (var i in agents) {
                        if (x == agents[i].data("x") && y == agents[i].data("y")) {
                            var trackLoc = agents[i].data("locArr");
                            var goalArr = agents[i].data("goalArr");
                            var goal = agents[i].data("goal");
                            var track = "";
                            var historyGoals = "";
                            goalArr.forEach(function (goalLoc) {
                                historyGoals += "(" + (regionArr[agents[i].data('region')][goalLoc][0] + 1) + "," + (regionArr[agents[i].data('region')][goalLoc][1] + 1) + ")";
                            });
                            trackLoc.forEach(function (trackLoc) {
                                track += "(" + (regionArr[agents[i].data('region')][trackLoc][0] + 1) + "," + (regionArr[agents[i].data('region')][trackLoc][1] + 1) + ")";
                            });
                            var goalx = regionArr[agents[i].data("region")][goal][0] + 1;
                            var goaly = regionArr[agents[i].data("region")][goal][1] + 1;
                            var goals = "(" + goalx + "," + goaly + ")";
                            var agentInfor = new agentInfo(agents[i].data("id"), track, goals, historyGoals);
                            validateAgentArr.push(agentInfor);
                            flag = true;
                        }

                    }


                    if (!flag) {
                        alert("No agent is here!");
                    } else {
                        var string = "Number of agents: " + validateAgentArr.length + "\n\n";
                        validateAgentArr.forEach(function (agent) {
                            string += "Agent id: " + agent.id + "\n" + "Track: " + agent.track + "\n" + "Current target: " + agent.goal + "\n" + "History targets: " +
                                agent.historyGoal + "\n\n";
                        });
                        alert(string);
                    }
                });
                var coordinate = graphicalPaper.text(i * 60 + 18, j * 60 + 18, "(" + (i + 1) + "," + (j + 1) + ")").toFront()
                    .data({x: i, y: j})
                    .hide();
                coordinateArr.push(coordinate);
            }
            matrix[i].push(element);// push circle
        }
    }

    graphicalMapArray = matrix;


    //insert agents into graph view at positions identical to block view's agents
    for (var i = 0; i < agents.length; i++) {
        var x = agents[i].data("x");
        var y = agents[i].data("y");

        var graphAgent = graphicalPaper.rect(x * 60 + 25, y * 60 + 25, 10, 10)
            .attr({
                'stroke-width': "0",
                "fill": "red"
            })
            .data({
                "x": x,
                "y": y,
            }).hide();

        changeGraphicalColor(x, y);
        graphicalAgentsArr.push(graphAgent);
    }

}
function agentInfo(id, track, goal, historyGoal) {
    this.id = id;
    this.track = track;
    this.goal = goal;
    this.historyGoal = historyGoal;
}

function hideAllRegions() {
    for (var i in graphicalMapArray) {
        for (var j in graphicalMapArray[i]) {
            graphicalMapArray[i][j].hide();
        }
    }

    for (var i in coordinateArr) {
        coordinateArr[i].hide();
    }
}

// show the specific region by the given region id number
function showRegion(regionNum) {
    hideAllRegions();
    var region = regionArr[regionNum];
    for (var i = 0; i < region.length; i++) {
        var x = region[i][0];
        var y = region[i][1];
        // show the circles of the region
        graphicalMapArray[x][y].show();

        // show the text coordinates of this region
        for (var j in coordinateArr) {
            if (coordinateArr[j].data("x") == x && coordinateArr[j].data("y") == y) {
                coordinateArr[j].show();
            }
        }
    }

    // show the agents of the region
    for (var i in agents) {
        if (agents[i].data("region") == regionNum) {
            graphicalAgentsArr[i].show();
        } else {
            graphicalAgentsArr[i].hide();
        }
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
        }).attr({x: x * 60 + 25, y: y * 60 + 25}).toFront();
    }
    if (!isNaN(currentRegionNum)) {
        displayTargets(currentRegionNum);
    }
}


//change colour of visited circle on graph view
function changeGraphicalColor(i, j) {
    graphicalMapArray[i][j].attr("fill", "#8ffc9c"); //colour the visited circle on the graph view
}

//---------------------------------------------------get old runs from DB-----------------------------

var allOldRunsList;

function closeRunList() {
    $("#oldRun").hide();
    $("#mainView").show();
    if ($("#graphicalView").is(":visible")) {
        $("#nodeInfoInGraphical").dialog("open");
    }
}

function getAllOldRuns() {
    $("#nodeInfoInGraphical").dialog("close");
    $("#oldRun").show();
    $("#mainView").hide();
    $.ajax({
        url: "/oldruns",
        method: "GET",
        success: function (list) {
            allOldRunsList = list;
            buildOldRunTable(list);
        },
    });
}

function buildOldRunTable(list) {
    $("#tableBody").empty();
    var row;
    for (var i in list) {
        row = "<tr>" +
            "<td>" + list[i].id + "</td>" +
            "<td>" + list[i].description + "</td>" +
            "<td>" + list[i].date + "</td>" +
            "<td>" + list[i].steps + "</td>" +
            "<td><button class='btn btn-info' data-toggle='modal' data-target='#runInfo' onclick='displayRun(this.id)' id='btn" + i + "'>More</button></td>" +
            "</tr>";
        $("#tableBody").append(row);
    }
}

function displayRun(index) {
    index = index.charAt(3);
    $("#formOfRun").empty();
    var run = allOldRunsList[index];
    var id = run.id;
    buildDivOfForm('ID:', id);
    var description = run.description;
    buildDivOfForm('Description:', description);
    var date = run.date;
    buildDivOfForm('Date:', date);
    var steps = run.steps;
    buildDivOfForm('Steps:', steps);
    $("#formOfRun").append("<hr/>");
    for (var i in run.regions) {
        var rid = run.regions[i].rid;
        var spaces = run.regions[i].spaces;
        buildDivOfForm("Region " + rid + " :", spaces);
        for (var j in run.agents) {
            if (run.agents[j].rid == rid) {
                var agent = run.agents[j];
                var aid = agent.aid;
                var track = agent.track;
                var targets = agent.targets;
                buildDivOfForm("Agent " + aid, "");
                buildDivOfForm("Track:", track);
                buildDivOfForm("Targets:", targets);
            }
        }
        $("#formOfRun").append("<hr/>");

    }
}

function buildDivOfForm(key, value) {
    var form = '<div class="form-group">' +
        '<label class="col-sm-3 control-label">' + key + '</label>' +
        '<label  id="runId" class="control-label">' + value + '</label>' +
        '</div>';
    $("#formOfRun").append(form);
}

function search() {
    var query = $("#query").val();
    console.log(query)
    $.ajax({
        url: "/oldrun/condition?filter=" + query,
        method: "GET",
        success: function (list) {
            buildOldRunTable(list)
        }
    })
}