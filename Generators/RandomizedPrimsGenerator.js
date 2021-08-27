class RandomizedPrimsMazeGen
{
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.nCells = mazeHeight * mazeWidth;
        this.nVisited = 1;
        this.pathStack = [{row: 0, col:0}];
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.completed = false;
        this.initialDraw = true;
        this.cellsToDraw = [];

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, visited: false, connectedCells: []})
            }
    
            this.maze.push(mazeRow)
        }

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
        let startCell = this.maze[RandomizationUtils.RandomFromZero(this.mazeHeight)][RandomizationUtils.RandomFromZero(this.mazeWidth)];

        startCell.visited = true;

        let walls = FindNeighbours(this.maze, startCell.row, startCell.col);
        
        walls = walls.map(n => {
            return {cell1: startCell, cell2: n.cell, dir: n.dir, relativePositionRequesting: n.relativePositionRequesting}
        });

        this.cellsToDraw.push(startCell);

        yield this;

        while (walls.length > 0)
        {
            let nextWallIndex = RandomizationUtils.RandomFromZero(walls.length);

            let nextWall = walls[nextWallIndex];

            let wallsToAdd = [];

            if ((nextWall.cell1.visited || nextWall.cell2.visited) && nextWall.cell1.visited != nextWall.cell2.visited)
            {
                nextWall.cell1.connectedCells.push(nextWall.dir);

                nextWall.cell2.connectedCells.push(nextWall.relativePositionRequesting)

                nextWall.cell2.visited = true;

                wallsToAdd = FindNeighbours(this.maze, nextWall.cell2.row, nextWall.cell2.col)
                .filter(n => !nextWall.cell2.connectedCells.includes(n.dir))
                .map(n =>({cell1: nextWall.cell2, cell2: n.cell, dir: n.dir, relativePositionRequesting: n.relativePositionRequesting}));
                
                this.cellsToDraw.push(nextWall.cell1, nextWall.cell2);
            }

            walls.splice(nextWallIndex, 1);
            walls.push(...wallsToAdd);

            yield this;
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

            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
        }   
        else
        {          
            this.cellsToDraw.forEach(cell => {
                illustrator.EraseCellContents(cell.row, cell.col);
                illustrator.DrawWallBreaks(cell);
                illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "#00ff80");;   
            })   
        }       

        this.cellsToDraw = [];
    }
}