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

    * StepMaze()
    { 
        while (!this.completed) 
        {
            let currentCoords = this.pathStack[this.pathStack.length - 1];
        
            let neighbours = FindNeighbours(this.maze, currentCoords.row, currentCoords.col);
    
            let unvisitedNeighbours = neighbours.filter(neighbour => !neighbour.cell.visited)
    
            if (unvisitedNeighbours.length == 0) 
            {
                let redundant = this.pathStack.pop();
    
                this.maze[redundant.row][redundant.col].currentPath = false;            
            }
            else
            {            
                let nextNeighbour = unvisitedNeighbours[Math.floor(Math.random() * unvisitedNeighbours.length)];
                
                nextNeighbour.cell.visited = true;
    
                nextNeighbour.cell.currentPath = true;
    
                this.maze[currentCoords.row][currentCoords.col].connectedCells.push(nextNeighbour.dir);
    
                this.nVisited++;
    
                this.pathStack.push({row: nextNeighbour.cell.row, col: nextNeighbour.cell.col});
            }
            
            if (this.nVisited == this.nCells)
            {
                this.completed = true;
            }

            yield this;
        }        
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
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.3, "red");
                } 
                
                // end point
                if (row == this.endCellCoords.row && col == this.endCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.3, "red");
                }                 
            }
        }
    }
}