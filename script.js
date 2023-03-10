let activeNav = "home-nav";

document.addEventListener("DOMContentLoaded", () => {
	navClick("home-nav");
});

function navClick(name) {
	if (activeNav) {
		const activeElement = document.getElementById(activeNav);
		activeElement.classList.remove("nav-active");
	}
	activeNav = name;
	const activeElement = document.getElementById(activeNav);
	activeElement.classList.add("nav-active");
	if (name === "home-nav") {
		location.href = "#";
	}
}
