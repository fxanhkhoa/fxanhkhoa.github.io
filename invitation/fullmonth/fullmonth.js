const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const invitationName = urlParams.get('name');
// console.log(invitationName);

const elem1 = document.getElementById('invitationName');
const elem2 = document.getElementById('invitationName-1');

elem1.innerText = invitationName;
elem2.innerText = invitationName;

let c = 45;

function draw() {
    document.documentElement.style.setProperty('--direction', c++ + 'deg');
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

const play = () => {
    const x = document.getElementById('playAudio');
    x.play();
};
