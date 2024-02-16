const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const invitationName = urlParams.get('name');

const thank = document.getElementById('thank');
thank.innerText = `Cảm ơn ${invitationName.toUpperCase()} rất nhiều!`;

const canGo = document.getElementById('canGo');
canGo.innerText = invitationName.toUpperCase() + ' có tham dự tiệc được không?';

document.getElementById("from_name").value = invitationName;

const toggleChange = () => {
    const toggle = document.getElementById("toggle");
    const email = document.getElementById('email');
    if (toggle.checked) {
        email.value = 'Có đi';
    } else {
        email.value = 'Không đi';
    }
}

document.getElementById('myForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const serviceID = 'service_9xr359p';
    const templateID = 'template_jmu7iyp';

    // send the email here
    emailjs.sendForm(serviceID, templateID, this).then(
        (response) => {
            alert('Gửi lời chúc thành công!');
        },
        (error) => {
            alert('Gửi lời chúc thất bại!', error);
        }
    );
});
