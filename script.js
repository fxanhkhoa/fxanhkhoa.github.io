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

	// Google Analytics event tracking for navigation
	if (typeof gtag === 'function') {
		gtag('event', 'navigation_click', {
			'event_category': 'Navigation',
			'event_label': name
		});
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

				// Google Analytics event tracking for successful contact form submission
				if (typeof gtag === 'function') {
					gtag('event', 'contact_form_submit', {
						'event_category': 'Contact',
						'event_label': 'success'
					});
				}
		},
		(error) => {
			console.log("FAILED...", error);
			document.getElementById("loading-spinner").classList.remove("animate-spin");
			document.getElementById("loading-spinner").classList.add("hidden");
			document.getElementById("fail-message").classList.remove("hidden");
			document.getElementById("success-message").classList.add("hidden");

				// Google Analytics event tracking for failed contact form submission
				if (typeof gtag === 'function') {
					gtag('event', 'contact_form_submit', {
						'event_category': 'Contact',
						'event_label': 'fail'
					});
				}
		}
	);
});

document.getElementById("year").innerHTML = new Date().getFullYear();

// Track CV download clicks
document.addEventListener("DOMContentLoaded", () => {
	// Select all CV download links (by href pattern)
	const cvLinks = document.querySelectorAll('a[href$=".pdf"], a[href*="cv" i]');
	cvLinks.forEach(link => {
		// Only track if it's a CV file
		if (link.href.match(/cv|khoa-bui|bui-anh-khoa/i)) {
			link.addEventListener('click', function () {
				if (typeof gtag === 'function') {
					gtag('event', 'download_cv', {
						'event_category': 'CV',
						'event_label': link.getAttribute('href') || link.href
					});
				}
			});
		}
	});

		// Track section views and duration with Intersection Observer
		const sectionIds = [
			'home', 'about', 'summary', 'facts', 'skills', 'resume', 'services', 'contact'
		];
		const sectionViewTimes = {};
		const sectionActive = {};
		const observer = new window.IntersectionObserver((entries) => {
			entries.forEach(entry => {
				const id = entry.target.id;
				if (!id) return;
				if (entry.isIntersecting) {
					// Section enters viewport
					if (!sectionActive[id]) {
						sectionViewTimes[id] = Date.now();
						sectionActive[id] = true;
						// Optionally, send a view event here (already implemented previously)
						if (typeof gtag === 'function') {
							gtag('event', 'view_section', {
								'event_category': 'Section',
								'event_label': id
							});
						}
					}
				} else {
					// Section leaves viewport
					if (sectionActive[id] && sectionViewTimes[id]) {
						const duration = Math.round((Date.now() - sectionViewTimes[id]) / 1000); // seconds
						sectionActive[id] = false;
						if (typeof gtag === 'function') {
							gtag('event', 'section_view_duration', {
								'event_category': 'Section',
								'event_label': id,
								'value': duration
							});
						}
					}
				}
			});
		}, { threshold: 0.5 }); // 50% visible

		sectionIds.forEach(id => {
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
			}
		});
});
let currentProjectID = '';

const showProjectDetail = (id) => {
	const currentProject = document.getElementById(currentProjectID);
	if (currentProject) {
		currentProject.classList.remove("max-h-screen");
		currentProject.classList.remove("p-5");
	}

	const currentProjectBtn = document.getElementById(currentProjectID + "-btn");
	if (currentProjectBtn) {
		currentProjectBtn.classList.remove("!bg-gray-300");
	}

	const project = document.getElementById(id);
	if (project) {
		currentProjectID = id;
		project.classList.add("max-h-screen");
		project.classList.add("p-5");
	}

	const activeBtn = document.getElementById(id + "-btn");
	if (activeBtn) {
		activeBtn.classList.add("!bg-gray-300");
	}
}
