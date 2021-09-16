class EllersMazeGen
{
    constructor(mazeHeight, mazeWidth){
        this.mazeWidth = mazeWidth;
        this.mazeHeight = mazeHeight;
        this.maze = [];
        this.completed = false;
        this.cellsToDraw = [];
        this.currentRow = 0;
        this.iSet = 1;

        for (let row = 0; row < mazeHeight; row++)
        {
            let mazeRow = [];
            for (let col = 0; col < mazeWidth; col++)
            {
                mazeRow.push({row: row, col: col, set: -1, connectedCells: [] });
            }
    
            this.maze.push(mazeRow);
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
                if (RandomizationUtils.CoinToss())
                {
                    let cell = this.maze[row][col];
                    let neighbour = this.maze[row][col + 1];

                    // update all cells of same set
                    if (cell.set != neighbour.set)
                    {
                        this.UpdateAllOfSetOnRow(row, neighbour.set, cell.set);
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
                    let nVerticalConnections =  RandomizationUtils.RandomFromZero(nCells) + 1;
                    
                    // Shuffle cells then take a slice based on number of vertical connections. Shuffling makes the cells chosen random.
                    RandomizationUtils.shuffle(setMap[set]);
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
                        this.UpdateAllOfSetOnRow(row, rightNeighbour.cell.set, cell.set);
                        
                        cell.connectedCells.push(Paths.RIGHT);
                        rightNeighbour.cell.connectedCells.push(Paths.LEFT);

                       this.cellsToDraw.push(cell, rightNeighbour.cell);
                    };
                };

                yield this;
            }
        }

        this.completed = true;
    }

    UpdateAllOfSetOnRow(row, from, to)
    {
        for (let col = 0; col < this.mazeWidth; col++)
        {
            let cell = this.maze[row][col];

            if (cell.set == from) cell.set = to;
        }
    }
    // multiple step ellers not removing old numbers for some reason...
    Draw(illustrator)
    {   
        if (!this.completed)
        {
            if (this.currentRow >= 1)
            {
                for(let i = 0; i < this.mazeWidth; i++)  
                {
                    illustrator.EraseCellContents(this.currentRow  -1, i);
                    illustrator.DrawWallBreaks(this.maze[this.currentRow - 1][i]);
                } 
            }
            
            this.cellsToDraw.forEach(cell => {               
                
                illustrator.EraseCellContents(cell.row, cell.col);
                
                illustrator.DrawWallBreaks(cell);

                if (cell.set != -1) illustrator.DrawTextInCell(cell.row, cell.col, cell.set);
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

                    illustrator.EraseCellContents(cell.row, cell.col);
                    illustrator.DrawWallBreaks(cell);
                }
            }
        }  
        
        this.cellsToDraw = [];
    }
}