const Paths = {
	LEFT: "left",
	RIGHT: "right",
	UP: "up",
	DOWN: "down",
}

// finds neighbours of a cell that satisfy a predicate
function FindNeighbours(maze, cellRow, cellCol, predicate)
{
    let unvisitedNeighbours = [];

    let mazeHeight = maze.length;
    let mazeWidth = maze[0].length
        
    if (cellCol >= 1)
    {
        let col = cellCol - 1;
        let row = cellRow;
        if (predicate(maze[row][col])) unvisitedNeighbours.push({cell: maze[row][col], dir: Paths.LEFT});
    }

    if (cellCol < mazeWidth - 1)
    {
        let col = cellCol + 1;
        let row = cellRow;
        if (predicate(maze[row][col])) unvisitedNeighbours.push({cell: maze[row][col], dir: Paths.RIGHT});
    }

    if (cellRow >= 1)
    {
        let col = cellCol;
        let row = cellRow - 1;
        if (predicate(maze[row][col])) unvisitedNeighbours.push({cell: maze[row][col], dir: Paths.UP});
    }

    if (cellRow < mazeHeight - 1)
    {
        let col = cellCol;
        let row = cellRow + 1;
        if (predicate(maze[row][col])) unvisitedNeighbours.push({cell: maze[row][col], dir: Paths.DOWN});
    }

    return unvisitedNeighbours;
}