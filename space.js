// Interactive 3D Space Engine powered by Three.js & GSAP

// Scene Variables
let scene, camera, renderer, controls;
let celestialBodies = {}; // Holds 3D objects for Sun, Planets, Moons
let orbits = []; // Holds orbital lines
let starfield;
let animationFrameId;

// Physics / Time variables
let orbitSpeedMultiplier = 1.0;
let time = 0;

// Dynamic Camera Target (for cinematic flights)
let isTransitioning = false;
let currentFocus = 'sun'; // Current celestial body we are focusing on

// Planet Configurations: size, orbit radius, speed, color, name
const celestialConfig = {
  sun: { name: 'sun', size: 10, color: '#ff7700', glowColor: '#ff4400' },
  'planet-ai': { name: 'planet-ai', size: 3.2, orbitRadius: 28, speed: 0.15, color: '#8833ff', ring: true },
  'planet-web': { name: 'planet-web', size: 4.0, orbitRadius: 42, speed: 0.10, color: '#00ff88' },
  'moon-tools': { name: 'moon-tools', size: 1.0, orbitRadius: 8, speed: 0.6, color: '#00d2ff', parent: 'planet-web' },
  'planet-client': { name: 'planet-client', size: 2.8, orbitRadius: 58, speed: 0.07, color: '#ff00aa', ring: true },
  'planet-data': { name: 'planet-data', size: 3.5, orbitRadius: 74, speed: 0.05, color: '#ffbb00' }
};

// Procedural Texture Generator using HTML5 Canvas
function createProceduralTexture(type, colorHex, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (type === 'sun') {
    // Glowing solar flares / noise texture
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.2, '#ffcc00');
    gradient.addColorStop(0.5, '#ff4400');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add sunspot turbulence
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'stripes') {
    // Gas giant stripes (Saturn / Jupiter style)
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, size, size);
    
    // Draw stripes
    for (let y = 0; y < size; y += Math.random() * 30 + 10) {
      ctx.fillStyle = 'rgba(0, 0, 0, ' + (Math.random() * 0.4) + ')';
      ctx.fillRect(0, y, size, Math.random() * 20 + 5);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (Math.random() * 0.15) + ')';
      ctx.fillRect(0, y + 2, size, Math.random() * 5);
    }
  } else if (type === 'marble') {
    // Marbleized clouds (Earth / Neptune style)
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, size, size);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * size);
      ctx.bezierCurveTo(size * 0.25, Math.random() * size, size * 0.75, Math.random() * size, size, Math.random() * size);
      ctx.stroke();
    }
  } else if (type === 'grid') {
    // Futuristic cyber grid (Moon style)
    ctx.fillStyle = '#040414';
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 1.5;
    
    // Grid horizontal
    for (let y = 0; y < size; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
    // Grid vertical
    for (let x = 0; x < size; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
  } else {
    // Flat texture default
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, size, size);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Initialize the 3D Space Orrery Scene
function initSpaceScene() {
  const container = document.getElementById('space-canvas');
  
  // 1. Scene & Renderer
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020208, 0.0035);
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 65, 110); // Default bird's eye cosmic view
  
  renderer = new THREE.WebGLRenderer({
    canvas: container,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // 2. OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 250;
  controls.minDistance = 8;
  
  // 3. Ambient Starfield Background removed to clear particle layers
  
  // 4. Lights
  // The Sun acts as our point light source (orbital shadows and glow)
  const sunLight = new THREE.PointLight(0xffaa66, 2.5, 300, 0.5);
  scene.add(sunLight);
  
  // Ambient lighting for back sides of planets
  const ambientLight = new THREE.AmbientLight(0x111125, 0.8);
  scene.add(ambientLight);
  
  // Directional soft blue rim light
  const rimLight = new THREE.DirectionalLight(0x0088ff, 0.6);
  rimLight.position.set(1, 1, 1);
  scene.add(rimLight);
  
  // 5. Build Celestial Orrery Bodies
  buildOrrery();
  
  // 6. Raycasting for Mouse click detection
  window.addEventListener('click', onSpaceClick);
  window.addEventListener('resize', onWindowResize);
  
  // Start Rendering
  animate();
  
  // Guided entry onboarding zoom pan
  runGuidedOnboardingSequence();
}

// Cinematic Deep Space Camera descent onboarding diving through the spiral galaxy arms
function runGuidedOnboardingSequence() {
  isTransitioning = true;
  
  // Lock controls temporarily
  controls.enabled = false;
  
  // Set initial coordinates far outside the galaxy arm
  camera.position.set(-250, 120, -220);
  controls.target.set(0, 0, 0);
  camera.lookAt(0, 0, 0);
  
  // Dynamic curved flight path: outer edge -> dipping into arm -> zooming past core -> leveling in solar system
  const tl = gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
      controls.enabled = true;
    }
  });
  
  // Animate camera position in curve steps
  tl.to(camera.position, {
    x: -80,
    y: 35,
    z: -40,
    duration: 2.2,
    ease: "power2.inOut"
  })
  .to(camera.position, {
    x: 40,
    y: 15,
    z: 50,
    duration: 1.8,
    ease: "power1.inOut"
  })
  .to(camera.position, {
    x: 0,
    y: 65,
    z: 110,
    duration: 1.8,
    ease: "power2.out"
  });
}

