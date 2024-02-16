const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const invitationName = urlParams.get('name');
// console.log(invitationName);

const elem1 = document.getElementById('invitationName');
const elem2 = document.getElementById('invitationName-1');

elem1.innerText = invitationName;
elem2.innerText = invitationName;

let c = 45;
let playing = false;

function draw() {
    document.documentElement.style.setProperty('--direction', c++ + 'deg');
    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

const x = document.getElementById('playAudio');

x.addEventListener("canplaythrough", () => {
    x.play().catch(e => {
       window.addEventListener('click', () => {
          x.play()
       }, { once: true })
    })
 });

const play = () => {
    const promise = x.play();
    if (promise !== undefined) {
        promise
            .then(() => {})
            .catch((err) => {
                x.play();
            });
    }
};

const goToFeedback = () => {
    location.href = '/feedback/fullmonth/index.html?name=' + invitationName;
}

// document.addEventListener("DOMContentLoaded", () => {
// 	const typed = new Typed("#invitationName", {
// 		strings: [invitationName],
// 		loop: true,
// 		typeSpeed: 100,
// 		backSpeed: 50,
// 		backDelay: 2000,
// 	});

//     const typed1 = new Typed("#invitationName-1", {
// 		strings: [invitationName],
// 		loop: true,
// 		typeSpeed: 50,
// 		backSpeed: 300,
// 		backDelay: 2000,
// 	});
// });