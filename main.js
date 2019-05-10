
/* Contains main code, document traversal and creation, action settings
 * This API may interact with objects outside of this file.
 */


var canvas, w, h, context, lineWidth, vertexSize, minVertexDistance;
var drawingMode, showGrid, nGridDivisions, vertexSelected, snapToGrid, dragMode;
var drawnVertices = new Array();
var drawnEdges = new Array();

function init() {
    canvas = document.getElementById("drawing-canvas");
    w = canvas.width;
    h = canvas.height;
    context = canvas.getContext("2d");
    
    vertexSize = 7;
    lineWidth = 2;
    minVertexDistance = 30;
    
    drawingMode = true;
    showGrid = true;
    nGridDivisions = 20;
    snapToGrid = true;
    dragMode = false;
    
    vertexSelected = false;
    
    canvas.addEventListener("mousemove", mouseMoved);
    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("click", canvasClicked);
    
    window.addEventListener("keyup", keyPressedHandler);
    
    drawGrid();
}

// Handlers
function keyPressedHandler(event) {
        
    switch(event.keyCode) {
        case 67: // c -> clear
            popConfirmWindow("Are you sure you want to clear the graph?", clearGraph);
            break;
        /*case 68: // d -> Drawing mode
            drawingMode = true;
            break;
        case 69: // e -> Erase mode
            drawingMode = false;
            break; */
    }
}

function canvasClicked(event) {
    
    var mousePos = calcMousePos(event);
    
    var clickedVertex = isOnVertex(mousePos);
    var clickedEdge = isOnEdge(mousePos);
        
    if (clickedVertex !== null) {
        if (drawingMode) {
            var edgeDrawn = false;
            if (vertexSelected) {
                for (var i = 0; i < drawnVertices.length && !edgeDrawn; i++) {
                    if (drawnVertices[i].selected) {
                        drawnVertices[i].selected = false;
                        vertexSelected = false;
                        drawnVertices[i].color = "black";
                        drawEdge(drawnVertices[i], clickedVertex);
                        clearAndRedrawGraph();
                        edgeDrawn = true;
                    }
                }
            } else {
            
                if (!edgeDrawn) {
                    clickedVertex.selected = true;
                    vertexSelected = true;
                    clickedVertex.color = "green";
                    clearAndRedrawGraph();
                }
            }
            
        } else {
            popConfirmWindow("Are you sure you want to delete this vertex?", function() { 
                eraseVertexAndIncidentEdges(clickedVertex);
                updateProperties();
            });
            
        }
        
    } else if (vertexSelected) {
        for (i = 0; i < drawnVertices.length && vertexSelected; i++)
            if (drawnVertices[i].selected) {
                drawnVertices[i].selected = false;
                vertexSelected = false;
            }
    } else if (clickedEdge !== null) {
        if (!drawingMode) {
            popConfirmWindow("Are you sure you want to delete this edge?", function() { 
                eraseEdge(clickedEdge);
                updateProperties();
            });
        }
        
    } else if (drawingMode) drawVertexAt(mousePos);
    
    updateProperties();
}

function mouseMoved(event) {
    var pos = calcMousePos(event);
    document.getElementById("canvas-coords").innerHTML = "" + pos.x / w + ", " + pos.y / h;
    
    var vertex = isOnVertex(pos);
    
    if (dragMode && vertex !== null) {
        vertex.x = pos.x;
        vertex.y = pos.y;
        clearAndRedrawGraph();
    }
    
    var edge = isOnEdge(pos);
    if (vertex != null) {
        if (dragMode)
            document.getElementById("canvas-mode").innerHTML = "Drag Mode";
        else if (drawingMode)
            document.getElementById("canvas-mode").innerHTML = "Vertex: " + vertex.id + ", degree: " + vertexDegree(vertex);
        else
            document.getElementById("canvas-mode").innerHTML = "Erase vertex " + vertex.id + "?";
    } else if (edge != null && !drawingMode) {
        document.getElementById("canvas-mode").innerHTML = "Erase edge {" + edge.vertexA.id + ", " + edge.vertexB.id + "}" + "?";
    } else {
        document.getElementById("canvas-mode").innerHTML = drawingMode ? "Drawing Mode" : "Erase Mode";
    }
}