// Generate a beautiful, realistic double-arm Spiral Galaxy starfield with circular glowing textures
function initStarfield() {
  const particleCount = 12000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i += 3) {
    // Spiral Galaxy geometry generation parameters
    const r = Math.pow(Math.random(), 2.2) * 280; // Volumetric spread
    const arms = 2;
    const spiralFactor = 0.07;
    const theta = (i / 3) * (Math.PI * 2 / arms) + (r * spiralFactor);
    
    // Add random distribution scatter/fuzziness to form arms organically
    const randomOffset = (Math.random() - 0.5) * (20 + r * 0.12);
    const randomY = (Math.random() - 0.5) * (10 + r * 0.05); // flatter disk shape
    
    positions[i] = r * Math.cos(theta) + randomOffset;
    positions[i+1] = randomY; // disk vertical thickness
    positions[i+2] = r * Math.sin(theta) + (Math.random() - 0.5) * (20 + r * 0.12);
    
    // Visual galaxy colors: deep cyan center, purple-blue mid disk, dust orange edges
    const rand = Math.random();
    if (r < 50) {
      // Hot bright cyan/blue core
      colors[i] = 0.0;
      colors[i+1] = 0.85;
      colors[i+2] = 1.0;
    } else if (r < 150) {
      // Purple / Violet arms
      colors[i] = 0.65 + Math.random() * 0.25;
      colors[i+1] = 0.35 + Math.random() * 0.25;
      colors[i+2] = 1.0;
    } else {
      // Warm cosmic dust edges (orange/cyan mix)
      if (rand < 0.5) {
        colors[i] = 0.1;
        colors[i+1] = 0.7;
        colors[i+2] = 1.0;
      } else {
        colors[i] = 1.0;
        colors[i+1] = 0.5;
        colors[i+2] = 0.2;
      }
    }
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // Create a high-fidelity glowing radial star texture canvas dynamically (No white center)
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(0, 210, 255, 1)');
  grad.addColorStop(0.3, 'rgba(0, 150, 255, 0.7)');
  grad.addColorStop(0.7, 'rgba(136, 51, 255, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const texture = new THREE.CanvasTexture(canvas);
  
  const starMaterial = new THREE.PointsMaterial({
    size: 1.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    map: texture,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
  });
  
  starfield = new THREE.Points(geometry, starMaterial);
  scene.add(starfield);
}

// Build Sun, Planets, Moons & Orbit Paths
function buildOrrery() {
  const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
  
  // --- THE SUN (Core Identity) ---
  const sunConfig = celestialConfig['sun'];
  const sunTex = createProceduralTexture('sun');
  // Emissive sun material so it glows independently of external lights
  const sunMat = new THREE.MeshBasicMaterial({
    map: sunTex
  });
  const sunMesh = new THREE.Mesh(sphereGeo, sunMat);
  sunMesh.scale.setScalar(sunConfig.size);
  scene.add(sunMesh);
  celestialBodies['sun'] = sunMesh;
  
  // Glowing outer atmosphere shell (blending)
  const sunGlowGeo = new THREE.SphereGeometry(1.15, 32, 32);
  const sunGlowMat = new THREE.MeshBasicMaterial({
    color: sunConfig.glowColor,
    transparent: true,
    opacity: 0.25,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
  sunMesh.add(sunGlow);
  
  // --- THE PLANETS & MOONS ---
  Object.keys(celestialConfig).forEach(key => {
    if (key === 'sun') return;
    
    const config = celestialConfig[key];
    let texture;
    
    // Choose texture type based on planet personality
    if (key === 'planet-ai') texture = createProceduralTexture('stripes', config.color);
    else if (key === 'planet-web') texture = createProceduralTexture('marble', config.color);
    else if (key === 'planet-client') texture = createProceduralTexture('stripes', config.color);
    else if (key === 'planet-data') texture = createProceduralTexture('marble', config.color);
    else if (key === 'moon-tools') texture = createProceduralTexture('grid', config.color);
    
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
      bumpScale: 0.05
    });
    
    const mesh = new THREE.Mesh(sphereGeo, mat);
    mesh.scale.setScalar(config.size);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Web Planet clouds layer overlay
    if (key === 'planet-web') {
      const cloudGeo = new THREE.SphereGeometry(1.05, 32, 32);
      const cloudTex = createProceduralTexture('marble', '#ffffff');
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.35,
        blending: THREE.NormalBlending
      });
      const clouds = new THREE.Mesh(cloudGeo, cloudMat);
      mesh.add(clouds);
      mesh.clouds = clouds;
    }
    
    // Store reference
    celestialBodies[key] = mesh;
    
    // If it's a sub-orbital moon (e.g. Tools Moon orbiting Web Planet)
    if (config.parent) {
      // Add directly as child to the parent planet to inherit coordinate orbits
      celestialBodies[config.parent].add(mesh);
    } else {
      // Planet orbiting the Sun
      scene.add(mesh);
      
      // Create a visual Orbit path circle line
      const orbitGeo = new THREE.RingGeometry(config.orbitRadius - 0.1, config.orbitRadius + 0.1, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: config.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2; // Flat on plane
      scene.add(orbitRing);
      orbits.push(orbitRing);
      
      // If planet has rings (like Saturn / AI / Client planet)
      if (config.ring) {
        const ringGeo = new THREE.RingGeometry(1.4, 2.3, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          color: config.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
          blending: THREE.AdditiveBlending
        });
        const planetRing = new THREE.Mesh(ringGeo, ringMat);
        planetRing.rotation.x = Math.PI / 2.3;
        mesh.add(planetRing);
      }
    }
  });
}

