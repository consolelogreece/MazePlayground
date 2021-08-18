let gameCanvas = document.getElementById("RecursiveBacktrackMazeCanvas");

let ctx = gameCanvas.getContext("2d");

const Paths = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "down",
}

class RecursiveBacktrackMazeGen
{
    constructor(mazeHeight, mazeWidth, visualise, finalCellCoords, ctx, completedCallback){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.nCells = mazeHeight * mazeWidth;
        this.nVisited = 1;
        this.pathStack = [{x: 0, y:0}];
        this.finalCellCoords = {x: mazeWidth - 1, y: mazeHeight - 1};
        this.ctx = ctx;
        this.maze = [];
        this.visualise = true;
        this.completed = false;
        this.completedCallback = completedCallback;
        this.bw = ctx.canvas.width
        this.bh = ctx.canvas.height
        this.cellWidth = this.bw / mazeWidth;
        this.cellHeight = this.bh / mazeHeight;

        this.illustrator = new Illustrator(ctx, this.maze, mazeWidth, mazeHeight);

        for (let x = 0; x < mazeWidth; x++)
        {
            let row = [];
            for (let y = 0; y < mazeHeight; y++)
            {
                row.push({x: x, y: y, visited: false, currentPath: false, connectedCells: [] })
            }
    
            this.maze.push(row)
        }
    
        this.maze[0][0].visited = true;
        this.maze[0][0].currentPath = true;
    }

    StepMaze()
    { 
        if (this.completed) return;

        let currentCoords = this.pathStack[this.pathStack.length - 1];

        let neighbours = this.GetUnvisitedNeighbours(currentCoords);

        if (neighbours.length == 0) 
        {
            let redundant = this.pathStack.pop();

            this.maze[redundant.x][redundant.y].currentPath = false;            
        }
        else
        {
            let nextNeighbour = neighbours[Math.floor(Math.random() * neighbours.length)];
            
            nextNeighbour.cell.visited = true;

            nextNeighbour.cell.currentPath = true;

            this.maze[currentCoords.x][currentCoords.y].connectedCells.push(nextNeighbour.dir);

            this.nVisited++;

            // if (currentCoords.x == this.finalCellCoords.x && currentCoords.y == this.finalCellCoords.y)
            // {
            //     // path to end complete, can save current path as solution if you want.
            // }

            this.pathStack.push({x: nextNeighbour.cell.x, y: nextNeighbour.cell.y});
        }
        
        if (this.nVisited == this.nCells)
        {
            this.completed = true;
            this.completedCallback(this.maze, this.illustrator);
        } 

        this.Draw();
    }

    GetUnvisitedNeighbours(currentCoords)
    {  
        let unvisitedNeighbours = [];
        
        if (currentCoords.x >= 1)
        {
            let x = currentCoords.x - 1;
            let y = currentCoords.y;
            if (!this.maze[x][y].visited) unvisitedNeighbours.push({cell: this.maze[x][y], dir: Paths.LEFT});
        }

        if (currentCoords.x < this.mazeWidth - 1)
        {
            let x = currentCoords.x + 1;
            let y = currentCoords.y;
            if (!this.maze[x][y].visited) unvisitedNeighbours.push({cell: this.maze[x][y], dir: Paths.RIGHT});
        }

        if (currentCoords.y >= 1)
        {
            let x = currentCoords.x;
            let y = currentCoords.y - 1;
            if (!this.maze[x][y].visited) unvisitedNeighbours.push({cell: this.maze[x][y], dir: Paths.UP});
        }

        if (currentCoords.y < this.mazeHeight - 1)
        {
            let x = currentCoords.x;
            let y = currentCoords.y + 1;
            if (!this.maze[x][y].visited) unvisitedNeighbours.push({cell: this.maze[x][y], dir: Paths.DOWN});
        }

        return unvisitedNeighbours;
    }

    Draw()
    {   
        this.illustrator.DrawGrid();

        for (let row = 0; row < this.mazeHeight; row++)
        {
            for (let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[row][col];

                this.illustrator.DrawWallBreaks(cell);

                // this drawing phase is pretty unique to this generator so it's here instead of in illustrator.
                if (!this.completed)
                {                
                    if (cell.visited)
                    {
                        this.ctx.beginPath();
                        this.ctx.fillStyle = "cyan"
                        this.ctx.arc((cell.x * this.cellWidth) + (this.cellWidth / 2), (cell.y * this.cellHeight) + (this.cellHeight / 2), this.cellWidth / 3, 0, 360);
                        this.ctx.fill(); 
                    }
                    
                    if (cell.currentPath)
                    {
                        this.ctx.beginPath();
                        this.ctx.fillStyle = "green"
                        this.ctx.arc((cell.x * this.cellWidth) + (this.cellWidth / 2), (cell.y * this.cellHeight) + (this.cellHeight / 2), this.cellWidth / 4, 0, 360);
                        this.ctx.fill();
                    }  
                }         
            }
        }
    }
}

function Go()
{
    let maze = new RecursiveBacktrackMazeGen(10, 10, true, null, ctx, CompletedCallback)

    let interval = setInterval(function(){ 
        if (!maze.completed)
        {
            maze.StepMaze();
        }
        else
        {
            clearInterval(interval);
        }
    },10);
}

function CompletedCallback(maze, illustrator)
{
    // final draw cycle to remove dots
    illustrator.DrawGrid();

    maze.forEach(row => row.forEach(cell => illustrator.DrawWallBreaks(cell)));
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