function mouseDown(event) {
    var pos = calcMousePos(event);
    var draggingVertex = isOnVertex(pos);
    if (!dragMode && draggingVertex !== null && !vertexSelected)
        dragMode = true;
}

function mouseUp(event) {
    if (dragMode)
        dragMode = false;
}

// Graph Property Updates
function updateProperties() {
    document.getElementById("n-vertices").innerHTML = drawnVertices.length;
    document.getElementById("n-edges").innerHTML = drawnEdges.length;
    document.getElementById("multigraph").innerHTML = isMultigraph();
    document.getElementById("disconnected").innerHTML = isDisconnected();
    document.getElementById("complete").innerHTML = isComplete();
    document.getElementById("eulerian").innerHTML = isEulerian();
    document.getElementById("euler-trail").innerHTML = hasEulerTrail();
    document.getElementById("hamil-trail").innerHTML = "Click Here";
    document.getElementById("hamiltonian").innerHTML = "Click Here";
    document.getElementById("tree").innerHTML = "Click Here";
    document.getElementById("bipartite").innerHTML = "Click Here";
    document.getElementById("chromatic-n").innerHTML = getChromaticNum();
    document.getElementById("star-graph").innerHTML = isStarGraph();
}

// Extra

function buildAdjListText() {
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    var text = "";
    for (var i = 0; i < graphRep.adjList.length; i++) {
        text += i;
        text += " " + Math.round(100 * drawnVertices[i].x / w) / 100;
        text += " " + Math.round(100 * drawnVertices[i].y / h) / 100;
        for (var j = 0; j < graphRep.adjList[i].length; j++)
            text += " " + graphRep.adjList[i][j];
        text += "\n";
    }
    return text;
}

function downloadAdjList() {
    
    var text = buildAdjListText();
    download("adj_list.txt", text);
}

function buildGraphMatrixText() {
    
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    var text = "";
    for (var i = 0; i < graphRep.matrix.length; i++) {
        for (var j = 0; j < graphRep.matrix.length; j++)
            text += graphRep.matrix[i][j] + " ";
        text = text.substring(0, text.length - 1);
        text += "\n";
    }
    
    return text;
}

function downloadGraphMatrix() {
    
    var text = buildGraphMatrixText();
    download("graph_matrix.txt", text);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function popMessageWindow(msg) {
    var background = document.createElement("div");
    background.style = "background-color: rgba(0, 0, 0, 0.4); width: 100%; height: 100%; position: absolute; top: 0; left: 0";
    background.innerHTML = " ";
    document.body.appendChild(background);
    
    var messageWindow = document.createElement("div");
    messageWindow.className = "messageWindow";
    document.body.appendChild(messageWindow);
    
    var closeBtn = document.createElement("button");
    closeBtn.className = "closeIcon";
    closeBtn.innerHTML = "&times;";
    messageWindow.appendChild(closeBtn);
    
    var content = document.createElement("div");
    content.className = "content";
    messageWindow.appendChild(content);
    
    var text = document.createElement("p");
    text.className = "message";
    text.innerHTML = msg;
    content.appendChild(text);
    
    closeBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
    });
    
}

