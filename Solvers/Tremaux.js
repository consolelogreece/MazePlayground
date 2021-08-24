class TremauxMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];
        this.path = [];
        this.currentPath = [];

        let formattedMaze = [];

        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], marks: 0, isCurrent: false, visited:false, junction: maze[row][col].connectedCells.length > 2, drawConCellList: []});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;

        this.maze[this.startCellCoords.row][this.startCellCoords.col].isCurrent = true;
    }

    * StepMaze()
    { 
        let endCell = this.maze[this.endCellCoords.row][this.endCellCoords.col];

        let previousCell = this.maze[this.startCellCoords.row][this.startCellCoords.col];

        let connectedNeighbours = FindNeighbours(this.maze, previousCell.row, previousCell.col).filter(neighbour => previousCell.connectedCells.includes(neighbour.dir));

        let currentCell = connectedNeighbours[0].cell;  

        previousCell.visited = true;

        previousCell.marks++;

        previousCell.drawConCellList.push(currentCell);

        this.cellsToDraw.push(previousCell, currentCell)

        yield this;

        while (!this.completed)
        {   
            if (currentCell == endCell) {
                this.completed = true; 
                currentCell.marks++; 
                continue;
            }

            let nextCell;

            let connectedNeighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col).filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));
            
            //deadend
            if (connectedNeighbours.length === 1)
            {
                currentCell.marks++;
                nextCell = previousCell;
                previousCell = currentCell;
            }
            // on path, only 1 way to go
            else if(connectedNeighbours.length === 2)
            {                                  
                nextCell = connectedNeighbours.filter(neighbour => neighbour.cell !== previousCell)[0].cell;
                previousCell = currentCell;    
            }
            // junction, baby!
            else 
            {
                // first time at junction, pick new at random
                if (currentCell.marks === 0)
                {
                    previousCell = currentCell;
                    let validNeighbours = connectedNeighbours.filter(neighbour => neighbour.cell !== currentCell && neighbour.cell.marks === 0);
                    nextCell = validNeighbours[0].cell;
                }
                // been at junction before and not been on this path before, treat like dead end
                else if (previousCell.marks === 1)
                {
                    let tempCell = currentCell;
                    currentCell = previousCell;
                    previousCell = tempCell;
                    nextCell = currentCell;
                    
                    currentCell.marks++;
                }
                // Seen junction and been on this path before, take any new passage if one exists otherwise travel down another passage marked once.
                else
                {
                    let validNeighbours = connectedNeighbours.filter(neighbour => neighbour.cell !== currentCell);
                    let unvisitedNeighbours = validNeighbours.filter(neighbour => neighbour.cell.marks === 0);
                    let visitedOnce = validNeighbours.filter(neighbour => neighbour.cell.marks === 1);
                    if (unvisitedNeighbours.length !== 0)
                    {                        
                        previousCell = currentCell;
                        nextCell = unvisitedNeighbours[0].cell;
                    }
                    else 
                    {                       
                        previousCell = currentCell;
                        nextCell = visitedOnce[0].cell;
                    }

                    if (nextCell.marks == 0) currentCell.marks--;
                }
            }

            currentCell.marks++;

            currentCell = nextCell;

            previousCell.isCurrent = false;

            currentCell.isCurrent = true;

            previousCell.drawConCellList.push(nextCell);

            this.cellsToDraw.push(previousCell, nextCell)

            yield this;
        };       

        this.MapPath();
        
        yield this;
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

            // Find the neighbour which isnt the current cell and has only been marked once, should only be 1.
            let nextCell = connectedNeighbours.filter(neighbour => neighbour.cell != previousCell && neighbour.cell.marks === 1)[0].cell;

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
            this.cellsToDraw.forEach(cellFrom => {
                cellFrom.drawConCellList.forEach(cellTo => {
                    // cells are horizontal neighbours
                    if (cellFrom.row == cellTo.row)
                    {
                        let offset = 1;
                        if (cellFrom.col > cellTo.col) offset = -1;
                        illustrator.DrawLineBetweenCells(cellFrom.row, cellFrom.col, cellTo.row, cellTo.col, "cyan", 2, () => 0,  dimensions => (dimensions.height / 10) * offset);
                    }
                    // cells are vertical neighbours
                    else
                    {
                        let offset = 1;
                        if (cellFrom.row > cellTo.row) offset = -1;
                        illustrator.DrawLineBetweenCells(cellFrom.row, cellFrom.col, cellTo.row, cellTo.col, "cyan", 2, dimensions => (dimensions.width / 10) * offset, () => 0);
                    }
                    
                });
    
                cellFrom.drawConCellList = [];            
            });
        }       

        if (this.completed)
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