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
        this.ctx.lineWidth = 1;
        for (var col = 0; col <= this.bw; col += this.cellWidth) {
            this.ctx.moveTo(0.5 + col + p, p);
            this.ctx.lineTo(0.5 + col + p, this.bh + p);
        }

        for (var row = 0; row <= this.bh; row += this.cellHeight) {
            this.ctx.moveTo(p, 0.5 + row + p);
            this.ctx.lineTo(this.bw + p, 0.5 + row + p);
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
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(0.5 + fromCol, 0.5 + fromRow);
            this.ctx.lineTo(0.5 + toCol, 0.5 + toRow);
            this.ctx.strokeStyle = "#222";
            this.ctx.stroke();     
        });   
    }

    DrawCircleAtLocation(row, col, radialDeterminantFunc, fillStyle)
    {
        let radius = radialDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.arc((col * this.cellWidth) + (this.cellWidth / 2), (row * this.cellHeight) + (this.cellHeight / 2), radius / 3, 0, 360);
        this.ctx.fill(); 
    }
}