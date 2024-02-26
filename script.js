document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll('.menu li');
    const menuContents = document.querySelectorAll('.menu-content');

    menuItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const menuItemId = this.id;
            menuContents.forEach(function(content) {
                content.style.display = 'none';
            });
            document.getElementById(`${menuItemId}Content`).style.display = 'block';
        });
    });

    const excelForm = document.getElementById('excelForm');
    const excelFile = document.getElementById('excelFile');
    const map = L.map('map').setView([0, 0], 2);
    const downloadButton = document.getElementById('downloadButton');
    const mapImage = document.getElementById('mapImage');
    const errorText = document.getElementById('errorText');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    excelForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const file = excelFile.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, {header: ['latitude', 'longitude']});
            const coordinates = jsonData.map(item => [item.latitude, item.longitude]);
            
            if (coordinates.length < 2) {
                errorText.textContent = "Error: Data Excel harus memiliki setidaknya dua titik.";
                errorText.style.display = 'block';
                return;
            }

            const polyline = L.polyline(coordinates, {color: 'blue'}).addTo(map);
            map.fitBounds(polyline.getBounds());

            const imageURL = map.getCanvas().toDataURL("image/png");
            mapImage.src = imageURL;
            downloadButton.style.display = 'block';
            mapImage.style.display = 'block';
            errorText.style.display = 'none';
        };
        
        reader.onerror = function(event) {
            errorText.textContent = "Error: Gagal membaca file Excel.";
            errorText.style.display = 'block';
        };

        reader.readAsArrayBuffer(file);
    });

    downloadButton.addEventListener('click', function() {
        const imageSource = mapImage.src.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        this.href = imageSource;
        this.download = 'tracer_map.png';
    });
});

