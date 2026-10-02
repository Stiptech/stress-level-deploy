import datetime as dt

import streamlit as st

import db
import scoring as sc

st.set_page_config(page_title="Stress Level Assessment", page_icon="🧠", layout="centered")
db.init_db()

GENDERS = {"male": "Laki-laki", "female": "Perempuan", "other": "Lainnya"}
SEV_COLOR = {"SEVERE": "#dc2626", "MODERATE": "#ca8a04", "LIGHT": "#2563eb", "NONE": "#16a34a"}

st.markdown(
    """
    <style>
    .block-container {max-width: 860px; padding-top: 5rem;}
    .brand {display:flex; align-items:center; gap:12px; font-size:1.25rem; font-weight:600;}
    .logo {width:40px; height:40px; border-radius:10px; display:flex; align-items:center;
           justify-content:center; background:linear-gradient(135deg,#3b82f6,#9333ea);}
    .card {background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:20px; text-align:center;}
    .feat {min-height:230px;}
    .card h4 {margin:0 0 4px 0;}
    .score {font-size:2rem; font-weight:600;}
    .pill {display:inline-block; padding:4px 14px; border-radius:999px; background:#f3e8ff;
           color:#7e22ce; font-size:.9rem;}
    .q {font-size:1.15rem; text-align:center; margin:18px 0 10px 0;}
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------- state
ss = st.session_state
ss.setdefault("page", "landing")
ss.setdefault("user", None)
ss.setdefault("answers", [None] * sc.TOTAL)
ss.setdefault("q", 0)
ss.setdefault("result_saved", False)
ss.setdefault("auth_mode", "login")


def go(page: str):
    ss.page = page


def logout():
    ss.user = None
    ss.page = "landing"


def start_test():
    ss.answers = [None] * sc.TOTAL
    ss.q = 0
    ss.result_saved = False
    ss.page = "questions"


# ---------------------------------------------------------------- header
def header(show_user: bool = True):
    c1, c2 = st.columns([3, 2], vertical_alignment="center")
    c1.markdown('<div class="brand"><div class="logo">🧠</div>Stress Level Assessment</div>',
                unsafe_allow_html=True)
    if not show_user:
        return
    with c2:
        u = ss.user
        if u:
            a, b, c = st.columns([1, 3, 3], vertical_alignment="center")
            if u.get("photo"):
                a.image(u["photo"], width=38)
            b.button(u["name"].split()[0] if u["name"] else "Profil", key="hdr_prof",
                     on_click=go, args=("profile",), use_container_width=True)
            c.button("Keluar", key="hdr_out", on_click=logout, use_container_width=True)
        else:
            st.button("Masuk", key="hdr_login", type="primary",
                      on_click=go, args=("auth",), use_container_width=True)
    st.divider()


# ---------------------------------------------------------------- landing
def page_landing():
    header()
    st.markdown("<h1 style='text-align:center'>Tes Tingkat Stress Mahasiswa Baru</h1>",
                unsafe_allow_html=True)
    st.markdown(
        "<p style='text-align:center;color:#4b5563'>Evaluasi tingkat stress Anda sebagai mahasiswa baru "
        "dan dapatkan pemahaman yang lebih baik tentang kesehatan mental Anda</p>",
        unsafe_allow_html=True,
    )
    cols = st.columns(3)
    items = [
        ("PSS-10, GAD-7, PHQ-9", "Instrumen Standar",
         "Menggunakan instrumen psikometri yang telah tervalidasi secara klinis"),
        ("26 PERTANYAAN", "Analisis Komprehensif",
         "Evaluasi menyeluruh untuk stress, anxiety, dan depression"),
        ("HASIL DETAIL", "Rekomendasi Personal",
         "Dapatkan insight dan rekomendasi berdasarkan hasil Anda"),
    ]
    for col, (tag, title, body) in zip(cols, items):
        col.markdown(
            f'<div class="card feat"><span class="pill">{tag}</span><h4 style="margin-top:12px">{title}</h4>'
            f'<p style="color:#6b7280;font-size:.9rem">{body}</p></div>',
            unsafe_allow_html=True,
        )
    st.write("")
    _, mid, _ = st.columns([1, 2, 1])
    mid.button("Mulai Tes Sekarang", type="primary", use_container_width=True, on_click=start_test)
    if not ss.user:
        mid.caption("Kamu bisa mulai tanpa login. Login kalau mau hasilnya tersimpan.")
        mid.button("Login untuk menyimpan hasil", type="tertiary", on_click=go, args=("auth",))


# ---------------------------------------------------------------- auth
def page_auth():
    header(show_user=False)
    st.button("← Kembali", on_click=go, args=("landing",), type="tertiary")
    login_mode = ss.auth_mode == "login"
    st.subheader("Masuk ke akun Anda" if login_mode else "Buat akun baru")

    with st.form("auth_form"):
        name = "" if login_mode else st.text_input("Nama Lengkap", placeholder="Masukkan nama lengkap")
        email = st.text_input("Email", placeholder="email@example.com")
        pw = st.text_input("Password", type="password")
        ok = st.form_submit_button("Masuk" if login_mode else "Daftar", type="primary",
                                   use_container_width=True)

    if ok:
        if not email or not pw:
            st.error("Email dan password harus diisi")
        elif not login_mode and not name.strip():
            st.error("Nama harus diisi")
        elif login_mode:
            user = db.login(email, pw)
            if user:
                ss.user, ss.page = user, "landing"
                st.rerun()
            else:
                st.error("Email atau password salah")
        else:
            if len(pw) < 6:
                st.error("Password minimal 6 karakter")
            else:
                user, err = db.register(email, pw, name)
                if err:
                    st.error(err)
                else:
                    ss.user, ss.page = user, "profile"  # lengkapi profil dulu
                    st.rerun()

    def toggle():
        ss.auth_mode = "register" if login_mode else "login"

    st.button("Belum punya akun? Daftar" if login_mode else "Sudah punya akun? Masuk",
              on_click=toggle, type="tertiary")


# ---------------------------------------------------------------- profile
def page_profile():
    if not ss.user:
        ss.page = "auth"
        st.rerun()
    header()
    u = ss.user
    st.subheader("Profil Saya")
    st.caption("Lengkapi profil Anda untuk melanjutkan")

    with st.form("profile_form"):
        photo = st.file_uploader("Foto profil", type=["png", "jpg", "jpeg", "webp"])
        if u.get("photo") and not photo:
            st.image(u["photo"], width=96)
        name = st.text_input("Nama Lengkap *", value=u.get("name") or "")
        sid = st.text_input("NIM *", value=u.get("student_id") or "")
        c1, c2 = st.columns(2)
        age = c1.number_input("Usia *", min_value=0, max_value=120, value=int(u.get("age") or 0))
        keys = list(GENDERS)
        gender = c2.selectbox("Gender *", keys, format_func=GENDERS.get,
                              index=keys.index(u.get("gender") or "male"))
        uni = st.text_input("Universitas *", value=u.get("university") or "")
        dept = st.text_input("Program Studi *", value=u.get("department") or "")
        saved = st.form_submit_button("Simpan Profil", type="primary", use_container_width=True)

    if saved:
        if not (name.strip() and sid.strip() and age > 0 and uni.strip() and dept.strip()):
            st.error("Semua kolom bertanda * wajib diisi")
        else:
            fields = dict(name=name.strip(), student_id=sid.strip(), age=int(age),
                          gender=gender, university=uni.strip(), department=dept.strip())
            if photo:
                fields["photo"] = photo.getvalue()
            db.update_profile(u["id"], **fields)
            ss.user = db.get_user(u["id"])
            ss.page = "landing"
            st.rerun()

    hist = db.get_history(u["id"])
    if hist:
        st.divider()
        st.subheader("Riwayat Tes")
        st.dataframe(
            [{"Tanggal": h["created_at"], "PSS-10": h["pss"], "GAD-7": h["gad"], "PHQ-9": h["phq"],
              "Domain Utama": h["primary_domain"], "Severity": h["primary_severity"]} for h in hist],
            use_container_width=True, hide_index=True,
        )
    st.button("← Kembali ke beranda", on_click=go, args=("landing",), type="tertiary")


# ---------------------------------------------------------------- questions
def _save_and_next(i: int):
    val = ss.get(f"q_{i}")
    if val is None:
        return
    ss.answers[i] = val
    if i < sc.TOTAL - 1:
        ss.q = i + 1
    else:
        ss.page = "results"


def _back():
    ss.q = max(0, ss.q - 1)


def page_questions():
    header()
    i = ss.q
    info = sc.section_for(i)
    st.progress((i + 1) / sc.TOTAL, text=f"Pertanyaan {i + 1} dari {sc.TOTAL}")

    st.markdown(
        f'<div style="text-align:center"><span class="pill">{info["section"]} - Pertanyaan '
        f'{info["n"]}/{info["total"]}</span><p style="color:#6b7280;font-size:.9rem;margin-top:8px">'
        f'{info["desc"]}</p></div><div class="q">{info["question"]}</div>',
        unsafe_allow_html=True,
    )

    prev = ss.answers[i]
    choice = st.radio(
        "Pilih jawaban", options=list(range(len(info["scale"]))),
        format_func=lambda v: info["scale"][v], index=prev, key=f"q_{i}",
        label_visibility="collapsed",
    )

    left, right = st.columns(2)
    left.button("← Kembali", on_click=_back, disabled=i == 0, use_container_width=True)
    right.button("Lihat Hasil →" if i == sc.TOTAL - 1 else "Selanjutnya →",
                 on_click=_save_and_next, args=(i,), disabled=choice is None,
                 type="primary", use_container_width=True)


# ---------------------------------------------------------------- results
def _report_text(r: dict, user: dict | None) -> str:
    if user:
        who = (f"Nama: {user['name']}\nNIM: {user['student_id']}\nUsia: {user['age']}\n"
               f"Gender: {GENDERS.get(user['gender'], 'Lainnya')}\nUniversitas: {user['university']}\n"
               f"Program Studi: {user['department']}\n\n")
    else:
        who = "Pengguna: Anonim (Belum login)\n\n"
    line = "=" * 33
    return (
        f"Hasil Assessment Stress Level\n{line}\n{who}HASIL TES:\n{line}\n"
        f"PSS-10 (Stress):\n  Skor: {r['pss']}/40\n  Kategori: {r['pss_label']}\n  Severity: {r['sev']['STRESS']}\n\n"
        f"GAD-7 (Anxiety):\n  Skor: {r['gad']}/21\n  Kategori: {r['gad_label']}\n  Severity: {r['sev']['ANXIETY']}\n\n"
        f"PHQ-9 (Depression):\n  Skor: {r['phq']}/27\n  Kategori: {r['phq_label']}\n  Severity: {r['sev']['DEPRESSION']}\n\n"
        f"KESIMPULAN:\n{line}\nDomain Utama: {r['primary_name']}\nSeverity Utama: {r['primary_sev']}\n\n"
        f"Tanggal: {dt.date.today().strftime('%d/%m/%Y')}\n"
    )


def _score_card(col, title, subtitle, score, maxv, label, sev):
    col.markdown(
        f'<div class="card"><h4>{title}</h4><div style="color:#6b7280;font-size:.85rem">{subtitle}</div>'
        f'<div class="score">{score}<span style="font-size:1rem;color:#6b7280">/{maxv}</span></div>'
        f'<div style="color:#6b7280;font-size:.85rem">{label}</div>'
        f'<div style="margin-top:8px;font-weight:600;color:{SEV_COLOR[sev]}">{sev}</div></div>',
        unsafe_allow_html=True,
    )


def page_results():
    answers = ss.answers
    if any(a is None for a in answers):  # jaga-jaga kalau halaman dibuka langsung
        ss.page = "landing"
        st.rerun()
    r = sc.evaluate(answers)

    if ss.user and not ss.result_saved:
        db.save_result(ss.user["id"], r["pss"], r["gad"], r["phq"], r["primary_name"], r["primary_sev"])
        ss.result_saved = True

    header()
    st.markdown("<h2 style='text-align:center'>Hasil Assessment Anda</h2>", unsafe_allow_html=True)
    if ss.user:
        st.caption(f"{ss.user['name']} - {ss.user['student_id']}  |  hasil tersimpan di riwayat profil")
    else:
        st.caption("Mode Anonim. Login dulu kalau mau hasil tersimpan.")
        st.button("Login untuk menyimpan hasil", on_click=go, args=("auth",), type="tertiary")

    color = SEV_COLOR[r["primary_sev"]]
    st.markdown(
        f'<div class="card" style="padding:32px"><h3 style="color:{color};margin:0">'
        f'Domain Utama: {r["primary_name"]}</h3><div style="color:#4b5563">Severity: {r["primary_sev"]}</div></div>',
        unsafe_allow_html=True,
    )
    st.write("")

    c1, c2, c3 = st.columns(3)
    _score_card(c1, "PSS-10", "Perceived Stress Scale", r["pss"], 40, r["pss_label"], r["sev"]["STRESS"])
    _score_card(c2, "GAD-7", "Generalized Anxiety", r["gad"], 21, r["gad_label"], r["sev"]["ANXIETY"])
    _score_card(c3, "PHQ-9", "Depression Screening", r["phq"], 27, r["phq_label"], r["sev"]["DEPRESSION"])

    st.subheader("Rekomendasi")
    if r["self_harm_flag"]:
        st.error(
            "Kamu menjawab ada pikiran untuk menyakiti diri atau merasa lebih baik tidak ada. "
            "Itu layak dibicarakan dengan orang yang tepat secepatnya, apa pun skor totalnya. "
            "Hubungi layanan konseling kampus, tenaga profesional, atau orang yang kamu percaya. "
            "Di Indonesia ada layanan SEJIWA di nomor 119 ekstensi 8. Kalau kamu dalam bahaya "
            "sekarang, segera hubungi layanan darurat atau datangi IGD terdekat."
        )
    name = r["primary_name"].lower()
    if r["primary_sev"] == "SEVERE":
        st.error(f"⚠️ Hasil menunjukkan tingkat {name} yang tinggi. Sangat disarankan untuk segera "
                 "berkonsultasi dengan profesional kesehatan mental atau layanan konseling kampus Anda.")
    elif r["primary_sev"] == "MODERATE":
        st.warning(f"💡 Hasil menunjukkan tingkat {name} yang moderat. Pertimbangkan untuk berbicara dengan "
                   "konselor atau psikolog untuk mendapatkan strategi coping yang lebih baik.")
    st.info("📚 Manfaatkan layanan konseling dan kesehatan mental yang tersedia di kampus Anda.")
    st.success("🌱 Praktikkan self-care: tidur cukup, olahraga teratur, dan jaga pola makan sehat.")

    d1, d2 = st.columns(2)
    sid = ss.user["student_id"] if ss.user and ss.user.get("student_id") else "anonymous"
    d1.download_button("Download Hasil", data=_report_text(r, ss.user),
                       file_name=f"stress-assessment-{sid}-{int(dt.datetime.now().timestamp())}.txt",
                       mime="text/plain", use_container_width=True)
    d2.button("Ulangi Tes", type="primary", on_click=go, args=("landing",), use_container_width=True)

    st.caption(
        "**Disclaimer:** Tes ini menggunakan instrumen standar PSS-10, GAD-7, dan PHQ-9 untuk tujuan "
        "skrining awal. Hasil ini bukan diagnosis klinis dan tidak menggantikan evaluasi profesional. "
        "Jika Anda mengalami gejala yang mengganggu atau berkepanjangan, silakan berkonsultasi dengan "
        "profesional kesehatan mental yang berkualifikasi."
    )


# ---------------------------------------------------------------- router
{
    "landing": page_landing,
    "auth": page_auth,
    "profile": page_profile,
    "questions": page_questions,
    "results": page_results,
}[ss.page]()
