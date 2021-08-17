let gameCanvas = document.getElementById("RecursiveBacktrackMazeCanvas");

let ctx = gameCanvas.getContext("2d");

let visualise = true;

let mazeWidth = 10;
let mazeHeight = 10;
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

    let _illustrator = new Illustrator(ctx, maze, mazeWidth, mazeHeight);

    setInterval(function(){ 
        if (nVisited != nCells)
        {
            StepMaze(_illustrator);
        }
    },1000);
}
 


function StepMaze(illustrator)
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
    
    illustrator.Draw();
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

class Illustrator
{
    constructor(ctx, maze, mazeWidth, mazeHeight)
    {
        this.maze = maze;
        this.ctx = ctx;
        this.bw = ctx.canvas.width
        this.bh = ctx.canvas.height
        this.cellWidth = this.bw / mazeWidth;
        this.cellHeight = this.bh / mazeHeight;
    }

    Draw()
    {   
        this.DrawGrid();

        for (let row = 0; row < mazeHeight; row++)
        {
            for (let col = 0; col < mazeWidth; col++)
            {
                let cell = this.maze[row][col];

                this.DrawWallBreaks(cell);

                // if (cell.visited)
                // {
                //     this.ctx.beginPath();
                //     this.ctx.fillStyle = "cyan"
                //     this.ctx.arc((cell.x * this.cellWidth) + (this.cellWidth / 2), (cell.y * this.cellHeight) + (this.cellHeight / 2), this.cellWidth / 3, 0, 360);
                //     this.ctx.fill(); 
                // }
                
                // if (cell.currentPath)
                // {
                //     this.ctx.beginPath();
                //     this.ctx.fillStyle = "green"
                //     this.ctx.arc((cell.x * this.cellWidth) + (this.cellWidth / 2), (cell.y * this.cellHeight) + (this.cellHeight / 2), this.cellWidth / 4, 0, 360);
                //     this.ctx.fill();
                // }           
            }
        }
    }

    DrawGrid()
    {

        this.ctx.fillStyle = "#222";
        this.ctx.fillRect(0, 0, this.bw, this.bh);

        

        var p = 0;

        for (var x = 0; x <= this.bw; x += this.cellWidth) {
            this.ctx.moveTo(0.5 + x + p, p);
            this.ctx.lineTo(0.5 + x + p, this.bh + p);
        }

        for (var x = 0; x <= this.bh; x += this.cellHeight) {
            this.ctx.moveTo(p, 0.5 + x + p);
            this.ctx.lineTo(this.bw + p, 0.5 + x + p);
        }
        
        this.ctx.strokeStyle = "#bbb";
        this.ctx.stroke();
    }

    DrawWallBreaks(cell)
    {
        let row = cell.x;
        let col = cell.y;

        cell.connectedCells.forEach(dir => {
            let fromX = 0;
            let fromY = 0;
            let toX = 0;
            let toY = 0;
            
            switch(dir)
            {                   
                case "left":
                    fromX = row * this.cellWidth;
                    fromY = col * this.cellHeight;
                    toX = fromX;
                    toY = fromY + this.cellHeight;
                    break;
                case "right":
                    fromX = (row + 1)  * this.cellWidth;
                    fromY = col * this.cellHeight;
                    toX = fromX;
                    toY = fromY + this.cellHeight;
                    break;
                case "up":
                    fromX = row * this.cellWidth;
                    fromY = col * this.cellHeight;
                    toX = fromX + this.cellWidth;
                    toY = fromY;
                    break;
                case "down":                        
                    fromX = row  * this.cellWidth;
                    fromY = (col + 1) * this.cellHeight;
                    toX = fromX + this.cellWidth;
                    toY = fromY;
                    break;
                }        

                this.ctx.beginPath();
                this.ctx.moveTo(0.5 + fromX, 0.5 + fromY);
                this.ctx.lineTo(0.5 + toX, 0.5 +  toY);
                this.ctx.strokeStyle = "#222";
                this.ctx.stroke();     
            });   
        
    }
}