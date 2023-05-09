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
