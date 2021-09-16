class CellularAutomataMazeGen
{
    constructor(mazeHeight, mazeWidth, params){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.maze = [];
        this.completed = false;
        this.cellsToDraw = [];
        this.bornMin = params.bornMin;
        this.bornMax = params.bornMax;
        this.surviveMin = params.surviveMin;
        this.surviveMax = params.surviveMax;

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, aliveNow: RandomizationUtils.RandomNumberBetweenMinMaxInclusive(1, 20) === 1, aliveNext: false});
            }
    
            this.maze.push(mazeRow);
        }
    }

    GetFormattedMaze()
    {
        let formatted = {
            maze: this.maze.map(row => row.map(cell => { return {row: cell.row, col: cell.col};})),
            solvable:false
        }

        return formatted;
    }

    * StepMaze()
    { 
        yield this;
        let iterations = 0;
        
        let changeOccured = true;
        while (changeOccured && iterations < 500) 
        {
            iterations++;
            changeOccured = false;
            for (let row = 0; row < this.mazeHeight; row++)
            {
                for (let col = 0; col < this.mazeWidth; col++)
                {
                    let cell = this.maze[row][col];
                    let neighbours = [...FindNeighbours(this.maze, row, col), ...FindDiagonalNeighbours(this.maze, row, col)];

                    let aliveNeighbourCount = neighbours.reduce((acc, curr) => acc + (curr.cell.aliveNow ? 1 : 0), 0);

                    if (cell.aliveNow)
                    {
                        if (aliveNeighbourCount <= this.surviveMax && aliveNeighbourCount >= this.surviveMin) cell.aliveNext = true;
                        else
                        {
                            cell.aliveNext = false;
                            changeOccured = true;
                        } 
                    }
                    else
                    {
                        if (aliveNeighbourCount <= this.bornMax && aliveNeighbourCount >= this.bornMin) 
                        {
                            changeOccured = true;
                            cell.aliveNext = true;
                        }
                    }
                }
            }

            for (let row = 0; row < this.mazeHeight; row++)
            {
                for (let col = 0; col < this.mazeWidth; col++)
                {
                    let cell = this.maze[row][col];
                    if (cell.aliveNext != cell.aliveNow) this.cellsToDraw.push(cell);
                    cell.aliveNow = cell.aliveNext;
                }
            }
            
            yield this;
        }        

        this.completed = true;
    }

    Draw(illustrator)
    {          
        this.cellsToDraw.forEach(cell => {
            if (cell.aliveNow)
            {
                illustrator.FillCell(cell.row, cell.col, "#22ff00");
            }
            else
            {
                illustrator.FillCell(cell.row, cell.col,"#222");
            }
        });
        
        this.cellsToDraw = [];
    }
}