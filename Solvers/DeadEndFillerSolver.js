class DeadEndFillerMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];

        this.deadEndPaths = [];

        this.path = [];
               
        let formattedMaze = [];
     
        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], filled:false, truePath: false});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;
    }

    * StepMaze()
    { 
        // find initial deadends
        for (let row = 0; row < this.maze.length; row++)
        {
            for (let col = 0; col < this.maze[row].length; col++)
            {
                let currentCell = this.maze[row][col];

                if (currentCell.filled || (row == this.endCellCoords.row && col == this.endCellCoords.col) || (row == this.startCellCoords.row && col == this.startCellCoords.col)) continue;

                let validNeighbours = FindNeighbours(this.maze, row, col).filter(neighbour => !neighbour.cell.filled && currentCell.connectedCells.includes(neighbour.dir));

                if (validNeighbours.length <= 1)
                {
                    currentCell.filled = true;

                    this.deadEndPaths.push([currentCell]);

                    this.cellsToDraw.push(currentCell)
                }
            }
        }
        yield this;

        let updateMade = true;

        while (updateMade)
        {
            updateMade = false;

            for (let path of this.deadEndPaths){

                let currentCell = path[path.length - 1];

                let connectedNeighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col).filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));

                let validNeighbours = connectedNeighbours.filter(neighbour => !neighbour.cell.filled)

                for (let neighbour of validNeighbours) 
                {
                    if ((neighbour.cell.row == this.endCellCoords.row && neighbour.cell.col == this.endCellCoords.col) || 
                    (neighbour.cell.row == this.startCellCoords.row && neighbour.cell.col == this.startCellCoords.col)) return;

                    let connectedNeighbours = FindNeighbours(this.maze, neighbour.cell.row, neighbour.cell.col).filter(neighboursNeighbour => neighbour.cell.connectedCells.includes(neighboursNeighbour.dir));

                    let nValidRoutes = connectedNeighbours.reduce((n, val) => n + (!val.cell.filled), 0)

                    if (nValidRoutes == 1)
                    {
                        neighbour.cell.filled = true;
    
                        this.cellsToDraw.push(neighbour.cell);

                        path.push(neighbour.cell)
    
                        updateMade = true;
                    }
                }
            }           
            
            yield this;
        }

        this.MapPath();

        this.completed = true;
    }    

    MapPath()
    {
        let startCell = this.maze[this.startCellCoords.row][this.startCellCoords.col];

        let currentCell = startCell;

        let previousCell = startCell

        let endCell = this.maze[this.endCellCoords.row][this.endCellCoords.col];

        while (currentCell != endCell)
        {
            this.path.push(currentCell);

            let connectedNeighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col).filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));

            // Find the neighbour which isnt the current cell and isnt filled. there should only be 1.
            let nextCell = connectedNeighbours.filter(neighbour => neighbour.cell != previousCell && !neighbour.cell.filled && neighbour.cell)[0].cell;

            previousCell = currentCell;

            currentCell = nextCell;
        }

        // Finally, add end cell
        this.path.push(endCell);
    }

    Draw(illustrator)
    {   
        if (this.initialDraw || this.completed)
        {
            illustrator.DrawGrid();

            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
            
            for (let row = 0; row < this.maze.length; row++)
            {
                for (let col = 0; col < this.maze[row].length; col++)
                {
                    illustrator.DrawWallBreaks(this.maze[row][col]);
                }
            }

           this.initialDraw = false;
        }   

        if (!this.completed)
        {
            this.cellsToDraw.forEach(cell => {
                illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "cyan");
            })   
        }       
        else
        {
            for (let i = 0; i < this.path.length - 1; i++)
            {
                let from = this.path[i];
                let to = this.path[i + 1];

                illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
            }
        }

        this.cellsToDraw = [];
    }
}