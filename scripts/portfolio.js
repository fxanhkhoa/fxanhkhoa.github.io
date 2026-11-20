// ===========================
// Smooth Scrolling
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navMenu.classList.remove('active');
        }
    });
});

// ===========================
// Mobile Navigation Toggle
// ===========================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ===========================
// Navbar Scroll Effect
// ===========================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// ===========================
// Typed Text Effect
// ===========================
if (typeof Typed !== 'undefined') {
    const typed = new Typed('#typed-text', {
        strings: [
            'Full Stack Developer',
            'Angular Developer',
            'React Developer',
            'Golang Developer',
            'Freelance Developer',
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
}

// ===========================
// Scroll Animations
// ===========================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections and cards
const animatedElements = document.querySelectorAll('.skill-category, .project-card, .timeline-item, .about-content, .contact-content');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===========================
// Counter Animation for Stats
// ===========================
const counters = document.querySelectorAll('.stat h4');
const speed = 200; // Animation speed

const animateCounter = (counter) => {
    const target = +counter.innerText.replace('+', '');
    const increment = target / speed;
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            counter.innerText = Math.ceil(current) + '+';
            setTimeout(updateCounter, 1);
        } else {
            counter.innerText = target + '+';
        }
    };

    updateCounter();
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target.querySelector('h4');
            animateCounter(counter);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// ===========================
// Form Submission with EmailJS
// ===========================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const loadingSpinner = document.getElementById('loading-spinner');
        const submitText = document.getElementById('submit-text');
        const successMessage = document.getElementById('success-message');
        const failMessage = document.getElementById('fail-message');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        // Show loading state
        if (loadingSpinner) {
            loadingSpinner.classList.remove('fa-paper-plane');
            loadingSpinner.classList.add('fa-spinner', 'fa-spin');
        }
        if (submitText) {
            submitText.textContent = 'Sending...';
        }
        if (submitButton) {
            submitButton.disabled = true;
        }
        
        // Hide previous messages
        if (successMessage) successMessage.style.display = 'none';
        if (failMessage) failMessage.style.display = 'none';
        
        const serviceID = 'service_9xr359p';
        const templateID = 'template_jmu7iyp';
        
        // Send the email using EmailJS
        emailjs.sendForm(serviceID, templateID, this).then(
            (response) => {
                console.log('SUCCESS!', response.status, response.text);
                
                // Reset loading state
                if (loadingSpinner) {
                    loadingSpinner.classList.remove('fa-spinner', 'fa-spin');
                    loadingSpinner.classList.add('fa-paper-plane');
                }
                if (submitText) {
                    submitText.textContent = 'Send Message';
                }
                if (submitButton) {
                    submitButton.disabled = false;
                }
                
                // Show success message
                if (successMessage) successMessage.style.display = 'block';
                if (failMessage) failMessage.style.display = 'none';
                
                // Reset form
                contactForm.reset();
                
                // Google Analytics event tracking
                if (typeof gtag === 'function') {
                    gtag('event', 'contact_form_submit', {
                        'event_category': 'Contact',
                        'event_label': 'success'
                    });
                }
            },
            (error) => {
                console.log('FAILED...', error);
                
                // Reset loading state
                if (loadingSpinner) {
                    loadingSpinner.classList.remove('fa-spinner', 'fa-spin');
                    loadingSpinner.classList.add('fa-paper-plane');
                }
                if (submitText) {
                    submitText.textContent = 'Send Message';
                }
                if (submitButton) {
                    submitButton.disabled = false;
                }
                
                // Show error message
                if (failMessage) failMessage.style.display = 'block';
                if (successMessage) successMessage.style.display = 'none';
                
                // Google Analytics event tracking
                if (typeof gtag === 'function') {
                    gtag('event', 'contact_form_submit', {
                        'event_category': 'Contact',
                        'event_label': 'fail'
                    });
                }
            }
        );
    });
}

// ===========================
// Active Navigation Link
// ===========================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===========================
// Parallax Effect on Hero
// ===========================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / 700;
    }
});

// ===========================
// Cursor Effect (Optional)
// ===========================
const cursor = document.createElement('div');
cursor.classList.add('cursor');
document.body.appendChild(cursor);

const cursorFollower = document.createElement('div');
cursorFollower.classList.add('cursor-follower');
document.body.appendChild(cursorFollower);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    setTimeout(() => {
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
    }, 100);
});

// Add hover effect on interactive elements
const interactiveElements = document.querySelectorAll('a, button, .project-card, .skill-category');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
        cursorFollower.classList.add('cursor-hover');
    });
    
    el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
        cursorFollower.classList.remove('cursor-hover');
    });
});

