// file used to show legal moves on click of a piece by user. getLegalMoves will be used in other files.

// functions to convert a position in one form to other.
function posToId(pos) {
    return `${String.fromCharCode(parseInt(pos/8)+97)}${pos%8+1}`;
}
function idToPos(id) {
    return (id[0].charCodeAt()-97)*8 + parseInt(id[1])-1;
}
function posToElem(pos) {
    return document.getElementById(posToId(pos));
}
function elemToPos(elem) {
    return idToPos(elem.id);
}
function elemToPiece(elem) {
    url = window.getComputedStyle(elem)['backgroundImage'];
    let idx = url.indexOf('Images/');
    if (idx==-1) return 'none';
    return url.substr(idx+7, 2);
}
function posToPiece(pos) {
    if (pos<0 || pos>=64) return 'none';
    return elemToPiece(posToElem(pos));
}

function showLegalMoves(pos) {
    let elem = posToElem(pos);
    elem.style.backgroundColor = 'grey';
    arrAttk = getLegalMoves(pos);
    for (newPos of arrAttk[0]) { // piece can go to this square
        elem = posToElem(newPos);
        elem.classList += ' attacking';
        elem.style.backgroundImage = `url('../static/Images/attk.png')`;
    }
    for (newPos of arrAttk[1]) { // piece can capture opponent's piece
        elem = posToElem(newPos);
        elem.classList += ' threat-col';
        url = window.getComputedStyle(elem)['backgroundImage'];
        elem.style.backgroundColor = 'lightgreen';
        elem.style.backgroundImage = url;
    }
}

// this function takes into account the rules of movement of a piece and also takes care of the fact that that piece's
// king should not be in check.
function getLegalMoves(pos) {
    pieceAndCol = posToPiece(pos);
    let pieceCol = pieceAndCol[0];
    let piece = pieceAndCol[1];
    let i = parseInt(pos/8);
    let j = pos%8;
    if (piece=='p') {
        if (pieceCol=='w') arrAttk = whitePawnMoves(i, j);
        else arrAttk = blackPawnMoves(i, j);
    }
    else if (piece == 'n') arrAttk = knightMoves(i, j);
    else if (piece == 'b') arrAttk = bishopMoves(i, j);
    else if (piece == 'r') arrAttk = rookMoves(i, j);
    else if (piece == 'q') arrAttk = queenMoves(i, j);
    else arrAttk = kingMoves(i, j, true);

    let arr = arrAttk[0], attacking = arrAttk[1];
    arr = arr.filter(newPos => !kingInCheck((pieceCol=='w' ? position[0]: position[16]), pos, newPos));
    if (piece == 'k') {
        if (arr.indexOf(pos+16)!=-1 && arr.indexOf(pos+8)==-1) arr.splice(arr.indexOf(pos+16));
        if (arr.indexOf(pos-16)!=-1 && arr.indexOf(pos-8)==-1) arr.splice(arr.indexOf(pos-16));
    }
    else if (piece == 'p') {
        if (pieceCol == 'w' && posToPiece(pos+1)!='none' && arr.indexOf(pos+2)!=-1) arr.splice(arr.indexOf(pos+2));
        if (pieceCol == 'b' && posToPiece(pos-1)!='none' && arr.indexOf(pos-2)!=-1) arr.splice(arr.indexOf(pos-2));
    }
    attacking = attacking.filter(newPos => !kingInCheck((pieceCol=='w' ? position[0]: position[16]), pos, newPos));
    return [arr, attacking];
}

// kingInCheck function checks if the king comes in check if the piece from piecePos to newPiecePos, if dontMove=true
// it checks if the king is in check in the current position.
function kingInCheck(kingPos, piecePos, newPiecePos, dontMove=false) {
    // algorithm is to get the set of all the possible captures can be made by opponent and if one of the square is
    // where the opponent's king's square, the move is not possible.
    let st = new Set();
    if (!dontMove) changePos(posToElem(piecePos), posToElem(newPiecePos));
    if (kingPos == piecePos) kingPos = newPiecePos;
    if (kingPos == position[0]) { // means white king
        for (let i=16; i<24; i++) if (position[i]!=-1) {
            let attacking = funcs[i-16](parseInt(position[i]/8), position[i]%8)[1];
            attacking.forEach(st.add, st);
        }
        for (let i=24; i<32; i++) if (position[i]!=-1) {
            m = parseInt(position[i]/8);
            n = position[i]%8;
            if (m+1<8) st.add((m+1)*8+(n-1));
            if (m-1>=0) st.add((m-1)*8+(n-1));
        }
    }
    else {
        for(let i=0; i<8; i++) if (position[i]!=-1) {
            let attacking = funcs[i](parseInt(position[i]/8), position[i]%8)[1];
            attacking.forEach(st.add, st);
        }
        for (let i=8; i<16; i++) if (position[i]!=-1) {
            m = parseInt(position[i]/8);
            n = position[i]%8;
            if (m+1<8) st.add((m+1)*8+(n+1));
            if (m-1>=0) st.add((m-1)*8+(n+1));
        }
    }
    if (!dontMove) changeBack(false);
    return st.has(kingPos);
}