// Raycasting click handler on space canvas
function onSpaceClick(event) {
  // Ignore clicks if clicking HUD panels/elements directly
  if (event.target.closest('#hud-container') || event.target.closest('#loader-screen') || event.target.closest('#audio-toggle-btn')) {
    return;
  }
  
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  // Test intersection against all active celestial bodies
  const targets = Object.values(celestialBodies);
  const intersects = raycaster.intersectObjects(targets, true);
  
  if (intersects.length > 0) {
    // Find matching configuration key
    const hitObject = intersects[0].object;
    
    // Traverse parent objects to find if it belongs to one of our mapped keys
    let foundKey = null;
    Object.keys(celestialBodies).forEach(key => {
      if (celestialBodies[key] === hitObject || celestialBodies[key] === hitObject.parent) {
        foundKey = key;
      }
    });
    
    if (foundKey) {
      focusCelestialBody(foundKey);
    }
  }
}

// Trigger smooth GSAP camera translation to focus on a planet/sun
function focusCelestialBody(targetKey) {
  if (isTransitioning) return;
  
  const body = celestialBodies[targetKey];
  if (!body) return;
  
  isTransitioning = true;
  currentFocus = targetKey;
  
  // Trigger event notification for app.js UI
  if (window.onFocusChange) {
    window.onFocusChange(targetKey);
  }
  
  // Determine zoom distance based on scale size (closer orbit entry feel)
  const config = celestialConfig[targetKey];
  const targetOffsetDistance = config.size * 2.4;
  
  // Animate controls target position to the planet center coordinates
  const worldPos = new THREE.Vector3();
  body.getWorldPosition(worldPos);
  
  // Custom camera look direction
  const targetCamPos = new THREE.Vector3(
    worldPos.x + targetOffsetDistance * 0.8,
    worldPos.y + targetOffsetDistance * 0.4,
    worldPos.z + targetOffsetDistance * 0.8
  );
  
  // Trigger synthesised telemetry sweep sound & screen glitch
  if (window.playWarpSound) window.playWarpSound();
  
  // Warp FOV camera zoom effect
  gsap.to(camera, {
    fov: 82,
    duration: 0.7,
    ease: 'power2.in',
    onUpdate: () => camera.updateProjectionMatrix(),
    onComplete: () => {
      gsap.to(camera, {
        fov: 60,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix()
      });
    }
  });

  // Use GSAP for cinematic flight
  gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
    }
  })
  .to(controls.target, {
    x: worldPos.x,
    y: worldPos.y,
    z: worldPos.z,
    duration: 1.8,
    ease: 'power3.inOut'
  }, 0)
  .to(camera.position, {
    x: targetCamPos.x,
    y: targetCamPos.y,
    z: targetCamPos.z,
    duration: 1.8,
    ease: 'power3.inOut'
  }, 0);
}

