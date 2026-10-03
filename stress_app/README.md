# Stress Level Assessment (Streamlit)

Instrumen: PSS-10, GAD-7, PHQ-9. Tanpa database dan tanpa akun, semua data hidup
hanya selama sesi browser.

## Jalankan lokal
    pip install -r requirements.txt
    streamlit run app.py

## Deploy ke Streamlit Community Cloud
Push folder ini ke GitHub, lalu di share.streamlit.io pilih repo, branch main,
main file `app.py`.

## Struktur
- app.py      : UI dan alur halaman
- scoring.py  : pertanyaan dan logika skor
