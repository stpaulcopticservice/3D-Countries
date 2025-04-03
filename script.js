// 1. Set up the basics (unchanged)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe').appendChild(renderer.domElement);

// 2. Create the Earth (unchanged)
const earthSize = 5;
const geometry = new THREE.SphereGeometry(earthSize, 32, 32);
const texture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

// 3. Position the camera (unchanged)
camera.position.z = 15;
let targetZ = camera.position.z;

// 4. Add a flag (unchanged)
function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const fontSize = 32;
    context.font = `${fontSize}px Arial`;
    const textWidth = context.measureText(text).width;
    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;
    context.font = `${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 100, canvas.height / 100, 1);
    return sprite;
}

function addFlag(lat, lon, imagePath, description, url) {
    const flagTexture = new THREE.TextureLoader().load(imagePath);
    const flagMaterial = new THREE.SpriteMaterial({ map: flagTexture });
    const flag = new THREE.Sprite(flagMaterial);
    flag.scale.set(0.5, 0.5, 1);
    const position = latLonToVector3(lat, lon, earthSize + 0.1);
    flag.position.copy(position);
    flag.userData = { description, url };
    earth.add(flag);
    const textSprite = createTextSprite(description.split(' ').slice(-1)[0]);
    textSprite.position.copy(position);
    textSprite.position.x += 1;
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

// 5. Mouse and Touch Controls (unchanged)
let isDragging = false;
let previousMouse = { x: 0, y: 0 };
let previousTouch = { x: 0, y: 0, dist: 0 };

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMouse = { x: e.clientX, y: e.clientY };
});
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const delta = { x: e.clientX - previousMouse.x, y: e.clientY - previousMouse.y };
        earth.rotation.y += delta.x * 0.005;
        earth.rotation.x += delta.y * 0.005;
        previousMouse = { x: e.clientX, y: e.clientY };
    }
});
document.addEventListener('mouseup', () => { isDragging = false; });

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging = true;
        previousTouch.x = e.touches[0].clientX;
        previousTouch.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
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
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);
        const deltaDist = newDist - previousTouch.dist;
        targetZ -= deltaDist * 0.05;
        targetZ = Math.max(6, Math.min(30, targetZ));
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

            // Debug: Log when popup is created
            console.log('Popup created with link:', clicked.userData.url);

            // Ensure the link doesn’t trigger popup closure
            const link = popup.querySelector('.visit-link');
            link.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent popup closure
                console.log('Link clicked on desktop:', clicked.userData.url);
            });
            link.addEventListener('touchend', (e) => {
                e.stopPropagation(); // Prevent popup closure
                e.preventDefault(); // Prevent any default touch behavior
                console.log('Link tapped on mobile:', clicked.userData.url);
                // Let the native <a> tag handle navigation
            });

            console.log('Popup positioned at:', x + 10, y + 10);
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
        console.log('Popup removed via click');
    }
});

document.addEventListener('touchend', (e) => {
    if (popup && !isPopupClick && !popup.contains(e.target)) {
        popup.remove();
        popup = null;
        console.log('Popup removed via touch');
    }
});

// 7. Mouse wheel zoom (unchanged)
document.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomSpeed = 0.005;
    targetZ += e.deltaY * zoomSpeed;
    targetZ = Math.max(6, Math.min(30, targetZ));
}, { passive: false });

// 8. Galaxy Background (unchanged)
const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];
const starVelocities = [];
const starOpacities = [];
for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
    starVelocities.push((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);
    starOpacities.push(Math.random());
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 1 });
const starField = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starField);

// 9. Animation loop (unchanged)
function animate() {
    requestAnimationFrame(animate);
    const smoothingFactor = 0.1;
    camera.position.z += (targetZ - camera.position.z) * smoothingFactor;
    earth.rotation.y += 0.001;
    const positions = starsGeometry.attributes.position.array;
    const time = Date.now() * 0.01;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += starVelocities[i];
        positions[i + 1] += starVelocities[i + 1];
        positions[i + 2] += starVelocities[i + 2];
        if (Math.abs(positions[i]) > 1000) positions[i] -= Math.sign(positions[i]) * 2000;
        if (Math.abs(positions[i + 1]) > 1000) positions[i + 1] -= Math.sign(positions[i + 1]) * 2000;
        if (Math.abs(positions[i + 2]) > 1000) positions[i + 2] -= Math.sign(positions[i + 2]) * 2000;
        starOpacities[i / 3] = 0.5 + 0.5 * Math.sin(time + i);
    }
    starsGeometry.attributes.position.needsUpdate = true;
    starsMaterial.opacity = 0.5 + 0.5 * Math.sin(time * 0.1);
    renderer.render(scene, camera);
}
animate();

// 10. Fix size if window changes (unchanged)
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
