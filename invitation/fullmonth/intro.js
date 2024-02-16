const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const invitationName = urlParams.get('name');

const hello = document.getElementById('hello');
hello.innerText = `Con là bé Bơ đây!`;

const go = () => {
    location.href = `/invitation/fullmonth/index.html?name=${invitationName}`;
};

const x = document.getElementById('playAudio');

x.addEventListener('canplaythrough', () => {
    x.play().catch((e) => {
        window.addEventListener(
            'click',
            () => {
                x.play();
            },
            { once: true }
        );
    });
});
