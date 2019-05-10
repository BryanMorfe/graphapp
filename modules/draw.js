
/* Contains functions, methods, and objects used for drawing
 * This API may interact with objects outside of this file.
 */

function DrawnVertex(position, id) {
    this.width = vertexSize * 2;
    this.height = vertexSize * 2;
    this.x = position.x;
    this.y = position.y;
    this.selected = false;
    this.id = id;
    this.color = "black";
}

function DrawnEdge(vertexA, vertexB) {
    this.vertexA = vertexA;
    this.vertexB = vertexB;
    this.color = "black";
    this.selected = false;
}


function calcMousePos(event) {
    
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    
    var mousePos = {"x" : x, "y" : y};
    
    if (snapToGrid && drawingMode) {
        snapPosToGrid(mousePos);
    }
    
    return mousePos;
}

function snapPosToGrid(pos) {
    var fitW = w / nGridDivisions;
    var fitH = h / nGridDivisions;
    pos.x = fitW * Math.round(pos.x / fitW);
    pos.y = fitH * Math.round(pos.y / fitH);
}

// Drawing functions

function drawVertexAt(position) {
    
    var drawnVertex = new DrawnVertex(position, drawnVertices.length);
    
    for (var i = 0; i < drawnVertices.length; i++) {
        if (vertexDistanceMagnitude(drawnVertex, drawnVertices[i]) <= minVertexDistance) {
            alert("Vertex drawn too close!");
            return;
        }
    }
    
    context.beginPath();
    context.arc(position.x, position.y, vertexSize, 0, 2 * Math.PI);
    context.fillStyle = drawnVertex.color;
    context.fill();
    context.font = "14px Gill Sans";
    context.fillText(drawnVertex.id, drawnVertex.x - 8, drawnVertex.y - 8);
    drawnVertices.push(drawnVertex);
}

function drawEdge(vA, vB) {
    context.beginPath();
    context.moveTo(vA.x, vA.y);
    context.lineTo(vB.x, vB.y);
    context.lineWidth = lineWidth;
    context.strokeStyle = "black";
    context.stroke();
    drawnEdges.push(new DrawnEdge(vA, vB));
}

function drawGrid() {
    
    var fitW = (w / nGridDivisions);
    var fitH = (h / nGridDivisions);
    
    for (var i = 1; i < nGridDivisions; i++) {
        
        context.beginPath();
        context.moveTo(i * fitW, 0);
        context.lineTo(i * fitW, h);
        context.lineWidth = 1;
        context.strokeStyle = "#d0d0d0";
        context.stroke();
        
        context.beginPath();
        context.moveTo(0, fitH * i);
        context.lineTo(w, fitH * i);
        context.lineWidth = 1;
        context.strokeStyle = "#d0d0d0";
        context.stroke();
    }
}

function eraseVertexAndIncidentEdges(drawnVertex) {
    var found = false;
    for (var i = 0; i < drawnVertices.length && !found; i++) {
        if (drawnVertex === drawnVertices[i]) {
            found = true;
            drawnVertices.splice(i, 1);
            var length = drawnEdges.length;
            for (var j = 0; j < length; j++) {
                if (drawnEdges[j].vertexA == drawnVertex || drawnEdges[j].vertexB == drawnVertex) {
                    drawnEdges.splice(j, 1);
                    j--;
                    length--;
                }
            }
        }
    }
    
    if (found) {
        reassignVerticesIds();
        clearAndRedrawGraph();
    }
}

function eraseEdge(drawnEdge) {
    var found = false;
    for (var i = 0; i < drawnEdges.length && !found; i++) {
        if (drawnEdge === drawnEdges[i]) {
            found = true;
            drawnEdges.splice(i, 1);
        }
    }
    
    if (found) {
        reassignVerticesIds();
        clearAndRedrawGraph();
    }
}

function reassignVerticesIds() {
    for (var i = 0; i < drawnVertices.length; i++)
        drawnVertices[i].id = i;
}