function lineGraphConfirm() {
    var background = document.createElement("div");
    background.style = "background-color: rgba(0, 0, 0, 0.4); width: 100%; height: 100%; position: absolute; top: 0; left: 0";
    background.innerHTML = " ";
    document.body.appendChild(background);
    
    var messageWindow = document.createElement("div");
    messageWindow.className = "messageWindow";
    document.body.appendChild(messageWindow);
    
    var closeBtn = document.createElement("button");
    closeBtn.className = "closeIcon";
    closeBtn.innerHTML = "&times;";
    messageWindow.appendChild(closeBtn);
    
    var content = document.createElement("div");
    content.className = "content";
    messageWindow.appendChild(content);
    
    var text = document.createElement("p");
    text.className = "message";
    text.innerHTML = "Converting to a line graph will destroy the current graph. Get";
    content.appendChild(text);
    
    var adjList = document.createElement("button");
    adjList.className = "confirmBtn";
    adjList.innerHTML = "Adjancency List";
    content.appendChild(adjList);
    
    var graphMatrix = document.createElement("button");
    graphMatrix.className = "confirmBtn";
    graphMatrix.innerHTML = "Graph Matrix";
    content.appendChild(graphMatrix);
    
    var confirmBtn = document.createElement("button");
    confirmBtn.className = "confirmBtn";
    confirmBtn.innerHTML = "Convert";
    content.appendChild(confirmBtn);
    
    closeBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
    });
    
    graphMatrix.addEventListener("click", function() {
        downloadGraphMatrix();
    });
    
    adjList.addEventListener("click", function() {
        downloadAdjList();
    });
    
    confirmBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
        convertToLineGraph();
        updateProperties();
    });
}

function popConfirmWindow(msg, action) {
    var background = document.createElement("div");
    background.style = "background-color: rgba(0, 0, 0, 0.4); width: 100%; height: 100%; position: absolute; top: 0; left: 0";
    background.innerHTML = " ";
    document.body.appendChild(background);
    
    var messageWindow = document.createElement("div");
    messageWindow.className = "messageWindow";
    document.body.appendChild(messageWindow);
    
    var closeBtn = document.createElement("button");
    closeBtn.className = "closeIcon";
    closeBtn.innerHTML = "&times;";
    messageWindow.appendChild(closeBtn);
    
    var content = document.createElement("div");
    content.className = "content";
    messageWindow.appendChild(content);
    
    var text = document.createElement("p");
    text.className = "message";
    text.innerHTML = msg;
    content.appendChild(text);
    
    var confirmBtn = document.createElement("button");
    confirmBtn.className = "confirmBtn";
    confirmBtn.innerHTML = "Yes";
    content.appendChild(confirmBtn);
    
    closeBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
    });
    
    confirmBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
        action();
    });
    
}

function popDownloadField(isAdjList) {
    var background = document.createElement("div");
    background.style = "background-color: rgba(0, 0, 0, 0.4); width: 100%; height: 100%; position: absolute; top: 0; left: 0";
    background.innerHTML = " ";
    document.body.appendChild(background);
    
    var messageWindow = document.createElement("div");
    messageWindow.className = "messageWindow";
    document.body.appendChild(messageWindow);
    
    var closeBtn = document.createElement("button");
    closeBtn.className = "closeIcon";
    closeBtn.innerHTML = "&times;";
    messageWindow.appendChild(closeBtn);
    
    var content = document.createElement("div");
    content.className = "content";
    messageWindow.appendChild(content);
    
    var inp = document.createElement("textarea");
    inp.value = isAdjList ? buildAdjListText() : buildGraphMatrixText();
    inp.className = "graph-textarea";
    inp.readOnly = true;
    content.appendChild(inp);
    
    var confirmBtn = document.createElement("button");
    confirmBtn.className = "confirmBtn";
    confirmBtn.innerHTML = "Download";
    content.appendChild(confirmBtn);
    
    closeBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
    });
    
    confirmBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
        isAdjList ? downloadAdjList() : downloadGraphMatrix();
    });
}

