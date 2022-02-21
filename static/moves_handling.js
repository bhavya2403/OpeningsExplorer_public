currcol = 'w';
selected = undefined;

function removeSelPieceStyles() {
    for (let i=0; i<64; i++) {
        let elem = posToElem(i);
        url = window.getComputedStyle(elem)['backgroundImage'];
        if (elem.classList.contains('attacking')) {
            elem.style.backgroundImage = 'none';
            elem.classList.remove('attacking');
        }
        let id = elem.id;
        if (!((id[0].charCodeAt()+parseInt(id[1])) % 2)) elem.style.backgroundColor = '#04aa6d';
        else elem.style.backgroundColor = 'white';
        if (elem.classList.contains('threat-col')) elem.classList.remove('threat-col');
    }
}

function checkPlayEnPassant(elem) {
    if (elemToPiece(selected)[1]=='p' && selected.id[0]!=elem.id[0] && elemToPiece(elem)=='none') {
        rf = selected.id[0], cf = selected.id[1], rt = elem.id[0], ct = elem.id[1];
        let elem1;
        if (rt>rf && ct>cf) elem1 = posToElem(elemToPos(selected)+8);
        if (rt<rf && ct>cf) elem1 = posToElem(elemToPos(selected)-8);
        if (rt>rf && ct<cf) elem1 = posToElem(elemToPos(selected)+8);
        if (rt<rf && ct<cf) elem1 = posToElem(elemToPos(selected)-8);
        elem1.style.backgroundImage = 'none';
        position[position.indexOf(elemToPos(elem1))] = -1;
    }
}

function checkPlayCastling(elem) {
    let elemPos = elemToPos(elem), selectedPos = elemToPos(selected), moveNum = movePlayedNames.length + 1;
    if (currcol == 'w') {
        if (selectedPos==32) {
            kingRookFirstMoves[0] = moveNum;
            if (elemPos == 48) {
                kingRookFirstMoves[2] = moveNum;
                changePos(posToElem(56), posToElem(40));
            }
            if (elemPos == 16) {
                kingRookFirstMoves[1] = moveNum;
                changePos(posToElem(0), posToElem(24));
            }
        }
        else if (selectedPos==0) kingRookFirstMoves[1] = moveNum;
        else if (selectedPos==56) kingRookFirstMoves[2] = moveNum;
    }
    else {
        if (selectedPos==39) {
            kingRookFirstMoves[3] = moveNum;
            if (elemPos == 55) {
                kingRookFirstMoves[5] = moveNum;
                changePos(posToElem(63), posToElem(47));
            }
            if (elemPos == 23) {
                kingRookFirstMoves[4] = moveNum;
                changePos(posToElem(7), posToElem(31));
            }
        }
        else if (selectedPos==7) kingRookFirstMoves[4] = moveNum;
        else if (selectedPos==63) kingRookFirstMoves[5] = moveNum;
    }
}

function moveClicked(elem) {
    if (!doneRequests) return notDoneWithRequests();
    if (selected) {
        let attacking = Array.from(document.querySelectorAll('.attacking')),
            captures = Array.from(document.querySelectorAll('.threat-col')),
            allPosAvail = attacking.map(elemToPos), allCapAvail = captures.map(elemToPos);
        removeSelPieceStyles();
        if (allPosAvail.includes(elemToPos(elem)) || allCapAvail.includes(elemToPos(elem))) {
            checkPlayEnPassant(elem);
            checkPlayCastling(elem);

            stackMovesPlayed.push([selected, elem, elemToPiece(elem), position.indexOf(elemToPos(elem))]);
            let moveString = getMoveString();
            changePos(selected, elem);
            currcol = (currcol=='w' ? 'b': 'w');
            selected = undefined;

            moveString += checkOrMate();
            movePlayedNames.push(moveString);
            changeInMovesBox();
            sendRequestMoveClick(moveString);
        }
        selected = undefined;
    }
    else {
        elemCol = elemToPiece(elem)[0];
        if (elemCol == currcol) {
            showLegalMoves(elemToPos(elem));
            selected = elem;
        }
    }
}

