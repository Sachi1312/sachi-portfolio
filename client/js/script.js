document.getElementById('year').textContent = new Date().getFullYear();

// BOOT SEQUENCE
const bootLinesText = [
  'INITIALIZING KERNEL...',
  'LOADING MODULES [PYTHON, LANGGRAPH, TENSORFLOW, NEXT.JS]... OK',
  'MOUNTING /dev/creativity... OK',
  'STARTING SERVICES: skills.json, projects.db, contact.exe... OK',
  'AUTHENTICATING OPERATOR: SACHI_PAREKH... GRANTED',
  '',
  'BOOT COMPLETE. WELCOME.'
];
const bootEl = document.getElementById('bootLines');
const bootScreen = document.getElementById('boot');

bootLinesText.forEach((line, i) => {
  const div = document.createElement('div');
  div.textContent = line;
  div.style.animationDelay = `${i * 0.18}s`;
  bootEl.appendChild(div);
});

setTimeout(() => {
  bootScreen.classList.add('hide');
  setTimeout(() => bootScreen.remove(), 600);
}, bootLinesText.length * 180 + 500);

const bootProgressFill = document.getElementById('bootProgressFill');
const bootStatusLabel = document.getElementById('bootStatusLabel');
document.getElementById('bootBtn').addEventListener('click', () => {
  bootProgressFill.style.transition = 'none';
  bootProgressFill.style.width = '0%';
  bootProgressFill.offsetHeight; // force reflow so the reset paints before the transition starts
  bootStatusLabel.textContent = 'Loading...';
  setTimeout(() => {
    bootProgressFill.style.transition = '';
    bootProgressFill.style.width = '100%';
  }, 20);
  setTimeout(() => {
    bootStatusLabel.textContent = 'Ready';
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  }, 450);
});

// NAV
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20));

// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// STAT COUNTERS
const statEls = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1300;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (isDecimal ? value.toFixed(2) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
    }
    requestAnimationFrame(step);
    statObserver.unobserve(el);
  });
}, { threshold: 0.4 });
statEls.forEach(el => statObserver.observe(el));

// CONTACT FORM -> mailto
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('cf-name').value;
  const email = document.getElementById('cf-email').value;
  const subject = document.getElementById('cf-subject').value;
  const message = document.getElementById('cf-message').value;
  const body = `From: ${name} (${email})\n\n${message}`;
  window.location.href = `mailto:parekhsachi04@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

// WHOLE-PAGE SCROLL TRACKER
const pageTrackerDots = document.querySelectorAll('.page-tracker-dot');
const pageSections = ['home', 'about', 'skills', 'experience', 'projects', 'contact']
  .map(id => document.getElementById(id))
  .filter(Boolean);

if (pageTrackerDots.length && pageSections.length) {
  // treat the vertical center of the viewport as a trigger line; whichever
  // section's midpoint is nearest it becomes the active one (robust for
  // sections taller than the viewport, unlike a fixed intersection threshold)
  const pageTrackerObserver = new IntersectionObserver(() => {
    const centerY = window.innerHeight / 2;
    let closest = null;
    let closestDist = Infinity;
    pageSections.forEach(el => {
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const dist = Math.abs(mid - centerY);
      if (dist < closestDist) { closestDist = dist; closest = el; }
    });
    if (closest) {
      pageTrackerDots.forEach(dot => {
        dot.classList.toggle('active', dot.dataset.target === closest.id);
      });
    }
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  pageSections.forEach(el => pageTrackerObserver.observe(el));

  pageTrackerDots.forEach(dot => {
    dot.addEventListener('click', () => {
      document.getElementById(dot.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// REPO SIDEBAR — fetched live from GitHub so it always reflects Sachi's real repos
const LANGUAGE_COLORS = {
  Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
  CSS: '#563d7c', Java: '#b07219', 'Jupyter Notebook': '#DA5B0B', Dart: '#00B4AB',
  'C++': '#f34b7d', C: '#555555', Go: '#00ADD8', Rust: '#dea584', Shell: '#89e051'
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

async function loadRepos() {
  const listEl = document.getElementById('repoList');
  const countEl = document.getElementById('repoCount');
  if (!listEl) return;

  try {
    const res = await fetch('https://api.github.com/users/Sachi1312/repos?per_page=100&sort=updated');
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const repos = (await res.json()).filter(r => !r.fork);

    countEl.textContent = repos.length;
    listEl.innerHTML = '';

    repos.forEach(repo => {
      const li = document.createElement('li');
      li.dataset.url = repo.html_url;
      const dotColor = LANGUAGE_COLORS[repo.language] || '#8fa89b';
      li.innerHTML = `
        <span class="lang-dot" style="background:${dotColor}"></span>
        <span class="repo-list-name">${repo.name}</span>
        <span class="repo-list-time">${timeAgo(repo.updated_at)}</span>
      `;
      li.addEventListener('click', () => window.open(repo.html_url, '_blank'));
      listEl.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load repos from GitHub:', err);
    listEl.innerHTML = `<li class="repo-list-loading">Couldn't load live data &mdash; <a href="https://github.com/Sachi1312" target="_blank" style="color:var(--green)">view on GitHub</a></li>`;
    countEl.textContent = '?';
  }
}
loadRepos();

