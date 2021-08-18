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
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords, completedCallback){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.nCells = mazeHeight * mazeWidth;
        this.nVisited = 1;
        this.pathStack = [{row: 0, col:0}];
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.completed = false;
        this.completedCallback = completedCallback;

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, visited: false, currentPath: false, connectedCells: [] })
            }
    
            this.maze.push(mazeRow)
        }
    
        this.maze[0][0].visited = true;
        this.maze[0][0].currentPath = true;
    }

    GetFormattedMaze()
    {
        return this.maze.map(row => {
            return row.map(cell => {
                return {row: cell.row, col: cell.col, connectedCells: cell.connectedCells};
            });
        })
    }

    StepMaze()
    { 
        if (this.completed) return;

        let currentCoords = this.pathStack[this.pathStack.length - 1];
        
        let neighbours = this.GetUnvisitedNeighbours(currentCoords);

        if (neighbours.length == 0) 
        {
            let redundant = this.pathStack.pop();

            this.maze[redundant.row][redundant.col].currentPath = false;            
        }
        else
        {
            let nextNeighbour = neighbours[Math.floor(Math.random() * neighbours.length)];
            
            nextNeighbour.cell.visited = true;

            nextNeighbour.cell.currentPath = true;

            this.maze[currentCoords.row][currentCoords.col].connectedCells.push(nextNeighbour.dir);

            this.nVisited++;

            // if (currentCoords.row == this.finalCellCoords.row && currentCoords.col == this.finalCellCoords.col)
            // {
            //     // path to end complete, can save current path as solution if you want.
            // }

            this.pathStack.push({row: nextNeighbour.cell.row, col: nextNeighbour.cell.col});
        }
        
        if (this.nVisited == this.nCells)
        {
            this.completed = true;
            this.completedCallback(this.GetFormattedMaze());
        }
    }

    GetUnvisitedNeighbours(currentCoords)
    {  
        let unvisitedNeighbours = [];
        
        if (currentCoords.col >= 1)
        {
            let col = currentCoords.col - 1;
            let row = currentCoords.row;
            if (!this.maze[row][col].visited) unvisitedNeighbours.push({cell: this.maze[row][col], dir: Paths.LEFT});
        }

        if (currentCoords.col < this.mazeWidth - 1)
        {
            let col = currentCoords.col + 1;
            let row = currentCoords.row;
            if (!this.maze[row][col].visited) unvisitedNeighbours.push({cell: this.maze[row][col], dir: Paths.RIGHT});
        }

        if (currentCoords.row >= 1)
        {
            let col = currentCoords.col;
            let row = currentCoords.row - 1;
            if (!this.maze[row][col].visited) unvisitedNeighbours.push({cell: this.maze[row][col], dir: Paths.UP});
        }

        if (currentCoords.row < this.mazeHeight - 1)
        {
            let col = currentCoords.col;
            let row = currentCoords.row + 1;
            if (!this.maze[row][col].visited) unvisitedNeighbours.push({cell: this.maze[row][col], dir: Paths.DOWN});
        }

        return unvisitedNeighbours;
    }

    Draw(illustrator)
    {   
        illustrator.DrawGrid();

        for (let row = 0; row < this.mazeHeight; row++)
        {
            for (let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[row][col];

                illustrator.DrawWallBreaks(cell);

                if (!this.completed)
                {                
                    if (cell.visited)
                    {
                        illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "cyan");
                    }
                    
                    if (cell.currentPath)
                    {
                        illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 2.4, "green");
                    }  
                }  
                
                // start point
                if (row == this.startCellCoords.row && col == this.startCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "red");
                } 
                
                // end point
                if (row == this.endCellCoords.row && col == this.endCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "red");
                }                 
            }
        }
    }
}

let inProgress = false;

function Go()
{
    var height = document.getElementById("MazeHeightInput").value;
    var width = document.getElementById("MazeWidthInput").value;
    var stepInterval = document.getElementById("stepInterval").value;

    Generate(height, width, stepInterval)
}

function Generate(mazeHeight = 10, mazeWidth = 10, stepInterval)
{
    if (inProgress) return;
    inProgress = true;
    let startCoords = {row: 0, col: 0};
    let endCoords = {row: mazeHeight - 1, col: mazeWidth - 1};

    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);
    
    let maze = new RecursiveBacktrackMazeGen(
        mazeHeight, mazeWidth, startCoords, endCoords, 
        (...args) => CompletedCallback(...args, illustrator));

     
    // interval of 0 means don't animate steps.
    if (stepInterval != 0)
    {
        let interval = setInterval(function(){ 
            if (!maze.completed)
            {
                maze.StepMaze();
                maze.Draw(illustrator);
            }
            else
            {
                clearInterval(interval);
            }
        }, stepInterval);
    }
    else
    {
        while(!maze.completed)
        {
            maze.StepMaze();
        }

        maze.Draw(illustrator);
    }
}

function CompletedCallback(maze, illustrator)
{
    inProgress = false;

    // final draw cycle to remove dots
    illustrator.DrawGrid();

    maze.forEach(row => row.forEach(cell => illustrator.DrawWallBreaks(cell)));
}