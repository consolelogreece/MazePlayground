let mazeCanvas = document.getElementById("MazeCanvas");

let ctx = mazeCanvas.getContext("2d");

let inProgress = false;

let generatorMap = {
    "Recursive Backtrack": RecursiveBacktrackMazeGen,
    "Ellers": EllersMazeGen
};

let solverMap = {
    "Recursive Backtrack": RecursiveBacktrackMazeSolver
};

(function _(){
    let generatorSelector = document.getElementById("GeneratorSelector");
    for (let key in generatorMap)
    {
        var opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = key;
        generatorSelector.appendChild(opt);
    }
})();

function Go()
{
    var height = document.getElementById("MazeHeightInput").value;
    var width = document.getElementById("MazeWidthInput").value;
    var stepInterval = document.getElementById("stepInterval").value;
    var generator = generatorMap[document.getElementById("GeneratorSelector").value];

    Generate(height, width, stepInterval, generator)
}

function Generate(mazeHeight = 10, mazeWidth = 10, stepInterval, generator)
{
    let maze = new generator(
        mazeHeight, mazeWidth, {row: 0, col: 0}, {row: mazeHeight - 1, col: mazeWidth - 1});

    let illustrator = new Illustrator(ctx, mazeWidth, mazeHeight);

    let mazeGen = maze.StepMaze();

    if (stepInterval > 0)
    {
        let interval = setInterval(function(){ 
        let genResult = mazeGen.next(1);
        if (genResult.done) 
        {
            clearInterval(interval);
        }
        else genResult.value.Draw(illustrator);
        }, stepInterval);
    }
    else
    {
        let genResult;
        do 
        {
        genResult = mazeGen.next(1)
        } while (!genResult.done)
    }

    maze.Draw(illustrator);
}