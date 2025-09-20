/**
 * Updated script.js
 * - Fix: skill number count-up reliably updates the visible percentage
 * - Added: nav active highlight, CTA pulse, social icon entrance
 * - Respect reduced-motion toggle stored in localStorage
 * - Robustly triggers animations on nav clicks & intersection
 * - Enhanced with more GSAP animations: floating hero image, button ripple, section background parallax, project card hover pop, nav underline slide, and responsive reactivity
 */
(function () {
  const MOTION_KEY = 'portfolio_prefers_reduced_motion';
  const motionToggle = document.getElementById('motionToggle');
  const nav = document.querySelector('.nav');
  const navToggle = document.querySelector('.nav-toggle');

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helpers
  function motionAllowed() {
    if (prefersReducedMotion) return false;
    if (localStorage.getItem(MOTION_KEY) === 'true') return false;
    return true;
  }

  // update motion toggle UI
  function updateMotionToggleUI() {
    if (!motionToggle) return;
    const active = prefersReducedMotion || localStorage.getItem(MOTION_KEY) === 'true';
    motionToggle.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (active) motionToggle.classList.add('active'); else motionToggle.classList.remove('active');
  }
  updateMotionToggleUI();

  // toggle click
  motionToggle && motionToggle.addEventListener('click', () => {
    const cur = localStorage.getItem(MOTION_KEY) === 'true';
    localStorage.setItem(MOTION_KEY, (!cur).toString());
    updateMotionToggleUI();
    // reload to apply immediately (animation state resets safely)
    window.location.reload();
  });

  // mobile nav toggle
  navToggle && navToggle.addEventListener('click', () => {
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? '' : 'flex';
    navToggle.setAttribute('aria-expanded', (!isOpen).toString());
  });

  // Set year
  document.addEventListener('DOMContentLoaded', () => {
    const yrEl = document.getElementById('yr');
    if (yrEl) yrEl.textContent = new Date().getFullYear();
  });

  // Text split helper (idempotent)
  function splitToChars(el) {
    if (!el) return [];
    if (el.dataset.spans === 'true') return el.querySelectorAll('.char');
    const text = (el.dataset.original || el.textContent || '').trim();
    el.innerHTML = '';
    const frag = document.createDocumentFragment();
    text.split(' ').forEach(word => {
      const w = document.createElement('span');
      w.className = 'word';
      w.style.display = 'inline-block';
      w.style.marginRight = '8px';
      [...word].forEach(ch => {
        const c = document.createElement('span');
        c.className = 'char';
        c.style.display = 'inline-block';
        c.style.transform = 'translateY(10px)';
        c.style.opacity = 0;
        c.textContent = ch;
        w.appendChild(c);
      });
      frag.appendChild(w);
    });
    el.appendChild(frag);
    el.dataset.spans = 'true';
    return el.querySelectorAll('.char');
  }

  // Hero animation
  let heroTl = null;
  function animateHero() {
    const nameEl = document.getElementById('name');
    const taglineEl = document.getElementById('tagline');
    if (!nameEl || !taglineEl) return;

    if (!motionAllowed()) {
      nameEl.style.opacity = 1;
      taglineEl.style.opacity = 1;
      return;
    }

    const nameChars = splitToChars(nameEl);
    const tagChars = splitToChars(taglineEl);

    gsap.killTweensOf(nameChars);
    gsap.killTweensOf(tagChars);

    gsap.set(nameChars, { y: 10, opacity: 0 });
    gsap.set(tagChars, { y: 10, opacity: 0 });

    if (heroTl) heroTl.kill();
    heroTl = gsap.timeline();
    heroTl.to(nameChars, { duration: 0.72, y: 0, opacity: 1, stagger: 0.03, ease: 'power3.out' })
      .to(tagChars, { duration: 0.6, y: 0, opacity: 1, stagger: 0.02, ease: 'power3.out' }, 0.45)
      .from('.lead', { y: 10, opacity: 0, duration: 0.6 }, 0.85)
      .from('.hero-cta .btn', { y: 8, opacity: 0, stagger: 0.08, duration: 0.45 }, 1);
  }

  // --- NEW: Floating hero image animation ---
  function animateHeroImage() {
    const heroImg = document.querySelector('.hero-img, .hero-image');
    if (!heroImg || !motionAllowed()) return;
    gsap.to(heroImg, {
      y: 18,
      rotate: 2,
      scale: 1.025,
      duration: 3.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.10))'
    });
  }

  // DNA animation
  function initDna() {
    if (!motionAllowed()) {
      document.querySelectorAll('.dna-bg .pair').forEach(el => el.style.transform = 'translateY(0)');
      return;
    }
    gsap.to('.dna-bg', { duration: 12, rotate: 2, y: 20, repeat: -1, yoyo: true, ease: 'sine.inOut', opacity: 0.12 });
    gsap.utils.toArray('.dna-bg .pair').forEach((el, i) => {
      gsap.to(el, { y: i % 2 === 0 ? -6 : 6, x: i % 2 === 0 ? -4 : 4, duration: 3 + (i * 0.08), repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
  }

  // --- NEW: Button ripple effect on click ---
  function initButtonRipples() {
    document.querySelectorAll('button, .btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        if (!motionAllowed()) return;
        let ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (e.offsetX || e.clientX - btn.getBoundingClientRect().left) + 'px';
        ripple.style.top = (e.offsetY || e.clientY - btn.getBoundingClientRect().top) + 'px';
        btn.appendChild(ripple);
        gsap.fromTo(ripple, { scale: 0, opacity: 0.5 }, { scale: 2.5, opacity: 0, duration: 0.7, ease: 'power1.out', onComplete: () => ripple.remove() });
      });
    });
  }

  // --- NEW: Section background parallax on scroll ---
  function initSectionParallax() {
    if (!motionAllowed()) return;
    const parallaxSections = document.querySelectorAll('.section.bg-parallax');
    if (!parallaxSections.length) return;
    window.addEventListener('scroll', () => {
      parallaxSections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        const y = Math.min(0, rect.top * 0.18);
        gsap.to(sec, { backgroundPositionY: y + 'px', duration: 0.5, overwrite: 'auto' });
      });
    });
  }

  // --- NEW: Project card hover pop/shine ---
  function initCardHoverPop() {
    document.querySelectorAll('.project-card, .card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (!motionAllowed()) return;
        gsap.to(card, { scale: 1.045, boxShadow: '0 16px 40px rgba(0,0,0,0.16)', duration: 0.22, ease: 'power2.out' });
        // optional: shine effect
        let shine = document.createElement('div');
        shine.className = 'card-shine';
        card.appendChild(shine);
        gsap.fromTo(shine, { left: '-60%' }, { left: '120%', duration: 0.7, ease: 'power1.in', onComplete: () => shine.remove() });
      });
      card.addEventListener('mouseleave', () => {
        if (!motionAllowed()) return;
        gsap.to(card, { scale: 1, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', duration: 0.32, ease: 'power2.out' });
      });
    });
  }

  // --- IMPROVED: Nav underline slide effect, tracks active and hover ---
  function initNavUnderline() {
    const navLinks = Array.from(document.querySelectorAll('.nav a'));
    let underline = document.querySelector('.nav-underline-global');
    if (!underline) {
      underline = document.createElement('span');
      underline.className = 'nav-underline nav-underline-global';
      underline.style.position = 'absolute';
      underline.style.height = '2.5px';
      underline.style.background = 'var(--accent, #4fd1c5)';
      underline.style.borderRadius = '2px';
      underline.style.transition = 'all .22s cubic-bezier(.2,.9,.2,1)';
      underline.style.pointerEvents = 'none';
      underline.style.zIndex = 2;
      document.querySelector('.nav').appendChild(underline);
    }
    // Helper to move underline
    function moveUnderlineTo(link) {
      if (!link) {
        underline.style.opacity = 0;
        return;
      }
      const rect = link.getBoundingClientRect();
      const navRect = link.parentElement.getBoundingClientRect();
      underline.style.opacity = 1;
      underline.style.width = rect.width + 'px';
      underline.style.left = (rect.left - navRect.left) + 'px';
      underline.style.top = (rect.bottom - navRect.top + 2) + 'px';
    }
    // Track active
    function updateActiveUnderline() {
      const active = document.querySelector('.nav a.active');
      moveUnderlineTo(active);
    }
    // Hover logic
    navLinks.forEach(a => {
      a.addEventListener('mouseenter', () => moveUnderlineTo(a));
      a.addEventListener('mouseleave', updateActiveUnderline);
    });
    // On scroll/resize, update
    window.addEventListener('resize', updateActiveUnderline);
    window.addEventListener('scroll', updateActiveUnderline);
    // On nav highlight update
    setTimeout(updateActiveUnderline, 100);
    // Also update on nav highlight changes
    document.addEventListener('navActiveChanged', updateActiveUnderline);
  }

  // --- EVEN MORE ANIMATIONS ---
  // Floating social icons
  function animateSocialFloat() {
    if (!motionAllowed()) return;
    const socials = Array.from(document.querySelectorAll('.social-list a'));
    socials.forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? 4 : -4,
        duration: 2.2 + i * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.1
      });
    });
  }

  // Hero text color flicker
  function animateHeroFlicker() {
    if (!motionAllowed()) return;
    const nameEl = document.getElementById('name');
    if (!nameEl) return;
    gsap.to(nameEl, {
      color: '#4fd1c5',
      duration: 0.18,
      repeat: 6,
      yoyo: true,
      ease: 'power1.inOut',
      delay: 0.7
    });
  }

  // Achievements confetti burst on entrance
  function animateAchievementsConfetti() {
    if (!motionAllowed()) return;
    const achs = Array.from(document.querySelectorAll('.achievements-list li'));
    if (!achs.length) return;
    achs.forEach((ach, i) => {
      setTimeout(() => {
        for (let j = 0; j < 6; j++) {
          let conf = document.createElement('span');
          conf.className = 'confetti';
          conf.style.position = 'absolute';
          conf.style.left = (30 + Math.random() * 40) + '%';
          conf.style.top = (30 + Math.random() * 40) + '%';
          conf.style.width = '6px';
          conf.style.height = '6px';
          conf.style.background = ['#a78bfa','#4fd1c5','#ffd6e0','#b6f0d3'][j%4];
          conf.style.borderRadius = '50%';
          conf.style.opacity = 0.7;
          ach.appendChild(conf);
          gsap.fromTo(conf, { y: 0, scale: 1 }, {
            y: -30 - Math.random()*30,
            scale: 0.7 + Math.random()*0.6,
            opacity: 0,
            duration: 1.1 + Math.random()*0.4,
            ease: 'power1.out',
            onComplete: () => conf.remove()
          });
        }
      }, 400 + i*120);
    });
  }

  // Hobby bounce on click
  function animateHobbyBounce() {
    const hobbies = Array.from(document.querySelectorAll('.hobby'));
    hobbies.forEach(hobby => {
      hobby.addEventListener('click', () => {
        if (!motionAllowed()) return;
        gsap.fromTo(hobby, { scale: 1 }, { scale: 1.13, duration: 0.18, yoyo: true, repeat: 1, ease: 'elastic.out(1,0.6)' });
      });
    });
  }

  // Robust skill animation (fixed)
  // bars: array of elements (skill-bar DOM nodes).
  // options.force: boolean to re-run even if already animated.
  function animateSkillBars(bars = [], options = { force: false }) {
    if (!bars || !bars.length) return;
    const allowMotion = motionAllowed();

    bars.forEach(bar => {
      if (!bar) return;
      const skillWrap = bar.closest('.skill') || bar.parentElement;
      const percentLabel = skillWrap && skillWrap.querySelector('.skill-percent');
      const fill = bar.querySelector('.fill');
      const pct = Math.max(0, Math.min(100, parseInt(bar.dataset.percent || bar.getAttribute('data-percent') || '0', 10)));

      // accessibility
      bar.setAttribute('aria-valuenow', pct);

      // prevent double animation unless forced
      if (!options.force && bar.dataset.animated === 'true') {
        // still ensure label shows final if not animated
        if (percentLabel && percentLabel.textContent.trim() === '0%') percentLabel.textContent = pct + '%';
        if (fill && fill.style.width === '') fill.style.width = pct + '%';
        return;
      }

      // if reduced motion: apply instantly
      if (!allowMotion) {
        fill.style.width = pct + '%';
        if (percentLabel) percentLabel.textContent = pct + '%';
        bar.dataset.animated = 'true';
        return;
      }

      // animate fill
      gsap.killTweensOf(fill);
      gsap.to(fill, { width: pct + '%', duration: 1.2, ease: 'power2.out' });

      // animate count-up
      if (percentLabel) {
        // use gsap tween on object so it updates text smoothly
        const obj = { v: 0 };
        gsap.to(obj, {
          v: pct,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            percentLabel.textContent = Math.round(obj.v) + '%';
          },
          onComplete: () => {
            percentLabel.textContent = pct + '%';
            bar.dataset.animated = 'true';
          }
        });
      } else {
        // if no label, still mark animated
        bar.dataset.animated = 'true';
      }
    });
  }

  // Fallback immediate apply for reduced-motion
  function applySkillFallback(container) {
    const bars = container.querySelectorAll && container.querySelectorAll('.skill-bar');
    if (!bars || !bars.length) return;
    bars.forEach(b => {
      const fill = b.querySelector('.fill');
      const pct = parseInt(b.dataset.percent || '0', 10);
      fill.style.width = pct + '%';
      const label = b.closest('.skill') && b.closest('.skill').querySelector('.skill-percent');
      if (label) label.textContent = pct + '%';
      b.dataset.animated = 'true';
      b.setAttribute('aria-valuenow', pct);
    });
  }

  // Intersection reveal (staggered)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (!motionAllowed()) {
          el.style.opacity = 1;
          applySkillFallback(el);
          revealObserver.unobserve(el);
          return;
        }
        gsap.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.72, ease: 'power2.out' });
        // animate any inner cards
        const innerCards = el.querySelectorAll && el.querySelectorAll('.project-card, .card, .hobby');
        if (innerCards && innerCards.length) {
          gsap.fromTo(Array.from(innerCards), { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out' });
        }
        // animate skillbars if present
        const skillBars = el.querySelectorAll && el.querySelectorAll('.skill-bar');
        if (skillBars && skillBars.length) {
          animateSkillBars(Array.from(skillBars));
        }
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  // Observe sections
  function observeAll() {
    document.querySelectorAll('.section, .project-card, .card').forEach(el => {
      if (!motionAllowed()) {
        el.style.opacity = 1;
        applySkillFallback(el);
      } else {
        el.style.opacity = 0;
        revealObserver.observe(el);
      }
    });
  }

  // Nav smooth scroll + forced re-animations on click
  function initNav() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        // close mobile nav
        if (window.innerWidth <= 900 && nav.style.display === 'flex') {
          nav.style.display = '';
          navToggle.setAttribute('aria-expanded', 'false');
        }

        if (motionAllowed() && gsap && gsap.plugins && gsap.plugins.ScrollToPlugin) {
          gsap.to(window, {
            duration: 0.8,
            scrollTo: { y: target, offsetY: 72 },
            ease: 'power3.out',
            onComplete: () => {
              // focus target
              target.setAttribute('tabindex', '-1');
              target.focus({ preventScroll: true });
              // force re-run reveals (skills etc.)
              revealElementForce(target);
            }
          });
        } else {
          target.scrollIntoView({ behavior: motionAllowed() ? 'smooth' : 'auto', block: 'start' });
          setTimeout(() => revealElementForce(target), 420);
        }

        // micro animation for clicked nav item
        if (motionAllowed()) {
          gsap.fromTo(a, { scale: 0.98 }, { scale: 1, duration: 0.22, ease: 'power2.out' });
        }
      });
    });
  }

  // Force reveal a section (re-run skill animations even if already animated)
  function revealElementForce(target) {
    if (!target) return;
    // simple entrance for the target
    if (motionAllowed()) {
      gsap.fromTo(target, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' });
    } else {
      target.style.opacity = 1;
    }
    // animate skill bars in it (force true)
    const skillBars = target.querySelectorAll && target.querySelectorAll('.skill-bar');
    if (skillBars && skillBars.length) animateSkillBars(Array.from(skillBars), { force: true });

    // also replay hero if necessary
    if (target.id === 'home') animateHero();
  }

  // Highlight nav links based on scroll position
  function initNavHighlight() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    function onScroll() {
      const offset = window.innerHeight * 0.35;
      let activeId = null;
      for (const sec of sections) {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= offset && rect.bottom >= offset) {
          activeId = sec.id;
          break;
        }
      }
      document.querySelectorAll('.nav a').forEach(a => {
        const href = a.getAttribute('href') || '';
        if (href === '#' + activeId) a.classList.add('active'); else a.classList.remove('active');
      });
    }
    onScroll();
    window.addEventListener('scroll', throttle(onScroll, 120));
    window.addEventListener('resize', throttle(onScroll, 200));
  }

  // CTA pulse
  function ctaPulse() {
    if (!motionAllowed()) return;
    const cta = document.querySelector('.nav .cta') || document.getElementById('projectsBtn');
    if (!cta) return;
    gsap.to(cta, { scale: 1.02, duration: 1.1, repeat: -1, yoyo: true, ease: 'sine.inOut', opacity: 0.98 });
  }

  // Social links entrance
  function socialEntrance() {
    if (!motionAllowed()) return;
    const socials = Array.from(document.querySelectorAll('.social-list a'));
    if (!socials.length) return;
    gsap.fromTo(socials, { x: -8, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' });
  }

  // small throttle util
  function throttle(fn, wait) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  // reveal helper used by observer on intersect
  function revealOnIntersect(entry) {
    const el = entry.target;
    if (!el) return;
    if (!motionAllowed()) {
      el.style.opacity = 1;
      applySkillFallback(el);
      return;
    }
    gsap.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.72, ease: 'power2.out' });
    const innerCards = el.querySelectorAll && el.querySelectorAll('.project-card, .hobby, .card');
    if (innerCards && innerCards.length) {
      gsap.fromTo(Array.from(innerCards), { y: 12, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out' });
    }
    const skillBars = el.querySelectorAll && el.querySelectorAll('.skill-bar');
    if (skillBars && skillBars.length) animateSkillBars(Array.from(skillBars));
  }

  // --- ENHANCED: Animate hobbies entrance and interactivity ---
  function animateHobbies() {
    const hobbies = Array.from(document.querySelectorAll('.hobby'));
    if (!hobbies.length) return;
    if (!motionAllowed()) {
      hobbies.forEach(h => h.style.opacity = 1);
      return;
    }
    gsap.set(hobbies, { y: 24, opacity: 0 });
    gsap.to(hobbies, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.10,
      ease: 'power3.out',
      overwrite: 'auto'
    });
    // Shine on hover/focus
    hobbies.forEach(hobby => {
      hobby.addEventListener('mouseenter', () => {
        if (!motionAllowed()) return;
        let shine = document.createElement('div');
        shine.className = 'card-shine';
        hobby.appendChild(shine);
        gsap.fromTo(shine, { left: '-60%' }, { left: '120%', duration: 0.7, ease: 'power1.in', onComplete: () => shine.remove() });
      });
      hobby.addEventListener('focus', () => {
        if (!motionAllowed()) return;
        let shine = document.createElement('div');
        shine.className = 'card-shine';
        hobby.appendChild(shine);
        gsap.fromTo(shine, { left: '-60%' }, { left: '120%', duration: 0.7, ease: 'power1.in', onComplete: () => shine.remove() });
      });
    });
  }

  // --- ENHANCED: Animate achievements entrance and interactivity ---
  function animateAchievements() {
    const achs = Array.from(document.querySelectorAll('.achievements-list li'));
    if (!achs.length) return;
    if (!motionAllowed()) {
      achs.forEach(a => a.style.opacity = 1);
      return;
    }
    gsap.set(achs, { y: 18, opacity: 0 });
    gsap.to(achs, {
      y: 0,
      opacity: 1,
      duration: 0.65,
      stagger: 0.09,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    // Pop on hover/focus
    achs.forEach(ach => {
      ach.addEventListener('mouseenter', () => {
        if (!motionAllowed()) return;
        gsap.to(ach, { scale: 1.04, duration: 0.18, ease: 'power2.out' });
      });
      ach.addEventListener('mouseleave', () => {
        if (!motionAllowed()) return;
        gsap.to(ach, { scale: 1, duration: 0.22, ease: 'power2.out' });
      });
      ach.addEventListener('focus', () => {
        if (!motionAllowed()) return;
        gsap.to(ach, { scale: 1.04, duration: 0.18, ease: 'power2.out' });
      });
      ach.addEventListener('blur', () => {
        if (!motionAllowed()) return;
        gsap.to(ach, { scale: 1, duration: 0.22, ease: 'power2.out' });
      });
    });
  }

  // --- Color cycle for #name (Aashvi Shah) on hover ---
  function animateNameColorCycle() {
    const nameEl = document.getElementById('name');
    if (!nameEl) return;
    let colorTween = null;
    nameEl.addEventListener('mouseenter', () => {
      if (!motionAllowed()) return;
      if (colorTween) colorTween.kill();
      function randomColor() {
        return `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
      }
      colorTween = gsap.to(nameEl, {
        color: randomColor,
        repeat: -1,
        yoyo: true,
        duration: 0.22,
        ease: 'none',
        onUpdate: function() {
          gsap.to(nameEl, { color: randomColor(), duration: 0.22, overwrite: true });
        }
      });
    });
    nameEl.addEventListener('mouseleave', () => {
      if (colorTween) colorTween.kill();
      colorTween = null;
      gsap.to(nameEl, { color: 'var(--primary)', duration: 0.3 });
    });
  }

  // --- Animate Socials section entrance and links ---
  function animateSocialsSection() {
    const socialsSection = document.getElementById('socials');
    if (!socialsSection || !motionAllowed()) return;
    gsap.fromTo(socialsSection, { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
    const links = socialsSection.querySelectorAll('.social-list a');
    gsap.fromTo(links, { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.2 });
    // Color cycle and bounce on hover
    links.forEach(link => {
      let colorTween = null;
      link.addEventListener('mouseenter', () => {
        if (!motionAllowed()) return;
        if (colorTween) colorTween.kill();
        function randomColor() {
          return `rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`;
        }
        colorTween = gsap.to(link, {
          color: randomColor,
          repeat: -1,
          yoyo: true,
          duration: 0.18,
          ease: 'none',
          onUpdate: function() {
            gsap.to(link, { color: randomColor(), duration: 0.18, overwrite: true });
          }
        });
        gsap.fromTo(link, { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'elastic.out(1,0.6)' });
      });
      link.addEventListener('mouseleave', () => {
        if (colorTween) colorTween.kill();
        colorTween = null;
        gsap.to(link, { color: '', duration: 0.3 });
      });
    });
  }

  // --- ADDITIONAL GSAP ANIMATIONS ---
  // Animate section headers on entrance
  function animateSectionHeaders() {
    const headers = document.querySelectorAll('section h2');
    if (!headers.length || !motionAllowed()) return;
    gsap.set(headers, { y: 24, opacity: 0 });
    gsap.to(headers, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out',
      overwrite: 'auto',
      delay: 0.2
    });
  }

  // Animate project cards with rotation and scale on entrance
  function animateProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length || !motionAllowed()) return;
    gsap.set(cards, { y: 32, opacity: 0, rotate: -3, scale: 0.97 });
    gsap.to(cards, {
      y: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      overwrite: 'auto',
      delay: 0.3
    });
  }

  // Animate skills grid fade-in with stagger
  function animateSkillsGrid() {
    const skills = document.querySelectorAll('.skills-grid .skill');
    if (!skills.length || !motionAllowed()) return;
    gsap.set(skills, { y: 20, opacity: 0 });
    gsap.to(skills, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.10,
      ease: 'power2.out',
      overwrite: 'auto',
      delay: 0.25
    });
  }

  // --- Update reinitAllAnimations to include new features ---
  function reinitAllAnimations() {
    animateHero();
    animateHeroImage();
    observeAll();
    initNavHighlight();
    ctaPulse();
    socialEntrance();
    animateSocialFloat();
    animateHeroFlicker();
    initButtonRipples();
    initSectionParallax();
    initCardHoverPop();
    initNavUnderline();
    animateHobbies();
    animateHobbyBounce();
    animateAchievements();
    animateAchievementsConfetti();
    animateNameColorCycle();
    animateSocialsSection();
    animateSectionHeaders();
    animateProjectCards();
    animateSkillsGrid();
  }

  // Setup on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    animateHero();
    animateHeroImage();
    observeAll();
    initNav();
    initNavHighlight();
    ctaPulse();
    socialEntrance();
    animateSocialFloat();
    animateHeroFlicker();
    initButtonRipples();
    initSectionParallax();
    initCardHoverPop();
    initNavUnderline();
    animateHobbies();
    animateHobbyBounce();
    animateAchievements();
    animateAchievementsConfetti();
    animateNameColorCycle();
    animateSocialsSection();
    animateSectionHeaders();
    animateProjectCards();
    animateSkillsGrid();

    // If skills in view already, animate them immediately
    const skillsSec = document.getElementById('skills');
    if (skillsSec && skillsSec.getBoundingClientRect().top < window.innerHeight * 0.9) {
      animateSkillBars(Array.from(skillsSec.querySelectorAll('.skill-bar')));
    }

    // hookup reveal observer entries to use revealOnIntersect (replace default callback)
    // We already created revealObserver earlier; re-create with new callback for consistency
    // (Replace above observer)
    // Clean up: disconnect original and make new one
    if (window.revealObserver) {
      try { window.revealObserver.disconnect(); } catch(e) {}
    }
    window.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealOnIntersect(entry);
          window.revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    // Observe elements with the new observer
    document.querySelectorAll('.section, .project-card, .card').forEach(el => {
      if (!motionAllowed()) {
        el.style.opacity = 1;
        applySkillFallback(el);
      } else {
        el.style.opacity = 0;
        window.revealObserver.observe(el);
      }
    });

    // Responsive reactivity
    window.addEventListener('resize', throttle(reinitAllAnimations, 300));
    window.addEventListener('orientationchange', () => setTimeout(reinitAllAnimations, 300));
    window.addEventListener('storage', (e) => {
      if (e.key === MOTION_KEY) {
        setTimeout(reinitAllAnimations, 100);
      }
    });
  });

})();