function isOnVertex(position) {
    
    for (var i = 0; i < drawnVertices.length; i++) {
        if ((position.x >= drawnVertices[i].x - drawnVertices[i].width / 2 && position.x <= drawnVertices[i].x + drawnVertices[i].width / 2) &&
           (position.y >= drawnVertices[i].y - drawnVertices[i].height / 2 && position.y <= drawnVertices[i].y + drawnVertices[i].height / 2)) {
            return drawnVertices[i];
        }
    }
    
    return null;
}


function isOnEdge(position) {
        
    for (var i = 0; i < drawnEdges.length; i++) {
        var slope = (drawnEdges[i].vertexB.y - drawnEdges[i].vertexA.y) / (drawnEdges[i].vertexB.x - drawnEdges[i].vertexA.x);
        var b = drawnEdges[i].vertexA.y - slope * drawnEdges[i].vertexA.x;
        var edgeY = Math.round(slope * position.x + b);
        
        var resolution = 5;
        
        if (edgeY <= position.y + resolution && edgeY >= position.y - resolution)
            return drawnEdges[i];
    }
    
    return null;
}

function vertexDistanceMagnitude(vA, vB) {
    return Math.sqrt(Math.pow(vA.x - vB.x, 2) + Math.pow(vA.y - vB.y, 2));
}

function vertexDistanceVector(vA, vB) {
    return {"x" : vA.x - vB.x, "y" : vA.y - vB.y};
}

function clearGraph() {
    context.clearRect(0, 0, w, h);
    drawnVertices = [];
    drawnEdges = [];
    updateProperties();
    if (showGrid)
        drawGrid();
}

function clearAndRedrawGraph() {
    
    context.clearRect(0, 0, w, h);
    
    if (showGrid)
        drawGrid();
    
    // Draw all vertices
    for (var i = 0; i < drawnVertices.length; i++) {
        context.beginPath();
        context.arc(drawnVertices[i].x, drawnVertices[i].y, vertexSize, 0, 2 * Math.PI);
        context.fillStyle = drawnVertices[i].color;
        context.fill();
        context.font = "14px Gill Sans";
        context.fillText(drawnVertices[i].id, drawnVertices[i].x - 8, drawnVertices[i].y - 8);
    }
    
    // Drawn all edges
    for (i = 0; i < drawnEdges.length; i++) {
        context.beginPath();
        context.moveTo(drawnEdges[i].vertexA.x, drawnEdges[i].vertexA.y);
        context.lineTo(drawnEdges[i].vertexB.x, drawnEdges[i].vertexB.y);
        context.lineWidth = lineWidth;
        context.strokeStyle = drawnEdges[i].color;
        context.stroke();
    }
    
}

function adjListTextToGraph(text) {
    
    drawnVertices = [];
    drawnEdges = [];
    
    var arr = text.split("\n");
    var neighbors = new Array();
    for (var i = 0; i < arr.length; i++) {
        var temp = arr[i].split(" ");
        var pos = {"x" : parseFloat(temp[1]) * w, "y" : parseFloat(temp[2]) * h};
        drawnVertices.push(new DrawnVertex(pos, parseInt(temp[0])));
        neighbors.push(temp.splice(3));
    }
    
    var edgePairs = [];
    
    drawnVertices.sort(function(a, b) { return a.id > b.id; });
    
    for (i = 0; i < neighbors.length; i++) {
        for (var j = 0; j < neighbors[i].length; j++) {
            var pairA = i + neighbors[i][j];
            var pairB = neighbors[i][j] + i;
            if (!edgePairs.includes(pairA) && !edgePairs.includes(pairB)) {
                edgePairs.push(pairA);
                edgePairs.push(pairB);
                drawnEdges.push(new DrawnEdge(drawnVertices[i], drawnVertices[parseInt(neighbors[i][j])]));
            }
        }
    }
    
}