// ===========================
// Add cursor styles dynamically
// ===========================
const style = document.createElement('style');
style.innerHTML = `
    .cursor,
    .cursor-follower {
        width: 20px;
        height: 20px;
        border: 2px solid #6366f1;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: width 0.3s, height 0.3s;
    }
    
    .cursor {
        background: rgba(99, 102, 241, 0.5);
    }
    
    .cursor-follower {
        background: transparent;
        width: 40px;
        height: 40px;
        margin-left: -10px;
        margin-top: -10px;
    }
    
    .cursor-hover {
        width: 40px;
        height: 40px;
    }
    
    .cursor-follower.cursor-hover {
        width: 60px;
        height: 60px;
    }
    
    @media (max-width: 968px) {
        .cursor,
        .cursor-follower {
            display: none;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Project Filter (if needed)
// ===========================
const projectTags = document.querySelectorAll('.project-tags span');
projectTags.forEach(tag => {
    tag.addEventListener('click', () => {
        const filter = tag.textContent.toLowerCase();
        const projects = document.querySelectorAll('.project-card');
        
        projects.forEach(project => {
            const tags = Array.from(project.querySelectorAll('.project-tags span'))
                .map(t => t.textContent.toLowerCase());
            
            if (tags.includes(filter)) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        });
    });
});

// ===========================
// Experience Project Tabs
// ===========================
document.querySelectorAll('.project-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const projectId = this.getAttribute('data-project');
        const company = this.closest('.experience-company');
        
        // Remove active class from all tabs in this company
        company.querySelectorAll('.project-tab').forEach(t => {
            t.classList.remove('active');
        });
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all project details in this company
        company.querySelectorAll('.project-detail').forEach(detail => {
            detail.classList.remove('active');
        });
        
        // Show selected project detail
        const selectedProject = company.querySelector('#' + projectId);
        if (selectedProject) {
            selectedProject.classList.add('active');
        }
    });
});

// ===========================
// Loading Animation
// ===========================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add loading animation styles
    const loadingStyle = document.createElement('style');
    loadingStyle.innerHTML = `
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 99999;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        
        body.loaded::before {
            opacity: 0;
            visibility: hidden;
        }
    `;
    document.head.appendChild(loadingStyle);
});

// ===========================
// 3D Studio Multi-Object Modal Viewer
// ===========================
const modelModal = document.getElementById('model-modal');
const modalModelViewer = document.getElementById('modal-model-viewer');
const modalModelTitle = document.getElementById('model-modal-title');

if (modelModal && modalModelViewer) {
    const models3d =
        Array.isArray(window.PORTFOLIO_3D_MODELS) && window.PORTFOLIO_3D_MODELS.length > 0
            ? window.PORTFOLIO_3D_MODELS
            : [
                  {
                      id: 'house-study',
                      title: '3D House Study',
                      category: 'Architecture',
                      src: 'blender/house.glb',
                      alt: '3D House modeled in Blender',
                      summary:
                          'An interactive 3D house model built in Blender as part of my 3D modeling learning journey, exported to glTF Binary (.glb) for real-time web rendering.',
                      highlights: [
                          'Modeled architectural structure & proportions in Blender',
                          'Applied materials and lighting for real-time PBR rendering',
                          'Optimized and exported from .blend to web-ready .glb'
                      ],
                      tags: ['Blender', '3D Modeling', 'glTF / GLB', 'model-viewer'],
                      cameraOrbit: '45deg 65deg auto'
                  }
              ];

    let activeModel = models3d[0];
    const toggleRotateBtn = document.getElementById('model-toggle-rotate');
    const resetCameraBtn = document.getElementById('model-reset-camera');
    const modalCategory = document.getElementById('model-modal-category');
    const modalDescription = document.getElementById('model-modal-description');
    const modalHighlights = document.getElementById('model-modal-highlights');
    const modalTags = document.getElementById('model-modal-tags');
    const modalSwitcher = document.getElementById('model-modal-switcher');
    const modalStudioLink = document.getElementById('model-modal-studio-link');
    const inlineSwitcher = document.querySelector('[data-inline-model-switcher]');
    const inlineViewer = document.querySelector('[data-studio-inline-viewer]');

    document.querySelectorAll('[data-model-count]').forEach(el => {
        el.textContent = `${models3d.length} ${models3d.length === 1 ? 'Object' : 'Objects'}`;
    });

    const syncPressedState = () => {
        document
            .querySelectorAll('[data-inline-model-switcher] button, #model-modal-switcher button')
            .forEach(btn => {
                btn.setAttribute('aria-pressed', String(btn.getAttribute('data-model-id') === activeModel.id));
            });
    };

    const applyModelToModal = model => {
        if (modalModelViewer.getAttribute('src') !== model.src) {
            modalModelViewer.setAttribute('src', model.src);
        }
        modalModelViewer.setAttribute('alt', model.alt || model.title);
        modalModelViewer.cameraOrbit = model.cameraOrbit || 'auto auto auto';
        if (modalModelTitle) modalModelTitle.textContent = model.title;
        if (modalCategory) modalCategory.textContent = model.category || '3D Study';
        if (modalDescription) modalDescription.textContent = model.summary || '';
        if (modalStudioLink) {
            modalStudioLink.setAttribute('href', `3d-studio/?model=${encodeURIComponent(model.id)}`);
        }
        if (modalHighlights) {
            modalHighlights.replaceChildren();
            (model.highlights || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                modalHighlights.appendChild(li);
            });
        }
        if (modalTags) {
            modalTags.replaceChildren();
            (model.tags || []).forEach(tag => {
                const span = document.createElement('span');
                span.textContent = tag;
                modalTags.appendChild(span);
            });
        }
    };

    const selectModel = (modelId, syncInline = true) => {
        const found = models3d.find(m => m.id === modelId);
        if (!found) return;
        activeModel = found;
        if (syncInline && inlineViewer) {
            inlineViewer.setAttribute('src', activeModel.src);
            inlineViewer.setAttribute('alt', activeModel.alt || activeModel.title);
            if (activeModel.cameraOrbit) {
                inlineViewer.cameraOrbit = activeModel.cameraOrbit;
            }
        }
        applyModelToModal(activeModel);
        syncPressedState();
    };

    const renderButtons = (container, showSoonNote) => {
        container.replaceChildren();
        models3d.forEach(model => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'model-switch-btn';
            btn.setAttribute('data-model-id', model.id);
            btn.setAttribute('aria-pressed', String(model.id === activeModel.id));
            btn.textContent = model.title;
            btn.addEventListener('click', () => selectModel(model.id));
            container.appendChild(btn);
        });
        if (showSoonNote && models3d.length === 1) {
            const note = document.createElement('span');
            note.className = 'model-switcher-note';
            note.textContent = 'More 3D objects coming soon';
            container.appendChild(note);
        }
    };

    if (inlineSwitcher) {
        if (models3d.length > 1) {
            inlineSwitcher.hidden = false;
            renderButtons(inlineSwitcher, false);
        } else {
            inlineSwitcher.hidden = true;
        }
    }

    if (modalSwitcher) {
        renderButtons(modalSwitcher, true);
    }

    document.querySelectorAll('[data-open-3d-modal], [data-model-src]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const requestedId = trigger.getAttribute('data-model-id');
            if (requestedId) {
                selectModel(requestedId, false);
            } else {
                applyModelToModal(activeModel);
            }
            modelModal.showModal();
        });
    });

    if (toggleRotateBtn) {
        toggleRotateBtn.addEventListener('click', () => {
            const isRotating = modalModelViewer.hasAttribute('auto-rotate');
            if (isRotating) {
                modalModelViewer.removeAttribute('auto-rotate');
                toggleRotateBtn.classList.remove('active');
                toggleRotateBtn.setAttribute('aria-pressed', 'false');
            } else {
                modalModelViewer.setAttribute('auto-rotate', '');
                toggleRotateBtn.classList.add('active');
                toggleRotateBtn.setAttribute('aria-pressed', 'true');
            }
        });
    }

    if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
            modalModelViewer.cameraOrbit = activeModel.cameraOrbit || 'auto auto auto';
            modalModelViewer.fieldOfView = 'auto';
        });
    }

    const closeBtn = modelModal.querySelector('.model-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => modelModal.close());
    }

    if (!('closedBy' in HTMLDialogElement.prototype)) {
        const outside = (e) => {
            const r = modelModal.getBoundingClientRect();
            return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        let pressedOutside = false;
        modelModal.addEventListener('pointerdown', (e) => {
            pressedOutside = modelModal.open && outside(e);
        });
        modelModal.addEventListener('pointerup', (e) => {
            if (pressedOutside && modelModal.open && outside(e)) {
                modelModal.close();
            }
            pressedOutside = false;
        });
    }
}

console.log('Portfolio website loaded successfully! 🚀');
