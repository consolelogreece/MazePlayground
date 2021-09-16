class RandomMouseMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.pathStack = [startCellCoords];
        this.completed = false;
        this.initialDraw = true;
        this.cellsToDraw = [];
        this.pathStack = [];

        let formattedMaze = [];

        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], currentCell:false});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;

        this.maze[startCellCoords.row][startCellCoords.col].currentCell = true;
    }

    * StepMaze()
    { 
        let currentCell = this.maze[this.startCellCoords.row][this.startCellCoords.col];

        this.pathStack.push(currentCell);

        let previousCell;

        let endCell = this.maze[this.endCellCoords.row][this.endCellCoords.col];

        while (currentCell != endCell)
        {
            let neighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col);
    
            let validNeighbours = neighbours.filter(neighbour => currentCell.connectedCells.includes(neighbour.dir));

            let nextCell;

            if (currentCell.connectedCells.length > 2)
            {
                validNeighbours = validNeighbours.filter(n => n.cell != previousCell);

                let nextNeighbour = validNeighbours[RandomizationUtils.RandomFromZero(validNeighbours.length)];

                nextCell = nextNeighbour.cell;
            }
            // deadend
            else if (validNeighbours.length === 1)
            {
                nextCell = validNeighbours[0].cell;
            }
            else
            {
                let nextNeighbour = validNeighbours.filter(n => n.cell != previousCell)[0];
                nextCell = nextNeighbour.cell;
            }

            currentCell.currentCell = false;

            nextCell.currentCell = true;

            this.cellsToDraw.push(currentCell, nextCell);

            previousCell = currentCell;

            currentCell = nextCell;

            // if already been to this cell, deleted all that comes after to avoid very long completion paths.
            let index = this.pathStack.indexOf(currentCell);
            if (index > -1) this.pathStack.splice(index);
            this.pathStack.push(currentCell);

            yield this;
        };   
        
        this.completed = true;
    }

    Draw(illustrator)
    {
        if (this.initialDraw || this.completed)
        {
            illustrator.EraseContents();
            illustrator.DrawGrid();

            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width, "lime");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width, "red");
            
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
                if (cell == this.maze[this.startCellCoords.row][this.startCellCoords.col]) return;
                
                if (cell.currentCell)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.3, "#ff007f");
                }
                else 
                {                    
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width, "#222");
                }
            });
        }       

        this.cellsToDraw = [];

        if (this.completed)
        {
            for (let i = 0; i < this.pathStack.length - 1; i++)
            {
                let from = this.pathStack[i];
                let to = this.pathStack[i + 1];

                illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
            }

            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width, "lime");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width, "red");
        }
    }
}