class RecursiveBacktrackMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords, completedCallback)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.pathStack = [startCellCoords];
        this.completed =  false;
        this.completedCallback = completedCallback;

        let formattedMaze = [];

        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], visited:false, currentPath: false});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;

        this.maze[startCellCoords.row][startCellCoords.col].visited =  true;
        this.maze[startCellCoords.row][startCellCoords.col].currentPath =  true;
    }

    StepMaze()
    { 
        if (this.completed) return;

        let currentCoords = this.pathStack[this.pathStack.length - 1];

        if (currentCoords.row == this.endCellCoords.row && currentCoords.col == this.endCellCoords.col)
        {
            this.completed = true;
            this.completedCallback();
        }
        else
        {
            let currentCell = this.maze[currentCoords.row][currentCoords.col];
            
            let neighbours = FindNeighbours(this.maze, currentCoords.row, currentCoords.col);
    
            let validNeighbours = neighbours.filter(neighbour => !neighbour.cell.visited && currentCell.connectedCells.includes(neighbour.dir));
    
            if (validNeighbours.length == 0) 
            {
                let redundant = this.pathStack.pop();      
                
                this.maze[redundant.row][redundant.col].currentPath = false;
            }
            else
            {  
                let nextNeighbour = validNeighbours[Math.floor(Math.random() * validNeighbours.length)];
            
                nextNeighbour.cell.visited = true;
    
                nextNeighbour.cell.currentPath = true;
    
                this.pathStack.push({row: nextNeighbour.cell.row, col: nextNeighbour.cell.col});    
            }
        }
    }

    Draw(illustrator)
    {   
        illustrator.DrawGrid();

        for (let row = 0; row < this.maze.length; row++)
        {
            for (let col = 0; col < this.maze[row].length; col++)
            {
                let cell = this.maze[row][col];

                illustrator.DrawWallBreaks(cell);

                if (!this.completed)
                {                
                    if (cell.visited)
                    {
                        illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "cyan");
                    }                 
                }  

                if (cell.currentPath)
                    {
                        illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 2.4, "green");
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