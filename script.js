// 1. Set up the basics
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe').appendChild(renderer.domElement);


// 2. Create the Earth
const earthSize = 5;
const geometry = new THREE.SphereGeometry(earthSize, 32, 32);
const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// 3. Position the camera
camera.position.z = 15;
let targetZ = camera.position.z;

// 4. Add a flag (example: USA)
// Helper function to create a text sprite
function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 32;
    context.font = `${fontSize}px Arial`;
    
    // Measure text width to set canvas size
    const textWidth = context.measureText(text).width;
    canvas.width = textWidth + 20; // Add padding
    canvas.height = fontSize + 20;
    
    // Redraw text on the canvas
    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture and sprite
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 100, canvas.height / 100, 1); // Adjust scale
    return sprite;
}

// Updated addFlag function to include country name
function addFlag(lat, lon, imagePath, description, url) {
    console.log(`Trying to load flag: ${imagePath}`);
    const flagTexture = new THREE.TextureLoader().load(imagePath);
    const flagMaterial = new THREE.SpriteMaterial({ map: flagTexture });
    const flag = new THREE.Sprite(flagMaterial);
    flag.scale.set(0.5, 0.5, 1);
    const position = latLonToVector3(lat, lon, earthSize + 0.1);
    flag.position.copy(position);
    flag.userData = { description, url };
    earth.add(flag);

    // Add country name as a text sprite
    const textSprite = createTextSprite(description.split(' ').slice(-1)[0]); // Use last word (e.g., "America" or "Brazil")
    textSprite.position.copy(position);
    textSprite.position.x += 1; // Offset to the right of the flag
    earth.add(textSprite);
}

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

addFlag(37.0902, -95.7129, 'https://flagcdn.com/32x24/us.png', 'United States of America', 'https://en.wikipedia.org/wiki/United_States');
addFlag(-14.2350, -51.9253, 'https://flagcdn.com/32x24/br.png', 'Brazil', 'https://en.wikipedia.org/wiki/Brazil');

// 5. Rotate the Earth with the mouse
let isDragging = false;
let previousMouse = { x: 0, y: 0 };
let previousTouch = { x: 0, y: 0, dist: 0 }; // For touch position and pinch distance

// Mouse events
document.addEventListener('mousedown', (e) => { isDragging = true; });
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const delta = { x: e.clientX - previousMouse.x, y: e.clientY - previousMouse.y };
        earth.rotation.y += delta.x * 0.005;
        earth.rotation.x += delta.y * 0.005;
    }
    previousMouse = { x: e.clientX, y: e.clientY };
});
document.addEventListener('mouseup', () => { isDragging = false; });

// Touch events
document.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    if (e.touches.length === 1) {
        isDragging = true;
        previousTouch.x = e.touches[0].clientX;
        previousTouch.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Pinch-to-zoom: calculate initial distance between two fingers
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        previousTouch.dist = Math.sqrt(dx * dx + dy * dy);
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
        const delta = {
            x: e.touches[0].clientX - previousTouch.x,
            y: e.touches[0].clientY - previousTouch.y
        };
        earth.rotation.y += delta.x * 0.005;
        earth.rotation.x += delta.y * 0.005;
        previousTouch.x = e.touches[0].clientX;
        previousTouch.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // Pinch-to-zoom: calculate new distance and adjust zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const deltaDist = newDist - previousTouch.dist;
        targetZ -= deltaDist * 0.05; // Adjust zoom speed
        targetZ = Math.max(6, Math.min(30, targetZ)); // Clamp zoom
        previousTouch.dist = newDist;
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDragging = false;
});

// 6. Click/Touch flags for popups
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let popup = null;
let isPopupClick = false;

