// style children of first;
h = first.clientHeight;
s = window.getComputedStyle(childFirst[0]).height;
h1 = parseFloat(s.substr(0,s.length-2));

childFirst[0].style.paddingTop = (h-h1)/2;
childFirst[0].style.paddingBottom = (h-h1)/2;
childFirst[1].style.paddingTop = (h-h1)/2;
childFirst[1].style.paddingBottom = (h-h1)/2;

// style children of second
h1 = .7*h;
for(let i=0; i<childSecond.length; i++) {
    childSecond[i].style.marginTop = (h-h1)/2;
    childSecond[i].style.marginBottom = (h-h1)/2;
}

// style children of third
h1 = .7*h;
for(let i=0; i<thirdBtn.length; i++) {
    thirdBtn[i].style.marginTop = (h-h1)/2;
    thirdBtn[i].style.marginBottom = (h-h1)/2;
}

// moves list part is designed in get_moves_list.js
// flip button in main_left.js

// add event listeners in child first
fourthUser.style.display = secondUser.style.display = "none";
ratingDataElem.style.backgroundColor = '#04aa6d'
function userDataClicked() {
    fourthUser.style.display = secondUser.style.display = "block";
    fourthRating.style.display = secondRating.style.display = "none";
    userDataElem.style.backgroundColor = '#04aa6d'
    ratingDataElem.style.backgroundColor = '#96d4d4'
}
function ratingDataClicked() {
    fourthUser.style.display = secondUser.style.display = "none";
    fourthRating.style.display = secondRating.style.display = "block";
    userDataElem.style.backgroundColor = '#96d4d4'
    ratingDataElem.style.backgroundColor = '#04aa6d'
}
userDataElem.addEventListener('click', userDataClicked);
ratingDataElem.addEventListener('click', ratingDataClicked);

// designing range (depending upon range-len)
value = 300;
for (i=100; i<1000; i+=100) range.innerHTML += `<option value="${i}-${i+value}">${i}-${i+value}</option>`;
range.innerHTML += `<option value="1000-1300" selected="selected">1000-1300</option>`;
for (i=1100; i+value<=3100; i+=100) range.innerHTML += `<option value="${i}-${i+value}">${i}-${i+value}</option>`;
range.innerHTML += `<option value=">3100">>3100</option>`;

function changeLen(event) {
    value = parseInt(event.target.value);
    range.innerHTML = "";
    for (i=100; i+value<=3100; i+=100) range.innerHTML += `<option value="${i}-${i+value}">${i}-${i+value}</option>`;
    range.innerHTML += `<option value=">3100">>3100</option>`;
}
rangeLen.addEventListener('change', changeLen);

// duplicating game type and game type1
gameClassSel.addEventListener('change', ()=>{
    gameClassSel1.value = gameClassSel.value
})
gameClassSel1.addEventListener('change', ()=>{
    gameClassSel.value = gameClassSel1.value;
})