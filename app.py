from flask import Flask, send_from_directory
import os

app = Flask(__name__)

@app.route('/generate_waverose_plot')
def generate_waverose_plot():
    # Panggil fungsi untuk menghasilkan plot Waverose
    generate_waverose_plot()
    
    # Kembalikan URL gambar plot kepada halaman web
    return os.path.join(app.root_path, 'static', 'wave_height_wind_rose_plot.png')

if __name__ == '__main__':
    app.run(debug=True)
