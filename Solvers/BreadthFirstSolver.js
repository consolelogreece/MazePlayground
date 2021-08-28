class BreadthFirstMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.paths = [];
        this.shortestPath = [];
        this.initialDraw = true;
        this.cellsToDraw = [];
               
        let formattedMaze = [];
     
        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], visited:false, pathKey: -1});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;

        this.paths = [[this.maze[startCellCoords.row][startCellCoords.col]]];

        this.maze[startCellCoords.row][startCellCoords.col].pathKey = 1;
    }

    * StepMaze()
    { 
        let pathKeyIterator = 0;

        while (!this.completed)
        {        
            let deadEndPaths = [];

            let pathsToAdd = [];

            for(let i = 0; i < this.paths.length; i++)
            {
                let path = this.paths[i];

                let currentCell = path[path.length - 1];

                let neighbours = FindNeighbours(this.maze, currentCell.row, currentCell.col)

                let validNeighbours = neighbours.filter(neighbour => !neighbour.cell.visited && currentCell.connectedCells.includes(neighbour.dir));

                if (validNeighbours.length == 0)
                {
                    deadEndPaths.push(i);
                    continue;
                }

                // Necessary to loop backwards so new paths arent copied after original path is modified
                for (let j = validNeighbours.length - 1; j >= 0; j--)
                {
                    let neighbour = validNeighbours[j];

                    this.cellsToDraw.push(neighbour.cell);

                    neighbour.cell.visited = true;

                    if (neighbour.cell.row == this.endCellCoords.row && neighbour.cell.col == this.endCellCoords.col)
                    {
                        neighbour.cell.pathKey = currentCell.pathKey;

                        this.paths[i].push(neighbour.cell);

                        this.completed = true;

                        this.shortestPath = path;

                        this.cellsToUpdate = [];

                        return;
                    }

                    if (j == 0)
                    {
                        neighbour.cell.pathKey = currentCell.pathKey;
                        this.paths[i].push(neighbour.cell);
                    }  
                    // Copy and create new path as is a new branch
                    else
                    {
                        pathKeyIterator++;

                        neighbour.cell.pathKey = pathKeyIterator;

                        let pathCopy = [...path];
    
                        pathCopy.push(neighbour.cell);

                        pathsToAdd.push(pathCopy);
                    }  
                } 
            }
           
            // remove dead ends from path considerations
            for(let i = deadEndPaths.length - 1; i >= 0; i--) this.paths.splice(deadEndPaths[i], 1);

            this.paths.push(...pathsToAdd);
            
            yield this;
        }
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
                illustrator.DrawTextInCell(cell.row, cell.col, cell.pathKey)
                illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "#bfff00");
            })   
        }       

        this.cellsToDraw = [];
        
        if (this.completed)
        {           
            for (let i = 0; i < this.shortestPath.length - 1; i++)
            {
                let from = this.shortestPath[i];
                let to = this.shortestPath[i + 1];
    
                illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
            }

            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width, "lime");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width, "red");
        }
    }
}