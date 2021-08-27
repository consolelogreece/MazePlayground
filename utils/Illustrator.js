class Illustrator
{
    constructor(ctx, mazeWidth, mazeHeight)
    {
        this.ctx = ctx;
        this.bw = ctx.canvas.width
        this.bh = ctx.canvas.height
        this.cellWidth = this.bw / mazeWidth;
        this.cellHeight = this.bh / mazeHeight;
        this.mazeBGColour = "#222";
        this.wallWidth = 1;
    }

    EraseContents()
    {
        this.ctx.fillStyle = "#222";
        this.ctx.fillRect(0, 0, this.bw, this.bh);
    }

    DrawGrid()
    {      
        var p = 0;
        this.ctx.lineWidth = this.wallWidth;

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

    ConvertDirToLineCoords(row, col, dir)
    {
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
        
        return {fromX: fromCol, fromY: fromRow, toX: toCol, toY: toRow};
    }
    
    DrawWallBreaks(cell)
    {
        let row = cell.row;
        let col = cell.col;

        cell.connectedCells.forEach(dir => {
            this.DrawWall(row, col, dir, this.mazeBGColour)   
        });   
    }

    DrawChamber(topLeftCellRow, topLeftCellCol, bottomRightCellRow, bottomRightCellCol)
    {
        let fromX = (topLeftCellCol * this.cellWidth) + 0.5;
        let fromY = (topLeftCellRow * this.cellHeight) + 0.5;

        let height = (bottomRightCellRow - topLeftCellRow + 1) * this.cellHeight;
        let width = (bottomRightCellCol - topLeftCellCol + 1) * this.cellWidth

        this.ctx.strokeStyle = "orange";
        this.ctx.rect(fromX, fromY, width, height);
        ctx.stroke(); 
    }

    DrawCircleAtLocation(row, col, radialDeterminantFunc, fillStyle)
    {
        let radius = radialDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.arc((col * this.cellWidth) + (this.cellWidth / 2), (row * this.cellHeight) + (this.cellHeight / 2), radius / 3, 0, 360);
        this.ctx.fill(); 
    }

    DrawLineBetweenCells(fromRow, fromCol, toRow, toCol, fillStyle, lineWidth = 3, offsetXDeterminantFunc = _ => 0, offsetYDeterminantFunc = _ => 0)
    {
        let pixelOffsetX = offsetXDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        let pixelOffsetY = offsetYDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        let fromX = ((fromCol * this.cellWidth) + this.cellWidth / 2) + pixelOffsetX;
        let toX = ((toCol * this.cellWidth) + this.cellWidth / 2) + pixelOffsetX;
        let fromY = ((fromRow * this.cellHeight) + this.cellHeight / 2) + pixelOffsetY;
        let toY = ((toRow * this.cellHeight) + this.cellHeight / 2) + pixelOffsetY;

        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(0.5 + fromX, 0.5 + fromY);
        this.ctx.lineTo(0.5 + toX, 0.5 + toY);
        this.ctx.strokeStyle = fillStyle;
        this.ctx.stroke();  
    }

    DrawTextInCell(row, col, text)
    {
        let fontSize = this.cellWidth / 2;

        let x = col * this.cellWidth;
        let y = (row + 1) * this.cellHeight;
        this.ctx.font = fontSize + "px Arial";
        this.ctx.fillStyle = "red";
        ctx.fillText(text, x, y);
    }

    DrawWall(row, col, dir, colour, lineWidth = 3)
    {
        let lineCoords = this.ConvertDirToLineCoords(row, col, dir)

        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.ctx.moveTo(0.5 + lineCoords.fromX, 0.5 + lineCoords.fromY);
        this.ctx.lineTo(0.5 + lineCoords.toX, 0.5 + lineCoords.toY);
        this.ctx.strokeStyle = colour;
        this.ctx.stroke();     
    }

    DrawLine(row, col, orientation, colour, lengthDeterminantFunc = _ => 0, offsetXDeterminantFunc = _ => 0, offsetYDeterminantFunc = _ => 0)
    {
        let length = lengthDeterminantFunc({width: this.cellWidth, height: this.cellHeight})
        let pixelOffsetX = offsetXDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        let pixelOffsetY = offsetYDeterminantFunc({width: this.cellWidth, height: this.cellHeight});
        let x = (this.cellWidth * col) + (this.cellWidth / 2) + pixelOffsetX;
        let y = (this.cellHeight * row) + (this.cellHeight / 2) + pixelOffsetY;
        let toX;
        let toY;

        if (orientation == "horizontal")
        {
            x -= length / 2;
            toX = x + length;  
            toY = y;
        }
        else
        {
            y -= length / 2;
            toY = y + length;
            toX = x;
        }

        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.moveTo(0.5 + x, 0.5 + y);
        this.ctx.lineTo(0.5 + toX, 0.5 + toY);
        this.ctx.strokeStyle = colour;
        this.ctx.stroke();     
    }

    FillCell(row, col, colour)
    {
        let fromX = (col * this.cellWidth) + 0.5;
        let fromY = (row * this.cellHeight) + 0.5;

        let width = this.cellWidth;
        let height = this.cellHeight;
        
        this.ctx.beginPath();
        this.ctx.fillStyle = colour;
        this.ctx.rect(fromX, fromY, width, height);

        this.ctx.fill(); 
    }

    EraseCellContents(row, col)
    {
        let fromX = (col * this.cellWidth) + 0.5;
        let fromY = (row * this.cellHeight) + 0.5;

        this.ctx.beginPath();
        this.ctx.fillStyle = this.mazeBGColour;
        this.ctx.rect(fromX, fromY, this.cellWidth, this.cellHeight);

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.wallWidth / 2;
        
        this.ctx.fill(); 
        this.ctx.stroke();
    }
}