class EllersMazeGen
{
    constructor(mazeHeight, mazeWidth, startCellCoords, endCellCoords){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.startCellCoords = startCellCoords;
        this.endCellCoords = endCellCoords;
        this.maze = [];
        this.completed = false;
        this.initialDraw = true;
        this.cellsToDraw = [];
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
        for(let row = 0; row < this.mazeHeight; row++)
        { 
            this.currentRow = row;

            // Assign a set to each unassigned cell
            for (let col = 0; col < this.mazeWidth; col++)
            {
                if (this.maze[row][col].set === -1)
                {
                    this.maze[row][col].set = this.iSet;
                    this.iSet ++;
                    this.cellsToDraw.push(this.maze[row][col]);
                }
            }

            yield this;

            // Randomly merge sets.
            for (let col = 0; col < this.mazeWidth -1; col++)
            {
                if (this.CoinToss())
                {
                    let cell = this.maze[row][col];
                    let neighbour = this.maze[row][col + 1];

                    // update all cells of same set
                    if (cell.set != neighbour.set)
                    {
                        for (let i = 0; i < this.mazeHeight; i++)
                        {
                            if (neighbour.row == this.currentRow && neighbour.col == i) continue

                            if(this.maze[this.currentRow][i].set == neighbour.set) 
                            {
                                this.maze[this.currentRow][i].set = cell.set;
                            }
                            
                        }

                        neighbour.set = cell.set;
                        cell.connectedCells.push(Paths.RIGHT);
                        neighbour.connectedCells.push(Paths.LEFT);
                        this.cellsToDraw.push(cell, neighbour);
                    }  
                }
            } 

            yield this;

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

                        this.cellsToDraw.push(this.maze[cell.row][cell.col], this.maze[cell.row + 1][cell.col]); 
                    };  
                }

                yield this;
            }
            else
            {
                for(let col = 0; col < this.mazeWidth - 1; col++)
                {
                    let cell = this.maze[row][col];

                    let cellNeighbours = FindNeighbours(this.maze, cell.row, cell.col);

                    let rightNeighbour = cellNeighbours.find(neighbour => neighbour.dir == Paths.RIGHT);

                    // Connect disjointed sets.
                    if (cell.set != rightNeighbour.cell.set) 
                    {
                       cell.connectedCells.push(Paths.RIGHT)
                       rightNeighbour.cell.connectedCells.push(Paths.LEFT);

                       this.cellsToDraw.push(cell, rightNeighbour.cell);
                    };
                };

                yield this;
            }
        }

        this.completed = true;
    }

    Draw(illustrator)
    {   
        if (this.initialDraw)
        {
            illustrator.DrawGrid();
            this.initialDraw = false;
        }        

        if (!this.completed)
        {
            if (this.currentRow >= 1)
            {
                for(let i = 0; i < this.mazeWidth; i++)  
                {
                    illustrator.EraseCellContents(this.currentRow  -1, i);
                    illustrator.DrawWallBreaks(this.maze[this.currentRow - 1][i])
                } 
            }
            
            this.cellsToDraw.forEach(cell => {               
                
                illustrator.EraseCellContents(cell.row, cell.col);
                
                illustrator.DrawWallBreaks(cell)

                if (cell.set != -1) illustrator.DrawTextInCell(cell.row, cell.col, cell.set)
            })   
        }  
        else // redraw everything on last cycle to make the process more efficient, while preserving functionality when visualisation is disabled.
        {        
            illustrator.DrawGrid();

            for (let row = 0; row < this.mazeHeight; row++)
            {
                for (let col = 0; col < this.mazeWidth; col++)
                {
                    let cell = this.maze[row][col];

                    illustrator.DrawWallBreaks(cell)
                }
            }

            illustrator.DrawCircleAtLocation(this.startCellCoords.row, this.startCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
            illustrator.DrawCircleAtLocation(this.endCellCoords.row, this.endCellCoords.col, (dimensions) => dimensions.width / 1.3, "red");
        }  
        
        this.cellsToDraw = [];
    }
}