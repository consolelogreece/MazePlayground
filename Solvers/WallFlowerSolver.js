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

            let turned = false;

            let nextCell;

            for (let i = 0; i < this.DirectionOrder.length; i++)
            { 
                let dir = this.DirectionOrder[(i + this.dirOffset[this.currentWallDir]) % this.DirectionOrder.length];
                if (neighbours.some(n => n.dir == dir)) {
                    let nextNeighbour = neighbours.filter(neighbour => neighbour.dir == dir)[0];

                    if (dir !== this.straightLineDetermanent[this.currentWallDir]) turned = true

                    this.cellsToDraw.push(currentCell, nextNeighbour.cell);

                    nextCell = nextNeighbour.cell;

                    this.currentWallDir = this.dirWallMap[dir];

                    this.path.push(nextCell);

                    if (!nextCell.connectedCells.some(cell => cell == this.currentWallDir)) 
                    {   
                        nextCell.wallsTouched.push({dir: this.currentWallDir, drawn: false})
                    }

                    yield this;

                    break;
                } 
                else
                {
                    currentCell.wallsTouched.push({dir: dir, drawn: false});
                    this.cellsToDraw.push(currentCell);
                    yield this;
                }
            }

            if (currentCell.row == this.endCellCoords.row && currentCell.col == this.endCellCoords.col) this.completed = true;

            currentCell = nextCell;
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

            let lastWall = currentCell.wallsTouched[currentCell.wallsTouched.length - 1]

            this.cellsToDraw.forEach(cell => {    
                if (cell.wallsTouched.some(cw => cw.drawn)) 
                {
                    cell.wallsTouched.forEach(wall => {
                        if (wall !== lastWall) illustrator.DrawWall(cell.row, cell.col, wall.dir, "green", 4);
                    })
                }

                if (cell === currentCell)
                {
                    if (lastWall != undefined && !lastWall.drawn)
                    {
                        illustrator.DrawWall(cell.row, cell.col, lastWall.dir, "cyan", 4);
                        lastWall.drawn = true;
                    } 
                    illustrator.DrawCircleAtLocation(currentCell.row, currentCell.col, (dimensions) => dimensions.width / 1.8, "cyan");
                }
                else
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "green");
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