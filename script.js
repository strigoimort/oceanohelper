document.addEventListener("DOMContentLoaded", function() {
   
    // ---------- SIDEBAR ---------- //
    // Declare variabel
    const menuItems = document.querySelectorAll('.menu li');
    const menuContents = document.querySelectorAll('.menu-content');

    // Execution
    menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const menuItemId = this.id;
            
            // Sembunyikan semua konten
            menuContents.forEach(function(content) {
                content.style.display = 'none';
            });
            
            // Tampilkan konten yang sesuai dengan item menu yang diklik
            document.getElementById(`${menuItemId}Content`).style.display = 'block';
        });
    });


    // ---------- WAVEROSE ---------- //
    // Declare variabel
    const waveroseForm = document.getElementById('waveroseForm');
    const waveExcelFile = document.getElementById('waveExcelFile');
    const waveErrorText = document.getElementById('waveErrorText');

    // Execution
    waveroseForm.addEventListener('submit', function(event) {

        // Mengambil data
        event.preventDefault();
        const file = waveExcelFile.files[0];
        const reader = new FileReader();
        
        // Mengolah data dalam json
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, {header: ['wave_height', 'wind_direction']});
            
            // Proses data untuk waverose
            const processedData = processDataForWaverose(jsonData);

            // Buat windrose dari data yang telah diproses
            const windroseCanvas = createWindrose(processedData);
        
            // Simpan gambar windrose sebagai file PNG
            saveWindroseAsPNG(windroseCanvas);
            
            // Lakukan sesuatu dengan data yang telah diproses untuk Waverose
            console.log(processedData);
        };
        
        // Peringatan error
        reader.onerror = function(event) {
            waveErrorText.textContent = "Error: Gagal membaca file Excel.";
            waveErrorText.style.display = 'block';
        };

        reader.readAsArrayBuffer(file);
    });

    // Functions
    // Konversi derajat
    function convertDegreeToDirection(degree) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];    
        const index = Math.round(degree / 22.5) % 16;
        return directions[index];
    }

    // Proses data
    function processDataForWaverose(jsonData) {
        const windFrequency = {};
        jsonData.forEach(function(entry) {
            const degree = entry.wind_direction;
            const direction = convertDegreeToDirection(degree);
            windFrequency[direction] = (windFrequency[direction] || 0) + 1;
        });
        return windFrequency;
    }

    // Plot windrose
    function createWindrose(windFrequency) {
        // Ambil canvas untuk menggambar windrose
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Tentukan ukuran dan posisi canvas
        canvas.width = 2400;
        canvas.height = 2400; 
    
        // Atur warna latar belakang canvas menjadi putih
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height); 
    
        // Hitung total frekuensi arah angin
        const totalFrequency = Object.values(windFrequency).reduce((acc, val) => acc + val, 0);
    
        // Atur parameter untuk menggambar windrose
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
    
        // Atur skala untuk menggambar windrose
        const scale = 3;
    
        // Tentukan warna untuk setiap arah angin
        const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'magenta'];
    
        // Mulai menggambar windrose
        let angle = -Math.PI / 2;
        Object.entries(windFrequency).forEach(([direction, frequency], index) => {
            const ratio = frequency / totalFrequency;
            const endX = centerX + Math.cos(angle) * radius * ratio * scale;
            const endY = centerY + Math.sin(angle) * radius * ratio * scale;
            
            // Gambar garis untuk mewakili frekuensi arah angin
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = colors[index % colors.length];
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Tulis label untuk arah angin
            ctx.font = '48px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(direction, endX, endY);
            
            // Perbarui sudut untuk arah angin berikutnya
            angle += Math.PI / 8;
        });
        
        // Kembalikan canvas dengan windrose yang sudah digambar
        return canvas;
    }

    // Simpan windrose
    function saveWindroseAsPNG(canvas) {
        // Buat link untuk menyimpan gambar sebagai file PNG
        const downloadLink = document.createElement('a');
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = 'windrose.png';
        
        // Klik link secara otomatis untuk memulai proses penyimpanan
        downloadLink.click();
    }
});


