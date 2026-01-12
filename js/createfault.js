// ==========================================
// === FUNGSI BARU UNTUK FAULT ===
// ==========================================

function plotFaultSegment(inline_n_1, crossline_n_1, time1,
                          inline_n_2, crossline_n_2, time2,
                          faultName, color = 0xff0000) {

    // --- konversi koordinat ---
    const x1 = (inline_n_1 / (inlineCount - 1)) * imageWidth;
    const z1 = (crossline_n_1 / (crosslineCount - 1)) * imageWidth;
    
    // PERBAIKAN: Gunakan rumus yang sama dengan Horizon
    // Time (waktu/kedalaman) semakin besar ke bawah, Y three.js ke atas
    const y1 = -time1 + VERTICAL_OFFSET; 

    const x2 = (inline_n_2 / (inlineCount - 1)) * imageWidth;
    const z2 = (crossline_n_2 / (crosslineCount - 1)) * imageWidth;
    const y2 = -time2 + VERTICAL_OFFSET;

    // --- buat geometry line ---
    const points = [
        new THREE.Vector3(x1, y1, z1),
        new THREE.Vector3(x2, y2, z2)
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    return line;
}

function loadFaultCSV(path) {
    let delimiter = ",";
    console.log("Loading Fault (Line): " + path);
    fetch(path)
    .then(r => r.text())
    .then(text => {

        const rows = text.trim().split("\r\n"); // Atau \n tergantung OS
        const header = rows[0].split(delimiter);

        // Ambil index kolom
        const idx = col => header.indexOf(col);

        let faults = {}; 

        let faultpairIdx = idx("Fault_Stick");
        let faultNameIdx = idx("Fault_Plane");
        
        // Cek validitas kolom
        if (faultpairIdx === -1 || idx("Times") === -1) {
            console.error("Kolom Fault_Stick atau Times tidak ditemukan di " + path);
            return;
        }

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(delimiter);
            if (cols.length < header.length) continue;

            let pair = parseInt(cols[faultpairIdx]);
            let faultName = cols[faultNameIdx];

            if (!faults[pair]) faults[pair] = [];

            // PERBAIKAN: Ambil nilai Time mentah-mentah (jangan dinormalisasi min/max di sini)
            // Jika data Anda One-Way-Time tapi project Two-Way, baru dibagi 2. 
            // Tapi biasanya horizon dan fault formatnya sama.
            const rawTime = parseFloat(cols[idx("Times")]);

            faults[pair].push({
                inline_n: parseFloat(cols[idx("inline_n")]),
                crossline_n: parseFloat(cols[idx("crossline_n")]),
                time: rawTime, // Simpan waktu asli
                name: faultName
            });
        }

        // ---------- PLOT SEGMENT ----------
        Object.values(faults).forEach(seg => {
            if (seg.length !== 2) return;

            plotFaultSegment(
                seg[0].inline_n, seg[0].crossline_n, seg[0].time,
                seg[1].inline_n, seg[1].crossline_n, seg[1].time,
                seg[0].name
            );
        });

        console.log(`Plot fault ${path} selesai.`);
    });
}

//fault 3d
function faultTo3D(p) {
    // PERBAIKAN: Gunakan rumus konversi Y yang konsisten
    return new THREE.Vector3(
        (p.inline_n / (inlineCount - 1)) * imageWidth,
        -p.time + VERTICAL_OFFSET, // Rumus: -z + 1600
        (p.crossline_n / (crosslineCount - 1)) * imageWidth
    );
}

function createFaultPanel(P1A, P1B, P2A, P2B, color = 0x00ffff) {
    // Fungsi ini aman, karena logika konversi dipindah ke faultTo3D
    const A = faultTo3D(P1A);
    const B = faultTo3D(P1B);
    const C = faultTo3D(P2A);
    const D = faultTo3D(P2B);

    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
        // panel 1 (Triangle 1)
        A.x, A.y, A.z,
        B.x, B.y, B.z,
        C.x, C.y, C.z,

        // panel 2 (Triangle 2)
        B.x, B.y, B.z,
        D.x, D.y, D.z,
        C.x, C.y, C.z,
    ]);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
        shininess: 50
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    return mesh;
}

function loadFaultCSV3D(path) {
    let delimiter = ",";
    console.log("Loading Fault (3D): " + path);
    fetch(path)
    .then(r => r.text())
    .then(text => {

        const rows = text.trim().split("\r\n");
        const header = rows[0].split(delimiter);
        const idx = col => header.indexOf(col);

        let faults = {}; 

        let faultpairIdx = idx("Fault_Stick");
        let faultNameIdx = idx("Fault_Plane");
        
        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(delimiter);
            if (cols.length < header.length) continue;

            let pair = parseInt(cols[faultpairIdx]);
            let faultName = cols[faultNameIdx];

            if (!faults[pair]) faults[pair] = [];

            // PERBAIKAN: Ambil Time Murni
            const rawTime = parseFloat(cols[idx("Times")]);

            faults[pair].push({
                inline_n: parseFloat(cols[idx("inline_n")]),
                crossline_n: parseFloat(cols[idx("crossline_n")]),
                time: rawTime, 
                name: faultName
            });
        }

        // ---------- PLOT 3D SURFACE ----------
        const pairKeys = Object.keys(faults)
            .map(k => parseInt(k))
            .sort((a, b) => a - b); // Sort numerik yang benar

        // Loop antar pair yang berurutan
        for (let i = 0; i < pairKeys.length - 1; i++) {
            const p1 = faults[pairKeys[i]];
            const p2 = faults[pairKeys[i+1]];

            // Cek apakah mereka bagian dari Fault Plane yang sama (opsional tapi disarankan)
            // Jika nama fault beda, jangan disambung
            if(p1[0].name !== p2[0].name) continue;

            // Pastikan masing-masing stick punya 2 titik (atas & bawah)
            if (p1.length === 2 && p2.length === 2) {
                createFaultPanel(
                    p1[0], p1[1],  // stick 1 (titik atas, titik bawah)
                    p2[0], p2[1],  // stick 2 (titik atas, titik bawah)
                    0x00ffff       // warna surface
                );
            }
        }
        console.log("Plot fault 3D selesai: " + path);
    });
}