// CHATBOT
const chatbot = document.getElementById('chatbot');
const chatbotLauncher = document.getElementById('chatbotLauncher');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');

chatbotLauncher.addEventListener('click', () => chatbot.classList.toggle('open'));
chatbotClose.addEventListener('click', () => chatbot.classList.remove('open'));

const chatHistory = [];

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.textContent = text;
  chatbotMessages.appendChild(div);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  return div;
}

chatbotForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatbotInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatHistory.push({ role: 'user', content: text });
  chatbotInput.value = '';

  const typingEl = addMessage('thinking...', 'bot typing');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    });
    if (!res.ok) throw new Error('backend unavailable');
    const data = await res.json();
    typingEl.textContent = data.reply;
    typingEl.classList.remove('typing');
    chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    typingEl.textContent = "I can't reach my brain right now (backend server isn't running). Try `npm run dev` in /server, or email Sachi directly at parekhsachi04@gmail.com.";
    typingEl.classList.remove('typing');
  }
});

// SKILLS GLOBE - Fibonacci-sphere point cloud with perspective projection + drag rotate
// slug + brand color for cdn.simpleicons.org (real logos, matching Sachi's actual stack)
// every entry below is a real Simple Icons slug, verified with a live HTTP check,
// and matches a skill/tool Sachi's resume or Veefin internship actually lists
const SKILL_ICONS = {
  'Python':        { slug: 'python',           color: '3776AB' },
  'TensorFlow':    { slug: 'tensorflow',        color: 'FF6F00' },
  'PyTorch':       { slug: 'pytorch',           color: 'EE4C2C' },
  'Scikit-learn':  { slug: 'scikitlearn',       color: 'F7931E' },
  'Keras':         { slug: 'keras',             color: 'D00000' },
  'Pandas':        { slug: 'pandas',            color: '150458' },
  'NumPy':         { slug: 'numpy',             color: '4DABCF' },
  'Jupyter':       { slug: 'jupyter',           color: 'F37626' },
  'Plotly':        { slug: 'plotly',            color: '3F4F75' },
  'OpenCV':        { slug: 'opencv',            color: '5C3EE8' },
  'MySQL':         { slug: 'mysql',             color: '4479A1' },
  'PostgreSQL':    { slug: 'postgresql',        color: '4169E1' },
  'MongoDB':       { slug: 'mongodb',           color: '47A248' },
  'Docker':        { slug: 'docker',            color: '2496ED' },
  'Git':           { slug: 'git',               color: 'F05032' },
  'GitHub':        { slug: 'github',            color: 'FFFFFF' },
  'Next.js':       { slug: 'nextdotjs',         color: 'FFFFFF' },
  'Tailwind CSS':  { slug: 'tailwindcss',       color: '06B6D4' },
  'FastAPI':       { slug: 'fastapi',           color: '009688' },
  'Streamlit':     { slug: 'streamlit',         color: 'FF4B4B' },
  'Nginx':         { slug: 'nginx',             color: '009639' },
  'Spring Boot':   { slug: 'springboot',        color: '6DB33F' },
  'Angular':       { slug: 'angular',           color: 'DD0031' },
  // no Simple Icons entry for AWS/EC2 exists; devicon's wordmark SVG is dark-on-transparent
  // (built for light backgrounds), so it's inverted via CSS to stay visible on our dark theme
  'AWS EC2':       { url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', invert: true }
};
const SKILLS = Object.keys(SKILL_ICONS);

const sphereEl = document.getElementById('skillsSphere');
const linesSvg = document.getElementById('sphereLines');

if (sphereEl) {
  let containerSize = sphereEl.clientWidth || 520;
  let R = containerSize * 0.36;
  let FOCAL = containerSize * 0.85;
  window.addEventListener('resize', () => {
    containerSize = sphereEl.clientWidth || 520;
    R = containerSize * 0.36;
    FOCAL = containerSize * 0.85;
    linesSvg.setAttribute('viewBox', `0 0 ${containerSize} ${containerSize}`);
  });
  const N = SKILLS.length;

  const points = SKILLS.map((label, i) => {
    const y = 1 - (i / (N - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    return {
      label,
      x: Math.cos(theta) * radiusAtY,
      y,
      z: Math.sin(theta) * radiusAtY,
      el: null,
      sx: 0, sy: 0, op: 1
    };
  });

  points.forEach(p => {
    const icon = SKILL_ICONS[p.label];
    const node = document.createElement('div');
    node.className = 'skill-node';
    const invertClass = icon.invert ? ' skill-icon-invert' : '';
    let iconHtml;
    if (icon.emoji) {
      iconHtml = `<span class="skill-icon-emoji">${icon.emoji}</span>`;
    } else if (icon.url) {
      iconHtml = `<img class="skill-icon-img${invertClass}" src="${icon.url}" alt="${p.label}">`;
    } else {
      iconHtml = `<img class="skill-icon-img" src="https://cdn.simpleicons.org/${icon.slug}/${icon.color}" alt="${p.label}">`;
    }
    node.innerHTML = `${iconHtml}<span class="skill-label">${p.label}</span>`;
    node.dataset.skill = p.label;
    sphereEl.appendChild(node);
    p.el = node;
  });

  // connect each point to its 2 nearest neighbors on the sphere (geodesic wireframe look)
  const edges = [];
  const seen = new Set();
  points.forEach((p, i) => {
    const dists = points
      .map((q, j) => ({ j, d: i === j ? Infinity : (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    dists.forEach(({ j }) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) { seen.add(key); edges.push([i, j]); }
    });
  });

  linesSvg.setAttribute('viewBox', `0 0 ${containerSize} ${containerSize}`);
  const lineEls = edges.map(() => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'rgba(57,255,136,0.35)');
    line.setAttribute('stroke-width', '1');
    linesSvg.appendChild(line);
    return line;
  });

  let rotY = 0;
  let rotX = -0.15;
  let autoSpin = true;
  const velY = 0.0016;

  function project() {
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const center = containerSize / 2;

    points.forEach(p => {
      const x = p.x * cosY - p.z * sinY;
      const z = p.x * sinY + p.z * cosY;
      const y = p.y;
      const y2 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;

      const scale = FOCAL / (FOCAL + z2 * R);
      const screenX = x * R * scale;
      const screenY = y2 * R * scale;
      const opacity = 0.3 + ((z2 + 1) / 2) * 0.7;

      p.sx = center + screenX;
      p.sy = center + screenY;
      p.op = opacity;

      p.el.style.transform = `translate(-50%,-50%) translate(${screenX}px, ${screenY}px) scale(${scale})`;
      p.el.style.opacity = opacity.toFixed(2);
      p.el.style.zIndex = Math.round((z2 + 1) * 50);
    });

    edges.forEach(([i, j], idx) => {
      const a = points[i], b = points[j];
      const line = lineEls[idx];
      line.setAttribute('x1', a.sx.toFixed(1));
      line.setAttribute('y1', a.sy.toFixed(1));
      line.setAttribute('x2', b.sx.toFixed(1));
      line.setAttribute('y2', b.sy.toFixed(1));
      line.setAttribute('opacity', (Math.min(a.op, b.op) * 0.6).toFixed(2));
    });
  }

  function tick() {
    if (autoSpin) rotY += velY;
    project();
    requestAnimationFrame(tick);
  }
  tick();

  let dragging = false;
  let lastX = 0, lastY = 0;

  const startDrag = (x, y) => { dragging = true; autoSpin = false; lastX = x; lastY = y; };
  const moveDrag = (x, y) => {
    if (!dragging) return;
    rotY += (x - lastX) * 0.006;
    rotX += (y - lastY) * 0.006;
    rotX = Math.max(-1.3, Math.min(1.3, rotX));
    lastX = x; lastY = y;
  };
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    setTimeout(() => { autoSpin = true; }, 1200);
  };

  sphereEl.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  sphereEl.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchend', endDrag);
}
