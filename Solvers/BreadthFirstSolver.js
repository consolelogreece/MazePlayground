class BreadthFirstMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.paths = [];
        this.shortestPath = [];
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

                // Necessary to loop backwards so new paths arent copied after origina path is modified
                for (let j = validNeighbours.length - 1; j >= 0; j--)
                {
                    let neighbour = validNeighbours[j];

                    neighbour.cell.visited = true;

                    if (neighbour.cell.row == this.endCellCoords.row && neighbour.cell.col == this.endCellCoords.col)
                    {
                        neighbour.cell.pathKey = currentCell.pathKey;
                        this.paths[i].push({...neighbour.cell});

                        this.completed = true;

                        this.shortestPath = path;

                        return;
                    }

                    if (j == 0)
                    {
                        neighbour.cell.pathKey = currentCell.pathKey;
                        this.paths[i].push({...neighbour.cell});
                    }  
                    // Copy and create new path as is a new branch
                    else
                    {
                        pathKeyIterator++;

                        neighbour.cell.pathKey = pathKeyIterator;

                        let pathCopy = [];

                        for (let k = 0; k < path.length; k++)
                        {
                            pathCopy.push({...this.maze[path[k].row][path[k].col]});
                            this.maze[path[k].row][path[k].col];
                        }
    
                        pathCopy.push({...neighbour.cell});

                        this.paths.push(pathCopy);
                    }  
                } 
                
                yield this;
            }

            // remove dead ends from path considerations
            for(let i = deadEndPaths.length - 1; i >= 0; i--) this.paths.splice(deadEndPaths[i], 1);
        }
    }

    

    Draw(illustrator)
    {   
        illustrator.DrawGrid();

        for (let row = 0; row < this.maze.length; row++)
        {
            for (let col = 0; col < this.maze[row].length; col++)
            {
                let cell = this.maze[row][col];

                illustrator.DrawWallBreaks(cell);

                if (!this.completed && cell.visited)
                {
                    illustrator.DrawTextInCell(row, col, cell.pathKey)
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "cyan");
                } 
                
                // start point
                if (row == this.startCellCoords.row && col == this.startCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.3, "red");
                } 
                
                // end point
                if (row == this.endCellCoords.row && col == this.endCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.3, "red");
                }                 
            }
        }

        for (let i = 0; i < this.shortestPath.length - 1; i++)
        {
            let from = this.shortestPath[i];
            let to = this.shortestPath[i + 1];

            illustrator.DrawLineBetweenCells(from.row, from.col, to.row, to.col, "magenta");
        }
    }
}