// Function to handle popup creation
function showPopup(event, x, y) {
    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        if (clicked.userData.description) {
            if (popup) popup.remove();
            popup = document.createElement('div');
            popup.className = 'popup';
            popup.innerHTML = `${clicked.userData.description}<br><a href="${clicked.userData.url}" target="_blank" class="visit-link">Visit</a>`;
            popup.style.left = `${x + 10}px`;
            popup.style.top = `${y + 10}px`;
            document.body.appendChild(popup);
            isPopupClick = true;

            // Add click handler to the link to ensure navigation
            const link = popup.querySelector('.visit-link');
            link.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent popup closure
                window.open(clicked.userData.url, '_blank'); // Force navigation
            });

            // Add touch handler for mobile
            link.addEventListener('touchend', (e) => {
                e.stopPropagation(); // Prevent popup closure
                window.open(clicked.userData.url, '_blank'); // Force navigation
            });

            console.log('Popup created at:', x + 10, y + 10);
        } else {
            console.log('No description found on clicked object');
        }
    } else {
        console.log('No intersects detected');
    }
    setTimeout(() => { isPopupClick = false; }, 0);
}

// Mouse click for desktop
document.addEventListener('click', (e) => {
    showPopup(e, e.clientX, e.clientY);
});

// Touch end for mobile
document.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.changedTouches.length === 1 && !isDragging) {
        const touch = e.changedTouches[0];
        showPopup(e, touch.clientX, touch.clientY);
    }
}, { passive: false });

// Close popup when clicking/touching outside
document.addEventListener('click', (e) => {
    if (popup && !isPopupClick && !popup.contains(e.target)) {
        popup.remove();
        popup = null;
        console.log('Popup removed');
    }
});

document.addEventListener('touchend', (e) => {
    if (popup && !isPopupClick && !popup.contains(e.target)) {
        popup.remove();
        popup = null;
        console.log('Popup removed');
    }
});

// 7. Add zoom with mouse wheel (no smoothing yet)
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.005;
    targetZ += e.deltaY * zoomSpeed; // Update targetZ based on scroll
    targetZ = Math.max(6, Math.min(30, targetZ)); // Clamp between 6 and 30
    console.log('Zoom targetZ:', targetZ); // Debug zoom value
}, { passive: false });

// Galaxy Background
// Create a starfield background
const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
const starVelocities = []; // For smooth motion
const starOpacities = []; // For blinking

for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
    // Random small velocity for each star
    starVelocities.push(
        (Math.random() - 0.5) * 0.1, // x velocity
        (Math.random() - 0.5) * 0.1, // y velocity
        (Math.random() - 0.5) * 0.1  // z velocity
    );
    starOpacities.push(Math.random()); // Initial opacity
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 1, 
    transparent: true, // Enable transparency for blinking
    opacity: 1 // Base opacity, will be modulated
});
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// 8. Animation loop
function animate() {
    requestAnimationFrame(animate);
    const smoothingFactor = 0.1;
    camera.position.z += (targetZ - camera.position.z) * smoothingFactor;
    
    // Auto-rotate the Earth
    earth.rotation.y += 0.001;

    // Animate stars: blinking and smooth motion
    const positions = starsGeometry.attributes.position.array;
    const time = Date.now() * 0.01; // Slow time factor for blinking

    for (let i = 0; i < positions.length; i += 3) {
        // Smooth motion
        positions[i] += starVelocities[i];     // x
        positions[i + 1] += starVelocities[i + 1]; // y
        positions[i + 2] += starVelocities[i + 2]; // z

        // Wrap around if stars move too far (keeps them in view)
        if (Math.abs(positions[i]) > 1000) positions[i] -= Math.sign(positions[i]) * 2000;
        if (Math.abs(positions[i + 1]) > 1000) positions[i + 1] -= Math.sign(positions[i + 1]) * 2000;
        if (Math.abs(positions[i + 2]) > 1000) positions[i + 2] -= Math.sign(positions[i + 2]) * 2000;

        // Blinking: update opacity based on sine wave
        starOpacities[i / 3] = 0.5 + 0.5 * Math.sin(time + i); // Varies between 0 and 1
    }

    // Update star positions
    starsGeometry.attributes.position.needsUpdate = true;

    // Update star opacities (requires custom handling since PointsMaterial doesn't support per-point opacity natively)
    // For simplicity, we'll adjust the material opacity globally, but for individual blinking, you'd need a shader
    starsMaterial.opacity = 0.5 + 0.5 * Math.sin(time * 0.1); // Slower global blink as a fallback

    renderer.render(scene, camera);
}
animate();

// 9. Fix size if window changes
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
