// Main App Controller - Handling HUD UI, Telemetry, Interactions & Soundscapes

// Scroll Sectors Configuration
const sectors = ['sun', 'planet-ai', 'planet-web', 'planet-client', 'planet-data', 'moon-tools'];
let currentSectorIndex = 0;
let lastScrollTime = 0;
const scrollCooldown = 1500; // ms

// Web Audio API Synthesizer Context
let audioCtx;
let ambientDrone;
let isAudioActive = false;

// Profile Portfolio Data Model
const portfolioData = {
  sun: {
    title: "CORE SYSTEM: SHASHANK TIWARI",
    icon: "ti-user-circle",
    html: `
      <div class="sun-detail-section">
        <h4 class="section-title">CORE IDENTIFICATION</h4>
        <div style="background: rgba(255,119,0,0.05); border: 1px solid rgba(255,119,0,0.2); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
          <p style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.5;">
            Welcome to the central node of the orbital matrix. Shashank Tiwari is a full-stack developer, AI system engineer, and data science practitioner based in New Delhi. Specializing in bridging ML frameworks with production-ready software architectures.
          </p>
        </div>
      </div>

      <div class="sun-detail-section">
        <h4 class="section-title">CHRONOLOGICAL TIMELINE</h4>
        
        <div class="timeline-item">
          <div class="timeline-title">Post-Training LLM Intern</div>
          <div class="timeline-sub">Ethara.AI &nbsp;·&nbsp; Feb 2025 – Jun 2025 (4 mos)</div>
          <div class="timeline-desc">Optimized training workflows and post-training pipelines. Managed model alignment using RLHF protocols and fine-tuning configurations.</div>
        </div>

        <div class="timeline-item">
          <div class="timeline-title">Data Science Intern</div>
          <div class="timeline-sub">INTERNSVEDA, Gurugram &nbsp;·&nbsp; Jun 2024 – Jul 2024</div>
          <div class="timeline-desc">Conducted exploratory data analysis (EDA), constructed dashboards, and designed regression models. Collaborated via Git/GitHub workflows.</div>
        </div>
      </div>

      <div class="sun-detail-section">
        <h4 class="section-title">CERTIFICATION SCHEMAS</h4>
        <div class="cert-grid">
          <div class="cert-card">
            <div class="cert-info">
              <h5>Big Data Engineer</h5>
              <p>IBM Career Program · 2025</p>
            </div>
            <span class="cert-badge">IBM</span>
          </div>
          <div class="cert-card">
            <div class="cert-info">
              <h5>Data Analytics Simulation</h5>
              <p>Deloitte via Forage · 2025</p>
            </div>
            <span class="cert-badge">FORAGE</span>
          </div>
          <div class="cert-card">
            <div class="cert-info">
              <h5>AI & Analytics Foundation</h5>
              <p>Samatrix · 2024</p>
            </div>
            <span class="cert-badge">SAMATRIX</span>
          </div>
        </div>
      </div>

      <div class="sun-detail-section">
        <h4 class="section-title">ACADEMIC PARADIGM</h4>
        <div style="font-size: 0.75rem; line-height: 1.5; color: #94a3b8;">
          <strong>BCA (AI & Data Science)</strong><br>
          K.R. Mangalam University · CGPA: 7.0<br>
          <span style="font-size: 0.65rem;">Specialization in ML workflows, cloud databases, and statistical mathematics.</span>
        </div>
      </div>
    `
  },
  'planet-ai': {
    title: "AI & ML PLANET",
    icon: "ti-brain",
    html: `
      <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 15px; line-height: 1.5;">
        Orbiting nodes dedicated to intelligence frameworks, natural language processing, and computer vision systems.
      </p>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">Review.AI — Review Analyser</h4>
          <span class="project-badge badge-live">LIVE</span>
        </div>
        <p class="project-desc">Performs high-speed sentiment analysis and NLP theme-extraction from large volumes of customer reviews to output actionable corporate insights.</p>
        <div class="project-tags">
          <span class="project-tag">Python</span>
          <span class="project-tag">NLP</span>
          <span class="project-tag">Flask</span>
          <span class="project-tag">AI Sentiment</span>
        </div>
        <a href="https://review-ai-e34z.onrender.com" target="_blank" class="project-link">
          <i class="ti ti-external-link"></i> Launch Live Demo
        </a>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">ANPR System — Computer Vision</h4>
          <span class="project-badge badge-done">COMPLETED</span>
        </div>
        <p class="project-desc">Automatic number plate recognition system deploying OpenCV segmentation algorithms and Tesseract OCR modules for secure vehicle logging.</p>
        <div class="project-tags">
          <span class="project-tag">OpenCV</span>
          <span class="project-tag">Python</span>
          <span class="project-tag">Flask</span>
          <span class="project-tag">Tesseract</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">Post-Training Alignment</h4>
          <span class="project-badge badge-done">COMPLETED</span>
        </div>
        <p class="project-desc">Work at Ethara.AI on LLM pipeline adjustments, RLHF dataset configurations, and testing alignment benchmarks.</p>
        <div class="project-tags">
          <span class="project-tag">LLMs</span>
          <span class="project-tag">RLHF</span>
          <span class="project-tag">Supervised Fine-tuning</span>
        </div>
      </div>
    `
  },
  'planet-web': {
    title: "WEB / SAAS PLANET",
    icon: "ti-browser",
    html: `
      <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 15px; line-height: 1.5;">
        Interactive full-stack applications built to deliver digital SaaS infrastructure and real-time client systems.
      </p>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">EduNest — Education SaaS</h4>
          <span class="project-badge badge-live">LIVE</span>
        </div>
        <p class="project-desc">Complete SaaS environment tailored for academic learning pathways. Includes real-time course tracking, delivery metrics, and analytics dashboards.</p>
        <div class="project-tags">
          <span class="project-tag">React</span>
          <span class="project-tag">Node.js</span>
          <span class="project-tag">Express</span>
          <span class="project-tag">Render Cloud</span>
        </div>
        <a href="https://edunest-1-kg6h.onrender.com" target="_blank" class="project-link">
          <i class="ti ti-external-link"></i> Launch Live Demo
        </a>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">Healthcare Queue SaaS</h4>
          <span class="project-badge badge-ongoing">ONGOING</span>
        </div>
        <p class="project-desc">A diagnostic clinic queue manager focusing on real-time displays, attendance, and token issuing. DPDPA 2023 compliant.</p>
        <div class="project-tags">
          <span class="project-tag">React</span>
          <span class="project-tag">Node.js</span>
          <span class="project-tag">WebSockets</span>
          <span class="project-tag">RBAC</span>
        </div>
      </div>
    `
  },
  'planet-client': {
    title: "CLIENT WORK PLANET",
    icon: "ti-businessplan",
    html: `
      <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 15px; line-height: 1.5;">
        Dedicated planet representing bespoke commercial products engineered directly for enterprise brand requirements.
      </p>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">ASH Invoice Builder</h4>
          <span class="project-badge badge-live">LIVE</span>
        </div>
        <p class="project-desc">Bespoke invoice layout engine built for Aerosky Hospitality. Rapid compilation and responsive printing architectures.</p>
        <div class="project-tags">
          <span class="project-tag">HTML/CSS</span>
          <span class="project-tag">Vanilla JS</span>
          <span class="project-tag">Netlify</span>
        </div>
        <a href="https://ashinvoice.netlify.app/" target="_blank" class="project-link">
          <i class="ti ti-external-link"></i> Launch Live Demo
        </a>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">Avnika.co — Luxury E-Commerce</h4>
          <span class="project-badge badge-ongoing">ONGOING</span>
        </div>
        <p class="project-desc">High-speed e-commerce solution built for a luxury jewellery store. Integrated secure payment gateways, cart flows, and custom UX animations.</p>
        <div class="project-tags">
          <span class="project-tag">React</span>
          <span class="project-tag">Mobile-first</span>
          <span class="project-tag">Payment API</span>
        </div>
      </div>
    `
  },
  'planet-data': {
    title: "DATA & ANALYTICS SECTOR",
    icon: "ti-chart-arcs",
    html: `
      <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 15px; line-height: 1.5;">
        Data pipelines, statistical modeling layouts, and dashboards compiled for research analytics.
      </p>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">Internsveda Analytics Engine</h4>
          <span class="project-badge badge-done">COMPLETED</span>
        </div>
        <p class="project-desc">Interactive Matplotlib visualization suites. Executed EDA on multi-dimensional corporate datasets, plotting regressions.</p>
        <div class="project-tags">
          <span class="project-tag">Python</span>
          <span class="project-tag">Pandas</span>
          <span class="project-tag">Matplotlib</span>
          <span class="project-tag">EDA</span>
        </div>
      </div>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">Deloitte Analytics Simulation</h4>
          <span class="project-badge badge-done">COMPLETED</span>
        </div>
        <p class="project-desc">Data analysis strategy simulation highlighting core business insights, dashboarding structures, and SQL queries.</p>
        <div class="project-tags">
          <span class="project-tag">Data Simulation</span>
          <span class="project-tag">SQL</span>
          <span class="project-tag">Business Intel</span>
        </div>
      </div>
    `
  },
  'moon-tools': {
    title: "TOOLS & UTILITIES MOON",
    icon: "ti-adjustments-alt",
    html: `
      <p style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 15px; line-height: 1.5;">
        A utility station featuring client-side software systems. Orbiting the Web Planet.
      </p>

      <div class="project-card">
        <div class="project-header">
          <h4 class="project-title">iGenQR — QR Code Generator</h4>
          <span class="project-badge badge-live">LIVE</span>
        </div>
        <p class="project-desc">Holographic utility tool generating immediate customized QR patterns on client side. Zero-backend Netlify load speeds.</p>
        <div class="project-tags">
          <span class="project-tag">HTML/CSS</span>
          <span class="project-tag">Vanilla JS</span>
          <span class="project-tag">Netlify</span>
        </div>
        <a href="https://igenqr.netlify.app/" target="_blank" class="project-link">
          <i class="ti ti-external-link"></i> Launch Live Demo
        </a>
      </div>

      <div class="qr-container">
        <span style="font-family: 'Orbitron'; font-size: 0.65rem; color: #00d2ff; letter-spacing: 0.05em;">LIVE COLD-START QR SYNTHESIS</span>
        <div class="qr-input-wrap">
          <input type="text" id="qr-input" value="https://igenqr.netlify.app/" placeholder="Enter target text or URL">
        </div>
        <div class="qr-canvas-holder">
          <img id="qr-image" src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://igenqr.netlify.app/&color=00d2ff&bgcolor=060614" alt="Procedural QR Code">
        </div>
      </div>
    `
  }
};