function checkOrMate() {
    if (currcol == 'w' && kingInCheck(position[0], position[0], position[0], true)) {
        let allMovesAvail = [];
        for (let i=0; i<16; i++) if (position[i]!=-1) {
            let arrAttk = getLegalMoves(position[i]);
            allMovesAvail = allMovesAvail.concat(arrAttk[0].concat(arrAttk[1]));
        }
        if (allMovesAvail.length) return '+';
        else return '#';
    }
    if (currcol == 'b' && kingInCheck(position[16], position[16], position[16], true)) {
        let allMovesAvail = [];
        for (let i=16; i<32; i++) if (position[i]!=-1) {
            let arrAttk = getLegalMoves(position[i]);
            allMovesAvail = allMovesAvail.concat(arrAttk[0].concat(arrAttk[1]));
        }
        if (allMovesAvail.length) return '+';
        else return '#';
    }
    return '';
}

function moveStrClick(str) {
    selected = undefined;

    if (str.at(-1) == '#' || str.at(-1) == '+') str = str.substr(0, str.length-1);
    let toId = str.substr(str.length-2, 2), fromId;
    str = str.substr(0, str.length-2);
    if (str=='') { // pawn move
        if (currcol=='w') {
            prevSqId = `${toId[0]}${parseInt(toId[1])-1}`;
            if (posToPiece(idToPos(prevSqId)) == 'wp') fromId = prevSqId;
            else fromId = `${toId[0]}${parseInt(toId[1])-2}`;
        }
        else {
            nextSqId = `${toId[0]}${parseInt(toId[1])+1}`;
            if (posToPiece(idToPos(nextSqId)) == 'bp') fromId = nextSqId;
            else fromId = `${toId[0]}${parseInt(toId[1])+2}`;
        }
    }
    else if (rows.includes(str[0])) { // pawn capture
        if (currcol == 'w') fromId = `${str[0]}${parseInt(toId[1])-1}`;
        else fromId = `${str[0]}${parseInt(toId[1])+1}`;
    }
    else if (str[0] == 'N') {
        if (currcol == 'w') posKnights = [position[4], position[5]];
        else posKnights = [position[20], position[21]];
        ids = [posToId(posKnights[0]), posToId(posKnights[1])];
        if (posKnights[0]==-1) fromId = ids[1];
        else if (posKnights[1]==-1) fromId = ids[0];
        else {
            diffRow = Math.abs(toId[0].charCodeAt()-ids[0][0].charCodeAt());
            diffCol = Math.abs(parseInt(toId[1])-parseInt(ids[0][1]));
            if ((diffRow==2 && diffCol==1) || (diffRow==1 && diffCol==2)) {
                if (str.at(-1)=='x') str = str.substr(0, str.length-1);
                if (str.length==2) {
                    if (str[1]==ids[0][0] || str[1]==ids[0][1]) fromId = ids[0];
                    else fromId = ids[1];
                }
                else fromId = ids[0];
            }
            else fromId = ids[1];
        }
    }
    else if (str[0] == 'B') {
        if (currcol == 'w') posBishops = [position[2], position[3]];
        else posBishops = [position[18], position[19]];
        ids = [posToId(posBishops[0]), posToId(posBishops[1])];
        if (posBishops[0] == -1) fromId = ids[1];
        else if (posBishops[1] == -1) fromId = ids[0];
        else {
            diffRow = Math.abs(toId[0].charCodeAt()-ids[0][0].charCodeAt());
            diffCol = Math.abs(parseInt(toId[1])-parseInt(ids[0][1]));
            if (diffRow==diffCol) fromId = ids[0];
            else fromId = ids[1];
        }
    }
    else if (str[0] == 'R') {
        if (currcol == 'w') posRooks = [position[6], position[7]];
        else posRooks = [position[22], position[23]];
        ids = [posToId(posRooks[0]), posToId(posRooks[1])];
        if (posRooks[0] == -1) fromId = ids[1];
        else if (posRooks[1] == -1) fromId = ids[0];
        else {
            arrAttk = getLegalMoves(posRooks[0]);
            arr = arrAttk[0].concat(arrAttk[1])
            if (arr.includes(idToPos(toId))) {
                if (str.at(-1)=='x') str = str.substr(0, str.length-1);
                if (str.length == 2) {
                    if (str[1]==ids[0][0] || str[1]==ids[0][1]) fromId = ids[0];
                    else fromId = ids[1];
                } 
                else fromId = ids[0];
            }
            else fromId = ids[1];
        }
    }
    else if (str[0] == 'Q') {
        if (currcol=='w') fromId = posToId(position[1]);
        else fromId = posToId(position[17]);
    }
    else if (str[0] =='K' || str[0]=='O') {
        if (currcol=='w') {
            fromId = posToId(position[0]);
            if (str=='O') toId = posToId(48);
            else if (str == 'O-O') toId = posToId(16);
        }
        else {
            fromId = posToId(position[16]);
            if (str=='O') toId = posToId(55);
            else if (str == 'O-O') toId = posToId(23);
        }
    }
    moveClicked(document.getElementById(fromId));
    moveClicked(document.getElementById(toId));
}

