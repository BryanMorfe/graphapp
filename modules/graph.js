
/* Contains methods, functions, and objects pertaining to graph operations and representations
 * This API may interact with objects outside of this file.
 */

function GraphRepresentation(vertices, edges) {
    this.adjList = new Array(vertices.length);
    for (var i = 0; i < vertices.length; i++)
        this.adjList[i] = new Array();
    
    for (i = 0; i < edges.length; i++) {
        this.adjList[edges[i].vertexA.id].push(edges[i].vertexB.id);
        this.adjList[edges[i].vertexB.id].push(edges[i].vertexA.id);
    }
    
    this.matrix = new Array(this.adjList.length);
    
    for (i = 0; i < this.matrix.length; i++)
        this.matrix[i] = new Array(this.matrix.length);
    
    for (i = 0; i < this.matrix.length; i++) {
        for (var j = 0; j < this.matrix.length; j++)
            for (var k = 0; k < this.adjList[i].length; k++)
                if (j == this.adjList[i][k])
                    if (this.matrix[i][j] == undefined)
                        this.matrix[i][j] = 1;
                    else
                        this.matrix[i][j] += 1;
                else if (this.matrix[i][j] == undefined)
                    this.matrix[i][j] = 0;
                    
    }

}

// Graph Functions
function vertexDegree(vertex) {
    var deg = 0;
    
    for (var i = 0; i < drawnEdges.length; i++)
        if (drawnEdges[i].vertexA.id == vertex.id || drawnEdges[i].vertexB.id == vertex.id)
            deg++;
    
    return deg;
}

function isMultigraph() {
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    for (var i = 0; i < graphRep.matrix.length; i++)
        for (var j = 0; j < graphRep.matrix.length; j++)
            if (graphRep.matrix[i][j] > 1)
                return true;
    return false;
}

function isDisconnected() {
    
    if (drawnVertices.length == 0)
        return false;
    
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    var visitedNodes = [];
        
    var randomVertex = Math.floor(Math.random() * drawnVertices.length);
    visitedNodes.push(randomVertex);
        
    var length = 1;
    for (var i = 0; i < length; i++) {
        length = addNewNeighbors(visitedNodes, graphRep.adjList, visitedNodes[i]);
    }
        
    return length < graphRep.adjList.length;
}

function convertToLineGraph() {
    drawnVertices = [];
    for (var i = 0; i < drawnEdges.length; i++) {
        var dVector = vertexDistanceVector(drawnEdges[i].vertexA, drawnEdges[i].vertexB);
        
        var pos = {"x" : drawnEdges[i].vertexA.x - dVector.x / 2, "y" : drawnEdges[i].vertexA.y - dVector.y / 2};
        
        if (snapToGrid)
            snapPosToGrid(pos);
        
        var vertex = new DrawnVertex(pos, [drawnEdges[i].vertexA.id, drawnEdges[i].vertexB.id]);
        drawnVertices.push(vertex);
    }
    
    drawnEdges = [];
    for (i = 0; i < drawnVertices.length; i++)
        for (var j = i + 1; j < drawnVertices.length; j++) {
            if (drawnVertices[i].id.includes(drawnVertices[j].id[0]) || drawnVertices[i].id.includes(drawnVertices[j].id[1]))
                drawnEdges.push(new DrawnEdge(drawnVertices[i], drawnVertices[j]));
        }
    
    reassignVerticesIds();
    clearAndRedrawGraph();
}

function isTree() {
    if (isDisconnected())
        return false;
    
    var circuits = allCircuits();
    
    for (var i = 0; i < circuits.length; i++) {
        if (circuits[i].length > 0)
            return false;
    }
    
    return true;
    
}

function addNewNeighbors(neighbors, adjList, vertex) {
    
    for (var i = 0; i < adjList[vertex].length; i++)
        if (!neighbors.includes(adjList[vertex][i]))
            neighbors.push(adjList[vertex][i]);
        
    return neighbors.length;
}

