vh = window.innerHeight;
vw = window.innerWidth;

// skeleton
mainElem = document.getElementById('main');
mainLeft = document.getElementById("main-left");
mainRight = document.getElementById("main-right");
first = document.getElementById('first');
secondUser = document.getElementById('second-user');
secondRating = document.getElementById('second-rating');
third = document.getElementById('third');

// main-right
childFirst = document.getElementsByClassName('child-first');
childSecond = document.getElementsByClassName('child-second');
thirdBtn = document.querySelectorAll('.third-btn');
userDataElem = document.getElementById("user");
ratingDataElem = document.getElementById("rating");
range = document.getElementById('range');
rangeLen = document.getElementById('range-len');
gameClassSel = document.getElementById('game-type');
gameClassSel1 = document.getElementById('game-type-1');
fourthUser = document.getElementById('fourth-user');
fourthRating = document.getElementById('fourth-rating');

// main-left
squares = document.getElementsByClassName('square');
flipBtn = document.getElementById('flip-btn');

// show-legal-moves

position = Array(32); // 0-wk,1-wq,2-3wb,4-5wn,6-7wr,8-15wp,16-bk,17-bq,18-19bb,20-21bn,22-23br,24-31bp
position[0] = 32;
position[1] = 24;
position[2] = 16;
position[3] = 40;
position[4] = 8;
position[5] = 48;
position[6] = 0;
position[7] = 56;
for (i=16; i<24; i++) position[i] = position[i-16]+7;
for (i=8; i<16; i++) position[i] = (i-8)*8+1;
for (i=24; i<32; i++) position[i] = position[i-16]+5;

kingRookFirstMoves = [-1, -1, -1, -1, -1, -1] // wk, wlr, wrr, bk, blr, brr
stackMovesPlayed = []; // every move in form of (from_elem, to_elem, captured_piece, position_of_captured_piece)
movePlayedNames = [];  // just the names of moves
currcol = 'w' // white or black's move
moves = document.getElementById('moves'); // moves box
lBtn = document.getElementById('l-btn');

rows = ['a','b','c','d','e','f','g','h'];

userBox = document.getElementById('input-name');
gameClassSel = document.getElementById('game-type');
doneRequests = true;

currData = new Array(4); // username, ratingl, ratingr, class
currData[0] = 'bhavya1238955';