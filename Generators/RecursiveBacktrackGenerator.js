class RecursiveBacktrackMazeGen
{
    constructor(mazeHeight, mazeWidth){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.nCells = mazeHeight * mazeWidth;
        this.nVisited = 1;
        this.pathStack = [{row: 0, col:0}];
        this.maze = [];
        this.completed = false;
        this.cellsToDraw = [];

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, visited: false, currentPath: false, connectedCells: [] })
            }
    
            this.maze.push(mazeRow)
        }
    
        this.maze[0][0].visited = true;
        this.maze[0][0].currentPath = true;
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
        while (!this.completed) 
        {
            let currentCoords = this.pathStack[this.pathStack.length - 1];

            this.cellsToDraw.push(this.maze[currentCoords.row][currentCoords.col]);
        
            let neighbours = FindNeighbours(this.maze, currentCoords.row, currentCoords.col);
    
            let unvisitedNeighbours = neighbours.filter(neighbour => !neighbour.cell.visited)
    
            if (unvisitedNeighbours.length == 0) 
            {
                let redundant = this.pathStack.pop();
    
                this.maze[redundant.row][redundant.col].currentPath = false; 
                
                this.cellsToDraw.push(this.maze[redundant.row][redundant.col]);
            }
            else
            {         
                this.nVisited++;

                let nextNeighbour = unvisitedNeighbours[RandomizationUtils.RandomFromZero(unvisitedNeighbours.length)];
                
                nextNeighbour.cell.visited = true;
    
                nextNeighbour.cell.currentPath = true;

                nextNeighbour.cell.connectedCells.push(nextNeighbour.relativePositionRequesting);
    
                this.maze[currentCoords.row][currentCoords.col].connectedCells.push(nextNeighbour.dir);
    
                this.pathStack.push({row: nextNeighbour.cell.row, col: nextNeighbour.cell.col});      

                this.cellsToDraw.push(nextNeighbour.cell);
            }
            
            if (this.nVisited == this.nCells)
            {
                this.completed = true;
            }

            yield this;
        }        
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
                if (cell.visited)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "green");
                }
                
                if (cell.currentPath)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "cyan");
                }
            })   
        }       

        this.cellsToDraw = [];
    }
}