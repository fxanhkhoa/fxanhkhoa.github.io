let activeNav = null;

function navClick(name) {
	if (activeNav) {
		const activeElement = document.getElementById(activeNav);
		activeElement.classList.remove("nav-active");
	}
	activeNav = name;
  const activeElement = document.getElementById(activeNav);
  activeElement.classList.add("nav-active");
	if (name === "home-nav") {
	}
}