// {pieceName}Moves functions defines rules of piece movement and calculates the attacking piece's positions.
// rules are also explained here
funcs = [kingMoves, queenMoves, bishopMoves, bishopMoves, knightMoves, knightMoves, rookMoves, rookMoves];

// king can move only one square to it's adjacent square. side-by-side or diagonally.
// only once the king can move 2 squares left or right from it's initial position where that side rook is also on it's
    // initial square + no pieces in between them + king should not get in check on it's path of movement
    // this is called castling in chess.
function kingMoves(i, j, checkCastling=false) {
    let arr = [];
    if (j+1<8) arr.push(i*8+j+1);
    if (i+1<8 && j+1<8) arr.push(i*8+j+9);
    if (i+1<8) arr.push(i*8+j+8);
    if (i+1<8 && j-1>=0) arr.push(i*8+j+7);
    if (j-1>=0) arr.push(i*8+j-1);
    if (i-1>=0 && j-1>=0) arr.push(i*8+j-9);
    if (i-1>=0) arr.push(i*8+j-8);
    if (i-1>=0 && j+1<8) arr.push(i*8+j-7);
    let circlePos = [], attacking = [], kingCol = posToPiece(i*8+j)[0];
    for (let pos of arr) {
        let pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') circlePos.push(pos);
        else if (pieceCol != kingCol) attacking.push(pos);
    }
    if (checkCastling && kingCol=='w' && i*8+j==32 && kingRookFirstMoves[0]==-1) {
        if (kingRookFirstMoves[2]==-1 && posToPiece(40)[0]=='n' && posToPiece(48)[0]=='n' && !kingInCheck(32,32,32)) circlePos.push(48);
        if (kingRookFirstMoves[1]==-1 && posToPiece(24)[0]=='n' && posToPiece(16)[0]=='n' && posToPiece(8)[0]=='n' && !kingInCheck(32,32,32)) circlePos.push(16);
    }
    if (checkCastling && kingCol=='b' && i*8+j==39 && kingRookFirstMoves[3]==-1) {
        if (kingRookFirstMoves[5]==-1 && posToPiece(47)[0]=='n' && posToPiece(55)[0]=='n' && !kingInCheck(39,39,39)) circlePos.push(55);
        if (kingRookFirstMoves[4]==-1 && posToPiece(31)[0]=='n' && posToPiece(23)[0]=='n' && posToPiece(15)[0]=='n' && !kingInCheck(39,39,39)) circlePos.push(23);
    }
    return [circlePos, attacking];
}

// pawns can move only one square up or down depending on the color and 2 squares from the initial position
// it can capture the piece one square diagonally up or down depending on the color.
// en-passant is one type of capture pawn can make. read about it on internet.
function whitePawnMoves(i, j) {
    let arr = [], attacking =[];
    if (!((j-1)%8) && position.indexOf(i*8+j+2)==-1) arr.push(i*8+(j+2));
    if (position.indexOf(i*8+j+1)==-1) arr.push(i*8+(j+1));
    if (posToPiece(i*8+j-7)[0] == 'b') attacking.push(i*8+j-7);
    if (posToPiece(i*8+j+9)[0] == 'b') attacking.push(i*8+j+9);

    // en-passant
    lastPlayed = stackMovesPlayed.at(-1);
    if (!lastPlayed) return [arr, attacking];
    let fromId = lastPlayed[0].id, toId = lastPlayed[1].id;
    if (j==4 && elemToPiece(lastPlayed[1])=='bp' && fromId[1]=='7' && toId[1]=='5') {
        if (fromId[0].charCodeAt()-97==i+1) arr.push(i*8+j+9);
        if (fromId[0].charCodeAt()-97==i-1) arr.push(i*8+j-7);
    }
    return [arr, attacking];
}

