# Stress Level Assessment (Streamlit)

Versi Python dari website React asli. Instrumen: PSS-10, GAD-7, PHQ-9.

## Jalankan lokal
    pip install -r requirements.txt
    streamlit run app.py

## Deploy ke Streamlit Community Cloud
1. Push folder ini ke GitHub (file `data.db` sudah di-ignore).
2. Buka share.streamlit.io, pilih repo, main file: `app.py`.

Catatan: SQLite di Community Cloud bersifat sementara. Data bisa hilang saat app
restart atau redeploy. Untuk data permanen, ganti `db.py` ke Postgres
(Neon, Supabase) dan simpan connection string di `st.secrets`.

## Struktur
- app.py      : UI dan alur halaman
- scoring.py  : pertanyaan dan logika skor
- db.py       : SQLite, hashing password, riwayat hasil
