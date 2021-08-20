class BreadthFirstMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.maze = maze;
    }

    * StepMaze()
    { 

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

                // start point
                if (row == this.startCellCoords.row && col == this.startCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "red");
                } 
                
                // end point
                if (row == this.endCellCoords.row && col == this.endCellCoords.col)
                {
                    illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "red");
                }                 
            }
        }
    }
}