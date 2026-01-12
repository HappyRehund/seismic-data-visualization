// === Camera ===
camera.position.set(0, 10000, 0);
camera.lookAt(0, 0, 0);

// === Lighting & Helper ===
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

// === Bounding Box (opsional) ===
const boxGeometry = new THREE.BoxGeometry(imageWidth, imageHeight, imageWidth);
const boxEdges = new THREE.EdgesGeometry(boxGeometry);
const boxMaterial = new THREE.LineBasicMaterial({ color: 0x888888 }); // Warna lebih redup
const boxWireframe = new THREE.LineSegments(boxEdges, boxMaterial);
boxWireframe.position.set(imageWidth/2, 0, imageWidth/2);
scene.add(boxWireframe);

// === Texture Loader ===
const loader = new THREE.TextureLoader();

// === Plane Holders ===
let inlinePlane, crosslinePlane;

let minZ = Infinity, maxZ = -Infinity;

// === Buat Inline Plane ===
function createInlinePlane(texture) {
  const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
  geometry.translate(imageWidth / 2, 0, 0);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true
  });

  const plane = new THREE.Mesh(geometry, material);

  // Ditempel di sumbu Z, menghadap sumbu X (bidang Y-Z)
  plane.rotation.y = -Math.PI / 2;
  plane.position.set(0, 0, 0);
  scene.add(plane);
  return plane;
}

// === Buat Crossline Plane ===
function createCrosslinePlane(texture) {
  const geometry = new THREE.PlaneGeometry(imageWidth, imageHeight);
  geometry.translate(imageWidth / 2, 0, 0);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true
  });

  const plane = new THREE.Mesh(geometry, material);

  // Ditempel di sumbu X, menghadap sumbu Z (bidang Y-Z juga)
  plane.rotation.y = 0;
  plane.position.set(0, 0, 0);
  scene.add(plane);
  return plane;
}


// === Load Gambar Inline Pertama ===
loader.load(`/inline/inline_1.png`, (texture) => {
  inlinePlane = createInlinePlane(texture);
});

// === Load Gambar Crossline Pertama ===
loader.load(`/crossline/crossline_1.png`, (texture) => {
  crosslinePlane = createCrosslinePlane(texture);
});

// === Slider Inline ===
const inlineSlider = document.getElementById('inlineSlider');
inlineSlider.max = inlineCount - 1;
inlineSlider.value = 0;

function updateInlineTexture(index) {
  loader.load(`/inline/inline_${index + 1}.png`, (texture) => {
    texture.generateMipmaps = false;

    // Gunakan filter NEAREST (paling tajam / pixelated)
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    texture.needsUpdate = true;
    if (inlinePlane) {
      inlinePlane.material.map = texture;
      inlinePlane.material.needsUpdate = true;
    }
  });
  document.getElementById('label_inline').innerHTML=""+index;
}

inlineSlider.addEventListener('input', () => {
  const index = parseInt(inlineSlider.value);
  if (inlinePlane) {
    // Gunakan normalisasi yang sama dengan horizon
    const normX = index / (inlineCount - 1); 
    inlinePlane.position.x = normX * imageWidth;
  }
  updateInlineTexture(index);
});

// === Slider Crossline ===
const crosslineSlider = document.getElementById('crosslineSlider');
crosslineSlider.max = crosslineCount - 1;
crosslineSlider.value = 0;

function updateCrosslineTexture(index) {
  loader.load(`/crossline/crossline_${index + 1}.png`, (texture) => {
    texture.generateMipmaps = false;

    // Gunakan filter NEAREST (paling tajam / pixelated)
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    texture.needsUpdate = true;
    if (crosslinePlane) {
      crosslinePlane.material.map = texture;
      crosslinePlane.material.needsUpdate = true;
    }
  });
  document.getElementById('label_crossline').innerHTML=""+index;
}

crosslineSlider.addEventListener('input', () => {
  const index = parseInt(crosslineSlider.value);
  if (crosslinePlane) {
    // Gunakan normalisasi yang sama dengan horizon
    const normZ = index / (crosslineCount - 1);
    crosslinePlane.position.z = normZ * imageWidth; // pakai imageWidth
  }
  updateCrosslineTexture(index);
});

function createTextLabel(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const fontSize = 48;
  ctx.font = `${fontSize}px Arial`;

  // otomatis resize canvas
  const textWidth = ctx.measureText(text).width;
  canvas.width = textWidth + 20;
  canvas.height = fontSize + 20;

  // render ulang setelah resize
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(150, 50, 1);  // ukuran label di scene

  return sprite;
}

// === Kontrol Kamera Manual (Orbit) ===
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

let theta = Math.PI / 4; // sudut horizontal
let phi = Math.PI / 3;   // sudut vertikal
let radius = 4000;       // jarak dari pusat (target)

function updateCameraPosition() {
  // Center kamera ke tengah Bounding Box
  const targetX = imageWidth / 2;
  const targetY = (imageHeight / 2); // Sesuaikan dengan Y bounding box
  const targetZ = imageWidth / 2;

  const x = targetX + radius * Math.sin(phi) * Math.cos(theta);
  const y = targetY + radius * Math.cos(phi);
  const z = targetZ + radius * Math.sin(phi) * Math.sin(theta);
  
  camera.position.set(x, y, z);
  camera.lookAt(targetX, targetY-1100, targetZ);
}

updateCameraPosition();

renderer.domElement.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('mouseup', () => {
  isDragging = false;
});

renderer.domElement.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const deltaMove = {
    x: e.clientX - previousMousePosition.x,
    y: e.clientY - previousMousePosition.y,
  };

  const ROTATION_SPEED = 0.005;
  theta -= deltaMove.x * ROTATION_SPEED;
  phi -= deltaMove.y * ROTATION_SPEED;

  const EPS = 0.01;
  phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

  updateCameraPosition();

  previousMousePosition = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('wheel', (e) => {
  radius += e.deltaY * 2;
  radius = Math.max(500, Math.min(10000, radius)); // batas zoom
  updateCameraPosition();
});

// === Render Loop ===
function animate() {
  requestAnimationFrame(animate);
  
  renderer.render(scene, camera);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});