// Document Loaded Init
document.addEventListener('DOMContentLoaded', () => {
  setupLoader();
  setupUIHandlers();
});

// Mock Boot Loader Sequence
function setupLoader() {
  const bar = document.querySelector('.loader-bar');
  const log = document.getElementById('loader-log');
  const btn = document.getElementById('enter-btn');
  
  const loadingSteps = [
    { progress: 15, text: "Initializing quantum orbital matrices... DONE" },
    { progress: 38, text: "Generating 10,000 deep space particles... DONE" },
    { progress: 62, text: "Instantiating 3D Shader materials... DONE" },
    { progress: 85, text: "Loading project payload sectors... DONE" },
    { progress: 100, text: "Orbital system fully calibrated. Ready for connection." }
  ];
  
  let currentStep = 0;
  
  function runStep() {
    if (currentStep < loadingSteps.length) {
      const step = loadingSteps[currentStep];
      bar.style.width = `${step.progress}%`;
      log.innerHTML += `<br>${step.text}`;
      
      currentStep++;
      setTimeout(runStep, 600 + Math.random() * 400);
    } else {
      btn.style.display = 'inline-block';
    }
  }
  
  setTimeout(runStep, 400);
  
  btn.addEventListener('click', () => {
    // Hide loader screen
    document.getElementById('loader-screen').style.opacity = 0;
    setTimeout(() => {
      document.getElementById('loader-screen').style.display = 'none';
    }, 800);
    
    // Initialize synthesizers and start 3D engine
    initSynthesizer();
    initSpaceScene();
    
    // Default show Sun content
    window.onFocusChange('sun');
  });
}

