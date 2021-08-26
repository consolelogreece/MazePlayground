class HuntAndKillMazeGen
{
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.nCells = mazeHeight * mazeWidth;
        this.nVisited = 1;
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.pathStack = [];
        this.completed = false;
        this.initialDraw = true;
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
    }

    GetFormattedMaze()
    {
        let formatted = {
            maze: this.maze.map(row => row.map(cell => { return {row: cell.row, col: cell.col, connectedCells: cell.connectedCells};})),
            solvable:true
        }

        return formatted;
    }

    FindFirstUnvisitedWithNeighbour()
    {
        for (let row = 0; row < this.mazeHeight; row++)
        {
            for (let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[row][col];

                if (!cell.visited)
                {
                    let neighbours = FindNeighbours(this.maze, cell.row, cell.col);
                    if (neighbours.some(n => n.cell.visited)) return cell;
                } 
            }
        }
    }

    * StepMaze()
    { 
        let firstCellCol = RandomizationUtils.RandomFromZero(this.mazeWidth);
        let firstCellRow = RandomizationUtils.RandomFromZero(this.mazeHeight);

        let firstCell = this.maze[firstCellRow][firstCellCol];

        firstCell.visited = true;
        firstCell.currentPath = true;

        this.pathStack = [firstCell];

        while (!this.completed) 
        {
            let currentCell = this.pathStack[this.pathStack.length - 1];

            this.cellsToDraw.push(currentCell);
        
            let neighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col);
    
            let unvisitedNeighbours = neighbours.filter(neighbour => !neighbour.cell.visited)
    
            if (unvisitedNeighbours.length == 0) 
            {
                this.pathStack.forEach(cell => {
                    cell.currentPath = false;
                    this.cellsToDraw.push(cell);
                });

                // Find an unvisited cell with a visited neighbour. Join that cell with the visited neighbour and continue on.
                currentCell = this.FindFirstUnvisitedWithNeighbour();
                let neighbour = FindNeighbours(this.maze, currentCell.row, currentCell.col).filter(n => n.cell.visited)[0];

                neighbour.cell.connectedCells.push(neighbour.relativePositionRequesting);

                currentCell.connectedCells.push(neighbour.dir)

                currentCell.visited = true;

                this.nVisited++;

                this.pathStack = [currentCell];
            }
            else
            {            
                let nextNeighbour = unvisitedNeighbours[RandomizationUtils.RandomFromZero(unvisitedNeighbours.length)];
                
                nextNeighbour.cell.visited = true;

                this.nVisited++;               
    
                nextNeighbour.cell.currentPath = true;
    
                this.maze[currentCell.row][currentCell.col].connectedCells.push(nextNeighbour.dir);

                nextNeighbour.cell.connectedCells.push(nextNeighbour.relativePositionRequesting);

                this.cellsToDraw.push(nextNeighbour.cell);

                this.pathStack.push(nextNeighbour.cell)                
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