// function adds the move(elem is fourthUser or fourthRating) in the fourth div.
// sample = [{'Nc3': {'-1': 3, '0': 2, '1': 1}, 'Nf3': {'-1': 8, '0': 35, '1': 65}, 'Nh3': {'1': 1}, 'a3': {'0': 1, '1': 1}, 'b3': {'0': 5, '1': 8}, 'b4': {'-1': 13, '0': 102, '1': 79}, 'c3': {'0': 2}, 'c4': {'-1': 6, '0': 40, '1': 37}, 'd3': {'0': 2, '1': 4}, 'd4': {'-1': 75, '0': 452, '1': 590}, 'e3': {'-1': 7, '0': 50, '1': 52}, 'e4': {'-1': 164, '0': 1280, '1': 1282}, 'f3': {'0': 2, '1': 1}, 'f4': {'-1': 2, '0': 20, '1': 14}, 'g3': {'-1': 1, '0': 9, '1': 11}, 'g4': {'0': 2, '1': 5}, 'h3': {'1': 1}, 'h4': {'1': 1}}, {'e4': {'-1': 2, '0': 19, '1': 23}}]

function addMove(elem, moveName, numWins, numDraws, numLoses) {
    // check if something is undefined (means not in the json means 0)
    if (!numWins) numWins = 0;
    if (!numDraws) numDraws = 0;
    if (!numLoses) numLoses = 0;
    total = numWins + numDraws + numLoses;
    winper = parseInt(numWins*100/total);
    drawper = parseInt(numDraws*100/total);
    loseper = parseInt(numLoses*100/total);

    // because we applied floor function
    if (winper+drawper+loseper == 98) {
        if(numWins*100/total - winper > .5) winper++;
        else if (numDraws*100/total - drawper > .5) drawper++;
        else loseper++; 
    }
    if (winper+drawper+loseper == 99) {
        if(numWins*100/total - winper > .5) winper++;
        else if (numDraws*100/total - drawper > .5) drawper++;
        else loseper++; 
    }

    created = document.createElement('div');
    created.className = "move";
    if (vw < 400) created.style.fontSize = 10;
    created.innerHTML =  `
        <button class="move-content move-btn" type="submit" id="${moveName}" style="margin-top: 5px">${moveName}</button>
        <div class="move-content total-games">${total}</div>
        <div class="move-content percent-bar">
            <div class="percent-bar-content win-per">${winper}%</div>
            <div class="percent-bar-content draw-per">${drawper}%</div>
            <div class="percent-bar-content lose-per">${loseper}%</div>
        </div>`
    elem.appendChild(created);

    percentBar = created.children[2];
    cssWidth = window.getComputedStyle(fourthRating).width;
    percentBarWidth = parseInt(cssWidth.substr(0,cssWidth.length-2)) * .7;
    if (!percentBarWidth) {
        cssWidth = window.getComputedStyle(fourthUser).width;
        percentBarWidth = parseInt(cssWidth.substr(0,cssWidth.length-2)) * .7;
    }

    percentages = percentBar.children;
    percentages[0].style.overflow = 'hidden';
    percentages[0].style.width = percentBarWidth*winper/100;
    percentages[1].style.overflow = 'hidden';
    percentages[1].style.width = percentBarWidth*drawper/100;
    percentages[2].style.overflow = 'hidden';
    percentages[2].style.width = percentBarWidth*loseper/100;
}

// functions to DISPLAY(handling is done in on_click_ok.html) the response in form of json returned from backend

function fourthUserShow(response) {
    fourthUser.innerHTML = `This data is loaded for username: ${currData[0]}, game class: ${currData[3]}<br>`;
    if (!Object.keys(response).length) {
        fourthUser.innerHTML += "No games in the database exist with this move order";
        return;
    }
    let arr = [];
    for (moveName in response) {
        let prop = response[moveName];
        arr.push([(prop[1]? prop[1]: 0)+(prop[0]? prop[0]: 0)+(prop[-1]? prop[-1]: 0), moveName])
    }
    arr.sort(function(a,b) {return b[0]-a[0]});
    for (moveTotal of arr) {
        moveName = moveTotal[1];
        addMove(fourthUser, moveName, response[moveName][1], response[moveName][-1], response[moveName][0]);
    }
}
function fourthRatingShow(response) {
    fourthRating.innerHTML = `This data is loaded for rating range: ${currData[1]}-${currData[2]}, game class: ${currData[3]}<br>`;
    if (!Object.keys(response).length) {
        fourthRating.innerHTML += "No games in the database exist with this move order";
        return;
    }
    let arr = [];
    for (moveName in response) {
        let prop = response[moveName];
        arr.push([(prop[1]? prop[1]: 0)+(prop[0]? prop[0]: 0)+(prop[-1]? prop[-1]: 0), moveName])
    }
    arr.sort(function(a,b) {return b[0]-a[0]});
    for (moveTotal of arr) {
        moveName = moveTotal[1];
        addMove(fourthRating, moveName, response[moveName][1], response[moveName][-1], response[moveName][0]);
    }
}