// Hook UI Buttons to Space Actions
function setupUIHandlers() {
  // Navigation Buttons
  const navButtons = document.querySelectorAll('.nav-target');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-target');
      
      // Update UI selection highlights
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Focus Camera
      if (target === 'sun') {
        resetCameraView();
      } else {
        focusCelestialBody(target);
      }
      
      playBeepSound();
    });
  });

  // Reset Camera View Button
  const resetBtn = document.getElementById('reset-cam-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetCameraView();
      playBeepSound();
    });
  }

  // Speed Slider
  const speedSlider = document.getElementById('orbit-speed');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      setOrbitSpeed(parseFloat(e.target.value));
    });
  }

  // Copy Profile Text Utility
  const copyBtn = document.getElementById('copy-text-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const profileText = `SHASHANK TIWARI — PORTFOLIO DATA\nEmail: info.shashanktiwari@gmail.com | Phone: +91-93543 84835 | New Delhi, India\n\nEXPERIENCE:\n1. Ethara.AI - Post-Training LLM Intern (2025)\n2. INTERNSVEDA - Data Science Intern (2024)\n\nPROJECTS:\n- EduNest (SaaS)\n- Review.AI (NLP)\n- iGenQR (Utility)\n- ASH Invoice Builder (Client)\n- ANPR System (CV)\n- Queue Manager (SaaS)\n- Avnika.co (E-commerce)`;
      
      navigator.clipboard.writeText(profileText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<i class="ti ti-check"></i> COPIED!`;
        playBeepSound(600, 'triangle');
        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  // Soundscape Toggle Button
  const audioBtn = document.getElementById('audio-toggle-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (isAudioActive) {
        // Mute
        if (audioCtx) audioCtx.suspend();
        audioBtn.classList.remove('active');
        audioBtn.querySelector('i').className = 'ti ti-volume-3';
        isAudioActive = false;
      } else {
        // Unmute
        if (audioCtx) {
          audioCtx.resume();
        } else {
          initSynthesizer();
        }
        audioBtn.classList.add('active');
        audioBtn.querySelector('i').className = 'ti ti-volume';
        isAudioActive = true;
      }
      playBeepSound(400, 'sine', 0.1);
    });
  // Initialize scrollwheel storytelling hooks
  setupScrollManager();
}

// Custom Scroll Manager for warp scrolling between planets
function setupScrollManager() {
  // Wheel Scroll event listener
  window.addEventListener('wheel', (e) => {
    // If user is scrolling inside a sidebar scroll drawer, do not scroll between planets
    if (e.target.closest('.scrollable')) return;
    
    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return;
    
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) {
        // Scroll Down -> Next Planet
        if (currentSectorIndex < sectors.length - 1) {
          currentSectorIndex++;
          warpToSector(sectors[currentSectorIndex]);
          lastScrollTime = now;
        }
      } else {
        // Scroll Up -> Previous Planet
        if (currentSectorIndex > 0) {
          currentSectorIndex--;
          warpToSector(sectors[currentSectorIndex]);
          lastScrollTime = now;
        }
      }
    }
  }, { passive: true });
  
  // Swipe Gestures for Touch Screens / Mobile
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.target.closest('.scrollable')) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  window.addEventListener('touchend', (e) => {
    if (e.target.closest('.scrollable')) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchEndY;
    
    const now = Date.now();
    if (now - lastScrollTime < scrollCooldown) return;
    
    if (Math.abs(diffY) > 50) {
      if (diffY > 0) {
        // Swipe Up -> Next (Scroll Down)
        if (currentSectorIndex < sectors.length - 1) {
          currentSectorIndex++;
          warpToSector(sectors[currentSectorIndex]);
          lastScrollTime = now;
        }
      } else {
        // Swipe Down -> Prev (Scroll Up)
        if (currentSectorIndex > 0) {
          currentSectorIndex--;
          warpToSector(sectors[currentSectorIndex]);
          lastScrollTime = now;
        }
      }
    }
  }, { passive: true });
}

function warpToSector(targetSector) {
  // Update sidebar navigator buttons active highlight
  const navButtons = document.querySelectorAll('.nav-target');
  navButtons.forEach(btn => {
    if (btn.getAttribute('data-target') === targetSector) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Transition camera
  if (targetSector === 'sun') {
    resetCameraView();
  } else {
    focusCelestialBody(targetSector);
  }
}

// Window Event listener triggered from space.js when focusing different planets
window.onFocusChange = function(targetKey) {
  const detailsPanel = document.getElementById('panel-details');
  const detailsTitle = document.getElementById('details-title');
  const detailsIcon = document.getElementById('details-icon');
  const detailsContent = document.getElementById('details-content');
  
  // Synchronize scroll index
  const index = sectors.indexOf(targetKey);
  if (index !== -1) {
    currentSectorIndex = index;
  }
  
  // Highlight matching sidebar selector button
  const navButtons = document.querySelectorAll('.nav-target');
  navButtons.forEach(btn => {
    if (btn.getAttribute('data-target') === targetKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Render panel content
  const data = portfolioData[targetKey];
  if (data) {
    detailsTitle.textContent = data.title;
    detailsIcon.className = `ti ${data.icon}`;
    detailsContent.innerHTML = data.html;
    
    // Show details drawer
    // Show/hide drawer and toggle classes dynamically for mobile layouts
    if (targetKey === 'sun' && window.innerWidth <= 900) {
      detailsPanel.classList.add('hide');
      document.body.classList.remove('details-active');
    } else {
      detailsPanel.classList.remove('hide');
      if (targetKey !== 'sun') {
        document.body.classList.add('details-active');
      } else {
        document.body.classList.remove('details-active');
      }
    }
    
    // If targeted planet has QR generator inside (Tools moon), hook listener
    if (targetKey === 'moon-tools') {
      const qrInput = document.getElementById('qr-input');
      const qrImg = document.getElementById('qr-image');
      if (qrInput && qrImg) {
        qrInput.addEventListener('input', (e) => {
          const value = encodeURIComponent(e.target.value.trim());
          if (value) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${value}&color=00d2ff&bgcolor=060614`;
          }
        });
      }
    }
  } else {
    // Hide panel
    detailsPanel.classList.add('hide');
    document.body.classList.remove('details-active');
  }
};

