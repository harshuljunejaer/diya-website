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

    function formatCardTitleHtml(title) {
      if (title.includes('100/10')) {
        return `
          <span class="fragment-title-lead">That</span>
          <div class="fragment-title-featured">
            <span class="highlight-score-pill"><span class="score-sparkle">★</span> 100/10</span>
            <span class="highlight-main-word highlight-smile">Smile<span class="hero-dot">.</span></span>
          </div>
        `;
      }
      if (title.toLowerCase().includes('bad') && title.toLowerCase().includes('habit')) {
        return `
          <span class="fragment-title-lead">Her</span>
          <div class="fragment-title-featured">
            <span class="highlight-quirk-pill">‘Bad’</span>
            <span class="highlight-main-word highlight-habits">Habits<span class="hero-dot">.</span></span>
          </div>
        `;
      }
      return `<div class="fragment-title-featured"><span class="highlight-main-word">${title}</span></div>`;
    }

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

      // Top Bar: Tag pill on left, editorial number on right
      const topBar = el('div', { className: 'card-front-topbar' },
        el('div', { className: 'fragment-tag' },
          el('span', { className: 'tag-star' }, '✦'),
          el('span', {}, item.tag || 'Memory')
        ),
        el('div', { className: 'fragment-num' }, `№ ${item.num || `0${i+1}`}`)
      );
      front.appendChild(topBar);

      // Standout highlighted title
      const titleElem = el('h3', { className: 'fragment-title' });
      titleElem.innerHTML = formatCardTitleHtml(item.title);
      front.appendChild(titleElem);

      // Body text
      front.appendChild(el('p', { className: 'fragment-body' }, item.frontDesc));

      // Handwritten scrap note in Caveat font
      const handNoteText = item.frontNote || (i === 0 ? 'literally lights up the whole room ✨' : 'pure drama, 0% regrets 💅');
      const handNote = el('div', { className: 'card-handnote' },
        el('span', {}, `“${handNoteText}”`)
      );
      front.appendChild(handNote);
      
      // Interactive aesthetic flip CTA button
      const flipCue = el('div', { className: 'flip-cue' },
        el('span', { className: 'flip-cue-icon' }, '↻'),
        el('span', { className: 'flip-cue-label' }, 'Tap to reveal picture'),
        el('span', { className: 'flip-cue-sparkle' }, '✨')
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
        el('span', { className: 'flip-back-icon' }, '↺'),
        el('span', {}, 'Tap to flip back')
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

    initGiftModal();
  }

  /* ══════════════════════════════════════════════════════════
     10B. SIBLING GIFT SURPRISE (SARCASM & CLUE)
     ══════════════════════════════════════════════════════════ */
  function initGiftModal() {
    const triggerBtn = document.getElementById('gift-trigger-btn');
    const modal = document.getElementById('gift-modal');
    const closeBtn = document.getElementById('gift-modal-close');
    const backdrop = document.getElementById('gift-modal-backdrop');
    const stepRoast = document.getElementById('gift-step-roast');
    const stepClue = document.getElementById('gift-step-clue');
    const loader = document.getElementById('gift-suspense-loader');
    const revealBtn = document.getElementById('gift-reveal-btn');
    const giftImg = document.getElementById('gift-box-photo');
    const huntStartBtn = document.getElementById('gift-hunt-start-btn');
    const backBtn = document.getElementById('gift-back-btn');

    if (!triggerBtn || !modal) return;

    // Load gift image from CONFIG or default
    if (giftImg) {
      const giftSrc = (CONFIG.gift && CONFIG.gift.src) ? CONFIG.gift.src : 'assets/images/gift-box.jpeg';
      giftImg.src = giftSrc;
      giftImg.alt = (CONFIG.gift && CONFIG.gift.alt) || 'Gift box photo';
      let retried = false;
      giftImg.addEventListener('error', function () {
        if (!retried) {
          retried = true;
          if (this.src.includes('assets/images/')) {
            this.src = 'gift-box.jpeg';
            return;
          }
        }
        const fallback = el('div', { className: 'gift-box-fallback' },
          el('span', { className: 'gift-box-fallback-icon' }, '📦'),
          el('span', { className: 'gift-box-fallback-title' }, 'Yahan aayegi tere dabbe ki photo!'),
          el('span', { className: 'gift-box-fallback-sub' }, 'Gift box ki photo "assets/images/gift-box.jpeg" daal do')
        );
        if (this.parentNode) this.parentNode.replaceChild(fallback, this);
      });
    }

    let revealTimer = null;

    function openGiftModal() {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Always reset to step 1 (roast)
      stepRoast.classList.remove('hidden');
      stepClue.classList.add('hidden');

      // Reset 1-second suspense loader & button
      if (loader) {
        loader.classList.remove('fade-out');
        loader.style.display = 'flex';
      }
      if (revealBtn) {
        revealBtn.classList.add('hidden');
      }

      // Small confetti pop on opening
      const rect = triggerBtn.getBoundingClientRect();
      triggerConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);

      // 1 SECOND SUSPENSE TIMER
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        if (loader) {
          loader.classList.add('fade-out');
          setTimeout(() => { loader.style.display = 'none'; }, 300);
        }
        if (revealBtn) {
          revealBtn.classList.remove('hidden');
          // subtle mini burst when the find gift button appears
          const modalRect = modal.getBoundingClientRect();
          triggerConfettiBurst(modalRect.left + modalRect.width / 2, modalRect.top + modalRect.height * 0.7, 25);
        }
      }, 1000);
    }

    function closeGiftModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      clearTimeout(revealTimer);
    }

    function showClueStep() {
      stepRoast.classList.add('hidden');
      stepClue.classList.remove('hidden');
      // Confetti burst for finding clue
      const modalRect = modal.getBoundingClientRect();
      triggerConfettiBurst(modalRect.left + modalRect.width / 2, modalRect.top + modalRect.height / 2, 70);
    }

    function showRoastStep() {
      stepClue.classList.add('hidden');
      stepRoast.classList.remove('hidden');
      if (revealBtn) revealBtn.classList.remove('hidden');
      if (loader) loader.style.display = 'none';
    }

    function showHuntToast() {
      let toast = document.getElementById('gift-hunt-toast');
      if (!toast) {
        toast = el('div', { id: 'gift-hunt-toast', className: 'gift-hunt-toast' },
          el('span', {}, '🔍'),
          el('span', {}, 'Operation Scavenger Hunt shuru! All the best behen! 🏃‍♀️💨')
        );
        document.body.appendChild(toast);
      }
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 4500);
    }

    triggerBtn.addEventListener('click', openGiftModal);
    if (closeBtn) closeBtn.addEventListener('click', closeGiftModal);
    if (backdrop) backdrop.addEventListener('click', closeGiftModal);

    if (revealBtn) {
      revealBtn.addEventListener('click', showClueStep);
    }

    if (backBtn) {
      backBtn.addEventListener('click', showRoastStep);
    }

    if (huntStartBtn) {
      huntStartBtn.addEventListener('click', () => {
        closeGiftModal();
        triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 2, 90);
        showHuntToast();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeGiftModal();
      }
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
     COUNTDOWN TIMER & BIRTHDAY SPLASH SYSTEM
     ══════════════════════════════════════════════════════════ */

  // Target: October 15, 00:00:00 (midnight start of Oct 15) — local time
  function getTargetDate() {
    const now = new Date();
    // Target: Oct 15 of current year at midnight
    return new Date(now.getFullYear(), 9, 15, 0, 0, 0, 0); // month 9 = October
  }

  function isLocalhost() {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '::1';
  }

  function padZero(n) {
    return n < 10 ? '0' + n : String(n);
  }

  // Create floating particles for countdown background
  function initCountdownParticles() {
    const container = document.getElementById('countdown-particles');
    if (!container) return;
    const colors = ['#D4A76A', '#C76B7E', '#E8A0A0', '#B87855', '#8B2D4A'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'countdown-particle';
      const size = Math.random() * 4 + 2;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDuration = (Math.random() * 8 + 6) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      container.appendChild(p);
    }
  }

  // Party popper burst engine — shoots from a corner
  function runPartyPopper(canvas, side) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const colors = [
      '#8B2D4A', '#C76B7E', '#D4A76A', '#E8A0A0', '#B87855',
      '#EDDBD5', '#6B1D34', '#E5C5BE', '#F3EAE0', '#FFB6C1',
      '#D4A76A', '#C76B7E'
    ];

    // Origin point: bottom-left for left popper, bottom-right for right popper
    const originX = side === 'left' ? 0 : canvas.width;
    const originY = canvas.height;
    const dirMult = side === 'left' ? 1 : -1;

    const pieces = [];
    // First burst
    for (let i = 0; i < 80; i++) {
      const angle = (side === 'left')
        ? (-Math.PI / 4 + (Math.random() - 0.5) * Math.PI * 0.7)
        : (-Math.PI + Math.PI / 4 + (Math.random() - 0.5) * Math.PI * 0.7);
      const speed = Math.random() * 12 + 5;
      pieces.push({
        x: originX + (Math.random() - 0.5) * 20,
        y: originY - Math.random() * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: Math.random() * 10 + 4,
        h: Math.random() * 7 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
        gravity: 0.08 + Math.random() * 0.04,
        sway: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.6 ? 'circle' : (Math.random() > 0.5 ? 'ribbon' : 'rect'),
        delay: Math.random() * 300 // staggered start
      });
    }

    const startTime = performance.now();
    let animId;

    function draw(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = now - startTime;

      pieces.forEach(p => {
        if (elapsed < p.delay) return;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Ribbon / streamer
          ctx.beginPath();
          ctx.moveTo(-p.w / 2, 0);
          ctx.quadraticCurveTo(0, -p.h, p.w / 2, 0);
          ctx.quadraticCurveTo(0, p.h * 0.5, -p.w / 2, 0);
          ctx.fill();
        }
        ctx.restore();

        p.x += p.vx + p.sway;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.995; // air friction
        p.rotation += p.rotSpeed;
        p.rotSpeed *= 0.998;

        // Gentle fade after a while
        if (p.y > canvas.height * 0.7) {
          p.opacity = Math.max(0, p.opacity - 0.008);
        }
      });

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }

  // Floating rose petals
  function initSplashPetals() {
    const container = document.getElementById('splash-petals');
    if (!container) return;
    const petalColors = ['#E8A0A0', '#EDDBD5', '#C76B7E', '#E5C5BE', '#D4A76A', '#F3EAE0'];
    for (let i = 0; i < 25; i++) {
      const petal = document.createElement('div');
      petal.className = 'splash-petal';
      const size = Math.random() * 10 + 8;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.background = petalColors[Math.floor(Math.random() * petalColors.length)];
      petal.style.animationDuration = (Math.random() * 6 + 5) + 's';
      petal.style.animationDelay = (Math.random() * 4) + 's';
      container.appendChild(petal);
    }
  }

  /* ─── Timer Audio Helpers ─── */
  let timerAudio = null;

  function startTimerAudio() {
    timerAudio = document.getElementById('timer-audio');
    if (!timerAudio) return;
    timerAudio.volume = 0.5;
    timerAudio.loop = true;
    const tryTimerPlay = () => {
      if (timerAudio.paused) {
        timerAudio.play().catch(() => {});
      }
    };
    tryTimerPlay();
    // Also try on first user gesture (browsers block autoplay)
    const gestureEvents = ['pointerdown', 'touchstart', 'click', 'keydown'];
    function onGesture() {
      tryTimerPlay();
      gestureEvents.forEach(e => {
        window.removeEventListener(e, onGesture);
        document.removeEventListener(e, onGesture);
      });
    }
    gestureEvents.forEach(e => {
      window.addEventListener(e, onGesture, { passive: true, once: false });
      document.addEventListener(e, onGesture, { passive: true, once: false });
    });
  }

  function stopTimerAudio() {
    if (timerAudio) {
      timerAudio.pause();
      timerAudio.currentTime = 0;
    }
  }

  // Transition: show birthday splash → then show website
  function showBirthdaySplash(callback) {
    const splash = document.getElementById('birthday-splash');
    const leftCanvas = document.getElementById('splash-popper-left');
    const rightCanvas = document.getElementById('splash-popper-right');
    if (!splash) { callback(); return; }

    splash.style.display = 'flex';

    // Launch party poppers from both sides + floating petals
    initSplashPetals();
    const stopLeft = runPartyPopper(leftCanvas, 'left');
    const stopRight = runPartyPopper(rightCanvas, 'right');

    // Show splash for 3.5 seconds, then fade out
    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.classList.add('hidden');
        if (stopLeft) stopLeft();
        if (stopRight) stopRight();
        callback();
      }, 1500);
    }, 3500);
  }

  // Initialize the main website (all existing functionality)
  function initWebsite() {
    document.body.classList.remove('countdown-active');
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
  }

  // Dismiss countdown overlay and proceed
  function dismissCountdown(showSplash) {
    const overlay = document.getElementById('countdown-overlay');
    if (!overlay) return;

    // Stop timer sound when leaving countdown screen
    stopTimerAudio();

    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.classList.add('hidden');
      if (showSplash) {
        showBirthdaySplash(() => initWebsite());
      } else {
        initWebsite();
      }
    }, 800);
  }

  // Start the live countdown timer
  function startCountdown() {
    const target = getTargetDate();
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-minutes');
    const secsEl = document.getElementById('cd-seconds');

    let prevValues = { d: '', h: '', m: '', s: '' };

    function flashIfChanged(el, newVal, key) {
      if (prevValues[key] !== newVal) {
        prevValues[key] = newVal;
        el.textContent = newVal;
        el.classList.remove('flash');
        // Force reflow to restart animation
        void el.offsetWidth;
        el.classList.add('flash');
      }
    }

    function tick() {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        // Time's up! Show birthday splash then website
        clearInterval(interval);
        flashIfChanged(daysEl, '00', 'd');
        flashIfChanged(hoursEl, '00', 'h');
        flashIfChanged(minsEl, '00', 'm');
        flashIfChanged(secsEl, '00', 's');
        setTimeout(() => dismissCountdown(true), 500);
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const days = Math.floor(totalSecs / 86400);
      const hours = Math.floor((totalSecs % 86400) / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      flashIfChanged(daysEl, padZero(days), 'd');
      flashIfChanged(hoursEl, padZero(hours), 'h');
      flashIfChanged(minsEl, padZero(mins), 'm');
      flashIfChanged(secsEl, padZero(secs), 's');
    }

    tick(); // initial
    const interval = setInterval(tick, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     INITIALIZE EVERYTHING
     ══════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const target = getTargetDate();
    const overlay = document.getElementById('countdown-overlay');
    const testBtn = document.getElementById('test-preview-btn');

    // If the target time has already passed (we're on Oct 15 or later), skip countdown
    if (now >= target) {
      // Hide overlay immediately
      if (overlay) overlay.classList.add('hidden');
      // Show birthday splash if it's Oct 15
      if (now.getMonth() === 9 && now.getDate() === 15) {
        document.body.classList.add('countdown-active');
        showBirthdaySplash(() => initWebsite());
      } else {
        initWebsite();
      }
      return;
    }

    // Countdown is active — show overlay, hide website
    document.body.classList.add('countdown-active');
    initCountdownParticles();
    startCountdown();

    // Start timer sound on countdown screen
    startTimerAudio();

    // Show test preview button only on localhost
    if (isLocalhost() && testBtn) {
      testBtn.style.display = 'inline-flex';
      testBtn.addEventListener('click', () => {
        // Test preview: show birthday splash first, then website
        dismissCountdown(true);
      });
    }
  });

})();