function popInputGraph() {
    var background = document.createElement("div");
    background.style = "background-color: rgba(0, 0, 0, 0.4); width: 100%; height: 100%; position: absolute; top: 0; left: 0";
    background.innerHTML = " ";
    document.body.appendChild(background);
    
    var messageWindow = document.createElement("div");
    messageWindow.className = "messageWindow";
    document.body.appendChild(messageWindow);
    
    var closeBtn = document.createElement("button");
    closeBtn.className = "closeIcon";
    closeBtn.innerHTML = "&times;";
    messageWindow.appendChild(closeBtn);
    
    var content = document.createElement("div");
    content.className = "content";
    messageWindow.appendChild(content);
    
    var inp = document.createElement("textarea");
    inp.className = "graph-textarea";
    inp.placeholder = "Enter Adjacency List";
    content.appendChild(inp);
    
    var confirmBtn = document.createElement("button");
    confirmBtn.className = "confirmBtn";
    confirmBtn.innerHTML = "Enter Graph";
    content.appendChild(confirmBtn);
    
    closeBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
    });
    
    confirmBtn.addEventListener("click", function() {
        document.body.removeChild(messageWindow);
        document.body.removeChild(background);
        adjListTextToGraph(inp.value);
        clearAndRedrawGraph();
        updateProperties();
    });
}

window.onload = function() {
    
    init();
    
    document.getElementById("canvas-mode").innerHTML = drawingMode ? "Drawing Mode" : "Erase Mode";
    
    var drawModeBtn = document.getElementById("draw-mode");
    var showGridBtn = document.getElementById("show-grid");
    var snapGridBtn = document.getElementById("snap-grid");
    
    drawModeBtn.addEventListener("click", function() {
        drawModeBtn.classList.toggle("on");
        drawModeBtn.classList.toggle("off");
        drawingMode = !drawingMode;
        
        document.getElementById("canvas-mode").innerHTML = drawingMode ? "Drawing Mode" : "Erase Mode";
    });
    
    
    showGridBtn.addEventListener("click", function() {
        showGridBtn.classList.toggle("on");
        showGridBtn.classList.toggle("off");
        showGrid = !showGrid;
        
        if (snapToGrid) {
            snapGridBtn.classList.toggle("on");
            snapGridBtn.classList.toggle("off");
            snapToGrid = !snapToGrid;
        }
        
        clearAndRedrawGraph();
    });
    
    
    snapGridBtn.addEventListener("click", function() {
        snapGridBtn.classList.toggle("on");
        snapGridBtn.classList.toggle("off");
        snapToGrid = !snapToGrid;
    });
    
    document.getElementById("clear-graph").addEventListener("click", function() {
        popConfirmWindow("Are you sure you want to clear the graph?", clearGraph);
    });
    
    document.getElementById("line-graph").addEventListener("click", function() {
        lineGraphConfirm();
    });
    
    document.getElementById("input-graph").addEventListener("click", function() {
        popInputGraph();
    });
    
    document.getElementById("adj-list").addEventListener("click", function() {
        popDownloadField(true);
    });
    
    document.getElementById("graph-matrix").addEventListener("click", function() {
        popDownloadField(false);
    });
    
    document.getElementById("get-euler-trail").addEventListener("click", function() {
        var trail = eulerianTrail();
        var str = trail.join(" > ");
        popMessageWindow(str);
    });
    
    document.getElementById("get-coloring").addEventListener("click", function() {
        var colorMap = getChromaticColoring();
        var textArray = [];
        for (var i = 0; i < colorMap.length; i++) {
            textArray.push(i + ": " + colorMap[i]);
        }
        
        var text = textArray.join(", ");
        popMessageWindow(text);
        
    });
    
    document.getElementById("get-hamil-path").addEventListener("click", function() {
        popMessageWindow("Not implemented.");
    });
    
    document.getElementById("bipartite").addEventListener("click", function() {
        this.innerHTML = isBipartite();
    });
    
    document.getElementById("hamil-trail").addEventListener("click", function() {
        this.innerHTML = hasHamilPath();
    });
    
    document.getElementById("hamiltonian").addEventListener("click", function() {
        this.innerHTML = isHamiltonian();
    });
    
    document.getElementById("tree").addEventListener("click", function() {
        this.innerHTML = isTree();
    });
    
};
