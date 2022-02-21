// squares
for (i=0; i<64; i++) {
    id = squares[i].id;
    if (!((id[0].charCodeAt()+parseInt(id[1])) % 2)) {
        squares[i].style.backgroundColor = '#04aa6d';
    }
    else {
        squares[i].style.color = '#04aa6d'
        squares[i].style.backgroundColor = 'white';
    }
}

// flip-board
currOnBottom = true;
var aToH = "abcdefgh";
function whiteBottom() {
    for (i=0; i<64; i++) {
        squares[i].style.order = 1;
    }
    mainLeft.style.flexDirection = 'column-reverse';
    for (char of aToH) $(`#${char}8`).html('');
    for (let i=1; i<=8; i++) $(`#h${i}`).html('');
    $(`#h8`).html('');
    for (char of aToH) $(`#${char}1`).html(`${char}`);
    for (let i=1; i<=8; i++) $(`#a${i}`).html(`${i}`);
    $(`#a1`).html('a1');
}
whiteBottom();
function blackBottom() {
    mainLeft.style.flexDirection = 'row';
    for (i=0; i<8; i++) {
        for (j=0; j<8; j++) {
            squares[i*8+j].style.order = 8*(j+1)-i;
        }
    }
    for (char of aToH) $(`#${char}1`).html('');
    for (let i=1; i<=8; i++) $(`#a${i}`).html('');
    $(`#a1`).html('');
    for (char of aToH) $(`#${char}8`).html(`${char}`);
    for (let i=1; i<=8; i++) $(`#h${i}`).html(`${i}`);
    $(`#h8`).html('h8');
}
function flipBoard() {
    currOnBottom = !currOnBottom;
    if (currOnBottom) whiteBottom();
    else blackBottom();
}
flipBtn.addEventListener('click', flipBoard);