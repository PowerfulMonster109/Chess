var board;
var gameBoard;
var blockSize = 120;
var rows = 8;
var cols = 8;
var pieces;

var tempX,tempY

var pieceImages = {
    "P": new Image(), "R": new Image(), "N": new Image(), "B": new Image(),
    "Q": new Image(), "K": new Image(), "p": new Image(), "r": new Image(),
    "n": new Image(), "b": new Image(), "q": new Image(), "k": new Image()
};

var selectedPiece = null;
var whiteTurn;

var whiteCanCastleShort;
var whiteCanCastleLong;

var blackCanCastleShort;
var blackCanCastleLong;

var doublePawnMove = false;
var passantIndex = null

var legalMoves = new Set([])

pieceImages["P"].src = "assets/Chess_plt45.svg";
pieceImages["R"].src = "assets/Chess_rlt45.svg";
pieceImages["N"].src = "assets/Chess_nlt45.svg";
pieceImages["B"].src = "assets/Chess_blt45.svg";
pieceImages["Q"].src = "assets/Chess_qlt45.svg";
pieceImages["K"].src = "assets/Chess_klt45.svg";
pieceImages["p"].src = "assets/Chess_pdt45.svg";
pieceImages["r"].src = "assets/Chess_rdt45.svg";
pieceImages["n"].src = "assets/Chess_ndt45.svg";
pieceImages["b"].src = "assets/Chess_bdt45.svg";
pieceImages["q"].src = "assets/Chess_qdt45.svg";
pieceImages["k"].src = "assets/Chess_kdt45.svg";


