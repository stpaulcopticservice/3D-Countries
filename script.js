// 1. Set up the basics
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('globe').appendChild(renderer.domElement);


// 2. Create the Earth
const earthSize = 5;
const geometry = new THREE.SphereGeometry(earthSize, 32, 32);
const texture = new THREE.TextureLoader().load('pics/earth_atmos.jpg');
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
    const fontSize = 16;
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
    sprite.scale.set(0.4, 0.4, 1); // Adjust scale
    return sprite;
}

// Updated addFlag function to include country name
function addFlag(lat, lon, imagePath, description, url) {
    console.log(`Trying to load flag: ${imagePath}`);
    const flagTexture = new THREE.TextureLoader().load(imagePath);
    const flagMaterial = new THREE.SpriteMaterial({ map: flagTexture });
    const flag = new THREE.Sprite(flagMaterial);
    flag.scale.set(0.5, 0.5, 1);
    const flagPosition = latLonToVector3(lat, lon, earthSize + 0.01);
    flag.position.copy(flagPosition);
    flag.userData = { description, url };
    earth.add(flag);

    // Add country name as a text sprite
    const textSprite = createTextSprite(description.split(' ').slice(-1)[0]); // Use last word (e.g., "America" or "Brazil")
    const textPosition = latLonToVector3(lat, lon, earthSize + 0.1);
    textSprite.position.copy(textPosition);
    textSprite.position.y += 0.01; // Offset to the right of the flag
    textSprite.userData = { description, url }; // Attach the same data to text sprite
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

addFlag(-12.615024081440861, 17.702838355419715, 'pics/angola.png', 'Angola', 'https://en.wikipedia.org/wiki/angola');
addFlag(24.241168486816406, 90.21552182249683, 'pics/bangladesh.png', 'Bangladesh', 'https://en.wikipedia.org/wiki/bangladesh');

addFlag(9.6119132305124, 2.3048124740796214, 'pics/Benin.png', 'Benin', 'https://en.wikipedia.org/wiki/Benin');
addFlag(-22.175314123115026, 23.76696251134455, 'pics/Botswana.png', 'Botswana', 'https://en.wikipedia.org/wiki/Botswana');
addFlag(-3.3173404778803137, 29.90478468854099, 'pics/Burundi.png', 'Burundi', 'https://en.wikipedia.org/wiki/Burundi');
addFlag(12.722999519501395, 104.88989887659469, 'pics/Cambodia.png', 'Cambodia', 'https://en.wikipedia.org/wiki/Cambodia');
addFlag(5.7012304293807015, 12.631252553597442, 'pics/Cameroon.png', 'Cameroon', 'https://en.wikipedia.org/wiki/Cameroon');
addFlag(15.1198077916759, -23.653611743247755, 'pics/Cape Verde.webp', 'Cape-Verde', 'https://en.wikipedia.org/wiki/Cape Verde');
addFlag(6.67976455656623, 20.35119336395043, 'pics/Centrafrique.png', 'Centrafrique', 'https://en.wikipedia.org/wiki/Centrafrique');
addFlag(34.51530619105819, 103.22217194552952, 'pics/China.png', 'China', 'https://en.wikipedia.org/wiki/China');
addFlag(7.653315549601553, -5.671735475554573, 'pics/Cotedivoire.png', 'Cotedivoire', 'https://en.wikipedia.org/wiki/Cotedivoire');
addFlag(8.56793254967727, 39.58393084344826, 'pics/Ethiopia.png', 'Ethiopia', 'https://en.wikipedia.org/wiki/Ethiopia');
addFlag(-0.6151621031727836, 11.766128403104116, 'pics/Gabon.png', 'Gabon', 'https://en.wikipedia.org/wiki/Gabon');
addFlag(7.892869444147389, -1.264522361075414, 'pics/Ghana.png', 'Ghana', 'https://en.wikipedia.org/wiki/Ghana');
addFlag(22.33333792844559, 114.1683220804722, 'pics/Hong Kong.png', 'Hong-Kong', 'https://en.wikipedia.org/wiki/Hong Kong');
addFlag(22.715214876844477, 79.31127265499855, 'pics/India.png', 'India', 'https://en.wikipedia.org/wiki/India');
addFlag(-4.3725139148386125, 121.96954165444961, 'pics/Indonesia.png', 'Indonesia', 'https://en.wikipedia.org/wiki/Indonesia');
addFlag(36.4830309358992, 44.46496135873001, 'pics/Kurdistan.png', 'Kurdistan', 'https://en.wikipedia.org/wiki/Kurdistan');
addFlag(6.273570573757586, -9.314105646658396, 'pics/Liberia.png', 'Liberia', 'https://en.wikipedia.org/wiki/Liberia');
addFlag(-21.126456035770328, 46.02849517741013, 'pics/Madagascar.png', 'Madagascar', 'https://en.wikipedia.org/wiki/Madagascar');
addFlag(-13.514322216476392, 34.19173927860471, 'pics/Malawi.png', 'Malawi', 'https://en.wikipedia.org/wiki/Malawi');
addFlag(3.71626476439157, 102.01576065441607, 'pics/Malaysia.png', 'Malaysia', 'https://en.wikipedia.org/wiki/Malaysia');
addFlag(-20.29753662586105, 57.59627813068091, 'pics/Mauritius.png', 'Mauritius', 'https://en.wikipedia.org/wiki/Mauritius');
addFlag(31.822049075493815, -6.206950800137945, 'pics/Morocco.png', 'Morocco', 'https://en.wikipedia.org/wiki/Morocco');
addFlag(-22.250026925824525, 17.115713841237216, 'pics/Namibia.png', 'Namibia', 'https://en.wikipedia.org/wiki/Namibia');
addFlag(28.226878925843483, 83.94871932428602, 'pics/Nepal.png', 'Nepal', 'https://en.wikipedia.org/wiki/Nepal');
addFlag(12.489064741848605, 122.76638479402898, 'pics/Philippines.png', 'Philippines', 'https://en.wikipedia.org/wiki/Philippines');
addFlag(-2.01450710203143, 29.903916010204767, 'pics/Rwanda.png', 'Rwanda', 'https://en.wikipedia.org/wiki/Rwanda');
addFlag(-30.565676476604168, 24.505478515961514, 'pics/South Africa.png', 'South-Africa', 'https://en.wikipedia.org/wiki/South Africa');
addFlag(36.62543419022551, 127.76006031649544, 'pics/South Korea.png', 'South-Korea', 'https://en.wikipedia.org/wiki/South Korea');
addFlag(7.698868198315276, 29.900266870514184, 'pics/South Sudan​.png', 'South-Sudan', 'https://en.wikipedia.org/wiki/South Sudan');
addFlag(7.620827516982456, 80.70172071081487, 'pics/Sri lanka.png', 'Sri-lanka', 'https://en.wikipedia.org/wiki/Sri lanka');
addFlag(23.54408715108892, 120.90063025263785, 'pics/Taiwan.png', 'Taiwan', 'https://en.wikipedia.org/wiki/Taiwan');
addFlag(8.60139653812938, 1.0256395120811614, 'pics/Togo.png', 'Togo', 'https://en.wikipedia.org/wiki/Togo');
addFlag(1.4985063375534176, 32.29878519936324, 'pics/Ughanda.png', 'Ughanda', 'https://en.wikipedia.org/wiki/Ughanda');
addFlag(14.387351567683456, 108.24468242656704, 'pics/Vietnam.png', 'Vietnam', 'https://en.wikipedia.org/wiki/Vietnam');
addFlag(-19.00243296076052, 29.83805675907035, 'pics/Zimbabwe.png', 'Zimbabwe', 'https://en.wikipedia.org/wiki/Zimbabwe');


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

//***********
let isRotating = true; // Start with rotation enabled
// Add button event listeners after the existing event listeners (e.g., after the touchend listeners)
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');

playButton.addEventListener('click', () => {
    isRotating = true;
    console.log('Earth rotation started');
});
playButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent other touch events from interfering
    e.stopPropagation(); // Stop the event from bubbling up
    isRotating = true;
    console.log('Earth rotation started (mobile)');
});

stopButton.addEventListener('click', () => {
    isRotating = false;
    console.log('Earth rotation stopped');
});
stopButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Prevent other touch events from interfering
    e.stopPropagation(); // Stop the event from bubbling up
    isRotating = false;
    console.log('Earth rotation stopped (mobile)');
});


// 8. Animation loop
function animate() {
    requestAnimationFrame(animate);
    const smoothingFactor = 0.1;
    camera.position.z += (targetZ - camera.position.z) * smoothingFactor;
    
    // Auto-rotate the Earth
if (isRotating) {
        earth.rotation.y += 0.001;
    }

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
