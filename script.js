/**
 * GUNANIDHI M | CINEMATIC DIRECTOR PORTFOLIO
 * Core Interactions, Web Audio Synthesizer, & GSAP Animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. RUNNING CINEMA TIMECODE (ARRI / RED STYLE)
  initCinemaTimecode();

  // 2. CINEMATIC AUDIO EXPERIENCE (WEB AUDIO API SYNTHESIZER)
  initCinematicAudio();

  // 3. CUSTOM INTERACTIVE CURSOR
  initCustomCursor();

  // 4. CLAPPERBOARD PRELOADER
  initPreloader();

  // 5. CINEMA LIGHTBOX MODAL
  initCinemaModal();

  // 6. NAVBAR SCROLL EFFECT & MOBILE MENU
  initNavigation();

  // 7. COPY EMAIL TO CLIPBOARD
  initEmailCopy();

  // 8. SCROLL REVEALS & GSAP INTEGRATION
  initScrollAnimations();
});

/* ==========================================================================
   1. RUNNING CINEMA TIMECODE
   ========================================================================== */
function initCinemaTimecode() {
  const timecodeEl = document.getElementById('cinemaTimecode');
  if (!timecodeEl) return;

  let frames = 18;
  let seconds = 24;
  let minutes = 4;
  let hours = 0;

  setInterval(() => {
    frames++;
    if (frames >= 24) {
      frames = 0;
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
    }

    const pad = (num) => String(num).padStart(2, '0');
    timecodeEl.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
  }, 1000 / 24); // 24 FPS accurate clock
}

/* ==========================================================================
   2. CINEMATIC WEB AUDIO SYNTHESIZER (ZERO EXTERNAL ASSETS)
   ========================================================================== */
let audioCtx = null;
let masterGain = null;
let droneOsc1 = null;
let droneOsc2 = null;
let droneFilter = null;
let isAudioPlaying = false;

function initCinematicAudio() {
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundBars = document.getElementById('soundBars');
  const soundLabel = document.getElementById('soundLabel');
  if (!soundToggleBtn) return;

  soundToggleBtn.addEventListener('click', () => {
    if (!audioCtx) {
      // Initialize AudioContext on first user interaction
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Low pass filter for dark, cinematic warmth
      droneFilter = audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(140, audioCtx.currentTime);
      droneFilter.Q.setValueAtTime(3.5, audioCtx.currentTime);
      droneFilter.connect(masterGain);

      // Sub-drone oscillator (55Hz - A1)
      droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'sawtooth';
      droneOsc1.frequency.setValueAtTime(55, audioCtx.currentTime);
      droneOsc1.connect(droneFilter);
      droneOsc1.start();

      // Atmospheric harmonic oscillator (110Hz - A2 slightly detuned)
      droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(110.2, audioCtx.currentTime);
      droneOsc2.connect(droneFilter);
      droneOsc2.start();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (!isAudioPlaying) {
      // Fade In Cinematic Atmosphere
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 2.5);
      isAudioPlaying = true;
      if (soundBars) soundBars.classList.add('active');
      if (soundLabel) soundLabel.textContent = 'CINEMA AUDIO: ON';
      soundToggleBtn.style.borderColor = 'var(--accent-red)';
      playShutterClick();
    } else {
      // Fade Out
      masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      isAudioPlaying = false;
      if (soundBars) soundBars.classList.remove('active');
      if (soundLabel) soundLabel.textContent = 'CINEMA AUDIO: OFF';
      soundToggleBtn.style.borderColor = 'var(--border-subtle)';
    }
  });

  // Attach subtle click sound to buttons and work cards
  document.querySelectorAll('a, button, .work-card, .craft-card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (isAudioPlaying) playSubtleHoverTick();
    });
  });
}

function playShutterClick() {
  if (!audioCtx || audioCtx.state !== 'running') return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) {
    // audio safety
  }
}

function playSubtleHoverTick() {
  if (!audioCtx || audioCtx.state !== 'running') return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.035);
  } catch (e) {
    // audio safety
  }
}

/* ==========================================================================
   3. CUSTOM INTERACTIVE CURSOR
   ========================================================================== */
function initCustomCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const ring = document.querySelector('.custom-cursor-ring');
  const text = document.querySelector('.cursor-text');
  if (!dot || !ring) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover transformations
  const interactiveTargets = [
    { selector: '.work-card', label: 'EXPLORE' },
    { selector: '.btn-work-watch, .open-modal-btn', label: 'PLAY' },
    { selector: '.fav-card-item', label: 'CINEMA' },
    { selector: '.craft-card', label: 'CRAFT' },
    { selector: 'a, button', label: 'DIRECT' }
  ];

  interactiveTargets.forEach(({ selector, label }) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('cursor-active');
        if (text) text.textContent = label;
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('cursor-active');
        if (text) text.textContent = '';
      });
    });
  });
}

/* ==========================================================================
   4. CLAPPERBOARD PRELOADER
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const skipBtn = document.getElementById('skipIntroBtn');
  if (!preloader) return;

  const closePreloader = () => {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.remove();
    }, 900);
  };

  if (skipBtn) {
    skipBtn.addEventListener('click', closePreloader);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && preloader) closePreloader();
  });

  // Automatically fade out after intro sequence
  setTimeout(closePreloader, 1800);
}

/* ==========================================================================
   5. CINEMA LIGHTBOX MODAL (WATCH ON SITE)
   ========================================================================== */
function initCinemaModal() {
  const modal = document.getElementById('cinemaModal');
  const modalIframe = document.getElementById('cinemaModalIframe');
  const modalTitle = document.getElementById('cinemaModalTitle');
  const closeBtn = document.getElementById('closeCinemaModal');
  if (!modal || !modalIframe) return;

  const openModal = (videoUrl, filmTitle) => {
    modalTitle.textContent = filmTitle || 'CINEMA SCREENING';
    modalIframe.src = videoUrl;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    playShutterClick();
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modalIframe.src = '';
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.open-video-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoUrl = btn.getAttribute('data-video-url');
      const title = btn.getAttribute('data-film-title');
      if (videoUrl) openModal(videoUrl, title);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   6. NAVBAR SCROLL EFFECT & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const navbar = document.querySelector('.cinematic-navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      const isOpen = navMenu.classList.contains('mobile-open');
      mobileToggle.innerHTML = isOpen ? '&#10005;' : '&#9776;';
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
        mobileToggle.innerHTML = '&#9776;';
      });
    });
  }
}

/* ==========================================================================
   7. EMAIL COPY TO CLIPBOARD
   ========================================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailText = 'mgunanidhi08@gmail.com';
  if (!copyBtn) return;

  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailText).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span style="color:#2ecc71;">✓ COPIED TO CLIPBOARD</span>';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2500);
    });
  });
}

/* ==========================================================================
   8. SCROLL REVEALS & GSAP INTEGRATION
   ========================================================================== */
function initScrollAnimations() {
  // Check if GSAP and ScrollTrigger are loaded via CDN
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero title reveal
    gsap.from('.hero-main-title', {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.hero-director-sub', {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power3.out',
      delay: 0.4
    });

    gsap.from('.hero-badge-pill', {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: 'back.out(1.5)',
      delay: 0.1
    });

    // Animate work cards on scroll
    gsap.utils.toArray('.work-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        opacity: 0,
        y: 50,
        duration: 0.9,
        delay: i * 0.15,
        ease: 'power3.out'
      });
    });

    // Animate craft cards
    gsap.utils.toArray('.craft-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 88%'
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: (i % 3) * 0.12,
        ease: 'power3.out'
      });
    });

    // Animate favorites
    gsap.utils.toArray('.fav-card-item').forEach((fav, i) => {
      gsap.from(fav, {
        scrollTrigger: {
          trigger: fav,
          start: 'top 90%'
        },
        opacity: 0,
        scale: 0.92,
        duration: 0.7,
        delay: (i % 4) * 0.1,
        ease: 'power2.out'
      });
    });
  } else {
    // Fallback simple intersection observer if CDN is offline
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.work-card, .craft-card, .fav-card-item').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(el);
    });
  }
}
