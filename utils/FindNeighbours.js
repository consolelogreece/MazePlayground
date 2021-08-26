const Paths = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "down",
    UPLEFT: "upleft",
    UPRIGHT: "upright",
    DOWNLEFT:"downleft",
    DOWNRIGHT: "downright"
}

// finds neighbours of a cell
function FindNeighbours(maze, cellRow, cellCol)
{
    let neighbours = [];

    let mazeHeight = maze.length;
    let mazeWidth = maze[0].length
        
    if (cellCol >= 1)
    {
        let col = cellCol - 1;
        let row = cellRow;
        neighbours.push({cell: maze[row][col], dir: Paths.LEFT, relativePositionRequesting: Paths.RIGHT});
    }

    if (cellCol < mazeWidth - 1)
    {
        let col = cellCol + 1;
        let row = cellRow;
        neighbours.push({cell: maze[row][col], dir: Paths.RIGHT, relativePositionRequesting: Paths.LEFT});
    }

    if (cellRow >= 1)
    {
        let col = cellCol;
        let row = cellRow - 1;
        neighbours.push({cell: maze[row][col], dir: Paths.UP, relativePositionRequesting: Paths.DOWN});
    }

    if (cellRow < mazeHeight - 1)
    {
        let col = cellCol;
        let row = cellRow + 1;
        neighbours.push({cell: maze[row][col], dir: Paths.DOWN, relativePositionRequesting: Paths.UP});
    }

    return neighbours;
}

function FindDiagonalNeighbours(maze, cellRow, cellCol)
{
    let neighbours = [];

    let mazeHeight = maze.length;
    let mazeWidth = maze[0].length
        
    if (cellCol >= 1 && cellRow >= 1)
    {
        let col = cellCol - 1;
        let row = cellRow - 1;
        neighbours.push({cell: maze[row][col], dir: Paths.UPLEFT, relativePositionRequesting: Paths.DOWNRIGHT});
    }

    if (cellCol < mazeWidth - 1 && cellRow < mazeHeight - 1)
    {
        let col = cellCol + 1;
        let row = cellRow + 1;
        neighbours.push({cell: maze[row][col], dir: Paths.DOWNRIGHT, relativePositionRequesting: Paths.UPLEFT});
    }

    if (cellCol < mazeWidth - 1 && cellRow >= 1)
    {
        let col = cellCol + 1;
        let row = cellRow - 1;
        neighbours.push({cell: maze[row][col], dir: Paths.UPRIGHT, relativePositionRequesting: Paths.DOWNLEFT});
    }

    if (cellCol >= 1 && cellRow < mazeHeight - 1)
    {
        let col = cellCol - 1;
        let row = cellRow + 1;
        neighbours.push({cell: maze[row][col], dir: Paths.DOWNLEFT, relativePositionRequesting: Paths.UPRIGHT});
    }

    return neighbours;
}