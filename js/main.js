/* ============================================
   ISOLDE NOTTELMAN - PORTFOLIO
   Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  var nav = document.querySelector('.nav');
  var pageHeader = document.querySelector('.page-header');
  var pageHeaderBg = document.querySelector('.page-header-bg-text');
  var introOverlay = document.querySelector('.intro-overlay');
  var introName = document.querySelector('.intro-name');

  initIntro();
  initNav();
  initMobileNav();
  initRevealObserver();
  initHeaderParallax();
  initInternalPageTransitions();
  initPortfolioPage();
  fadeBodyIn();

  function initIntro() {
    if (!introOverlay || !introName) {
      animateHero();
      return;
    }

    if (window.sessionStorage && window.sessionStorage.getItem('isoldeIntroSeen') === 'true') {
      introOverlay.remove();
      animateHero();
      return;
    }

    body.style.overflow = 'hidden';

    setTimeout(function () {
      introName.classList.add('visible');
    }, 120);

    setTimeout(function () {
      introName.classList.add('fade-out');
    }, 900);

    setTimeout(function () {
      introOverlay.classList.add('done');
      body.style.overflow = '';
      animateHero();
      if (window.sessionStorage) {
        window.sessionStorage.setItem('isoldeIntroSeen', 'true');
      }
    }, 1250);

    setTimeout(function () {
      introOverlay.remove();
    }, 1700);
  }

  function animateHero() {
    var heroElements = document.querySelectorAll('.hero-subtitle, .hero-title, .hero-line, .hero-tagline, .hero-scroll-indicator');
    heroElements.forEach(function (element, index) {
      setTimeout(function () {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) scaleX(1)';
        element.style.transition = 'opacity 700ms ease, transform 700ms cubic-bezier(0.16, 1, 0.3, 1)';
      }, index * 120);
    });

    var decos = document.querySelectorAll('.hero-deco');
    decos.forEach(function (element, index) {
      setTimeout(function () {
        element.style.opacity = '1';
        element.style.transition = 'opacity 1200ms ease';
      }, 600 + (index * 200));
    });
  }

  function initNav() {
    if (!nav) {
      return;
    }

    var startsDark = nav.classList.contains('nav-on-dark');

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;

      if (scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }

      if (startsDark && pageHeader) {
        var headerBottom = pageHeader.offsetHeight;

        if (scrollY > headerBottom - 80) {
          nav.classList.remove('nav-on-dark');
        } else {
          nav.classList.add('nav-on-dark');
        }
      }
    }, { passive: true });

    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav-link');

    links.forEach(function (link) {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
      }
    });
  }

  function initMobileNav() {
    var navToggle = document.querySelector('.nav-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (!navToggle || !navLinks) {
      return;
    }

    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
        body.style.overflow = '';
      });
    });
  }

  function initRevealObserver() {
    var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if (!revealElements.length) {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initHeaderParallax() {
    if (!pageHeaderBg) {
      return;
    }

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      pageHeaderBg.style.transform = 'translate(-50%, calc(-50% + ' + (scrollY * 0.15) + 'px))';
    }, { passive: true });
  }

  function initInternalPageTransitions() {
    var internalLinks = document.querySelectorAll('a[href$=".html"]');

    internalLinks.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');

        if (!href || href.startsWith('http') || href.startsWith('mailto') || link.target === '_blank') {
          return;
        }

        event.preventDefault();
        body.style.opacity = '0';
        body.style.transition = 'opacity 300ms ease';

        setTimeout(function () {
          window.location.href = href;
        }, 300);
      });
    });
  }

  function fadeBodyIn() {
    body.style.opacity = '0';

    requestAnimationFrame(function () {
      body.style.transition = 'opacity 400ms ease';
      body.style.opacity = '1';
    });
  }

  function initPortfolioPage() {
    var pageKey = body.dataset.portfolioPage;

    if (!pageKey || !window.PORTFOLIO_DATA || !window.PORTFOLIO_DATA[pageKey]) {
      return;
    }

    var category = window.PORTFOLIO_DATA[pageKey];
    var selectorGrid = document.getElementById('project-selector-grid');
    var projectView = document.getElementById('project-view');
    var projectLabel = document.getElementById('project-label');
    var projectTitle = document.getElementById('project-title');
    var projectDescription = document.getElementById('project-description');
    var projectGallery = document.getElementById('project-gallery');
    var projectEmpty = document.getElementById('project-empty');
    var projectClose = document.getElementById('project-close');
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightbox-image');
    var lightboxClose = document.getElementById('lightbox-close');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');
    var currentProject = null;
    var currentLightboxIndex = 0;

    if (!selectorGrid || !projectView || !projectGallery) {
      return;
    }

    renderSelectorCards();

    if (projectClose) {
      projectClose.addEventListener('click', closeProject);
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function () {
        stepLightbox(-1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', function () {
        stepLightbox(1);
      });
    }

    if (lightbox) {
      lightbox.addEventListener('click', function (event) {
        if (event.target === lightbox) {
          closeLightbox();
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (!lightbox || lightbox.hidden || !currentProject || currentProject.type !== 'image') {
        return;
      }

      if (event.key === 'ArrowLeft') {
        stepLightbox(-1);
      }

      if (event.key === 'ArrowRight') {
        stepLightbox(1);
      }
    });

    var initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      var initialProject = category.projects.find(function (project) {
        return project.slug === initialHash;
      });

      if (initialProject) {
        renderProject(initialProject.slug, false);
      }
    }

    function renderSelectorCards() {
      selectorGrid.innerHTML = '';

      category.projects.forEach(function (project, index) {
        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'project-folder reveal';
        trigger.setAttribute('data-project-trigger', project.slug);
        trigger.setAttribute('aria-label', 'Open ' + project.name);

        var preview = document.createElement('div');
        preview.className = 'project-folder-preview';

        if (project.cover) {
          var previewImage = document.createElement('img');
          previewImage.className = 'project-folder-image';
          previewImage.src = project.cover;
          previewImage.decoding = 'async';
          previewImage.alt = 'Preview van ' + project.name;
          preview.appendChild(previewImage);
        }

        var tab = document.createElement('span');
        tab.className = 'project-folder-tab';
        tab.textContent = 'Map';

        var content = document.createElement('div');
        content.className = 'project-folder-body';

        var number = document.createElement('span');
        number.className = 'project-folder-number';
        number.textContent = String(index + 1).padStart(2, '0');

        var title = document.createElement('h2');
        title.className = 'project-folder-title';
        title.textContent = project.name;

        var text = document.createElement('p');
        text.className = 'project-folder-text';

        content.appendChild(number);
        content.appendChild(title);

        if (project.description) {
          text.textContent = project.description;
          content.appendChild(text);
        }

        trigger.appendChild(preview);
        trigger.appendChild(tab);
        trigger.appendChild(content);

        trigger.addEventListener('click', function () {
          renderProject(project.slug, true);
        });

        selectorGrid.appendChild(trigger);
      });

      initRevealObserver();
    }

    function setActiveTrigger(projectSlug) {
      selectorGrid.querySelectorAll('[data-project-trigger]').forEach(function (trigger) {
        trigger.classList.toggle('active', trigger.getAttribute('data-project-trigger') === projectSlug);
      });
    }

    function renderProject(projectSlug, shouldScroll) {
      var project = category.projects.find(function (entry) {
        return entry.slug === projectSlug;
      });

      if (!project) {
        return;
      }

      currentProject = project;
      projectView.hidden = false;
      projectLabel.textContent = project.label;
      projectTitle.textContent = project.name;
      projectDescription.textContent = project.description;
      projectDescription.hidden = !project.description;
      projectGallery.innerHTML = '';
      projectEmpty.hidden = project.items.length > 0;
      setActiveTrigger(project.slug);
      window.location.hash = project.slug;

      if (project.items.length) {
        project.items.forEach(function (item, index) {
          var card = item.type === 'video'
            ? createVideoCard(item, index)
            : createImageCard(item, index);

          projectGallery.appendChild(card);
        });

        requestAnimationFrame(function () {
          projectGallery.querySelectorAll('.js-stagger-item').forEach(function (item, index) {
            setTimeout(function () {
              item.classList.add('is-visible');
            }, Math.min(index * 70, 560));
          });
        });
      }

      if (shouldScroll !== false) {
        projectView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    function createImageCard(item, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'media-thumb media-thumb-image js-stagger-item';
      button.setAttribute('aria-label', 'Open afbeelding ' + (index + 1));

      var image = document.createElement('img');
      image.className = 'media-thumb-image-el';
      image.src = item.thumb || item.src;
      image.decoding = 'async';
      image.alt = item.alt;

      button.appendChild(image);
      button.addEventListener('click', function () {
        openLightbox(index);
      });

      return button;
    }

    function createVideoCard(item) {
      var link = document.createElement('a');
      link.className = 'media-thumb media-thumb-video js-stagger-item';
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Open ' + item.title + ' op YouTube');

      var imageWrap = document.createElement('div');
      imageWrap.className = 'media-thumb-video-frame';

      var image = document.createElement('img');
      image.className = 'media-thumb-image-el';
      image.src = item.thumbnail;
      image.decoding = 'async';
      image.alt = item.title;

      var badge = document.createElement('span');
      badge.className = 'video-play-badge';
      badge.textContent = 'Play';

      var meta = document.createElement('div');
      meta.className = 'media-thumb-meta';

      var title = document.createElement('strong');
      title.className = 'media-thumb-title';
      title.textContent = item.title;

      var source = document.createElement('span');
      source.className = 'media-thumb-source';
      source.textContent = 'Bekijk op YouTube';

      imageWrap.appendChild(image);
      imageWrap.appendChild(badge);
      meta.appendChild(title);
      meta.appendChild(source);
      link.appendChild(imageWrap);
      link.appendChild(meta);

      return link;
    }

    function openLightbox(index) {
      if (!lightbox || !currentProject || currentProject.type !== 'image') {
        return;
      }

      currentLightboxIndex = index;
      updateLightbox();
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('lightbox-open');
    }

    function updateLightbox() {
      if (!currentProject || currentProject.type !== 'image' || !lightboxImage) {
        return;
      }

      var item = currentProject.items[currentLightboxIndex];
      if (!item) {
        return;
      }

      lightboxImage.src = item.src;
      lightboxImage.alt = item.alt;
    }

    function stepLightbox(direction) {
      if (!currentProject || currentProject.type !== 'image' || !currentProject.items.length) {
        return;
      }

      currentLightboxIndex = (currentLightboxIndex + direction + currentProject.items.length) % currentProject.items.length;
      updateLightbox();
    }

    function closeLightbox() {
      if (!lightbox) {
        return;
      }

      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      body.classList.remove('lightbox-open');
    }

    function closeProject() {
      currentProject = null;
      projectView.hidden = true;
      projectGallery.innerHTML = '';
      projectEmpty.hidden = true;
      setActiveTrigger(null);
      closeLightbox();
      history.replaceState(null, '', window.location.pathname);
    }
  }
});
