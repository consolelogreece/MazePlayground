let mazeCanvas = document.getElementById("MazeCanvas");

let ctx = mazeCanvas.getContext("2d");

let inProgress = false;

let currentMaze = null;

let generatorMap = {
    "Recursive Backtrack": RecursiveBacktrackMazeGen,
    "Ellers": EllersMazeGen
};

let solverMap = {
    "Recursive Backtrack": RecursiveBacktrackMazeSolver,
    "Breadth First": BreadthFirstMazeSolver
};

(function _(){
    let generatorSelector = document.getElementById("GeneratorSelector");
    let solverSelector = document.getElementById("SolverSelector");

    for (let key in generatorMap)
    {
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        generatorSelector.appendChild(opt);
    }

    for (let key in solverMap)
    {
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        solverSelector.appendChild(opt);
    }
})();

function GetSpeedParameters()
{    
    let stepInterval = document.getElementById("stepInterval").value;
    let stepsPerCycle = document.getElementById("stepsPerCycle").value;

    return {
        cycleInterval: 100 - stepInterval, 
        stepsPerCycle: stepsPerCycle,
        shouldAnimate: stepInterval > 0
    }
}

function Solve()
{
    if (currentMaze == null || inProgress) return;

    inProgress = true;

    let mazeHeight = currentMaze.length;
    let mazeWidth = currentMaze[0].length;
    let solverSelection = solverMap[document.getElementById("SolverSelector").value]; 

    let solver = new solverSelection(currentMaze, {row: 0, col: 0}, {row: mazeHeight - 1,  col: mazeWidth - 1});
    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);

    let solverGen = solver.StepMaze();

    let speedParams = GetSpeedParameters();

    if (speedParams.shouldAnimate)
    {
        let interval = setInterval(function()
        { 
            let solveResult;

            for (let step = 0; step < speedParams.stepsPerCycle; step++)
            {
                solveResult = solverGen.next(1);

                if (solveResult.done) break;
            }   
            
            if (solveResult.done) 
            {
                clearInterval(interval);
                inProgress = false;
                solver.Draw(illustrator);                
            } else solveResult.value.Draw(illustrator)
        }, speedParams.cycleInterval);
    }
    else
    {
        let solveResult;
        do 
        {
            solveResult = solverGen.next(1)
        } while (!solveResult.done);

        solver.Draw(illustrator);

        inProgress = false;
    }
}

function Generate()
{
    if (inProgress) return;

    inProgress = true;

    let mazeHeight = document.getElementById("MazeHeightInput").value;
    let mazeWidth = document.getElementById("MazeWidthInput").value;
    let generator = generatorMap[document.getElementById("GeneratorSelector").value];

    let maze = new generator(
        mazeHeight, mazeWidth, {row: 0, col: 0}, 
        {row: mazeHeight - 1, col: mazeWidth - 1});

    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);

    let mazeGen = maze.StepMaze();

    let speedParams = GetSpeedParameters();

    console.log(speedParams)

    if (speedParams.shouldAnimate)
    {
        let interval = setInterval(function()
        { 
            let genResult;

            for (let step = 0; step < speedParams.stepsPerCycle; step++)
            {
                genResult = mazeGen.next(1);

                if (genResult.done) break;                
            }
            
            if (genResult.done)
            {
                clearInterval(interval);
                inProgress = false;
                currentMaze = maze.GetFormattedMaze();                    
                maze.Draw(illustrator);
            }
            else genResult.value.Draw(illustrator);
        }, speedParams.cycleInterval);
    }
    else
    {
        let genResult;
        do 
        {
            genResult = mazeGen.next(1)
        } while (!genResult.done);

        maze.Draw(illustrator);
        inProgress = false;
        currentMaze = maze.GetFormattedMaze();
    }
}