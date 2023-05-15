let activeNav = "home-nav";

const select = (el, all = false) => {
	el = el.trim();
	if (all) {
		return [...document.querySelectorAll(el)];
	} else {
		return document.querySelector(el);
	}
};

document.addEventListener("DOMContentLoaded", () => {
	navClick("home-nav");
	var typed = new Typed("#element", {
		strings: ["Developer", "Freelancer"],
		loop: true,
		typeSpeed: 100,
		backSpeed: 50,
		backDelay: 2000,
	});
});

function navClick(name) {
	if (activeNav) {
		const activeElement = document.getElementById(activeNav);
		activeElement.classList.remove("cta-active");
	}
	activeNav = name;
	const activeElement = document.getElementById(activeNav);
	activeElement.classList.add("cta-active");
	if (name === "home-nav") {
		location.href = "#";
	}
}

let navbarLinks = [...document.querySelectorAll(".cta")];
const navbarLinksActive = () => {
	let position = window.scrollY + 200;
	navbarLinks.forEach((navbarLink) => {
		if (!navbarLink.hash) return;
		let section = select(navbarLink.hash);
		if (!section) return;
		if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
			navbarLink.classList.add("cta-active");
		} else {
			navbarLink.classList.remove("cta-active");
		}
	});
};

const onscroll = (el, listener) => {
	el.addEventListener("scroll", listener);
};

onscroll(document, navbarLinksActive);
document.getElementById("myForm").addEventListener("submit", function (event) {
	document.getElementById("loading-spinner").classList.add("animate-spin");
	document.getElementById("loading-spinner").classList.remove("hidden");
	event.preventDefault();
	const serviceID = "service_9xr359p";
	const templateID = "template_jmu7iyp";

	// send the email here
	emailjs.sendForm(serviceID, templateID, this).then(
		(response) => {
			console.log("SUCCESS!", response.status, response.text);
			document.getElementById("loading-spinner").classList.remove("animate-spin");
			document.getElementById("loading-spinner").classList.add("hidden");
			document.getElementById("fail-message").classList.add("hidden");
			document.getElementById("success-message").classList.remove("hidden");
		},
		(error) => {
			console.log("FAILED...", error);
			document.getElementById("loading-spinner").classList.remove("animate-spin");
			document.getElementById("loading-spinner").classList.add("hidden");
			document.getElementById("fail-message").classList.remove("hidden");
			document.getElementById("success-message").classList.add("hidden");
		}
	);
});

document.getElementById("year").innerHTML = new Date().getFullYear();
