vw = window.innerWidth;
vh = window.innerHeight;
navbarItems = document.querySelectorAll('#navbar a');
para = document.getElementById('para');
openexp = document.getElementById('openexp');
startAny = document.querySelector('button');

for (item of navbarItems) item.style.fontSize = ((vw<600) ? '20px': '30px');
h = document.getElementById('navbar').clientHeight;
s = window.getComputedStyle(navbarItems[0])['fontSize']
h1 = parseFloat(s.substring(0, s.length-2));
if (vw < 500) {
    for (item of navbarItems) {
        item.style.paddingLeft = `6px`;
        item.style.paddingRight = `6px`;
    }
    para.style.paddingLeft = '10vw';
    para.style.paddingRight = '10vw';
}
else {
    for (item of navbarItems) {
        item.style.paddingLeft = `15px`;
        item.style.paddingRight = `15px`;
    }
    para.style.paddingLeft = '20vw';
    para.style.paddingRight = '20vw';
}

openexp.style.fontSize = '4vw';
para.style.fontSize = '2vw';
if (vw < 1000) {
    openexp.style.fontSize = '6vw';
    para.style.fontSize = '4vw';
}
else if (vw < 700) {
    openexp.style.fontSize = '8vw';
    para.style.fontSize = '5vw';
}
else if (vw < 500) {
    openexp.style.fontSize = '10vw';
    para.style.fontSize = '6vw';
}

startAny.style.fontSize = para.style.fontSize;

