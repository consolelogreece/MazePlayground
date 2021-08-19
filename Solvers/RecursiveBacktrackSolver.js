class RecursiveBacktrackMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.pathStack = [startCellCoords];

        let formattedMaze = [];

        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], visited:false});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;

        this.maze[startCellCoords.row][startCellCoords.col].visited =  true;
    }

    StepMaze()
    { 
        let currentCoords = this.pathStack[this.pathStack.length - 1];

        let currentCell = this.maze[currentCoords.row][currentCoords.col];
        
        let neighbours = FindNeighbours(this.maze, currentCoords.row, currentCoords.col);

        let validNeighbours = neighbours.filter(cell => !cell.visited && currentCell.connectedCells.includes(cell.dir))

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