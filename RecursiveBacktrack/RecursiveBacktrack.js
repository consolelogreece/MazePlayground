let gameCanvas = document.getElementById("RecursiveBacktrackMazeCanvas");

let ctx = gameCanvas.getContext("2d");

let visualise = true;

let mazeWidth = 30;
let mazeHeight = 30;

let finalCellCoords = {x: mazeWidth - 1, y: mazeHeight - 1};

let maze = [];

const Paths = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "down",
}
let pathStack = [
    {x: 0, y:0}
];

let nCells = mazeHeight * mazeWidth;
let nVisited = 1;
function Go()
{
    for (let x = 0; x < mazeWidth; x++)
    {
        let row = [];
        for (let y = 0; y < mazeHeight; y++)
        {
            row.push({visited: false, x: x, y: y, connectedCells: [], currentPath: false})
        }

        maze.push(row)
    }

    maze[0][0].visited = true;
    maze[0][0].currentPath = true;

    setInterval(function(){ 
        if (nVisited != nCells)
        {
            StepMaze();
        }
    }, 10);
}
 

function StepMaze()
{ 
    let currentCoords = pathStack[pathStack.length - 1];

    let neighbours = GetUnvisitedNeighbours(currentCoords);

    if (neighbours.length == 0) 
    {
        let redundant = pathStack.pop();

        maze[redundant.x][redundant.y].currentPath = false;            
    }
    else
    {
        let nextNeighbour = neighbours[Math.floor(Math.random() * neighbours.length)];
        
        nextNeighbour.cell.visited = true;

        nextNeighbour.cell.currentPath = true;

        maze[currentCoords.x][currentCoords.y].connectedCells.push(nextNeighbour.dir);

        nVisited++;

        if (currentCoords.x == finalCellCoords.x && currentCoords.y == finalCellCoords.y)
        {
            // path complete
        }

        pathStack.push({x: nextNeighbour.cell.x, y: nextNeighbour.cell.y});
    }
    
    Draw(maze);
}

function GetUnvisitedNeighbours(currentCoords)
{  
    let unvisitedNeighbours = [];
    
    if (currentCoords.x >= 1)
    {
        let x = currentCoords.x - 1;
        let y = currentCoords.y;
        if (!maze[x][y].visited) unvisitedNeighbours.push({cell: maze[x][y], dir: Paths.LEFT});
    }

    if (currentCoords.x < mazeWidth - 1)
    {
        let x = currentCoords.x + 1;
        let y = currentCoords.y;
        if (!maze[x][y].visited) unvisitedNeighbours.push({cell: maze[x][y], dir: Paths.RIGHT});
    }

    if (currentCoords.y >= 1)
    {
        let x = currentCoords.x;
        let y = currentCoords.y - 1;
        if (!maze[x][y].visited) unvisitedNeighbours.push({cell: maze[x][y], dir: Paths.UP});
    }

    if (currentCoords.y < mazeHeight - 1)
    {
        let x = currentCoords.x;
        let y = currentCoords.y + 1;
        if (!maze[x][y].visited) unvisitedNeighbours.push({cell: maze[x][y], dir: Paths.DOWN});
    }

    return unvisitedNeighbours;
}

function Draw(maze)
{
    var bw = ctx.canvas.width;
    var bh = ctx.canvas.height;

    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, bw, bh);

    var cellWidth = bw / mazeWidth;
    var cellHeight = bh / mazeHeight;

    var p = 0;

    for (var x = 0; x <= bw; x += cellWidth) {
        ctx.moveTo(0.5 + x + p, p);
        ctx.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += cellHeight) {
        ctx.moveTo(p, 0.5 + x + p);
        ctx.lineTo(bw + p, 0.5 + x + p);
    }
    
    ctx.strokeStyle = "#bbb";
    ctx.stroke();

    for (let row = 0; row < mazeHeight; row++)
    {
        for (let col = 0; col < mazeWidth; col++)
        {
            let cell = maze[row][col];

            if (cell.visited)
            {
                ctx.beginPath();
                ctx.fillStyle = "cyan"
                ctx.arc((cell.x * cellWidth) + (cellWidth / 2), (cell.y * cellHeight) + (cellHeight / 2), cellWidth / 3, 0, 360);
                ctx.fill(); 
            }
            
            if (cell.currentPath)
            {
                ctx.beginPath();
                ctx.fillStyle = "green"
                ctx.arc((cell.x * cellWidth) + (cellWidth / 2), (cell.y * cellHeight) + (cellHeight / 2), cellWidth / 4, 0, 360);
                ctx.fill();
            }           

            if (cell.connectedCells.forEach(dir => {
                let fromX = 0;
                let fromY = 0;
                let toX = 0;
                let toY = 0;
                
                switch(dir)
                {                   
                    case "left":
                        fromX = row * cellWidth;
                        fromY = col * cellHeight;
                        toX = fromX;
                        toY = fromY + cellHeight;
                        break;
                    case "right":
                        fromX = (row + 1)  * cellWidth;
                        fromY = col * cellHeight;
                        toX = fromX;
                        toY = fromY + cellHeight;
                        break;
                    case "up":
                        fromX = row * cellWidth;
                        fromY = col * cellHeight;
                        toX = fromX + cellWidth;
                        toY = fromY;
                        break;
                    case "down":                        
                        fromX = row  * cellWidth;
                        fromY = (col + 1) * cellHeight;
                        toX = fromX + cellWidth;
                        toY = fromY;
                        break;
                }        

                ctx.beginPath();
                ctx.moveTo(0.5 + fromX, 0.5 + fromY);
                ctx.lineTo(0.5 + toX, 0.5 +  toY);
                ctx.strokeStyle = "#222";
                ctx.stroke();     
            }));   
        }
    }
}
