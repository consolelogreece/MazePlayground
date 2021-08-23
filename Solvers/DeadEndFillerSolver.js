class DeadEndFillerMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];

        this.deadEnds = [];

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

                let validNeighbours = FindNeighbours(this.maze, row, col).filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));

                if (validNeighbours.length <= 1)
                {
                    currentCell.filled = true;

                    this.deadEnds.push(currentCell);

                    this.cellsToDraw.push(currentCell);
                }
            }   
            yield this;     
        }
        
     

        let hasUpdated = true;

        // Loop through each deadend until cell updates are made
        while (hasUpdated)
        {
            hasUpdated = false;

            let deadEndsToForget = [];

            for (let i = 0; i < this.deadEnds.length; i++)
            {
                let currentCell = this.deadEnds[i];

                let connectedNeighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col).filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));

                let validNeighbours = connectedNeighbours.filter(neighbour =>
                {
                    return (
                        !neighbour.cell.filled && 
                        !(neighbour.cell.row == this.endCellCoords.row && neighbour.cell.col == this.endCellCoords.col) && 
                        !(neighbour.cell.row == this.startCellCoords.row && neighbour.cell.col == this.startCellCoords.col)
                    );
                });

                // If there are no valid neighbours, no need to check this path again
                if(validNeighbours.length == 0) deadEndsToForget.push(i);

                // For each of the valid neighbours of the current cell, fill if necessary
                for (let neighbour of validNeighbours) 
                {
                    // Skip if the neighbour is a start or end coord.
                    if ((neighbour.cell.row == this.endCellCoords.row && neighbour.cell.col == this.endCellCoords.col) || 
                    (neighbour.cell.row == this.startCellCoords.row && neighbour.cell.col == this.startCellCoords.col)) return;

                    // Get neighbours of the neighbour. This techincally includs the current cell, but that is eliminated by a filled check next.
                    let connectedNeighbours = FindNeighbours(this.maze, neighbour.cell.row, neighbour.cell.col).filter(neighboursNeighbour => neighbour.cell.connectedCells.includes(neighboursNeighbour.dir));
                    
                    let nValidRoutes = connectedNeighbours.reduce((n, val) => n + (!val.cell.filled), 0)

                    // If there is only 1 valid route, fill it as it the next logical square of the deadend and is not at a junction.
                    if (nValidRoutes == 1)
                    {
                        neighbour.cell.filled = true;
    
                        this.cellsToDraw.push(neighbour.cell);

                        this.deadEnds[i] = neighbour.cell;

                        hasUpdated = true;
                    }
                    // Won't use this again, clear it from memory.
                    else deadEndsToForget.push(i);
                }
            }   
            
            // Remove finished deadends
            for(let i = deadEndsToForget.length - 1; i >= 0; i--) this.deadEnds.splice(deadEndsToForget[i], 1)
            
            yield this;
        }

        // Should iterate over each cell here. If any have more than 2 connections, maze is imperfect and cant be solved further using this method. 
        // Important to check for this after implementing generation of imperfect mazes.

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
        
        for (let i = 0; i < this.path.length - 1; i++)
        {
            let from = this.path[i];
            let to = this.path[i + 1];

            illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
        }

        this.cellsToDraw = [];
    }
}