function getMoveString() {
    let fromElem = stackMovesPlayed.at(-1)[0], toElem = stackMovesPlayed.at(-1)[1],
        captured = stackMovesPlayed.at(-1)[2]!='none', ans = "", piece = elemToPiece(fromElem)[1];
    if (piece=='n') {
        ans += 'N';
        let fromPos=elemToPos(fromElem), toPos = elemToPos(toElem);
        let idx = position.indexOf(fromPos);
        if (idx%2) idx--;
        else idx++;
        let arrAttk = (position[idx]==-1 ? [[],[]]: getLegalMoves(position[idx]));
        if (arrAttk[0].includes(toPos) || arrAttk[1].includes(toPos)) {
            if (fromElem.id[0] == posToId(position[idx])) ans += fromElem.id[1];
            else ans += fromElem.id[0];
        }   
    }
    else if (piece=='b') ans += 'B';
    else if (piece=='r') {
        ans += 'R';
        let fromPos=elemToPos(fromElem), toPos = elemToPos(toElem);
        let idx = position.indexOf(fromPos);
        if (idx%2) idx--;
        else idx++;
        let arrAttk = (position[idx]==-1 ? [[],[]]: getLegalMoves(position[idx]));
        if (arrAttk[0].includes(toPos) || arrAttk[1].includes(toPos)) {
            if (fromElem.id[0] == posToId(position[idx])) ans += fromElem.id[1];
            else ans += fromElem.id[0];
        }
    }
    else if (piece=='q') ans += 'Q';
    else if (piece=='k') {
        if (elemToPos(toElem)-elemToPos(fromElem) == 16) return 'O-O';
        if (elemToPos(fromElem)-elemToPos(toElem) == 16) return 'O-O-O';
        ans += 'K';
    }
    else if (fromElem.id[0] != toElem.id[0]) captured = true, ans += fromElem.id[0];

    return ans + (captured? 'x': '') + toElem.id;
}

var savePrev;
function changePos(fromElem, toElem) {
    savePrev = [fromElem, toElem, elemToPiece(toElem), position.indexOf(elemToPos(toElem))];

    initPos = elemToPos(fromElem);
    finPos = elemToPos(toElem);
    initPosIdxArr = position.indexOf(initPos);
    finPosIdxArr = position.indexOf(finPos);

    position[initPosIdxArr] = finPos;
    if (finPosIdxArr != -1) position[finPosIdxArr] = -1;
    toElem.style.backgroundImage = window.getComputedStyle(fromElem)['backgroundImage'];
    fromElem.style.backgroundImage = 'none';
}

function changeBackHelper() {
    initPos = elemToPos(savePrev[0]);
    finPos = elemToPos(savePrev[1]);
    initPosIdxArr = position.indexOf(finPos);
    finPosIdxArr = savePrev[3];

    position[initPosIdxArr] = initPos;
    savePrev[0].style.backgroundImage = window.getComputedStyle(savePrev[1])['backgroundImage'];
    if (finPosIdxArr != -1) {
        position[finPosIdxArr] = finPos;
        savePrev[1].style.backgroundImage = `url('../static/Images/${savePrev[2]}.png')`;
    }
    else savePrev[1].style.backgroundImage = 'none';
}

