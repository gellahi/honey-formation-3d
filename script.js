// Three.js Scene Setup
let scene, camera, renderer, bees = [], flowers = [], honeycomb = [], honey = [];
let currentStage = 0;
let animationPaused = false;
let animationId;

// Initialize Three.js
function init() {
    // Scene
    scene = new THREE. Scene();
    scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('three-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xFFD700, 1, 50);
    pointLight.position. set(0, 10, 0);
    scene.add(pointLight);

    // Create initial scene elements
    createFlowers();
    createBees();
    createHoneycomb();
    createHoneyBottle();

    // Start animation
    animate();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1500);
}

// Create Flowers
function createFlowers() {
    const flowerGeometry = new THREE.ConeGeometry(0.5, 0.8, 5);
    const flowerMaterial = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });

    for (let i = 0; i < 15; i++) {
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.set(
            Math.random() * 20 - 10,
            0,
            Math.random() * 20 - 10
        );
        flower.rotation.x = Math.PI;
        flower.castShadow = true;
        flowers.push(flower);
        scene.add(flower);
    }

    // Add stems
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    flowers.forEach(flower => {
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.copy(flower.position);
        stem.position.y -= 0.9;
        scene.add(stem);
    });
}

// Create Bees
function createBees() {
    for (let i = 0; i < 8; i++) {
        const bee = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bee.add(body);

        // Stripes
        const stripeGeometry = new THREE.RingGeometry(0.28, 0.32, 16);
        const stripeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe1.position.z = 0.15;
        bee.add(stripe1);

        // Wings
        const wingGeometry = new THREE.CircleGeometry(0.4, 16);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.5
        });
        const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing1.position.set(0.3, 0.2, 0);
        wing1.rotation.y = Math.PI / 4;
        bee.add(wing1);

        const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
        wing2.position.set(-0.3, 0.2, 0);
        wing2.rotation.y = -Math. PI / 4;
        bee.add(wing2);

        bee.userData = {
            wing1,
            wing2,
            speed: Math.random() * 0.02 + 0.01,
            angle: Math.random() * Math.PI * 2,
            radius: Math.random() * 5 + 5
        };

        bee.position.set(
            Math.random() * 10 - 5,
            Math.random() * 5 + 3,
            Math.random() * 10 - 5
        );

        bees.push(bee);
        scene.add(bee);
    }
}

// Create Honeycomb
function createHoneycomb() {
    const hexGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 6);
    const hexMaterial = new THREE.MeshStandardMaterial({ color: 0xF4A460 });

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 6; col++) {
            const hex = new THREE.Mesh(hexGeometry, hexMaterial);
            const offsetX = col * 0.87;
            const offsetY = row * 0.75;
            const stagger = (row % 2) * 0.435;
            
            hex.position.set(offsetX + stagger - 2, offsetY - 1, -5);
            hex.rotation.x = Math.PI / 2;
            hex.visible = false;
            honeycomb.push(hex);
            scene.add(hex);
        }
    }
}

// Create Honey Bottle
function createHoneyBottle() {
    const bottleGroup = new THREE.Group();

    // Bottle body
    const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 3, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        transparent: true,
        opacity: 0.6,
        metalness: 0.2,
        roughness: 0.3
    });
    const bottleBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bottleGroup.add(bottleBody);

    // Bottle cap
    const capGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 32);
    const capMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 1.75;
    bottleGroup.add(cap);

    bottleGroup.position.set(0, 0, -5);
    bottleGroup.visible = false;
    honey.push(bottleGroup);
    scene.add(bottleGroup);
}

// Animation Loop
function animate() {
    if (!animationPaused) {
        animationId = requestAnimationFrame(animate);

        // Animate bees
        bees. forEach(bee => {
            bee.userData.angle += bee.userData.speed;
            bee.position.x = Math.cos(bee.userData. angle) * bee.userData.radius;
            bee.position.z = Math.sin(bee.userData.angle) * bee.userData.radius;
            
            // Wing flapping
            if (bee.userData.wing1 && bee.userData.wing2) {
                bee.userData.wing1.rotation.z = Math.sin(Date.now() * 0.05) * 0.5;
                bee.userData.wing2.rotation.z = -Math.sin(Date.now() * 0.05) * 0.5;
            }
        });

        // Rotate flowers slightly
        flowers.forEach(flower => {
            flower.rotation.y += 0.001;
        });

        // Animate honeycomb cells
        honeycomb.forEach((hex, i) => {
            if (hex.visible) {
                hex.rotation.z += 0.002;
            }
        });

        renderer.render(scene, camera);
    }
}

// Stage Management
function updateStage(stage) {
    currentStage = stage;
    
    // Hide all elements first
    bees.forEach(bee => bee.visible = false);
    flowers.forEach(flower => flower.visible = false);
    honeycomb.forEach(hex => hex.visible = false);
    honey.forEach(bottle => bottle.visible = false);

    // Show elements based on stage
    switch(stage) {
        case 1:  // Bee Foraging
            bees.forEach(bee => bee.visible = true);
            flowers.forEach(flower => flower.visible = true);
            camera.position.set(0, 5, 15);
            break;
        case 2: // Honeycomb Construction
            honeycomb.forEach(hex => hex.visible = true);
            camera.position.set(0, 0, 10);
            break;
        case 3: // Nectar Processing
            honeycomb.forEach(hex => hex.visible = true);
            bees.forEach((bee, i) => {
                if (i < 3) bee.visible = true;
            });
            camera.position.set(0, 2, 8);
            break;
        case 4: // Harvesting
            honeycomb.forEach(hex => hex.visible = true);
            camera.position.set(5, 3, 10);
            break;
        case 5: // Bottling
            honey.forEach(bottle => bottle.visible = true);
            camera.position.set(0, 0, 8);
            break;
        default:
            bees.forEach(bee => bee. visible = true);
            flowers. forEach(flower => flower.visible = true);
            camera.position.set(0, 5, 15);
    }

    // Update progress bar
    const progress = (stage / 5) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

// Scroll Handler
let scrollTimeout;
window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document. documentElement.scrollHeight - window.innerHeight);
    const stage = Math.min(Math.floor(scrollPercent * 6), 5);
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        updateStage(stage);
    }, 100);
});

// Button Controls
document.getElementById('play-pause-btn').addEventListener('click', function() {
    animationPaused = !animationPaused;
    this.textContent = animationPaused ? '▶ Play' : '⏸ Pause';
    if (! animationPaused) animate();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateStage(0);
});

// Next Stage Buttons
document.querySelectorAll('.next-stage-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const sections = document.querySelectorAll('. stage-section');
        if (index < sections.length) {
            sections[index].scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window. innerHeight);
});

// Initialize on load
window.addEventListener('load', init);
