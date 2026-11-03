/**
 * Kevin Bui - Storytelling Portfolio Scripts
 * Handles interactive storytelling mechanics, background constellation canvas,
 * scroll telemetry, chapter HUD rail, tab switching, and EmailJS form integration.
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollProgressBar();
    initNavbarScroll();
    initMobileNav();
    initStoryHUD();
    initConstellationCanvas();
    initTypedEffect();
    initCounters();
    initCareerDossierTabs();
    initContactForm();
});

// ==========================================================================
// 1. Top Scroll Progress Bar
// ==========================================================================
function initScrollProgressBar() {
    const progressBar = document.getElementById('scroll-progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) return;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }, { passive: true });
}

// ==========================================================================
// 2. Navbar Scroll Styling
// ==========================================================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ==========================================================================
// 3. Mobile Navigation Toggle
// ==========================================================================
function initMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ==========================================================================
// 4. Story HUD Rail & Chapter Tracking
// ==========================================================================
function initStoryHUD() {
    const hudItems = document.querySelectorAll('.hud-item');
    const navLinks = document.querySelectorAll('.nav-link');
    const chapters = document.querySelectorAll('section[data-chapter]');

    function updateActiveChapter() {
        const scrollPosition = window.scrollY + window.innerHeight * 0.35;
        let currentChapterId = '';

        chapters.forEach(chapter => {
            const top = chapter.offsetTop;
            const height = chapter.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentChapterId = chapter.getAttribute('id');
            }
        });

        if (!currentChapterId && chapters.length > 0) {
            if (window.scrollY < chapters[0].offsetTop) {
                currentChapterId = chapters[0].getAttribute('id');
            } else {
                currentChapterId = chapters[chapters.length - 1].getAttribute('id');
            }
        }

        // Update HUD dots
        hudItems.forEach(item => {
            const targetId = item.getAttribute('data-target');
            if (targetId === currentChapterId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Nav links
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${currentChapterId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Smooth scroll on HUD click
    hudItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    window.addEventListener('scroll', updateActiveChapter, { passive: true });
    updateActiveChapter();
}

// ==========================================================================
// 5. Lightweight Interactive Constellation Background Canvas
// ==========================================================================
function initConstellationCanvas() {
    const canvas = document.getElementById('story-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width / 2, y: height / 2, active: false };

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });

    // Particle nodes
    let particles = [];
    const particleCount = Math.min(65, Math.floor((width * height) / 18000));

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = (Math.random() - 0.5) * 0.45;
            this.radius = Math.random() * 1.5 + 0.8;
            this.baseAlpha = Math.random() * 0.4 + 0.2;
            this.color = Math.random() > 0.4 ? '0, 240, 255' : '139, 92, 246';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce on boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    this.x -= (dx / dist) * 0.8;
                    this.y -= (dy / dist) * 0.8;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.baseAlpha})`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    initParticles();

    let animationFrameId;
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Connect particles
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Draw individual particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animate();
        }
    });
}

// ==========================================================================
// 6. Typed.js Initialization
// ==========================================================================
function initTypedEffect() {
    const target = document.getElementById('typed-text');
    if (!target || typeof Typed === 'undefined') return;

    new Typed('#typed-text', {
        strings: [
            'Full Stack Developer & Architect',
            '3D Creative Technologist',
            'Cloud & Distributed Systems Specialist',
            'Angular & SvelteKit Specialist',
            'Interactive Scrollytelling Engineer'
        ],
        typeSpeed: 45,
        backSpeed: 25,
        backDelay: 2200,
        startDelay: 400,
        loop: true,
        showCursor: true,
        cursorChar: '_'
    });
}

// ==========================================================================
// 7. Interactive Stats Counters Animation
// ==========================================================================
function initCounters() {
    const counterElements = document.querySelectorAll('.metric-value[data-count]');
    if (!counterElements.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetValue = parseInt(el.getAttribute('data-count'), 10);
                const suffix = el.getAttribute('data-suffix') || '';
                animateValue(el, 0, targetValue, 1800, suffix);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counterElements.forEach(el => observer.observe(el));

    function animateValue(obj, start, end, duration, suffix) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOutProgress * (end - start) + start);
            obj.textContent = current + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end + suffix;
            }
        };
        window.requestAnimationFrame(step);
    }
}

// ==========================================================================
// 8. Career Odyssey Project Dossier Tabs
// ==========================================================================
function initCareerDossierTabs() {
    document.querySelectorAll('.dossier-tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const companyCard = this.closest('.odyssey-company');
            if (!companyCard) return;

            const targetDossierId = this.getAttribute('data-project');

            // Update tab buttons in this company
            companyCard.querySelectorAll('.dossier-tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update content panels in this company
            companyCard.querySelectorAll('.dossier-content-panel').forEach(panel => {
                panel.classList.remove('active');
            });

            const targetPanel = companyCard.querySelector(`#${targetDossierId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ==========================================================================
// 9. Contact Form Submission (EmailJS + Analytics)
// ==========================================================================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const submitBtn = document.getElementById('submit-btn');
        const submitIcon = document.getElementById('submit-icon');
        const submitText = document.getElementById('submit-text');
        const successAlert = document.getElementById('success-message');
        const failAlert = document.getElementById('fail-message');

        // Loading state
        if (submitBtn) submitBtn.disabled = true;
        if (submitIcon) {
            submitIcon.className = 'fas fa-circle-notch fa-spin';
        }
        if (submitText) submitText.textContent = 'Transmitting Message...';

        if (successAlert) successAlert.style.display = 'none';
        if (failAlert) failAlert.style.display = 'none';

        const serviceID = 'service_9xr359p';
        const templateID = 'template_jmu7iyp';

        if (typeof emailjs === 'undefined') {
            handleError('EmailJS library not loaded');
            return;
        }

        emailjs.sendForm(serviceID, templateID, this).then(
            (response) => {
                console.log('Storytelling contact form submitted:', response.status, response.text);

                // Reset button state
                resetButtonState();

                if (successAlert) {
                    successAlert.style.display = 'block';
                }

                contactForm.reset();

                // Track submission in Google Analytics
                if (typeof gtag === 'function') {
                    gtag('event', 'contact_form_submit', {
                        event_category: 'Contact',
                        event_label: 'success'
                    });
                }
            },
            (error) => {
                console.error('Contact form submission error:', error);
                resetButtonState();
                if (failAlert) {
                    failAlert.style.display = 'block';
                }

                if (typeof gtag === 'function') {
                    gtag('event', 'contact_form_submit', {
                        event_category: 'Contact',
                        event_label: 'fail'
                    });
                }
            }
        );

        function resetButtonState() {
            if (submitBtn) submitBtn.disabled = false;
            if (submitIcon) {
                submitIcon.className = 'fas fa-paper-plane';
            }
            if (submitText) submitText.textContent = 'Send Transmission';
        }

        function handleError(err) {
            console.error(err);
            resetButtonState();
            if (failAlert) failAlert.style.display = 'block';
        }
    });
}
