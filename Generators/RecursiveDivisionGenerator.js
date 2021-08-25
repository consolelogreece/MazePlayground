class RecursiveDivisionMazeGen
{
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.completed = false;
        this.initialDraw = true;
        this.cellsToDraw = [];

        this.chamberStack = [];

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                // add edge of maze wall as boundaries
                let cell = {row: row, col: col, boundaries: new Set(), connectedCells: [] };
                if (row === 0) cell.boundaries.add(Paths.UP);
                else if (row === mazeHeight - 1) cell.boundaries.add(Paths.DOWN);

                if (col === 0) cell.boundaries.add(Paths.LEFT);
                else if (col === mazeWidth - 1) cell.boundaries.add(Paths.RIGHT);    

                mazeRow.push(cell);
            }
    
            this.maze.push(mazeRow)
        }
    
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
        this.chamberStack.push([this.maze[0][0], this.maze[this.mazeHeight -1][this.mazeWidth - 1]]);

        while (this.chamberStack.length > 0)
        {
            let nextChamber = this.chamberStack.pop();

            let topLeftCell = nextChamber[0];
            let bottomRightCell = nextChamber[1]

            // if space too small to split up, skip.
            if (bottomRightCell.row - topLeftCell.row < 1 || bottomRightCell.col - topLeftCell.col < 1) {
                continue;
            } 

            // create two random walls
            let splitRow = Math.floor(Math.random() * (bottomRightCell.row - topLeftCell.row) + 1) + (topLeftCell.row - 1) ;
            let splitCol = Math.floor(Math.random() * (bottomRightCell.col - topLeftCell.col ) + 1 ) + (topLeftCell.col -1 );

            let chamber1, chamber2, chamber3, chamber4;

            // get coordinates of 4 new chambers created and add them to chambers stack
            chamber1 = [topLeftCell, this.maze[splitRow][splitCol]];
            chamber2 = [this.maze[topLeftCell.row][splitCol + 1], this.maze[splitRow][bottomRightCell.col]];
            chamber3 = [this.maze[splitRow + 1][topLeftCell.col], this.maze[bottomRightCell.row][splitCol]];
            chamber4 = [this.maze[splitRow + 1][splitCol + 1], bottomRightCell]

            this.chamberStack.push(chamber1, chamber2, chamber3, chamber4)

            // random breaks. two on the row break and one in the column break to connect all cells.
            let wallBreakCol1 = Math.floor(Math.random() * (splitCol - topLeftCell.col)) + topLeftCell.col;
            let wallBreakCol2 = Math.floor(Math.random() * (bottomRightCell.col - (splitCol + 1))) + splitCol + 1;
            let wallBreakRow = Math.floor(Math.random() * (bottomRightCell.row - topLeftCell.row )) + topLeftCell.row;

            for (let col = topLeftCell.col; col <= bottomRightCell.col; col++)
            {
                let cell1 = this.maze[splitRow][col];
                let cell2 = this.maze[splitRow + 1][col];
                cell1.boundaries.add(Paths.DOWN);
                cell2.boundaries.add(Paths.UP);

                this.cellsToDraw.push(cell1, cell2);
            }
        
            // remove previously se boundary from these cells as they are connected now.
            this.maze[splitRow][wallBreakCol1].boundaries.delete(Paths.DOWN);
            this.maze[splitRow + 1][wallBreakCol1].boundaries.delete(Paths.UP);

            this.maze[splitRow][wallBreakCol2].boundaries.delete(Paths.DOWN);
            this.maze[splitRow + 1][wallBreakCol2].boundaries.delete(Paths.UP);
            
            for (let row = topLeftCell.row; row <= bottomRightCell.row; row++)
            {
                let cell1 = this.maze[row][splitCol];
                let cell2 = this.maze[row][splitCol + 1];

                cell1.boundaries.add(Paths.RIGHT);
                cell2.boundaries.add(Paths.LEFT);

                this.cellsToDraw.push(cell1, cell2);
            }

            // remove previously se boundary from these cells as they are connected now.
            this.maze[wallBreakRow][splitCol].boundaries.delete(Paths.RIGHT);
            this.maze[wallBreakRow][splitCol + 1].boundaries.delete(Paths.LEFT);
        
            yield this;

        }

        let directions = [Paths.UP, Paths.DOWN, Paths.LEFT, Paths.RIGHT];

        for(let row = 0; row < this.mazeHeight; row++)
        {
            for (let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[row][col];

                let cellBoundaries = [...cell.boundaries];

                cell.connectedCells = directions.filter(dir => cellBoundaries.indexOf(dir) < 0);
            }
        }
        yield this;

        this.completed = true;
    }

    Draw(illustrator)
    {
        if (this.completed)
        {
            illustrator.EraseContents();
            
            for (let row = 0; row < this.maze.length; row++)
            {
                for (let col = 0; col < this.maze[row].length; col++)
                {
                    illustrator.EraseCellContents(row, col);
                    illustrator.DrawWallBreaks(this.maze[row][col]);
                }
            }
            
            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
        }   
        else
        {
            this.cellsToDraw.forEach(cell => {
                cell.boundaries.forEach(b => {
                    illustrator.DrawWall(cell.row, cell.col, b, "orange");
                })
            })
         }       

        this.cellsToDraw = [];
    }
}