window.onload = function () {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    gameBoard = board.getContext("2d");
    
    pieces = [
        ["r", "n", "b", "q", "k", "b", "n", "r"], // White back rank
        ["p", "p", "p", "p", "p", "p", "p", "p"], // White pawns
        ["", "", "", "", "", "", "", ""], // Empty row
        ["", "", "", "", "", "", "", ""], // Empty row
        ["", "", "", "", "", "", "", ""], // Empty row
        ["", "", "", "", "", "", "", ""], // Empty row
        ["P", "P", "P", "P", "P", "P", "P", "P"], // Black pawns
        ["R", "N", "B", "Q", "K", "B", "N", "R"]  // Black back rank
    ];
    
    /*
    pieces = [
        ["", "", "", "", "", "", "", ""], 
        ["", "", "", "", "", "", "", ""], 
        ["", "", "", "", "", "b", "", ""], 
        ["", "", "", "", "N", "", "", ""], 
        ["", "", "", "", "", "", "", ""], 
        ["", "k", "", "", "", "", "", ""], 
        ["", "", "", "", "", "", "", ""], 
        ["", "K", "", "", "", "", "", ""]
    ];
    */
    
    
    whiteTurn = true;

    whiteCanCastleShort = true;
    whiteCanCastleLong = true;

    blackCanCastleShort = true;
    blackCanCastleLong = true;

    drawBoard(); // Call update to draw the board
    drawPieces();
    displayResult(whiteTurn)

    board.addEventListener("mousedown",onMouseDown)
};
function displayResult(isWhite){
    let result = checkGameOver(isWhite)

    if(result == "checkmate"){
        if(isWhite){
            document.getElementById("gameResult").innerText = "Checkmate! Black Wins!";
        }
        else{
            document.getElementById("gameResult").innerText = "Checkmate! White Wins!";
        }
    }
    else if(result == "stalemate"){
        document.getElementById("gameResult").innerText = "Stalemate! It's a draw.";
    }
    else if(result == "insufficient"){
        document.getElementById("gameResult").innerText = "Insufficient Material! It's a draw.";
    }
}
function drawBoard() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if((i + j) % 2 == 0){
                gameBoard.fillStyle = "rgb(222,220,220)"
            } 
            else{
                gameBoard.fillStyle = "rgb(69,55,54)"
            }
            gameBoard.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
        }
    }   
}
function drawPieces(){
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            let piece = pieces[i][j];
            if(piece != ""){
                gameBoard.drawImage(pieceImages[piece],j*blockSize,i*blockSize,blockSize,blockSize)
            }
        }
    }
}
function onMouseDown(event){
    
    let x = Math.floor(event.offsetX / blockSize)
    let y = Math.floor(event.offsetY / blockSize)

    if(whiteTurn && pieces[y][x] != "" && pieces[y][x] != pieces[y][x].toLowerCase()){
        tempX = x
        tempY = y
        
        selectedPiece = pieces[y][x]
        drawBoard();
        generateLegalMoves(selectedPiece,x,y,true)   
    }
    else if(!whiteTurn && pieces[y][x] != "" && pieces[y][x] != pieces[y][x].toUpperCase()){  
        tempX = x
        tempY = y

        selectedPiece = pieces[y][x]
        drawBoard();
        generateLegalMoves(selectedPiece,x,y,true)
            
    }
    else if(!(selectedPiece == null)){
        if(legalMoves.has(`${y},${x}`)){
            if(selectedPiece == 'K' && tempX - x == -2){
                pieces[y][x] = selectedPiece
                pieces[y][x-1] = 'R'
                pieces[tempY][tempX] = ""
                pieces[7][7] = ""
                whiteCanCastleLong = false
                whiteCanCastleShort = false
            }
            else if(selectedPiece == 'K' && tempX - x == 2){
                pieces[y][x] = selectedPiece
                pieces[y][x+1] = 'R'
                pieces[tempY][tempX] = ""
                pieces[7][0] = ""
                whiteCanCastleLong = false
                whiteCanCastleShort = false
            }
            else if(selectedPiece == 'k' && tempX - x == -2){
                pieces[y][x] = selectedPiece
                pieces[y][x-1] = 'r'
                pieces[tempY][tempX] = ""
                pieces[0][7] = ""
                blackCanCastleLong = false
                blackCanCastleShort = false
            }
            else if(selectedPiece == 'k' && tempX - x == 2){
                pieces[y][x] = selectedPiece
                pieces[y][x+1] = 'r'
                pieces[tempY][tempX] = ""
                pieces[0][0] = ""
                blackCanCastleLong = false
                blackCanCastleShort = false
            }
            //en passant checks
            else if(selectedPiece == 'P' && pieces[tempY][tempX-1] == 'p' && doublePawnMove && x == passantIndex){
                pieces[tempY][tempX-1] = ""
                pieces[tempY][tempX] = ""
                pieces[y][x] = 'P'
            }
            else if(selectedPiece == 'P' && pieces[tempY][tempX+1] == 'p' && doublePawnMove && x == passantIndex){
                pieces[tempY][tempX+1] = ""
                pieces[tempY][tempX] = ""
                pieces[y][x] = 'P'
            }
            else if(selectedPiece == 'p' && pieces[tempY][tempX-1] == 'P' && doublePawnMove && x == passantIndex){
                pieces[tempY][tempX-1] = ""
                pieces[tempY][tempX] = ""
                pieces[y][x] = 'p'
            }
            else if(selectedPiece == 'p' && pieces[tempY][tempX+1] == 'P' && doublePawnMove && x == passantIndex){
                pieces[tempY][tempX+1] = ""
                pieces[tempY][tempX] = ""
                pieces[y][x] = 'p'
            }
            else{
                if(selectedPiece == 'K' || selectedPiece == 'R'){
                    if(tempY == 7 && tempX == 7){
                        whiteCanCastleShort = false
                    }
                    else if(tempY == 7 && tempX == 0){
                        whiteCanCastleLong = false
                    }
                    else{
                        whiteCanCastleLong = false
                        whiteCanCastleShort = false
                    }
                }
                else if(selectedPiece == 'k' || selectedPiece == 'r'){
                    if(tempY == 0 && tempX == 7){
                        blackCanCastleShort = false
                    }
                    else if(tempY == 0 && tempX == 0){
                        blackCanCastleLong = false
                    }
                    else{
                        blackCanCastleLong = false
                        blackCanCastleShort = false
                    }
                }
                if(selectedPiece == 'p' && pieces[y-2][x] == selectedPiece){
                    doublePawnMove = true
                    passantIndex = x
                }
                else if(selectedPiece == 'P' && pieces[y+2][x] == selectedPiece){
                    doublePawnMove = true
                    passantIndex = x
                }
                else{
                    doublePawnMove = false
                    passantIndex = null
                }
                pieces[y][x] = selectedPiece
                pieces[tempY][tempX] = ""
            }  
            for (let i = 0; i < 8; i++){
                if(pieces[0][i] == 'P'){
                    pieces[0][i] = 'Q'
                }
                if(pieces[7][i] == 'p'){
                    pieces[7][i] = 'q'
                }
            }
            selectedPiece = null
            whiteTurn = !whiteTurn
            drawBoard();
            drawPieces();
            displayResult(whiteTurn)
        }
        else{
            selectedPiece = null
            drawBoard();
            drawPieces();
        }
    }
}
function findKing(pieces, isWhite) {
    let kingSymbol = isWhite ? "K" : "k";
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (pieces[y][x] === kingSymbol) {
                return { y, x };
            }
        }
    }
    return null; // Should never happen in a valid game
}
function checkKingInCheck(pieces){
    if(whiteTurn){
        let kingPos = findKing(pieces,true)
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1]
        ]
        let {y, x} = kingPos
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx
    
                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == 'r' || pieces[newY][newX] == 'q'){
                    return true
                }
                else{
                    if(pieces[newY][newX] != ""){
                        break;
                    }
                }
                i++;
            }
        }
        directions = [
            [-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx
    
                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == 'b' || pieces[newY][newX] == 'q'){
                    return true
                }
                else{
                    if(pieces[newY][newX] != ""){
                        break;
                    }
                }
                i++;
            }
        }
        directions = [
            [-2,-1],[-2,1],[2,-1],[2,1],[-1,2],[1,2],[-1,-2],[1,-2]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == 'n'){
                    return true
                }
            }
        }
        directions = [
            [-1,-1],[-1,1]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == 'p'){
                    return true
                }
            }
        }
        directions = [
            [-1,0],[1,0],[0,1],[0,-1],[-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == 'k'){
                    return true
                }
            }
        }
    }
    else{
        let kingPos = findKing(pieces,false)
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1]
        ]
        let {y,x} = kingPos
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx
    
                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == 'R' || pieces[newY][newX] == 'Q'){
                    return true
                }
                else{
                    if(pieces[newY][newX] != ""){
                        break;
                    }
                }
                i++;
            }
        }
        directions = [
            [-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx
    
                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == 'B' || pieces[newY][newX] == 'Q'){
                    return true
                }
                else{
                    if(pieces[newY][newX] != ""){
                        break;
                    }
                }
                i++;
            }
        }
        directions = [
            [-2,-1],[-2,1],[2,-1],[2,1],[-1,2],[1,2],[-1,-2],[1,-2]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == 'N'){
                    return true
                }
            }
        }
        directions = [
            [1,-1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == 'P'){
                    return true
                }
            }
        }
        directions = [
            [-1,0],[1,0],[0,1],[0,-1],[-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == 'K'){
                    return true
                }
            }
        }
    }
    return false
}
function simulatePieceMove(board, fromY, fromX, toY, toX){
    let originalPiece = board[toY][toX]
    let movingPiece = board[fromY][fromX]

    board[toY][toX] = movingPiece
    board[fromY][fromX] = ""

    let kingInCheck = checkKingInCheck(board)

    board[toY][toX] = originalPiece
    board[fromY][fromX] = movingPiece


    return kingInCheck
}
function generateLegalMoves(piece,x,y,doColor){
    legalMoves.clear()
    if(piece == 'P'){
        if(y == 6){
            for(let i = y-1; i > y-3;i--){
                if(pieces[i][x] == ""){
                    if(!simulatePieceMove(pieces,y,x,i,x)){
                        legalMoves.add(`${i},${x}`);
                    } 
                }
                else{
                    break
                }
            }
        }
        else if(pieces[y-1][x] == ""){
            if(!simulatePieceMove(pieces,y,x,y-1,x)){
                legalMoves.add(`${y-1},${x}`);
            } 
        }

        if(x > 0){
            if((pieces[y-1][x-1] != "" && pieces[y-1][x-1] != pieces[y-1][x-1].toUpperCase()) || (doublePawnMove && passantIndex == x-1)){
                if(!simulatePieceMove(pieces,y,x,y-1,x-1)){
                    legalMoves.add(`${y-1},${x-1}`);
                } 
            }
        }
        if(x < 7){
            if((pieces[y-1][x+1] != "" && pieces[y-1][x+1] != pieces[y-1][x+1].toUpperCase()) || (doublePawnMove && passantIndex == x+1)){
                if(!simulatePieceMove(pieces,y,x,y-1,x+1)){
                    legalMoves.add(`${y-1},${x+1}`);
                } 
            }
        }
    }
    else if(piece == 'p'){
        if(y == 1){
            for(let i = y+1; i < y+3;i++){
                if(pieces[i][x] == ""){
                    if(!simulatePieceMove(pieces,y,x,i,x)){
                        legalMoves.add(`${i},${x}`);
                    } 
                }
                else{
                    break
                }
            }
        }
        else if(pieces[y+1][x] == ""){
            if(!simulatePieceMove(pieces,y,x,y+1,x)){
                legalMoves.add(`${y+1},${x}`);
            } 
        }
        if(x > 0){
            if((pieces[y+1][x-1] != "" && pieces[y+1][x-1] != pieces[y+1][x-1].toLowerCase()) || (doublePawnMove && passantIndex == x-1)){
                if(!simulatePieceMove(pieces,y,x,y+1,x-1)){
                    legalMoves.add(`${y+1},${x-1}`);
                } 
            }
        }
        if(x < 7){
            if((pieces[y+1][x+1] != "" && pieces[y+1][x+1] != pieces[y+1][x+1].toLowerCase()) || (doublePawnMove && passantIndex == x+1)){
                if(!simulatePieceMove(pieces,y,x,y+1,x+1)){
                    legalMoves.add(`${y+1},${x+1}`);
                } 
            }
        }
        
    }
    else if(piece == 'B'){
        let directions = [
            [-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx

                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toUpperCase()){
                        break;
                    }
                    else{
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                        break;
                    }
                }
                i++;
            }
            
        }
    }
    else if(piece == 'b'){
        let directions = [
            [-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx

                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toLowerCase()){
                        break;
                    }
                    else{
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                        break;
                    }
                }
                i++;
            }
            
        }
    }
    else if(piece == 'R'){
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx

                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toUpperCase()){
                        break;
                    }
                    else{
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                        break;
                    }
                }
                i++;
            }
            
        }
    }
    else if(piece == 'r'){
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx

                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toLowerCase()){
                        break;
                    }
                    else{
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                        break;
                    }
                }
                i++;
            }
            
        }
    }
    else if(piece == 'Q'){
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1],[-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx

                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toUpperCase()){
                        break;
                    }
                    else{
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                        break;
                    }
                }
                i++;
            }
            
        }
    }
    else if(piece == 'q'){
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1],[-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let i = 1
            while(true){
                let newY = y + i * dy
                let newX = x + i * dx

                if(newY < 0 || newY > 7 || newX < 0 || newX > 7){
                    break;
                }
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toLowerCase()){
                        break;
                    }
                    else{
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                        break;
                    }
                }
                i++;
            }
            
        }
    }
    else if(piece == 'N'){
        let directions = [
            [-2,-1],[-2,1],[2,-1],[2,1],[-1,2],[1,2],[-1,-2],[1,-2]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toLowerCase()){
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                }
            }
        }
    }
    else if(piece == 'n'){
        let directions = [
            [-2,-1],[-2,1],[2,-1],[2,1],[-1,2],[1,2],[-1,-2],[1,-2]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toUpperCase()){
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                }
            }
        }
    }
    else if(piece == 'K'){
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1],[-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toLowerCase()){
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                }
            }
        }
        directions = [
            [0,-2], [0,2]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(newX == x+2){
                    if(pieces[newY][newX] == "" && pieces[newY][newX-1] == "" && whiteCanCastleShort){
                        if(!checkKingInCheck(pieces,true) && !simulatePieceMove(pieces,y,x,newY,newX) && !simulatePieceMove(pieces,y,x,newY,newX-1)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                }
                else if(newX == x-2){
                    if(pieces[newY][newX] == "" && pieces[newY][newX-1] == "" && pieces[newY][newX+1] == "" && whiteCanCastleLong){
                        if(!checkKingInCheck(pieces,true) && !simulatePieceMove(pieces,y,x,newY,newX) && !simulatePieceMove(pieces,y,x,newY,newX+1)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                } 
            }
        }
    }
    else if(piece == 'k'){
        let directions = [
            [-1,0],[1,0],[0,1],[0,-1],[-1,-1],[1,-1],[-1,1],[1,1]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(pieces[newY][newX] == ""){
                    if(!simulatePieceMove(pieces,y,x,newY,newX)){
                        legalMoves.add(`${newY},${newX}`);
                    } 
                }
                else{
                    if(pieces[newY][newX] == pieces[newY][newX].toUpperCase()){
                        if(!simulatePieceMove(pieces,y,x,newY,newX)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                }
            }
        }
        directions = [
            [0,-2], [0,2]
        ]
        for(let [dy,dx] of directions){
            let newY = y + dy
            let newX = x + dx

            if(newY > -1 && newY < 8 && newX > -1 && newX < 8){
                if(newX == x+2){
                    if(pieces[newY][newX] == "" && pieces[newY][newX-1] == "" && blackCanCastleShort){
                        if(!checkKingInCheck(pieces,false) && !simulatePieceMove(pieces,y,x,newY,newX) && !simulatePieceMove(pieces,y,x,newY,newX-1)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                }
                else{
                    if(pieces[newY][newX] == "" && pieces[newY][newX-1] == "" && pieces[newY][newX+1] == "" && blackCanCastleLong){
                        if(!checkKingInCheck(pieces,false) && !simulatePieceMove(pieces,y,x,newY,newX) && !simulatePieceMove(pieces,y,x,newY,newX+1)){
                            legalMoves.add(`${newY},${newX}`);
                        } 
                    }
                } 
            }
        }
    }
    if(doColor){
        colorLegalMoves(legalMoves)
    }
}
function colorLegalMoves(moves){
    gameBoard.fillStyle = "rgb(158,68,62)"

    for (let move of moves) {
        let [y, x] = move.split(',').map(Number);
        gameBoard.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    }
    drawPieces();
}
function checkGameOver(isWhite){
    let numPieces = 0
    let knights = 0;
    let bishops = 0;
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            if(numPieces > 3){
                break
            }
            
            if(pieces[y][x] == 'B' || pieces[y][x] == 'b'){
                bishops++;
                numPieces++;
            }
            else if(pieces[y][x] == 'N' || pieces[y][x] == 'n'){
                knights++;
                numPieces++;
            }
            else if(pieces[y][x] != ""){
                numPieces++;
            }
        }
    }
    if(numPieces <= 3 && (knights == 1 || bishops == 1)){
        return "insufficient"
    }
    if(isWhite){
        for(let y = 0; y < 8; y++){
            for (let x = 0; x < 8; x++){
                let piece = pieces[y][x];
                if(piece == piece.toUpperCase()){
                    generateLegalMoves(piece, x, y,false)
                    if(legalMoves.size > 0){
                        return false
                    }
                }
            }
        }
        if(checkKingInCheck(pieces,true)){
            return "checkmate";
        }
        return "stalemate"
    }
    else{
        for(let y = 0; y < 8; y++){
            for (let x = 0; x < 8; x++){
                let piece = pieces[y][x];
                if(piece == piece.toLowerCase()){
                    generateLegalMoves(piece, x, y,false)
                    if(legalMoves.size > 0){
                        return false
                    }
                }
            }
        }
        if(checkKingInCheck(pieces,false)){
            return "checkmate";
        }
        return "stalemate"
    }
} 