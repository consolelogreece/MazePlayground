let mazeCanvas = document.getElementById("MazeCanvas");

let ctx = mazeCanvas.getContext("2d");

let mazeHeightEl = document.getElementById("MazeHeightInput");
let mazeWidthEl = document.getElementById("MazeWidthInput");

mazeHeightEl.onchange = () => ValidateBounds(mazeHeightEl, 1000, 1);
mazeWidthEl.onchange = () => ValidateBounds(mazeWidthEl, 1000, 1);

let generatorEl = document.getElementById("GeneratorSelector");
let solverEl = document.getElementById("SolverSelector");
let operationSelectorEl = document.getElementById("OperationSelector");
let buttonEl = document.getElementById("actionButton");

let inProgress = false;

let currentMaze = null;

let interval;

let generatorMap = {
    "Eller's": {Class: EllersMazeGen, AdditionalParams: {}},
    "Hunt and Kill": {Class: HuntAndKillMazeGen, AdditionalParams: {}},
    "Randomized Prim's": {Class: RandomizedPrimsMazeGen, AdditionalParams: {}},
    "Recursive Backtrack": {Class: RecursiveBacktrackMazeGen, AdditionalParams: {}},
    "Recursive Division": {Class: RecursiveDivisionMazeGen, AdditionalParams: {RandomizeChamberBreaks: false}},
    "Recursive Division (Randomized Chamber Breaks)": {Class: RecursiveDivisionMazeGen, AdditionalParams: {RandomizeChamberBreaks: true}}
};

let solverMap = {
    "Breadth First": {Class: BreadthFirstMazeSolver, AdditionalParams: {}},
    "Dead End Filler": {Class: DeadEndFillerMazeSolver, AdditionalParams: {}},
    "Recursive Backtrack": {Class: RecursiveBacktrackMazeSolver, AdditionalParams: {}},
    "Trémaux": {Class: TremauxMazeSolver, AdditionalParams: {}}
};

let operationElMap = {
    "Generate": "generateSection",
    "Solve": "solveSection"
};

let operationElCallbackMap = {
    "Generate": Generate,
    "Solve": Solve
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

    for (let key in operationElMap)
    {
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        operationSelectorEl.appendChild(opt);
    }

    UpdateOperationDisplay()
})();

function UpdateOperationDisplay()
{
    let opSelector = operationSelectorEl.value;

    for (let key in operationElMap)
    {
        let el = document.getElementById(operationElMap[key]);
        if (opSelector == key) el.style.display = "block";
        else el.style.display = "none";
    }

    buttonEl.onclick = operationElCallbackMap[opSelector]
}

function GetSpeedParameters()
{    
    let stepInterval = document.getElementById("stepInterval").value;
    let stepsPerCycle = document.getElementById("stepsPerCycle").value;
    let ShouldVisualise = document.getElementById("ShouldVisualise").checked;

    return {
        cycleInterval: 1000 - stepInterval, 
        stepsPerCycle: stepsPerCycle,
        shouldAnimate: ShouldVisualise
    }
}

function ValidateBounds(el, ubound, lbound)
{
    if (el.value > ubound) el.value = ubound;
    else if(el.value < lbound)el.value = lbound;
}

function Generate()
{
    let mazeHeight = mazeHeightEl.value;
    let mazeWidth = mazeWidthEl.value;
    let generatorSelection = generatorMap[generatorEl.value];

    let generator = new generatorSelection.Class(
        mazeHeight, mazeWidth, {row: 0, col: 0}, 
        {row: mazeHeight - 1, col: mazeWidth - 1}, generatorSelection.AdditionalParams);
    
    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);
    
    illustrator.EraseContents();

    Go(generator, illustrator, (mazeObj) => currentMaze = mazeObj.GetFormattedMaze());
}

function Solve()
{
    if (currentMaze == null) 
    {
        alert("You must generate a maze first!");
        return;
    }
    let mazeHeight = currentMaze.length;
    let mazeWidth = currentMaze[0].length;
    let solverSelection = solverMap[solverEl.value];   

    let solver = new solverSelection.Class(currentMaze, {row: 0, col: 0}, 
        {row: mazeHeight - 1, col: mazeWidth - 1}, solverSelection.AdditionalParams);
    
    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);

    Go(solver, illustrator, () => {});
}

function Go(maze, illustrator, cb)
{
    let mazeGen = maze.StepMaze();

    let speedParams = GetSpeedParameters();

    clearInterval(interval);
    
    if (speedParams.shouldAnimate)
    {
        interval = setInterval(function()
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