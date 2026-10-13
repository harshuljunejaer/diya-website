/* ============================================================
   DIYANSHII'S BIRTHDAY — INTERACTIVE & ANIMATED EXPERIENCE
   Ambient Particles · Confetti · 3D Tilt · Candle Wish
   Envelope Magic · Auto-Glide · Photo Hearting · Lightbox
   ============================================================ */

(function () {
  'use strict';

  /* ─── Helpers ─── */
  function el(tag, attrs, ...children) {
    const e = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') e.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') e.appendChild(document.createTextNode(c));
      else if (c) e.appendChild(c);
    });
    return e;
  }

  function createImage(src, alt, className) {
    const cleanSrc = encodeURI(src);
    const img = el('img', { src: cleanSrc, alt, className: className || '', loading: 'lazy' });
    let retried = false;
    img.addEventListener('error', function () {
      if (!retried) {
        retried = true;
        if (src.includes('bad habit') || src.includes('bad-habit')) {
          this.src = src.includes('bad-habit') ? 'assets/images/bad habit.jpeg' : 'assets/images/bad-habit.jpeg';
          return;
        }
        if (src.includes('smile')) {
          this.src = src.startsWith('assets/') ? 'smile.jpeg' : 'assets/images/smile.jpeg';
          return;
        }
      }
      const fallback = el('div', { className: 'img-fallback' },
        el('span', { className: 'img-fallback-icon' }, '📷'),
        el('span', {}, 'Add your photo')
      );
      if (this.parentNode) this.parentNode.replaceChild(fallback, this);
    });
    return img;
  }

  /* ─── Lightbox state ─── */
  const allImages = [];

  /* ══════════════════════════════════════════════════════════
     01. AMBIENT PARTICLES & CONFETTI ENGINE (Canvas)
     ══════════════════════════════════════════════════════════ */
  let confettiParticles = [];
  let ambientParticles = [];
  let canvas, ctx;
  let animFrameId = null;

  function initAmbientCanvas() {
    canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Initialize floating background ambient dust / soft glowing orbs
    const count = Math.min(35, Math.floor(window.innerWidth / 40));
    ambientParticles = [];
    for (let i = 0; i < count; i++) {
      ambientParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.5 + 1,
        color: Math.random() > 0.5 ? 'rgba(212, 167, 106, ' : 'rgba(232, 160, 160, ',
        alpha: Math.random() * 0.4 + 0.15,
        speedY: -(Math.random() * 0.35 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01
      });
    }

    function renderLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Render ambient floating sparkles
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        p.wobble += p.wobbleSpeed;
        p.x += p.speedX + Math.sin(p.wobble) * 0.3;
        p.y += p.speedY;

        // Wrap around screen
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(212, 167, 106, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Render active celebratory confetti
      for (let i = confettiParticles.length - 1; i >= 0; i--) {
        const c = confettiParticles[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += c.gravity;
        c.vx *= 0.985;
        c.rotation += c.rotSpeed;
        c.alpha -= c.decay;

        if (c.alpha <= 0 || c.y > canvas.height + 50) {
          confettiParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.globalAlpha = Math.max(0, c.alpha);

        if (c.shape === 'heart') {
          ctx.fillStyle = c.color;
          const s = c.size;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.7, 0, s * 1.3);
          ctx.bezierCurveTo(s * 1.2, s * 0.7, s, -s * 0.5, 0, s * 0.3);
          ctx.fill();
        } else if (c.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, c.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = c.color;
          ctx.fill();
        } else {
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.size / 2, -c.size / 3, c.size, c.size * 0.6);
        }
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }

  // Confetti burst helper (screen coordinates)
  function triggerConfettiBurst(originX, originY, count = 75) {
    if (!canvas) return;
    const colors = [
      '#D4A76A', '#C76B7E', '#8B2D4A', '#E8A0A0', '#F8EDE3', '#FFD700', '#F3EAE0'
    ];
    const shapes = ['rect', 'heart', 'circle'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        gravity: 0.18,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008
      });
    }
  }

  // Mini burst for button taps & likes
  function triggerMiniBurst(x, y) {
    triggerConfettiBurst(x, y, 24);
  }

  /* ══════════════════════════════════════════════════════════
     02. CUSTOM CURSOR GLOW & INTERACTION
     ══════════════════════════════════════════════════════════ */
  function initCursorEffects() {
    const glow = document.getElementById('cursor-glow');
    const pill = document.getElementById('photo-cursor-pill');
    if (!glow) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    let glowX = mouseX, glowY = mouseY;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (pill && pill.classList.contains('visible')) {
        pill.style.transform = `translate3d(${mouseX + 16}px, ${mouseY + 16}px, 0)`;
      }
    });

    function tickGlow() {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      glow.style.transform = `translate3d(${glowX - 100}px, ${glowY - 100}px, 0)`;
      requestAnimationFrame(tickGlow);
    }
    tickGlow();

    // Click anywhere burst (subtle)
    window.addEventListener('click', e => {
      // Don't trigger if clicking interactive buttons or envelope
      if (e.target.closest('button, #envelope, #candle-wrapper, .lightbox')) return;
      triggerConfettiBurst(e.clientX, e.clientY, 12);
    });
  }

  /* ══════════════════════════════════════════════════════════
     03. 3D CARD TILT & GLASS SHINE
     ══════════════════════════════════════════════════════════ */
  function initTiltPhysics() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
      const shine = card.querySelector('.hero-shine');

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9; // degrees
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (shine) {
          const moveX = (x / rect.width) * 100;
          const moveY = (y / rect.height) * 100;
          shine.style.background = `radial-gradient(circle at ${moveX}% ${moveY}%, rgba(255,255,255,0.3) 0%, transparent 65%)`;
          shine.style.opacity = '1';
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (shine) shine.style.opacity = '0';
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     04. HERO SETUP
     ══════════════════════════════════════════════════════════ */
  function initHero() {
    const img = document.getElementById('hero-photo');
    if (!img || !CONFIG.hero) return;
    img.src = CONFIG.hero.src;
    img.alt = CONFIG.hero.alt || 'Diyanshii';
    img.addEventListener('error', function () {
      const f = el('div', { className: 'img-fallback' },
        el('span', { className: 'img-fallback-icon' }, '📷'),
        el('span', {}, 'Hero photo')
      );
      this.parentNode.replaceChild(f, this);
    });
  }

  /* ══════════════════════════════════════════════════════════
     05. GALLERY — Pinterest Collage with Heart/Like System
     ══════════════════════════════════════════════════════════ */
  function initGallery() {
    const grid = document.getElementById('collage-grid');
    const pill = document.getElementById('photo-cursor-pill');
    if (!grid || !CONFIG.gallery) return;

    CONFIG.gallery.forEach((photo, i) => {
      const idx = allImages.length;
      allImages.push({ src: photo.src, alt: photo.alt || '', caption: photo.caption || '' });

      // Subtle natural rotation for scrapbook Pinterest aesthetic
      const rotClass = i % 4 === 1 ? 'tilt-slight-pos' : (i % 4 === 3 ? 'tilt-slight-neg' : '');

      const item = el('div', {
        className: `collage-item reveal-scale ${rotClass}`,
        style: { '--delay': `${Math.min(i * 70, 500)}ms` },
        'data-delay': '',
        onClick: () => openLightbox(idx)
      });

      // Like Button (Heart)
      const likeBtn = el('button', {
        className: 'photo-like-btn',
        'aria-label': 'Like this photo',
        title: 'Love this photo',
        onClick: (e) => {
          e.stopPropagation();
          likeBtn.classList.toggle('liked');
          const isLiked = likeBtn.classList.contains('liked');
          likeBtn.innerHTML = isLiked ? '❤️' : '♡';
          const r = likeBtn.getBoundingClientRect();
          triggerMiniBurst(r.left + r.width / 2, r.top + r.height / 2);
        }
      }, '♡');
      item.appendChild(likeBtn);

      // Image
      item.appendChild(createImage(photo.src, photo.alt || '', ''));

      // Caption overlay
      const caption = el('div', { className: 'collage-caption' });
      if (photo.caption) caption.appendChild(el('span', {}, photo.caption));
      if (photo.date) caption.appendChild(el('small', {}, photo.date));
      item.appendChild(caption);

      // Hover cursor pill tracker
      if (pill) {
        item.addEventListener('mouseenter', () => pill.classList.add('visible'));
        item.addEventListener('mouseleave', () => pill.classList.remove('visible'));
      }

      grid.appendChild(item);
    });
  }

  /* ══════════════════════════════════════════════════════════
     05B. THE LITTLE THINGS — 2 Interactive Flash Flip Cards
     ══════════════════════════════════════════════════════════ */
  function initLittleThings() {
    const grid = document.getElementById('fragments-grid');
    if (!grid || !CONFIG.littleThings) return;

    grid.innerHTML = '';

    CONFIG.littleThings.forEach((item, i) => {
      const card = el('div', {
        className: 'flip-card reveal-up',
        'data-delay': '',
        style: { '--delay': `${i * 150}ms` },
        tabIndex: 0,
        role: 'button',
        'aria-label': `Flip card: ${item.title}`
      });

      const inner = el('div', { className: 'flip-card-inner' });

      // ── FRONT ──
      const front = el('div', { className: 'flip-card-front' });
      front.appendChild(el('div', { className: 'washi-tape' }));
      front.appendChild(el('div', { className: 'fragment-tag' }, item.tag || 'Memory'));
      front.appendChild(el('div', { className: 'fragment-num' }, item.num || `0${i+1}`));
      front.appendChild(el('h3', { className: 'fragment-title' }, item.title));
      front.appendChild(el('p', { className: 'fragment-body' }, item.frontDesc));
      
      const flipCue = el('div', { className: 'flip-cue' },
        el('span', { className: 'flip-cue-icon' }, '↻'),
        el('span', {}, 'Tap to reveal picture')
      );
      front.appendChild(flipCue);

      // ── BACK ──
      const back = el('div', { className: 'flip-card-back' });
      back.appendChild(el('div', { className: 'washi-tape tape-back' }));
      
      const badge = el('span', { className: 'flip-badge' }, item.badge || '♡');
      back.appendChild(badge);

      const polaroid = el('div', { className: 'polaroid-frame' });
      polaroid.appendChild(createImage(item.src, item.alt || '', 'polaroid-img'));
      
      const captionWrap = el('div', { className: 'polaroid-caption' });
      if (item.backTitle) captionWrap.appendChild(el('h4', { className: 'polaroid-heading' }, item.backTitle));
      if (item.backNote) captionWrap.appendChild(el('p', { className: 'polaroid-note' }, item.backNote));
      polaroid.appendChild(captionWrap);

      back.appendChild(polaroid);

      const flipBackCue = el('div', { className: 'flip-back-cue' },
        el('span', {}, 'Tap to flip back ↺')
      );
      back.appendChild(flipBackCue);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      // Toggle Flip on Click/Tap
      function toggleFlip(e) {
        card.classList.toggle('flipped');
        const isFlipped = card.classList.contains('flipped');
        if (isFlipped) {
          const rect = card.getBoundingClientRect();
          triggerMiniBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }

      card.addEventListener('click', toggleFlip);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      });

      grid.appendChild(card);
    });
  }

  /* ══════════════════════════════════════════════════════════
     06. GALLERY 2 — Showcase layout
     ══════════════════════════════════════════════════════════ */
  function initGallery2() {
    const showcase = document.getElementById('gallery2-showcase');
    if (!showcase || !CONFIG.gallery2) return;
    const g2 = CONFIG.gallery2;

    // Large
    const largeIdx = allImages.length;
    allImages.push({ src: g2.large.src, alt: g2.large.alt || '', caption: g2.large.caption || '' });
    const largeWrap = el('div', {
      className: 'g2-large reveal-left tilt-card',
      'data-delay': '', style: { '--delay': '0ms' },
      onClick: () => openLightbox(largeIdx)
    });
    largeWrap.appendChild(createImage(g2.large.src, g2.large.alt || '', ''));
    largeWrap.appendChild(el('span', { className: 'g2-caption' }, g2.large.caption || ''));
    showcase.appendChild(largeWrap);

    // Small images
    g2.small.forEach((photo, i) => {
      const idx = allImages.length;
      allImages.push({ src: photo.src, alt: photo.alt || '', caption: photo.caption || '' });
      const wrap = el('div', {
        className: 'g2-small reveal-right tilt-card',
        'data-delay': '', style: { '--delay': `${(i + 1) * 150}ms` },
        onClick: () => openLightbox(idx)
      });
      wrap.appendChild(createImage(photo.src, photo.alt || '', ''));
      wrap.appendChild(el('span', { className: 'g2-caption' }, photo.caption || ''));
      showcase.appendChild(wrap);
    });
  }

  /* ══════════════════════════════════════════════════════════
     07. TIMELINE
     ══════════════════════════════════════════════════════════ */
  function initTimeline() {
    const list = document.getElementById('timeline-list');
    const section = document.getElementById('timeline-section');
    if (!list || !CONFIG.timeline) return;

    const valid = CONFIG.timeline.filter(t => t.title || t.caption);
    if (valid.length === 0) { if (section) section.style.display = 'none'; return; }

    valid.forEach((t, i) => {
      const item = el('div', { className: 'timeline-item reveal-up', 'data-delay': '', style: { '--delay': `${i * 100}ms` } });
      item.appendChild(el('span', { className: 'timeline-date' }, t.date || ''));
      const content = el('div', { className: 'timeline-content' });
      if (t.title) content.appendChild(el('h4', {}, t.title));
      if (t.caption) content.appendChild(el('p', {}, t.caption));
      if (t.src) content.appendChild(createImage(t.src, t.alt || '', 'timeline-thumb'));
      item.appendChild(content);
      list.appendChild(item);
    });
  }

  /* ══════════════════════════════════════════════════════════
     08. INTERACTIVE CANDLE EXPERIENCE (Section 5)
     ══════════════════════════════════════════════════════════ */
  function initCandle() {
    const wrapper = document.getElementById('candle-wrapper');
    const prompt = document.getElementById('candle-prompt');
    const alertMsg = document.getElementById('candle-wished-alert');
    if (!wrapper) return;

    let isBlown = false;

    function blowCandle(e) {
      if (isBlown) return;
      isBlown = true;
      wrapper.classList.add('blown');

      // Coordinate for celebration confetti burst
      const rect = wrapper.getBoundingClientRect();
      const burstX = rect.left + rect.width / 2;
      const burstY = rect.top + rect.height / 3;

      triggerConfettiBurst(burstX, burstY, 90);

      // Secondary bursts for celebration effect
      setTimeout(() => triggerConfettiBurst(burstX - 120, burstY - 40, 50), 300);
      setTimeout(() => triggerConfettiBurst(burstX + 120, burstY - 40, 50), 600);

      if (prompt) prompt.style.display = 'none';
      if (alertMsg) alertMsg.classList.add('show');
    }

    wrapper.addEventListener('click', blowCandle);
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        blowCandle();
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     09. MAGICAL ENVELOPE & WAX SEAL (Section 6)
     ══════════════════════════════════════════════════════════ */
  function initEnvelope() {
    const env = document.getElementById('envelope');
    const letter = document.getElementById('letter-content');
    if (!env || !letter) return;

    function open() {
      if (env.classList.contains('open')) return;
      env.classList.add('open');

      const rect = env.getBoundingClientRect();
      triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 50);

      setTimeout(() => {
        letter.classList.add('show');
        letter.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 700);
    }

    env.addEventListener('click', open);
    env.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     10. CLOSING PHOTO & RESTART
     ══════════════════════════════════════════════════════════ */
  function initClosing() {
    const img = document.getElementById('closing-photo');
    if (img && CONFIG.closing) {
      img.src = CONFIG.closing.src;
      img.alt = CONFIG.closing.alt || 'Diyanshii';
      img.addEventListener('error', function () {
        const f = el('div', { className: 'img-fallback' },
          el('span', { className: 'img-fallback-icon' }, '📷'),
          el('span', {}, 'Closing photo')
        );
        this.parentNode.replaceChild(f, this);
      });
    }
    const sig = document.getElementById('letter-signature');
    if (sig && CONFIG.letterSignature) sig.textContent = CONFIG.letterSignature;

    const btn = document.getElementById('restart-btn');
    if (btn) btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 60);
    });
  }

  /* ══════════════════════════════════════════════════════════
     11. LIGHTBOX
     ══════════════════════════════════════════════════════════ */
  let currentLbIdx = 0;
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-caption');

  function openLightbox(idx) {
    if (idx < 0 || idx >= allImages.length) return;
    currentLbIdx = idx;
    const p = allImages[idx];
    lbImg.src = p.src; lbImg.alt = p.alt;
    lbCap.textContent = p.caption;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
  function prevLb() { openLightbox((currentLbIdx - 1 + allImages.length) % allImages.length); }
  function nextLb() { openLightbox((currentLbIdx + 1) % allImages.length); }

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', prevLb);
  document.getElementById('lightbox-next').addEventListener('click', nextLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevLb();
    if (e.key === 'ArrowRight') nextLb();
  });

  /* ══════════════════════════════════════════════════════════
     12. BACKGROUND MUSIC AUTOPLAY
     ══════════════════════════════════════════════════════════ */
  function initMusic() {
    const btn = document.getElementById('music-btn');
    const audio = document.getElementById('bg-audio') || new Audio(CONFIG.music || 'assets/audio/cutted.mp3');
    audio.loop = true;
    audio.volume = 0.55;

    let playing = false;
    let err = false;

    audio.addEventListener('error', (e) => {
      console.warn('Audio error:', e);
      err = true;
      if (btn) {
        btn.style.opacity = '0.4';
        btn.setAttribute('aria-label', 'Music unavailable');
      }
    });

    audio.addEventListener('play', () => setPlayingState(true));
    audio.addEventListener('pause', () => setPlayingState(false));

    function setPlayingState(isPlaying) {
      playing = isPlaying;
      if (!btn) return;
      if (isPlaying) {
        btn.classList.remove('paused');
        btn.setAttribute('aria-label', 'Pause background music');
      } else {
        btn.classList.add('paused');
        btn.setAttribute('aria-label', 'Play background music');
      }
    }

    function tryPlay() {
      if (playing || err) return;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlayingState(true);
          cleanupGestureListeners();
        }).catch(() => {
          setPlayingState(false);
        });
      }
    }

    // Toggle on music button click
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (err) return;
        if (playing) {
          audio.pause();
          setPlayingState(false);
        } else {
          audio.muted = false;
          audio.play().then(() => setPlayingState(true)).catch(() => {});
        }
      });
    }

    // 1. Try to start automatically on script run, load, and pageshow
    tryPlay();
    window.addEventListener('load', tryPlay, { once: true });
    window.addEventListener('pageshow', tryPlay, { once: true });

    // 2. Play on very first user interaction anywhere (click, touch, key, or scroll)
    const gestureEvents = ['pointerdown', 'touchstart', 'click', 'keydown', 'wheel', 'scroll'];
    function onFirstInput() {
      if (!playing && !err) {
        audio.muted = false;
        tryPlay();
      }
    }
    gestureEvents.forEach(evt => {
      window.addEventListener(evt, onFirstInput, { passive: true });
      document.addEventListener(evt, onFirstInput, { passive: true });
    });

    function cleanupGestureListeners() {
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, onFirstInput);
        document.removeEventListener(evt, onFirstInput);
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     13. SCROLL REVEAL (IntersectionObserver)
     ══════════════════════════════════════════════════════════ */
  function initScrollReveal() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');

    if (reduced) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     14. SCROLL PROGRESS BAR
     ══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     15. SECTION NAVIGATION DOTS
     ══════════════════════════════════════════════════════════ */
  function initSectionNav() {
    const nav = document.getElementById('section-nav');
    const dots = document.querySelectorAll('.section-dot');
    const sections = Array.from(document.querySelectorAll('.snap-section'));
    if (!nav || dots.length === 0) return;

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const target = document.getElementById(dot.dataset.target);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          dots.forEach(d => d.classList.toggle('active', d.dataset.target === id));
          const isDark = ['gallery', 'closing'].includes(id);
          nav.classList.toggle('on-dark', isDark);
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ══════════════════════════════════════════════════════════
     INITIALIZE EVERYTHING
     ══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    initCursorEffects();
    initHero();
    initTiltPhysics();
    initGallery();
    initLittleThings();
    initGallery2();
    initTimeline();
    initCandle();
    initEnvelope();
    initClosing();
    initMusic();
    initScrollReveal();
    initScrollProgress();
    initSectionNav();
  });

})();
