(() => {
  'use strict';

  const THEME_STORAGE_KEY = 'v3-editorial-color-scheme';
  const EMAIL_ADDRESS = 'fxanhkhoa@gmail.com';
  const EMAILJS_SERVICE_ID = 'service_9xr359p';
  const EMAILJS_TEMPLATE_ID = 'template_jmu7iyp';

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Conditional Popover API polyfill (only when native support is missing)
  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    import('https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js').catch(() => {});
  }

  // ===========================
  // Top-Layer Animation & Light-Dismiss Helpers
  // ===========================
  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
  }

  async function closeTopLayer(dialog) {
    if (!dialog || !dialog.open) return;
    if (!supportsTopLayerExit() && !prefersReducedMotion()) {
      dialog.setAttribute('data-closing', '');
      const animations = dialog.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((resolve) => setTimeout(resolve, 400)),
        ]);
      }
      if (!dialog.hasAttribute('data-closing')) return;
      dialog.removeAttribute('data-closing');
    }
    if (dialog.open) {
      dialog.close();
    }
  }

  function enhanceDialog(dialog) {
    if (!dialog) return;

    // Fallback for browsers without <dialog closedby="any">
    if (!('closedBy' in HTMLDialogElement.prototype) && dialog.getAttribute('closedby') === 'any') {
      const isOutside = (e) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = dialog.open && isOutside(e);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && dialog.open && isOutside(e)) {
          closeTopLayer(dialog);
        }
        pressedOutside = false;
      });
    }

    // Intercept Esc / requestClose cancel so exit animation runs cleanly across browsers
    dialog.addEventListener('cancel', (event) => {
      if (!supportsTopLayerExit() && !prefersReducedMotion()) {
        event.preventDefault();
        closeTopLayer(dialog);
      }
    });

    // Wire explicit close triggers inside dialog
    dialog.querySelectorAll('[data-dialog-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeTopLayer(dialog));
    });

    // Clear stale returnValue on close
    dialog.addEventListener('close', () => {
      dialog.removeAttribute('data-closing');
      dialog.returnValue = '';
    });
  }

  // ===========================
  // Responsive Site Navigation (Single Semantic Tree + Native Popover)
  // ===========================
  function isPopoverOpen(el) {
    if (!el) return false;
    try {
      if (el.matches(':popover-open')) return true;
    } catch {
      // Browsers without :popover-open pseudo-class support
    }
    return el.classList.contains(':popover-open');
  }

  function initNavbar() {
    const header = document.querySelector('.site-header');
    const inner = header?.querySelector('.header-inner');
    const menu = document.getElementById('site-menu');
    if (!header || !inner || !menu) return;

    let lastHeaderWidth = 0;

    const measureLayout = () => {
      const currentWidth = header.getBoundingClientRect().width;
      const isCurrentlyWide = header.classList.contains('is-wide');
      if (!isCurrentlyWide && currentWidth <= lastHeaderWidth && lastHeaderWidth > 0) {
        return;
      }
      lastHeaderWidth = currentWidth;

      const wasOpen = isPopoverOpen(menu);
      header.classList.add('is-measuring', 'is-wide');
      menu.removeAttribute('popover');

      const fits = inner.scrollWidth <= inner.clientWidth + 1;

      if (fits) {
        header.classList.add('is-wide');
        menu.removeAttribute('popover');
      } else {
        header.classList.remove('is-wide');
        menu.setAttribute('popover', 'auto');
        if (wasOpen && typeof menu.showPopover === 'function') {
          try {
            menu.showPopover();
          } catch {
            // Ignore if already open or detached
          }
        }
      }

      requestAnimationFrame(() => {
        header.classList.remove('is-measuring');
      });
    };

    measureLayout();

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => measureLayout());
      ro.observe(header);
      ro.observe(menu);
    } else {
      window.addEventListener('resize', measureLayout, { passive: true });
    }

    // Close popover when navigating to an anchor section
    menu.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', () => {
        if (!header.classList.contains('is-wide') && typeof menu.hidePopover === 'function') {
          try {
            if (isPopoverOpen(menu)) {
              menu.hidePopover();
            }
          } catch {
            // Ignore
          }
        }
      });
    });

    // Highlight active section link with aria-current="location"
    const sectionLinks = Array.from(menu.querySelectorAll('a[href^="#"]'));
    const sections = sectionLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if ('IntersectionObserver' in window && sections.length > 0) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length === 0) return;

          const activeId = `#${visible[0].target.id}`;
          sectionLinks.forEach((link) => {
            if (link.getAttribute('href') === activeId) {
              link.setAttribute('aria-current', 'location');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        },
        { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.25, 0.6] }
      );
      sections.forEach((section) => sectionObserver.observe(section));
    }
  }

  // ===========================
  // Scroll Progress Fallback
  // ===========================
  function initScrollProgress() {
    const progress = document.getElementById('scroll-progress');
    if (!progress) return;
    if (CSS.supports('animation-timeline', 'scroll()') || prefersReducedMotion()) return;

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      progress.style.transform = `scaleX(${pct})`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
  }

  // ===========================
  // Typed Hero Subtitle
  // ===========================
  function initTypedHero() {
    const target = document.getElementById('typed-text');
    if (!target) return;

    if (prefersReducedMotion() || typeof window.Typed === 'undefined') {
      target.textContent = 'Full Stack Developer & Software Architect';
      return;
    }

    new window.Typed('#typed-text', {
      strings: [
        'Full Stack Developer',
        'Software & Cloud Architect',
        'Angular · React · SvelteKit',
        'Golang · NestJS · Kubernetes',
        '3D Web & Creative Technologist',
      ],
      typeSpeed: 46,
      backSpeed: 26,
      backDelay: 2100,
      loop: true,
      showCursor: true,
      cursorChar: '_',
    });
  }

  // ===========================
  // Live Ho Chi Minh City Clock
  // ===========================
  function initClock() {
    const nodes = document.querySelectorAll('[data-hcmc-time]');
    if (nodes.length === 0) return;

    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const update = () => {
      const timeStr = `${formatter.format(new Date())} ICT`;
      nodes.forEach((node) => {
        node.textContent = timeStr;
      });
    };

    update();
    setInterval(update, 30000);
  }

  // ===========================
  // Pointer Spotlight Cards
  // ===========================
  function initSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches || prefersReducedMotion()) return;
    document.querySelectorAll('.spotlight-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  // ===========================
  // Accessible Tabbed Interfaces (Company, Project, Hero Console, Skills Filter)
  // ===========================
  function initTabs() {
    const tablists = document.querySelectorAll('[role="tablist"]');
    const hasFocusGroup = Object.hasOwn(HTMLElement.prototype, 'focusGroup');

    const activateTab = (tab, { moveFocus = false, scrollTab = true } = {}) => {
      const tablist = tab.closest('[role="tablist"]');
      if (!tablist) return;

      const tabs = Array.from(tablist.querySelectorAll(':scope > [role="tab"]'));
      const container = tablist.closest('[data-tabs-root]') || tablist.parentElement;
      if (!container) return;

      const panels = Array.from(container.querySelectorAll('[role="tabpanel"]')).filter(
        (panel) => (panel.closest('[data-tabs-root]') || panel.parentElement) === container
      );

      tabs.forEach((t) => {
        const isSelected = t === tab;
        t.setAttribute('aria-selected', String(isSelected));
        t.toggleAttribute('focusgroupstart', isSelected);
        if (!hasFocusGroup) {
          t.setAttribute('tabindex', isSelected ? '0' : '-1');
        }
      });

      panels.forEach((panel) => {
        const isMatch = panel.getAttribute('aria-labelledby') === tab.id;
        if (isMatch) {
          panel.removeAttribute('hidden');
          panel.setAttribute('tabindex', '0');
        } else {
          panel.setAttribute('hidden', 'until-found');
          panel.removeAttribute('tabindex');
        }
      });

      if (scrollTab) {
        try {
          tab.scrollIntoView({ block: 'nearest', inline: 'nearest', container: 'nearest' });
        } catch {
          tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }

      if (moveFocus) {
        tab.focus({ preventScroll: true });
      }
    };

    tablists.forEach((tablist) => {
      const tabs = Array.from(tablist.querySelectorAll(':scope > [role="tab"]'));
      if (tabs.length === 0) return;

      if (!hasFocusGroup) {
        tabs.forEach((t) => {
          t.setAttribute('tabindex', t.getAttribute('aria-selected') === 'true' ? '0' : '-1');
        });
      }

      const isVertical = tablist.getAttribute('aria-orientation') === 'vertical';

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => activateTab(tab, { scrollTab: true }));

        tab.addEventListener('keydown', (e) => {
          const idx = tabs.indexOf(tab);
          let nextIdx = -1;

          if ((!isVertical && e.key === 'ArrowRight') || (isVertical && e.key === 'ArrowDown')) {
            nextIdx = (idx + 1) % tabs.length;
          } else if ((!isVertical && e.key === 'ArrowLeft') || (isVertical && e.key === 'ArrowUp')) {
            nextIdx = (idx - 1 + tabs.length) % tabs.length;
          } else if (e.key === 'Home') {
            nextIdx = 0;
          } else if (e.key === 'End') {
            nextIdx = tabs.length - 1;
          }

          if (nextIdx !== -1) {
            e.preventDefault();
            activateTab(tabs[nextIdx], { moveFocus: true, scrollTab: true });
          }
        });
      });
    });

    // Support browser Find-in-Page (`beforematch`) revealing nested panels cleanly
    document.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
      panel.addEventListener('beforematch', () => {
        const parentPanel = panel.parentElement?.closest('[role="tabpanel"]');
        if (parentPanel) {
          const parentTab = document.getElementById(parentPanel.getAttribute('aria-labelledby'));
          if (parentTab) activateTab(parentTab, { scrollTab: false });
        }
        const tab = document.getElementById(panel.getAttribute('aria-labelledby'));
        if (tab) activateTab(tab, { scrollTab: true });
      });
    });

    // Expose programmatic selector for Command Palette & external links
    window.__activateV3Tab = (tabId) => {
      const tab = document.getElementById(tabId);
      if (tab) {
        activateTab(tab, { scrollTab: true });
      }
    };
  }

  // ===========================
  // Skills Category Filter (Spatial Variant)
  // ===========================
  function initSkillsFilter() {
    const filterList = document.querySelector('[data-skill-filter]');
    const grid = document.querySelector('[data-skill-grid]');
    if (!filterList || !grid) return;

    const buttons = Array.from(filterList.querySelectorAll('button[data-filter]'));
    const cards = Array.from(grid.querySelectorAll('[data-category]'));

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        buttons.forEach((b) => {
          const active = b === btn;
          b.setAttribute('aria-pressed', String(active));
          b.classList.toggle('is-active', active);
        });
        cards.forEach((card) => {
          const match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.hidden = !match;
        });
      });
    });
  }

  // ===========================
  // 3D Model Viewer, Multi-Object Catalog & Camera Controls
  // ===========================
  function initModelControls() {
    const models =
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
                'Optimized and exported from .blend to web-ready .glb',
              ],
              tags: ['Blender', '3D Modeling', 'glTF / GLB', 'model-viewer'],
              cameraOrbit: '45deg 65deg auto',
            },
          ];

    let activeModel = models[0];

    const modelModal = document.getElementById('model-modal');
    const modalViewer = document.getElementById('modal-model-viewer');
    const modalTitle = document.getElementById('model-modal-title');
    const modalCategory = document.getElementById('model-modal-category');
    const modalDesc = document.getElementById('model-modal-description');
    const modalHighlights = document.getElementById('model-modal-highlights');
    const modalTags = document.getElementById('model-modal-tags');
    const modalSwitcher = document.getElementById('model-modal-switcher');
    const modalStudioLink = document.getElementById('model-modal-studio-link');
    const toggleRotateBtn = document.getElementById('model-toggle-rotate');
    const resetCameraBtn = document.getElementById('model-reset-camera');

    const countNodes = document.querySelectorAll('[data-model-count]');
    const labelNodes = document.querySelectorAll('[data-active-model-label]');
    const inlineSwitchers = document.querySelectorAll('[data-inline-model-switcher]');
    const inlineViewers = document.querySelectorAll('[data-studio-inline-viewer], #hero-model-viewer');

    if (modelModal) {
      enhanceDialog(modelModal);
    }

    countNodes.forEach((node) => {
      node.textContent = `${models.length} ${models.length === 1 ? 'Object' : 'Objects'}`;
    });

    const syncLabelsAndSwitchers = () => {
      const fileName = activeModel.src.split('/').pop();
      labelNodes.forEach((node) => {
        node.textContent = `${activeModel.title} · ${fileName}`;
      });
      document
        .querySelectorAll('[data-inline-model-switcher] button, #model-modal-switcher button')
        .forEach((btn) => {
          btn.setAttribute('aria-pressed', String(btn.getAttribute('data-model-id') === activeModel.id));
        });
    };

    const applyToInlineViewers = (model) => {
      inlineViewers.forEach((viewer) => {
        if (viewer.getAttribute('src') !== model.src) {
          viewer.setAttribute('src', model.src);
        }
        viewer.setAttribute('alt', model.alt || model.title);
        if (model.cameraOrbit) {
          viewer.cameraOrbit = model.cameraOrbit;
        }
      });
    };

    const applyToModal = (model) => {
      if (modalViewer) {
        if (modalViewer.getAttribute('src') !== model.src) {
          modalViewer.setAttribute('src', model.src);
        }
        modalViewer.setAttribute('alt', model.alt || model.title);
        modalViewer.cameraOrbit = model.cameraOrbit || 'auto auto auto';
      }
      if (modalTitle) modalTitle.textContent = model.title;
      if (modalCategory) modalCategory.textContent = model.category || '3D Study';
      if (modalDesc) modalDesc.textContent = model.summary || '';
      if (modalStudioLink) modalStudioLink.setAttribute('href', `3d-studio/?model=${encodeURIComponent(model.id)}`);

      if (modalHighlights) {
        modalHighlights.replaceChildren();
        (model.highlights || []).forEach((item) => {
          const li = document.createElement('li');
          li.textContent = item;
          modalHighlights.appendChild(li);
        });
      }

      if (modalTags) {
        modalTags.replaceChildren();
        (model.tags || []).forEach((tag) => {
          const span = document.createElement('span');
          span.className = modalTags.getAttribute('data-tag-class') || 'tech-chip';
          span.textContent = tag;
          modalTags.appendChild(span);
        });
      }
    };

    const selectModel = (modelId, { syncModal = true, syncInline = true } = {}) => {
      const found = models.find((m) => m.id === modelId);
      if (!found) return;
      activeModel = found;
      if (syncInline) applyToInlineViewers(activeModel);
      if (syncModal) applyToModal(activeModel);
      syncLabelsAndSwitchers();
    };

    const buildSwitchButtons = (container, showSoonNote) => {
      container.replaceChildren();
      models.forEach((model) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'model-switch-btn';
        btn.setAttribute('data-model-id', model.id);
        btn.setAttribute('aria-pressed', String(model.id === activeModel.id));
        btn.textContent = model.title;
        btn.addEventListener('click', () => selectModel(model.id));
        container.appendChild(btn);
      });
      if (showSoonNote && models.length === 1) {
        const note = document.createElement('span');
        note.className = 'model-switcher-note';
        note.textContent = 'More 3D objects coming soon';
        container.appendChild(note);
      }
    };

    inlineSwitchers.forEach((container) => {
      if (models.length > 1) {
        container.hidden = false;
        buildSwitchButtons(container, false);
      } else {
        container.hidden = true;
      }
    });

    if (modalSwitcher) {
      buildSwitchButtons(modalSwitcher, true);
    }

    syncLabelsAndSwitchers();

    document.querySelectorAll('[data-open-3d-modal], [data-model-src]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (!modelModal || !modalViewer) return;
        const requestedId = trigger.getAttribute('data-model-id');
        const requestedSrc = trigger.getAttribute('data-model-src');
        if (requestedId) {
          selectModel(requestedId, { syncModal: true, syncInline: false });
        } else if (requestedSrc) {
          const match = models.find((m) => m.src === requestedSrc);
          if (match) {
            selectModel(match.id, { syncModal: true, syncInline: false });
          } else {
            modalViewer.setAttribute('src', requestedSrc);
            if (modalTitle) {
              modalTitle.textContent = trigger.getAttribute('data-model-title') || '3D Studio';
            }
          }
        } else {
          applyToModal(activeModel);
        }
        modelModal.showModal();
      });
    });

    if (toggleRotateBtn && modalViewer) {
      toggleRotateBtn.addEventListener('click', () => {
        const isRotating = modalViewer.hasAttribute('auto-rotate');
        if (isRotating) {
          modalViewer.removeAttribute('auto-rotate');
          toggleRotateBtn.classList.remove('active');
          toggleRotateBtn.setAttribute('aria-pressed', 'false');
        } else {
          modalViewer.setAttribute('auto-rotate', '');
          toggleRotateBtn.classList.add('active');
          toggleRotateBtn.setAttribute('aria-pressed', 'true');
        }
      });
    }

    if (resetCameraBtn && modalViewer) {
      resetCameraBtn.addEventListener('click', () => {
        modalViewer.cameraOrbit = activeModel.cameraOrbit || 'auto auto auto';
        modalViewer.fieldOfView = 'auto';
      });
    }

    // Hero or modal camera presets ([data-orbit][data-viewer-target])
    document.querySelectorAll('[data-orbit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetSelector = btn.getAttribute('data-viewer-target') || '#hero-model-viewer';
        const viewer = document.querySelector(targetSelector);
        if (!viewer) return;

        viewer.cameraOrbit = btn.getAttribute('data-orbit');
        const group = btn.closest('[data-orbit-group]');
        if (group) {
          group.querySelectorAll('[data-orbit]').forEach((b) => {
            const active = b === btn;
            b.classList.toggle('active', active);
            b.setAttribute('aria-pressed', String(active));
          });
        }
      });
    });
  }

  // ===========================
  // Command Palette (Spatial Variant - Cmd/Ctrl + K)
  // ===========================
  function initCommandPalette() {
    const cmdModal = document.getElementById('cmd-modal');
    if (!cmdModal) return;

    enhanceDialog(cmdModal);

    const searchInput = document.getElementById('cmd-search');
    const items = Array.from(cmdModal.querySelectorAll('[data-cmd-item]'));
    const emptyState = document.getElementById('cmd-empty');

    const openPalette = () => {
      if (cmdModal.open) {
        closeTopLayer(cmdModal);
        return;
      }
      if (searchInput) {
        searchInput.value = '';
        filterItems('');
      }
      cmdModal.showModal();
    };

    const filterItems = (query) => {
      const q = query.trim().toLowerCase();
      let visibleCount = 0;
      items.forEach((item) => {
        const haystack = (item.getAttribute('data-keywords') || item.textContent).toLowerCase();
        const matches = q === '' || haystack.includes(q);
        item.hidden = !matches;
        item.classList.remove('is-highlighted');
        if (matches) visibleCount++;
      });
      if (emptyState) emptyState.hidden = visibleCount > 0;
      const firstVisible = items.find((item) => !item.hidden);
      if (firstVisible) firstVisible.classList.add('is-highlighted');
    };

    const runAction = async (item) => {
      const action = item.getAttribute('data-action');
      const target = item.getAttribute('data-target');
      await closeTopLayer(cmdModal);

      if (action === 'scroll' && target) {
        document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      } else if (action === 'company' && target) {
        if (typeof window.__activateV3Tab === 'function') {
          window.__activateV3Tab(target);
        }
        document.getElementById('experience')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      } else if (action === 'model') {
        document.querySelector('[data-open-3d-modal], [data-model-src]')?.click();
      } else if (action === 'copy-email') {
        document.querySelector('[data-copy-email]')?.click();
      } else if (action === 'download-cv') {
        const link = document.createElement('a');
        link.href = 'files/khoa-bui-28-02-2025.pdf';
        link.download = '';
        link.click();
      } else if (action === 'navigate' && target) {
        window.location.href = target;
      }
    };

    document.querySelectorAll('[data-cmd-open]').forEach((btn) => {
      btn.addEventListener('click', openPalette);
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        if (e.target instanceof HTMLElement && e.target.isContentEditable) return;
        e.preventDefault();
        openPalette();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => filterItems(searchInput.value));
      searchInput.addEventListener('keydown', (e) => {
        const visible = items.filter((item) => !item.hidden);
        if (visible.length === 0) return;

        const currentIdx = Math.max(0, visible.findIndex((i) => i.classList.contains('is-highlighted')));
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          visible.forEach((i) => i.classList.remove('is-highlighted'));
          const next = visible[(currentIdx + 1) % visible.length];
          next.classList.add('is-highlighted');
          next.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          visible.forEach((i) => i.classList.remove('is-highlighted'));
          const prev = visible[(currentIdx - 1 + visible.length) % visible.length];
          prev.classList.add('is-highlighted');
          prev.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          runAction(visible[currentIdx]);
        }
      });
    }

    items.forEach((item) => {
      item.addEventListener('click', () => runAction(item));
    });
  }

  // ===========================
  // Theme Toggle (Editorial Variant - light-dark meta sync)
  // ===========================
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (!toggle || !meta) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const getStored = () => {
      try {
        const v = localStorage.getItem(THEME_STORAGE_KEY);
        return v === 'light' || v === 'dark' ? v : null;
      } catch {
        return null;
      }
    };

    const applyScheme = (stored) => {
      meta.content = stored ?? 'light dark';
    };

    toggle.addEventListener('click', () => {
      const system = mql.matches ? 'dark' : 'light';
      const stored = getStored();
      const rendered = stored ?? system;
      const target = rendered === 'dark' ? 'light' : 'dark';

      try {
        if (target !== system) {
          localStorage.setItem(THEME_STORAGE_KEY, target);
          applyScheme(target);
        } else {
          localStorage.removeItem(THEME_STORAGE_KEY);
          applyScheme(null);
        }
      } catch {
        applyScheme(target !== system ? target : null);
      }
    });

    window.addEventListener('storage', (event) => {
      if (event.key === THEME_STORAGE_KEY) {
        applyScheme(getStored());
      }
    });
  }

  // ===========================
  // Marquee Pause/Play Control (WCAG 2.2.2)
  // ===========================
  function initMarqueeToggle() {
    const btn = document.getElementById('marquee-toggle');
    const marquee = document.querySelector('.tech-marquee');
    if (!btn || !marquee) return;

    btn.addEventListener('click', () => {
      const isPaused = marquee.classList.toggle('is-paused');
      const label = btn.querySelector('[data-marquee-label]');
      if (label) {
        label.textContent = isPaused ? 'Play' : 'Pause';
      } else {
        btn.textContent = isPaused ? 'Play' : 'Pause';
      }
    });
  }

  // ===========================
  // Copy Email Action
  // ===========================
  function initCopyEmail() {
    document.querySelectorAll('[data-copy-email]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const email = btn.getAttribute('data-copy-email') || EMAIL_ADDRESS;
        let copied = false;
        if (navigator.clipboard?.writeText) {
          try {
            await navigator.clipboard.writeText(email);
            copied = true;
          } catch {
            copied = false;
          }
        }
        if (!copied) {
          const area = document.createElement('textarea');
          area.value = email;
          area.setAttribute('readonly', '');
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          try {
            copied = document.execCommand('copy');
          } catch {
            copied = false;
          }
          area.remove();
        }

        const labelNode = btn.querySelector('[data-copy-label]') || btn;
        const original = labelNode.textContent;
        labelNode.textContent = copied ? 'Copied!' : email;
        const statusEl = document.getElementById('copy-status');
        if (statusEl) {
          statusEl.textContent = copied ? `Copied ${email} to clipboard.` : `Email address: ${email}`;
        }
        setTimeout(() => {
          labelNode.textContent = original;
        }, 2000);
      });
    });
  }

  // ===========================
  // Contact Form Validation & EmailJS
  // ===========================
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const fields = Array.from(form.querySelectorAll('input[name], textarea[name]'));
    const loadingIcon = document.getElementById('loading-spinner');
    const submitText = document.getElementById('submit-text');
    const submitBtn = form.querySelector('button[type="submit"]');
    const successEl = document.getElementById('success-message');
    const failEl = document.getElementById('fail-message');

    const getErrorEl = (field) => {
      const id = field.getAttribute('aria-describedby');
      return id ? document.getElementById(id) : null;
    };

    const validateField = (field) => {
      const errorEl = getErrorEl(field);
      const valid = field.checkValidity();
      field.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (errorEl) {
        errorEl.textContent = valid ? '' : field.validationMessage || 'Please complete this field.';
      }
      return valid;
    };

    fields.forEach((field) => {
      let dirty = false;
      field.addEventListener('input', () => {
        dirty = true;
        if (field.getAttribute('aria-invalid') === 'true' && field.checkValidity()) {
          field.setAttribute('aria-invalid', 'false');
          const err = getErrorEl(field);
          if (err) err.textContent = '';
        }
      });
      field.addEventListener('blur', () => {
        if (dirty) validateField(field);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let firstInvalid = null;
      fields.forEach((field) => {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      if (successEl) successEl.hidden = true;
      if (failEl) failEl.hidden = true;

      if (loadingIcon) {
        loadingIcon.classList.remove('fa-paper-plane');
        loadingIcon.classList.add('fa-spinner', 'fa-spin');
      }
      if (submitText) submitText.textContent = 'Sending...';
      if (submitBtn) submitBtn.disabled = true;

      const resetBtn = () => {
        if (loadingIcon) {
          loadingIcon.classList.remove('fa-spinner', 'fa-spin');
          loadingIcon.classList.add('fa-paper-plane');
        }
        if (submitText) submitText.textContent = 'Send Message';
        if (submitBtn) submitBtn.disabled = false;
      };

      if (typeof window.emailjs === 'undefined') {
        resetBtn();
        if (failEl) failEl.hidden = false;
        return;
      }

      window.emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form).then(
        () => {
          resetBtn();
          if (successEl) successEl.hidden = false;
          form.reset();
          fields.forEach((f) => f.removeAttribute('aria-invalid'));
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'contact_form_submit', {
              event_category: 'Contact',
              event_label: 'success',
            });
          }
        },
        () => {
          resetBtn();
          if (failEl) failEl.hidden = false;
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'contact_form_submit', {
              event_category: 'Contact',
              event_label: 'fail',
            });
          }
        }
      );
    });
  }

  // ===========================
  // Progressive Section Reveal
  // ===========================
  function initRevealObserver() {
    const items = document.querySelectorAll('[data-reveal]');
    if (items.length === 0) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      items.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    document.documentElement.classList.add('reveal-enabled');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: '0px 0px -24px 0px' }
    );

    items.forEach((el) => io.observe(el));
  }

  // ===========================
  // Bootstrap
  // ===========================
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollProgress();
    initTypedHero();
    initClock();
    initSpotlight();
    initTabs();
    initSkillsFilter();
    initModelControls();
    initCommandPalette();
    initThemeToggle();
    initMarqueeToggle();
    initCopyEmail();
    initContactForm();
    initRevealObserver();
  });
})();
