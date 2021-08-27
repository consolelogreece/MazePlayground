class RecursiveBacktrackMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.pathStack = [startCellCoords];
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];

        let formattedMaze = [];

        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], visited:false, currentPath: false});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;

        this.maze[startCellCoords.row][startCellCoords.col].visited =  true;
        this.maze[startCellCoords.row][startCellCoords.col].currentPath =  true;
    }

    * StepMaze()
    { 
        while (!this.completed)
        {
            let currentCoords = this.pathStack[this.pathStack.length - 1];            

            this.cellsToDraw.push(this.maze[currentCoords.row][currentCoords.col]);

            if (currentCoords.row == this.endCellCoords.row && currentCoords.col == this.endCellCoords.col)
            {
                this.completed = true;
            }
            else
            {
                let currentCell = this.maze[currentCoords.row][currentCoords.col];
                
                let neighbours = FindNeighbours(this.maze, currentCoords.row, currentCoords.col);
        
                let validNeighbours = neighbours.filter(neighbour => !neighbour.cell.visited && currentCell.connectedCells.includes(neighbour.dir));
        
                if (validNeighbours.length == 0) 
                {
                    let redundant = this.pathStack.pop();      
                    
                    this.maze[redundant.row][redundant.col].currentPath = false;

                    this.cellsToDraw.push(this.maze[redundant.row][redundant.col]);
                }
                else
                {  
                    let nextNeighbour = validNeighbours[Math.floor(Math.random() * validNeighbours.length)];
                
                    nextNeighbour.cell.visited = true;
        
                    nextNeighbour.cell.currentPath = true;
        
                    this.pathStack.push({row: nextNeighbour.cell.row, col: nextNeighbour.cell.col});    

                    this.cellsToDraw.push(nextNeighbour.cell);
                }
            }

            yield this;
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
            this.cellsToDraw.forEach(cell => {               
                if (cell.currentPath)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "#ffff00");
                }
                else
                {
                    illustrator.EraseCellContents(cell.row, cell.col);
                }
                
                illustrator.DrawWallBreaks(cell)
            })   
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
        }
    }
}