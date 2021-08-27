class WallFlowerMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];
        this.path = [];

        this.DirectionOrder = [Paths.LEFT, Paths.DOWN, Paths.RIGHT, Paths.UP];

        this.dirWallMap = {[Paths.LEFT]: Paths.UP,
            [Paths.DOWN]: Paths.LEFT, 
            [Paths.RIGHT]: Paths.DOWN, 
            [Paths.UP]: Paths.RIGHT
        }

        this.straightLineDetermanent = {[Paths.LEFT]: Paths.DOWN,
            [Paths.DOWN]: Paths.RIGHT, 
            [Paths.RIGHT]: Paths.UP, 
            [Paths.UP]: Paths.LEFT
        }

        this.dirOffset = {[Paths.LEFT]: 0,
            [Paths.DOWN]: 1, 
            [Paths.RIGHT]: 2, 
            [Paths.UP]: 3
        }

        this.currentWallDir = Paths.LEFT;
     
        let formattedMaze = [];

        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], visited: false, wallsTouched: []});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;
    }

    * StepMaze()
    { 
        let currentCell = this.maze[this.startCellCoords.row][this.startCellCoords.col];

        this.path.push(currentCell)

        while (!this.completed)
        {
            let neighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col).filter(n => currentCell.connectedCells.includes(n.dir));

            let nextCell;

            // iterate over directions
            for (let i = 0; i < this.DirectionOrder.length; i++)
            { 
                // depending on the current direction, try and find the next path from the most preferable direction to the least. This is determined through the offset.
                let dir = this.DirectionOrder[(i + this.dirOffset[this.currentWallDir]) % this.DirectionOrder.length];
                if (neighbours.some(n => n.dir == dir)) {
                    let nextNeighbour = neighbours.filter(neighbour => neighbour.dir == dir)[0];

                    this.cellsToDraw.push(currentCell, nextNeighbour.cell);

                    nextCell = nextNeighbour.cell;

                    this.currentWallDir = this.dirWallMap[dir];

                    this.path.push(nextCell);

                    if (!nextCell.connectedCells.some(cell => cell == this.currentWallDir)) 
                    {   
                        nextCell.wallsTouched.push(this.currentWallDir)
                    }

                    yield this;

                    break;
                } 
                // In a dead end, so just add the next wall as the animation step and dont move cells.
                else
                {
                    currentCell.wallsTouched.push(dir);
                    this.cellsToDraw.push(currentCell);
                    yield this;
                }
            }

            currentCell = nextCell;

            if (currentCell.row == this.endCellCoords.row && currentCell.col == this.endCellCoords.col) this.completed = true;            
        };       
    }

    Draw(illustrator)
    {
        if (this.initialDraw || this.completed)
        {
            illustrator.EraseContents();
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
            let currentCell = this.path[this.path.length - 1];

            this.cellsToDraw.forEach(cell => {    
                cell.wallsTouched.forEach(wall => {
                    let lineOrientation;

                    let offSetX;

                    let offSetY;

                    switch(wall)
                    {
                        case Paths.LEFT:
                            lineOrientation = "vertical"
                            offSetX = 0.1;
                            offSetY = 0;
                            break;
                        case Paths.RIGHT:
                            lineOrientation = "vertical"
                            offSetX = 0.9;
                            offSetY = 0;
                            break;
                        case Paths.UP:
                            lineOrientation = "horizontal"
                            offSetY = 0.1;
                            offSetX = 0;
                            break;
                        case Paths.DOWN:
                            lineOrientation = "horizontal"
                            offSetY = 0.9;
                            offSetX = 0;
                            break;
                    }

                    illustrator.DrawLine(cell.row, cell.col, lineOrientation, "#90EE90", 4, cellSize => cellSize, 
                    width => width * offSetX, height => height * offSetY)
                })

                if (cell === currentCell)
                {
                    illustrator.DrawCircleAtLocation(currentCell.row, currentCell.col, (dimensions) => dimensions.width / 1.8, "cyan");
                }
                else
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.2, "#222");
                }
            });
        }       

        this.cellsToDraw = [];

        if (this.completed)
        {
            for (let i = 0; i < this.path.length - 1; i++)
            {
                let from = this.path[i];
                let to = this.path[i + 1];

                illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
            }
        }
    }
}