function isComplete() {
    var nVertices = drawnVertices.length;
    var nEdges = drawnEdges.length;
    return (nVertices * (nVertices - 1) == 2 * nEdges) && !isMultigraph();
}

function isStarGraph() {
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    
    var foundRoot = false;
    var ones = 0;
    
    for (var i = 0; i < graphRep.adjList.length; i++) {
        if (graphRep.adjList[i].length == graphRep.adjList.length - 1 && !foundRoot)
            foundRoot = true;
        else if (foundRoot && graphRep.adjList[i].length != 1)
            return false;
        else if (graphRep.adjList[i].length == 1)
            ones++;
    }
        
    return ones == graphRep.adjList.length - 1 && foundRoot;
}

function isEulerian() {
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    
    for (var i = 0; i < graphRep.adjList.length; i++)
        if (graphRep.adjList[i].length % 2 == 1)
            return false;
    
    return true;
}

function hasEulerTrail() {
    if (isEulerian())
        return true;
    
    var graphRep = new GraphRepresentation(drawnVertices, drawnEdges);
    var oddDegree = 0;
    for (var i = 0; i < graphRep.adjList.length; i++) {
        if (graphRep.adjList[i].length % 2 == 1)
            oddDegree++;
        if (oddDegree > 2)
            return false;
    }
    
    return oddDegree == 2;
}

function isHamiltonian() {
    
    if (isDisconnected())
        return false;
    
    var circuits = allCircuits(function(arr) {
        var unique = arr.filter(onlyUnique);
        return unique.length - 1 == arr.length;
    });
    
    return circuits.length > 0;
}

function hasHamilPath() {
    
    if (isDisconnected())
        return false;
    
    var paths = allPaths(function(arr) {
        var unique = arr.filter(onlyUnique);
        return (arr[0] == arr[arr.length - 1] && unique.length == arr.length - 1) || unique.length == arr.length;
    }, function(arr) {
        var unique = arr.filter(onlyUnique);
        return (arr[0] == arr[arr.length - 1] && unique.length == arr.length - 1) || unique.length == arr.length;
    });
    
    return paths.length > 0;
}

function isBipartite() {
    
    if (isDisconnected())
        return false;
    
    var circuits = allCircuits();
    
    for (var i = 0; i < circuits.length; i++) {
        if ((circuits[i].length - 1) % 2 != 0)
            return false;
    }
    
    return true;
    
}

function getChromaticColoring() {
    
    if (drawnEdges.length == 0)
        return 1;
    
    var colorMap = new Array(drawnVertices.length).fill(0);
    var adjList = new GraphRepresentation(drawnVertices, drawnEdges).adjList;
    
    for (var i = 0; i < adjList.length; i++)
        colorMap[i] = lowestAvailable(colorMap, adjList[i]);
    
    return colorMap;
    
}

function lowestAvailable(colorMap, vertexNeighbors) {
    var lowestAvailableColor = 1;
    var found = true;
    
    while (found) {
        found = false;
        for (var i = 0; i < vertexNeighbors.length; i++) {
            if (colorMap[vertexNeighbors[i]] == lowestAvailableColor) {            
                found = true;
                lowestAvailableColor++;
            }
        }
    }
    
    return lowestAvailableColor;
}

function getChromaticNum() {
    
    var largest = 0;
    var colorMap = getChromaticColoring();
    
    for (var i = 0; i < colorMap.length; i++)
        if (colorMap[i] > largest)
            largest = colorMap[i];
    
    return largest;
}

function allPaths(filter, stoppingCondition) {
    // WARNING: This algorithm is NP Complete O(n!)
    
    var adjList = (new GraphRepresentation(drawnVertices, drawnEdges)).adjList;
    var paths = [];
    
    for (var i = 0; i < adjList.length; i++) {
        paths.push(recursiveTraversal(adjList, i));
    }
    
    return paths;
}

