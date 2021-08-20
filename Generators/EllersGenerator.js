class EllersMazeGen
{
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.completed = false;
        this.currentRow = 0;
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

    GetFormattedMaze()
    {
        return this.maze.map(row => {
            return row.map(cell => {
                return {row: cell.row, col: cell.col, connectedCells: cell.connectedCells};
            });
        })
    }
   
    * StepMaze()
    {         
        for(let row = 0; row < this.mazeWidth; row++)
        { 
            this.currentRow = row;
            for (let col = 0; col < this.mazeWidth; col++)
            {
                // Assign set to as yet unassigned cell.
                if (this.maze[row][col].set === -1)
                {
                    this.maze[row][col].set = this.iSet;
                    this.iSet ++;
                    yield this;
                }
            }

            // Randomly merge sets.
            for (let col = 0; col < this.mazeWidth -1; col++)
            {
                if (this.CoinToss())
                {
                    let cell = this.maze[row][col];
                    let neighbour = this.maze[row][col + 1];

                    if (cell.set != neighbour.set)
                    {
                        neighbour.set = cell.set;
                        cell.connectedCells.push(Paths.RIGHT);
                        neighbour.connectedCells.push(Paths.LEFT);
                    }
                    yield this;
                }
            } 

            // If this is false, we are on the last row, so no cells to connect to.
            if (row < this.mazeHeight - 1)
            {
                // Map sets.
                let setMap = {};
                for (let col = 0; col < this.mazeWidth; col++)
                {
                    let cell = this.maze[row][col];

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

                    for (const cell of cellsToConnectVertically)
                    {
                        this.maze[cell.row + 1][cell.col].set = cell.set;
                        this.maze[cell.row + 1][cell.col].connectedCells.push(Paths.UP);
                        this.maze[cell.row][cell.col].connectedCells.push(Paths.DOWN);

                        yield this; 
                    };  
                }
            }
            else
            {
                for(let col = 0; col < this.mazeWidth - 1; col++)
                {
                    let cell = this.maze[row][col];

                    let cellNeighbours = FindNeighbours(this.maze, cell.row, cell.col);

                    let rightNeighbour = cellNeighbours.find(neighbour => neighbour.dir == Paths.RIGHT);

                    // Connect disjointed sets
                    if (cell.set != rightNeighbour.cell.set) 
                    {
                       cell.connectedCells.push(Paths.RIGHT)
                    };
                    yield this;
                };
            }
        }

        this.completed = true;
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

                if (!this.completed && (row == this.currentRow || row == this.currentRow + 1))
                {
                    if (cell.set != -1) illustrator.DrawTextInCell(row, col, cell.set)
                }
                     
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