// --- WEB AUDIO API COSMIC SOUNDSCAPE SYNTHESIZER ---

function initSynthesizer() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    // Create base low ambient space hum
    ambientDrone = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();
    
    ambientDrone.type = 'sawtooth';
    ambientDrone.frequency.value = 55; // Low A note
    
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    filter.Q.value = 4;
    
    gainNode.gain.value = 0.08; // Subdued, soft volume hum
    
    ambientDrone.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    ambientDrone.start();
    
    // Modulate filter frequency slowly to simulate dynamic space dust
    setInterval(() => {
      if (audioCtx.state === 'running') {
        const modFreq = 140 + Math.sin(Date.now() * 0.001) * 50;
        filter.frequency.setTargetAtTime(modFreq, audioCtx.currentTime, 0.5);
      }
    }, 100);
    
  } catch (err) {
    console.warn("Web Audio API not supported or blocked: ", err);
  }
}

// Interactive Blip Sound
function playBeepSound(frequency = 800, type = 'sine', volume = 0.15) {
  if (!audioCtx || audioCtx.state !== 'running') return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  // Linear decay
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

// Cinematic sweep warp sound when camera flies
window.playWarpSound = function() {
  if (!audioCtx || audioCtx.state !== 'running') return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(100, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 1.2);
  
  gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 1.6);
};
