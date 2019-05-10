# Documentation

## Index
- [Launching The App](https://github.com/BryanMorfe/graphapp/blob/master/DOCUMENTATION.md#launching-the-app)
- [File Index](https://github.com/BryanMorfe/graphapp/blob/master/DOCUMENTATION.md#file-index)
- [Algorithm Descriptions](https://github.com/BryanMorfe/graphapp/blob/master/DOCUMENTATION.md#algorithm-descriptions)
- [How To Use](https://github.com/BryanMorfe/graphapp/blob/master/DOCUMENTATION.md#how-to-use)

## Launching the app
The most up to date app is located at https://bryanmorfe.com/apps/graph/, however, you want to run the app from you computer (offline), you can just open the "index.html" with a web browser.

## File Index
There are five main files that make this application tick; index.html, main.css, main.js, modules/graph.js, and modules/draw.js.  
There are files that are **irrelevant** to how the web application works. Those files are marked with an *(I)* next their name in the descriptions below. There are files that **irrelevant** to how the graph functions work. Those files are marked with a *(S)* next to their name in the description below.  

### index.html (I)
This is the HTML document and it simply contains the structure of the web application. If you are interested **only** in how graph functions work, you can safely ignore this file.  

### main.css (I)
This is the stylesheet of the HTML document. This file contains the styling of the web app, in other words, how it looks, and how elements are positioned. If you are interested **only** in how graph functions work, you can safely ignore this file.  

### main.js (S)
This file contains the main calls that start the application. It also contains helper functions that provide additional functionality such as downloading adjacency list/matrix, displaying information, and updating the HTML document.  

### modules/draw.js
This file contains the code necessary for the drawing of the graphs. Its main functions consist of operations such as drawing the vertices and edges, removing vertices and edges, and some of the graph drawing options such as drawing the grid, snap to grid, etc.

### modules/graph.js
This file contains the main code for the graph functions. It includes operations such as determining the degree of a vertex, chromatic number, finding paths, among other properties about the graph. If you interested in how the graph functions works, you must check this file.

## Algorithm Descriptions

### Fleury's Algorithm

### Checking for Bridge

### Checking for Disconnected Graphs

### Checking for Multigraphs

### Converting Graph to Line Graph

### Checking for Tree graphs

### Checking for Complete Graphs

### Checking for Star Graphs

### Checking for Eulerian Graphs

### Checking for Eulerian Trials

### Checking for Hamiltonian Graphs

### Checking for Hamiltonian Paths

### Checking for Bipartite Graphs

### Checking for Chromatic Number

### Getting a Chromatic Coloring

### Getting Hamiltonian Paths

## How To Use
To be writted.

