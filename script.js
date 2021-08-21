let mazeCanvas = document.getElementById("MazeCanvas");

let ctx = mazeCanvas.getContext("2d");

let mazeHeightEl = document.getElementById("MazeHeightInput");
let mazeWidthEl = document.getElementById("MazeWidthInput");
let generatorEl = document.getElementById("GeneratorSelector");
let solverEl = document.getElementById("SolverSelector");

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
    for (let key in generatorMap)
    {
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        generatorEl.appendChild(opt);
    }

    for (let key in solverMap)
    {
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        solverEl.appendChild(opt);
    }
})();

function GetSpeedParameters()
{    
    let stepInterval = document.getElementById("stepInterval").value;
    let stepsPerCycle = document.getElementById("stepsPerCycle").value;
    let ShouldVisualise = document.getElementById("ShouldVisualise").checked;

    console.log(ShouldVisualise)

    return {
        cycleInterval: 100 - stepInterval, 
        stepsPerCycle: stepsPerCycle,
        shouldAnimate: ShouldVisualise
    }
}

function Generate()
{
    let mazeHeight = mazeHeightEl.value;
    let mazeWidth = mazeWidthEl.value;
    let generatorSelection = generatorMap[generatorEl.value];

    let generator = new generatorSelection(
        mazeHeight, mazeWidth, {row: 0, col: 0}, 
        {row: mazeHeight - 1, col: mazeWidth - 1});
    
    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);

    Go(generator, illustrator, (mazeObj) => currentMaze = mazeObj.maze);
}

function Solve()
{
    if (currentMaze == null) return;
    let mazeHeight = mazeHeightEl.value;
    let mazeWidth = mazeWidthEl.value;
    let solverSelection = solverMap[solverEl.value];   

    let solver = new solverSelection(currentMaze, {row: 0, col: 0}, 
        {row: mazeHeight - 1, col: mazeWidth - 1});
    
    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);

    Go(solver, illustrator, () => {});
}

function Go(maze, illustrator, cb)
{
    if (inProgress) return;

    inProgress = true;

    let mazeGen = maze.StepMaze();

    let speedParams = GetSpeedParameters();
    
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
                maze.Draw(illustrator);
                cb(maze);
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
        cb(maze);
    }
}