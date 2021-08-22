class DeadEndFillerMazeSolver 
{
    constructor(maze, startCellCoords, endCellCoords)
    {
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.completed =  false;
        this.initialDraw = true;
        this.cellsToDraw = [];
               
        let formattedMaze = [];
     
        for (let row = 0; row < maze.length; row++)
        {
            let formattedRow = [];
            for (let col = 0; col < maze[row].length; col++)
            {
                formattedRow.push({...maze[row][col], visited:false});
            }

            formattedMaze.push(formattedRow);
        }

        this.maze = formattedMaze;
    }

    * StepMaze()
    { 
       
    }    

    Draw(illustrator)
    {   
       
    }
}