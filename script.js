let activeNav = "home-nav";

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
