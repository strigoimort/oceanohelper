document.addEventListener("DOMContentLoaded", function() {
    // Declare variabel
    const menuItems = document.querySelectorAll('.menu li');
    const menuContents = document.querySelectorAll('.menu-content');

    // Tambahkan event listener untuk setiap item menu
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

    // WAVEROSE
    // Declare variabel
    const waveroseForm = document.getElementById('waveroseForm');
    const waveExcelFile = document.getElementById('waveExcelFile');
    const waveErrorText = document.getElementById('waveErrorText');

    // Function - Input form
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

    // Function - Konversi derajat
    function convertDegreeToDirection(degree) {
        // Definisikan rentang arah angin
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        
        // Konversi derajat menjadi indeks di dalam array directions
        const index = Math.round(degree / 22.5) % 16;
        
        // Kembalikan label arah angin yang sesuai dengan indeks
        return directions[index];
    }

    // Fungsi untuk memproses data untuk waverose
    function processDataForWaverose(jsonData) {
        
        // Objek untuk menyimpan frekuensi kemunculan arah angin
        const windFrequency = {};
        
        // Iterasi melalui setiap entri data JSON
        jsonData.forEach(function(entry) {
            
            // Ambil nilai derajat arah angin dari data
            const degree = entry.wind_direction;
            
            // Konversi nilai derajat menjadi label arah angin
            const direction = convertDegreeToDirection(degree);
            
            // Tambahkan frekuensi kemunculan arah angin ke objek windFrequency
            windFrequency[direction] = (windFrequency[direction] || 0) + 1;
        });
        // Kembalikan objek yang berisi frekuensi kemunculan arah angin
        return windFrequency;
    }
});