// Warp back to general bird's eye cosmic view
function resetCameraView() {
  if (isTransitioning) return;
  
  isTransitioning = true;
  currentFocus = 'sun';
  
  if (window.onFocusChange) {
    window.onFocusChange('sun');
  }
  
  if (window.playWarpSound) window.playWarpSound();
  
  // Warp FOV camera zoom effect
  gsap.to(camera, {
    fov: 82,
    duration: 0.6,
    ease: 'power2.in',
    onUpdate: () => camera.updateProjectionMatrix(),
    onComplete: () => {
      gsap.to(camera, {
        fov: 60,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix()
      });
    }
  });

  gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
    }
  })
  .to(controls.target, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 0)
  .to(camera.position, {
    x: 0,
    y: 65,
    z: 110,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 0);
}

// Main physics animation render loop
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  // 1. Update orbital motions of celestial bodies
  time += 0.005 * orbitSpeedMultiplier;
  
  Object.keys(celestialConfig).forEach(key => {
    const config = celestialConfig[key];
    const mesh = celestialBodies[key];
    
    if (key === 'sun') {
      // The Sun slowly spins on its axis
      mesh.rotation.y += 0.003;
      return;
    }
    
    // Rotate celestial bodies on their own spin axis
    mesh.rotation.y += 0.015;
    
    // Rotate cloud layer if exists
    if (mesh.clouds) {
      mesh.clouds.rotation.y -= 0.022;
    }
    
    if (config.parent) {
      // Sub-orbit (Moon orbits Parent Planet)
      const orbitAngle = time * config.speed;
      const x = Math.cos(orbitAngle) * config.orbitRadius;
      const z = Math.sin(orbitAngle) * config.orbitRadius;
      mesh.position.set(x, 0, z);
    } else {
      // Main Orbit (Planets orbit Sun)
      const orbitAngle = time * config.speed;
      const x = Math.cos(orbitAngle) * config.orbitRadius;
      const z = Math.sin(orbitAngle) * config.orbitRadius;
      mesh.position.set(x, 0, z);
    }
  });
  
  // 2. Track targeted focus positions dynamically iffocused
  if (!isTransitioning && currentFocus !== 'sun') {
    const focusedBody = celestialBodies[currentFocus];
    if (focusedBody) {
      const worldPos = new THREE.Vector3();
      focusedBody.getWorldPosition(worldPos);
      
      // Smoothly stick the camera tracking center to the moving planet
      controls.target.copy(worldPos);
    }
  }
  
  // 3. Update starfield (cosmic drift)
  if (starfield) {
    starfield.rotation.y += 0.0002;
  }
  
  // 4. Update Controls & Telemetry HUD details
  controls.update();
  updateTelemetryHUD();
  
  renderer.render(scene, camera);
}

// Handle window resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update coordinates HUD panel dynamically
function updateTelemetryHUD() {
  const coordElement = document.getElementById('camera-coords');
  if (coordElement) {
    coordElement.textContent = `X: ${camera.position.x.toFixed(2)} Y: ${camera.position.y.toFixed(2)} Z: ${camera.position.z.toFixed(2)}`;
  }
}

// Set speed slider trigger
function setOrbitSpeed(multiplier) {
  orbitSpeedMultiplier = multiplier;
}
