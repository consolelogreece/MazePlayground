class DeadEndFillerMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];
               
        let formattedMaze = [];
     
        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], filled:false});
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

                    this.cellsToDraw.push(currentCell);
                }
            }
        }
        yield this;

        let updateMade = true;

        while (updateMade)
        {
            updateMade = false;
            for (let row = 0; row < this.maze.length; row++)
            {
                for (let col = 0; col < this.maze[row].length; col++)
                {
                    let currentCell = this.maze[row][col];

                    if ((row == this.endCellCoords.row && col == this.endCellCoords.col) || (row == this.startCellCoords.row && col == this.startCellCoords.col)) continue;

                    let connectedNeighbours = FindNeighbours(this.maze, row, col).filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));

                    let nValidRoutes = connectedNeighbours.reduce((n, val) => n + (!val.cell.filled), 0);

                    if (nValidRoutes == 1)
                    {
                        currentCell.filled = true;

                        this.cellsToDraw.push(currentCell);

                        updateMade = true;
                    }
                }
            }
            yield this;
        }

        console.log("done")
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
                let connectedNeighbours = FindNeighbours(this.maze, cell.row, cell.col).filter(neighbour => cell.connectedCells.includes(neighbour.dir));

                let nValidRoutes = connectedNeighbours.reduce((n, val) => n + (!val.cell.filled), 0);
                illustrator.DrawTextInCell(cell.row, cell.col, nValidRoutes)
                illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "cyan");
            })   
        }       
        else
        {
            // for (let i = 0; i < this.shortestPath.length - 1; i++)
            // {
            //     let from = this.shortestPath[i];
            //     let to = this.shortestPath[i + 1];
    
            //     illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
            // }
        }

        this.cellsToDraw = [];
    }
}