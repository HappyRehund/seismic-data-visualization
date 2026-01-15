//================================
// untuk well
//================================

// === UPDATE 4: FUNGSI WELL PIPE ===
function createWellPipe(wellname, inline, crossline, timeStart, timeEnd, radiuswell = 20, color = 0xFFFF00) {

  // 1. Koordinat Horizontal (X & Z)
  // Pastikan normalisasi menggunakan (val - 1) / (max - 1)
  const x = ((inline - 1) / (inlineCount - 1)) * imageWidth;
  const z = ((crossline - 1) / (crosslineCount - 1)) * imageWidth;

  // 2. Fungsi mapping Y (Konsisten dengan Horizon/Fault)
  // Time 0 -> Y 1600 (Y_BOTTOM)
  // Time Max -> Y 200 (Y_TOP)
  // Karena struktur data seismik biasanya: Time kecil di atas, Time besar di bawah.
  // Tapi di Three.js Y+ itu ke atas. Jadi kita balik.
  function mapTimeToY(time) {
     // Rumus linear: y = m*x + c
     // Jika Time=0 -> Y=1600 (Top of model but "shallow" time)
     // Jika Time=1400 -> Y=200 (Bottom of model)
     //0-point.z+timeSize+200
     let a = time-200;
     return a;
  }



  // 3. Koordinat Vertikal (Y)
  const yTop3D = mapTimeToY(timeStart);    // Posisi Atas Pipa
  const yBottom3D = mapTimeToY(timeEnd);   // Posisi Bawah Pipa

  // 4. Hitung Tinggi & Pusat
  const height = Math.abs(((yTop3D - yBottom3D)/timeSize)*imageHeight);
  const centerY = (yTop3D + yBottom3D) / 2;

  // 5. Buat Mesh
  const wellGeometry = new THREE.CylinderGeometry(radiuswell, radiuswell, height, 32);
  // Gunakan MeshPhongMaterial agar well terlihat seperti pipa 3D (kena cahaya)
  const wellMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 100 });
  const wellPipe = new THREE.Mesh(wellGeometry, wellMaterial);

  // 6. Set Posisi
  wellPipe.position.set(x, -centerY/timeSize*imageHeight+timeSize, z);
  //console.log("well coor", timeEnd,"(",yTop3D,yBottom3D,")---",height,"====", centerY);
  scene.add(wellPipe);

  // 7. Label
  const label = createTextLabel(wellname);
  // Taruh label sedikit di atas well head
  label.position.set(x, yTop3D + 100, z);
  scene.add(label);
}

function loadCSVwell(path) {
	let delimiter=";";
    fetch(path)
        .then(res => res.text())
        .then(data => {
			//console.log("loaded:"+path);
            let rows = data.split("\n").map(r => r.trim()).filter(r => r.length > 1);
            let header = rows[0].split(delimiter);

            let inlineIdx = header.indexOf("Inline_n");
            let crossIdx  = header.indexOf("Crossline_n");
            let nameIdx   = header.indexOf("Well_name");

			//console.log("loaded:",rows.length);
			//console.log("header:",header);

			//console.log("header:",header);
			//console.log("a:",inlineIdx,crossIdx,nameIdx);

            for (let i = 1; i < rows.length; i++) {
                let cols = rows[i].split(delimiter);

                let inline_n = parseFloat(cols[inlineIdx]);
                let crossline_n = parseFloat(cols[crossIdx]);
                let wellname = cols[nameIdx];

                if (!isNaN(inline_n) && !isNaN(crossline_n)) {
                    //console.log("Plotting:", wellname, inline_n, crossline_n);

                    createWellPipe(wellname,inline_n, crossline_n, 0, 1200, 10, 0xFFFF00);
                }
            }
			console.log("Well ploted");
        });
}

//test
//createWellPipe("novantio",100, 100, 0, 1600, 10, 0xFFFF00);
//createWellPipe("novantio",100, 200, 0, 1200, 10, 0xFFFF00);
//createWellPipe("novantio",100, 300, 0, 1300, 10, 0xFFFF00);
//createWellPipe("novantio",200, 300, 0, 800, 10, 0xFFFF00);