function blackPawnMoves(i, j) {
    let arr = [], attacking = [];
    if (!((j+2)%8) && position.indexOf(i*8+j-2)==-1) arr.push(i*8+(j-2));
    if (position.indexOf(i*8+j-1)==-1) arr.push(i*8+(j-1));
    if (posToPiece(i*8+j-9)[0] == 'w') attacking.push(i*8+j-9);
    if (posToPiece(i*8+j+7)[0] == 'w') attacking.push(i*8+j+7);

    // en-passant
    lastPlayed = stackMovesPlayed.at(-1);
    if (!lastPlayed) return [arr, attacking];
    let fromId = lastPlayed[0].id, toId = lastPlayed[1].id;
    if (j==3 && elemToPiece(lastPlayed[1])=='wp' && fromId[1]=='2' && toId[1]=='4') {
        if (fromId[0].charCodeAt()-97==i+1) {
            arr.push(i*8+j+7);
            attacking.push(i*8+j+8);
        }
        if (fromId[0].charCodeAt()-97==i-1) {
            arr.push(i*8+j-9);
            attacking.push(i*8+j-8);
        }
    }
    return [arr, attacking];
}

// bishop can move diagonally to any empty square given no piece comes in it's path
function bishopMoves(i, j) {
    let arr = [], attacking = [], bishopCol = posToPiece(i*8+j)[0], i1=i, j1=j;
    while (i1+1<8 && j1+1<8) {
        i1++, j1++;
        pos = i1*8+j1;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != bishopCol) attacking.push(pos);
            break;
        }
    }
    i1=i, j1=j;
    while (i1+1<8 && j1-1>=0) {
        i1++, j1--;
        pos = i1*8+j1;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != bishopCol) attacking.push(pos);
            break;
        }
    }
    i1=i, j1=j;
    while (i1-1>=0 && j1-1>=0) {
        i1--, j1--;
        pos = i1*8+j1;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != bishopCol) attacking.push(pos);
            break;
        }
    }
    i1=i, j1=j;
    while (i1-1>=0 && j1+1<8) {
        i1--, j1++;
        pos = i1*8+j1;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != bishopCol) attacking.push(pos);
            break;
        }
    }
    return [arr, attacking];
}

// rook can move straight up or down or left or right. similar to what  bishop can do.
function rookMoves(i, j) {
    let arr = [], attacking = [], rookCol = posToPiece(i*8+j)[0];
    i1=i;
    while (i1+1<8) {
        i1++;
        pos = i1*8+j;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != rookCol) attacking.push(pos);
            break;
        }
    }
    i1=i;
    while (i1-1>=0) {
        i1--;
        pos = i1*8+j;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != rookCol) attacking.push(pos);
            break;
        }
    }
    j1=j;
    while (j1-1>=0) {
        j1--;
        pos = i*8+j1;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != rookCol) attacking.push(pos);
            break;
        }
    }
    j1=j;
    while (j1+1<8) {
        j1++;
        pos = i*8+j1;
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') arr.push(pos);
        else {
            if (pieceCol != rookCol) attacking.push(pos);
            break;
        }
    }
    return [arr, attacking];
}

// combination of both rook and bishop
function queenMoves(i, j) {
    rookCirAtk = rookMoves(i, j);
    bishopCirAtk = bishopMoves(i, j);
    return [rookCirAtk[0].concat(bishopCirAtk[0]), rookCirAtk[1].concat(bishopCirAtk[1])];
}

// knight moves in L-shape. overriding the other pieces.
function knightMoves(i, j) {
    let arr = []
    if (i+1<8) {
        if (j+2<8) arr.push((i+1)*8+(j+2));
        if (j-2>=0) arr.push((i+1)*8+(j-2));
        if (i+2<8) {
            if (j+1<8) arr.push((i+2)*8+(j+1));
            if (j-1>=0) arr.push((i+2)*8+(j-1));
        }
    }
    if (i-1>=0) {
        if (j+2<8) arr.push((i-1)*8+(j+2)); 
        if (j-2>=0) arr.push((i-1)*8+(j-2));
        if (i-2>=0) {
            if (j+1<8) arr.push((i-2)*8+(j+1));
            if (j-1>=0) arr.push((i-2)*8+(j-1));
        }
    }
    let attacking = [], circlePos = [], colorKnight = posToPiece(i*8+j)[0];
    for (pos of arr) {
        pieceCol = posToPiece(pos)[0];
        if (pieceCol == 'n') circlePos.push(pos);
        else if (pieceCol != colorKnight) attacking.push(pos);
    }
    return [circlePos, attacking];
}