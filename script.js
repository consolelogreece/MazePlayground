let mazeCanvas = document.getElementById("MazeCanvas");
let ctx = mazeCanvas.getContext("2d");

let mazeHeightEl = document.getElementById("MazeHeightInput");
let mazeWidthEl = document.getElementById("MazeWidthInput");
let stepIntervalEl = document.getElementById("stepInterval");
let stepsPerCycleEl = document.getElementById("stepsPerCycle");
let shouldVisualiseEl = document.getElementById("ShouldVisualise");
let generatorEl = document.getElementById("GeneratorSelector");
let unsolvableNoteEl = document.getElementById("unsolvableNote")
let solverEl = document.getElementById("SolverSelector");
let operationSelectorEl = document.getElementById("OperationSelector");
let buttonEl = document.getElementById("actionButton");
let startXEl = document.getElementById("StartX");
let startYEl = document.getElementById("StartY");
let finishXEl = document.getElementById("FinishX");
let finishYEl = document.getElementById("FinishY");

mazeHeightEl.onchange = () => ValidateBounds(mazeHeightEl, 1000, 1);
mazeWidthEl.onchange = () => ValidateBounds(mazeWidthEl, 1000, 1);
stepsPerCycleEl.onchange = () => ValidateBounds(stepsPerCycleEl, 1000, 1)
generatorEl.onchange = handleAlgoChange;
operationSelectorEl.onchange = () => {
    handleAlgoChange();
    UpdateOperationDisplay();
};

let inProgress = false;

let currentMaze = null;

let interval;

let generatorMap = {
    "Eller's": {Class: EllersMazeGen, Solvable: true, AdditionalParams: {}},
    "Hunt and Kill": {Class: HuntAndKillMazeGen,Solvable: true, AdditionalParams: {}},
    "Randomized Prim's": {Class: RandomizedPrimsMazeGen, Solvable: true, AdditionalParams: {}},
    "Recursive Backtrack": {Class: RecursiveBacktrackMazeGen, Solvable: true, AdditionalParams: {}},
    "Recursive Division": {Class: RecursiveDivisionMazeGen, Solvable: true, AdditionalParams: {RandomizeChamberBreaks: false}},
    "Recursive Division (Randomized Chamber Breaks)": {Class: RecursiveDivisionMazeGen, Solvable: true, AdditionalParams: {RandomizeChamberBreaks: true}},
    "Tree Growing (pick first added)": {Class: TreeGrowingMazeGen, Solvable: true, AdditionalParams: {nextCellIndexDecidingFunc: cells => 0}},
    "Tree Growing (pick last added)": {Class: TreeGrowingMazeGen, Solvable: true, AdditionalParams: {nextCellIndexDecidingFunc: cells => cells.length - 1}},
    "Tree Growing (pick random)": {Class: TreeGrowingMazeGen, Solvable: true, AdditionalParams: {nextCellIndexDecidingFunc: cells => RandomizationUtils.RandomFromZero(cells.length)}},
    "Cellular Automata B3/S1234": {Class: CellularAutomataMazeGen, Solvable: false, AdditionalParams: {surviveMin: 1, surviveMax: 5, bornMin: 3, bornMax: 3}},
    "Cellular Automata B3/S12345": {Class: CellularAutomataMazeGen, Solvable: false, AdditionalParams: {surviveMin: 1, surviveMax: 4, bornMin: 3, bornMax: 3}},
};

let solverMap = {
    "Breadth First": {Class: BreadthFirstMazeSolver, AdditionalParams: {}},
    "Dead End Filler": {Class: DeadEndFillerMazeSolver, AdditionalParams: {}},
    "Random Mouse": {Class: RandomMouseMazeSolver, AdditionalParams: {}},
    "Recursive Backtrack": {Class: RecursiveBacktrackMazeSolver, AdditionalParams: {}},
    "Trémaux": {Class: TremauxMazeSolver, AdditionalParams: {}},
    "Wall Flower": {Class: WallFlowerMazeSolver, AdditionalParams: {}}
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

function handleAlgoChange()
{
    if (operationSelectorEl.value != "Generate" || generatorMap[generatorEl.value].Solvable)  unsolvableNoteEl.style.display = "none"
    else unsolvableNoteEl.style.display = "block"
}

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
    let stepInterval = stepIntervalEl.value;
    let stepsPerCycle = stepsPerCycleEl.value;
    let shouldVisualise = shouldVisualiseEl.checked;

    return {
        cycleInterval: 1000 - stepInterval, 
        stepsPerCycle: stepsPerCycle,
        shouldAnimate: shouldVisualise
    }
}

function ValidateBounds(el, ubound, lbound)
{
    if (el.value > ubound) el.value = ubound;
    else if(el.value < lbound)el.value = lbound;
}

function GetFormattedCoords(upperBoundX, upperBoundY)
{
    let start = {x: startXEl.value - 1, y: startYEl.value - 1};
    let finish = {x: finishXEl.value - 1, y: finishYEl.value - 1};

    if (start.x < 0) start.x = 0;
    if (start.y < 0) start.y = 0;
    if (finish.x < 0) finish.x = 0;
    if (finish.y < 0) finish.y = 0;

    if (start.x > upperBoundX) start.x = upperBoundX;
    if (start.y > upperBoundY) start.y = upperBoundY;
    if (finish.x > upperBoundX) finish.x = upperBoundX;
    if (finish.y > upperBoundY) finish.y = upperBoundY;

    return {start, finish};
}

function Generate()
{
    currentMaze = null;
    let mazeHeight = mazeHeightEl.value;
    let mazeWidth = mazeWidthEl.value;
    let generatorSelection = generatorMap[generatorEl.value];

    let generator = new generatorSelection.Class(
        mazeHeight, mazeWidth, generatorSelection.AdditionalParams);
    
    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);
    
    illustrator.EraseContents();

    Go(generator, illustrator, (mazeObj) =>{
        let maze = mazeObj.GetFormattedMaze();
        if (maze.solvable)
        {
            currentMaze = maze.maze;
            startXEl.value = 1;
            startYEl.value = 1;
            finishXEl.value = mazeWidth;
            finishYEl.value = mazeHeight;
        }
        else maze = null;
    });
}

function Solve()
{
    if (currentMaze == null) 
    {
        alert("You must generate a valid maze first!");
        return;
    }

    let mazeHeight = currentMaze.length;
    let mazeWidth = currentMaze[0].length;
    let solverSelection = solverMap[solverEl.value];   

    let coords = GetFormattedCoords(currentMaze.length - 1, currentMaze[0].length - 1)

    let solver = new solverSelection.Class(currentMaze, {row: coords.start.y, col: coords.start.x}, 
        {row: coords.finish.y, col: coords.finish.x}, solverSelection.AdditionalParams);
    
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
            genResult = mazeGen.next(1);
        } while (!genResult.done);

        maze.Draw(illustrator);
        inProgress = false;
        cb(maze);
    }
}