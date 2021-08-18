class Illustrator
{
    constructor(ctx, maze, mazeWidth, mazeHeight)
    {
        this.maze = maze;
        this.ctx = ctx;
        this.bw = ctx.canvas.width
        this.bh = ctx.canvas.height
        this.cellWidth = this.bw / mazeWidth;
        this.cellHeight = this.bh / mazeHeight;
    }

    DrawGrid()
    {
        this.ctx.fillStyle = "#222";
        this.ctx.fillRect(0, 0, this.bw, this.bh);

        var p = 0;

        for (var x = 0; x <= this.bw; x += this.cellWidth) {
            this.ctx.moveTo(0.5 + x + p, p);
            this.ctx.lineTo(0.5 + x + p, this.bh + p);
        }

        for (var x = 0; x <= this.bh; x += this.cellHeight) {
            this.ctx.moveTo(p, 0.5 + x + p);
            this.ctx.lineTo(this.bw + p, 0.5 + x + p);
        }
        
        this.ctx.strokeStyle = "#bbb";
        this.ctx.stroke();
    }

    DrawWallBreaks(cell)
    {
        let row = cell.x;
        let col = cell.y;

        cell.connectedCells.forEach(dir => {
            let fromX = 0;
            let fromY = 0;
            let toX = 0;
            let toY = 0;
            
            switch(dir)
            {                   
                case "left":
                    fromX = row * this.cellWidth;
                    fromY = col * this.cellHeight;
                    toX = fromX;
                    toY = fromY + this.cellHeight;
                    break;
                case "right":
                    fromX = (row + 1)  * this.cellWidth;
                    fromY = col * this.cellHeight;
                    toX = fromX;
                    toY = fromY + this.cellHeight;
                    break;
                case "up":
                    fromX = row * this.cellWidth;
                    fromY = col * this.cellHeight;
                    toX = fromX + this.cellWidth;
                    toY = fromY;
                    break;
                case "down":                        
                    fromX = row  * this.cellWidth;
                    fromY = (col + 1) * this.cellHeight;
                    toX = fromX + this.cellWidth;
                    toY = fromY;
                    break;
            }        

            this.ctx.beginPath();
            this.ctx.moveTo(0.5 + fromX, 0.5 + fromY);
            this.ctx.lineTo(0.5 + toX, 0.5 +  toY);
            this.ctx.strokeStyle = "#222";
            this.ctx.stroke();     
        });   
    }
}