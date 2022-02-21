// 1 > try to set eleml .height = .96 * vh. can we set width = height ?
if (.96*vh + .08*vw + 400 < vw) {
    mainElem.style.flexWrap = 'nowrap';
    mainLeft.style.height = .96 * vh;
    mainLeft.style.width = .96 * vh;
    mainRight.style.height = .96 * vh;
    let expr = .91*vw - mainLeft.offsetWidth;
    if (expr > 600) mainRight.style.width = 600;
    else if (expr < 400) mainRight.style.width = 400;
    else mainRight.style.width = expr;
    mainRight.style.width = (expr > 600 ? 600 : (expr < 400 ? 400 : expr));
}
else {
    // can we set chess board width same as vw
    mainRight.style.height = 500;
    mainElem.style.flexWrap = 'wrap';
    mainRight.style.marginTop = 10;
    if (.96*vw < vh) {
        mainLeft.style.width = .96 * vw;
        mainLeft.style.height = .96 * vw;
        mainRight.style.width = .96 * vw;
    }
    else {
        mainLeft.style.height = .96 * vh;
        mainLeft.style.width = .96 * vh;
        mainRight.style.width = .96 * vh;
    }
}

// style main right
let h = mainRight.clientHeight;
first.style.height = .1*h;
secondUser.style.height = .1*h;
secondRating.style.height = .1*h;
third.style.height = .1*h;
fourthUser.style.height = .7*h-5;
fourthRating.style.height = .7*h-5;