function recursiveTraversal(adjList, startingIndex) {
    
    var partialTraversal = [startingIndex];
    
    for (var i = 0; i < adjList[startingIndex]; i++) {
        partialTraversal.push(adjList[startingIndex][i]);
        recursiveTraversal(adjList, adjList[startingIndex][i]);
    }
    
    return partialTraversal;
}

function allCircuits(stoppingCondition) {
    
    // WARNING: This algorithm is NP Complete O(n!)
    return allPaths(function(arr) {
        return arr[0] == arr[arr.length - 1];
    }, stoppingCondition);
}
    
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function hamiltonianPath() {
    allPaths(null, function(arr) {
        var unique = arr.filter(onlyUnique);
        return unique.length == arr.length;
    });
}

// Below is Fleury's Algorithm stuff

function eulerianTrail() {
    
    // This function uses Fleury's Algorithm
    
    var vertices = drawnVertices.slice();
    var edges = drawnEdges.slice();
    
    var currentVertex = randomVertex(vertices);
    var currentTrail = [currentVertex.id];
        
    while (edges.length > 0) {
                
        // Incident edge selection
        var edge = incidentEdge(currentVertex, edges, vertices);
        
        // No incident edge found, so return empty trail!
        if (edge == null)
            return [];
        
        var currentVertexId = currentVertex.id;
        
        var oldVertex = currentVertex;
        
        // Select the other end of the edge
        if (edge.vertexA === currentVertex)
            currentVertex = edge.vertexB;
        else
            currentVertex = edge.vertexA;
        
        // Add the edge to the current trail
        currentTrail.push(currentVertex.id);
        
        // Remove edge from graph G
        edges.splice(edges.indexOf(edge), 1);
        
        // Remove vertex if became isolated after edge removal
        if (isVertexIsolated(oldVertex, edges))
            vertices.splice(vertices.indexOf(oldVertex), 1);
        
        
    }
    
    return edges.length > 0 ? [] : currentTrail;
    
}

function randomVertex(vertices) {
    return vertices[Math.floor(Math.random() * vertices.length)];
}

function isVertexIsolated(vertex, edges) {
    return vertexDegreeStruct(vertex, edges) == 0;
}

function vertexDegreeStruct(vertex, edges) {
    var degree = 0;
    
    for (var i = 0; i < edges.length; i++) {
        if (isIncident(vertex, edges[i]))
            degree++;
    }
    
    return degree;
}

function incidentEdge(vertex, edges, vertices) {
    var lastBridge = null;
    
    for (var i = 0; i < edges.length; i++) {
        if (isIncident(vertex, edges[i])) {
            if (isBridge(edges[i], edges, vertices))
                lastBridge = edges[i];
            else
                return edges[i];
        }
    }
    
    return lastBridge;
}
    
function isIncident(vertex, edge) {
    return edge.vertexA == vertex || edge.vertexB == vertex;
}

function isBridge(edge, edges, vertices) {
    
    // Remove edge (from a COPY of edges)
    var edgesCopy = edges.slice();
    edgesCopy.splice(edgesCopy.indexOf(edge), 1);
    
    // Check if graph is disconnected after removing the edge
    if (vertices.length == 0)
        return false;
    
    var visitedNodes = [];
        
    var randomVertex = vertices[Math.floor(Math.random() * vertices.length)];
    visitedNodes.push(randomVertex);
        
    var length = 1;
    for (var i = 0; i < length; i++)
        length = addNewNeighborsStruct(visitedNodes, edgesCopy, visitedNodes[i]);
        
    return length < vertices.length;
}

function addNewNeighborsStruct(neighbors, edges, vertex) {
    
    for (var i = 0; i < edges.length; i++) {
        if (edges[i].vertexA == vertex && !neighbors.includes(edges[i].vertexB))
            neighbors.push(edges[i].vertexB);
        else if (edges[i].vertexB == vertex && !neighbors.includes(edges[i].vertexA))
            neighbors.push(edges[i].vertexA);
    }
        
    return neighbors.length;
}

