class TreeGrowingMazeGen
{
    constructor(mazeHeight, mazeWidth, params){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.nCells = mazeHeight * mazeWidth;
        this.cellsWithUnvisitedNeighbours = [];
        this.maze = [];
        this.completed = false;
        this.cellsToDraw = [];

        this.nextCellIndexDecidingFunc = params.nextCellIndexDecidingFunc;

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, visited: false, activeCell: false, connectedCells: [] });
            }
    
            this.maze.push(mazeRow);
        }
    
        let firstCell = this.maze[RandomizationUtils.RandomFromZero(mazeHeight)][RandomizationUtils.RandomFromZero(mazeWidth)];

        firstCell.visited = true;

        firstCell.activeCell = true;

        this.cellsWithUnvisitedNeighbours.push(firstCell);
    }

    GetFormattedMaze()
    {
        let formatted = {
            maze: this.maze.map(row => row.map(cell => { return {row: cell.row, col: cell.col, connectedCells: cell.connectedCells};})),
            solvable:true
        }

        return formatted;
    }

    * StepMaze()
    { 
        let currentCell = this.cellsWithUnvisitedNeighbours[0];

        while (this.cellsWithUnvisitedNeighbours.length != 0) 
        {
            let nextCellIndex = this.nextCellIndexDecidingFunc(this.cellsWithUnvisitedNeighbours);

            let nextCell = this.cellsWithUnvisitedNeighbours[nextCellIndex];

            let unvisitedNeighbours = FindNeighbours(this.maze, nextCell.row, nextCell.col).filter(neighbour => !neighbour.cell.visited);

            currentCell.activeCell = false;

            this.cellsToDraw.push(currentCell, nextCell);

            if (unvisitedNeighbours.length === 0)
            {
                this.cellsWithUnvisitedNeighbours.splice(nextCellIndex, 1);
            }
            else
            {
                let neighbourToConnect = unvisitedNeighbours[RandomizationUtils.RandomFromZero(unvisitedNeighbours.length)];

                neighbourToConnect.cell.connectedCells.push(neighbourToConnect.relativePositionRequesting);

                neighbourToConnect.cell.visited = true;

                neighbourToConnect.cell.activeCell = true;

                this.cellsWithUnvisitedNeighbours.push(neighbourToConnect.cell);

                this.cellsToDraw.push(neighbourToConnect.cell);

                nextCell.connectedCells.push(neighbourToConnect.dir);

                yield this;

                neighbourToConnect.cell.activeCell = false;

                this.cellsToDraw.push(neighbourToConnect.cell);
            }

            currentCell = nextCell;
        }        

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
        }   
        else
        {
            this.cellsToDraw.forEach(cell => {
                illustrator.EraseCellContents(cell.row, cell.col);
                illustrator.DrawWallBreaks(cell);
                if (cell.activeCell)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "#f1d6ff");
                }
                else
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "#9900ff");
                }
            });
        }

        this.cellsToDraw = [];
    }
}