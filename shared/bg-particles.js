const container = document.getElementById('bg-3d-container');
let camera, scene, renderer;
let group, particlesData = [], positions, colors, particles, pointCloud, particlePositions, linesMesh;
const isMobile = window.innerWidth < 768;
const maxParticleCount = isMobile ? 60 : 150;
const particleCount = isMobile ? 40 : 100;
const r = isMobile ? 600 : 900;
const rHalf = r / 2;
const effectController = { minDistance: 120, limitConnections: false, maxConnections: 20 };
let mouseX = 0, mouseY = 0, windowHalfX = window.innerWidth / 2, windowHalfY = window.innerHeight / 2;

// Theme tracking variable
let currentThemeState = 'dark';

if (container) {
    init();
    animate();
}

function init() {
    scene = new THREE.Scene();
    // Initial Fog (Dark Mode Default)
    scene.fog = new THREE.FogExp2(0x0f172a, 0.0015);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.z = 1750;

    group = new THREE.Group();
    scene.add(group);

    const segments = maxParticleCount * maxParticleCount;
    positions = new Float32Array(segments * 3);
    colors = new Float32Array(segments * 3);

    // Initial Particle Material (Dark Mode Default)
    const pMaterial = new THREE.PointsMaterial({
        color: 0x818cf8,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    });

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticleCount * 3);

    for (let i = 0; i < maxParticleCount; i++) {
        const x = Math.random() * r - rHalf;
        const y = Math.random() * r - rHalf;
        const z = Math.random() * r - rHalf;

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        particlesData.push({
            velocity: new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
            numConnections: 0
        });
    }

    particles.setDrawRange(0, particleCount);
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

    pointCloud = new THREE.Points(particles, pMaterial);
    group.add(pointCloud);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.computeBoundingSphere();

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.2
    });

    linesMesh = new THREE.LineSegments(geometry, material);
    group.add(linesMesh);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(renderer.domElement);

    container.style.touchAction = 'none';
    document.body.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
    if (event.isPrimary === false) return;
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function animate() {
    if (document.hidden) {
        requestAnimationFrame(animate);
        return;
    }

    // --- THEME SWITCHING LOGIC ---
    const isLightMode = document.body.classList.contains('light-mode');
    const targetTheme = isLightMode ? 'light' : 'dark';

    if (targetTheme !== currentThemeState) {
        currentThemeState = targetTheme;

        if (isLightMode) {
            // LIGHT MODE: Clear fog, dark particles
            scene.fog.color.setHex(0xf8fafc);
            scene.fog.density = 0.0006; // Lower density so we can see particles

            pointCloud.material.color.setHex(0x4f46e5);
            pointCloud.material.blending = THREE.NormalBlending;

            linesMesh.material.opacity = 0.5;
            linesMesh.material.blending = THREE.NormalBlending;
        } else {
            // DARK MODE: Thick fog, glowing particles
            scene.fog.color.setHex(0x0f172a);
            scene.fog.density = 0.0015;

            pointCloud.material.color.setHex(0x818cf8);
            pointCloud.material.blending = THREE.AdditiveBlending;

            linesMesh.material.opacity = 0.2;
            linesMesh.material.blending = THREE.AdditiveBlending;
        }

        pointCloud.material.needsUpdate = true;
        linesMesh.material.needsUpdate = true;
    }
    // -----------------------------

    requestAnimationFrame(animate);
    render();
}

function render() {
    group.rotation.y += 0.001;
    group.rotation.x += 0.0005;

    // Gentle camera movement based on mouse
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

    for (let i = 0; i < particleCount; i++) {
        const particleData = particlesData[i];

        particlePositions[i * 3] += particleData.velocity.x;
        particlePositions[i * 3 + 1] += particleData.velocity.y;
        particlePositions[i * 3 + 2] += particleData.velocity.z;

        // Bounce off boundaries
        if (particlePositions[i * 3 + 1] < -rHalf || particlePositions[i * 3 + 1] > rHalf)
            particleData.velocity.y = -particleData.velocity.y;

        if (particlePositions[i * 3] < -rHalf || particlePositions[i * 3] > rHalf)
            particleData.velocity.x = -particleData.velocity.x;

        if (particlePositions[i * 3 + 2] < -rHalf || particlePositions[i * 3 + 2] > rHalf)
            particleData.velocity.z = -particleData.velocity.z;

        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections)
            continue;

        // Check connections
        for (let j = i + 1; j < particleCount; j++) {
            const particleDataB = particlesData[j];
            if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections)
                continue;

            const dx = particlePositions[i * 3] - particlePositions[j * 3];
            const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
            const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < effectController.minDistance) {
                particleData.numConnections++;
                particleDataB.numConnections++;

                const alpha = 1.0 - dist / effectController.minDistance;

                positions[vertexpos++] = particlePositions[i * 3];
                positions[vertexpos++] = particlePositions[i * 3 + 1];
                positions[vertexpos++] = particlePositions[i * 3 + 2];

                positions[vertexpos++] = particlePositions[j * 3];
                positions[vertexpos++] = particlePositions[j * 3 + 1];
                positions[vertexpos++] = particlePositions[j * 3 + 2];

                // Determine Line Color intensity based on alpha
                colors[colorpos++] = alpha * 0.5;
                colors[colorpos++] = alpha * 0.4;
                colors[colorpos++] = alpha * 1.0;

                colors[colorpos++] = alpha * 0.5;
                colors[colorpos++] = alpha * 0.4;
                colors[colorpos++] = alpha * 1.0;

                numConnected++;
            }
        }
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;
    pointCloud.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}