function checkPlayBackEnPassant() {
    lastFrom = savePrev[0], lastTo = savePrev[1];
    let piece = elemToPiece(lastTo);
    if (piece[1] == 'p') {
        fromId = lastFrom.id, toId = lastTo.id;
        rf = lastFrom.id[0], cf = lastFrom.id[1], rt = lastTo.id[0], ct = lastTo.id[1];
        if (rf != rt && savePrev[2]=='none') {
            let elem, idx;
            if (rt>rf && ct>cf) elem = posToElem(elemToPos(lastFrom)+8);
            if (rt<rf && ct>cf) elem = posToElem(elemToPos(lastFrom)-8);
            if (rt>rf && ct<cf) elem = posToElem(elemToPos(lastFrom)+8);
            if (rt<rf && ct<cf) elem = posToElem(elemToPos(lastFrom)-8);
            if (piece[0]=='w') {
                idx = position.slice(24,32).indexOf(-1);
                elem.style.backgroundImage = `url('../static/Images/bp.png')`
            }
            else {
                idx = position.slice(8,16).indexOf(-1);
                elem.style.backgroundImage = `url('../static/Images/wp.png')`
            }
            position[idx] = elemToPos(elem);
        }
    }
}

function checkPlayBackCastling() {
    let piece = elemToPiece(savePrev[1]), initPos = elemToPos(savePrev[0]),
        finPos = elemToPos(savePrev[1]), moveNum = movePlayedNames.length;
    if (piece[1] == 'k') {
        if (initPos == 32 && kingRookFirstMoves[0]==moveNum) {
            kingRookFirstMoves[0] = -1;
            if (finPos == 48) {
                kingRookFirstMoves[2] = -1;
                changePos(posToElem(40), posToElem(56));
            }
            else if (finPos == 16) {
                kingRookFirstMoves[1] = -1;
                changePos(posToElem(24), posToElem(0));
            }
        }
        else if (initPos == 39 && kingRookFirstMoves[3]==moveNum) {
            kingRookFirstMoves[3] = -1;
            if (finPos == 55) {
                kingRookFirstMoves[5] = -1;
                changePos(posToElem(47), posToElem(63));
            }
            else if (finPos == 23) {
                kingRookFirstMoves[4] = -1;
                changePos(posToElem(31), posToElem(7));
            }
        }
    }
    if (piece[1] == 'r') {
        if (initPos==0 && kingRookFirstMoves[1]==moveNum) kingRookFirstMoves[1] = -1;
        if (initPos==56 && kingRookFirstMoves[2]==moveNum) kingRookFirstMoves[2] = -1;
        if (initPos==7 && kingRookFirstMoves[4]==moveNum) kingRookFirstMoves[4] = -1;
        if (initPos==63 && kingRookFirstMoves[5]==moveNum) kingRookFirstMoves[5] = -1;
    }
}

function changeBack(colorChanged) {
    if (colorChanged) {
        savePrev = stackMovesPlayed.at(-1);
        currcol = (currcol=='w' ? 'b': 'w');
        checkPlayBackCastling();
        savePrev = stackMovesPlayed.at(-1);
        changeBackMovesBox();
        stackMovesPlayed.pop();
        movePlayedNames.pop();
    }
    checkPlayBackEnPassant();
    changeBackHelper();
}

function changeInMovesBox() {
    if (movePlayedNames.length==1) moves.innerHTML = '';
    if (movePlayedNames.length%2) {
        moves.innerHTML += ` ${(movePlayedNames.length+1)/2}. ${movePlayedNames.at(-1)} `;
    }
    else moves.innerHTML += `${movePlayedNames.at(-1)} `;
}

function changeBackMovesBox() {
    if (movePlayedNames.length%2) {
        moves.innerHTML = moves.innerHTML.slice(0, moves.innerHTML.length-4-((movePlayedNames.length+1)/2).toString().length-movePlayedNames.at(-1).length)
    }
    else moves.innerHTML = moves.innerHTML.slice(0, moves.innerHTML.length-1-movePlayedNames.at(-1).length);
    if (movePlayedNames.length==1) moves.innerHTML = 'Moves';
}