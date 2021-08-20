class EllersMazeGen
{
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords, completedCallback){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.completed = false;
        this.completedCallback = completedCallback;
        this.currentRow = 0;
        this.currentCol = -1;
        this.iSet = 1;

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, set: -1, connectedCells: [] })
            }
    
            this.maze.push(mazeRow)
        }
    }

    CoinToss = () => Math.floor(Math.random() * 2) == 1;

    StepMaze()
    { 
        if (this.currentCol === this.mazeWidth - 1)
        {
            this.currentRow++;
            this.currentCol = 0;
        }
        else this.currentCol++;
        
        // Assign set to as yet unassigned cell.
        for (let col = 0; col < this.mazeWidth; col++)
        {
            if (this.maze[this.currentRow][col].set === -1)
            {
                this.maze[this.currentRow][col].set = this.iSet;
                this.iSet ++;
            }
        }

        // Randomly merge sets.
        for (let col = 0; col < this.mazeWidth -1; col++)
        {
            if (this.CoinToss())
            {
                let cell = this.maze[this.currentRow][col];
                let neighbour = this.maze[this.currentRow][col + 1];

                if (cell.set != neighbour.set)
                {
                    neighbour.set = cell.set;
                    cell.connectedCells.push(Paths.RIGHT);
                }
            }
        }

        // If this is false, we are on the last row, so no cells to connect to.
        if (this.currentRow < this.mazeHeight - 1)
        {
            // Map sets.
            let setMap = {};
            for (let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[this.currentRow][col];

                if (cell.set in setMap)
                {
                    setMap[cell.set].push(cell);
                }
                else setMap[cell.set] = [cell];
            }  

            // Create vertical connections.
            for (const set in setMap)
            {
                let nCells = setMap[set].length;

                // Determine number of vertical connections, has to be atleast 1.
                let nVerticalConnections = Math.floor(Math.random() * nCells) + 1;

                // Shuffle cells then take a slice based on number of vertical connections. Shuffling makes the cells chosen random.
                shuffle(setMap[set]);
                let cellsToConnectVertically = setMap[set].slice(0, nVerticalConnections);

                // Apply vertical connections.
                cellsToConnectVertically.forEach(cell => {
                    this.maze[cell.row + 1][cell.col].set = cell.set;
                    this.maze[cell.row][cell.col].connectedCells.push(Paths.DOWN);
                });
            }
        }   
        else
        {
            for(let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[this.currentRow][col];

                let cellNeighbours = FindNeighbours(this.maze, cell.row, cell.col);

                let topNeighbour = cellNeighbours.find(neighbour => neighbour.dir == Paths.UP);

                // since only record cells connected to right or down, if this is not true then the cell is inaccessible and thus should create a new connection to the right
                if (topNeighbour.cell.connectedCells.length < 2) cell.connectedCells.push(Paths.RIGHT);
            }
        }
    }

    Draw(illustrator)
    {   
        illustrator.DrawGrid();

        for (let row = 0; row < this.mazeHeight; row++)
        {
            for (let col = 0; col < this.mazeWidth; col++)
            {
                let cell = this.maze[row][col];
                illustrator.DrawWallBreaks(cell);
                illustrator.DrawTextInCell(row, col, cell.set)

                

                
                // // start point
                // if (row == this.startCellCoords.row && col == this.startCellCoords.col)
                // {
                //     illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "red");
                // } 
                
                // // end point
                // if (row == this.endCellCoords.row && col == this.endCellCoords.col)
                // {
                //     illustrator.DrawCircleAtLocation(cell.row, cell.col, (dimensions) => dimensions.width / 1.8, "red");
                // }                 
            }
        }
    }
}