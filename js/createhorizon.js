// ==========================================
// === FUNGSI BARU UNTUK HORIZON ===
// ==========================================

async function loadHorizonData(csvUrl, zColumnName) {
  console.log(`Mulai memuat horizon: ${csvUrl}`);
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    console.log("File CSV berhasil diambil.");

    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Temukan indeks kolom yang kita perlukan
    const inlineIdx = headers.indexOf('Inline');
    const crosslineIdx = headers.indexOf('Crossline');
    const zIdx = headers.indexOf(zColumnName);

    if (inlineIdx === -1 || crosslineIdx === -1 || zIdx === -1) {
      console.error(`Error: Kolom tidak ditemukan. Perlu: 'Inline', 'Crossline', dan '${zColumnName}'. Ditemukan: ${headers}`);
      return;
    }

    let minInline = Infinity, maxInline = -Infinity;
    let minCrossline = Infinity, maxCrossline = -Infinity;
    
    
    const dataPoints = [];

    // Loop pertama: parse data dan temukan min/max
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < headers.length) continue; // lewati baris kosong/rusak

      const inline = parseFloat(values[inlineIdx]);
      const crossline = parseFloat(values[crosslineIdx]);
      const z = parseFloat(values[zIdx]);

      if (isNaN(inline) || isNaN(crossline) || isNaN(z)) continue;

      dataPoints.push({ inline, crossline, z });

      if (inline < minInline) minInline = inline;
      if (inline > maxInline) maxInline = inline;
      if (crossline < minCrossline) minCrossline = crossline;
      if (crossline > maxCrossline) maxCrossline = crossline;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    
    console.log(`Data diproses: ${dataPoints.length} titik`);
    console.log(`Z-Range (${zColumnName}): ${minZ} s/d ${maxZ}`);

    const inlineRange = maxInline - minInline;
    const crosslineRange = maxCrossline - minCrossline;
    const zRange = maxZ - minZ;
	  //console.log(`Data diproses: ${zRange} zrange`);

    const positions = [];
    const colors = [];
    const color = new THREE.Color();

    // Loop kedua: buat buffer posisi dan warna
    for (const point of dataPoints) {
      // 1. Normalisasi posisi Inline/Crossline (0 s/d 1)
      //    Kita asumsikan skala Z (crossline) sama dengan X (inline)
      //    sesuai dengan setup bounding box Anda (imageWidth di kedua sisi)
      const normInline = (point.inline - minInline) / inlineRange;
      const normCrossline = (point.crossline - minCrossline) / crosslineRange;
      
      // 2. Skalakan ke koordinat 3D
      //    PENTING: Kita memetakan 'Inline' ke sumbu X, 'Crossline' ke sumbu Z
      const x = normInline * imageWidth;
      const z = normCrossline * imageWidth; // Menggunakan imageWidth untuk Z
      const y = 0-point.z+timeSize+200 ; // Nilai Z (top/bottom) menjadi sumbu Y
      
      positions.push(x, y, z);

      // 3. Buat gradasi warna berdasarkan Z
      //    normZ = 0 (minZ/dangkal) -> Hue 0 (Merah)
      //    normZ = 1 (maxZ/dalam)   -> Hue 0.7 (Biru/Ungu)
      const normalizedZ = (point.z - minZ) / (zRange/2);
      color.setHSL(normalizedZ * 0.7, 1.0, 0.5); 
      
      colors.push(color.r, color.g, color.b);
    }

    // Buat Geometri
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Buat Material
    const material = new THREE.PointsMaterial({
        size: 2, // Ukuran titik (sesuaikan)
        vertexColors: true // Wajib untuk gradasi warna
    });

    // Buat Point Cloud
    const horizonPoints = new THREE.Points(geometry, material);
    scene.add(horizonPoints);
    console.log("Horizon berhasil ditambahkan ke scene.");
	
	horizons.push(horizonPoints);

  } catch (error) {
    console.error("Gagal memuat atau memproses horizon CSV:", error);
  }
}