class Illustrator
{
    constructor(ctx, mazeWidth, mazeHeight)
    {
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
        let row = cell.row;
        let col = cell.col;

        cell.connectedCells.forEach(dir => {
            let fromCol = 0;
            let fromRow = 0;
            let toCol = 0;
            let toRow = 0;
            
            switch(dir)
            {                   
                case "left":
                    fromCol = col * this.cellWidth;
                    fromRow = row * this.cellHeight;
                    toCol = fromCol;
                    toRow = fromRow + this.cellHeight;
                    break;
                case "right":
                    fromCol = (col + 1)  * this.cellWidth;
                    fromRow = row * this.cellHeight;
                    toCol = fromCol;
                    toRow = fromRow + this.cellHeight;
                    break;
                case "up":
                    fromCol = col * this.cellWidth;
                    fromRow = row * this.cellHeight;
                    toCol = fromCol + this.cellWidth;
                    toRow = fromRow;
                    break;
                case "down":                        
                    fromCol = col * this.cellWidth;
                    fromRow = (row + 1) * this.cellHeight;
                    toCol = fromCol + this.cellWidth;
                    toRow = fromRow;
                    break;
            }        

            this.ctx.beginPath();
            this.ctx.moveTo(0.5 + fromRow, 0.5 + fromCol);
            this.ctx.lineTo(0.5 + toRow, 0.5 + toCol);
            this.ctx.strokeStyle = "#222";
            this.ctx.stroke();     
        });   
    }

    DrawCircleAtLocation(x, y, radialDeterminantFunc, fillStyle)
    {
        let radius = radialDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.arc((x * this.cellWidth) + (this.cellWidth / 2), (y * this.cellHeight) + (this.cellHeight / 2), radius / 3, 0, 360);
        this.ctx.fill(); 
    }
}